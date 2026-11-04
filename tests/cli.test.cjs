// tests/cli.test.cjs - the create CLI's own battery (PRD 6).
//
// The house rule: a new law ships with a fixture that breaks it. The CLI's
// load-bearing promise is "generated green is never shipped" - so we prove
// the round trip (create -> sync -> doctor is PASS) AND the refusals (a
// missing answer set, an unfilled placeholder, a stale derived surface, an
// unknown verb). Temp dirs; the CLI is spawned as a subprocess so the exit
// code is what CI sees.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { mkdtempSync, writeFileSync, existsSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, dirname, resolve } = require('node:path');

const REPO_ROOT = resolve(dirname(__filename), '..');
const CLI = join(REPO_ROOT, 'bin', 'coreforge.mjs');

function tmp() {
  return mkdtempSync(join(tmpdir(), 'coreforge-cli-'));
}
function cli(args, opts = {}) {
  return spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8', ...opts });
}

test('create refuses a missing answer set (no name/url/repo)', () => {
  const dir = tmp();
  try {
    const res = cli(['create', dir]);
    assert.equal(res.status, 1);
    assert.match(res.stderr, /missing name, url, repo/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('create + sync + doctor is a clean round trip', () => {
  const dir = tmp();
  try {
    writeFileSync(join(dir, 'site.json'), JSON.stringify({
      name: 'acme', url: 'https://acme.creadev.org', repo: 'https://github.com/acme/acme',
    }));
    const created = cli(['create', dir]);
    assert.equal(created.status, 0, created.stderr);
    assert.match(created.stdout, /create: wrote/);
    // The two tool-coupled lanes the site template excludes are stamped here.
    assert.ok(existsSync(join(dir, '.github', 'workflows', 'test.yml')));
    assert.ok(existsSync(join(dir, '.github', 'workflows', 'publish.yml')));
    // The identity is filled (no surviving token) and the wordmark is the adopter's.
    const cfg = require('node:fs').readFileSync(join(dir, 'site.config.js'), 'utf8');
    assert.doesNotMatch(cfg, /__[A-Z][A-Z_]*__/);
    assert.match(cfg, /name: 'acme'/);

    // The stamped docs caller points at the ONE lane in dhaupin/freestruct -
    // never at the adopter's own author (the __AUTHOR__ token would rewrite
    // `dhaupin` and break the ref). The lane repo is fixed for every adopter.
    const caller = require('node:fs').readFileSync(join(dir, '.github', 'workflows', 'docs-deploy.yml'), 'utf8');
    assert.doesNotMatch(caller, /__[A-Z][A-Z_]*__/, 'the stamped caller must carry no token');
    assert.match(caller, /uses: dhaupin\/freestruct\/\.github\/workflows\/docs-lane\.yml@[0-9a-f]{40}/);
    assert.ok(!existsSync(join(dir, '.github', 'workflows', 'docs-build.yml')),
      'the adopter must not receive a forked docs lane');

    const synced = cli(['sync', dir]);
    assert.equal(synced.status, 0, synced.stderr);
    assert.ok(existsSync(join(dir, 'docs', '_config.yml')));
    assert.ok(existsSync(join(dir, 'web', 'ssr.config.js')));

    const doc = cli(['doctor', dir]);
    assert.equal(doc.status, 0, doc.stdout + doc.stderr);
    assert.match(doc.stdout, /doctor: 0 fail\(s\) - PASS/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('create never clobbers an existing file', () => {
  const dir = tmp();
  try {
    writeFileSync(join(dir, 'site.json'), JSON.stringify({
      name: 'acme', url: 'https://acme.creadev.org', repo: 'https://github.com/acme/acme',
    }));
    assert.equal(cli(['create', dir]).status, 0);
    // The adopter edits their config, then a re-create must leave it alone.
    const cfgPath = join(dir, 'site.config.js');
    writeFileSync(cfgPath, '// host-authored\n' + require('node:fs').readFileSync(cfgPath, 'utf8'));
    const again = cli(['create', dir]);
    assert.equal(again.status, 0, again.stderr);
    assert.match(again.stdout, /skipped/);
    assert.match(require('node:fs').readFileSync(cfgPath, 'utf8'), /^\/\/ host-authored/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('doctor refuses a stale derived surface (generated green is never shipped)', () => {
  const dir = tmp();
  try {
    writeFileSync(join(dir, 'site.json'), JSON.stringify({
      name: 'acme', url: 'https://acme.creadev.org', repo: 'https://github.com/acme/acme',
    }));
    assert.equal(cli(['create', dir]).status, 0);
    // No sync yet: the derived surfaces are absent, so doctor must FAIL.
    const doc = cli(['doctor', dir]);
    assert.equal(doc.status, 1);
    assert.match(doc.stdout, /derived surfaces are stale/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('doctor refuses placeholder residue (the FORGE-TODO law)', () => {
  const dir = tmp();
  try {
    writeFileSync(join(dir, 'site.json'), JSON.stringify({
      name: 'acme', url: 'https://acme.creadev.org', repo: 'https://github.com/acme/acme',
    }));
    assert.equal(cli(['create', dir]).status, 0);
    assert.equal(cli(['sync', dir]).status, 0);
    writeFileSync(join(dir, 'web', 'src', 'leak.js'), 'export const x = "FORGE-TODO"\n');
    const doc = cli(['doctor', dir]);
    assert.equal(doc.status, 1);
    assert.match(doc.stdout, /placeholder residue/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('an unknown verb exits 2 and prints the help', () => {
  const res = cli(['frobnicate']);
  assert.equal(res.status, 2);
  assert.match(res.stderr, /unknown verb/);
});

test('--version answers the packaged version', () => {
  const res = cli(['--version']);
  assert.equal(res.status, 0);
  const pkg = JSON.parse(require('node:fs').readFileSync(join(REPO_ROOT, 'package.json'), 'utf8'));
  assert.equal(res.stdout.trim(), pkg.version);
});
