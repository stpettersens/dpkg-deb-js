'use strict'

const gulp = require('gulp')
const mocha = require('gulp-mocha')
const standard = require('gulp-standard')
const sequence = require('gulp-sequence')
const clean = require('gulp-rimraf')

gulp.task('standard', function () {
  return gulp.src('*.js')
  .pipe(standard())
  .pipe(standard.reporter('default', {
    breakOnError: true
  }))
})

gulp.task('test', function () {
  return gulp.src('dpkg-deb.test1.js')
  .pipe(mocha({reporter: 'min', timeout: 100000}))
})

gulp.task('test2', function () {
  return gulp.src('dpkg-deb.test2.js')
  .pipe(mocha({reporter: 'min', timeout: 100000}))
})

gulp.task('clean', function () {
  return gulp.src(['*.deb', 'demo_from_json_0.1-1', 'demo_from_object_0.1-1'])
  .pipe(clean())
})

gulp.task('test1', sequence('standard', 'test'))
