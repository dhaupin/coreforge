'use strict'

// Brand-contract behavior tests (Phase 0 of labs/prd-flowforge.md).
//
// The contract has two halves and both are exercised here for real (no mocks,
// no network): `coreforge sync` fans site.config.js out to the surfaces that
// cannot import it, and the brand census gate refuses an identity literal that
// lives anywhere else. A temp tree is built per case so a planted violation is
// proven to fail without touching the live repo.

const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { execFileSync } = require('node:child_process')
const { pathToFileURL } = require('node:url')
const yaml = require('js-yaml')

const REPO = path.join(__dirname, '..')
const SYNC = path.join(REPO, 'lib', 'sync.mjs')
const CENSUS = path.join(REPO, 'lib', 'gates', 'check-brand-census.mjs')

// `cwd` defaults to the repo; pass a temp dir to run the temp copies of the
// tool (which resolve their SITE root by walking up to site.config.js).
function run(script, args = [], cwd = REPO) {
  try {
    const out = execFileSync('node', [script, ...args], { cwd, encoding: 'utf8' })
    return { code: 0, out }
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout || '') + (e.stderr || '') }
  }
}
const tempGate = (dir, name) => path.join(dir, 'lib', 'gates', name)
const tempLib = (dir, name) => path.join(dir, 'lib', name)

// A minimal temp tree the census/sync tool can run against. The tool resolves
// the SITE root by walking up to site.config.js, and its gates import the
// shared lib/root.* helpers, so a temp tree mirrors the shipped layout: the
// config at the root, the tool under lib/. That is exactly how an adopter's
// repo looks once coreforge is installed (config above node_modules/coreforge).
function tempTree() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'coreforge-brand-'))
  fs.mkdirSync(path.join(dir, 'lib', 'gates'), { recursive: true })
  fs.copyFileSync(path.join(REPO, 'site.config.js'), path.join(dir, 'site.config.js'))
  fs.copyFileSync(path.join(REPO, 'lib', 'root.cjs'), path.join(dir, 'lib', 'root.cjs'))
  fs.copyFileSync(path.join(REPO, 'lib', 'root.mjs'), path.join(dir, 'lib', 'root.mjs'))
  fs.copyFileSync(path.join(REPO, 'lib', 'identity.mjs'), path.join(dir, 'lib', 'identity.mjs'))
  fs.copyFileSync(path.join(REPO, 'lib', 'sync.mjs'), path.join(dir, 'lib', 'sync.mjs'))
  fs.copyFileSync(path.join(REPO, 'lib', 'gates', 'check-brand-census.mjs'), path.join(dir, 'lib', 'gates', 'check-brand-census.mjs'))
  fs.mkdirSync(path.join(dir, 'web', 'public'), { recursive: true })
  fs.mkdirSync(path.join(dir, 'docs'), { recursive: true })
  // sync imports js-yaml; the temp tree resolves deps the way an install would.
  fs.symlinkSync(path.join(REPO, 'node_modules'), path.join(dir, 'node_modules'), 'dir')
  return dir
}

test('sync:check passes on the live tree (derived surfaces are current)', () => {
  const r = run(SYNC, ['--check'])
  assert.equal(r.code, 0, r.out)
  assert.match(r.out, /sync:check: PASS/)
})

test('brand census passes on the live tree', () => {
  const r = run(CENSUS)
  assert.equal(r.code, 0, r.out)
  assert.match(r.out, /BRAND-CENSUS: PASS/)
})

test('sync is deterministic: two runs produce identical bytes', () => {
  const dir = tempTree()
  run(tempLib(dir, 'sync.mjs'), [], dir)
  const first = fs.readFileSync(path.join(dir, 'web', 'public', 'robots.txt'), 'utf8')
  run(tempLib(dir, 'sync.mjs'), [], dir)
  const second = fs.readFileSync(path.join(dir, 'web', 'public', 'robots.txt'), 'utf8')
  assert.equal(first, second, 'sync wrote different bytes on the second run')
  fs.rmSync(dir, { recursive: true, force: true })
})

test('sync:check FAILS when a generated surface has drifted', () => {
  const dir = tempTree()
  run(tempLib(dir, 'sync.mjs'), [], dir)
  const p = path.join(dir, 'web', 'public', 'robots.txt')
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace('Sitemap:', 'Sitemap: # hand-edited\nSitemap:'))
  const r = run(tempLib(dir, 'sync.mjs'), ['--check'], dir)
  assert.equal(r.code, 1, 'a hand-edited generated file must fail sync:check')
  assert.match(r.out, /DRIFTED/)
  fs.rmSync(dir, { recursive: true, force: true })
})

test('brand census FAILS on a planted identity literal in a structural surface', () => {
  const dir = tempTree()
  // index.html is a scanned surface; plant the site name as a shipped value.
  fs.writeFileSync(path.join(dir, 'web', 'index.html'), '<title>coreforge</title>\n')
  const r = run(tempGate(dir, 'check-brand-census.mjs'), [], dir)
  assert.equal(r.code, 1, 'a hardcoded identity literal must fail the census')
  assert.match(r.out, /web\/index\.html:1/)
  fs.rmSync(dir, { recursive: true, force: true })
})

test('brand census IGNORES identity names inside comments (prose about the brand is not a hardcode)', () => {
  const dir = tempTree()
  fs.writeFileSync(path.join(dir, 'web', 'index.html'), '<!-- coreforge receipt note -->\n<title>neutral</title>\n')
  const r = run(tempGate(dir, 'check-brand-census.mjs'), [], dir)
  assert.equal(r.code, 0, r.out)
  fs.rmSync(dir, { recursive: true, force: true })
})

