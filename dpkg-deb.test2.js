/*
  Test dpkg-deb-js tool 2/2.
*/

/* global describe it */
'use strict'

const assert = require('chai').assert
const fs = require('fs')
const dpkgDeb = require('./dpkg-deb')

const pkg = {
  package: 'demo_from_object',
  version: '0.1-1',
  section: 'base',
  priority: 'optional',
  architecture: 'i386',
  maintainer: 'Mr. Apt <apt@nowhere.tld>',
  description: 'A dummy package',
  _files: [
    'demo_0.1-1/opt/demo/demo:opt/demo/demo',
    'demo_0.1-1/opt/demo/readme.txt:opt/demo/readme.txt'
  ]
}

describe('Test dpkg-deb-js tool:\n', function () {
  it('Should stage a debian package from `pkg` object (via module).', function (done) {
    console.log('\n* Stage a debian package from object.')
    dpkgDeb.generateDebianStaging(pkg, false)
    assert.equal(fs.existsSync('demo_from_json_0.1-1/DEBIAN/control'), true)
    assert.equal(fs.existsSync('demo_from_json_0.1-1.deb'), true)
    assert.equal(fs.existsSync('demo_from_object_0.1-1/DEBIAN/control'), true)
    assert.equal(fs.existsSync('demo_from_object_0.1-1/opt/demo/demo'), true)
    assert.equal(fs.existsSync('demo_from_object_0.1-1/opt/demo/readme.txt'), true)
    done()
  })
})
