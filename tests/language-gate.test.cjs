'use strict'
/**
 * Behavior tests for lib/gates/check-language.cjs (the family language gate).
 *
 * The gate resolves its root by walking up to the nearest site.config.js, so
 * the fixtures build a temp tree carrying one and copy the gate + root.cjs in.
 * Each case proves a failure class the gate must catch, and the exemptions it
 * must honor (fenced code and inline code are literal data, not prose).
 */
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const ROOT = path.resolve(__dirname, '..')
const GATE = path.join(ROOT, 'lib', 'gates', 'check-language.cjs')

function runGate(scriptPath, env) {
  try {
    const out = execFileSync('node', [scriptPath], { encoding: 'utf-8', env: { ...process.env, ...env } })
    return { code: 0, out }
  } catch (e) {
    return { code: e.status, out: (e.stdout || '') + (e.stderr || '') }
  }
}

// A temp site: site.config.js at the root (so resolveRoot lands there) plus the
// gate + its root resolver under lib/.
function fixture(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lang-gate-'))
  fs.mkdirSync(path.join(dir, 'lib', 'gates'), { recursive: true })
  fs.mkdirSync(path.join(dir, 'docs'), { recursive: true })
  fs.writeFileSync(path.join(dir, 'site.config.js'), 'export default { name: "fixture" }\n')
  fs.copyFileSync(path.join(ROOT, 'lib', 'root.cjs'), path.join(dir, 'lib', 'root.cjs'))
  fs.copyFileSync(GATE, path.join(dir, 'lib', 'gates', 'check-language.cjs'))
  for (const [rel, body] of Object.entries(files)) {
    const abs = path.join(dir, rel)
    fs.mkdirSync(path.dirname(abs), { recursive: true })
    fs.writeFileSync(abs, body)
  }
  return path.join(dir, 'lib', 'gates', 'check-language.cjs')
}

const HAN = '\u4f60\u597d\u4e16\u754c' // ni hao shi jie

test('passes on the live repo tree', () => {
  const r = runGate(GATE)
  assert.equal(r.code, 0, r.out)
  assert.match(r.out, /LANGUAGE GATE: PASS \(English-only\)/)
})

test('passes on English prose', () => {
  const gate = fixture({ 'docs/index.md': '# Title\n\nAll of this is plain English prose.\n' })
  const r = runGate(gate)
  assert.equal(r.code, 0, r.out)
})

test('fails on a run of non-Latin prose, naming file and line', () => {
  const gate = fixture({ 'docs/index.md': `# Title\n\nthis line drifted: ${HAN}\n` })
  const r = runGate(gate)
  assert.equal(r.code, 1)
  assert.match(r.out, /docs\/index\.md:3 Han \(4 chars\)/)
  assert.match(r.out, /LANGUAGE GATE: FAIL/)
})

test('a 2-char run is tolerated (a transliterated name), 3 fails', () => {
  const two = fixture({ 'docs/index.md': `name: ${HAN.slice(0, 2)}\n` })
  assert.equal(runGate(two).code, 0, 'a 2-char run must pass')
  const three = fixture({ 'docs/index.md': `name: ${HAN.slice(0, 3)}\n` })
  assert.equal(runGate(three).code, 1, 'a 3-char run must fail')
})

test('ignores non-Latin inside a fenced code block', () => {
  const gate = fixture({ 'docs/index.md': '# T\n\n```\n' + HAN + '\n```\n' })
  const r = runGate(gate)
  assert.equal(r.code, 0, r.out)
})

test('ignores non-Latin inside an inline-code span', () => {
  const gate = fixture({ 'docs/index.md': `# T\n\nsee \`${HAN}\` for the fixture\n` })
  const r = runGate(gate)
  assert.equal(r.code, 0, r.out)
})

test('honors the LINT_LANGUAGE_ALLOW_RE escape hatch', () => {
  const gate = fixture({ 'docs/index.md': `# T\n\ntranslated title: ${HAN}\n` })
  const r = runGate(gate, { LINT_LANGUAGE_ALLOW_RE: 'translated title' })
  assert.equal(r.code, 0, r.out)
})