test('brand census FAILS on a brand name in a FILENAME (invisible to a content scan)', () => {
  const dir = tempTree()
  // A brand name in a PATH is the literal a rebrand misses - the art master
  // shipped as flowforge-logo.jpg and had to be renamed by hand. Plant one.
  fs.writeFileSync(path.join(dir, 'web', 'public', 'coreforge-logo.jpg'), 'not really a jpg')
  const r = run(tempGate(dir, 'check-brand-census.mjs'), [], dir)
  assert.equal(r.code, 1, 'a brand name in a filename must fail the census')
  assert.match(r.out, /web\/public\/coreforge-logo\.jpg.*path carries identity literal/)
  fs.rmSync(dir, { recursive: true, force: true })
})

test('ssr.config.js is a pure adapter: it has no identity literals of its own', () => {
  const src = fs.readFileSync(path.join(REPO, 'web', 'ssr.config.js'), 'utf8')
  assert.match(src, /import site from '\.\.\/site\.config\.js'/, 'ssr.config.js must import the one source')
  // The adapter body may only reference site.*, never a literal.
  const body = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  assert.doesNotMatch(body, /https?:\/\//, 'ssr.config.js carries a URL literal - it must derive every value from site.config.js')
})

test('the one identity source is site.config.js (not a product-named config)', () => {
  assert.ok(fs.existsSync(path.join(REPO, 'site.config.js')), 'site.config.js must exist at the repo root')
  assert.ok(!fs.existsSync(path.join(REPO, 'coreforge.config.js')), 'a product-named config must not exist (PRD 5.1)')
})

// The canon shape for the generated freestruct config, as one predicate so
// both the live file and a planted violation are judged by the same law.
function assertFreestructConfigCanon(doc, host, baseurl) {
  assert.equal(doc.site.url, host, 'site.url must be the origin (docs.host), never the full docs url')
  assert.doesNotMatch(doc.site.url, /\/[a-z0-9-]+$/, 'site.url must not carry the deploy path - that is basePath')
  assert.equal(doc.basePath, baseurl, 'basePath must be the deploy path (docs.baseurl)')
  assert.equal(doc.linkCheck, true, 'linkCheck must be on - the basePath-aware strip (>= 1.2.0) is pinned')
}

test('the generated freestruct.config.yml is canon-shaped (origin-only url + basePath)', async () => {
  // The regression this guards: the sync generator baked the docs path into
  // site.url and omitted basePath - the non-canon shape. freestruct's link
  // check then resolved every root-absolute /coreforge/... href against the
  // output tree with no prefix to strip (freestruct#32), so --strict
  // false-failed the whole docs lane. Canon (eyestruct/monoforge/gistory):
  // site.url is the ORIGIN, basePath is the deploy path, linkCheck is on.
  const site = (await import(pathToFileURL(path.join(REPO, 'site.config.js')).href)).default
  const doc = yaml.load(fs.readFileSync(path.join(REPO, 'docs', 'freestruct.config.yml'), 'utf8'))
  assertFreestructConfigCanon(doc, site.docs.host, site.docs.baseurl)
})

test('the canon guard bites: the pre-fix shape (path baked into url, no basePath) fails it', () => {
  // What the generator emitted before the fix - the exact bytes that turned
  // the docs lane red. The guard must refuse it.
  const preFix = { site: { url: 'https://docs.creadev.org/coreforge' }, linkCheck: true }
  assert.throws(
    () => assertFreestructConfigCanon(preFix, 'https://docs.creadev.org', '/coreforge'),
    /site\.url must be the origin/,
    'a path baked into site.url must fail the canon guard'
  )
  // ...and an omitted basePath fails too (the other half of the pre-fix shape).
  assert.throws(
    () => assertFreestructConfigCanon({ site: { url: 'https://docs.creadev.org' }, linkCheck: true }, 'https://docs.creadev.org', '/coreforge'),
    /basePath must be the deploy path/,
    'a missing basePath must fail the canon guard'
  )
})

test('every generated YAML surface parses (a colon in a value cannot break the docs lane)', () => {
  // The regression this guards: site.config.js description contains
  // "from: landing" - unquoted that reads as a nested mapping and Jekyll
  // refuses the WHOLE config. sync must emit a YAML-safe scalar.
  for (const rel of ['docs/_config.yml', 'docs/freestruct.config.yml']) {
    const src = fs.readFileSync(path.join(REPO, rel), 'utf8')
    assert.doesNotThrow(() => yaml.load(src), `${rel} must parse as YAML`)
  }
})

test('sync quotes a value containing colon+space (the YAML-nesting trap)', () => {
  const dir = tempTree()
  let cfg = fs.readFileSync(path.join(dir, 'site.config.js'), 'utf8')
  cfg = cfg.replace("name: 'coreforge',", "name: 'flow: forge',")
  fs.writeFileSync(path.join(dir, 'site.config.js'), cfg)
  const r = run(tempLib(dir, 'sync.mjs'), [], dir)
  assert.equal(r.code, 0, r.out)
  const doc = yaml.load(fs.readFileSync(path.join(dir, 'docs', '_config.yml'), 'utf8'))
  assert.equal(doc.title, 'flow: forge', 'a colon+space value must round-trip through the generated YAML')
  fs.rmSync(dir, { recursive: true, force: true })
})
