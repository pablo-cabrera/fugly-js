fugly-js [![Build Status](https://travis-ci.org/pablo-cabrera/fugly-js.png)](https://travis-ci.org/pablo-cabrera/fugly-js)
========

**Fugly-js** is a simple straightforward template engine that uses javascript as scripting engine itself. It's called **fugly-js** because templates actually looks like a fucking ugly javascript.

It uses `<$` and `$>` to open and close javascript blocks, and respectively uses `<$= expression $>` to evaluate and write expressions to the output.

To pass variables and functions to be used within it, one may pass a context object that will be visible inside the template as a local variable called **view**.

Along with it there is also a local function called **write** that can be used within javascript blocks to write values to the output.

Templates are evaluated within its own function scope, so any variables created there will be **local**.

Packed with it, there is the **entitify** function that transforms character strings to its equivalent SGML character entity. This function runs through arrays and objects recursively, if it encounters values other than object, arrays or strings, it returns the value itself. **Its not cyclic safe**. This helps to write safe strings within html templates.

Thats all there is to it. Below there are some sample usages.

```js
var body = "This is a template without js blocks";
var template = new fugly.Template(body);
var context = {};

var out = template.render(context);

console.log(out); // "This is a template without js blocks"
```

```js
var body =
    "This fugly counts up to three\n" +
    "<$" +
    "for (var i = 1; i < 4; i += 1) { " +
    "    write(i + '\\n');" +
    "}" +
    "$>";

var template = new fugly.Template(body);
var context = {};

var out = template.render(context);

console.log(out);
/*
This fugly counts up to three
1
2
3
*/
```

```js
var body =
    "This fugly uses the context variable\n" +
    "<$ write(view.myVariable); $>\n";

var template = new fugly.Template(body);
var context = {
    myVariable: "yomomma"
};

var out = template.render(context);

console.log(out);
/*
This fugly uses the context variable
yomomma
*/
```

```js
var body =
    "This fugly uses the expression\n" +
    "<$= view.myVariable $>\n";

var template = new fugly.Template(body);
var context = {
    myVariable: "yomomma"
};

var out = template.render(context);

console.log(out);
/*
This fugly uses the expression
yomomma
*/
```

```js
var body =
    "This fugly calls an external function\n" +
    "<$= view.someFunction() $>\n";

var template = new fugly.Template(body);
var context = {
    someFunction: function () { return "yomomma"; }
};

var out = template.render(context);

console.log(out);
/*
This fugly calls an external function
yomomma
*/
```

```js
var body =
    "This fugly uses the entitify function\n" +
    "<$= fugly.entitify(view.yomomma) $>\n";

var template = new fugly.Template(body);
var context = {
    yomomma: "Yo momma is so @#$&$# fat!"
};

var out = template.render(context);

console.log(out);
/*
This fugly uses the entitify function
Yo momma is so @#$&#38;$# fat!
*/
```


