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

    var test = { name : "fugly-test" };

    test["should use context as view within template"] = function() {
        var ctx = { f : function () { return "oi"; } };
        var template = "<$= view.f() $>";
        var r = new fugly.Template(template).render(ctx);
        assert.areSame("oi", r);
    };

    test["write function should write the value as string output"] =
    function() {
        var template = "<$ write('yomomma'); $>"
        var out = new fugly.Template(template).render({});
        assert.areSame("yomomma", out);
    };

    test["entitify should convert the string to its entities equivalent"] =
    function () {
        var out = fugly.entitify("&");
        assert.areSame("&#38;", out);
    };

    test["entitify should return null if value is null"] = function () {
        assert.isNull(fugly.entitify(null));
    };

    test["entify should map the array calling itself"] = function () {
        var out = fugly.entitify(["&"]);

        assert.areEqual("&#38;", out[0]);
        assert.areEqual(1, out.length);
    };

    test["entify should map the object calling itself"] = function () {
        var out = fugly.entitify({ a: "&" });
        assert.areEqual("&#38;", out.a);
        var numProps = 0;
        for (var p in out) {
            numProps += 1;
        }
        assert.areEqual(1, numProps);
    };

    test["entitify should return the value if it a function"] = function () {
        var v = function () {};
        var out = fugly.entitify(v);
        assert.areSame(v, out);
    };

    test["entitify should return the value if it is a boolean"] = function () {
        var v = true;
        var out = fugly.entitify(v);
        assert.areSame(v, out);
    };

    test["entitify should return the value if it is a number"] = function () {
        var v = 1;
        var out = fugly.entitify(v);
        assert.areSame(v, out);
    };

    test["entitify should return NaN if the value is NaN"] = function () {
        var v = 1 / "a";
        var out = fugly.entitify(v);
        assert.isNaN(out);
    };

    test["render without context should use the inner context"] = function () {
        var template = new fugly.Template("<$= view.a $>");
        template.context("a", "yomomma");
        var out = template.render();
        assert.areEqual("yomomma", out);
    };

    test["context should assign the key/value pairs to the inner context"] =
    function () {
        var template = new fugly.Template("<$= view.a $> is <$= view.b $>");
        template.context({
            a: "yomomma",
            b: "so fat"
        });
        var out = template.render();
        assert.areEqual("yomomma is so fat", out);
    };


    gabarito.add(test);

}(typeof exports !== "undefined" && global.exports !== exports));
