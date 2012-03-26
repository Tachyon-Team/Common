var net      = require('net');
var http     = require('http');
var https    = require('https');
var path     = require('path');
var jsdom    = require('jsdom');
var HTML5    = require('HTML5');
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
    recordHTML: false,
    recordInstrumentedHTML: false,
    js2jsOptions: {
        profile: true,
        debug: true,
        stringQuote: "'",
        quoteAll: true
    },

    key: fs.readFileSync('./data/key.pem'),
    cert: fs.readFileSync('./data/cert.pem'),

    outputDir: "output",

    // Dynamic options
    enableLogging: false
};

jsdom.defaultDocumentFeatures = {
    FetchExternalResources   : false,
    ProcessExternalResources : false,
    MutationEvents           : false,
    QuerySelector            : false
};

// ----- Helper functions -----

function isJavaScript(contentType) {
    return contentType === "application/javascript"
            || contentType === "application/x-javascript" 
            || contentType === "application/x-javascript"
            || contentType === "text/javascript"
            || contentType === "application/ecmascript"
            || contentType === "text/ecmascript";
}

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
 
function encodeEntities(string) {
    return string.replace(/([\&"<>])/g, function(str, item) {
        return xml_special_to_escaped[item];
    });
};
 
function decodeEntities(string) {
    return string.replace(/(&lt;|&gt;|&quot;|&amp;)/g,
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

function parseHTML(data) {
    // Pure jsdom version
    // jsdom.jsdom(data).createWindow();
    
    // html5 version
    var window = jsdom.jsdom('', null, {parser: HTML5}).createWindow();
    var parser = new HTML5.Parser({document: window.document});
    try {
        parser.parse(data);
    } catch (e) {
        console.log("Failed to parse HTML data:");
        //console.log("'" + data + "'");
        console.log("--------------------");
        // if (options.record) {
        //     console.log("Data dumped to " + options.outputDir + "/" + filename);
        // }
        throw e;
    }
    window.document.is_fragment = parser.is_fragment;
    return window;
}

function stable_sort(o, comparefn)
{
    var len = o.length;

    /* Iterative mergesort algorithm */

    if (len >= 2)
    {
        /* Sort pairs in-place */

        for (var start=((len-2)>>1)<<1; start>=0; start-=2)
        {
            if (comparefn(o[start], o[start+1]) > 0)
            {
                var tmp = o[start];
                o[start] = o[start+1];
                o[start+1] = tmp;
            }
        }

        if (len > 2)
        {
            /*
             * For each k>=1, merge each pair of groups of size 2^k to
             * form a group of size 2^(k+1) in a second array.
             */

            var a1 = o;
            var a2 = new Array(len);

            var k = 1;
            var size = 2;

            do
            {
                var start = ((len-1)>>(k+1))<<(k+1);
                var j_end = len;
                var i_end = start+size;

                if (i_end > len)
                    i_end = len;

                while (start >= 0)
                {
                    var i = start;
                    var j = i_end;
                    var x = start;

                    for (;;)
                    {
                        if (i < i_end)
                        {
                            if (j < j_end)
                            {
                                if (comparefn(a1[i], a1[j]) > 0)
                                    a2[x++] = a1[j++];
                                else
                                    a2[x++] = a1[i++];
                            }
                            else
                            {
                                while (i < i_end)
                                    a2[x++] = a1[i++];
                                break;
                            }
                        }
                        else
                        {
                            while (j < j_end)
                                a2[x++] = a1[j++];
                            break;
                        }
                    }

                    j_end = start;
                    start -= 2*size;
                    i_end = start+size;
                }

                var t = a1;
                a1 = a2;
                a2 = t;

                k++;
                size *= 2;
            } while (len > size);

            if ((k & 1) === 0)
            {
                /* Last merge was into second array, so copy it back to o. */

                for (var i=len-1; i>=0; i--)
                    o[i] = a1[i];
            }
        }
    }

    return o;
}

function applyChanges(changes, data) {
    changes = stable_sort(changes, function (c1, c2) {
        return c1.loc.start - c2.loc.start;
    });
    var parts = [];

    var pos = 0;
    for (var i = 0; i < changes.length; i++) {
        var c = changes[i];
        if (c.loc.start > pos) {
            parts.push(data.substring(pos, c.loc.start));
            pos = c.loc.start;
        }
        switch (c.kind) {
            case "replace":
                parts.push(c.value);
                pos = c.loc.end;
                break;
            case "insert":
                parts.push(c.value);
                break;
            default:
                throw "Unknown change kind: " + c.kind;
        }
    }

    if (pos < data.length) {
        parts.push(data.substring(pos));
    }

    return parts.join("");
}

function instrument_html(data, filename) {
    if (!data) return data;

    recordHTML(data, filename);

    var changes = [];

    //var window = jsdom.jsdom(null, null, {parser: HTML5}).createWindow()
    //var parser = new HTML5.Parser({document: window.document});
    //parser.parse(data);

    var window = parseHTML(data);
    var document = window.document;

    // Instrument existing scripts
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
        var e = scripts[i];
        if (!e.hasAttribute('src')) {
            if (e.hasAttribute('type') && !isJavaScript(e.getAttribute('type'))) continue;
            var src = decodeEntities(e.textContent + "\n");
            var script = instrument_js(src, filename + "$" + i + ".js");
            changes.push({
                kind: "replace",
                loc: {
                    start: e.loc.open.end,
                    end: e.loc.close.start
                },
                value: script,
            });
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
                var code = decodeEntities(node.getAttribute(e));
                var prefix = "";
                if (str_startsWith(code, "javascript:")) {
                    code = code.slice(11);
                    prefix = "javascript:";
                }
                code = prefix + instrument_js(code + "\n", filename + "$" + e + eventCount++ + ".js");
                changes.push({
                    kind: "replace",
                    loc: node.attrloc[e].value,
                    value: '"' + encodeEntities(code.replace(/[\n\r]+/g, " ")).replace(/\\/g, "&#0092;") + '"'
                });
            }
        }
    });

    
    var container;
    if (document.head.loc) {
        // Full page with head
        container = document.head;
    } else if (document.body.loc) {
        // Full page with body but no head
        container = document.body;
    } else {
        // HTML fragment (no head, no body)
        container = null;
    }

    if (container) {
        var profiler_lib_script = '<script type="application/javascript" src="/js2js/profiler-lib.js"></script>';
        changes.push({
            kind: "insert",
            loc: {start: container.loc.open.end, end: container.loc.open.end},
            value: profiler_lib_script
        });

        if (options.enableLogging) {
            var logging_enabler_script = '<script type="application/javascript">profile$enableLogging();</script>';
            changes.push({
                kind: "insert",
                loc: {start: container.loc.open.end, end: container.loc.open.end},
                value: logging_enabler_script
            });
        }

        var js2js_script = '<script type="application/javascript" src="/js2js/js2js-lib.js"></script>';

        changes.push({
            kind: "insert",
            loc: {start: container.loc.open.end, end: container.loc.open.end},
            value: js2js_script
        });

        var send_profile_link = '<a id="proxy_send_profile_link" href="javascript:void(0);"' +
                                    ' onclick="javascript:profile$dump();"' +
                                    ' style="position: absolute; top: 40px; left: 0; border: 0; color: #777777; z-index: 9999;">Send profile</a>';
        changes.push({
            kind: "insert",
            loc: {start: document.body.loc.open.end, end: document.body.loc.open.end},
            value: send_profile_link
        });
    }

    var html = applyChanges(changes, data);
    recordInstrumentedHTML(html, filename + ".instrumented");

    return html;
}

