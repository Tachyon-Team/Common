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

/**
    Automata structure.
*/

function RegExpAutomata (
    headNode,
    captures 
)
{
    this.headNode = headNode;
    this.captures = captures;
}

function AstToAutomataContext (
    groups,
    global,
    ignoreCase,
    multiline
)
{
    this.groups = groups;
    this.global = global;
    this.ignoreCase = ignoreCase;
    this.multiline = multiline;
}

/**
    Preemptly build group and captures structures from a regexp ast.
    The result is stored into groups.
*/
function buildGroups (
    ast,
    groups,
    parents
)
{
    if (ast instanceof RegExpDisjunction)
    {
        var capture;

        if (ast.captures)
        {
            // Create a new capture object and register it to its parents
            capture = new RegExpCapture();

            for (var i = 0; i < parents.length; ++i)
                parents[i].subcaptures.push(capture);
        }

        // Create a new group object for this disjunction.
        var group = new RegExpGroup(capture);
        parents.push(group);
        groups[ast.groupId] = group;

        // Build groups for each alternatives.
        for (var i = 0; i < ast.alternatives.length; ++i)
            buildGroups(ast.alternatives[i], groups, parents);
        parents.pop();
    }
    else if (ast instanceof RegExpAlternative)
    {
        // Build groups for each terms.
        for (var i = 0; i < ast.terms.length; ++i)
        {
            buildGroups(ast.terms[i], groups, parents);
        }
    }
    else if (ast instanceof RegExpTerm)
    {
        // Call recursively if inner atom or assertion is a dijunction.
        if (ast.prefix.value instanceof RegExpDisjunction)
        {
            buildGroups(ast.prefix.value, groups, parents);
        }
    }
}

/**
    Translate a regexp ast into a regexp automata structure with the given flags.
*/
function astToAutomata (
    ast,
    global,
    ignoreCase,
    multiline
)
{
    var headNode = new RegExpNode();
    var groups = [];
    var context;

    buildGroups(ast, groups, []);
    context = new AstToAutomataContext(groups, global, ignoreCase, multiline);
    headNode.transition = disjunctionToAutomata(ast, false, context);

    var rootGroup = groups[ast.groupId];
    var captures = [ rootGroup.capture ].concat(rootGroup.subcaptures);
    return new RegExpAutomata(headNode, captures);
}

function disjunctionToAutomata (
    astNode,
    nextTransition,
    context
)
{
    var group = context.groups[astNode.groupId];
    var openNode = new RegExpGroupNode(group);
    var closeNode = new RegExpNode();

    var openTransition = new RegExpGroupOpenTransition(openNode, group);
    var closeTransition = new RegExpGroupCloseTransition(closeNode, group);

    if (astNode.alternatives.length > 0)
        for (var i = 0; i < astNode.alternatives.length; ++i)
            openNode.addAlternative(alternativeToAutomata(astNode.alternatives[i], closeTransition, context));
    else
        openNode.addAlternative(closeTransition);

    // Set close node final if no next transition.
    if (nextTransition)
    {
        closeNode.transition = nextTransition;
    }
    else
    {
        closeNode.transition = new RegExpTransition(null);
        closeNode._final = true;
    }
    
    return openTransition;
}

function alternativeToAutomata (
    astNode,
    nextTransition,
    context
)
{
    for (var i = astNode.terms.length; i > 0; --i)
        nextTransition = termToAutomata(astNode.terms[i - 1], nextTransition, context);
    return nextTransition;
}

function termToAutomata (
    astNode,
    nextTransition,
    context
)
{
    if (astNode.prefix instanceof RegExpAtom)
    {
        var min = astNode.quantifier.min;
        var max = astNode.quantifier.max;

        if (max < 0 || max > min)
        {
            if (astNode.prefix.value instanceof RegExpPatternCharacter ||
                astNode.prefix.value instanceof RegExpCharacterClass)
            {
                if (astNode.quantifier.greedy)
                {
                    var loopTransition = new RegExpCharMatchLoopTransition();
                    var loopNode = new RegExpCharMatchLoopNode(max - min, atomToAutomata(astNode.prefix, loopTransition, context), nextTransition);
                    loopTransition.destNode = loopNode;
                    nextTransition = new RegExpLoopOpenTransition(loopNode);
                }
                else
                {
                    var loopTransition = new RegExpCharMatchNonGreedyLoopTransition();
                    var loopNode = new RegExpCharMatchNonGreedyLoopNode(max - min, atomToAutomata(astNode.prefix, loopTransition, context), nextTransition);
                    loopTransition.destNode = loopNode;
                    nextTransition = new RegExpLoopOpenTransition(loopNode);
                }
            }
            else if (astNode.prefix.value instanceof RegExpDisjunction)
            {
                if (astNode.quantifier.greedy)
                {
                    var loopTransition = new RegExpGroupLoopTransition();
                    var loopNode = new RegExpGroupLoopNode(max - min, atomToAutomata(astNode.prefix, loopTransition, context), nextTransition);
                    loopTransition.destNode = loopNode;
                    nextTransition = new RegExpGroupLoopOpenTransition(loopNode);
                }
                else
                {
                    var loopTransition = new RegExpGroupNonGreedyLoopTransition();
                    var loopNode = new RegExpGroupNonGreedyLoopNode(max - min, atomToAutomata(astNode.prefix, loopTransition, context), nextTransition);
                    loopTransition.destNode = loopNode;
                    nextTransition = new RegExpGroupNonGreedyLoopOpenTransition(loopNode);
                }
            }
            else if (astNode.prefix.value instanceof RegExpBackReference)
            {
                if (astNode.quantifier.greedy)
                {
                    var loopTransition = new RegExpBackRefLoopTransition();
                    var loopNode = new RegExpBackRefLoopNode(max - min, atomToAutomata(astNode.prefix, loopTransition, context), nextTransition);
                    loopTransition.destNode = loopNode;
                    nextTransition = new RegExpBackRefLoopOpenTransition(loopNode);
                }
                else
                {
                    var loopTransition = new RegExpBackRefNonGreedyLoopTransition();
                    var loopNode = new RegExpBackRefNonGreedyLoopNode(max - min, atomToAutomata(astNode.prefix, loopTransition, context), nextTransition);
                    loopTransition.destNode = loopNode;
                    nextTransition = new RegExpBackRefNonGreedyLoopOpenTransition(loopNode);
                }
            }
        }

        // Concatenate atom <min> times.
        for (var i = 0; i < min; ++i)
            nextTransition = atomToAutomata(astNode.prefix, nextTransition, context);
    }
    else if (astNode.prefix instanceof RegExpAssertion)
    {
        nextTransition = assertionToAutomata(astNode.prefix, nextTransition, context);
    }
    return nextTransition;
}

