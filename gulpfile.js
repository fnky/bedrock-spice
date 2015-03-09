var gulp = require('gulp');
//var sourcemaps = require('sourcemaps');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var nodemon = require('gulp-nodemon');

var browserSync = require('browser-sync');
var through = require('through2');
var browserify = require('browserify');
var babelify = require('babelify');

var paths = {
  src: {
    scripts: './resources/js/**/*.js',
    styles:  './resources/sass/**/*.scss',
    views:   './views/**/*.handlebars'
  },

  dist: {
    scripts: './public/js',
    styles:  './public/css'
  },

  bower: './bower_components'
};

function babelBundle () {
  return through.obj(function (file, enc, next) {
    browserify(file.path, {
      debug: process.env.NODE_ENV == 'development'
    })
    .transform(babelify.configure({
      ignore: 'bower_components',
      extensions: ['.js']
    }))
    .bundle(function (err, res) {
      if (err) return next(err);
      file.contents = res;
      next(null, file);
    })
  });
}

gulp.task('styles', function styles () {
  return gulp.src(paths.src.styles)
    .pipe(sass({
        errLogToConsole: true,
        style: 'compressed',
        includePaths: [
          paths.bower + '/bourbon/app/assets/stylesheets/',
          paths.bower + '/neat/app/assets/stylesheets/',
          paths.bower + '/neat/app/assets/stylesheets/',
          paths.bower + '/animate-sass/',
        ]
    }))
    .pipe(gulp.dest(paths.dist.styles));
});

gulp.task('scripts', function scripts () {
  return gulp.src(paths.src.scripts)
    .pipe(plumber())
    .pipe(babelBundle())
    //.pipe(sourcemaps.write('.'))
    .pipe(plumber.stop())
    .pipe(gulp.dest(paths.dist.scripts))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('browser-sync', function bSync () {
  browserSync({
    proxy: "localhost:8000",
    files: ['public/**/*.{js,css}'],
    reloadDelay: 10
  });
});

gulp.task('nodemon', function () {
  return nodemon({
    script: './server.js',
    ext: 'js handlebars'
  });
});

gulp.task('serve', ['styles', 'scripts', 'nodemon', 'browser-sync'], function serve () {
  gulp.watch(paths.src.styles, ['styles']);
  gulp.watch(paths.src.scripts, ['scripts', browserSync.reload]);
  gulp.watch(paths.src.views).on('change', browserSync.reload);
});

gulp.task('default', ['serve']);
