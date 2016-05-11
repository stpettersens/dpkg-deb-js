/*
  dpkg-deb implementation with Node.js.
  Copyright 2016 Sam Saint-Pettersen.

  Released as original dpkg-deb under the
  GNU General Public License and in additon
  the MIT License; see GPL-LICENSE and MIT-LICENSE.
*/

'use strict'
const fs = require('fs-extra')
const glob = require('glob')
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
  let rt = `${pkg.package}${DELIMITER}${pkg.version}`
  tarino.createTarGz('control.tar.gz', 'control', {root: `${rt}/DEBIAN`, flat: true})
  return pkg
}

function createDataArchive (pkg) {
  let rt = `${pkg.package}${DELIMITER}${pkg.version}`
  tarino.createTarGz('data.tar.gz', 'opt', {root: rt, folder: true})
}

function createDebArchive (pkg, verbose) {
  let deb = `${pkg.package}${DELIMITER}${pkg.version}.deb`
  let contents = ['debian-binary', 'control.tar.gz', 'data.tar.gz']
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

function processLineEndings (f, write) {
  let fis = []
  let files = glob.sync(f + '/*/**')
  files.map(function (fi) {
    if (!fs.lstatSync(fi).isDirectory()) {
      let r = dos2unix(fi, {write: write})
      if (r === 1) {
        r = fi
      }
      fis.push(r)
    } else {
      fis.push(fi)
    }
  })
  return fis
}

module.exports.buildDebianArchive = function (src, verbose) {
  let pkg = createCtrlArchive(readCtrlFile(`${src}/DEBIAN/control`))
  createDataArchive(pkg)
  fs.watchFile('data.tar.gz', function (curr, prev) {
    if (curr.size > 0) {
      if (createDebArchive(pkg, verbose) === 0) {
        process.exit(0)
      } else {
        process.exit(2)
      }
    }
  })
}

module.exports.viewContentsArchive = function (deb) {
  // artichoke.unpackArchive(deb)
  // tarino.extractTarGz('data.tar.gz', {full: true})
  // tarino.listTar('data.tar')
}

module.exports.viewInfoArchive = function (deb) {
  // !TODO
}

module.exports.generateDebianStaging = function (pkg, files, options) {
  let processed = []
  let out = []
  let ctrl = []
  for (let key in pkg) {
    ctrl.push(`${titlecase(key)}: ${pkg[key]}`)
  }
  ctrl.push('')

  if (pkg === undefined || pkg.package === undefined || pkg.version === undefined) {
    console.warn('At least package name and version must be defined.')
    return [2, null, null]
  }

  if (options === undefined) {
    options = {
      write: true,
      folder: ''
    }
  }

  if (options.write) {
    if (options.folder === undefined) {
      options.folder = ''
    } else {
      options.folder += '/'
    }
    let dpath = `${options.folder}${pkg.package}${DELIMITER}${pkg.version}/DEBIAN`
    fs.mkdirpSync(dpath)
    fs.writeFileSync(`${dpath}/control`, ctrl.join('\n'), 'utf8')
    files.map(function (f) {
      let target = f.split('/')
      let o = `${options.folder}${pkg.package}${DELIMITER}${pkg.version}/${target[target.length - 1]}`
      fs.copySync(f, o)
      out.push(o)
    })
    out.map(function (f) {
      processLineEndings(f, true)
    })
    return [0, null, null]
  } else {
    files.map(function (f) {
      processed = processLineEndings(f, false)
      processed.map(function (r) {
        if (fs.lstatSync(r).isFile()) {
          out.push(fs.readFileSync(r, 'utf8').toString())
        } else {
          out.push('!is_dir!')
        }
      })
    })
    return [ctrl.join('\n'), processed, out]
  }
}
