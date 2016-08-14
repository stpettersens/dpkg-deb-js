/*
  Test dpkg-deb-js tool 1/2.
*/

/* global describe it */
'use strict'

const assert = require('chai').assert
const fs = require('fs')
const _exec = require('child_process').exec
const dpkgDeb = require('./dpkg-deb')

const sources = ['dpkg-deb.js', 'dpkg-deb.test.js', 'cli.js']
const target = 'demo_0.1-1'

describe('Test dpkg-deb-js tool:\n', function () {
  it('Should build a debian package from existing `demo_0.1.1` directory (via cmdline tool).', function (done) {
    process.chdir('.')
    _exec(`node ${sources[2]} --build ${target}`, function (err, stdout, stderr) {
      if (err || stderr.length > 0) {
        console.log('\n' + stderr)
      }
      console.log('\n\t' + stdout)
      assert.equal(fs.existsSync(`${target}.deb`), true)
      console.log('\n* Build a debian package from existing `demo_0.1.1` directory.')
      done()
    })
  })

  it('Should stage and build a debian package from JSON file (`demo_0.1-1.json`) (via module).', function (done) {
    console.log('\n* Stage and build a debian package from JSON file.')
    dpkgDeb.buildDebianArchiveFromJson('demo_0.1-1.json', false)
    done()
  })
})
