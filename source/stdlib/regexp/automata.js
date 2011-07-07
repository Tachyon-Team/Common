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

/***********************************************************************
    Execution context.
***********************************************************************/

function RegExpContext (
    input,
    captures
)
{
    this.input = input;
    this.index = 0;
    this.currentCharCode = input.charCodeAt(0);
    this.captures = captures;
    this.backtrackStack = [];
}

RegExpContext.prototype.consume = function ()
{
    if (REGEXPDEBUG)
        print("*** consuming " + this.input[this.index]);

    this.setIndex(++this.index);
}

RegExpContext.prototype.setIndex = function (
    index
)
{
    this.index = index;
    this.currentCharCode = this.input.charCodeAt(this.index);
}

RegExpContext.prototype.endOfInput = function ()
{
    return this.index >= this.input.length;
}

RegExpContext.prototype.getBTNode = function ()
{
    return this.backtrackStack[this.backtrackStack.length - 1];
}

RegExpContext.prototype.debugPrintCaptures = function ()
{
    for (var i = 0; i < this.captures.length; ++i)
        print("C" + i + " [" + this.captures[i].start + "," + this.captures[i].end + "]");
}

/***********************************************************************
    Group & capture stuctures.
***********************************************************************/

function RegExpCapture ()
{
    this.start = -1;
    this.end = -1;
}

function RegExpGroup (
    capture
)    
{
    this.capture = capture;
    this.subcaptures = [];
}

/**
    Save captures state into an integer array.
*/
RegExpGroup.prototype.dumpState = function ()
{
    var state;

    if (this.capture)
    {
        state = new Array(this.subcaptures.length * 2 + 2);
        state[0] = this.capture.start;
        state[1] = this.capture.end;
        for (var i = 0, j = 2; i < this.subcaptures.length; ++i, j += 2)
        {
            state[j] = this.subcaptures[i].start;
            state[j + 1] = this.subcaptures[i].end;
        }
    }
    else
    {
        state = new Array(this.subcaptures.length * 2);
        for (var i = 0, j = 0; i < this.subcaptures.length; ++i, j += 2)
        {
            state[j] = this.subcaptures[i].start;
            state[j + 1] = this.subcaptures[i].end;
        }
    }
    return state;
}

/**
    Restore captures state from an integer array.
*/
RegExpGroup.prototype.restoreState = function (
    state
)
{
    if (this.capture)
    {
        this.capture.start = state[0];
        this.capture.end = state[1];
        for (var i = 0, j = 2; i < this.subcaptures.length; ++i, j += 2)
        {
            this.subcaptures[i].start = state[j];
            this.subcaptures[i].end = state[j + 1];
        }
    }
    else
    {
        for (var i = 0, j = 0; i < this.subcaptures.length; ++i, j += 2)
        {
            this.subcaptures[i].start = state[j];
            this.subcaptures[i].end = state[j + 1];
        }
    }
}

RegExpGroup.prototype.clear = function ()
{
    if (this.capture)
    {
        this.capture.start = -1;
        this.capture.end = -1;
    }

    for (var i = 0; i < this.subcaptures.length; ++i)
        this.subcaptures[i].start = this.subcaptures[i].end = -1; 
}

/***********************************************************************
    Basic automata actions.
***********************************************************************/

function RegExpNode (
    transition
)
{
    this.transition = transition;
    this._final = false;
}

RegExpNode.prototype.step = function (
    context
)
{
    return this.transition.exec(context);
}

function RegExpTransition (
    destNode
)
{
    this.destNode = destNode;
}

RegExpTransition.prototype.exec = function (
    context
)
{
    return this.destNode;
}

/***********************************************************************
    Group automata actions.
***********************************************************************/

function RegExpGroupNode (
    group
)
{
    this.group = group;
    this.nextPath = 0;
    this.transitions = [];
    this.groupBacktrackStack = [];
    this.contextIndex = -1;
    this._final = false;
}

RegExpGroupNode.prototype.addAlternative = function (
    alternativeTransition
)
{
    this.transitions.push(alternativeTransition);
}

