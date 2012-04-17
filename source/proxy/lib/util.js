var fs       = require('fs');
var path     = require('path');
var http     = require('http');
var https    = require('https');
var buffers  = require('buffertools');
var URL      = require('url');
var options  = require('./options');

exports.reexport = function (module, into) {
    if (into === undefined) into = exports;
    for (var name in module) {
        into[name] = module[name];
    }
};

exports.isJavaScript = function (contentType) {
    return contentType === "application/javascript"
            || contentType === "application/x-javascript" 
            || contentType === "application/x-javascript"
            || contentType === "text/javascript"
            || contentType === "application/ecmascript"
            || contentType === "text/ecmascript";
};

exports.isHTML = function (contentType) {
    return contentType === "text/html";
};

var xml_special_to_escaped = {
    '&': '&amp;',
    '"': '&quot;',
    '<': '&lt;',
    '>': '&gt;',
};
 
var xml_escaped_to_special = {
    '&amp;': '&',
    '&quot;': '"',
    '&lt;': '<',
    '&gt;': '>',
};
 
exports.encodeEntities = function (string) {
    return string.replace(/([\&"<>])/g, function(str, item) {
        return xml_special_to_escaped[item];
    });
};
 
exports.decodeEntities = function (string) {
    return string.replace(/(&lt;|&gt;|&quot;|&amp;)/g,
        function(str, item) {
            return xml_escaped_to_special[item];
    });
};

exports.getProperty = function (obj, prop, defval) {
    if (prop in obj) return obj[prop];
    return defval;
};

exports.debug = function (s) {
    if (options.DEBUG) console.log(s);
};

exports.info = function (s) {
    console.log(s);
};

exports.trim = function (str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};

exports.str_startsWith = function (s, prefix) {
    return s.lastIndexOf(prefix, 0) === 0;
};

exports.str_endsWith = function (s, suffix) {
    return s.indexOf(suffix, s.length - suffix.length) !== -1;
};

function str_pad(str, len, pad, dir) {
    // Adapted from http://www.webtoolkit.info/javascript-pad.html
    
    if (len === undefined) len = 0;
    if (pad === undefined) pad = ' ';
    if (dir === undefined) dir = "left";
 
    if (str.length >= len) return str;

    switch (dir) {
        case "left":
            return Array(len + 1 - str.length).join(pad) + str;
        case "both":
            var right = Math.ceil((padlen = len - str.length) / 2);
            var left = padlen - right;
            return Array(left+1).join(pad) + str + Array(right+1).join(pad);
        case "right":
            return str + Array(len + 1 - str.length).join(pad);
        default:
            throw "Unknown padding direction: " + dir;
    }
};
exports.str_pad = str_pad;

exports.str_lpad = function (str, len, pad) {
    return str_pad(str, len, pad, "left");
};

exports.str_rpad = function (str, len, pad) {
    return str_pad(str, len, pad, "right");
};

exports.merge = function (chunks) {
    return buffers.concat.apply(null, chunks);
};

exports.parseURL = function (url, protocol) {
    if (protocol === undefined) protocol = http;

    var urlparts = URL.parse(url);
    urlparts.fullpath = urlparts.pathname;
    if (urlparts.search) {
        urlparts.fullpath += urlparts.search;
    }
    if (urlparts.hash) {
        urlparts.fullpath += urlparts.hash;
    }

    if (urlparts.port) {
        urlparts.port = parseFloat(urlparts.port);
    } else {
        urlparts.port = protocol === https ? 443 : 80;
    }
    return urlparts;
};

function mkdirsSync(dirname, mode) {
    if (mode === undefined) mode = 0777 ^ process.umask();
    var paths = [];
    var d = dirname;
    while (true) {
        if (path.existsSync(d)) {
            var stats = fs.statSync(d);
            if (stats.isDirectory()) break;
            throw new Error('Unable to create directory at ' + d);
        } else {
            paths.push(d);
            d = path.dirname(d);
        }
    }
    for (var i = paths.length-1; i >= 0; i--) {
        fs.mkdirSync(paths[i], mode);
    }
}
exports.mkdirsSync = mkdirsSync;

function recordOutput(data, filename) {
    var fn = path.join(options.outputDir, filename);
    var d = path.dirname(fn);
    if (path.exists(d)) {
        var stat = fs.statSync(d);
        if (!stat.isDirectory()) throw "Output directory exists, but is not a directory";
    } else {
        mkdirsSync(d);
    }
    fs.writeFileSync(fn, data);
}
exports.recordOutput = recordOutput;

exports.recordSource = function (scriptSource, filename) {
    if (options.recordSource) {
       recordOutput(scriptSource, path.join(options.origOutputDir, filename));
    }
};

exports.recordInstrumentedSource = function (scriptSource, filename) {
    if (options.recordInstrumentedSource) {
       recordOutput(scriptSource, path.join(options.instOutputDir, filename));
    }
};

exports.recordHTML = function (html, filename) {
    if (options.recordHTML) {
        recordOutput(html, path.join(options.origOutputDir, filename));
    }
};

exports.recordInstrumentedHTML = function (html, filename) {
    if (options.recordInstrumentedHTML) {
        recordOutput(html, path.join(options.instOutputDir, filename));
    }
};
