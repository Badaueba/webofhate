var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');

var path = {
    src : 'public/game',
    dest : 'public/'
};
gulp.task('bundle', function (){
    browserify(path.src).bundle()
    .on('error', function (e) {
        gutil.log(e);
    })
    .pipe(source('webofhate.js'))
    .pipe(gulp.dest('./public/'));
});