'use strict'

// The Ruby-version parity law (rule #3: the drift was caught once already).
//
// The retired docs-build.yml fork drifted to Ruby 3.2 while the docs lane ran
// 3.4 - the exact drift the lane consolidation removed. The dogfood test.yml
// and the adopter test.yml template each still built docs on 3.2, so a Jekyll
// build could pass locally on one Ruby and fail the lane's Gemfile note
// (bigdecimal is a 3.4 bundled gem) on another. This law holds every Ruby leg
// in the tree to ONE version, so the drift cannot come back silently.

const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.join(__dirname, '..')
const FILES = [
  '.github/workflows/test.yml',
  '.github/workflows/docs-deploy.yml',
  'templates/adopter/.github/workflows/test.yml',
  'templates/site/.github/workflows/docs-deploy.yml',
]

const rubyOf = (rel) => {
  const m = fs.readFileSync(path.join(ROOT, rel), 'utf8').match(/ruby-version:\s*'([0-9.]+)'/)
  return m ? m[1] : null
}

test('every Ruby leg in the tree declares one version', () => {
  const found = FILES.map((f) => [f, rubyOf(f)])
  for (const [f, v] of found) assert.ok(v, `${f} declares no ruby-version`)
  const versions = [...new Set(found.map(([, v]) => v))]
  assert.equal(versions.length, 1, `ruby-version drift: ${JSON.stringify(found)}`)
})