RegExpGroupNode.prototype.reset = function ()
{
    this.group.clear();
    this.nextPath = 0;
}

RegExpGroupNode.prototype.step = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# group node step");

    while (this.nextPath < this.transitions.length)
    {
        var next = this.transitions[this.nextPath].exec(context);
        if (next !== null)
            return next;
        ++this.nextPath;
    }

    return null;
}

RegExpGroupNode.prototype.backtrack = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# backtrack group");

    // Restore index & captures from captures stack.
    var state = this.groupBacktrackStack[this.groupBacktrackStack.length - 1];

    // Restore index
    if (!this.group.capture || this.group.capture !== context.captures[0])
    {
        context.setIndex(state[0]);
//        this.group.restoreState(state[1]);
    }
    else
    {
        context.setIndex(0);
    }

    // Set next path.
    if (++(this.nextPath) >= this.transitions.length)
    {
        if (!this.group.capture || this.group.capture !== context.captures[0])
            this.group.restoreState(state[1]);
        else
            this.group.clear();
        this.groupBacktrackStack.pop();
        context.backtrackStack.pop();
        return false;
    }

    this.group.clear();
    if (this.group.capture)
        this.group.capture.start = context.index;

    return true;
}

function RegExpGroupOpenTransition (
    destNode,
    group
)
{
    this.destNode = destNode;
    this.group = group;
}

RegExpGroupOpenTransition.prototype.exec = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# group loop open exec");

    // Save state.
    if (!this.group.capture || this.group.capture !== context.captures[0])
    {
        var state = new Array(2); 
        state[0] = context.index;
        state[1] = this.group.dumpState();

        this.destNode.groupBacktrackStack.push(state);
    }

    // Reset node path and captures.
    this.destNode.reset();

    // Set start index for this group's capture.
    if (this.group.capture)
        this.group.capture.start = context.index;

    // Push group node onto backtrack stack.
    context.backtrackStack.push(this.destNode);

    return this.destNode;
}

function RegExpGroupCloseTransition (
    destNode,
    group
)
{
    this.destNode = destNode;
    this.group = group;
}

RegExpGroupCloseTransition.prototype.exec = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# group close exec");

    if (this.group.capture)
        this.group.capture.end = context.index;

    return this.destNode;
}

/***********************************************************************
    Character match automata actions.
***********************************************************************/

function RegExpCharMatchTransition (
    destNode,
    charCode
)
{
    this.destNode = destNode;
    this.charCode = charCode;
}

RegExpCharMatchTransition.prototype.exec = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# char match exec"); 

    if (this.charCode === context.currentCharCode)
    {
        context.consume();
        return this.destNode;
    }
    return null;
}

function RegExpCharSetMatchTransition (
    destNode,
    ranges
)
{
    this.destNode = destNode;
    this.ranges = ranges;
}

RegExpCharSetMatchTransition.prototype.exec = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# char set match exec"); 

    if (context.endOfInput())
        return null;

    for (var i = 0; i < this.ranges.length; ++i)
    {
        if (context.currentCharCode >= this.ranges[i][0] &&
            context.currentCharCode <= this.ranges[i][1])
        {
            context.consume();
            return this.destNode;
        }
    }
    return null;
}

function RegExpCharExSetMatchTransition (
    destNode,
    ranges
)
{
    this.destNode = destNode;
    this.ranges = ranges;
}

RegExpCharExSetMatchTransition.prototype.exec = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# exclusive char set match exec"); 

    if (context.endOfInput())
        return null;

    for (var i = 0; i < this.ranges.length; ++i)
    {
        if (context.currentCharCode >= this.ranges[i][0] &&
            context.currentCharCode <= this.ranges[i][1])
        {
            return null;
        }
    }
    context.consume();
    return this.destNode;
}

function RegExpBackRefMatchTransition (
    destNode,
    capture
)
{
    this.destNode = destNode;
    this.capture = capture;
}

