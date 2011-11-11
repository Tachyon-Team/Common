var http     = require('http');
var jsdom    = require('jsdom');
var fs       = require('fs');
var Buffer   = require('buffer').Buffer;
var buffers  = require('buffertools');
var URL      = require('url');
var querystr = require('querystring');
var js2js    = require('js2js');

var DEBUG = false;

jsdom.defaultDocumentFeatures = {
    FetchExternalResources   : false,
    ProcessExternalResources : false,
    MutationEvents           : false,
    QuerySelector            : false
};

// ----- Helper functions -----

var xml_special_to_escaped = {
    '&': '&amp;',
    '"': '&quot;',
    '<': '&lt;',
    '>': '&gt;'
};
 
var xml_escaped_to_special = {
    '&amp;': '&',
    '&quot;': '"',
    '&lt;': '<',
    '&gt;': '>'
};
 
function encodeEntities(string) {
    return string.replace(/([\&"<>])/g, function(str, item) {
        return xml_special_to_escaped[item];
    });
};
 
function decodeEntities(string) {
    return string.replace(/(&quot;|&lt;|&gt;|&amp;)/g,
        function(str, item) {
            return xml_escaped_to_special[item];
    });
}

function getProperty(obj, prop, defval) {
    if (prop in obj) return obj[prop];
    return defval;
}

function debug(s) {
    if (DEBUG) console.log(s);
}

function info(s) {
    console.log(s);
}

function trim(str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function str_startsWith(s, prefix) {
    return s.lastIndexOf(prefix, 0) === 0;
}

function str_endsWith(s, suffix) {
    return s.indexOf(suffix, s.length - suffix.length) !== -1;
}

function merge(chunks) {
    return buffers.concat.apply(null, chunks);
}

function parseURL(url) {
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
        urlparts.port = 80;
    }
    return urlparts;
}

// ----- Response handlers -----

var UNPARSEABLE_CRUFT = "throw 1; < don't be evil' >"; // For handling google XSS security stuff

function instrument_js(data) {
    var prefix = null;
    if (str_startsWith(data, UNPARSEABLE_CRUFT)) {
        prefix = UNPARSEABLE_CRUFT;
        data = data.slice(UNPARSEABLE_CRUFT.length);
    }
    var script = js2js.instrument(data, {profile: false, debug: true});
    if (prefix !== null) {
        script = prefix + script;
    }
    return script;
}

var htmlHandler = {
    accepts: function (response) {
        var content_type = getProperty(response.headers, "content-type", "");
        return str_startsWith(content_type, "text/html");
    },

    process: function (response, data) {
        if (!data) return data;

        var window = jsdom.jsdom(data).createWindow();
        var document = window.document;

        // Instrument existing scripts
        var scripts = document.getElementsByTagName('script');
        var count = 0;
        for (var i = 0; i < scripts.length; i++) {
            var e = scripts[i];
            if (!e.hasAttribute('src')) {
                var script = instrument_js(decodeEntities(e.innerHTML + "\n"));
                e.innerHTML = encodeEntities(script);
            }
        }

        var container;
        if (document.head) {
            container = document.head;
        } else {
            container = document.body;
        }
        if (!container) return data; // Guard against empty documents
        var profiler_script = document.createElement('script');
        profiler_script.setAttribute("type", "application/javascript");
        profiler_script.setAttribute("src", "/js2js/profiler-lib.js");
        container.insertBefore(profiler_script, container.children[0]);

        var js2js_script = document.createElement('script');
        js2js_script.setAttribute("type", "application/javascript");
        js2js_script.setAttribute("src", "/js2js/js2js-lib.js");
        container.insertBefore(js2js_script, container.children[0]);

        var a = document.createElement('a');
        a.setAttribute("href", "javascript:void(0);");
        a.setAttribute("onclick", "javascript:profile$dump();");
        a.setAttribute("style", "position: absolute; top: 40px; left: 0; border: 0; color: #77777; z-index: 100;");
        a.innerHTML = 'Send profile';
        document.body.insertBefore(a, document.body.children[0]);

        var html = window.document.innerHTML;
        if (window.document.doctype) {
            html = window.document.doctype + html;
        }

        return html;
    },
};

var jsHandler = {
    accepts: function (response) {
        var content_type = getProperty(response.headers, "content-type", "");
    
        return str_startsWith(content_type, "application/javascript")
            || str_startsWith(content_type, "application/x-javascript")
            || str_startsWith(content_type, "text/javascript")
            || str_startsWith(content_type, "application/ecmascript")
            || str_startsWith(content_type, "text/ecmascript");
    },

    process: function (response, data) {
        return instrument_js(data + "\n");
    },
};

// ----- Request handlers -----

var scriptSourceHandler = {
    name : "JS2JS",

    accepts: function (request) {
        var url = parseURL(request.url);
        return request.method === 'GET' && str_startsWith(url.pathname, "/js2js/");
    },

    process: function (request, response) {
        var url = parseURL(request.url);
        var filename = url.pathname.replace('/js2js/', './include/');
        try {
            var content = fs.readFileSync(filename);
            response.writeHead(200, { 'Content-Type': 'application/javascript' });
            response.end(content);
        } catch (err) {
            response.writeHead(404);
            response.end();
        }
    },
};

var profileOutputHandler = {
    name: "PROF ",

    accepts: function (request) {
        var url = parseURL(request.url);
        return request.method === 'POST' && url.pathname === "/profile_output";
    },

    process: function (request, response) {
        var chunks = [];

        request.addListener('data', function(chunk) {
            chunks.push(chunk);
        });

        request.addListener('end', function() {
            fs.writeFileSync("profile.out", merge(chunks));
            response.end();
        });
    },
};

function ProxyHandler(handlers, filters) {
    this.name = "PROXY";
    this.handlers = handlers;
    if (filters === undefined) {
        this.filters = [];
    } else {
        this.filters = filters;
    }
}

ProxyHandler.prototype.applyFilters = function (response, data) {
    for (var i = 0; i < this.filters.length; i++) {
        var filter = this.filters[i];
        data = filter(response, data);
    }

    return data;
};

ProxyHandler.prototype.handleResponse = function (response, data) {
    for (var i = 0; i < this.handlers.length; i++) {
        var handler = this.handlers[i];
        if (handler.accepts(response)) {
            data = this.applyFilters(response, data);
            data = handler.process(response, data);
            break;
        }
    }

    return data;
};

ProxyHandler.prototype.accepts = function (request) {
    return true;
};

ProxyHandler.prototype.process = function (request, response) {
    var handler = this;

    var url = parseURL(request.url);
    var proxy = http.createClient(url.port, url.hostname);
    delete request.headers['accept-encoding'];
    var proxy_request = proxy.request(request.method, url.fullpath, request.headers);

    proxy_request.on('response', function (proxy_response) {
        var chunks = [];

        debug(request.url + " -> " + getProperty(proxy_response.headers, "content-type", "?"));

        proxy_response.addListener('data', function(chunk) {
            chunks.push(chunk);
        });

        proxy_response.addListener('end', function() {
            var data = merge(chunks);
            var content_type = getProperty(proxy_response.headers, "content-type", "");
            if (str_startsWith(content_type, "text/html") || str_startsWith(content_type, "text/javascript")) {
                 data = data.toString("utf8");
            }
            data = handler.handleResponse(proxy_response, data);

            var buffer;
            if (typeof data === "string") {
                buffer = new Buffer(data);
            } else {
                buffer = data;
            }
            proxy_response.headers["content-length"] = String(buffer.length);
            response.writeHead(proxy_response.statusCode, proxy_response.headers);
            if (buffer.length > 0) {
                response.write(buffer);
            }
            response.end();
        });
    });

    request.addListener('data', function(chunk) {
        proxy_request.write(chunk, 'binary');
    });

    request.addListener('end', function() {
        proxy_request.end();
    });
};

// ----- Server -----

function createProxyServer(handlers) {
    return http.createServer(function(request, response) {
        for (var i = 0; i < handlers.length; i++) {
            var handler = handlers[i];
            if (handler.accepts(request)) {
                info("[" + handler.name + "]: "  + request.method + " " + request.url);
                handler.process(request, response);
                break;
            }
        }
    });
}

createProxyServer([
    scriptSourceHandler,
    profileOutputHandler, 
    new ProxyHandler([
        htmlHandler,
        jsHandler
    ]),
]).listen(8080);
