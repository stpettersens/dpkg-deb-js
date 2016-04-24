#!/bin/env node
/*
  dpkg-deb implementation with Node.js.
  Copyright 2016 Sam Saint-Pettersen.

  Released as original dpkg-deb by Ian Jackson under
  the GNU General Public License; see GPL-LICENSE.
*/

'use strict'

const fs = require('fs')
const tarino = require('tarino')
const artichoke = require('artichoke')

let DELIMITER = '_'

function readCtrlFile (control) {
  try {
    let pkg = {}
    let ctrl = fs.readFileSync(control).toString().split('\n')
    ctrl.map(function (line) {
      if (line.indexOf('Package:') !== -1) {
        pkg.name = line.split(':')[1].trim()
      }
      if (line.indexOf('Version:') !== -1) {
        pkg.version = line.split(':')[1].trim()
      }
    })
    return pkg
  } catch (e) {
    console.warn('Cannot open `control` file to create Debian archive:')
    console.log(e.path)
    process.exit(-1)
  }
}

function createCtrlArchive (pkg) {
  let rt = `${pkg.name}${DELIMITER}${pkg.version}`
  tarino.createTarGz('control.tar.gz', 'control', {root: `${rt}/DEBIAN`, flat: true})
  return pkg
}

function createDataArchive (pkg) {
  let rt = `${pkg.name}${DELIMITER}${pkg.version}`
  tarino.createTarGz('data.tar.gz', 'opt', {root: rt, folder: true})
}

function createDebArchive (pkg) {
  let deb = `${pkg.name}_${pkg.version}.deb`
  let contents = ['debian-binary', 'control.tar.gz', 'data.tar.gz']
  console.info("dpkg-deb-js: building package '%s' in '%s'.", pkg.name, deb)
  fs.writeFileSync('debian-binary', '2.0\n')
  artichoke.createArchive(deb, contents)
  cleanUp(contents)
}

function cleanUp (contents) {
  contents.map(function (part) {
    fs.unlinkSync(part)
  })
}

function buildDebianArchive (src) {
  let pkg = createCtrlArchive(readCtrlFile(`${src}/DEBIAN/control`))
  createDataArchive(pkg)
  fs.watchFile('data.tar.gz', function (curr, prev) {
    if (curr.size > 0) {
      createDebArchive(pkg)
      process.exit(0)
    }
  })
}

function displayError (program, message) {
  console.info('dpkg-deb-js: error: %s', message)
  displayUsage(program, -1)
}

function displayUsage (program, exitCode) {
  console.log('\nUsage: %s [<option> ...] <command>\n', program)
  console.log('Commands:')
  console.log('  -b|--build <directory> [<deb>]  Build an archive.')
  console.log('  -c|--contents <deb>             List contents.')
  console.log('  -I|--info <deb>                 Show info to stdout.')
  process.exit(exitCode)
}

function main (args) {
  if (args.length === 2) {
    displayError(args[1], 'need an action operation')
  } else {
    for (let i = 2; i < args.length; i++) {
      if (/-h|--help/.test(args[i])) {
        displayUsage(args[1], 0)
      }
      if (/-b|--build/.test(args[i])) {
        if (args[i + 1] === undefined) {
          displayError(args[1], '--build needs a <directory> argument')
        }
        buildDebianArchive(args[i + 1])
      }
      if (/-c|--contents/.test(args[i])) {
        // ...
      }
      if (/-I|--info/.test(args[i])) {
        // ...
      }
    }
  }
}

main(process.argv)
