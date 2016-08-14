/*
  dpkg-deb implementation with Node.js.
  Copyright 2016 Sam Saint-Pettersen.

  Released as original dpkg-deb under the
  GNU General Public License and in additon
  the MIT License; see GPL-LICENSE and MIT-LICENSE.
*/

'use strict'

const fs = require('fs-extra')
const tarino = require('tarino')
const artichoke = require('artichoke')
const titlecase = require('title-case')
const dos2unix = require('ssp-dos2unix').dos2unix

let DELIMITER = '_'

function readCtrlFile (control) {
  try {
    let pkg = {}
    let ctrl = fs.readFileSync(control, 'utf8').toString().split('\n')
    ctrl.map(function (line) {
      if (line.indexOf('Package:') !== -1) {
        pkg.package = line.split(':')[1].trim()
      }
      if (line.indexOf('Version:') !== -1) {
        pkg.version = line.split(':')[1].trim()
      }
    })
    return pkg
  } catch (e) {
    console.warn('Cannot open `control` file to create Debian archive:')
    console.log(e.path)
    return 0
  }
}

function createCtrlArchive (pkg) {
  const rt = `${pkg.package}${DELIMITER}${pkg.version}`
  tarino.createTarGz('control.tar.gz', 'control', {root: `${rt}/DEBIAN`, flat: true})
  return pkg
}

function createDataArchive (pkg) {
  const rt = `${pkg.package}${DELIMITER}${pkg.version}`
  tarino.createTarGz('data.tar.gz', 'opt', {root: rt, folder: true})
}

function createDebArchive (pkg, verbose) {
  const deb = `${pkg.package}${DELIMITER}${pkg.version}.deb`
  const contents = ['debian-binary', 'control.tar.gz', 'data.tar.gz']
  if (verbose) {
    console.info("dpkg-deb-js: building package '%s' in '%s'.", pkg.package, deb)
  }
  fs.writeFileSync('debian-binary', '2.0\n')
  artichoke.createArchive(deb, contents)
  cleanUp(contents)
  return 0
}

function cleanUp (contents) {
  contents.map(function (part) {
    fs.unlinkSync(part)
  })
}

module.exports.buildDebianArchive = function (src, _package, verbose) {
  let pkg = createCtrlArchive(readCtrlFile(`${src}/DEBIAN/control`))
  createDataArchive(pkg)
  fs.watchFile('data.tar.gz', function (curr) {
    if (curr.size > 0) {
      if (_package !== undefined) {
        pkg.package = _package.replace(/\.deb/, '')
        pkg.version = ''
        DELIMITER = ''
      }
      if (createDebArchive(pkg, verbose) === 0) {
        process.exit(0)
      } else {
        process.exit(2)
      }
    }
  })
}

module.exports.buildDebianArchiveFromJson = function (json) {
  this.buildDebianArchive(this.generateDebianStaging(json))
}

module.exports.viewContentsArchive = function (deb) {
  // artichoke.unpackArchive(deb)
  // tarino.extractTarGz('data.tar.gz', {full: true})
  // tarino.listTar('data.tar')
  // !TODO
  console.log('Not yet implementated.')
}

module.exports.viewInfoArchive = function (deb) {
  // !TODO
  console.log('Not yet implemented.')
}

module.exports.generateDebianStaging = function (json) {
  let pkg = null
  try {
    fs.statSync(json)
    pkg = fs.readJsonSync(json)
  } catch (e) {
    pkg = json
  }
  const fpkg = `${pkg.package}${DELIMITER}${pkg.version}`
  let out = []
  let ctrl = []
  for (let key in pkg) {
    if (key.charAt(0) !== '_') {
      ctrl.push(`${titlecase(key)}: ${pkg[key]}`)
    }
  }
  ctrl.push('')

  if (pkg === undefined || pkg.package === undefined ||
  pkg.version === undefined || pkg._files === undefined) {
    console.warn('At least package name, version and _files must be defined.')
    process.exit(2)
  }

  const dpath = `${fpkg}/DEBIAN`
  fs.mkdirpSync(dpath)
  fs.writeFileSync(`${dpath}/control`, ctrl.join('\n'), 'utf8')

  pkg._files.map(function (f) {
    let target = f.split(':')
    let o = `${fpkg}/${target[1]}`
    fs.copySync(target[0], o)
    out.push(o)
  })

  out.map(function (f) {
    dos2unix(f, {write: true}) // Process line endings.
  })
  return fpkg
}
