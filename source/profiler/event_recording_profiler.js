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
Initialize the profiler via 'prof_init' function defined in /runtime/primitives.js
*/
function initProfiler(params){
    var prof_init = params.staticEnv.getBinding('prof_init');
    
    execUnit(prof_init, params);
}

function prof_compilationTimeReport(){
    
    data.compilation_time_report +=
        "\n------- PROFILING: COMPILATION TIME REPORT -------\n\n" +
        "      Parsing time: " + data.parsing_time + "ms\n" +
        "      Compile AST time: " + data.compileAst_time + "ms\n" +
        "\n";
    print(data.compilation_time_report);
}

/**
Produce profiling report in console and text file
*/

function lightProfReport(params){
    var lightProf_report = params.staticEnv.getBinding('lightProf_report');
    execUnit(lightProf_report, params);
}

function heavyProfReport(params){
/*    var prof_allocReport = params.staticEnv.getBinding('prof_allocReport');
    var prof_propGetReport = params.staticEnv.getBinding('prof_propGetReport');
    var prof_propPutReport = params.staticEnv.getBinding('prof_propPutReport');
    var prof_fileReport = params.staticEnv.getBinding('prof_fileReport');
    var prof_funcCallReport = params.staticEnv.getBinding('prof_funcCallReport');
    var prof_funcCallsPerDepthReport = params.staticEnv.getBinding('prof_funcCallsPerDepthReport');
    var prof_testReport = params.staticEnv.getBinding('prof_testReport');

    //Producing profiling report in console
    execUnit(prof_propGetReport, params);
    execUnit(prof_propPutReport, params);
    execUnit(prof_allocReport, params);
    execUnit(prof_funcCallReport, params);
    //execUnit(prof_testReport, params);
    execUnit(prof_funcCallsPerDepthReport, params);

    //Producing profiling report in text file "/src/profiler/profiling_report.txt"
    execUnit(prof_fileReport, params);*/

    var heavyProf_report = params.staticEnv.getBinding('heavyProf_report');
    execUnit(heavyProf_report, params);

}