RegExpBackRefMatchTransition.prototype.exec = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# back reference exec");

    if (this.capture.start < 0)
    {
        return this.destNode;
    }

    for (var i = this.capture.start; i < this.capture.end; ++i)
    {
        if (context.endOfInput() ||
            context.currentCharCode !== context.input.charCodeAt(i))
        {
            return null;
        }
        context.consume();
    }

    return this.destNode;
}

/***********************************************************************
    Loop automata actions.
***********************************************************************/

function RegExpLoopOpenTransition (
    destNode
)
{
    this.destNode = destNode;
}

RegExpLoopOpenTransition.prototype.exec = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# loop open exec");

    this.destNode.reset();
    this.destNode.baseIndex = context.index;
    context.backtrackStack.push(this.destNode);
    return this.destNode;
}

/***********************************************************************
    Greedy character match loop automata actions.
***********************************************************************/

function RegExpCharMatchLoopNode (
    max,
    loopTransition,
    exitTransition
)
{
    this.max = max;
    this.times = 0;
    this.baseIndex = -1;
    this._final = false;

    this.loopTransition = loopTransition;
    this.exitTransition = exitTransition;

    this.nextTransition = loopTransition;
}

RegExpCharMatchLoopNode.prototype.reset = function ()
{
    this.times = 0;
    this.baseIndex = -1;

    this.nextTransition = this.loopTransition;
}

RegExpCharMatchLoopNode.prototype.step = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# char match loop node step");

    var next = this.nextTransition.exec(context);

    if (next === null &&
        this.nextTransition !== this.exitTransition)
    {
        next = this.exitTransition.exec(context);
    }
    return next;
}

RegExpCharMatchLoopNode.prototype.backtrack = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# backtrack char match loop");

    if (this.times > 0)
    {
        context.setIndex(this.baseIndex + --(this.times));
        this.nextTransition = this.exitTransition;
        return true;
    }
    context.backtrackStack.pop();
    return false;
}

function RegExpCharMatchLoopTransition (
    destNode
)
{
    this.destNode = destNode;
}

RegExpCharMatchLoopTransition.prototype.exec = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# char match loop exec");

    if (++(this.destNode.times) >= this.destNode.max &&
        this.destNode.max > 0)
    {
        this.destNode.nextTransition = this.destNode.exitTransition;
    }
    return this.destNode;
}

/***********************************************************************
    Non greedy character match loop automata actions.
***********************************************************************/

function RegExpCharMatchNonGreedyLoopNode (
    max,
    loopTransition,
    exitTransition
)
{
    this.max = max;
    this.times = 0;
    this.baseIndex = -1;
    this._final = false;

    this.loopTransition = loopTransition;
    this.exitTransition = exitTransition;

    this.nextTransition = exitTransition;
}

RegExpCharMatchNonGreedyLoopNode.prototype.reset = function ()
{
    this.times = 0;
    this.baseIndex = -1;

    this.nextTransition = this.exitTransition;
}

RegExpCharMatchNonGreedyLoopNode.prototype.step = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# non greedy char match loop node step");

    var next = this.nextTransition.exec(context);

    if (next === null && this.nextTransition !== this.loopTransition)
        next = this.loopTransition.exec(context);
    return next;
}

RegExpCharMatchNonGreedyLoopNode.prototype.backtrack = function (
    context
)
{
    if (this.times < this.max || this.max < 0)
    {
        context.setIndex(this.baseIndex + this.times);
        this.nextTransition = this.loopTransition;
        return true;
    }
    context.backtrackStack.pop();
    return false;
}

function RegExpCharMatchNonGreedyLoopTransition (
    destNode
)
{
    this.destNode = destNode;
}

RegExpCharMatchNonGreedyLoopTransition.prototype.exec = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# char match loop exec");

    ++(this.destNode.times);
    this.destNode.nextTransition = this.destNode.exitTransition;

    return this.destNode;
}

/***********************************************************************
    Greedy group loop automata actions.
***********************************************************************/

