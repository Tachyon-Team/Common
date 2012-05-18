/* _________________________________________________________________________
 *
 *             Tachyon : A Self-Hosted JavaScript Virtual Machine
 *
 *
 *  This file is part of the Tachyon JavaScript project. Tachyon is
 *  distributed at:
 *  http://github.com/Tachyon-Team/Tachyon
 *
 *
 *  Copyright (c) 2011, Universite de Montreal
 *  All rights reserved.
 *
 *  This software is licensed under the following license (Modified BSD
 *  License):
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions are
 *  met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the name of the Universite de Montreal nor the names of its
 *      contributors may be used to endorse or promote products derived
 *      from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 *  IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 *  TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 *  PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL UNIVERSITE DE
 *  MONTREAL BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * _________________________________________________________________________
 */

//=============================================================================

// File: "misc.js", Time-stamp: <2011-03-22 14:04:55 feeley>

// Copyright (c) 2010 by Marc Feeley, All Rights Reserved.

//=============================================================================

/* support node.js as an alternative to our V8 extensions */
var node_js_mode = (typeof module !== 'undefined' && module.exports);
var fs;
if (node_js_mode) {
    fs = require('fs');
}

// Interface to D8 specific functions.

function read_file(filename)
{
    if (node_js_mode) {
        return fs.readFileSync(filename, 'utf-8');
    } else {
        return readFile(filename);
    }
}

//-----------------------------------------------------------------------------

// I/O.

var EOF = -1;

function File_input_port(filename)
{
    return new String_input_port(
        read_file(filename),
        filename
    );
}

function File_output_port(filename, init)
{
    if (node_js_mode)
    {
        function NodeJS_output_port(filename, init)
        {
            this.stream = fs.createWriteStream(filename, {flags : 'w'});

            this.empty_char_buffer = function ()
            {
                this.flush();
            };

            this.write_char = function (c)
            {
                this.stream.write(String.fromCharCode.call(null, c), 'utf-8');
            };

            this.write_string = function (str)
            {
                this.stream.write(str, 'utf-8');
            };

            this.flush = function ()
            {
                // noop - not supported in node.js
            };

            this.close = function ()
            {
                this.stream.end();
                this.stream.destroySoon();
            };

            if (init !== undefined) this.write_string(init);
        }

        return new NodeJS_output_port(filename, init);
    } else {
        var port = new String_output_port(init);
        port.filename = filename;

        port.flush = function ()
        {
            writeFile(this.filename, this.get_output_string());
        };

        port.close = function ()
        {
            // TODO: support real closing
            this.flush();
        };

        return port;
    }
}

function String_input_port(content, filename)
{
    if (filename === undefined)
        filename = '<string>';
    if (content.length > 0 && content.charCodeAt(content.length-1) !== 10) content = content + "\n";
    this.filename = filename;
    this.content = content;
    this.pos = 0;

    this.read_char = function ()
    {
        var content = this.content;
        if (this.pos < content.length)
            return content.charCodeAt(this.pos++);
        else
            return EOF;
    };
}

function String_output_port(init)
{
    this.char_buffer = [];
    this.string_buffer = [];

    // method write_char(c)

    this.empty_char_buffer = function ()
    {
        if (this.char_buffer.length > 0)
        {
            this.string_buffer.push(String.fromCharCode.apply(null, this.char_buffer));
            this.char_buffer = [];
        }
    };

    // method write_char(c)

    this.write_char = function (c)
    {
        this.char_buffer.push(c);
        if (this.char_buffer.length > 500)
            this.empty_char_buffer();
    };

    // method write_string(str)

    this.write_string = function (str)
    {
        for (var i=0; i<str.length; i++)
            this.write_char(str.charCodeAt(i));
    };

    // method get_output_string()

    this.get_output_string = function ()
    {
        this.empty_char_buffer();
        return String.prototype.concat.apply("", this.string_buffer);
    };

    if (init !== undefined) this.write_string(init);
}

//-----------------------------------------------------------------------------

function parse_src_file(filename, params)
{
    assert (
        filename !== undefined,
        'expected file name'
    );

    return parse_src_port(new File_input_port(filename), params);
}

function parse_src_str(str, params)
{
    assert (
        str !== undefined,
        'expected source string'
    );

    return parse_src_port(new String_input_port(str), params);
}

function parse_src_port(port, params)
{
    assert (
        params instanceof CompParams,
        'expected compilation parameters'
    );

    var p = new Parser(new Scanner(port), params.parserWarnings, params);
    var ast = p.parse();

    var normalized_ast = ast_normalize(ast, params.debugTrace);

    if (params.printAST)
        pp(normalized_ast);

    return normalized_ast;
}

function instrument_js(sourceCode, options) {
    if (options === undefined) options = {};
    if (options.filename === undefined)
    {
        options.filename = "<unknown>";
    }
    var port = new String_input_port(sourceCode, options.filename);
    return instrument_port(port, options);
}

function instrument_port(port, options) {
    var prog = null;

    if (options === undefined) options = {};
    if (options.transform === undefined)
    {
        options.transform = function (ast) {
            return ast_normalize(ast, options);
        };
    }
    if (options.filename === undefined)
    {
        options.filename = "<unknown>";
    }

    var s = new Scanner(port);
    var p = new Parser(s, options.warn);
    prog = p.parse();

    if (prog !== null)
    {
        var normalized_prog = options.transform(prog);
        return js_to_string(normalized_prog);
    }
}

//=============================================================================

// Node.js support
if (typeof exports !== "undefined")
{
    exports.String_input_port = String_input_port;
    exports.String_output_port = String_output_port;
    exports.File_input_port = File_input_port;
    exports.File_output_port = File_output_port;
    exports.instrument_js = instrument_js;
    exports.instrument = instrument_js;
    exports.instrument_port = instrument_port;
}
