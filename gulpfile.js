var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');

var replace = require("gulp-replace-task");
var args = require("yargs").argv;
var fs = require('fs');


var path = {
    src : './game/',
    dest : './public/'
};


gulp.task('replace-env', function () {
    //get the environment from the command line
    var env = args.env || 'dev';
    //read the settings from the right file
    console.log("running: ", env);
    var filename = env +'.json';
    var settings = JSON.parse(
        fs.readFileSync('./game/env/' + filename, 'utf8'));

    console.log("settings", settings);
    //trocando os valores de @@apiUrl pelo apiUrl do arquivo json
    gulp.src('game/env/src/config.js')
        .pipe(replace ({
            patterns : [
                {
                    match : 'api',
                    replacement : settings.api
                }
            ]
        }))
        .pipe(gulp.dest('game/env/'));
});

function browserifyTask() {
    return browserify({
        cache: {},
        packageCache: {},
        debug: true,
        entries: path.src
    })
    .bundle()
    .pipe({
        cache : {}
    })
    .on('error', function(e){
      gutil.log(e);
    })
    .pipe(source('webofhate.js'))
    .pipe(gulp.dest('./public'))
}

gulp.task('browserify', browserifyTask);

function bundle (bundler){
    return bundler
    .bundle()
    .on('error', function (e) {
        gutil.log(e);
    })
    // .pipe({
    //     cache : {}
    // })
    .pipe(source('webofhate.js'))    
    .pipe(gulp.dest('./public/'))

}

gulp.task('js', function () {

    // var watcher = watchify(browserifyTask(path.src, watchify.args));
    var watcher = watchify(browserify({
        cache: {},
        packageCache: {},
        debug: true,
        entries: path.src
    }));

    bundle(watcher);

    watcher.on('update', function () {
        // browserifyTask();
        bundle(watcher);
        // gutil.log();
    });
    
    watcher.on('log', function() {
        gutil.log();
    });
});

gulp.task('default', [ 'replace-env', 'js']);