function RegExpGroupLoopNode (
    max,
    loopTransition,
    exitTransition
)
{
    this.max = max;
    this.times = 0;
    this._final = false;
    this.contextIndex = -1;

    this.loopTransition = loopTransition;
    this.exitTransition = exitTransition;

    this.nextTransition = loopTransition;
}

RegExpGroupLoopNode.prototype.reset = function ()
{
    this.times = 0;
    this.nextTransition = this.loopTransition;
}

RegExpGroupLoopNode.prototype.step = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# group loop node step");

    if (this.nextTransition === this.loopTransition)
        ++this.times;

    return this.nextTransition.exec(context);
}

RegExpGroupLoopNode.prototype.backtrack = function (
    context
)
{
    context.backtrackStack.pop();

    if (this.times > 0)
    {
        --(this.times);
        this.nextTransition = this.exitTransition;
        return true;
    }
    return false;
}

function RegExpGroupLoopOpenTransition (
    destNode
)
{
    this.destNode = destNode;
}

RegExpGroupLoopOpenTransition.prototype.exec = function (
    context
)
{
    context.backtrackStack.push(this.destNode);
    this.destNode.reset();
    return this.destNode;
}

function RegExpGroupLoopTransition (
    destNode
)
{
    this.destNode = destNode;
}

RegExpGroupLoopTransition.prototype.exec = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# group loop exec");

    if (this.destNode.contextIndex === context.index)
        return null;

    if (this.destNode.times >= this.destNode.max && this.destNode.max > 0)
    {
        this.destNode.nextTransition = this.destNode.exitTransition;
    }
    else
    {
        context.backtrackStack.push(this.destNode);
        this.destNode.contextIndex = context.index;
    }
    
    return this.destNode;
}

/***********************************************************************
    Non greedy group loop automata actions.
***********************************************************************/

function RegExpGroupNonGreedyLoopNode (
    max,
    loopTransition,
    exitTransition
)
{
    this.max = max;
    this.times = 0;
    this._final = false;
    this.contextIndex = -1;

    this.loopTransition = loopTransition;
    this.exitTransition = exitTransition;

    this.nextTransition = exitTransition;
}

RegExpGroupNonGreedyLoopNode.prototype.reset = function ()
{
    this.times = 0;
    this.nextTransition = this.exitTransition;
}

RegExpGroupNonGreedyLoopNode.prototype.step = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# group loop node step");

    if (this.nextTransition === this.loopTransition)
        ++this.times;

    return this.nextTransition.exec(context);
}

RegExpGroupNonGreedyLoopNode.prototype.backtrack = function (
    context
)
{
    context.backtrackStack.pop();

    if (this.nextTransition === this.loopTransition)
    {
    }

    if (this.times > 0)
    {
        --(this.times);
        this.nextTransition = this.loopTransition;
        return true;
    }
    return false;
}

function RegExpGroupNonGreedyLoopTransition (
    destNode
)
{
    this.destNode = destNode;
}

RegExpGroupNonGreedyLoopTransition.prototype.exec = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# group loop exec");

    if (this.destNode.contextIndex === context.index)
        return null;

    if (this.destNode.times >= this.destNode.max && this.destNode.max > 0)
        this.destNode.nextTransition = this.destNode.exitTransition;

    context.backtrackStack.push(this.destNode);

    this.destNode.contextIndex = context.index;
    
    return this.destNode;
}

/***********************************************************************
    Greedy backreference loop automata actions.
***********************************************************************/

function RegExpBackRefLoopNode (
    max,
    loopTransition,
    exitTransition
)
{
    this.max = max;
    this.times = 0;
    this._final = false;
    this.indexBacktrackStack = [];

    this.loopTransition = loopTransition;
    this.exitTransition = exitTransition;

    this.nextTransition = loopTransition;
}

RegExpBackRefLoopNode.prototype.reset = function ()
{
    this.times = 0;
    this.nextTransition = this.loopTransition;
}

RegExpBackRefLoopNode.prototype.step = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# back reference loop node step");

    this.indexBacktrackStack.push(context.index);

    if (this.nextTransition === this.loopTransition)
        ++this.times;

    return this.nextTransition.exec(context);
}

