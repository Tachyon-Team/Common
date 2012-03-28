var fs            = require('fs');
var http          = require('http');
var options       = require('./options');
var JS2JSProfiler = require('./profiler').JS2JSProfiler;
options.profiler  = new JS2JSProfiler();
var handlers      = require('./handlers');
var proxy         = require('./proxy');

options.parseCmdLine();

var proxy_handlers = [
    handlers.js2jsHandler,
    handlers.scriptSourceHandler,
    handlers.profileOutputHandler,
    handlers.documentWriteArgHandler,
    handlers.innerHTMLHandler,
    // PACHandler,
    new proxy.ProxyHandler([ // TODO
        handlers.htmlHandler,
        handlers.jsHandler
    ]),
];

proxy.createHTTPProxy(proxy_handlers).listen(options.httpPort);
proxy.createHTTPSProxy(proxy_handlers).listen(options.httpsPort);

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

proxy.connect_handler.listen(options.httpsProxyPort); // TODO: refactor
