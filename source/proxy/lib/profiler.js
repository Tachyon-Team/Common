var js2js    = require('js2js');
var options  = require('./options');
var instrument = require('./instrumentation');

var js2jsOptions = {
    profile: true,
    debug: true,
    filename: null
};

var js2js_script = '<script type="application/javascript" src="/js2js/js2js-lib.js"></script>';
var profiler_lib_script = '<script type="application/javascript" src="/js2js/profiler-lib.js"></script>';
var logging_enabler_script = '<script type="application/javascript">profile$enableLogging();</script>';

function JS2JSProfiler() {
    // empty
}
JS2JSProfiler.prototype = new instrument.Instrumentation();
exports.JS2JSProfiler = JS2JSProfiler;

JS2JSProfiler.prototype.documentPrefix = function (doc) {
    var scripts = [js2js_script, profiler_lib_script];
    if (options.enableLogging) {
        scripts.push(logging_enabler_script);
    }
    return scripts.join("\n");
};

JS2JSProfiler.prototype.bodyPrefix = function (doc) {
    return '<a id="proxy_send_profile_link" ' +
               ' href="javascript:void(0);"' +
               ' onclick="javascript:profile$dump();"' +
               ' style="position: absolute; top: 40px; left: 0; border: 0; color: #777777; z-index: 9999;">' +
               'Send profile' +
            '</a>';
};

JS2JSProfiler.prototype.instrumentScript = function (script, filename) {
    js2jsOptions.filename = filename;
    return js2js.instrument(script, js2jsOptions);
};