RegExpBackRefLoopNode.prototype.backtrack = function (
    context
)
{
    context.setIndex(this.indexBacktrackStack.pop());

    if (this.times > 0)
    {
        --(this.times);
        this.nextTransition = this.exitTransition;
        return true;
    }

    context.backtrackStack.pop();
    return false;
}

function RegExpBackRefLoopTransition (
    destNode
)
{
    this.destNode = destNode;
}

RegExpBackRefLoopTransition.prototype.exec = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# back reference loop exec");

    if (this.destNode.indexBacktrackStack[this.destNode.indexBacktrackStack.length - 1] === context.index)
        return null;

    if (this.destNode.times >= this.destNode.max && this.destNode.max > 0)
        this.destNode.nextTransition = this.destNode.exitTransition;

    return this.destNode;
}

function RegExpBackRefLoopOpenTransition (
    destNode
)
{
    this.destNode = destNode;
}

RegExpBackRefLoopOpenTransition.prototype.exec = function (
    context
)
{
    this.destNode.reset();
    context.backtrackStack.push(this.destNode);
    return this.destNode;
}

/***********************************************************************
    Greedy backreference loop automata actions.
***********************************************************************/

function RegExpBackRefNonGreedyLoopNode (
    max,
    loopTransition,
    exitTransition
)
{
    this.max = max;
    this.times = 0;
    this._final = false;
    this.indexBacktrackStack = [];

    this.loopTransition = loopTransition;
    this.exitTransition = exitTransition;

    this.nextTransition = exitTransition;
}

RegExpBackRefNonGreedyLoopNode.prototype.reset = function ()
{
    this.times = 0;
    this.nextTransition = this.exitTransition;
}

RegExpBackRefNonGreedyLoopNode.prototype.step = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# back reference loop node step");

    this.indexBacktrackStack.push(context.index);

    if (this.nextTransition === this.loopTransition)
        ++this.times;

    return this.nextTransition.exec(context);
}

RegExpBackRefNonGreedyLoopNode.prototype.backtrack = function (
    context
)
{
    context.setIndex(this.indexBacktrackStack.pop());

    if (++this.times < max)
    {
        this.nextTransition = this.loopTransition;
        return true;
    }

    context.backtrackStack.pop();
    return false;
}

function RegExpBackRefNonGreedyLoopTransition (
    destNode
)
{
    this.destNode = destNode;
}

RegExpBackRefNonGreedyLoopTransition.prototype.exec = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# back reference loop exec");

    if (this.destNode.indexBacktrackStack[this.destNode.indexBacktrackStack.length - 1] === context.index)
        return null;

    this.destNode.nextTransition = this.destNode.exitTransition;

    return this.destNode;
}

function RegExpBackRefNonGreedyLoopOpenTransition (
    destNode
)
{
    this.destNode = destNode;
}

RegExpBackRefNonGreedyLoopOpenTransition.prototype.exec = function (
    context
)
{
    this.destNode.reset();
    context.backtrackStack.push(this.destNode);
    return this.destNode;
}

/***********************************************************************
    Basic assertion automata actions.
***********************************************************************/

function RegExpBOLAssertionTransition (
    destNode
)
{
    this.destNode = destNode;
}

RegExpBOLAssertionTransition.prototype.exec = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# bol assertion exec");

    if (context.index === 0)
        return this.destNode;

    return null;
}

function RegExpMultilineBOLAssertionTransition (
    destNode
)
{
    this.destNode = destNode;
}

RegExpMultilineBOLAssertionTransition.prototype.exec = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# multiline bol assertion exec");

    if (context.index === 0)
        return this.destNode;

    if (context.input.charCodeAt(context.index - 1) === 10 ||
        context.input.charCodeAt(context.index - 1) === 13 ||
        context.input.charCodeAt(context.index - 1) === 8232 ||
        context.input.charCodeAt(context.index - 1) === 8233)
    {
        return this.destNode;
    }

    return null;
}

