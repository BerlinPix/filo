module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    express: {
            options: {
            
            },
            dev: {
                options: {
                    script: 'server.js',
                    port: 3000
                }
            }
        },
    concat: {
      jsdist: {
        src: 'src/js/**/*.js',
        dest: 'build/filo.js',
        options: {
          banner: ";(function( $ ) {\n\n",
          footer: "\n\n})( jQuery );"
        }
      },
      cssdist: {
        src: 'src/css/filo_style.css',
        dest: 'build/filo_style.css'
      },
      cssExamples: {
        src: 'src/css/filo_examples.css',
        dest: 'build/filo_examples.css'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },     
      dist: {
        src: 'src/js/**/*.js',
        dest: 'build/filo.min.js',
        options: {
          banner: ";(function( $ ) {\n\n",
          footer: "\n\n})( jQuery );"
        }
      }    
    },
    cssmin: {
      dist: {
        src: ['src/css/filo_style.css'],
        dest: 'build/filo_style.min.css'
      }
    },
    sass: {
      dist: {
        files: {
          'src/css/filo_style.css': 'src/sass/filo_style.scss',
          'src/css/filo_examples.css': 'src/sass/filo_examples.scss'
        }
      }
    },
    watch: {
      files: ['src/**/*.js', 'src/sass/*.scss'],
      options: {
        livereload: true
      },
      css: {
        files: ['src/sass/*.scss'],
        taks: ['sass', 'concat', 'uglify', 'cssmin'],
        options: {
          livereload: false
        }
      },
      tasks: ['sass','concat', 'uglify', 'cssmin']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-css');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-express-server');

  grunt.registerTask('default', 'start server', ['express:dev', 'watch']);

};