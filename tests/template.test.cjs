'use strict'

// Behavior tests for lib/template.mjs - the copy source `coreforge create`
// stamps (Phase 1 of labs/prd-flowforge.md).
//
// The template is GENERATED from the live dogfood tree, so the two contracts
// are: it is current (no drift), and it carries no identity literal of the
// dogfood's brand (the token pass cannot leak). Both run against the real
// generator - no mocks.

const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')
const { pathToFileURL } = require('node:url')

const ROOT = path.join(__dirname, '..')
const TEMPLATE = path.join(ROOT, 'lib', 'template.mjs')
const OUT = path.join(ROOT, 'templates', 'site')

function run(args = []) {
  try {
    const out = execFileSync('node', [TEMPLATE, ...args], { encoding: 'utf8' })
    return { code: 0, out }
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout || '') + (e.stderr || '') }
  }
}

test('template:check passes on the live tree (templates/site is current)', () => {
  const r = run(['--check'])
  assert.equal(r.code, 0, r.out)
  assert.match(r.out, /template:check: PASS/)
})

test('the template ships the shell (web + docs + the identity file)', () => {
  for (const rel of ['site.config.js', 'web/package.json', 'web/index.html', 'docs/_layouts/default.html']) {
    assert.ok(fs.existsSync(path.join(OUT, rel)), `templates/site/${rel} must exist`)
  }
})

test('the template ships the per-repo CI plumbing (the docs caller + staging sync)', () => {
  for (const rel of ['.github/workflows/docs-deploy.yml', '.github/workflows/staging-ff-sync.yml']) {
    assert.ok(fs.existsSync(path.join(OUT, rel)), `templates/site/${rel} must exist`)
  }
  // The docs lane itself is NOT stamped: it is one canonical reusable workflow
  // in dhaupin/freestruct, and the stamped docs-deploy.yml is a thin caller of
  // it. Shipping a fork here is the drift the consolidation removed.
  assert.ok(!fs.existsSync(path.join(OUT, '.github/workflows/docs-build.yml')),
    'templates/site must not ship a forked docs lane - the caller points at dhaupin/freestruct')
})

test('the template excludes the tool-coupled workflows (release + the dogfood test battery)', () => {
  for (const rel of ['.github/workflows/publish.yml', '.github/workflows/test.yml']) {
    assert.ok(!fs.existsSync(path.join(OUT, rel)),
      `templates/site/${rel} is coupled to the coreforge package/tool path - not a stamped artifact`)
  }
})

test('the adopter lanes carry the family tool slots (packstruct + the arm-gated crashtest)', () => {
  const ADOPTER = path.join(ROOT, 'templates', 'adopter')
  const test = fs.readFileSync(path.join(ADOPTER, '.github', 'workflows', 'test.yml'), 'utf8')
  // packstruct is wired through coreforge's own wrapper verb; crashtest is
  // arm-gated on the config (an unconfigured `crashtest run` is a hard exit 2,
  // never a pass - the family forbids theater).
  assert.match(test, /npm run lint:packs/, 'the adopter battery must run the packstruct lane')
  assert.match(test, /hashFiles\('crashtest\.config\.js'\)/, 'the crashtest lane must arm-gate on the config')
  // The release ladder installs the tool in EVERY job that calls it (the
  // release job calls `coreforge release-notes`), so a lockless adopter is not
  // left with a missing CLI.
  const pub = fs.readFileSync(path.join(ADOPTER, '.github', 'workflows', 'publish.yml'), 'utf8')
  const installs = (pub.match(/npm (?:ci|install)[^\n]*--no-(?:fund|audit)/g) || []).length
  assert.ok(installs >= 3, `every publish job that calls coreforge must install it (found ${installs} install steps)`)
  assert.doesNotMatch(pub, /nothing to install at the root/,
    'a lockless adopter still needs the coreforge tool installed - the no-op branch is wrong here')
})

test('the template ships the packs slot (README + gitignore + public/.gitkeep)', () => {
  for (const rel of ['packs/README.md', 'packs/.gitignore', 'packs/public/.gitkeep']) {
    assert.ok(fs.existsSync(path.join(OUT, rel)), `templates/site/${rel} must exist`)
  }
})

test('the template ships a .gitignore', () => {
  assert.ok(fs.existsSync(path.join(OUT, '.gitignore')), 'templates/site/.gitignore must exist')
})

test('the template carries no identity literal of the dogfood brand (only tokens)', async () => {
  const site = (await import(pathToFileURL(path.join(ROOT, 'site.config.js')).href)).default
  const literals = [site.name, site.author, site.docs.url, site.url]
  const hits = []
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) { walk(p); continue }
      if (/\.(png|jpe?g|ico|woff2?|ttf|otf|gif|webp|avif|pdf)$/i.test(e.name)) continue
      // docs/cli.md is copied VERBATIM: it is prose about the `coreforge`
      // tool (the command an adopter runs), whose name is also this repo's
      // dogfood brand. The command must not be renamed, so this one file
      // legitimately carries the word.
      if (path.relative(OUT, p) === path.join('docs', 'cli.md')) continue
      const text = fs.readFileSync(p, 'utf8')
      for (const lit of literals) if (lit && text.includes(lit)) hits.push(`${path.relative(OUT, p)}: "${lit}"`)
    }
  }
  walk(OUT)
  assert.deepEqual(hits, [], `template carries dogfood identity:\n${hits.join('\n')}`)
})

test('the template carries the token vocabulary (so `create` has something to stamp)', () => {
  const text = fs.readFileSync(path.join(OUT, 'site.config.js'), 'utf8')
  assert.match(text, /__NAME__/, 'site.config.js must carry __NAME__')
})

test('template is deterministic: a rebuild leaves the bytes identical', () => {
  const before = {}
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) { walk(p); continue }
      before[path.relative(OUT, p)] = fs.readFileSync(p).toString('base64')
    }
  }
  walk(OUT)
  const r = run()
  assert.equal(r.code, 0, r.out)
  for (const [rel, b64] of Object.entries(before)) {
    assert.equal(fs.readFileSync(path.join(OUT, rel)).toString('base64'), b64, `${rel} changed on rebuild`)
  }
})
