var package = require('./package.json');
var gulp = require("gulp");
var gutil = require("gulp-util");
var babel = require("gulp-babel");
var babelify = require("babelify");
var browserify = require("browserify");
var sourcemaps = require("gulp-sourcemaps");
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var header = require("gulp-header");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var less = require("gulp-less");
var browserSync = require('browser-sync').create();

const BANNER = ['/**',
	' * <%= pkg.name %> - <%= pkg.description %>',
	' * @date <%= new Date() %>',
	' * @version v<%= pkg.version %>',
	' * @link <%= pkg.homepage %>',
	' * @license <%= pkg.license %>',
	' */',
	''].join('\n');

const BROWSERIFY_OPTIONS = {
	debug: true
};
const UGLIFY_OPTIONS = {
	preserveComments: 'some'
};
const LESS_OPTIONS = {};

// JS Compilation
gulp.task("build", function () {
	// Bundle using Browserify + Babel transform
	return browserify(BROWSERIFY_OPTIONS)
		.transform(babelify)
		.require('src/index.js', { entry: true })
		.bundle()
		.on("error", function (err) {
			console.log("Error : " + err.message);
		})

		// Compiled file + sourcemaps
		.pipe(source('jquery.skeduler.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(sourcemaps.write())
		.pipe(header(BANNER, { pkg: package }))
		.pipe(gulp.dest('dist/'))

		// Minified file + sourcemaps
		.pipe(uglify(UGLIFY_OPTIONS))
		.pipe(rename(function (path) {
			path.extname = '.min' + path.extname;
		}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('dist'))
});

// LESS compilation
gulp.task("less", function () {
	return gulp.src("less/index.less")
		.pipe(less(LESS_OPTIONS))
		.pipe(rename(function (path) {
			path.basename = 'jquery.skeduler';
		}))
		.pipe(gulp.dest("dist"));
});

// Watch tasks
gulp.task('build:watch', function () {

});
gulp.task('less:watch', function () {

});

// Serve
gulp.task('serve', function () {
	browserSync.init({
		server: "./"
	});

	gulp.watch('demo/*.*').on('change', browserSync.reload);
	gulp.watch('src/**/*.js', ['build']).on('change', browserSync.reload);
	gulp.watch('less/**/*.less', ['less']).on('change', browserSync.reload);
});

// Aliases
gulp.task('default', ['serve']);
gulp.task('build', ['build', 'less']);