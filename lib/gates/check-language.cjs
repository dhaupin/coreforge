#!/usr/bin/env node
/**
 * Language gate - contributor-facing prose is English-only.
 *
 * Why: scripted agents can drift into another language mid-session; committed
 * prose a HUMAN reads must be readable by every nationality, and English is
 * what the OSS landscape runs on. This is the family gate (canon:
 * dhaupin/monoforge scripts/check-language.cjs), carried here so the shell
 * gates its own prose the same way its adopters do.
 *
 * Contract:
 * 1. SCAN SCOPE: docs/, labs/, markdown under .github/ (any depth), and the
 *    root meta set (README / AGENTS / CHANGELOG / CONTRIBUTING / LEGAL /
 *    DEPLOY / ROADMAP / SECURITY / CODE_OF_CONDUCT .md). Code comments are
 *    out of scope - that is PR-review matter, not committed prose.
 * 2. DETECTION = Unicode script-block longest run, not a word blocklist. For
 *    each Han/Hiragana/Katakana/Hangul/Cyrillic/Arabic/Hebrew/Devanagari/
 *    Thai/Greek block, the longest contiguous run per line; flag when it is
 *    >= MIN_RUN (3 reads as writing; 2 can be a transliterated name).
 * 3. ALLOWLIST BY CONSTRUCTION: URL-bearing lines, import/export/require
 *    lines, base64-ish blobs, fenced code, inline-code spans, and the
 *    LINT_LANGUAGE_ALLOW_RE env regex (intentional bilingual docs opt out
 *    without editing the checker).
 * 4. FAILURE CONTRACT: exit 1 with `path:line <script> (N chars): <line>`;
 *    PASS prints `LANGUAGE GATE: PASS (English-only) -- N prose files scanned`.
 *
 * Root resolution follows the family tool rule (lib/root.cjs): walk up to the
 * nearest site.config.js, honoring --root <dir> for tests and adopters.
 */
const fs = require('fs')
const path = require('path')
const { resolveRoot } = require('../root.cjs')

const ROOT = resolveRoot()

// ---- DATA: tune here -------------------------------------------------
const MIN_RUN = 3
const SCAN_DIRS = ['docs', 'labs']
const SCAN_GLOBS_DIR = '.github'
const SCAN_ROOT_META =
  /^(README|AGENTS|CHANGELOG|CONTRIBUTING|LEGAL|DEPLOY|ROADMAP|SECURITY|CODE_OF_CONDUCT).*\.md$/

// The per-script run functions: longest run of consecutive code points of the
// same script on a line.
const CHAR_TESTS = {
  Han: (c) => /\p{Script=Han}/u.test(c),
  Hiragana: (c) => /\p{Script=Hiragana}/u.test(c),
  Katakana: (c) => /\p{Script=Katakana}/u.test(c),
  Hangul: (c) => /\p{Script=Hangul}/u.test(c),
  Cyrillic: (c) => /\p{Script=Cyrillic}/u.test(c),
  Arabic: (c) => /\p{Script=Arabic}/u.test(c),
  Hebrew: (c) => /\p{Script=Hebrew}/u.test(c),
  Devanagari: (c) => /\p{Script=Devanagari}/u.test(c),
  Thai: (c) => /\p{Script=Thai}/u.test(c),
  Greek: (c) => /\p{Script=Greek}/u.test(c),
}

/** Longest per-line run per script. Returns [{name, run}]. */
function findScriptRuns(line) {
  const out = []
  for (const [name, test] of Object.entries(CHAR_TESTS)) {
    let max = 0
    let cur = 0
    for (const ch of line) {
      if (test(ch)) { cur++; if (cur > max) max = cur } else cur = 0
    }
    if (max > 0) out.push({ name, run: max })
  }
  return out
}

// ---- Allowlist -------------------------------------------------------
function isAllowed(line) {
  if (/https?:\/\//.test(line)) return true
  if (/^\s*(import|export|require)\b/.test(line)) return true
  if (/[A-Za-z0-9+/]{40,}={0,2}/.test(line)) return true
  const env = process.env.LINT_LANGUAGE_ALLOW_RE
  if (env) { try { if (new RegExp(env).test(line)) return true } catch { /* hostile regex - ignore, keep scanning */ } }
  return false
}

// ---- Scan ------------------------------------------------------------
const files = []
const walkInto = (base) => {
  if (!fs.existsSync(base)) return
  ;(function walk(d) {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name)
      if (f.isDirectory()) walk(p)
      else if (f.name.endsWith('.md')) files.push(p)
    }
  })(base)
}
for (const dir of SCAN_DIRS) walkInto(path.join(ROOT, dir))
walkInto(path.join(ROOT, SCAN_GLOBS_DIR))
for (const f of fs.readdirSync(ROOT)) {
  if (fs.statSync(path.join(ROOT, f)).isFile() && SCAN_ROOT_META.test(f)) files.push(path.join(ROOT, f))
}
const seen = new Set()
const unique = files.filter((f) => { if (seen.has(f)) return false; seen.add(f); return true })

let issues = 0
const findings = []
for (const f of unique) {
  const rel = path.relative(ROOT, f)
  const lines = fs.readFileSync(f, 'utf8').split('\n')
  let inFence = false
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    if (/^\s*```/.test(line)) { inFence = !inFence; continue }
    if (inFence) continue
    line = line.replace(/`[^`]*`/g, '')
    if (isAllowed(line)) continue
    for (const r of findScriptRuns(line)) {
      if (r.run >= MIN_RUN) {
        findings.push(`${rel}:${i + 1} ${r.name} (${r.run} chars): ${lines[i].trim().slice(0, 100)}`)
        issues++
      }
    }
  }
}
for (const f of findings) console.log(f)
console.log(issues === 0
  ? `LANGUAGE GATE: PASS (English-only) -- ${unique.length} prose files scanned`
  : `LANGUAGE GATE: FAIL (${issues} findings in ${unique.length} prose files)`)
process.exit(issues === 0 ? 0 : 1)
