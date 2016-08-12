#!/usr/bin/env node
/*
  dpkg-deb implementation with Node.js.
  Copyright 2016 Sam Saint-Pettersen.

  Released as original dpkg-deb under the
  GNU General Public License and in additon
  the MIT License; see GPL-LICENSE and MIT-LICENSE.
*/

'use strict'

const dpkgDeb = require('./dpkg-deb')
const fs = require('fs-extra')
const g = require('generic-functions')

function displayError (program, message) {
  console.info('dpkg-deb-js: error: %s', message)
  displayUsage(program, 2)
}

function displayUsage (program, exitCode) {
  console.log('\nUsage: %s [<option> ...] <command>', program)
  console.log('\nStandard commands:')
  console.log('  -b|--build <directory> [<deb>]  Build an archive.')
  console.log('  -c|--contents <deb>             List contents.')
  console.log('  -I|--info <deb>                 Show info to stdout.')
  console.log('\nExtended commands:')
  console.log('  -s|--stage <pkg.json>           Stage package structure from JSON file.')
  console.log('  -b|--build <pkg.json>           Build an archive from JSON file.\n')
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
        let pn = args[i + 1]
        if (g.endswithdot('json')) {
          pn = dpkgDeb.generateDebianStaging(fs.readJsonSync(args[i + 1]))
        }
        dpkgDeb.buildDebianArchive(pn, true)
      }
      if (/-c|--contents/.test(args[i])) {
        dpkgDeb.viewContentsArchive(args[i + 1])
      }
      if (/-I|--info/.test(args[i])) {
        dpkgDeb.viewInfoArchive(args[i + 1])
      }
      if (/-s|--stage/.test(args[i])) {
        dpkgDeb.generateDebianStaging(fs.readJsonSync(args[i + 1]))
      }
    }
  }
}

main(process.argv)
