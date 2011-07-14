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

    string = new String(string).toString();

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

        // Convert character to numerical value.
        if (digit >= 65 && digit <= 90) // A-Z
            digit -= 55;
        else if (digit >= 97 && digit <= 122) // a-z
            digit -= 87;
        else if (digit >= 48 && digit <= 57) // 0-9
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

function _encodeURI (
    decodedURI,
    isUnescapedClassFilter
)
{
    var encodedURIParts = [], i = 0, j = 0;

    for (var i = 0; i < decodedURI.length;)
    {
        while (i < decodedURI.length &&
               _isUnescapedClass(decodedURI.charCodeAt(i)))
           ++i;

        if (i < decodedURI.length)
        {
            if (j < i)
                encodedURIParts.push(decodedURI.substring(j, i));

            // Current character has to be escaped.
            var c = decodedURI.charCodeAt(i), v;

            if (c >= 0xDC00 && c <= 0xDFFF)
                // FIXME: must throw URIError
                return null;

            if (c < 0xD800 || c > 0xDBFF)
            {
                v = c;
            }
            else
            {
                if (i + 1 >= decodedURI.length)
                    // FIXME: must throw URIError
                    return null;

                var cnext = decodedURI.charCodeAt(i + 1);

                if (cnext < 0xDC00 || cnext > 0xDFFF)
                    // FIXME: must throw URIError
                    return null;

                v = (c - 0xD800) * 0x400 + (cnext - 0xDC00) + 0x10000;
            }

            // Apply UTF-8 transformation
            var utfbytes;

            if (v < 0x80)
                utfbytes = [v];   
            else if (v < 0x0800)
                utfbytes = [0xC0 | v >> 6, 0x80 | v & 0x3F];
            else if (v < 0x10000)
                utfbytes = [0xE0 | v >> 12, 0x80 | v >> 6 & 0x3F, 0x80 | v & 0x3F];
            else if (v < 0x200000)
                utfbytes = [0xF0 | v >> 18, 0x80 | v >> 12 & 0x3F, 0x80 | v >> 6 & 0x3F, 0x80 | v & 0x3F];

            var utfchars = new Array(utfbytes.length * 3);
            for (var k = 0, l = 0; k < utfbytes.length; ++k, l += 3)
            {
                utfchars[l] = 37; // '%'

                if (((utfbytes[k] & 0xF0) >> 4) < 10)
                    utfchars[l + 1] = ((utfbytes[k] & 0xF0) >> 4) + 48;
                else
                    utfchars[l + 1] = ((utfbytes[k] & 0xF0) >> 4) + 55;

                if ((utfbytes[k] & 0x0F) < 10)
                    utfchars[l + 2] = (utfbytes[k] & 0x0F) + 48;
                else
                    utfchars[l + 2] = (utfbytes[k] & 0x0F) + 55;
            }

            encodedURIParts.push(string_internal_fromCharCodeArray(utfchars));
            j = ++i;
        }
    }

    if (j < i)
        encodedURIParts.push(decodedURI.substring(j, i));

    return encodedURIParts.join("");
}

function extractHexValue (
    str,
    pos
)
{
    var value = 0, i = pos;

    for (; i < 2; ++i)
    {
        var hc = str.charCodeAt(i);

        if (hc >= 97 && hc <= 102) // a-f
            value = (value * 16) + (hc - 87);
        else if (hc >= 65 && hc <= 70) // A-F
            value = (value * 16) + (hc - 55);
        else if (hc >= 48 && hc <= 57) // 0-9
            value = (value * 16) + (hc - 48);
        else
            return null;
    }
    return value;
}

function _decodeURI (
    encodedURI
)
{
    var decodedURIParts = [], i = 0, j = 0;

    for (var i = 0; i < encodedURI.length;)
    {
        while (i < decodedURI.length &&
               decodedURI.charCodeAt(i) !== 37) // '%'
           ++i;

        if (i < encodedURI.length)
        {
            if (i + 2 >= encodedURI.length)
                // FIXME: must throw URIError.
                return null;

            if (j < i)
                decodedURIParts.push(encodedURI.substring(j, i));

            var charCode;
            while (true)
            {
                var value = extractHexValue(encodedURI, i + 1);
                print(value);

                if (value === null)
                    // FIXME: must throw URIError.
                    return null;
            }
        }
    }
}

function _isUnescapedClassWithDash (c)
{
    return ((c >= 65 && c <= 90) || (c >= 97 && c <= 122) ||
            (c >= 48 && c <= 57) || (c >= 39 && c <= 42)  ||
            c === 45 || c === 95 || c === 46 || c === 33  ||
            c === 126 || c === 35);
}

function _isUnescapedClass(c)
{
    return ((c >= 65 && c <= 90) || (c >= 97 && c <= 122) ||
            (c >= 48 && c <= 57) || (c >= 39 && c <= 42)  ||
            c === 45 || c === 95 || c === 46 || c === 33  ||
            c === 126);
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
    return _encodeURI(decodedURI, _isUnescapedClassWithDash);
}

function encodeURIComponent (
    decodedURIComponent
)
{
    return _encodeURI(decodedURIComponent, _isUnescapedClass);
}

