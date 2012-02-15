var net      = require('net');
var http     = require('http');
var https    = require('https');
var path     = require('path');
var jsdom    = require('jsdom');
var fs       = require('fs');
var Buffer   = require('buffer').Buffer;
var buffers  = require('buffertools');
var URL      = require('url');
var querystr = require('querystring');
var js2js    = require('js2js');

var DEBUG = false;

var options = {
    pacPort: 9000,
    httpPort: 8080,
    httpsPort: 8081,
    httpsProxyPort: 8443,
    recordSource: false,
    recordInstrumentedSource: false,
    js2jsOptions: {
        profile: true,
        debug: true,
    },

    key: fs.readFileSync('./data/key.pem'),
    cert: fs.readFileSync('./data/cert.pem'),

    outputDir: "output",
};

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

function parseURL(url, protocol) {
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
}

function send_html(request, response, data, options) {
    var buffer;
    if (typeof data === "string") {
        buffer = new Buffer(data);
    } else {
        buffer = data;
    }
    proxy_response.headers["content-length"] = String(buffer.length);

    // Disable caching
    var cache_control = [];
    if ("cache-control" in proxy_response.headers) {
        cache_control = proxy_response.headers["cache-control"].split(",");
        for (var i = cache_control.length-1; i >= 0; i--) {
            var value = cache_control[i].trim();
            if (value === "public" || value === "private") {
                delete cache_control[i];
            }
        }
    }
    cache_control.push("no-cache");
    cache_control.push("must-revalidate");
    proxy_response.headers["cache-control"] = cache_control.join(",");

    response.writeHead(proxy_response.statusCode, proxy_response.headers);
    if (buffer.length > 0) {
        response.write(buffer);
    }
    response.end();
}

// ----- Response handlers -----

var UNPARSEABLE_CRUFT = "throw 1; < don't be evil' >"; // For handling google XSS security stuff

var htmlEvents = [
    "onload",
    "onunload",

    "onblur",
    "onchange",
    "onfocus",
    "onreset",
    "onselect",
    "onsubmit",

    "onabort",

    "onkeydown",
    "onkeypress",
    "onkeyup",

    "onclick",
    "ondblclick",
    "onmousedown",
    "onmousemove",
    "onmouseout",
    "onmouseover",
    "onmouseup",
];

function traverseDOM(root, f) {
    if (!f) return;
    if (!root) return;

    f(root);
    var children = root.childNodes;
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        traverseDOM(child, f);
    }
}

function instrument_html(data, filename) {
    if (!data) return data;

    var window = jsdom.jsdom(data).createWindow();
    var document = window.document;

    // Instrument existing scripts
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
        var e = scripts[i];
        if (!e.hasAttribute('src')) {
            var src = decodeEntities(e.innerHTML + "\n");
            var script = instrument_js(src, filename + "$" + i + ".js");
            e.innerHTML = encodeEntities(script);
        }
    }

    var eventCount = 0;
    // Instrument JS found in tag attributes
    traverseDOM(document, function (node) {
        if (! ("hasAttribute" in node)) {
            return; // Skip text nodes etc.
        }
        for (var i = 0; i < htmlEvents.length; i++) {
        var e = htmlEvents[i];
            if (node.hasAttribute(e)) {
                var code = node.getAttribute(e);
                var prefix = "";
                if (str_startsWith(code, "javascript:")) {
                    code = code.slice(11);
                    prefix = "javascript:";
                }
                code = prefix + instrument_js(code + "\n", filename + "$" + e + eventCount++ + ".js");
                node.setAttribute(e, code.replace(/[\n\r]+/g, ""));
            }
        }
    });

    
    var container;
    if (document.head) {
        container = document.head;
    } else if (document.body) {
        container = document.body;
    } else {
        // Guard against empty documents and fragments
        return document.innerHTML;
    }

    var profiler_script = document.createElement('script');
    profiler_script.setAttribute("type", "application/javascript");
    profiler_script.setAttribute("src", "/js2js/profiler-lib.js");
    container.insertBefore(profiler_script, container.children[0]);

    var js2js_script = document.createElement('script');
    js2js_script.setAttribute("type", "application/javascript");
    js2js_script.setAttribute("src", "/js2js/js2js-lib.js");
    container.insertBefore(js2js_script, container.children[0]);

    var a = document.createElement('a');
    a.setAttribute("id", "proxy_send_profile_link");
    a.setAttribute("href", "javascript:void(0);");
    a.setAttribute("onclick", "javascript:profile$dump();");
    a.setAttribute("style", "position: absolute; top: 40px; left: 0; border: 0; color: #777777; z-index: 100;");
    a.innerHTML = 'Send profile';
    document.body.insertBefore(a, document.body.children[0]);

    var html = document.innerHTML;
    if (window.document.doctype) {
        html = window.document.doctype + html;
    }

    return html;
}

