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

function depth_is_0(x){
    print("Depth: 0" + "\n x: " + x);
    return 0;
}

var obj0 = {
    "depth_is_1":function(x){print("Depth: 1" + "\n x: " + x);return 1;}
};

obj0.obj1 = {
    "depth_is_2":function(x){print("Depth: 2" + "\n x: " + x);return 2;}
};

obj0.obj1.obj2 = {
    "depth_is_3":function(x){print("Depth: 3" + "\n x: " + x);return 3;}
};

obj0.obj1.obj2.obj3 = {
    "depth_is_4":function(x){print("Depth: 4" + "\n x: " + x);return 4;}
};

obj0.obj1.obj2.obj3.obj4 = {
    "depth_is_5":function(x){print("Depth: 5" + "\n x: " + x);return 5;}
};

obj0.obj1.obj2.obj3.obj4.obj5 = {
    "depth_is_6":function(x){print("Depth: 6" + "\n x: " + x);return 6;}
};

obj0.obj1.obj2.obj3.obj4.obj5.obj6 = {
    "depth_is_7":function(x){print("Depth: 7" + "\n x: " + x);return 7;}
};

obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7 = {
    "depth_is_8":function(x){print("Depth: 8" + "\n x: " + x);return 8;}
};


depth_is_0();
obj0.depth_is_1();
obj0.obj1.depth_is_2();
obj0.obj1.obj2.depth_is_3();
obj0.obj1.obj2.obj3.depth_is_4();
obj0.obj1.obj2.obj3.obj4.depth_is_5();
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6();
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7();
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8();


depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.depth_is_1());
obj0.obj1.depth_is_2(obj0.depth_is_1());
obj0.obj1.obj2.depth_is_3(obj0.depth_is_1());
obj0.obj1.obj2.obj3.depth_is_4(obj0.depth_is_1());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.depth_is_1());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.depth_is_1());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.depth_is_1());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(obj0.depth_is_1());



depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());



depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());


depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());


depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());


depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());


depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());


depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());


depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());


depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());



depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());

depth_is_0(obj0.depth_is_1());
obj0.depth_is_1(obj0.obj1.depth_is_2());
obj0.obj1.depth_is_2(obj0.obj1.obj2.depth_is_3());
obj0.obj1.obj2.depth_is_3(obj0.obj1.obj2.obj3.depth_is_4());
obj0.obj1.obj2.obj3.depth_is_4(obj0.obj1.obj2.obj3.obj4.depth_is_5());
obj0.obj1.obj2.obj3.obj4.depth_is_5(obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6());
obj0.obj1.obj2.obj3.obj4.obj5.depth_is_6(obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.depth_is_7(obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8());
obj0.obj1.obj2.obj3.obj4.obj5.obj6.obj7.depth_is_8(depth_is_0());
