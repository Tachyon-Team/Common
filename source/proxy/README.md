HTTP Proxy
==========

The proxy allows HTTP communication to javascript code to be intercepted and instrumented before being interpreted by a web browser.

Requirements
------------

* node.js (>=v0.6.8)
* npm (to install other dependencies)

Installation
------------

In a terminal, run ```./install```.

Usage
-----

In a terminal, run the ```run-proxy``` command. ```run-proxy``` currently accepts the following options :

* ```--record-js```: Records the original version of each instrumented javascript file (off by default)
* ```-d``` or ```--output-dir```: specifies the directory where the output should be saved (```output``` by default)
* ```--debug```: Starts node.js in debug mode (useful for attaching a remote debugger)
* ```--http-port```: Configures the port used by the HTTP proxy (default: 8080)
* ```--https-port```: Configures the port used by the HTTPS proxy (default: 8443)
* ```--pac-port```: Configures the port used by the proxy autoconfiguration server (PAC) (default: 9000)

### Configuring the browser

The default proxy implementation listens for HTTP traffic on port 8080, and for HTTPS (SSL) traffic on port 8443. Web browsers should therefore be configured to proxy using these ports.

Alternatively, browsers can use the autoconfiguration URL (by default localhost:9000) to perform the configuration automatically.

### Recording a profile

By default, the proxy will add a 'Send profile' link to web pages that it instruments. Clicking this link will send the collected data to the proxy server, which will then output it in its output directory (see command-line options, above).
