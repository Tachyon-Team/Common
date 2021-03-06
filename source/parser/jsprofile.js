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

// File: "jsprofile.js"

// Copyright (c) 2012 by Marc Feeley, All Rights Reserved.

//=============================================================================

var geval = eval;

function eval_file(filename)
{
    var source_code = read_file(filename);

    return geval(source_code);
}

function main()
{
    var args = command_line();
    var options = { output: undefined,
                    profile: false,
                    html: false,
                    lineno_width: undefined,
                    page_width: undefined
                  };
    var input_filenames = [];
    var statements = [];
    var prog = null;
    var js2js_options = { profile: true,
                          namespace: false,
                          exports: {},
                          debug: false,
                          warn: false,
                          ast: false,
                          nojs: false,
                          simplify: true
                        };
    var i = 0;

    while (i < args.length)
    {
        if (args[i] === "-output")
            options.output = args[++i];
        else if (args[i] === "-profile")
            options.profile = true;
        else if (args[i] === "-html")
            options.html = true;
        else if (args[i] === "-lineno-width")
            options.lineno_width = Number(args[++i]);
        else if (args[i] === "-page-width")
            options.page_width = Number(args[++i]);
        else
            break;
        i++;
    }

    if (!options.profile && !options.html)
        options.html = true;

    while (i < args.length)
    {
        var filename = args[i];

        input_filenames.push(filename);

        var port = new File_input_port(filename);
        var s = new Scanner(port);
        var p = new Parser(s, js2js_options.warn);
        prog = p.parse();
        statements.push(prog.block.statements);
        i++;
    }

    if (prog !== null)
    {
        prog = new Program(prog.loc,
                           new BlockStatement(prog.loc,
                                              Array.prototype.concat.apply([], statements)));

        var normalized_prog = ast_normalize(prog, js2js_options);

        eval_file("profiler-lib.js");

        geval(js_to_string(normalized_prog));

        var analysis_output = profile$get_profile();

        if (options.profile)
        {
            var output_filename =
                  (options.output_filename === undefined)
                  ? input_filenames[input_filenames.length-1] + ".profile"
                  : options.output_filename;

            var oport = new File_output_port(output_filename);

            oport.write_string(JSON.stringify(analysis_output));

            oport.close();
        }

        if (options.html)
        {
            profile2html(analysis_output, options);
        }
    }
}

main();

//=============================================================================
