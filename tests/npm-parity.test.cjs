'use strict'

// The npm parity gate (a new law ships with a test).
//
// Every family site advertises the package on npm, and the link is not a
// hand-typed literal that drifts when the package is renamed. The npm URL is
// authored ONCE in site.config.js, fanned into the generated docs config
// (docs/_config.yml `npm_url`) by `npm run sync`, and rendered by the docs
// layout footer. This proves the chain end to end against package.json, so a
// rename or a dropped footer link reds here instead of shipping a dead surface.

const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

const ROOT = path.join(__dirname, '..')
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8')

test('the npm url is authored once and matches the published package name', async () => {
  const site = (await import(pathToFileURL(path.join(ROOT, 'site.config.js')).href)).default
  const pkg = JSON.parse(read('package.json'))
  assert.equal(site.npm, `https://www.npmjs.com/package/${pkg.name}`,
    'site.config.js `npm` must point at the published package name')
})

test('sync fans the npm url into the generated docs config', () => {
  const pkg = JSON.parse(read('package.json'))
  const cfg = read('docs/_config.yml')
  assert.match(cfg, new RegExp(`^npm_url: https://www\\.npmjs\\.com/package/${pkg.name}$`, 'm'),
    'docs/_config.yml is missing npm_url - run `npm run sync`')
})

test('the docs layout footer renders the npm link', () => {
  const layout = read('docs/_layouts/default.html')
  assert.match(layout, /href="\{\{ site\.npm_url \}\}"/,
    'the docs footer must link npm from the generated var, not a literal')
})

test('the web nav advertises the package on npm', () => {
  const nav = read('site.config.js')
  assert.match(nav, /\{ label: 'npm', href: 'https:\/\/www\.npmjs\.com\/package\//,
    'the site nav must carry an npm entry')
})
