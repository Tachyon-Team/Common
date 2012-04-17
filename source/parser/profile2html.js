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

// File: "profile2html.js"

// Copyright (c) 2012 by Marc Feeley, All Rights Reserved.

//=============================================================================

function main()
{
    var args = command_line();
    var options = { output: undefined,
                    lineno_width: undefined,
                    page_width: undefined
                  };
    var i = 0;

    while (i < args.length)
    {
        if (args[i] === "-output")
            options.output = args[++i];
        else if (args[i] === "-lineno-width")
            options.lineno_width = Number(args[++i]);
        else if (args[i] === "-page-width")
            options.page_width = Number(args[++i]);
        else
            break;
        i++;
    }

    if (i < args.length)
    {
        var filename = args[i];

        profile2html(JSON.parse(read_file(filename)), options);
    }
}

function get_input_filenames(analysis_output, options)
{
    var results = analysis_output.results;
    var input_filenames = [];
    var filenames_seen = {};

    for (var loc in results)
    {
        var x = loc_to_Location(loc);
        if (filenames_seen[x.filename] === undefined)
        {
            filenames_seen[x.filename] = true;
            input_filenames.push(x.filename);
        }
    }

    return input_filenames;
}

function get_css(analysis_output, options)
{
    var results = analysis_output.results;
    var freq_css = [];
    var counts = [];

    for (var loc in results)
    {
        var r = results[loc];

        if (r.count !== undefined)
            counts.push(r.count);
    }

    counts.sort(function (x,y) { return (x > y) ? 1 : -1; });

    var hi_freq_count = counts[Math.floor(counts.length * 0.99)];

    for (var loc in results)
    {
        var r = results[loc];

        if (r.count !== undefined && r.count > 1)
        {
            var id = string_to_id(loc);
            var x = r.count / hi_freq_count * 0.80;
            freq_css.push("#" + id + " { background-color: " + frequency_to_color(x) + " }");
        }
    }

    return freq_css.join("\n");
}

function frequency_to_color(x)
{
    var n = frequency_colors.length;
    return frequency_colors[Math.min(n-1,Math.floor(n * x))];
}

var frequency_colors = ["#dff","#aee","#9db","#4b4","#161"];

function get_js(analysis_output, options)
{
    return js_prefix + JSON.stringify(analysis_output) + js_suffix;
}

var js_prefix = "var analysis_output = "

var js_suffix = ";\n\
\n\
function tooltip_info(loc)\n\
{\n\
  var results = analysis_output.results;\n\
  var r = results[loc];\n\
\n\
  if (r === undefined)\n\
    return undefined;\n\
\n\
  var info = [];\n\
\n\
  var count = r.count;\n\
\n\
  if (count !== undefined)\n\
    info.push('count: ' + count);\n\
\n\
  if (r.absval !== undefined)\n\
  {\n\
    info.push('absval:')\n\
    r.absval.forEach(function (x)\n\
                     {\n\
                       var m = analysis_output.maps[x];\n\
                       if (m === undefined)\n\
                         info.push('&nbsp;&nbsp;' + x);\n\
                       else\n\
                         info.push('&nbsp;&nbsp;' + x + ' = ' + m);\n\
                     });\n\
  }\n\
\n\
  return info.join('<br>\\n');\n\
}\n\
";

function profile2html(analysis_output, options)
{
    var input_filenames = get_input_filenames(analysis_output, options);
    var css = get_css(analysis_output, options);
    var js = get_js(analysis_output, options);

    syntax_highlighting(input_filenames,
                        { output_filename:
                            options.output === undefined
                            ? undefined
                            : options.output,
                          lineno_width:
                            options.lineno_width === undefined
                            ? undefined
                            : options.lineno_width,
                          page_width:
                            options.page_width === undefined
                            ? undefined
                            : options.page_width,
                          full_html:
                            { css: css, js: js }
                        });
}

main();

//=============================================================================
