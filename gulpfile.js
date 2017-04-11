'use strict';

var gulp = require('gulp');
var gulpBabel = require('gulp-babel');
// import sass from 'gulp-sass';
// import autoprefixer from 'gulp-autoprefixer';
// import sourcemaps from 'gulp-sourcemaps';

const dirs = {
  dest: 'dist/'
};

gulp.task('load', () => {
  return gulp.src(["index.js","app/**"])
    .pipe(gulpBabel())
    // .pipe(sourcemaps.init())
    // .pipe(sass.sync().on('error', plugins.sass.logError))
    // .pipe(autoprefixer())
    // .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dirs.dest));
});

gulp.task('default', ['load']);