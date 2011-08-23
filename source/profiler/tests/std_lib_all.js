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





/*******************  OBJECT STANDARD LIBRARY FUNCTIONS **********************/
var o = Object.create(null);
var o2 = new Object();

var p = Object.getPrototypeOf(o);

Object.defineProperty(o, "prop1", "first property");

Object.hasOwnProperty("prop1");

Object.isFrozen(o);

Object.isExtensible(o);

o2.isPrototypeOf(o);

o2.toString();

o2.valueOf();
/*******************  END OF: OBJECT STANDARD LIBRARY FUNCTIONS **********************/







/*******************  ARRAY STANDARD LIBRARY FUNCTIONS  ***********************/
var arr_1 = [1,2,3];
var arr_2 = [4,5,6];

print(arr_1.pop());

arr_1.shift(0);

arr_1.unshift(0);

arr_1.indexOf(1);

arr_1.lastIndexOf(1);

arr_1.sort();

arr_1.filter(isSmallEnough);

arr_1.map(function(x){return x++;});

arr_1.forEach(printElem);

arr_1.slice(0);

arr_1.splice(1, 0, 11);

arr_1.concat(arr_2);

arr_1.toString();

arr_1.push(3);

arr_1.reverse();

arr_1.join();




function isSmallEnough(x){
    return(x <= 10);
}

function printElem(x){
    print(x + "\n");
}
/******************* END OF: ARRAY STANDARD LIBRARY FUNCTIONS  ***********************/














/*******************  MATH STANDARD LIBRARY FUNCTIONS  ***********************/
print(Math.abs(-2));

Math.ceil(2);

Math.floor(2);

Math.max(2,3,4);

Math.min(2,3,4);

Math.pow(2,5);
/*******************  END OF: MATH STANDARD LIBRARY FUNCTIONS  ***********************/













/******************* FUNCTION STANDARD LIBRARY FUNCTIONS **********************/
var func = function(text){print("coucou" + text);};

func.call();
func.apply("coucou");
func.toString();
/*******************  END OF: FUNCTION STANDARD LIBRARY FUNCTIONS **********************/













/******************* STRING STANDARD LIBRARY FUNCTIONS **********************/
var str1 = "aaaaaaaaaaaa";

print(str1.charCodeAt(0));
str1.toString();
str1.valueOf();
str1.charAt(0);

var str2 = "bbbbbbbbbbb";

str1.concat(str2);
str1.indexOf("a");
str1.lastIndexOf("a");
str1.localeCompare(str2);
str1.slice(0);
str1.match("aaa");
str1.replace("a", "x");
str1.search("a");
str1.split();
str1.substring(0,1);
str1.substr(0,1);
str1.toLowerCase();
str1.toUpperCase();
str1.toLocaleLowerCase();
str1.toLocaleUpperCase();
str1.internal_isWhiteSpace();
str1.trim(0);
/******************* END OF: STRING STANDARD LIBRARY FUNCTIONS **********************/






