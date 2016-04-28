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

function displayError (program, message) {
  console.info('dpkg-deb-js: error: %s', message)
  displayUsage(program, 2)
}

function displayUsage (program, exitCode) {
  console.log('\nUsage: %s [<option> ...] <command>\n', program)
  console.log('Commands:')
  console.log('  -b|--build <directory> [<deb>]  Build an archive.')
  console.log('  -c|--contents <deb>             List contents.')
  console.log('  -I|--info <deb>                 Show info to stdout.')
  console.log('\n-s|--stage <pkg.json>           Stage package structure from JSON file. *')
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
        dpkgDeb.buildDebianArchive(args[i + 1], true)
      }
      if (/-c|--contents/.test(args[i])) {
        console.warn('!TODO')
      }
      if (/-I|--info/.test(args[i])) {
        console.warn('!TODO')
      }
      if (/-s|--stage/.test(args[i])) {
        dpkgDeb.generateDebianStaging(JSON.parse(args[i + 1]))
      }
    }
  }
}

main(process.argv)
