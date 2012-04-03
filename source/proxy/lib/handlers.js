var fs       = require('fs');
var path     = require('path');
var Buffer   = require('buffer').Buffer;
var querystr = require('querystring');
var helper   = require('./util');
var options  = require('./options');

exports.htmlHandler = {
    pageCount: 0,

    accepts: function (request, response) {
        var content_type = helper.getProperty(response.headers, "content-type", "");
        return helper.str_startsWith(content_type, "text/html");
    },

    process: function (request, response, data) {
        return options.profiler.processHTML(data.toString('utf-8'), "page" + this.pageCount++);
    },
};

exports.jsHandler = {
    accepts: function (request, response) {
        var content_type = helper.getProperty(response.headers, "content-type", "");
        return helper.isJavaScript(content_type);
    },

    process: function (request, response, data) {
        var url = helper.parseURL(request.url);
        var scriptName = path.basename(url.pathname);
        return options.profiler.processScript(data + "\n", "script_" + scriptName);
    },
};

exports.js2jsHandler = {
    name : "JS2JS",

    accepts: function (request) {
        var url = helper.parseURL(request.url);
        return request.method === 'GET' && helper.str_startsWith(url.pathname, "/js2js/");
    },

    process: function (request, response) {
        var url = helper.parseURL(request.url);
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

exports.profileOutputHandler = {
    name: "PROF ",

    accepts: function (request) {
        var url = helper.parseURL(request.url);
        return request.method === 'POST' && helper.str_endsWith(url.pathname, "/profile_output");
    },

    process: function (request, response) {
        var chunks = [];

        request.addListener('data', function(chunk) {
            chunks.push(chunk);
        });

        request.addListener('end', function() {
            helper.recordOutput(helper.merge(chunks), "profile");
            response.writeHead(200, { 'Content-Type': 'text/plain' });
            response.end("done\n");
        });
    },
};

exports.documentWriteArgHandler = {
    name: "DOCWR",
    nextID: 0,


    accepts: function (request) {
        var url = helper.parseURL(request.url);
        return request.method === 'POST' && helper.str_endsWith(url.pathname, "/document_write_arg");
    },

    process: function (request, response) {
        var chunks = [];
        var self = this;

        request.addListener('data', function(chunk) {
            chunks.push(chunk);
        });

        request.addListener('end', function() {
            helper.recordOutput(helper.merge(chunks), "docwrite" + self.nextID);
            self.nextID += 1;
            response.writeHead(200, { 'Content-Type': 'text/plain' });
            response.end("done\n");
        });
    },
};

exports.scriptSourceHandler = {
    name: "SCRIPT",

    accepts: function (request) {
        var url = helper.parseURL(request.url);
        return request.method === 'POST' && helper.str_endsWith(url.pathname, "/proxy$scriptSource");
    },

    process: function (request, response) {
        var chunks = [];

        request.addListener('data', function(chunk) {
            chunks.push(chunk);
        });

        request.addListener('end', function() {
            var url = helper.parseURL(request.url);
            var filename = url.query.replace('filename=', '');
            helper.recordSource(helper.merge(chunks), filename);
            response.writeHead(200, { 'Content-Type': 'text/plain' });
            response.end("done\n");
        });
    },
};

exports.innerHTMLHandler = {
    name: "iHTML",
    nextID: 0,

    accepts: function (request) {
        var url = helper.parseURL(request.url);
        return request.method === 'POST' && helper.str_endsWith(url.pathname, "/proxy$innerHTML");
    },

    process: function (request, response) {
        var chunks = [];
        var self = this;

        request.addListener('data', function(chunk) {
            chunks.push(chunk);
        });

        request.addListener('end', function() {
            var url = helper.parseURL(request.url);
            var args = querystr.parse(url.query);
            var data = helper.merge(chunks).toString("utf-8");
            var id = self.nextID++;
            var instrumented_val;
            var content_type;
            var fn = "innerhtml" + id;
            if (args.mode === "js") {
                content_type = "text/javascript";
                fn += ".js";
                helper.recordSource(data, fn);
                instrumented_val = options.profiler.processScript(data, fn);
                helper.recordInstrumentedSource(instrumented_val, fn);
            } else {
                content_type = "text/html";
                fn += ".html";
                helper.recordHTML(data, fn);
                instrumented_val = options.profiler.processHTML(data, fn);
                helper.recordInstrumentedHTML(instrumented_val, fn);
            }

            var buffer;
            if (typeof instrumented_val === "string") {
                buffer = new Buffer(instrumented_val);
            } else {
                buffer = instrumented_val;
            }

            response.writeHead(200, {
                'Content-Type': content_type,
                'content-length': String(buffer.length) 

            });

            response.end(instrumented_val);
        });
    },
};
