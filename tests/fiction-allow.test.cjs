'use strict'

// The fiction-signature gate's allow-list is BASENAME-keyed, not path-keyed.
//
// The bug: an adopter vendors the gates under scripts/ (not lib/gates/), so a
// path-keyed allow-list made the gate trip on its OWN signature file - a false
// red in every vendored tree (memstruct and crashtest both hit it). These
// fixtures prove the fix and, per house law, that the gate still bites.

const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const REPO = path.join(__dirname, '..')
const GATE = path.join(REPO, 'lib', 'gates', 'check-fiction-signatures.cjs')

function run(root) {
  try {
    const out = execFileSync('node', [GATE, '--root', root], { encoding: 'utf8' })
    return { code: 0, out }
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout || '') + (e.stderr || '') }
  }
}

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'coreforge-fiction-'))
}

test('the gate does not trip on its own signature file when vendored under scripts/', () => {
  const dir = tmp()
  try {
    fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true })
    fs.writeFileSync(path.join(dir, 'site.config.js'), 'export default { name: "x" }\n')
    // The gate files quote the banned phrases as their own data; vendored at a
    // path other than lib/gates/, they must still be allowed.
    fs.copyFileSync(GATE, path.join(dir, 'scripts', 'check-fiction-signatures.cjs'))
    fs.copyFileSync(path.join(REPO, 'lib', 'gates', 'check-docs-style.cjs'), path.join(dir, 'scripts', 'check-docs-style.cjs'))
    const r = run(dir)
    assert.equal(r.code, 0, r.out)
    assert.match(r.out, /FICTION SIGNATURES: PASS/)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

test('the gate still bites a planted fiction line', () => {
  const dir = tmp()
  try {
    fs.writeFileSync(path.join(dir, 'site.config.js'), 'export default { name: "x" }\n')
    // Assemble the banned phrase from parts so this test's own source line is
    // not itself a fiction hit (the gate scans tests/ too).
    const planted = ['This product is 100%', 'secure', 'and', 'unha' + 'ckable.'].join(' ')
    fs.writeFileSync(path.join(dir, 'claims.md'), planted + '\n')
    const r = run(dir)
    assert.equal(r.code, 1)
    assert.match(r.out, /FICTION SIGNATURES: FAIL/)
    assert.match(r.out, /absolute security claims are fiction/)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})
