var jsdom    = require('jsdom');
var path     = require('path');
var HTML5    = require('HTML5');
var helper   = require('./util');
var options  = require('./options');

jsdom.defaultDocumentFeatures = {
    FetchExternalResources   : false,
    ProcessExternalResources : false,
    MutationEvents           : false,
    QuerySelector            : false
};

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

function Instrumentation() {
    // empty
}
exports.Instrumentation = Instrumentation;

Instrumentation.prototype.documentPrefix = function (doc) {
    return undefined;
};

Instrumentation.prototype.bodyPrefix = function (doc) {
    return undefined;
};

Instrumentation.prototype.instrumentScript = function (script, filename) {
    return script;
};

Instrumentation.prototype.processHTML = function (data, filename) {
    if (!data) return data;
    var self = this;

    helper.recordHTML(data, filename);

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
            if (e.hasAttribute('type') && !helper.isJavaScript(e.getAttribute('type'))) continue;
            var script = this.processInlineScript(e.textContent, filename + "$" + i + ".js");
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
                var code = self.processAttributeScript(e, node.getAttribute(e), filename + "$" + e + eventCount++ + ".js");
                changes.push({
                    kind: "replace",
                    loc: node.attrloc[e].value,
                    value: code
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
        var doc_prefix = this.documentPrefix();
        if (doc_prefix) {
            changes.push({
                kind: "insert",
                loc: {start: container.loc.open.end, end: container.loc.open.end},
                value: doc_prefix
            });
        }
        
        var body_prefix = this.bodyPrefix();
        if (body_prefix) {
            changes.push({
                kind: "insert",
                loc: {start: document.body.loc.open.end, end: document.body.loc.open.end},
                value: body_prefix
            });
        }
    }

    var html = applyChanges(changes, data);
    helper.recordInstrumentedHTML(html, filename);

    return html;
};

Instrumentation.prototype.processScript = function (data, filename) {
    var prefix = "";
    var suffix = "";
    data = helper.trim(data);

    if (helper.str_startsWith(data, "<![CDATA[") && helper.str_endsWith(data, "]]>")) {
        prefix += data.substring(0, 9);
        suffix += data.substring(data.length - 3);
        data = data.substring(9, data.length - 3);
    } else if (helper.str_startsWith(data, "<!--") && helper.str_endsWith(data, "-->")) {
        prefix += data.substring(0, 4);
        suffix += data.substring(data.length - 3);
        data = data.substring(4, data.length - 3);
    }
    if (!helper.str_endsWith(data, "\n")) {
        data += "\n";
    }
    
    if (helper.str_startsWith(data, UNPARSEABLE_CRUFT)) {
        prefix += UNPARSEABLE_CRUFT;
        data = data.slice(UNPARSEABLE_CRUFT.length);
    }
    helper.recordSource(data, filename);
    try {
        var script = this.instrumentScript(data, filename);
    } catch (e) {
        console.log("Failed to instrument code:");
        console.log("'" + data + "'");
        console.log("--------------------");
        if (options.recordSource) {
            console.log("Data dumped to " + path.join(options.outputDir, options.origOutputDir, filename));
        }
        throw e;
    }
    helper.recordInstrumentedSource(script, filename);
    script = prefix + script + suffix + "\n\n";

    return script;
}

Instrumentation.prototype.processAttributeScript = function (attrib, script, filename) {
    var code = helper.decodeEntities(script);
    var prefix = "";
    if (helper.str_startsWith(code, "javascript:")) {
        code = code.slice(11);
        prefix = "javascript:";
    }
    code = prefix + this.processScript(code + "\n", filename);
    return '"' + helper.encodeEntities(code.replace(/[\n\r]+/g, " ")).replace(/\\/g, "&#0092;") + '"';
};

Instrumentation.prototype.processInlineScript = function (script, filename) {
    var src = helper.decodeEntities(script + "\n");
    return this.processScript(src, filename);
};

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

