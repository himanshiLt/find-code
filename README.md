<h1 align="center">🔍💻</h1>
<h3 align="center">find-code</h3>
<p align="center">Find code snippets in your project<p>
<p align="center"><a href="https://npmjs.com/package/find-code"><img src="https://badgen.net/npm/v/find-code" alt="NPM"></a> <a href="https://travis-ci.com/JasonEtco/find-code"><img src="https://badgen.now.sh/travis/JasonEtco/find-code" alt="Build Status"></a> <a href="https://codecov.io/gh/JasonEtco/find-code/"><img src="https://badgen.now.sh/codecov/c/github/JasonEtco/find-code" alt="Codecov"></a></p>

## Usage

### Installation

```sh
$ npm install find-code
```

```js
const findCode = require('find-code')
```

## How it works

```js
const foundCode = await findCode(/featuredEnabled\('.*'\)/, { directory: './lib' })
console.log(foundCode)
// [{
//  file: 'my-module.js',
//  line: 'if (user.featureEnabled('my-feature')) {',
//  lineNumber: 2
//  block: '// This checks if the feature is enabled\nif (user.featureEnabled('my-feature')) {\nconsole.log('Yay!')
// }]
```

## API

```js
findCode(query, options)
```

**`query`**:

The first argument can be a string or a regular expression:

```js
const foundCode = await findCode(/featuredEnabled\('.*'\)/)
const foundCode = await findCode('const')
```

**`options`**:

| Property | Default | Description |
| :--- | :--- | :--- |
| `directory` | `process.cwd()` | Directory to scan |
| `exclude` | `['node_modules']` | Directories to exclude from the scan
