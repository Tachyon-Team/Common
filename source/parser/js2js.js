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

// File: "js2js.js"

// Copyright (c) 2010-2011 by Marc Feeley, All Rights Reserved.

//=============================================================================

function main()
{
    var args = command_line();
    var statements = [];
    var prog = null;
    var options = { profile: false,
                    namespace: false,
                    exports: {},
                    debug: false,
                    warn: false,
                    ast: false,
                    nojs: false,
                    simplify: true,
                    module: undefined
                  };
    var i = 0;

    while (i < args.length)
    {
        if (args[i] === "-profile")
            options.profile = true;
        else if (args[i] === "-namespace")
            options.namespace = args[++i];
        else if (args[i] === "-export")
            options.exports[args[++i]] = true;
        else if (args[i] === "-debug")
            options.debug = true;
        else if (args[i] === "-warn")
            options.warn = true;
        else if (args[i] === "-ast")
            options.ast = true;
        else if (args[i] === "-nojs")
            options.nojs = true;
        else if (args[i] === "-raw")
            options.simplify = false;
        else if (args[i] === "-module")
            options.module = args[++i];
        else
            break;
        i++;
    }

    while (i < args.length)
    {
        var filename = args[i];
        var port = new File_input_port(filename);
        var s = new Scanner(port);
        var p = new Parser(s, options.warn);
        prog = p.parse();
        statements.push(prog.block.statements);
        i++;
    }

    if (prog !== null)
    {
        prog = new Program(prog.loc,
                           new BlockStatement(prog.loc,
                                              Array.prototype.concat.apply([], statements)));

        var normalized_prog = options.simplify ? ast_normalize(prog, options) : prog;

        if (options.ast)
            pp(normalized_prog);

        if (!options.nojs)
            js_pp(normalized_prog);
    }
}

main();

//=============================================================================
