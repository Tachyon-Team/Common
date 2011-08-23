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


function bar(v)
{
    return v + 1;
}

function bif(v)
{
    return v + 2;
}

function foo(a)
{
    a += bar(a);

    a += 1;

    for (var i = 0; i < 5; ++i)
    {
        a += bif(a);

        a += 2;

        a += bar(a);
    }

    a += 3;

    a += bif(a);

    return a;
}

foo(1);


function linkedlist(n)
{
    var head = null;

    for (var i = 0; i < n; ++i)
    {
        head = { val: i, next: head };
    }

    var sum = 0;

    for (var cur = head; cur !== null; cur = cur.next)
    {
        sum += cur.val;
    } 

    return sum;
}

linkedlist(100);


function foo_bar()
{
    var arr = [];

    if (arr.length !== 0)
        return 1;

    arr.length = 4;

    if (arr.length !== 4)
        return 1;

    for (var i = 0; i < arr.length; ++i)
        if (arr[i])
            return 1;

    arr[arr.length] = 3;

    if (arr.length != 5)
        return 1;

    arr.length = 1;

    if (arr.length !== 1)
        return 1;

    return 0;
}

foo_bar();


function fib(x)
{
    if (x < 2)
        return x;
    else
        return fib(x-1) + fib(x-2);
}

fib(11);


var obj = {
    prop1: "a",
    prop2: fib(5),
    prop3: "prop3"
};

delete obj['prop1'];

for(var i = 0; i < 20; i++) fib(3);

