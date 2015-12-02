/* globals module, require */
module.exports = function(grunt) {
    var banner = [
        '/*\n',
        ' *\t<%= pkg.name %> <%= pkg.version %>\n',
        ' *\t-- <%= pkg.description %>\n',
        ' *\t<%= pkg.repository.url %>\n',
        ' *\tBuilt on <%= grunt.template.today("yyyy-mm-dd") %>\n */\n'
    ].join('');

    require('time-grunt')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js'],
            ignores: [],
            options: {
                /*maxlen: 120,*/
                quotmark: 'single',
                globals: {
                    require: true,
                    console: true,
                    confirm: true,
                    $: true,
                    jQuery: true,
                }
            }
        },
        concat: {
            options: {
                separator: '\n\n\n\n\n',
                banner: banner
            },
            js: {
                src: [
                    'src/**/*.js',
                    '!src/<%= pkg.name %>.js',
                    '!src/<%= pkg.name %>.min.js'
                ],
                dest: 'src/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                separator: '\n\n\n',
                banner: banner
            },
            dist: {
                src: ['src/<%= pkg.name %>.js'],
                dest: 'src/<%= pkg.name %>.min.js'
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    //captureFile: 'results.txt', // Optionally capture the reporter output to a file
                    //quiet: false, // Optionally suppress output to standard out (defaults to false)
                    //clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
                },
                src: ['test/**/*.js']
            }
        },
        watch: {
            files: ['test/**/*.js', 'src/**/*.js', 'Gruntfile.js'],
            tasks: ['jshint', 'concat', 'uglify']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'watch']);
    grunt.registerTask('test', ['jshint', 'mochaTest']);

};