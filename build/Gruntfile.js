module.exports = function(grunt) {

	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		banner:'/*! \n * <%= pkg.description %>\n * Author:<%= pkg.author.name %>\n * Website:<%= pkg.author.homepage %>\n * Version:<%= pkg.version %> \n * Date:<%= grunt.template.today("yyyy-mm-dd") %> \n * License:<%= pkg.licenses.url %> \n */\n',
		

		clean: {
			options: {
				force:true
			},
			build: {
				src: ["<%= pkg.baseDir %>js/lib/**.js"]
			}
		},
		
		jshint: {
			all: ['<%= pkg.baseDir %>js/src/jquery.validate.js']
		},
		
		uglify : {
			shifone:{
				options : {
					preserveComments: false,
					//sourceMap: "<%= pkg.baseDir %>js/lib/client.min.map",
					//sourceMappingURL: "client.min.map",
					report: "min",
					beautify: {
							ascii_only: true
					},
					compress: {
						hoist_funs: false,
						loops: false,
						unused: false
					},
					banner : '<%= banner %>'
				},
				
				files:{
					'<%= pkg.baseDir %>js/lib/jquery.validate.min.js':'<%= pkg.baseDir %>js/src/jquery.validate.js'
				}
			},
			others:{
				files:{
					'<%= pkg.baseDir %>js/lib/jquery-1.11.0.min.js':'<%= pkg.baseDir %>js/src/jquery-1.11.0.js'
				}
			}
			
		}
	});
	
	//grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	//grunt.loadNpmTasks('grunt-contrib-cssmin');
	//grunt.loadNpmTasks('grunt-contrib-copy');
	//grunt.loadNpmTasks('grunt-contrib-htmlmin');

	// 默认任务
	grunt.registerTask('default', ['clean','jshint','uglify']);
}; 
