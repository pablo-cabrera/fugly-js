(function() {
    
    var nodejs = (typeof exports !== "undefined"),
    
        Token = {
            startCode : "<$",
            endCode : "$>",
            startExpr : "<$="
        },
        
        ChunkType = {
            code : {},
            text : {},
            expr : {}
        },
        
        merge = function(o1, o2) {
            for (var a in o2) {
                if (o2.hasOwnProperty(a)) {
                    o1[a] = o2[a];
                }
            }
        },
        
        parse = function(body) {
            var currentChunk = {
                    type : ChunkType.text,
                    content : ""
                },
                chunks = [],
                pos,
                nextType;
                
                
            do {
                nextType = null;
                if (currentChunk.type === ChunkType.text) {
                    pos = body.indexOf(Token.startCode);
                    if (pos > -1) {
                        nextType = body.indexOf(Token.startExpr) === pos ? ChunkType.expr : ChunkType.code;
                    }
                } else {
                    pos = body.indexOf(Token.endCode);
                    if (pos > -1) {
                        nextType = ChunkType.text;  
                    }
                }
                
                if (nextType) {
                    currentChunk.content = body.substr(0, pos);
                    body = body.substr(pos + (nextType === ChunkType.expr ? 3 : 2)); 
                } else {
                    currentChunk.content = body;
                    body = "";
                }
               
                if (currentChunk.content.length) {
                    chunks.push(currentChunk);
                }
                
                currentChunk = {
                    type : nextType,
                    content : ""
                };
            } while(body);
            
            return chunks;
        },
        
        buildExprPart = function(expr) {
            return "write(" + expr + ");";
        };
        
        buildTextPart = function(text) {
            return buildExprPart(quote(text));
        },

        /**
         * Quote function stripped of json2.org
         * @see http://json.org
         */
        quote = (function() {
            var
                escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
                meta = {
                    '\b': '\\b',
                    '\t': '\\t',
                    '\n': '\\n',
                    '\f': '\\f',
                    '\r': '\\r',
                    '"' : '\\"',
                    '\\': '\\\\'
                };
             
             	return function(string) {
                	escapable.lastIndex = 0;
                	return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                        var c = meta[a];
                        return typeof c === 'string'
                        ? c
                        : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                        }) + '"' : '"' + string + '"';
                }
        }()),

        buildPart = function(chunk) {
            switch (chunk.type) {
                case ChunkType.code :
                    return chunk.content;
                case ChunkType.expr :
                    return buildExprPart(chunk.content);
                case ChunkType.text :
                    return buildTextPart(chunk.content);
            }
        },

        buildTemplate = function(body) {
            var chunks = parse(body),
                parts = [],
                template;
                
            for (var i = 0, l = chunks.length; i <l; i++) {
                parts.push(buildPart(chunks[i]));
            }
            
            template = new Function("view", "write", parts.join(""));
            
            return function() {
                var context = {};
                merge(context, this);
                
                var out = [];
                template.call(null, context, function(text) {
                    out.push(text);
                });
                
                return out.join("");
            };
        },
        
        Template = function(body) {
            var 
                context = {},
                template;
            
            this.context = function(key, value) {
                if (arguments.length == 1) {
                    merge(context, key);
                } else {
                    context[key] = value;
                }
            };
            
            this.render = function() {
                return template.call(context);
            };
            
            if (nodejs) {
                this.call = this.render;
            }
            
            template = buildTemplate(body);
        };
    
    if (nodejs) {
        exports.Template = Template;
        exports.compile = function(stream, context) {
           var template = new Template(stream);
           template.context(context);
           return template;
        };        
    } else {
        (function() { return this; }()).fugly = { Template : Template };
    }
}());