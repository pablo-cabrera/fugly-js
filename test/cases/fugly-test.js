(function(node) {
    "use strict";

    var main = node? global : window;
    var gabarito;
    var fugly;

    if (node) {
        gabarito = require("gabarito");
        fugly = require("../../lib/fugly");
    } else {
        gabarito = main.gabarito;
        fugly = main.fugly;
    }

    var assert = gabarito.assert;

    gabarito.add({

        name : "fugly-test",

        "should use context as view within template" : function() {
            var ctx = { f : function () { return "oi"; } };
            var template = "<$= view.f() $>";
            var r = new fugly.Template(template).render(ctx);
            assert.areSame("oi", r);
        },

        "write function should write the value as string output" : function() {
            var template = "<$ write('yomomma'); $>"
            var out = new fugly.Template(template).render();
        },

        dummy : undefined

    });

}(typeof exports !== "undefined" && global.exports !== exports));