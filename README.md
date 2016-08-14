### dpkg-deb-js
> :cyclone: dpkg-deb implementation with Node.js.

[![Build Status](https://travis-ci.org/stpettersens/dpkg-deb-js.png?branch=master)](https://travis-ci.org/stpettersens/dpkg-deb-js)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)
[![npm version](https://badge.fury.io/js/dpkg-deb-js.svg)](http://npmjs.com/package/dpkg-deb-js)
[![Dependency Status](https://david-dm.org/stpettersens/dpkg-deb-js.png?theme=shields.io)](https://david-dm.org/stpettersens/dpkg-deb-js) [![Development Dependency Status](https://david-dm.org/stpettersens/dpkg-deb-js/dev-status.png?theme=shields.io)](https://david-dm.org/stpettersens/dpkg-deb-js#info=devDependencies)

<!-- TODO -->

##### Usage:

```
Usage: dpkg-deb-js [<option> ...] <command>

Standard commands:
  -b|--build <directory> [<deb>]  Build an archive.
  -c|--contents <deb>             List contents.
  -I|--info <deb>                 Show info to stdout.

Extended commands:
  -s|--stage <pkg.json>           Stage package structure from JSON file.
  -b|--build <pkg.json>  [<deb>]  Build an archive from JSON file.
```
