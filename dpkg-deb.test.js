/*
  Test dpkg-deb-js tool.
*/

/* global describe it */
'use strict'

const assert = require('chai').assert
const fs = require('fs')
const _exec = require('child_process').exec

const sources = ['dpkg-deb.js', 'dpkg-deb.test.js']

describe('Test dpkg-deb-js tool:\n', function () {
  it('Test code conforms to JS Standard Style (http://standardjs.com).', function (done) {
    _exec(`standard ${sources.join(' ')}`, function (err, stdout, stderr) {
      let passed = true
      if (err || stderr.length > 0) {
        console.log('\n' + stderr)
        console.log(stdout)
        passed = false
      }
      assert.equal(passed, true)
      done()
    })
  })

  it('Should create a debian package from `demo_0.1.1` directory.', function (done) {
    process.chdir('.')
    let target = 'demo_0.1-1'
    _exec(`node dpkg-deb.js --build ${target}`, function (err, stdout, stderr) {
      if (err || stderr.length > 0) {
        console.log('\n' + stderr)
      }
      console.log('\n\t' + stdout)
      if (!fs.existsSync(`${target}.deb`)) {
        throw Error
      }
      done()
    })
  })
})