function RegExpEOLAssertionTransition (
    destNode
)
{
    this.destNode = destNode;
}

RegExpEOLAssertionTransition.prototype.exec = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# eol assertion exec");

    if (context.endOfInput())
        return this.destNode;
    return null;
}

function RegExpMultilineEOLAssertionTransition (
    destNode
)
{
    this.destNode = destNode;
}

RegExpMultilineEOLAssertionTransition.prototype.exec = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# multiline eol assertion exec");

    if (context.endOfInput())
        return this.destNode;

    if (context.currentCharCode === 10 || context.currentCharCode === 13 ||
        context.currentCharCode === 8232 || context.currentCharCode === 8233)
    {
        return this.destNode;
    }
    return null;
}

function RegExpWordBoundaryAssertionTransition (
    destNode,
    positive
)
{
    this.destNode = destNode;
    this.positive = positive;
}

RegExpWordBoundaryAssertionTransition.prototype.exec = function (
    context
)
{
    var a = this.isWordChar(context.input.charCodeAt(context.index - 1));
    var b = this.isWordChar(context.currentCharCode);
    if ((a !== b) && this.positive)
        return this.destNode;
    else if ((a === b) && !this.positive)
        return this.destNode;
    return null;
}

RegExpWordBoundaryAssertionTransition.prototype.isWordChar = function (
    charCode
)
{
    return ((charCode >= 97 && charCode <= 122) ||
            (charCode >= 65 && charCode <= 90) ||
            (charCode >= 48 && charCode <= 57) ||
            charCode === 95);
}

/***********************************************************************
    Lookahead automata actions.
***********************************************************************/

function RegExpLookaheadNode (
    group,
    positive,
    lookaheadTransition,
    exitTransition
)
{
    this.contextIndex = -1;
    this.group = group;
    this.positive = positive;
    this.lookaheadTransition = lookaheadTransition;
    this.exitTransition = exitTransition;
    this.reset();
}

RegExpLookaheadNode.prototype.reset = function ()
{
    this.matched = false;
    this.nextTransition = this.lookaheadTransition;
}

RegExpLookaheadNode.prototype.step = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# lookahead node step");

    // Lookahead disjunction match has ended.
    if (this.nextTransition === this.exitTransition)
    {
        // Delete backtracking informations that might have been stored
        // into the lookahead disjunction match as we must not backtrack
        // back into an assertion (15.10.2.8 NOTE 2).
        while (context.getBTNode() !== this)
            context.backtrackStack.pop();

        // Restore context index.
        context.setIndex(this.contextIndex);

        if (this.positive && this.matched || !this.positive && !this.matched)
            return this.exitTransition.exec(context);
        else
            return null;
    }
    // Execute the lookahead disjunction match.
    return this.nextTransition.exec(context);
}

RegExpLookaheadNode.prototype.backtrack = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# backtrack lookahead");

    // Backtracked from outside the inner lookahead disjunction.
    if (this.nextTransition === this.exitTransition)
    {
        // Clear all captures.
        this.group.clear();

        context.backtrackStack.pop();
        return false;
    }
    // Backtracked while inside the lookahead dijunction (failed to match the assertion).
    else
    {
        this.nextTransition = this.exitTransition;
        return true;
    }
}

function RegExpLookaheadOpenTransition (
    destNode
)
{
    this.destNode = destNode;
}

RegExpLookaheadOpenTransition.prototype.exec = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# lookahead open exec");

    this.destNode.reset();
    this.destNode.contextIndex = context.index;
    context.backtrackStack.push(this.destNode);
    return this.destNode;
}

function RegExpLookaheadMatchTransition (
    destNode
)
{
    this.destNode = destNode;
}

RegExpLookaheadMatchTransition.prototype.exec = function (
    context
)
{
    if (REGEXPDEBUG)
        print("# lookahead match exec");

    this.destNode.matched = true;
    this.destNode.nextTransition = this.destNode.exitTransition;
    return this.destNode;
}