function instrument_js(data, filename) {
    var prefix = null;
    if (str_startsWith(data, UNPARSEABLE_CRUFT)) {
        prefix = UNPARSEABLE_CRUFT;
        data = data.slice(UNPARSEABLE_CRUFT.length);
    }
    recordSource(data, filename);
    options.js2jsOptions.filename = filename;
    try {
        var script = js2js.instrument(data, options.js2jsOptions);
    } catch (e) {
        console.log("Failed to instrument code:");
        console.log(data);
        console.log("--------------------");
        throw e;
    }
    recordInstrumentedSource(script, filename);
    if (prefix !== null) {
        script = prefix + script;
    }
    return script;
}

function recordSource(scriptSource, filename) {
    if (options.recordSource) {
        var d = options.outputDir;
        try {
            var stat = fs.statSync(d);
            if (!stat.isDirectory()) throw "Output directory exists, but is not a directory";
        } catch (e) {
            fs.mkdirSync(d, 0755);
        }
        fs.writeFileSync(d + "/" + filename, scriptSource);
    }
}

function recordInstrumentedSource(scriptSource, filename) {
    if (options.recordInstrumentedSource) {
        var d = options.outputDir;
        try {
            var stat = fs.statSync(d);
            if (!stat.isDirectory()) throw "Output directory exists, but is not a directory";
        } catch (e) {
            fs.mkdirSync(d, 0755);
        }
        fs.writeFileSync(d + "/" + filename + ".instrumented", scriptSource);
    }
}

var htmlHandler = {
    pageCount: 0,

    accepts: function (request, response) {
        var content_type = getProperty(response.headers, "content-type", "");
        return str_startsWith(content_type, "text/html");
    },

    process: function (request, response, data) {
        return instrument_html(data, "page" + this.pageCount++);
        if (!data) return data;

        var window = jsdom.jsdom(data).createWindow();
        var document = window.document;

        // Instrument existing scripts
        var scripts = document.getElementsByTagName('script');
        var filename = "page" + this.pageCount++;
        for (var i = 0; i < scripts.length; i++) {
            var e = scripts[i];
            if (!e.hasAttribute('src')) {
                var src = decodeEntities(e.innerHTML + "\n");
                var script = instrument_js(src, filename + "$" + i + ".js");
                e.innerHTML = encodeEntities(script);
            }
        }

        var self = this;


        var eventCount = 0;
        // Instrument JS found in tag attributes
        this.traverseDOM(window.document, function (node) {
            if (! ("hasAttribute" in node)) {
                return; // Skip text nodes etc.
            }
            for (var i = 0; i < self.htmlEvents.length; i++) {
                var e = self.htmlEvents[i];
                if (node.hasAttribute(e)) {
                    var code = node.getAttribute(e);
                    var prefix = "";
                    if (str_startsWith(code, "javascript:")) {
                        code = code.slice(11);
                        prefix = "javascript:";
                    }
                    code = prefix + instrument_js(code + "\n", filename + "$" + e + eventCount++ + ".js");
                    node.setAttribute(e, code.replace(/[\n\r]+/g, ""));
                }
            }
        });

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
        a.setAttribute("id", "proxy_send_profile_link");
        a.setAttribute("href", "javascript:void(0);");
        a.setAttribute("onclick", "javascript:profile$dump();");
        a.setAttribute("style", "position: absolute; top: 40px; left: 0; border: 0; color: #777777; z-index: 100;");
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
    accepts: function (request, response) {
        var content_type = getProperty(response.headers, "content-type", "");
    
        return str_startsWith(content_type, "application/javascript")
            || str_startsWith(content_type, "application/x-javascript")
            || str_startsWith(content_type, "text/javascript")
            || str_startsWith(content_type, "application/ecmascript")
            || str_startsWith(content_type, "text/ecmascript");
    },

    process: function (request, response, data) {
        var url = parseURL(request.url);
        var scriptName = path.basename(url.pathname);
        return instrument_js(data + "\n", "script_" + scriptName);
    },
};

// ----- Request handlers -----

var js2jsHandler = {
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
        return request.method === 'POST' && str_endsWith(url.pathname, "/profile_output");
    },

    process: function (request, response) {
        var chunks = [];

        request.addListener('data', function(chunk) {
            chunks.push(chunk);
        });

        request.addListener('end', function() {
            fs.writeFileSync(options.outputDir + "/profile", merge(chunks));
            response.writeHead(200, { 'Content-Type': 'text/plain' });
            response.end("done\n");
        });
    },
};

