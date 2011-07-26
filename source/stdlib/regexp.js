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

var REGEXPDEBUG = false;

function RegExp (
    pattern,
    flags
)
{
    this.source = (pattern === undefined ? "" : pattern);
    this.global = false;
    this.ignoreCase = false;
    this.multiline = false;
    this.lastIndex = 0;

    // Extract flags.
    if (flags !== undefined)
    {
        for (var i = 0; i < flags.length; ++i)
        {        
            if (flags.charCodeAt(i) === 103) // 'g'
            {
                this.global = true;
            }
            else if (flags.charCodeAt(i) === 105) // 'i'
            {
                this.ignoreCase = true;
            }
            else if (flags.charCodeAt(i) === 109) // 'm'
            {
                this.multiline = true;
            }
        }
    }

    // Parse pattern and compile it to an automata.
    var ast = new RegExpParser().parse(pattern); 
    this._automata = astToAutomata(ast, this.global, this.ignoreCase, this.multiline);
}

(function ()
{
    // Get a reference to the context
    var ctx = iir.get_ctx();

    // Set the regexp prototype object in the context
    set_ctx_regexp(ctx, RegExp);
})();

RegExp.prototype.toString = function ()
{
    return this.source;
}

RegExp.prototype.exec = function (
    input
)
{
    var context = new RegExpContext(input, this._automata.captures);
    var padding = 0;
    var currentNode = this._automata.headNode;
    var nextNode = currentNode;

    do {
        currentNode = this._automata.headNode;
        context.setIndex(this.lastIndex + padding);

        while (true)
        {
            nextNode = currentNode.step(context);

            if (nextNode === null)
            {
                // Build match array if there's no next step but the current node is final.
                if (currentNode._final)
                {
                    if (this.global)
                        this.lastIndex = context.index;

                    var matches = new Array(this._automata.captures.length);

                    for (var i = 0; i < this._automata.captures.length; ++i)
                    {
                        var capture = this._automata.captures[i];

                        if (capture.start >= 0)
                            matches[i] = input.substring(capture.start, capture.end);
                        else
                            matches[i] = undefined;
                    }
                    return matches;
                }

                // Backtrack context until a backtrack succeded or backtrack stack is empty.
                do {
                    nextNode = context.getBTNode();
                } while (nextNode && !nextNode.backtrack(context));

                if (!nextNode)
                {
                    ++padding;
                    break;
                }
            }

            currentNode = nextNode;
        }
    } while (this.lastIndex + padding < input.length);

    this.lastIndex = 0;
    return null;
}

RegExp.prototype.test = function (
    input
)
{
    var context = new RegExpContext(input, this._automata.captures);
    var padding = 0;
    var currentNode = this._automata.headNode;
    var nextNode = currentNode;

    do {
        currentNode = this._automata.headNode;
        context.setIndex(this.lastIndex + padding);

        while (true)
        {
            nextNode = currentNode.step(context);

            if (nextNode === null)
            {
                if (currentNode._final)
                {
                    if (this.global)
                        this.lastIndex = context.index;
                    return true;
                }

                // Backtrack context until a backtrack succeded or backtrack stack is empty.
                do {
                    nextNode = context.getBTNode();
                } while (nextNode && !nextNode.backtrack(context));

                if (!nextNode)
                {
                    ++padding;
                    break;
                }
            }

            currentNode = nextNode;
        }
    } while (this.lastIndex + padding < input.length);

    this.lastIndex = 0;
    return null;
}

