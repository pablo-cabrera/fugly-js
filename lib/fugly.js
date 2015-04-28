(function (node) {
    "use strict";

    var Token = {
        startCode: "<$",
        endCode: "$>"
    };

    var ChunkType = {
        code: {},
        text: {},
        expr: {}
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

        template = new Function("view", "write", parts.join(""));

        return function (context) {
            var out = [];
            template.call(null, context, function (text) {
                out.push(text);
            });

            return out.join("");
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

        /**
         * Returns the rendered template assuming the **context** object as
         * **view**.
         *
         * @method render
         * @for fugly.Template
         *
         * @param {object} [context]
         *
         * @return {string}
         */
        this.render = function (context) {
            return template(context || {});
        };
    };

    var api = {
        Template: Template
    };

    if (node) {
        module.exports = api;
    } else {
        window.fugly = api;
    }

}(typeof exports !== "undefined" && global.exports !== exports));
