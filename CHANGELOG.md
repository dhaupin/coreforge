# Changelog

All notable changes to the flowforge shell. The released version lives in `package.json` + `web/package.json` (kept equal by a same-commit bump - the Version protocol lives in [AGENTS.md](./AGENTS.md)). Releases go out on `vX.Y.Z` git tags via npm Trusted Publishing - the runbook is [DEPLOY.md](./DEPLOY.md).

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), [SemVer](https://semver.org/). `packs/<name>/pack.json` manifests carry THEIR OWN semver, independent of the CLI/shell - see [packs/README.md](./packs/README.md).

## [Unreleased] - staging (2026-10-29)

### The Jekyll filter gate refuses unknown Liquid tags (2026-11-04)

The docs gate refused the two-argument single-arg filter trap but not the other build-time construct class: an UNKNOWN tag. `{% seo %}` written in prose kills the Jekyll build ("Unknown tag 'seo' in packs.md") because this repo's docs ship no theme gem and no jekyll-seo-tag plugin - backticks are markdown, not Liquid escaping, so the tag still parses. This is the one rule eyestruct's and govstruct's vendored copies already carried; the rig's copy lacked it.

- `lib/gates/check-jekyll-filters.cjs` - a second rule: any tag outside the Jekyll 4.x set refuses with a file:line, and `{% raw %}` regions are blanked (line count preserved, so `file:line` stays honest) so a literal example survives. The tool half carries the rule to every adopter by `npm update`; no vendored copy ships in the template.
- `tests/jekyll-filters.test.cjs` (new) - five legs: the repo's own docs pass, an unknown tag refuses by name, a `{% raw %}`-wrapped literal is exempt, the two-arg filter rule still refuses, and a known tag passes (the set is not over-refused).

### The link gate refuses page-relative links; the Ruby leg is one version (2026-11-04)

A family-wide sweep of the docs link gates found one shared blind spot and one stale drift.

- **`lib/gates/check-docs-links.cjs`** - a page-relative link (`./x`, `../x`) was resolved against the SOURCE tree, which always holds the file, so a served-broken link never bit. On a no-trailing-slash permalink page the browser reads `<baseurl>/foo` as a FILE and resolves the relative target one level off - a real 404 (the gistory + poststruct `discussions` break, found in the family-wide crawl). Internal links are root-absolute; the gate now refuses the relative shape by name. This gate ships to every adopter via `coreforge check`, so the fix reaches them by `npm update`.
- **`tests/docs-links.test.cjs`** (new) - proves the leg bites: a root-absolute link to a real page passes, `./x` and `../x` are refused by name, and an external link is the author's business.
- **`.github/workflows/test.yml` + `templates/adopter/.github/workflows/test.yml`** - the docs Jekyll build ran on Ruby **3.2** while the docs lane (`docs-deploy.yml`) and the Gemfile note run **3.4** (bigdecimal is a 3.4 bundled gem). That is the exact drift the docs-lane consolidation removed, left stale in the battery; both legs now build on 3.4.
- **`tests/workflow-ruby-parity.test.cjs`** (new) - holds every Ruby leg in the tree (dogfood + adopter template, test + docs lanes) to ONE version, so the drift cannot come back silently.
- **Receipts:** `npm test` 111 pass / 0 fail; `npm run check` green (sync:check, template:check, brand-census, pins, language all PASS); `npm run lint:docs` 6/6 PASS.
- **No version bump** (0.9.0 = 0.9.0); v1.0.0 is still held.

### The docs-lane canon: origin-only site.url + basePath (2026-11-04)

The consolidation put the whole family on one reusable docs lane, and the lane runs the strict link check by default. That turned two latent config bugs into a red `main`: **coreforge and govstruct were the only two repos whose `docs/freestruct.config.yml` baked the deploy path into `site.url` and omitted `basePath`** - the non-canon shape every other family repo (eyestruct, monoforge, gistory, crashtest, packstruct, poststruct, prestruct) had already moved off. freestruct joins `site.url + basePath + slug`, so with no `basePath` to strip, the link checker resolved every root-absolute `/coreforge/...` href against the output tree and reported it missing: 12 false-positive broken links, build failed.

- **`lib/sync.mjs`** - the `docs/freestruct.config.yml` generator now emits the canon: `site.url` is the ORIGIN (`docs.host`), a new `basePath` key carries the deploy path (`docs.baseurl`), and `linkCheck: true` is explicit. This is the one-source fix - the generated file follows, and a hand edit stays drift.
- **`docs/freestruct.config.yml`** - regenerated from `site.config.js` (the derived surface, not hand-kept).
- **`tests/brand-contract.test.cjs`** - a new law with a fixture that breaks it: the generated config must be canon-shaped, and the guard is proven to refuse the pre-fix shape (path baked into `site.url`; missing `basePath`) - a check that never fails proves nothing.
- **`docs/cli.md` + its `templates/site/docs/cli.md` copy** - the second, deeper bug the strict gate then surfaced: the nav links `/cli/` (a DIRECTORY route), but `cli.md` declared `permalink: cli`, which Jekyll resolves to `cli.html` (a flat file). freestruct's checker reads a trailing-slash href as a directory route (index first, then the `.html` sibling), so `/coreforge/cli/` was a genuine 404 - it had simply never been checked while `linkCheck` was off. `permalink: cli/` builds `cli/index.html`, matching the nav (and the sibling `discussions/`, which was already correct). Verified against a real Jekyll build: the mismatch produced `cli.html` and the checker reported the nav link broken; the fix builds `cli/index.html` and `checkLinks` returns 0 broken. A third law in `tests/docs-frontmatter.test.cjs` holds every nav url to its page's route shape, with a planted mismatch proving it bites.
- **Receipts:** `npm test` 107 pass / 0 fail; `npm run check` green (sync:check, template:check, brand-census, pins all PASS); a local Jekyll build + the real `checkLinks` engine confirm 0 broken links.
- **No version bump** (0.9.0 = 0.9.0); v1.0.0 is still held.

### The adopter template: family tool slots and an honest release gate (2026-11-04)

A parity audit of `templates/` against the nine live family sites. The site half (`templates/site/`) was already a clean tokenized copy; the gaps were in the two tool-coupled adopter files, and in the shell's own receipts.

- **`templates/adopter/.github/workflows/test.yml`** - the stamped battery gains the family tool slots coreforge's own battery already carries: **packstruct** (wired, through the `coreforge lint-packs` wrapper verb, so an empty `packs/` is a clean "0 packs checked" and the first `pack.json` is gated from its first commit) and **crashtest** (arm-gated on `crashtest.config.js` - an unconfigured `crashtest run` is a hard exit 2, never a pass). poststruct/eyestruct/govstruct are named TBA in the header (no meaningful role for a fresh static site yet - wiring them would be theater).
- **`templates/adopter/package.json`** - gains `prepublishOnly` (`npm run check && npm run sync:check`) and `lint:packs` (`coreforge lint-packs`). The stamped `publish.yml` documents that the battery rides `prepublishOnly`, but the stamped `package.json` shipped no such script - so the release gate it advertised did not exist.
- **`templates/adopter/.github/workflows/publish.yml`** - two real release-path bugs fixed: the publish job's install block was a NO-OP for a lockless adopter (`create` stamps no root lockfile), so the `coreforge` CLI that `prepublishOnly` calls would be missing; and the `release` job called `npx --no-install coreforge release-notes` with NO install step at all. Both jobs now install the tool (`npm ci` when a lockfile ships, else `npm install`). The header also states the activation contract plainly: a stamped site is `"private": true`, so the registry cut is off until the adopter removes it.
- **`tests/cli.test.cjs` + `tests/template.test.cjs`** - fixtures for the new laws: the stamped `package.json` must carry the `prepublishOnly` gate and the `lint:packs` verb, and the adopter lanes must carry the packstruct slot, the arm-gated crashtest, and an install step in every publish job that calls `coreforge`.
- **Stale receipts cleaned** (the prestruct 1.2.0 bump retired `repair-404.cjs`, but three receipts still described it as present): `.github/workflows/test.yml`'s build comment, the `MANIFEST.md` row (now `DELETED`, mirroring the `docs-build.yml` precedent), and the `CHANGELOG.md` "Blocked" bullet (now `Resolved`). The prestruct floor/guard/engine-refresh work also gets its own changelog section (it was committed without one).
- **Receipts:** `npm test` 103 pass / 0 fail; `npm run check` green; `create` -> `sync` -> `doctor` round trip PASS (53 files, stamped `prepublishOnly` present); both adopter workflows YAML-parse.
- **No version bump** (0.9.0 = 0.9.0); v1.0.0 is still held.

### The prestruct floor, the pin guard, and the engine refresh (2026-11-04)

The family's second drift class, closed: the **prestruct version floor** and the **vendored engine copies** that rode it. The shell had declared `prestruct: ^1.0.0` (lockfile frozen at 1.1.0, missing the 404-head fix), while the rest of the fleet had forked across `^1.0.0`, a bare github commit, and `^1.2.0`. Nothing held the line.

- **`web/package.json` + `templates/site/web/package.json`** - `prestruct` moved `^1.0.0` -> `^1.2.0`; the lockfile resolves 1.2.0. This is the pin bump the `repair-404` retirement was pinned to (see "Blocked", resolved).
- **`web/scripts/repair-404.cjs`** - deleted (with its template copy). The 1.2.0 engine emits the 404 head correctly, so the workaround is dead weight; `web/package.json`'s `build` is now plain `prestruct build`.
- **`lib/check-prestruct-pins.cjs`** (new) + `tests/check-prestruct-pins.test.cjs` - the family floor guard, zero-dependency: every `prestruct` declaration must be a semver spec at or above `^1.2.0` (never a bare `github:`/`file:` float), and a committed lockfile must resolve at or above it too. Wired as `npm run lint:prestruct-pins`, into `npm run check`, and it rides the release gate. The 10-case battery proves it bites both ways.
- **Vendored engine files refreshed** to the prestruct 1.2.0 engine, byte-identical: `web/src/islands.js` (the island observer-lifecycle dedup) and `web/src/hooks/usePageMeta.js` (the react-router 6/7 interop and the trailing-slash canonical fix), in both `web/` and `templates/site/web/`.
- **`web/index.html`** - the favicon/identity comment no longer writes the literal `<title>` markup: prestruct's duplicate-title audit is comment-blind (a raw tag-name count), so the prose read as a second title element and failed the build. Reworded to "the title tag".
- **`templates/site/`** - regenerated (50 files, `template:check` PASS).
- **Receipts:** `npm test` 102 pass / 0 fail; `npm run check` green (template:check, brand census, birth-gate, both pin guards); `npm run lint:docs` PASS; `npm run build --prefix web` ends `audit: 0 failures`, 404 head clean (no `$1`/`$2`).
- **No version bump** (0.9.0 = 0.9.0); v1.0.0 is still held.

### The docs-lane consolidation: one lane, no fork (2026-11-04)

The shell shipped its own reusable docs lane (`docs-build.yml`). That fork was the same runbook as `dhaupin/freestruct`'s `docs-lane.yml`, and the two had already drifted - ruby 3.2 vs 3.4, a pagefind `latest` scrape vs an npm pin, no `strict`, no crashtest gate. The exact disease the lanes were built to cure, recreated one level up. The fork is gone: the family builds docs from ONE lane, and the shell is a caller like every sibling.

- **`.github/workflows/docs-build.yml`** - deleted. Its receipts (the hardened pagefind scrape, the pinned freestruct install) now live in the one lane.
- **`.github/workflows/docs-deploy.yml`** - now a thin caller: `uses: dhaupin/freestruct/.github/workflows/docs-lane.yml@<sha>`, with `ruby-version: '3.4'` (the Gemfile's `bigdecimal` note is a Ruby 3.4 fact) and `freestruct-version: '1.2.0'` (exact, never a range). The caller owns the trigger, permissions, concurrency, and its input pins; the lane owns the runbook, the pinned tool installs, and the main-gated deploy job.
- **`templates/site/`** - stops shipping a forked lane (51 files, was 52). A stamped site gets the thin caller, not a copy; `tests/template.test.cjs` asserts `docs-build.yml` is ABSENT, so the drift cannot return through the template.
- **`lib/check-action-pins.cjs`** - the opt-in `--verify-tags` slug now takes the first two path segments, so a cross-repo reusable ref (`owner/repo/.github/workflows/x.yml@sha`) resolves to the right repo.
- **README / DEPLOY.md / AGENTS.md** - the docs-lane story now names the one lane and the caller shape.
- **Receipts:** `npm test` 91 pass / 0 fail; `npm run check` green (birth-gate 4 workflows, 9 pins, reusable call verified); `npm run lint:docs` 6/6 PASS; `template:check` PASS (51 files).
- **No version bump** (0.9.0 = 0.9.0); a workflow consolidation, not a released surface.

### The `create` CLI and the template's tool-coupling (2026-11-04)

Phase 2 of the shell: the `coreforge` command exists. `bin/coreforge.mjs` ships the five site verbs (PRD §6 - `create` / `sync` / `build` / `check` / `doctor`) plus three release verbs (`verify-release` / `release-notes` / `lint-packs`) that forward to the `lib/` scripts the family's `publish.yml` already calls. The load-bearing law is monoforge's: generated green is never shipped - `doctor` refuses placeholder residue, a stale derived surface, and a failing gate, and an unfilled slot is a failure, not a warning.

- **`bin/coreforge.mjs`** (new) - the CLI. `create` fills every site-template token from a `site.json` answer file (or `--name`/`--url`/`--repo` flags), writes the site half plus the two adopter CI lanes, refuses a surviving `__TOKEN__` by name, and never clobbers an existing file. `sync`/`sync --check` drive `lib/sync.mjs`. `check` runs the gate set over the tree. `doctor` runs config + residue + derived-freshness + `check`. The release verbs are passthroughs to the `lib/` scripts, run from the adopter's root.
- **`package.json`** - `bin.coreforge` added; `files` now ships `bin/`; `js-yaml` moved from `devDependencies` to `dependencies` (the birth-gate and `sync` parse YAML at runtime, so an adopter's install must carry it); `bin/coreforge.mjs` added to the `check` script.
- **`templates/adopter/`** (new) - the two tool-coupled CI lanes `create` stamps into an adopter: `test.yml` (the gates over the adopter's tree, via `npx coreforge check` + `sync --check`) and `publish.yml` (the release ladder, via `npx coreforge release-notes` / `verify-release`). The site template excludes these two on purpose (they call the `coreforge` package, not the dogfood's `lib/`).
- **`lib/release-notes.cjs`** - resolves the repo root from `process.cwd()` (was `__dirname/..`), so an adopter running the installed copy reads THEIR `package.json` + `CHANGELOG.md`. The dogfood is unchanged (its cwd is the repo root).
- **`lib/verify-release.cjs`** - the consumer load probe no longer treats `bin` as a loadable root (a bin-only CLI has no require-able main); a `bin` is proven by the separate `bin --version` leg. Fixes the pack-ladder regression the new `bin` entry introduced.
- **`lib/check-action-pins.cjs`** - an opt-in `--verify-tags` leg resolves each pinned `owner/repo@sha` against the GitHub API and refuses a `# vN` comment whose tag does not point at that SHA (the class this repo already paid for: `setup-node` labeled `# v5` while pinned to v7). Offline or unauthenticated it degrades to a named SKIP, so the default gate stays hermetic.
- **`docs/cli.md`** (new) - the CLI reference (the five site verbs, the create flow, what the tool owns vs what the adopter owns), added to `docs/_data/nav.yml`. Copied VERBATIM into the template: it is prose about the `coreforge` command, whose name is also the dogfood brand, so tokenizing it would rename the command in every stamped site.
- **`lib/template.mjs`** - a `VERBATIM` set copies a file untokenized; the identity-residue guard and the template test both allow it by name.
- **`site.config.js`** - the comment that cited `labs/prd-flowforge.md` (a stale filename an adopter would not have) now states the derivation model inline.
- **`tests/cli.test.cjs`** (new) - 7 cases: the round trip (create -> sync -> doctor PASS), the missing-answer refusal, never-clobber, the stale-surface refusal, the residue refusal, the unknown verb (exit 2), and `--version`. `tests/check-action-pins.test.cjs` +2 (the default run makes no network call; `--verify-tags` skips honestly offline).
- **Receipts:** `npm test` 91 pass / 0 fail; `npm run check` green; `npm run lint:docs` 6/6 PASS; a real `create` -> `sync` -> `doctor` round trip in a temp dir is PASS.
- **No version bump** (0.9.0 = 0.9.0); v1.0.0 is held until the CLI is proven in the family, not cut here.

### Family parity: CI truth, the language gate, and a fuller template (2026-11-04)

The shell's CI and gates were audited against the nine struct-family repos and brought into line: the release ladder, the docs lane, the gate set, and the generated template.

- **Action-pin comments corrected.** `actions/setup-node@949feb24...` was labeled `# v5` in `release.yml` (twice) and `docs-build.yml` but is v7 (verified against the upstream tag); `test.yml` already said v7. The three comments now read `# v7`, so the human tag matches the SHA everywhere.
- **Publish step aligned to the family canon.** Dropped `--access public` (`npm publish --provenance` is the family shape; the flag is a no-op for an unscoped name) and dropped the `registry-url` from the publish job's `setup-node` - a registry-url writes an `.npmrc` expecting `NODE_AUTH_TOKEN`, which the tokenless OIDC flow does not have.
- **`lib/gates/check-language.cjs`** (new) - the family language gate: committed prose (docs/, labs/, `.github/**.md`, the root meta set) is English-only, detected by Unicode script-block longest run. Adapted to the shell's `lib/root.cjs` resolver; wired as `npm run lint:language` and into `npm run check`. Ships with `tests/language-gate.test.cjs` (7 behavior cases: the live tree, English pass, a flagged run, the 2-vs-3 char threshold, fenced + inline-code exemptions, the env escape hatch).
- **`.github/workflows/staging-ff-sync.yml`** (new) - the family automation that fast-forwards the permanent `staging` branch to `main` after a promotion (a fast-forward-only refspec; a divergence fails loudly). The shell previously left this as a manual step.
- **`templates/site/`** - the generated copy source now carries the per-repo CI plumbing (the docs lane + its thin caller + the staging fast-forward), the `.gitignore`, and the `packs/` slot, alongside the site half. The two tool-coupled workflows (`release.yml`, which publishes the `coreforge` package and calls the dogfood's `lib/`; and `test.yml`, the shell's own battery) are excluded until the `create` CLI stamps an adopter's own. 43 -> 51 files.
- **`tests/template.test.cjs`** - new assertions for the CI plumbing, the `packs/` slot, the `.gitignore`, and the two exclusions.
- **`release.yml` -> `publish.yml`** (file + `name:`) - the family canon names the tag-driven ladder `publish.yml` (all nine siblings); the shell's own PRD §10 names it `publish.yml` too. The rename was a holdover from the pre-parity convention (recorded as such in an earlier TASKS entry). Nothing cross-references the file, and no branch protection pinned the check name, so the rename is safe; the ladder's shape is unchanged.
- **Receipts:** `npm test` 82 pass / 0 fail; `npm run check` green (5 workflows parsed, 14 pins SHA-pinned, brand census, sync, template, theme parity, language gate); `npm run lint:docs` 6/6 PASS.
- **No version bump** (0.9.0 = 0.9.0); a parity pass, not a released surface.

### The rename: flowforge -> coreforge (2026-11-03)

The shell is renamed **coreforge** (govstruct PRD §16.5). It is also a collision fix: `flowforge` on npm is owned by an unrelated party, so the package could never publish under that name; `coreforge` is free on npm and GitHub. The repo is `dhaupin/coreforge`, the site `coreforge.creadev.org`, the docs `docs.creadev.org/coreforge`.

- `site.config.js` - the one identity source, swapped: name, wordmark (`core`/`forge`), url, repo, docs block, nav, route meta. `npm run sync` then regenerated the derived surfaces (`docs/_config.yml`, `docs/freestruct.config.yml`, `web/public/robots.txt`, `web/public/site.webmanifest`), and `npm run template` re-tokenized `templates/site/`.
- Living references updated across `.github/workflows/*`, `lib/*`, `tests/*`, `web/scripts/*`, `web/src/*`, `AGENTS.md`, `README.md`, `DEPLOY.md`, `docs/`; lockfiles regenerated.
- Frozen receipts kept as written: this changelog's earlier sections, `MANIFEST.md`, `labs/TASKS.md`, `labs/prd-flowforge.md`, and code comments citing `flowforge#N` - the rename changes what is live, never what happened.
- No version bump (0.9.0 = 0.9.0); a rename pass, not a released surface.

### Canon parity: the release ladder, the phone lane, and prose flow (2026-11-04)

The shell carried its own cut of the family release tooling, and the copies had drifted from the canon the nine struct-family repos now share. This brings the shell into line: the same ladder, the same phone lane, the same prose convention.

- `lib/verify-release.cjs` - refreshed to the family canon. The expected-set authority is now a REAL `npm pack` of this tree (never a `--dry-run --json` parse, which some npm builds answer with empty stdout and which read as a capability failure on a clean tree); the two 1.2.0-cut regressions are fixed (`releaseTargetMatches` accepts a branch-name `target_commitish`, `registryHasVersion` waits out read-replica lag); the ladder is dry-run safe (strips `npm_config_dry_run`); and `--asset` asserts an attached release asset's sha512 equals the registry's own integrity.
- `lib/release-notes.cjs` - the changelog-section extractor the release job feeds to the GH release body, landed for parity (refuses an absent/empty section by name).
- `lib/ship-from-download.cjs` - the phone publish lane, refreshed: the staged `.npmrc` now carries the `_authToken` line ONLY. The deprecated `always-auth` line is dropped because npm >=9 warns "Unknown project config", and that warning reaches the child npm processes and can corrupt `npm pack --dry-run --json` on some builds.
- `lib/check-action-pins.cjs` - the family "pins, never floats" guard, wired as `npm run lint:pins` and inside `npm run check`: every `uses:` must name a 40-hex commit SHA (a local `./path` action is exempt; a `docker://` image is refused).
- `.github/workflows/release.yml` - the publish step is idempotent (skips when the registry already serves this version), the release job attaches the EXACT served tarball (polled, since the read replica lags), and the verify job runs the full `--npm` + `--gh --asset` trust ladder.
- `tests/release-verify.test.cjs` + `tests/check-action-pins.test.cjs` - the canon test legs, run offline on every push.
- `lib/unwrap-prose.cjs` + the AGENTS.md prose-flow law - the shell adopts the family flowing-prose convention: paragraphs never hard-wrap at commit time, and the tool joins them without touching frontmatter, fences, indented code, tables, headings, thematic breaks, or HTML blocks. Living prose across README/AGENTS/DEPLOY/MANIFEST/packs/labs is flowed.

### The family roster names all five arms (2026-10-29)

`packs/README.md` "Who owns what" named three of the five arms (packstruct, crashtest, poststruct). It now names the full set: eyestruct (the `check`-profile capture lane, conformance-checked through the same pinned SPEC) and govstruct (the govern arm - `registry.v1.json` + `members/<id>.json`, the roster this rig's site half is a member of), plus a line making explicit that coreforge and monoforge are the two forges that compose a member, not arms themselves.

### Petrol is the shell default; iris retires (2026-10-29)

The shell shipped four paint schemes with iris (a flat indigo) as the default. Iris and petrol are near-identical in practice - both carry an indigo accent and the only real difference is petrol's deep-sea cast - so the default that "reads as a template" was doing no work. The family identity is petrol night / pale sea (#18), so petrol becomes the base and iris is gone: three presets remain (petrol, golden, jade), and a dau that wants the old neutral indigo can still ship it as a free-text scheme with its own block.

- `web/src/styles.css` - `:root` and its light half now carry the petrol values (#18); the `[data-scheme="petrol"]` blocks are gone (petrol IS the base). Golden hour and jade-on-graphite stay as opt-in presets.
- `docs/_layouts/default.html` - the same: base tokens become petrol, the petrol blocks are dropped, the picker loses its `iris` option.
- `web/src/theme.js` - `SCHEMES = ['petrol', 'golden', 'jade']`; the paper map drops iris and `paperFor` falls back to petrol.
- `web/src/components/SchemeSwitch.jsx`, `ThemeSwitch.jsx`, `web/index.html` bootstrap, `site.config.js` - every `iris` default becomes `petrol` (no attribute = the base = petrol).
- `lib/gates/check-theme-parity.cjs` + `tests/theme-parity.test.cjs` - the gate's default scheme is now `schemes[0]` (petrol), and the fixtures follow.

### The brand census scans filenames too (2026-10-29)

The promotion merge resurrected a stray `web/public/flowforge-logo.jpg` - main's direct `Logo` commit had dropped the art at the public root, and Phase 1 had already renamed the real master to `web/public/brand/logo.jpg` (a brand name in a filename is invisible to a content scan). The merge brought the old path back, the template builder copied it, and `template:check` failed on CI. This class has now bitten twice, so it becomes a gate.

- `lib/gates/check-brand-census.mjs` - the census now walks the shipped surfaces (`web/` + `docs/`) and refuses any PATH carrying an identity literal, not just file CONTENTS. Build products (`dist/`, `node_modules/`, ...) are skipped: they are regenerated, not source. This is the literal a rebrand would miss - a filename cannot be tokenized, so it must be renamed by hand, and only a path scan can catch the one a hand-rename missed.
- `tests/brand-contract.test.cjs` - the census's filename leg: a planted `flowforge-logo.jpg` is refused by name.
- `web/public/flowforge-logo.jpg` - removed (the stray duplicate; the real master stays at `web/public/brand/logo.jpg`, byte-identical).

### The frontmatter gate validates YAML scalars (2026-10-29)

Rule #3 in action: monoforge's `docs/index.md` shipped with `description: slots: generated by the factory`, an unquoted scalar carrying a colon-space. YAML reads that as a nested mapping, the frontmatter block fails to parse, and Jekyll then drops the WHOLE block - no layout, no head injection, a page that renders without its own chrome. Every `check-docs-frontmatter` gate in the family regex-scanned for `key: value` and never noticed, because a regex scan says nothing about whether YAML parses. Caught in monoforge, so it becomes a gate here (the same gate ships in `lib/gates/` and reaches every adopter through `npm update`).

- `lib/gates/check-docs-frontmatter.cjs` - every frontmatter field value is now checked as a valid plain YAML scalar: an unquoted colon-space, an unquoted ` #` comment start, a leading YAML indicator, or an unterminated quote is refused by name. Dependency-free on purpose (the gate rides a zero-dep tool tree and a stamped repo with no install step), and it scans EVERY top-level field, not only the required ones - the monoforge bug landed in `description`, which a variant gate that did not require that field would have scanned past.
- `tests/docs-frontmatter.test.cjs` - the gate's scalar leg: a clean page passes, an unquoted colon-space in a required field is refused by name, the same in a non-required field is refused too (the monoforge shape), and a quoted colon-space stays lawful.

### The release ladder: adopt eyestruct's 3-job shape (2026-10-29)

Scope: eyestruct's workflows are the fleet template (its CI was updated most recently and its 1.0.0 cut exercised the whole ladder end to end). Adopt its proven release shape here, receipt `dhaupin/eyestruct@4e2b552`.

- `.github/workflows/release.yml` - now the 3-job ladder (publish / release / verify) with a `verify-only` dispatch mode, transcribed from `dhaupin/eyestruct@4e2b552 .github/workflows/publish.yml`. The publish job keeps the OIDC trusted-publishing publish and the 0.x + tag==version gate; the release job cuts the GH release from the tag with notes EXTRACTED from the changelog; the verify job re-proves the cut against npm and the GH release.
- `lib/release-notes.cjs` - the release-body extractor (identical across the family). Reads the `## [<version>]` section from `CHANGELOG.md` and refuses an absent or empty section, so a release body cannot disagree with the changelog. Fixed over the upstream copy: the newest section is also the last heading on the first cut, so an absent following heading now slices to EOF instead of erroring.
- `lib/verify-release.cjs` - the post-publish trust ladder (identical across the family): `--npm` asserts registry latest == this tree's version, the served tarball's sha512 == the registry integrity metadata, provenance present, then the full pack ladder on the served tarball; `--gh` asserts the release object exists, targets the tag's commit, and its source tarball diffs clean against `git archive` of that commit. Two local additions over the upstream copy: a named `--allow` prefix list (this shell ships the whole rig on purpose) and a named SKIP when a package declares no `main`/`exports`/`bin` (nothing to load).
- `tests/release-verify.test.cjs` - the pack ladder run OFFLINE every push (the standing receipt eyestruct carries), so the contents assertions do not live only on release days: a positive case over real `npm pack` output and a negative case refusing a doctored tarball by name.
- `CHANGELOG.md` - headings normalized to the family's keep-a-changelog shape (`## [Unreleased]`, `## [0.9.0]`) so `lib/release-notes.cjs` can slice the release body.
- `lib/gates/check-birth-gate.cjs` - the serde check narrowed to git verbs that WRITE a git dir (`init`/`add`/`commit`/`-C`); read-only verbs (`git archive`, `git rev-parse`) never mutate the tree being packed, so the verify-release ladder is not this class.

### Phase 1 - split tool from site (2026-10-29)

The tool and the site become separate halves (PRD 7/9). The copyable shell and the reusable gates move to their own homes; the dogfood stays put.

- `lib/` - the TOOL, versioned once and imported by adopters (not copied per site). The `check-*.cjs` family moved from `scripts/` to `lib/gates/`, and `flowforge-sync.mjs` -> `lib/sync.mjs`, `lint-packs.cjs`/`ship-from-download.cjs`/`unwrap-prose.cjs` -> `lib/`. The gates now reach an adopter through `npm update`, so a gate bug fixed once reaches every site (the reason for `lib/` rather than a fresh copy).
- `lib/root.cjs` / `lib/root.mjs` - the shared SITE-root resolver. Every gate used `path.resolve(__dirname, '..')`, which assumed the gate sat beside the site it checks - false once the tool is imported. The resolver walks up to the nearest `site.config.js` (skipping any candidate under `node_modules`, so the tool's own copy never wins), with a `--root <dir>` override for tests. One rule, both the dogfood and an installed adopter.
- `lib/template.mjs` + `npm run template` / `npm run template:check` - builds `templates/site/` from the dogfood tree, tokenized the monoforge way (`__NAME__`, `__SITE_URL__`, `__DOCS_URL__`, ...). Generated, not hand-kept, so the copy source cannot drift from the live shell (a hand-maintained duplicate would reintroduce exactly the churn the dogfood-in-place call avoids). `--check` refuses a drifted or stale template and is wired into `npm run check`; a self-guard refuses to emit if any dogfood identity literal survives tokenization.
- `templates/site/` - the copy source `flowforge create` will stamp: the shell (`web/` + `docs/` + `site.config.js`) with identity tokens. Sync-owned outputs (`docs/_config.yml`, `docs/freestruct.config.yml`, `web/public/robots.txt`, `web/public/site.webmanifest`) are excluded - the adopter regenerates them.
- `tests/template.test.cjs` - behavior tests for the template builder: `template:check` green on the live tree, the shell ships, no dogfood identity literal survives, the token vocabulary is present, and a rebuild is byte-identical.

### Changed (Phase 1)

- `package.json` - `files` now ships `lib/` + `templates/` (the tool), not `scripts/`; the `check`/`lint:docs`/`lint:packs`/`sync` scripts repointed to `lib/`; added `template`/`template:check`; `check` now also runs `template:check`.
- `tests/*.test.cjs` - repointed to the `lib/` layout, and the fixtures now mirror the shipped shape (config at the root, tool under `lib/`, the shared `root.cjs` copied beside the gate) - the same shape an adopter's repo has once flowforge is installed.
- `web/public/brand/flowforge-logo.jpg` -> `web/public/brand/logo.jpg` - a brand name in a filename is invisible to the census gate, so it was the one identity literal a rebrand would miss.
- `.github/workflows/test.yml` - the gate comments repointed to `lib/` (the steps already run through npm scripts, so no behavior change).
- README / AGENTS / DEPLOY / MANIFEST / `labs/prd-flowforge.md` - the tool/site split recorded: the new layout, the `lib/` + `templates/` homes, the resolver rule, and the generated-template decision (PRD 9).

### Added

- `site.config.js` (root) - THE site identity, authored once, read everywhere (Phase 0 of `labs/prd-flowforge.md`). Holds name, wordmark, tagline, description, url, repo, author, maker, org, docs block, theme block (the two axes as protocol constants), nav vocabulary, footer extras, routes, and the 404 copy. Named for the CONCERN, not the tool (PRD 5.1): a product-named config would force prestruct and freestruct to depend on flowforge, inverting the engine-to-shell dependency. Added to `package.json` `files` so adopters get it.
- `web/src/site.js` - the web bundle's single accessor for the identity (re-exports the root config + a `routeMeta(path)` helper), so the deep relative path appears exactly once and every surface imports one module.
- `scripts/flowforge-sync.mjs` + `npm run sync` / `npm run sync:check` - fan the identity out to the surfaces that cannot import it: `docs/_config.yml`, `docs/freestruct.config.yml`, `web/public/robots.txt`, `web/public/site.webmanifest`. Deterministic (same config -> same bytes, no wall clock); `--check` refuses a drifted file; YAML scalars are quoted when unsafe (a colon+space in a value made `docs/_config.yml` unparseable and Jekyll refused the whole config - caught by CI on the first Phase 0 push, fixed same-session) and every YAML target is parsed before it is written, so the generator fails at cause. Wired into `npm run check`.
- `scripts/check-brand-census.mjs` - the brand census gate (PRD 8): refuses an identity literal (the site name + the domain fragments derived from the config) in any structural surface outside `site.config.js`. Names file:line, strips comments so prose about the brand is not read as a hardcode, and skips the sync-owned outputs (proven current by `sync:check`). This is the missing teeth that turns "replace every YOUR... value" from a manual hunt into a mechanical guarantee.
- `tests/brand-contract.test.cjs` - 10 behavior tests: live-tree sync:check + census pass, sync determinism, a hand-edited generated file failing sync:check, a planted literal failing the census, comments being ignored, `ssr.config.js` proven to carry no literal of its own, `flowforge.config.js` proven absent, both generated YAML surfaces proven parseable, and a colon+space value proven to round-trip through the generated YAML.

### Changed

- `web/ssr.config.js` - now an ADAPTER, not a second source: it imports `site.config.js` and reshapes it for prestruct (`siteUrl`, `siteName`, `routes`, `notFound`). prestruct reads exactly what it always read, so the engine needs no change.
- `web/src/components/navItems.js` - `NAV_ITEMS`/`FOOTER_EXTRAS` now source from `site.config.js` (the nav vocabulary is one list, from one place).
- `web/src/components/Nav.jsx`, `Footer.jsx`, `web/src/pages/Home.jsx`|`Terms.jsx`|`Privacy.jsx` - brand mark, repo link, maker line, docs URL, page titles/descriptions, and the eyebrow all derive from the config (page titles/descriptions via `routeMeta(path)`).
- `web/src/theme.js` - `THEME_KEY`/`SCHEME_KEY` now come from the config's theme block, and the values are renamed to the neutral `site-theme`/`site-paint-scheme` (protocol constants, not brand; `web/index.html`'s pre-paint bootstrap and the docs layout mirror the rename).
- `docs/_layouts/default.html` - identity is now Liquid (`{{ site.repo }}`, `{{ site.title }}`, `{{ site.site_url }}`, the wordmark split, the theme/scheme keys) instead of hardcoded literals, and the nav URLs are baseurl-relative (the layout prefixes `site.baseurl`).
- `docs/_data/nav.yml` - URLs are baseurl-relative, so the same nav works on any deploy path and carries no brand/baseurl literal.
- `package.json` - added `sync`/`sync:check`; `check` now includes the sync:check lane and the brand census; `site.config.js` added to `files`.

A two-bucket round: adopt the fixes the family's newest repos already paid for (Bucket A) and bring the shell's process surfaces up to the family standard (Bucket B). No version bump - the release stays 0.9.0 until the first tag; the census leg keeps every surface honest meanwhile.

### Added

- `scripts/check-birth-gate.cjs` - the birth-gate lane (issue #5), six checks: YAML-parse every workflow (duplicate-key refusal kills the unquoted-step-name class that dies at GitHub's parser with zero check runs), assert staging-mount independence when a `mounts/` dir appears, gc-safe serde on any pack script, a determinism note, the pins-never-float rule (every `uses:` must be a 40-hex commit SHA, the human tag in a comment - a moving `@v4` is a supply-chain hole), and the reusable-workflow contract (issue #9). Wired into `npm run check`.
- `scripts/lint-packs.cjs` + `npm run lint:packs` - the packstruct passthrough wrapper verb (issue #12): runs the repo's own install (node_modules/.bin, then PATH), default dir = the packs ROOT, exit 2 names the exact-devDep fix when absent. `test.yml` now routes through it.
- `scripts/ship-from-download.cjs` + `tests/ship-from-download.test.cjs` - the generic phone publish lane (issue #24): stages a zip-extracted npm tree into `$HOME`, refuses shared-storage/`$HOME`/non-empty roots by name, token from ENV only (never a file, argv, or log). 21 behavior tests, temp dirs + fake runner, no network.
- `scripts/unwrap-prose.cjs` - the flowing-prose tool (issue #25).
- `tests/census.test.cjs` - the version-truth census leg (issue #28): root `package.json` is THE version source; `web/package.json` and the README Status line cannot drift.
- `web/scripts/adopt-icons.mjs` + `web/scripts/og-image.mjs` - the icon/OG pipeline (issue #17): raster brand art -> traced vector -> full icon set + an authored `brand-mark.json` the OG card redraws. Helpers ride `npm i --no-save`; no rasterizer dep committed.
- `web/public/brand/flowforge-logo.jpg` - the brand master, and the real icon set it produces (`icon.svg` into BOTH faces byte-equal, `icon-192/512`, `favicon-32`, `apple-touch-icon`, `og-image.png`): the shell's placeholder art is replaced. The pipeline traces the mark correctly (adoption fix below), so the icons now read as the art, not its negative.
- `.gitignore` (root) - the docs-preview belt-and-suspenders block (issue #22).
- `docs/freestruct.config.yml` author + `jsonLd` identity blocks (issue #11).
- `DEPLOY.md` local docs-preview recipe (issue #22) - the out-of-tree Ruby/bundler shape an unprivileged sandbox needs.
- `web/src/theme.js` - the two theme axes as data (issue #20): the light/dark key, the paint-scheme key + preset list (`SCHEMES`), and the per-scheme paper map the theme-color meta reads. Shared by the two switches and mirrored by the pre-paint bootstrap and the docs layout.
- `web/src/components/SchemeSwitch.jsx` - the paint-scheme picker (issue #20): a native `<select>` beside the light/dark switch that writes `<html data-scheme>`, persists `flowforge-paint-scheme`, and re-sets theme-color. Hydration-safe (first render is the deterministic default; an effect adopts the persisted scheme after mount).
- Paint-scheme presets (issues #18/#19/#20/#21): `web/src/styles.css` and `docs/_layouts/default.html` gain `[data-scheme="petrol|golden|jade"]` token blocks beside light/dark, values transcribed from the family round. Iris stays the DEFAULT (the base tokens, per #20's ruling) and each preset is a full palette with a `[data-scheme][data-theme="light"]` half, so light always wins in every scheme. The docs rig mirrors the whole axis (blocks + picker + bootstrap + handler).
- `scripts/check-theme-parity.cjs` + `tests/theme-parity.test.cjs` - the paint-scheme parity gate (issue #20): reads `SCHEMES` from `web/src/theme.js` and refuses a scheme missing from either surface, a scheme without its light half or `--accent`/`--accent-deep`, or an orphan `[data-scheme]` block. Names file:line; wired into `npm run check` + `npm run lint:docs`, with behavior tests for each failure class.
- `.github/workflows/docs-build.yml` - the docs build lane promoted to a REUSABLE workflow (issue #9): `on: workflow_call` with inputs (`docs-path`, `ruby-version`, `node-version`, `pagefind-version`, `freestruct-version`) and a `pagefind-version` output. Carries the whole runbook once - Jekyll, the token-auth pagefind scrape (now `latest`-or-pinned), the pinned freestruct post-build layer, the Pages artifact upload - so the three hand-copied runbooks (flowforge/gistory/eyestruct) that had drifted (Ruby 3.2 vs 3.4, upload-pages-artifact v3 vs v5, pagefind scrape vs npm pin) become one versioned call plus a thin caller per repo.
- `tests/birth-gate.test.cjs` - behavior tests for the birth-gate (issue #9): the reusable-workflow contract in both directions (caller -> non-`workflow_call` file, caller -> missing file, a `workflow_call` file nobody calls), a floating action pin, and the duplicate-YAML-key class.

### Changed

- `package.json` - added `test`, `prepublishOnly`, and `lint:packs`; `check` now includes the birth-gate lane; one root devDependency (`js-yaml`) + a committed lockfile for the hermetic install.
- `.github/workflows/release.yml` - the publish ladder (issues #23/#29): a gate refusing 0.x and a tag that disagrees with the packaged version, `prepublishOnly` riding every publish, and SHA-pinned actions.
- `.github/workflows/test.yml` + `docs-deploy.yml` - actions SHA-pinned (issue #6); test.yml adds the hermetic `npm ci` + `npm test` spine.
- `.github/workflows/docs-deploy.yml` - refactored to a THIN CALLER (issue #9): it now keeps only the trigger, permissions, concurrency group, and the `deploy` job, with `build:` as `uses: ./.github/workflows/docs-build.yml`; the runbook lives once in the reusable lane. The birth-gate's new check 6 keeps the contract honest (a local caller must point at a `workflow_call` file, and a reusable file must be called).
- `.github/workflows/test.yml` + `docs-deploy.yml` - the permanent `staging` branch (issue #30): test.yml's push trigger now runs the full battery on `main` AND `staging` (the integration branch is verified, not just the trunk), and docs-deploy.yml watches `staging` for docs-build validation while its `deploy` job is gated to `main` (`if: github.ref == 'refs/heads/main'`) - the trigger no longer keeps staging's docs out of production, the job guard does. `DEPLOY.md` gained the staging-branch section.
- `docs/_freestruct/inject-brand.html` - upgraded to the engine-edition JSON-LD (issue #11): Organization + WebSite pair, `{{authorJson}}` founder seam, `{{searchActionJson}}` seam.
- `docs/_layouts/default.html` + `web/src/styles.css` - Rouge/code token parity (issue #7), mobile table guard + `.main { min-width: 0 }` (issue #13), header brand link through `{{ site.baseurl }}/` (issue #15).
- `web/src/islands.js` - the observer guard (issue #6/#13 class): `mounted`/`observers`/`observing` WeakSets, `mount()` disconnects its observer.
- `docs/_data/nav.yml` + `docs/discussions/index.md` - Reference group + the flowing-prose note (issue #15/#25).
- `web/public/robots.txt` - flowforge crawler policy + sitemap pointer (issue #16).
- README / AGENTS / DEPLOY / MANIFEST / CHANGELOG - unwrapped to flowing prose (issue #25) and updated for the new gates, pins, and ladder.

### Fixed

- `web/scripts/adopt-icons.mjs` polarity (issue #17 adoption): the upstream eyestruct `make-icons.mjs` @ e4a73ac traces with `blackOnWhite: true` while its mask sets ink to 255 (white), so potrace traced the BACKGROUND frame and every icon shipped as a photographic negative of the art (correlation of traced fill vs. the ink mask: -0.999; +0.999 with `blackOnWhite: false`). Fixed on adoption, plus an in-script polarity guard that refuses the inverted bbox so the class cannot return.

- The version surfaces can no longer drift silently (the census leg fails the build), and a publish can no longer cut a 0.x tarball or a tag that lies about its version.

### Blocked

- **Resolved 2026-11-04.** Retiring `web/scripts/repair-404.cjs` (issue #42 / #33, the prestruct literal-`$1`/`$2` 404 leak): the root fix - generate the 404 through the injection pipeline, function replacers expanded - shipped on npm as prestruct 1.2.0. The pin bump that carried it is the session below; the script is deleted, and `web/package.json` now pins `prestruct: ^1.2.0`. (Original receipt: the fix was on prestruct `main` as 1.2.0 but NOT yet on npm - latest was 1.1.0, which ships the leak; verified: the raw 1.1.0 `404.html` carried four literal `$1`/`$2` bytes, `repair-404` cleaned them to zero.)

## [0.9.0] - 2026-10-24

The first scaffold: the rig extracted from **dhaupin/crashtest @ 905aa91**, generic-branded, with a receipt table per file ([MANIFEST.md](./MANIFEST.md)). Ready for the first manual npm push + GitHub release (`v0.9.0` tag; the OIDC workflow ships it).

### Added

- `web/` - the prestruct landing shell: light/dark theme switch (no-flash bootstrap, icon-is-the-action), tokens-only palette (dark + light, neutral graphite), nav/sidebar/footer from one vocabulary file, the island engine, placeholder pages, and a highlighted terminal block.
- `docs/` - the Jekyll rig: search > GitHub icon > theme switch > menu header, pagefind modal search, Rouge token colors shared with the landing, freestruct SEO layer, sample page proving frontmatter + highlighting.
- `scripts/` - the docs gates: frontmatter, links (doubled-baseurl trap), style/voice, fiction signatures (generic seeds), and the single-argument Liquid filter trap.
- `.github/workflows/docs-deploy.yml` - token-authenticated pagefind scrape + PINNED freestruct layer + GitHub Pages.
- `.github/workflows/release.yml` - npm Trusted Publishing (OIDC) template.
- `AGENTS.md` - the agent-facing map + house rules + version protocol.
- `DEPLOY.md` - the deploy runbook, crosslinked.
- `labs/TASKS.md` - the rolling work log (seeded with the extraction entry).
- `packs/README.md` - the `/packs` contract + the struct-family links.

### Notes

- The rig's version surfaces: `package.json` and `web/package.json` (both 0.9.0). PNG icon slots (`icon-192/512`, `favicon-32`, `apple-touch-icon`, `og-image.png`) are referenced but not shipped - drop yours into `web/public/`.