var documentWriteArgHandler = {
    name: "DOCWR",
    nextID: 0,


    accepts: function (request) {
        var url = parseURL(request.url);
        return request.method === 'POST' && str_endsWith(url.pathname, "/document_write_arg");
    },

    process: function (request, response) {
        var chunks = [];
        var self = this;

        request.addListener('data', function(chunk) {
            chunks.push(chunk);
        });

        request.addListener('end', function() {
            fs.writeFileSync(options.outputDir + "/docwrite" + self.nextID, merge(chunks));
            self.nextID += 1;
            response.writeHead(200, { 'Content-Type': 'text/plain' });
            response.end("done\n");
        });
    },
};

var scriptSourceHandler = {
    name: "SCRIPT",

    accepts: function (request) {
        var url = parseURL(request.url);
        return request.method === 'POST' && str_endsWith(url.pathname, "/proxy$scriptSource");
    },

    process: function (request, response) {
        var chunks = [];

        request.addListener('data', function(chunk) {
            chunks.push(chunk);
        });

        request.addListener('end', function() {
            var url = parseURL(request.url);
            var filename = url.query.replace('filename=', '');
            recordSource(merge(chunks), filename);
            response.writeHead(200, { 'Content-Type': 'text/plain' });
            response.end("done\n");
        });
    },
};

var PACHandler = {
    name: "PAC  ",

    accepts: function (request) {
        var url = parseURL(request.url);
        return request.method === 'GET' && str_endsWith(url.pathname, "/proxy$config.pac");
    },

    process: function (request, response) {
        var pac = fs.readFileSync('./data/proxy.pac').toString();
        pac = pac.replace("${PROXY_HTTP_PORT}", String(options.httpPort));
        pac = pac.replace("${PROXY_HTTPS_PORT}", String(options.httpsProxyPort));

        response.writeHead(200, {
                'Content-Type': 'application/javascript',
                'content-length': String(pac.length) 
        });

        response.end(pac);
    },
}

