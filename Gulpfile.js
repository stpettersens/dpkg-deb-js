'use strict'

const gulp = require('gulp')
const mocha = require('gulp-mocha')
const sequence = require('gulp-sequence')
const standard = require('gulp-standard')

gulp.task('standard', function () {
  return gulp.src('*.js')
  .pipe(standard())
  .pipe(standard.reporter('default', {
    breakOnError: true
  }))
})

gulp.task('mocha', function () {
  return gulp.src('dpkg-deb.test.js')
  .pipe(mocha({reporter: 'min', timeout: 100000}))
})

gulp.task('test', sequence('standard', 'mocha'))

