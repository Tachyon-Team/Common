var opts = require('opts');
var fs   = require('fs');

exports.DEBUG = false;

exports.pacPort = 9000;
exports.httpPort = 8080;
exports.httpsPort = 8081;
exports.httpsProxyPort = 8443;
exports.recordSource = false;
exports.recordInstrumentedSource = false;
exports.recordHTML = false;
exports.recordInstrumentedHTML = false;
exports.profiler = null;

exports.key = fs.readFileSync('./data/key.pem');
exports.cert = fs.readFileSync('./data/cert.pem');

exports.outputDir = "output";

// Dynamic exports
exports.enableLogging = false;

var options = [
    {  
        long        : 'record-js',
        description : 'Record instrumented JavaScript source',
        callback    : function () {
            exports.recordSource = true;
            exports.recordInstrumentedSource = true;
        }
    },

    {
        long        : 'record-html',
        description : 'Record instrumented HTML files',
        callback    : function () {
            exports.recordHTML = true;
            exports.recordInstrumentedHTML = true;
        }
    },

    {
        short       : 'd',
        long        : 'output-dir',
        description : 'Specify the output directory (default: "output")',
        value       : true,
        callback    : function (value) {
            exports.outputDir = value;
        }
    },

    {
        long        : 'pac-port',
        description : 'Specify the port used for proxy autoconfiguration (PAC) (default: "' + exports.pacPort + '")',
        value       : true,
        callback    : function (value) {
            exports.pacPort = parseFloat(value);
        }
    },

    {
        long        : 'http-port',
        description : 'Specify the port used for HTTP communication (default: "' + exports.httpPort + '")',
        value       : true,
        callback    : function (value) {
            exports.httpPort = parseFloat(value);
        }
    },

    {
        long        : 'https-port',
        description : 'Specify the port used for HTTPS communication (default: "' + exports.httpsProxyPort + '")',
        value       : true,
        callback    : function (value) {
            exports.httpsProxyPort = parseFloat(value);
        }
    },

    {
        long        : 'enable-log',
        description : 'Enable the activity log in the recorded profile (expensive)',
        callback    : function () {
            exports.enableLogging = true;
        }
    }
];
exports.options = options;
    
exports.parseCmdLine = function (argv) {
    if (argv !== undefined) {
        return opts.parse(options, argv, true);
    } else {
        return opts.parse(options, true);
    }
}
