'use strict'

// The docs link gate's page-relative leg (rule #3: a bug caught twice becomes
// a gate).
//
// The gate used to resolve relative links against the SOURCE tree, which
// always holds the file, so a served-broken link never bit. On a
// no-trailing-slash permalink page the browser reads `<baseurl>/foo` as a FILE
// and resolves `./x` / `../x` one level off - a real 404 (the gistory +
// poststruct discussions break, family-wide 2026-11-04). Internal links are
// root-absolute; this leg proves the gate refuses the relative shape by name
// and still passes the root-absolute one.

const test = require('node:test')
const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const GATE = path.join(__dirname, '..', 'lib', 'gates', 'check-docs-links.cjs')

function fixture(body) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'coreforge-links-'))
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true })
  fs.writeFileSync(path.join(root, 'docs', '_config.yml'), 'baseurl: /demo\n')
  fs.writeFileSync(path.join(root, 'docs', 'index.md'),
    '---\npermalink: /\nlayout: default\ntitle: "Home"\n---\n\n# Home\n\n' + body + '\n')
  fs.writeFileSync(path.join(root, 'docs', 'guide.md'),
    '---\npermalink: /guide\nlayout: default\ntitle: "Guide"\n---\n\n# Guide\n')
  return root
}

function run(root) {
  const r = spawnSync('node', [GATE, '--root', root], { encoding: 'utf8' })
  return { code: r.status, out: `${r.stdout}\n${r.stderr}` }
}

test('a root-absolute link to a real page passes', () => {
  const r = run(fixture('See [guide](/demo/guide).'))
  assert.equal(r.code, 0, r.out)
  assert.match(r.out, /DOCS LINKS: PASS/)
})

test('a page-relative link is refused by name', () => {
  const r = run(fixture('See [release](./announcing-v1.0.0).'))
  assert.equal(r.code, 1, r.out)
  assert.match(r.out, /relative/)
})

test('a parent-relative link is refused too (the ../../test/ shape)', () => {
  const r = run(fixture('See [spec](../../test/x.test.js).'))
  assert.equal(r.code, 1, r.out)
  assert.match(r.out, /relative/)
})

test('an external link is the author\'s business (not refused)', () => {
  const r = run(fixture('See [gh](https://github.com/dhaupin/coreforge).'))
  assert.equal(r.code, 0, r.out)
})
