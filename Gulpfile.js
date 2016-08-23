'use strict'

const gulp = require('gulp')
const mocha = require('gulp-mocha')
const standard = require('gulp-standard')
const sequence = require('gulp-sequence')
const wait = require('gulp-wait')
const clean = require('gulp-rimraf')
const os = require('os')
const fs = require('fs')
const _exec = require('child_process').exec

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

gulp.task('test3', function () {
  if (os.platform() === 'linux') {
    _exec('sudo dpkg -i demo_0.1-1.deb', function (err, stdout, stderr) {
      if (!err) {
        console.log(stdout)
      }
    })
  }
  return gulp.src('*', {read: false})
  .pipe(wait(1500))
})

gulp.task('test4', function () {
  if (os.platform() === 'linux') {
    const readme = fs.readFileSync('/opt/demo/readme.txt').toString().split('\n')
    console.log('')
    for (let i in readme) {
      console.log(readme[i])
    }
  }
})

gulp.task('clean', function () {
  return gulp.src(['*.deb', 'demo_from_json_0.1-1', 'demo_from_object_0.1-1'])
  .pipe(clean())
})

gulp.task('test1', sequence('standard', 'test'))
