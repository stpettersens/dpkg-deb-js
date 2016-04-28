/*
  Test dpkg-deb-js tool.
*/

/* global describe it */
'use strict'

const assert = require('chai').assert
const fs = require('fs')
const _exec = require('child_process').exec
const dpkgDeb = require('./dpkg-deb')

const pkg = {
  package: 'demo',
  version: '0.1-1',
  section: 'base',
  priority: 'optional',
  architecture: 'i386',
  maintainer: 'Mr. Apt <apt@nowhere.tld>',
  description: 'A dummy package'
}

const sources = ['dpkg-deb.js', 'dpkg-deb.test.js', 'cli.js']
const target = 'demo_0.1-1'

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

  it('Should create a debian package from existing `demo_0.1.1` directory (via cmdline tool).', function (done) {
    process.chdir('.')
    _exec(`node ${sources[2]} --build ${target}`, function (err, stdout, stderr) {
      if (err || stderr.length > 0) {
        console.log('\n' + stderr)
      }
      console.log('\n\t' + stdout)
      assert.equal(fs.existsSync(`${target}.deb`), true)
      done()
    })
  })

  it('Should stage package structure from pkg object and existing folder' +
  ' into `test_pkg` (via dpkg-deb module).', function (done) {
    let result = dpkgDeb.generateDebianStaging(pkg, ['demo_0.1-1/opt'], {write: true, folder: 'test_pkg'})
    assert.equal(result[0], 0)
    assert.equal(fs.existsSync(`test_pkg/${target}/DEBIAN/control`), true)
    done()
  })
})
