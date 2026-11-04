// check-action-pins.cjs - the family house rule "pins, never floats" (packstruct#69).
//
// Every GitHub Action `uses:` must name a 40-hex commit SHA, never a floating
// tag or branch (`@v4`, `@main`). A floating ref lets the action that runs in
// CI change under us between runs with no commit here - the supply-chain
// surface eyestruct, govstruct, and monoforge all closed; packstruct's
// publish.yml already pinned, but docs/corpus/crashtest/test floated. This
// guard makes the rule mechanical: a future float fails in CI, not in review.
//
// Allowed refs:
//   - a 40-hex SHA (with an optional `# vN` comment, which we also want)
//   - a local action / reusable workflow (`./path/to/action`)
// Docker refs (`docker://image`) are refused too: an unpinned image is the
// same float in a different costume.
//
// No dependencies: reads the workflow files, matches the shape.

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
// Optional argv override of the workflows dir so the guard's own battery can
// drive it over temp fixtures (both ways), per the house test rule. Flags
// (--verify-tags) are separated from the positional dir.
const ARGS = process.argv.slice(2);
const VERIFY_TAGS = ARGS.includes('--verify-tags');
const POSITIONAL = ARGS.filter((a) => !a.startsWith('--'));
const WORKFLOWS = POSITIONAL[0] ? path.resolve(POSITIONAL[0]) : path.join(ROOT, '.github', 'workflows');
const SHA_RE = /^[0-9a-f]{40}$/;

const problems = [];
let checked = 0;
// Pinned refs that carry a `# vN` comment, collected for the OPT-IN tag check
// (--verify-tags): { file, line, ref, sha, tag }. Never consulted by default.
const tagged = [];

if (!fs.existsSync(WORKFLOWS)) {
  console.error(`ACTION PINS: FAIL (${WORKFLOWS} is missing)`);
  process.exit(1);
}

const files = fs
  .readdirSync(WORKFLOWS)
  .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
  .sort();

for (const name of files) {
  const file = path.join(WORKFLOWS, name);
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    // Match `uses: <ref>` with any indentation / list dash; capture the
    // trailing `# <tag>` comment (the human tag the SHA should map to).
    const m = line.match(/^\s*(?:-\s*)?uses:\s*(\S+)\s*(?:#\s*(\S+))?.*$/);
    if (!m) return;
    const ref = m[1].replace(/^["']|["']$/g, '');
    const tag = m[2] || '';
    checked++;

    // Local actions and reusable workflows are in-repo - nothing to pin.
    if (ref.startsWith('./')) return;

    // Everything else must be owner/repo@<40-hex>.
    const at = ref.lastIndexOf('@');
    const sha = at === -1 ? '' : ref.slice(at + 1);
    if (at === -1 || !SHA_RE.test(sha)) {
      problems.push(`${name}:${i + 1}: floating ref "${ref}" - pin to a 40-hex SHA`);
      return;
    }
    // A SHA with no tag comment is legal but unreadable; nudge (not a failure).
    if (!tag) {
      problems.push(`${name}:${i + 1}: "${ref}" is pinned but carries no "# vN" tag comment`);
    } else {
      tagged.push({ file: name, line: i + 1, ref, sha, tag });
    }
  });
}

// --- OPT-IN: verify the human tag comment maps to the pinned SHA -----------
// The pin gate only checks the SHA shape, so a lying tag comment (the class
// this repo already paid for: setup-node labeled `# v5` while pinned to v7)
// is invisible to it. This leg resolves each `owner/repo@sha` against the
// GitHub API and asserts the comment's tag actually points at that SHA.
// It is OPT-IN (--verify-tags) and degrades to an honest SKIP offline or
// unauthenticated, so the default gate stays hermetic and offline-first.
async function verifyTags() {
  if (!VERIFY_TAGS) return { mismatches: [], skipped: 0, checked: 0 };
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
  const mismatches = [];
  let skipped = 0;
  let checkedTags = 0;
  const cache = new Map(); // "slug@tag" -> sha | null (null = unresolved)
  for (const { file, line, ref, sha, tag } of tagged) {
    const slug = ref.split('@')[0];
    const key = `${slug}@${tag}`;
    let target = cache.get(key);
    if (target === undefined) {
      target = null;
      try {
        // GET /commits/{ref} resolves any ref (tag included) to its commit.
        const res = await fetch(`https://api.github.com/repos/${slug}/commits/${encodeURIComponent(tag)}`, {
          headers: {
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) target = (await res.json()).sha || null;
      } catch {
        target = null;
      }
      cache.set(key, target);
    }
    if (target === null) { skipped++; continue; }
    checkedTags++;
    if (target !== sha) {
      mismatches.push(`${file}:${line}: "${ref}" is commented "# ${tag}" but ${slug}@${tag} points at ${target.slice(0, 7)}, not ${sha.slice(0, 7)}`);
    }
  }
  return { mismatches, skipped, checked: checkedTags };
}

// A missing tag comment is a readability nudge, not a supply-chain break, so
// it does not fail the gate - but it prints, because the family writes them.
const hard = problems.filter((p) => !/tag comment/.test(p));
const soft = problems.filter((p) => /tag comment/.test(p));

if (hard.length > 0) {
  console.error(`ACTION PINS: FAIL (${hard.length} floating ref(s) - the house rule is "pins, never floats")`);
  for (const p of hard) console.error('  ' + p);
  process.exit(1);
}
for (const p of soft) console.log('  note: ' + p);

verifyTags().then((vt) => {
  if (vt.mismatches.length) {
    console.error(`ACTION PINS: FAIL (${vt.mismatches.length} tag comment(s) disagree with the pinned SHA)`);
    for (const m of vt.mismatches) console.error('  ' + m);
    process.exit(1);
  }
  if (VERIFY_TAGS) {
    console.log(vt.skipped
      ? `ACTION PINS: tag check: ${vt.checked} verified, ${vt.skipped} SKIPPED (offline or unauthenticated)`
      : `ACTION PINS: tag check: ${vt.checked} tag comment(s) verified against the pinned SHA`);
  }
  console.log(`ACTION PINS: PASS (${checked} ref(s) across ${files.length} workflow(s), all SHA-pinned)`);
});
