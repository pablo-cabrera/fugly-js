module.exports = function (grunt) {
    "use strict";

    grunt.option("stack", true);

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON("package.json"),

        meta: {
            banner: "/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - " +
                "<%= grunt.template.today(\"yyyy-mm-dd\") %>\n" +
                "<%= pkg.homepage ? \"* \" + pkg.homepage + \"\n\": \"\" %>" +
                "* Copyright (c) <%= grunt.template.today(\"yyyy\") %> <%= pkg.author.name %>;" +
                " Licensed <%= _.pluck(pkg.licenses, \"type\").join(\", \") %> */"
        },

        test: {
            dev: {
                src: [
                    "lib/fugly.js",
                    "test/cases/**/*.js"
                ],

                options: {
                    config: ".gabarito.rc"
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

        instrument: {
            files: "lib/**/*.js",
            options: {
                lazy: true,
                basePath: "test/coverage/instrument/"
            }
        },

        storeCoverage: {
            options: {
                dir: "test/coverage/reports"
            }
        },

        makeReport: {
            src: "test/coverage/reports/**/*.json",
            options: {
                type: "lcov",
                dir: "test/coverage/reports",
                print: "detail"
            }
        },

        copy: {
            toInstrumented: {
                files: [
                    {
                        expand: true,
                        src: ["test/cases/**"],
                        dest: "test/coverage/instrument"
                    }
                ]
            }
        },

        clean: [
            "test/coverage",
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
    grunt.loadNpmTasks("grunt-istanbul");
    grunt.loadNpmTasks("grunt-gabarito");
    grunt.loadNpmTasks("grunt-jscs");

    grunt.registerTask("default", ["clean", "jshint", "jscs", "test:dev"]);

    grunt.registerTask("build", ["clean", "default", "uglify", "yuidoc"]);

    grunt.registerTask("ci", ["clean", "jshint", "instrument",
            "copy:toInstrumented", "test:withCoverage", "storeCoverage",
            "makeReport"]);
};