var innerHTMLHandler = {
    name: "iHTML",
    nextID: 0,

    accepts: function (request) {
        var url = parseURL(request.url);
        return request.method === 'POST' && str_endsWith(url.pathname, "/proxy$innerHTML");
    },

    process: function (request, response) {
        var chunks = [];
        var self = this;

        request.addListener('data', function(chunk) {
            chunks.push(chunk);
        });

        request.addListener('end', function() {
            var url = parseURL(request.url);
            var args = querystr.parse(url.query);
            var data = merge(chunks).toString("utf-8");
            var id = self.nextID++;
            //recordSource(data, "innerhtml" + id);
            var instrumented_val;
            var content_type;
            if (args.mode === "js") {
                content_type = "text/javascript";
                instrumented_val = instrument_js(data, "innerhtml" + id + ".js");
            } else {
                content_type = "text/html";
                instrumented_val = instrument_html(data, "innerhtml" + id);
            }

            var buffer;
            if (typeof instrumented_val === "string") {
                buffer = new Buffer(instrumented_val);
            } else {
                buffer = instrumented_val;
            }
            //recordInstrumentedSource(data, "innerhtml" + id);

            response.writeHead(200, {
                'Content-Type': content_type,
                'content-length': String(buffer.length) 

            });

            response.end(instrumented_val);
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

ProxyHandler.prototype.handleResponse = function (request, response, data) {
    for (var i = 0; i < this.handlers.length; i++) {
        var handler = this.handlers[i];
        if (handler.accepts(request, response)) {
            data = this.applyFilters(response, data);
            data = handler.process(request, response, data);
            break;
        }
    }

    return data;
};

ProxyHandler.prototype.accepts = function (request) {
    return true;
};

ProxyHandler.prototype.process = function (request, response, proxyObj) {
    var handler = this;
    var protocol = proxyObj.protocol;

    var url = parseURL(request.url, protocol);
    delete request.headers['accept-encoding'];
    var requestOptions = {
        host: url.hostname,
        port: url.port,
        path: url.fullpath,
        method: url.method,
        headers: request.headers,
        agent: new protocol.Agent({ host: url.hostname, port: url.port, maxSockets: 1 }),
        key: options.key,   // for https
        cert: options.cert, // for https
    };

    var proxy_request = protocol.request(requestOptions, requestHandler);
    
    function requestHandler(proxy_response) {
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
            data = handler.handleResponse(request, proxy_response, data);

            var buffer;
            if (typeof data === "string") {
                buffer = new Buffer(data);
            } else {
                buffer = data;
            }
            proxy_response.headers["content-length"] = String(buffer.length);

            // Disable caching
            var cache_control = [];
            if ("cache-control" in proxy_response.headers) {
                cache_control = proxy_response.headers["cache-control"].split(",");
                for (var i = cache_control.length-1; i >= 0; i--) {
                    var value = cache_control[i].trim();
                    if (value === "public" || value === "private") {
                        delete cache_control[i];
                    }
                }
            }
            cache_control.push("no-cache");
            cache_control.push("must-revalidate");
            proxy_response.headers["cache-control"] = cache_control.join(",");

            response.writeHead(proxy_response.statusCode, proxy_response.headers);
            if (buffer.length > 0) {
                response.write(buffer);
            }
            response.end();
        });
    }

    request.addListener('data', function(chunk) {
        proxy_request.write(chunk, 'binary');
    });

    request.addListener('end', function() {
        proxy_request.end();
    });
};

// ----- Server -----

function Proxy(protocol, handlers) {
    this.protocol = protocol;
    this.handlers = handlers;
}

Proxy.prototype.process = function (request, response) {
    for (var i = 0; i < this.handlers.length; i++) {
        var handler = this.handlers[i];
        if (handler.accepts(request)) {
            info("[" + handler.name + "]: "  + request.method + " " + request.url);
            handler.process(request, response, this);
            return;
        }
    }

    info("[--?--]: " + request.method + " " + request.url);
};

function createHTTPProxy(handlers) {
    var proxy = new Proxy(http, handlers);

    return http.createServer(function(request, response) {
        proxy.process(request, response);
    });
}

function createHTTPSProxy(handlers) {
    var proxy = new Proxy(https, handlers);
    var serverOptions = {
        key: options.key,
        cert: options.cert,
    };

    return https.createServer(serverOptions, function(request, response) {
        proxy.process(request, response);
    });
}

// Crude support for HTTP CONNECT protocol

var connect_handler = net.createServer(function (client) {
    function initiateConnection(data) {
        // console.log("< " + data);
        if (data.toString().slice(0, 7) === "CONNECT") {
            client.removeListener('data', initiateConnection);
            debug("Establishing SSL connection");
            var server = net.createConnection(options.httpsPort);

            client.write("HTTP/1.1 200 Connection established\r\n");
            client.write("\r\n");

            // client.on('end', function () { console.log("Client done"); });
            // server.on('end', function () { client.destroy(); console.log("Server done"); });

            client.pipe(server);
            server.pipe(client);
        } 
    }

    client.on('data', initiateConnection);
});

function parseCmdLine(argv) {
    if (argv.length <= 2) return;

    for (var i = 2; i < argv.length; i++) {
        var arg = argv[i];
        if (arg === "--record-js") {
            options.recordSource = true;
            options.recordInstrumentedSource = true;
        } else if (arg === "-d" || arg === "--output-dir") {
            options.outputDir = argv[++i];
        } else if (arg === "--pac-port") {
            options.pacPort = parseFloat(argv[++i]);
        } else if (arg === "--http-port") {
            options.httpPort = parseFloat(argv[++i]);
        } else if (arg === "--https-port") {
            options.httpsProxyPort = parseFloat(argv[++i]);
        } else {
            throw "Unrecognized option: " + argv[i];
        }
    }
}

parseCmdLine(process.argv);

var proxy_handlers = [
    js2jsHandler,
    scriptSourceHandler,
    profileOutputHandler,
    documentWriteArgHandler,
    innerHTMLHandler,
    // PACHandler,
    new ProxyHandler([
        htmlHandler,
        jsHandler
    ]),
];

createHTTPProxy(proxy_handlers).listen(options.httpPort);
createHTTPSProxy(proxy_handlers).listen(options.httpsPort);

http.createServer(function (req, res) {
    var pac = fs.readFileSync('./data/proxy.pac').toString();
    pac = pac.replace("${PROXY_HTTP_PORT}", String(options.httpPort));
    pac = pac.replace("${PROXY_HTTPS_PORT}", String(options.httpsProxyPort));

    res.writeHead(200, {
        'Content-Type': 'application/javascript',
        'content-length': String(pac.length) 
    });

    res.end(pac);
}).listen(options.pacPort);

connect_handler.listen(options.httpsProxyPort);
