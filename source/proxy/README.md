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