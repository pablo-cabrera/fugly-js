(function (node) {
    "use strict";

    /**
     * Returns a new fugly template instance
     *
     * @static
     * @method fugly
     * @for fugly
     *
     * @param {string} template
     *
     * @return {fugly.Template}
     */
    var api = function (template) {
        return new api.Template(template);
    };

    var Token = {
        startCode: "<$",
        endCode: "$>"
    };

    var ChunkType = {
        code: {},
        text: {},
        expr: {}
    };

    /**
     * Quote function stripped of json2.org
     * @see http://json.org
     */
    var quote = (function () {
        var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        var meta = {
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"": "\\\"",
            "\\": "\\\\"
        };

        return function (string) {
            escapable.lastIndex = 0;
            return escapable.test(string) ? "\"" + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === "string"? c:
                    "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
            }) + "\"": "\"" + string + "\"";
        };
    }());

    var entities = function (text) {
        return String(text).replace(/[\u00A0-\u9999<>\&]/gim, function (c) {
            return "&#" + c.charCodeAt(0) + ";";
        });
    };

    var entitify = function (v) {
        if (v === null) {
            return null;
        }

        var toString = Object.prototype.toString.call(v);

        if (toString === "[object Array]") {
            return v.map(entitify);
        }

        if (typeof v === "object") {
            var r = {};
            for (var p in v) {
                r[p] = entitify(v[p]);
            }
            return r;
        }

        return toString === "[object String]"? entities(v): v;
    };

    var parse = function (body) {
        var currentChunk = {
            type: ChunkType.text,
            content: ""
        };
        var chunks = [];
        var pos;
        var nextType;

        do {
            nextType = null;
            if (currentChunk.type === ChunkType.text) {
                pos = body.indexOf(Token.startCode);
                if (pos > -1) {
                    nextType = body.indexOf(Token.startCode + "=") === pos?
                            ChunkType.expr: ChunkType.code;
                }
            } else {
                pos = body.indexOf(Token.endCode);
                if (pos > -1) {
                    nextType = ChunkType.text;
                }
            }

            if (nextType) {
                currentChunk.content = body.substr(0, pos);
                body = body.substr(pos + Token.startCode.length +
                        (nextType === ChunkType.expr? 1: 0));
            } else {
                currentChunk.content = body;
                body = "";
            }

            if (currentChunk.content.length) {
                chunks.push(currentChunk);
            }

            currentChunk = {
                type: nextType,
                content: ""
            };
        } while (body);

        return chunks;
    };

    var buildExprPart = function (expr) {
        return "write(" + expr + ");";
    };

    var buildTextPart = function (text) {
        return buildExprPart(quote(text));
    };

    var buildPart = function (chunk) {
        switch (chunk.type) {
            case ChunkType.code: return chunk.content;
            case ChunkType.expr: return buildExprPart(chunk.content);
            case ChunkType.text: return buildTextPart(chunk.content);
        }
    };

    var buildTemplate = function (body) {
        var chunks = parse(body);
        var parts = [];
        var template;

        for (var i = 0, l = chunks.length; i < l; i += 1) {
            parts.push(buildPart(chunks[i]));
        }

        template = new Function("view", "write", "collect", "fugly",
            parts.join("\n"));

        return function (context) {
            var currentBuffer = null;

            /**
             * Buffer class that holds the written contents for the template
             *
             * @class fugly.Template.Buffer
             * @constructor
             */
            var buffer = function () {
                var contents = [];
                var previousBuffer = currentBuffer;

                var b = {
                    /**
                     * Writes some content within the buffer
                     *
                     * @method write
                     * @for fugly.Template.Buffer
                     *
                     * @param {string} text
                     */
                    write: function (text) {
                        contents.push(text);
                    },

                    /**
                     * Returns the buffer's content
                     *
                     * @method toString
                     * @for fugly.Template.Buffer
                     *
                     * @return {string}
                     */
                    toString: function () {
                        return contents.join("");
                    },

                    /**
                     * Restore the previous buffer and returns the buffer's
                     * content
                     *
                     * @method end
                     * @for fugly.Template.Buffer
                     *
                     * @return {string}
                     */
                    end: function () {
                        if (currentBuffer !== b) {
                            throw new Error("Only the latest " +
                                    "buffer can be closed.");
                        }

                        currentBuffer = previousBuffer;
                        previousBuffer = null;
                        return b.toString();
                    }
                };

                currentBuffer = b;
                return b;
            };

            var out = buffer();

            template.call(
                null,
                context,
                function (text) {
                    if (currentBuffer !== null) {
                        currentBuffer.write(text);
                    }
                },
                buffer,
                api
            );

            while (currentBuffer !== null) {
                currentBuffer.end();
            }

            return out.toString();
        };
    };

    /**
     * The fugly template
     *
     * @class fugly.Template
     * @constructor
     * @param {string} body
     */
    var Template = function (body) {
        var template = buildTemplate(body);
        var ctx = {}; /* backwards compat */

        /**
         * Returns the rendered template assuming the **context** object as
         * **view**.
         *
         * @method render
         * @for fugly.Template
         *
         * @param {object} context
         *
         * @return {string}
         */

        /**
         * Returns the rendered template assuming the **context** object as
         * **view**.
         *
         * @method render
         * @for fugly.Template
         * @deprecated Use the one that passes the context object
         *
         * @return {string}
         */
        this.render = function (context) {
            return template(
                arguments.length === 0?
                ctx: /* backwards compat */
                context);
        };

        /**
         * Sets the key/values from an object within the context inside the
         * template.
         *
         * @method context
         * @for fugly.Template
         * @deprecated Use the context parameter within the render function
         *
         * @param {object} context
         */

        /**
         * Sets a key/value within the context inside the template.
         *
         * @method context
         * @for fugly.Template
         * @deprecated Use the context parameter within the render function
         *
         * @param {string} key
         * @param {mixed} value
         */
        this.context = function (key, value) {
            if (arguments.length === 1) {
                for (var p in key) {
                    if (key.hasOwnProperty(p)) {
                        ctx[p] = key[p];
                    }
                }
            } else {
                ctx[key] = value;
            }
        };

        /**
         * Yields the template body
         *
         * @method toString
         * @for fugly.Template
         *
         * @return {string} The template body
         */
        this.toString = function () {
            return body;
        };
    };

    api.Template = Template;

    /**
     * Escape a given structure's strings into SGML entities
     *
     * @method entitify
     * @for fugly
     *
     * @param {mixed} value
     *
     * @return {mixed}
     */
    api.entitify = entitify;

    api.compile = function (stream, context) {
        var template = new Template(stream);
        template.context(context);
        return template;
    };

    if (node) {
        module.exports = api;
    } else {
        window.fugly = api;
    }

}(typeof exports !== "undefined" && global.exports !== exports));