function instrument_js(data, filename) {
    var prefix = "";
    var suffix = "";
    data = trim(data);

    if (str_startsWith(data, "<![CDATA[") && str_endsWith(data, "]]>")) {
        prefix += data.substring(0, 9);
        suffix += data.substring(data.length - 3);
        data = data.substring(9, data.length - 3);
    } else if (str_startsWith(data, "<!--") && str_endsWith(data, "-->")) {
        prefix += data.substring(0, 4);
        suffix += data.substring(data.length - 3);
        data = data.substring(4, data.length - 3);
    }
    if (!str_endsWith(data, "\n")) {
        data += "\n";
    }
    
    if (str_startsWith(data, UNPARSEABLE_CRUFT)) {
        prefix += UNPARSEABLE_CRUFT;
        data = data.slice(UNPARSEABLE_CRUFT.length);
    }
    recordSource(data, filename);
    options.js2jsOptions.filename = filename;
    try {
        var script = js2js.instrument(data, options.js2jsOptions);
    } catch (e) {
        console.log("Failed to instrument code:");
        console.log("'" + data + "'");
        console.log("--------------------");
        if (options.recordSource) {
            console.log("Data dumped to " + options.outputDir + "/" + filename);
        }
        throw e;
    }
    recordInstrumentedSource(script, filename);
    script = prefix + script + suffix + "\n\n";

    return script;
}

exports.instrument_html = instrument_html;
exports.instrument_js = instrument_js;

function recordOutput(data, filename) {
    var d = options.outputDir;
    try {
        var stat = fs.statSync(d);
        if (!stat.isDirectory()) throw "Output directory exists, but is not a directory";
    } catch (e) {
        fs.mkdirSync(d, 0755);
    }
    fs.writeFileSync(d + "/" + filename, data);
}

function recordSource(scriptSource, filename) {
    if (options.recordSource) {
       recordOutput(scriptSource, filename);
    }
}

function recordInstrumentedSource(scriptSource, filename) {
    if (options.recordInstrumentedSource) {
       recordOutput(scriptSource, filename);
    }
}

function recordHTML(html, filename) {
    if (options.recordHTML) {
        recordOutput(html, filename);
    }
}

function recordInstrumentedHTML(html, filename) {
    if (options.recordInstrumentedHTML) {
        recordOutput(html, filename);
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
    },
};

var jsHandler = {
    accepts: function (request, response) {
        var content_type = getProperty(response.headers, "content-type", "");
        return isJavaScript(content_type);
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
            recordOutput(merge(chunks), "profile");
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
            recordOutput(merge(chunks), "docwrite" + self.nextID);
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
            if (str_startsWith(content_type, "text/html") || isJavaScript(content_type)) {
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
        } else if (arg === "--record-html") {
            options.recordHTML = true;
            options.recordInstrumentedHTML = true;
        } else if (arg === "-d" || arg === "--output-dir") {
            options.outputDir = argv[++i];
        } else if (arg === "--pac-port") {
            options.pacPort = parseFloat(argv[++i]);
        } else if (arg === "--http-port") {
            options.httpPort = parseFloat(argv[++i]);
        } else if (arg === "--https-port") {
            options.httpsProxyPort = parseFloat(argv[++i]);
        } else if (arg === "--enable-log") {
            options.enableLogging = true;
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
