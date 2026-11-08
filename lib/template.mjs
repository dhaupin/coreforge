#!/usr/bin/env node
/**
 * template.mjs - build templates/site/ from the live dogfood tree.
 *
 * The dogfood (web/ + docs/ + site.config.js) stays in place (PRD 7/9, owner
 * call 2026-10-29). templates/site/ is the COPY SOURCE `coreforge create` will
 * stamp: the same shell, with the identity swapped for monoforge-convention
 * tokens (__NAME__, __SITE_URL__, ...). It is GENERATED, not hand-kept, for
 * the same reason the dogfood stays put: a hand-maintained duplicate drifts,
 * and the whole point of Option 1 was low churn. One generator, one guard.
 *
 *   node lib/template.mjs           write templates/site/
 *   node lib/template.mjs --check   refuse if it has drifted from the tree
 *
 * Deterministic: same tree -> same bytes, no wall clock. The tool half (lib/)
 * is NOT copied - it travels to an adopter by npm install, not by copy. Only
 * the site half (the shell) is templated.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
import { resolveRoot } from './root.mjs'

const ROOT = resolveRoot()
const OUT = join(ROOT, 'templates', 'site')
const site = (await import(pathToFileURL(join(ROOT, 'site.config.js')).href)).default

// The copyable shell: the two sites, the identity file, the per-repo CI
// plumbing that is identity-clean and standalone (the docs lane + its thin
// caller, the staging fast-forward), and the packs/ slot. Two workflows are
// EXCLUDED on purpose: publish.yml publishes THIS package (`coreforge`) and
// calls the dogfood's tool path (`lib/`), and test.yml runs the shell's own
// battery (`npm test` / `npm run check`) with dogfood pins + issue citations -
// both are coupled to the `create` CLI (Phase 2), which stamps an adopter's
// own test + publish lanes wired to the installed tool.
const INCLUDE_DIRS = ['web', 'docs', '.github']
const INCLUDE_FILES = ['site.config.js', '.gitignore', 'packs/README.md', 'packs/.gitignore', 'packs/public/.gitkeep']

// Never copied: deps, build products, locks, and the sync-owned outputs (the
// adopter regenerates those with `coreforge sync` - they are DERIVED, not
// source, and the brand census gate already allows them only as generated).
// publish.yml + test.yml are coupled to the tool package (see above).
const EXCLUDE_DIRS = new Set(['node_modules', 'dist', '.prestruct', '_site', '.bundle', 'vendor', '.jekyll-cache'])
const EXCLUDE_FILES = new Set(['package-lock.json', 'Gemfile.lock'])
const EXCLUDE_RELS = new Set(['.github/workflows/publish.yml', '.github/workflows/test.yml'])

// The shell's OWN brand art. Binary art cannot be tokenized, so a plain copy
// would leak coreforge's mark (and its brand-mark.json data) into every
// stamped site - exactly the leak a real adopter had to fix by hand. Excluded
// here; the neutral placeholder art committed in templates/site/ is what ships
// (see HANDKEPT and the separation guard below).
const EXCLUDE_ART = new Set([
  'web/public/brand/logo.jpg', // the shell's brand master
])

// Hand-kept placeholder art: files whose bytes are a NEUTRAL placeholder, not a
// copy of the dogfood's. The generator never writes them (the dogfood's art
// must not ride along) and never prunes them as stale. The separation guard
// below refuses a rebuild that made any of them byte-identical to the dogfood.
const HANDKEPT = new Set([
  'web/public/icon.svg',
  'docs/icon.svg',
  'web/scripts/brand-mark.json',
  'web/public/icon-192.png',
  'web/public/icon-512.png',
  'web/public/apple-touch-icon.png',
  'web/public/favicon-32.png',
  'web/public/og-image.png',
])
// Copied VERBATIM (no tokenization). The CLI reference is prose about the
// `coreforge` TOOL, whose name is also this repo's dogfood brand: tokenizing
// it would rename the command in every stamped site. The brand census does not
// scan `.md` content, so the doc may name the tool freely. (The CLI page is a
// cross-repo asset - crashtest consumes coreforge's lane - so it ships to
// adopters unchanged.)
const VERBATIM = new Set(['docs/cli.md'])
const SYNC_OWNED = new Set([
  'docs/_config.yml',
  'docs/freestruct.config.yml',
  'web/public/robots.txt',
  'web/public/site.webmanifest',
])

// Identity -> token. Longest/most-specific first so a full URL is not clipped
// by the bare name. Curated, not derived from the census set: the census also
// treats github.com as a domain fragment (harmless for a hardcode scan, wrong
// to tokenize - it would mangle every repo URL).
const TOKENS = [
  [site.docs.url, '__DOCS_URL__'],
  [site.url, '__SITE_URL__'],
  [site.repo, '__REPO_URL__'],
  [site.docs.host, '__DOCS_HOST__'],
  [site.org.url, '__ORG_URL__'],
  [site.maker.label, '__MAKER_LABEL__'],
  [site.org.name, '__ORG_NAME__'],
  [site.docs.baseurl, '__DOCS_BASEURL__'],
  [`${site.name}-site`, '__NAME__-site'],
  [site.name, '__NAME__'],
  [site.author, '__AUTHOR__'],
  // The wordmark halves. They are not identity literals (the census does not
  // hunt them), so they survived the first token pass and leaked the dogfood's
  // "core"/"forge" into every stamped site. They are tokenized as ONE object
  // literal - not as the bare halves - because "forge" is a substring of
  // "monoforge"/"flowforge" and would mangle those prose receipts. The
  // wordmark lives only in site.config.js, and every other surface reads it
  // via `site.wordmark.*`, so one composite token is exact.
  [`{ accent: '${site.wordmark.accent}', rest: '${site.wordmark.rest}' }`, '__WORDMARK__'],
].filter(([from]) => from)

const tokenize = (text) => {
  let out = text
  // The engine repo is FIXED for every adopter: the docs lane always lives in
  // dhaupin/freestruct, so `dhaupin/freestruct` must never become the adopter's
  // author (the __AUTHOR__ token would). Protect it first, as its own token.
  out = out.split('dhaupin/freestruct').join('__LANE_REPO__')
  for (const [from, to] of TOKENS) out = out.split(from).join(to)
  return out
}

function walk(dir, rel, acc) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const r = rel ? `${rel}/${e.name}` : e.name
    if (e.isDirectory()) {
      if (EXCLUDE_DIRS.has(e.name)) continue
      walk(join(dir, e.name), r, acc)
    } else if (!EXCLUDE_FILES.has(e.name)) {
      if (!SYNC_OWNED.has(r) && !EXCLUDE_RELS.has(r) && !EXCLUDE_ART.has(r) && !HANDKEPT.has(r)) acc.push(r)
    }
  }
}

// Build the file map (rel -> tokenized bytes). Binary files are copied byte-
// for-by-byte (no identity lives in a PNG).
function build() {
  const rels = [...INCLUDE_FILES]
  for (const d of INCLUDE_DIRS) walk(join(ROOT, d), d, rels)
  rels.sort()
  const files = new Map()
  const residue = []
  for (const rel of rels) {
    const buf = readFileSync(join(ROOT, rel))
    const isText = !/\.(png|jpe?g|ico|woff2?|ttf|otf|gif|webp|avif|pdf)$/i.test(rel)
    if (!isText) { files.set(rel, buf); continue }
    if (VERBATIM.has(rel)) { files.set(rel, buf); continue }
    const out = tokenize(buf.toString('utf8'))
    // Self-guard: a surviving identity literal means the token map missed a
    // form (e.g. a new spelling), and shipping it would leak the dogfood's
    // brand into every stamped site. Fail at cause, named.
    for (const lit of [site.name, site.author, ...TOKENS.map(([f]) => f)]) {
      if (lit && out.includes(lit)) residue.push(`${rel}: identity literal "${lit}" survived tokenization`)
    }
    files.set(rel, Buffer.from(out, 'utf8'))
  }
  if (residue.length) {
    console.error('template: FAIL (identity residue - add the missing token to TOKENS)')
    for (const r of residue) console.error('  ' + r)
    process.exit(1)
  }

  // Brand-art separation guard. The shell's own binary art is excluded (see
  // EXCLUDE_ART); the template ships a NEUTRAL placeholder instead. If a
  // rebuild ever made a hand-kept art file byte-identical to the dogfood's,
  // the placeholder was overwritten with the shell's mark and every stamped
  // site would ship coreforge's brand. Fail at cause, naming the file.
  const artLeak = []
  for (const rel of HANDKEPT) {
    const tpl = join(OUT, rel)
    const dog = join(ROOT, rel)
    if (existsSync(tpl) && existsSync(dog) && readFileSync(tpl).equals(readFileSync(dog))) {
      artLeak.push(`${rel} is byte-identical to the dogfood's - the placeholder was clobbered by the shell's brand art`)
    }
  }
  if (artLeak.length) {
    console.error('template: FAIL (brand-art leak - the placeholder art must differ from the shell\'s)')
    for (const r of artLeak) console.error('  ' + r)
    process.exit(1)
  }
  return files
}

const check = process.argv.includes('--check')
const files = build()
let drifted = 0

if (!check) {
  mkdirSync(OUT, { recursive: true })
}

// In write mode, clear everything the generator owns (a stale tool-owned file
// must go), but leave the hand-kept placeholder art in place - the generator
// never produces it, so it must never be pruned as stale.
if (!check && existsSync(OUT)) {
  const have = []
  walk(OUT, '', have)
  for (const rel of have) {
    if (HANDKEPT.has(rel) || files.has(rel)) continue
    rmSync(join(OUT, rel), { force: true })
  }
}

for (const [rel, buf] of files) {
  const abs = join(OUT, rel)
  const prev = existsSync(abs) ? readFileSync(abs) : null
  if (prev && prev.equals(buf)) continue
  if (check) {
    console.error(`template: templates/site/${rel} has DRIFTED from the tree - run \`npm run template\``)
    drifted++
  } else {
    mkdirSync(dirname(abs), { recursive: true })
    writeFileSync(abs, buf)
  }
}

// A stale extra file (one the tree no longer has) is drift too. Hand-kept
// placeholder art is not the generator's to own, so it is never stale.
if (check) {
  const want = new Set(files.keys())
  const have = []
  if (existsSync(OUT)) walk(OUT, '', have)
  for (const rel of have) {
    if (HANDKEPT.has(rel)) continue
    if (!want.has(rel)) {
      console.error(`template: templates/site/${rel} is stale (not in the tree) - run \`npm run template\``)
      drifted++
    }
  }
}

if (check && drifted) {
  console.error(`template:check: FAIL (${drifted} drifted file(s))`)
  process.exit(1)
}
console.log(check
  ? `template:check: PASS (${files.size} file(s) current)`
  : `template: PASS (wrote ${files.size} file(s) to templates/site/)`)
