var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');

var DEST = 'build/';

//////////////////////////////////////////////////
// cleans the dest folder
//
//////////////////////////////////////////////////
gulp.task('clean', function() {
  return gulp.src(DEST, {read: false})
    .pipe(plugins.clean());
});

//////////////////////////////////////////////////
// runs bower to install frontend dependencies
//
//////////////////////////////////////////////////
gulp.task('bower', function() {
  var install = require("gulp-install");
  return gulp.src(['./bower.json'])
    .pipe(install());
});

///////////////////////////////////////////////////////////
//  Organize the order of angular scripts, concat and uglify
//  Minify and concat JS files...
///////////////////////////////////////////////////////////
gulp.task('angular-files', function() {
  return gulp.src(['src/app/**/*.js'])
    .pipe(plugins.angularFilesort())
    .pipe(plugins.concat('app.js'))
    .pipe(plugins.ngAnnotate())
    .pipe(plugins.uglify({mangle: false}))
    .pipe(gulp.dest(DEST + 'app'));
});

gulp.task('js-files', function() {
  return gulp.src(['src/js/**/*.js'])
    .pipe(plugins.uglify())
    .pipe(gulp.dest(DEST + 'js'));
});

////////////////////////////////////////////////////
// Just copy components file to distribution folder
//
////////////////////////////////////////////////////
gulp.task('components', function() {
  return gulp.src(['src/components/**/*.*'])
    .pipe(gulp.dest(DEST + 'components'));
});

////////////////////////////////////////////////////
// Just copy fonts file to distribution folder
//
////////////////////////////////////////////////////
gulp.task('fonts',function() {
  return gulp.src(['src/fonts/**/*'])
    .pipe(gulp.dest(DEST + 'fonts'));
});

////////////////////////////////////////////////////
// copy and minify css files
//
////////////////////////////////////////////////////
gulp.task('copy-css',function() {
  return gulp.src(['src/css/*.css'])
    .pipe(gulp.dest(DEST + 'css'));
});
gulp.task('min-css',function() {
  return gulp.src(['src/css/*.css'])
    .pipe(plugins.cssmin())
    .pipe(gulp.dest(DEST + 'css'));
});

////////////////////////////////////////////////////
// copy and minify css files
//
////////////////////////////////////////////////////
gulp.task('img', function() {
  return gulp.src(['src/img/**/*'])
    .pipe(plugins.imagemin())
    .pipe(gulp.dest(DEST + 'img'));
});

////////////////////////////////////////////////////
// minify html files
//
////////////////////////////////////////////////////
gulp.task('regular-templates', function() {
  return gulp.src(['src/templates/**/*.html'])
    .pipe(plugins.htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(DEST + 'templates'));
});

gulp.task('angular-templates', function() {
  return gulp.src(['src/app/**/*.html'])
    .pipe(plugins.htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(DEST + 'app'));
});

////////////////////////////////////////////////////
// minify index.html and inject app.js concat
//
////////////////////////////////////////////////////
gulp.task('html-inject', function() {
  var target = gulp.src('src/index2.html');

  return target
    .pipe(plugins.inject(gulp.src(DEST + 'js/**/*.js', {read: false}),  {starttag: '<!-- inject:script:{{ext}} -->', addRootSlash: false, ignorePath: DEST}))
    .pipe(plugins.inject(gulp.src(DEST + 'app/**/*.js', {read: false}), {starttag: '<!-- inject:angular:{{ext}} -->', addRootSlash: false, ignorePath: DEST}))
//    .pipe(plugins.htmlmin({collapseWhitespace: true}))
    .pipe(plugins.rename('index.html'))
    .pipe(gulp.dest(DEST))
});

////////////////////////////////////////////////////
// CONNECT AND LIVERELOAD
//
////////////////////////////////////////////////////
gulp.task('dev-connect', function() {
  plugins.connect.server({
    root: 'src',
    livereload: true,
    port: '8080'
  });
});

gulp.task('build-connect', function() {
  plugins.connect.server({
    root: 'build',
    livereload: true,
    port: '8080'
  });
});

////////////////////////////////////////////////////
// TASK DECLARATIONS
//
////////////////////////////////////////////////////
gulp.task('default', ['build'])

gulp.task('dev', ['dev-connect']);

gulp.task('build', function(callback) {
  runSequence(
    'clean',
    'bower',
    'scripts',
    'components',
    'fonts',
    'css',
    'img',
    'templates',
    'html-inject',
    'build-connect',
    function() {
      console.log("ALL DONE!");
    }
  );
})

gulp.task('scripts', ['angular-files', 'js-files']);
gulp.task('css', ['copy-css', 'min-css']);
gulp.task('templates', ['regular-templates', 'angular-templates']);

