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

function parseInt (
    string,
    radix
)
{
    var i = 0;
    var positive = true;

    // Skip whitespace
    while (string_internal_isWhiteSpace(string.charCodeAt(i)))
        ++i;

    if (string.charCodeAt(i) === 43)
    {
        ++i;
    }
    else if (string.charCodeAt(i) === 45)
    {
        ++i;
        positive = false;
    }

    if (radix !== undefined && !(radix >= 2 || radix <= 36))
        // FIXME: must return NaN
        return null;

    // Set radix default value if no valid radix parameter given.
    if (radix === undefined || radix === 0)
        radix = 10;

    // Assume hexadecimal if string begin with '0x' or '0X'
    if (string.charCodeAt(i) === 48 &&
        (string.charCodeAt(i + 1) === 88 || string.charCodeAt(i + 1) === 120))
    {
        i += 2;
        radix = 16;
    }

    var j = i, n = 0;

    while (true)
    {
        var digit = string.charCodeAt(j);

        if (digit >= 65 && digit <= 90)
            digit -= 55;
        else if (digit >= 97 && digit <= 122)
            digit -= 87;
        else if (digit >= 48 && digit <= 57)
            digit -= 48;
        else
            break;

        if (digit >= radix)
            break;

        n = (n * radix) + digit;
        ++j;
    }

    if (j > i)
       return positive ? n : -n;
    // FIXME: must return NaN
    return null; 
}

function parseFloat (
    string
)
{
}

function isNaN (
    number
)
{
}

function isFinite (
    number
)
{
}

function decodeURI (
    encodedURI
)
{
}

function decodeURIComponent (
    encodedURIComponent
)
{
}

function encodeURI (
    decodedURI
)
{
}

function encodeURIComponent (
    decodedURIComponent
)
{
}

