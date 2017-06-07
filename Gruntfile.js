module.exports = function (grunt) {
    "use strict";

    grunt.option("stack", true);

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON("package.json"),

        meta: {
            banner:
                "/*! " +
                "<%= pkg.title || pkg.name %> v<%= pkg.version %> | " +
                "(c) <%= grunt.template.today(\"yyyy\") %> " +
                "<%= pkg.author.name %> | " +
                " Available via <%= pkg.license %> license " +
                "*/"
        },

        gabarito: {
            dev: {
                src: [
                    "lib/fugly.js",
                    "test/cases/**/*.js"
                ],

                options: {
                    environments: ["node", "phantom"]
                }
            },

            withCoverage: {
                src: [
                    "lib/fugly.js",
                    "test/cases/**/*.js"
                ]
            }
        },

        uglify: {
            options: {
                banner: "<%= meta.banner %>\n"
            },

            dist: {
                src: "lib/fugly.js",
                dest: "dist/fugly.js"
            }
        },

        jshint: {
            options: {
                /* enforcing */
                strict: true,
                bitwise: false,
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                noempty: true,
                plusplus: true,
                quotmark: "double",

                undef: true,

                /* relaxing */
                eqnull: true,
                sub: true,
                evil: true,

                /* environment */
                node: true,
                browser: true
            },

            files: ["Gruntfile.js", "lib/fugly.js"]
        },

        yuidoc: {
            compile: {
                name: "<%= pkg.name %>",
                description: "<%= pkg.description %>",
                version: "<%= pkg.version %>",
                url: "<%= pkg.homepage %>",
                options: {
                    paths: "lib/",
                    outdir: "docs/"
                }
            }
        },

        jscs: {
            src: ["Gruntfile.js", "lib/fugly.js"],
            options: {
                config: ".jscsrc"
            }
        },

        clean: [
            "docs",
            "dist"
        ]

    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-yuidoc");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-gabarito");
    grunt.loadNpmTasks("grunt-jscs");

    grunt.registerTask("default", ["clean", "jshint", "jscs", "gabarito"]);

    grunt.registerTask("build", ["clean", "default", "uglify", "yuidoc"]);

};