function atomToAutomata (
    astNode,
    nextTransition,
    context
)
{
    var node = new RegExpNode();
    var atomAstNode = astNode.value;

    node.transition = nextTransition;

    if (atomAstNode instanceof RegExpPatternCharacter)
    {
        var charCode = atomAstNode.value;
       
        if (context.ignoreCase)
            if (charCode >= 97 && charCode <= 122) // a-z
                nextTransition = new RegExpCharSetMatchTransition(node, [[charCode - 32, charCode - 32], [charCode, charCode]]);
            else if (charCode >= 65 && charCode <= 90) // A-Z
                nextTransition = new RegExpCharSetMatchTransition(node, [[charCode + 32, charCode + 32], [charCode, charCode]]);
            else 
                nextTransition = new RegExpCharMatchTransition(node, charCode);
        else
            nextTransition = new RegExpCharMatchTransition(node, charCode);
    }
    else if (atomAstNode instanceof RegExpCharacterClass)
    {
        var ranges = [];

        for (var i = 0; i < atomAstNode.classAtoms.length; ++i)
        {
            if (context.ignoreCase)
            {
                var ca = atomAstNode.classAtoms[i];

                if (ca.max === undefined)
                {
                    if (ca.min.value >= 97 && ca.min.value <= 122)
                    {
                        ranges.push([ca.min.value, ca.min.value]);
                        ranges.push([ca.min.value - 32, ca.min.value - 32]);
                    }
                    else if (ca.min.value >= 65 && ca.min.value <= 90)
                    {
                        ranges.push([ca.min.value, ca.min.value]);
                        ranges.push([ca.min.value + 32, ca.min.value + 32]);
                    }
                    else
                    {
                        ranges.push([ca.min.value, ca.min.value]);
                    }
                }
                else
                {
                    ranges.push(ca.max === undefined ? [ca.min.value, ca.min.value] : [ca.min.value, ca.max.value]);
                }
            }
            else
            {
                var ca = atomAstNode.classAtoms[i];
                ranges.push(ca.max === undefined ? [ca.min.value, ca.min.value] : [ca.min.value, ca.max.value]);
            }
        }

        if (atomAstNode.positive)
            nextTransition  = new RegExpCharSetMatchTransition(node, ranges);
        else
            nextTransition = new RegExpCharExSetMatchTransition(node, ranges);
    }
    else if (atomAstNode instanceof RegExpBackReference)
    {
        var rootGroup = context.groups[0];
        nextTransition = new RegExpBackRefMatchTransition(node, rootGroup.subcaptures[atomAstNode.index - 1]);
    }
    else if (atomAstNode instanceof RegExpDisjunction)
    {
        nextTransition = disjunctionToAutomata(atomAstNode, nextTransition, context);
    }

    return nextTransition;
}

function assertionToAutomata (
    astNode,
    nextTransition,
    context
)
{
    if (astNode.value instanceof RegExpDisjunction)
    {
        var group = context.groups[astNode.value.groupId];
        var exitTransition = new RegExpLookaheadMatchTransition();
        var node = new RegExpLookaheadNode(group, astNode.positive, disjunctionToAutomata(astNode.value, exitTransition, context), nextTransition);
        exitTransition.destNode = node;
        nextTransition = new RegExpLookaheadOpenTransition(node);
    }
    else
    {
        var node = new RegExpNode();
        node.transition = nextTransition;

        if (astNode.value === 94) // '^'
        {
            if (context.multiline)
                nextTransition = new RegExpMultilineBOLAssertionTransition(node);
            else
                nextTransition = new RegExpBOLAssertionTransition(node);
        }
        else if (astNode.value === 36) // '$'
        {
            if (context.multiline)
                nextTransition = new RegExpMultilineEOLAssertionTransition(node);
            else
                nextTransition = new RegExpEOLAssertionTransition(node);
        }
        else if (astNode.value === 98) // 'b' | 'B'
        {
            nextTransition = new RegExpWordBoundaryAssertionTransition(node, astNode.positive);
        }
    }
    return nextTransition;
}

