var net     = require('net');
var http    = require('http');
var https   = require('https');
var options = require('./options');
var helper  = require('./util');

function ProxyHandler(handlers, filters) {
    this.name = "PROXY";
    this.handlers = handlers;
    if (filters === undefined) {
        this.filters = [];
    } else {
        this.filters = filters;
    }
}
exports.ProxyHandler = ProxyHandler;

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

    var url = helper.parseURL(request.url, protocol);
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

        helper.debug(request.url + " -> " + helper.getProperty(proxy_response.headers, "content-type", "?"));

        proxy_response.addListener('data', function(chunk) {
            chunks.push(chunk);
        });

        proxy_response.addListener('end', function() {
            var data = helper.merge(chunks);
            var content_type = helper.getProperty(proxy_response.headers, "content-type", "");
            if (helper.isHTML(content_type) || helper.isJavaScript(content_type)) {
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
exports.Proxy = Proxy;

Proxy.prototype.process = function (request, response) {
    for (var i = 0; i < this.handlers.length; i++) {
        var handler = this.handlers[i];
        if (handler.accepts(request)) {
            helper.info("[" + helper.str_rpad(handler.name, 5) + "]: "  + request.method + " " + request.url);
            handler.process(request, response, this);
            return;
        }
    }

    helper.info("[--?--]: " + request.method + " " + request.url);
};

exports.createHTTPProxy = function (handlers) {
    var proxy = new Proxy(http, handlers);

    return http.createServer(function(request, response) {
        proxy.process(request, response);
    });
};

exports.createHTTPSProxy = function (handlers) {
    var proxy = new Proxy(https, handlers);
    var serverOptions = {
        key: options.key,
        cert: options.cert,
    };

    return https.createServer(serverOptions, function(request, response) {
        proxy.process(request, response);
    });
};

// Crude support for HTTP CONNECT protocol

exports.connect_handler = net.createServer(function (client) {
    function initiateConnection(data) {
        // console.log("< " + data);
        if (data.toString().slice(0, 7) === "CONNECT") {
            client.removeListener('data', initiateConnection);
            helper.debug("Establishing SSL connection");
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
