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

    gabarito.test("fugly").

    clause("should use context as view within template", function() {
        var ctx = { f : function () { return "oi"; } };
        var template = "<$= view.f() $>";
        var r = new fugly.Template(template).render(ctx);
        assert.areSame("oi", r);
    }).

    clause("write function should write the value as string output",
    function() {
        var template = "<$ write('yomomma'); $>"
        var out = new fugly.Template(template).render({});
        assert.areSame("yomomma", out);
    }).

    clause("entitify should convert the string to its entities equivalent",
    function () {
        var out = fugly.entitify("&");
        assert.areSame("&#38;", out);
    }).

    clause("entitify should return null if value is null", function () {
        assert.isNull(fugly.entitify(null));
    }).

    clause("entify should map the array calling itself", function () {
        var out = fugly.entitify(["&"]);

        assert.areEqual("&#38;", out[0]);
        assert.areEqual(1, out.length);
    }).

    clause("entify should map the object calling itself", function () {
        var out = fugly.entitify({ a: "&" });
        assert.areEqual("&#38;", out.a);
        var numProps = 0;
        for (var p in out) {
            numProps += 1;
        }
        assert.areEqual(1, numProps);
    }).

    clause("entitify should return the value if it a function", function () {
        var v = function () {};
        var out = fugly.entitify(v);
        assert.areSame(v, out);
    }).

    clause("entitify should return the value if it is a boolean", function () {
        var v = true;
        var out = fugly.entitify(v);
        assert.areSame(v, out);
    }).

    clause("entitify should return the value if it is a number", function () {
        var v = 1;
        var out = fugly.entitify(v);
        assert.areSame(v, out);
    }).

    clause("entitify should return NaN if the value is NaN", function () {
        var v = 1 / "a";
        var out = fugly.entitify(v);
        assert.isNaN(out);
    }).

    clause("render without context should use the inner context", function () {
        var template = new fugly.Template("<$= view.a $>");
        template.context("a", "yomomma");
        var out = template.render();
        assert.areEqual("yomomma", out);
    }).

    clause("context should assign the key/value pairs to the inner context",
    function () {
        var template = new fugly.Template("<$= view.a $> is <$= view.b $>");
        template.context({
            a: "yomomma",
            b: "so fat"
        });
        var out = template.render();
        assert.areEqual("yomomma is so fat", out);
    }).

    clause("collect return a buffer and start grabbing the written contents",
    function () {
        var template =
            "<$ " +
            "view.buffer = collect();" +
            "write('yomomma');" +
            "$>";

        var view = {};
        var out = new fugly.Template(template).render(view);
        assert.that(out).sameAs("");
        assert.that(view.buffer.toString()).sameAs("yomomma");
    }).

    clause("buffer.toString should yield the buffer's contents so far",
    function () {
        var template =
            "<$ " +
            "var buffer = collect();" +
            "write('yomomma');" +
            "view.yo = buffer.toString();"
            "write('is so fat');" +
            "$>";

         var view = {};
         var out = new fugly.Template(template).render(view);
         assert.that(out).sameAs("");
         assert.that(view.yo).sameAs("yomomma");
    }).

    clause(
    "buffer.end should restore the previous buffer and return its contents",
    function () {
        var template =
            "<$ " +
            "var buffer = collect();" +
            "write('yomomma');" +
            "view.yo = buffer.end();" +
            "write('is so fat');" +
            "$>";

         var view = {};
         var out = fugly(template).render(view);
         assert.that(out).sameAs("is so fat");
         assert.that(view.yo).sameAs("yomomma");
    }).

    clause("buffer.end on a buffer which is not the latest should throw",
    function () {
        var template =
            "<$ " +
            "var buffer1 = collect();" +
            "var buffer2 = collect();" +
            "buffer1.end();"
            "$>";

        var error;
        try {
            fugly(template).render();
        } catch (e) {
            error = e;
        }

        assert.that(error.message).
            sameAs("Only the latest buffer can be closed.");
    }).

    clause(
    "buffers should work even after the template has been already rendered",
    function () {
        var template =
            "<$" +
            "view.yomomma = function () {" +
            "   var buffer = collect();" +
            "   $>yomomma<$" +
            "   return buffer.end();" +
            "};" +
            "$>";

        var view = {};
        fugly(template).render(view);

        assert.that(view.yomomma()).sameAs("yomomma");
    });

}(typeof exports !== "undefined" && global.exports !== exports));
