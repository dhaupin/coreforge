# labs/TASKS.md - the rolling work log

One file, appended per landing/session, newest last, with receipts (files, gates, SHAs). The house law this file serves: **the log is the memory** - the next agent should never guess what happened. Conventions live in [../AGENTS.md](../AGENTS.md); versioned product changes also get a [CHANGELOG.md](../CHANGELOG.md) entry in the same commit.

## Open asks (carry forward until landed)

- _none yet - the 0.9.0 scaffold cut is the first entry below._

---

### 2026-10-25 - family reqs round: filed upstream, two blocked on repo access

- User asked for any issues/reqs we hold to go upstream. Duplicate-checked all five trackers first, hard-verified the two candidate bugs before filing (one candidate DIED on verification: freestruct's audit exit code is CORRECT - exit 1 on ok:false, my earlier misread was pipe contamination through `head`; and /terms is fully prerendered with proper head tags, so no prestruct ask either). Filed:

- **freestruct#28** (new): audit per-page config-gated warns collapse - og:image/twitter:image-absent lines are identical on every page (verified: 2 pages = 2x2 lines, 4 pages = 4x2), config-shaped not page-shaped; ask = one `(config): ... - N page(s) affected` line, keep per-page for genuinely page-shaped classes (title/description length). Precedent cited: prestruct's validateConfig/formatDiagnostics collapse. Filed with the full terminal receipts.

- **crashtest#37** (new): proposal for an opt-in vacuous-green (`--allow-vacuous`) so shells in the pre-handler lifecycle state can keep the pinned install + CI row LIVE instead of hashFiles-parked (exit 2 stays the default; flag prints one honest "0 handlers, 0 attacks" line). flowforge is first adopter on ship - deletes our two `if:` lines + the workflow comment.

- **packstruct#13 comment: BLOCKED** - the Freebuff GitHub App gets `Resource not accessible by integration (addComment)` on dhaupin/ packstruct; this is the known access gap, documented as crashtest#18 ("reconnect poststruct + packstruct to the Freebuff GitHub App (both 403; blocker is repo access only)"). Content banked below until access lands: our CI run 40236634491 is the second live instance of the confusing-root-message class (packs//public/ double slash + the real fix being a packs/public/.gitkeep commit since git does not track empty dirs) - add as a #13 comment + message-improvement note.

- **poststruct / eyestruct: filed NOTHING, honestly** - poststruct has a live queue but nothing flowforge-shaped to add (its check-profile CLI doesn't exist; our TBA wake-conditions already cite it); eyestruct is an empty README stub. eyestruct also blocked by the same App access gap, so even convention pulls would 403. Revisit both when they ship a surface.

- Housekeeping for whoever next holds the keys: when packstruct/ poststruct/eyestruct are granted to the App, this entry's banked packstruct#13 comment is the only outstanding delivery.

---

### 2026-10-25 - docs branding + token reconciliation round (parity with web)

- The user spotted the asymmetric branding: web got the flowforge identity in its first rounds while docs still carried placeholder everywhere. Parity audit found and closed, in docs/_layouts/default.html + docs/index.md:

- Identity (5): header brand text `your`site -> `flow`forge; header + footer GitHub hrefs your-org/your-project -> dhaupin/flowforge; the doc-footer four-link placeholder row -> "flowforge is open source
  - site flowforge.creadev.org - terms - privacy - part of the Creadev family" (family-shape, credit to freestruct's footer for the conventions-index wording); layout title line "Your Site Docs" / "Your Site" -> `{{ page.title | default: "flowforge docs" }} | flowforge` (the `Your Site / Your Site | flowforge` og:title that the head trim started exposing into search results dies here - the open ask logged in the issue #3 precursor entry CLOSES); index.md identity -> title `flowforge docs` + real description while KEEPING all three instructional body sections (highlight sample, build commands, sidebar-nav doc) intact - a first overwrite dropped them, caught in the diff before commit and restored.

- Token reconciliation (the drift the audit found beyond identity): docs-layout `--surface` dark #0d1017 -> #161b24 and `--accent-deep` -> dark #5166c7 / light #33449e, both aligned to the WEB styles.css sheet as the one brand truth. Family receipt first (adopt honestly, not from vibes): freestruct's adapted default.html carries ITS palette's values (#4055c5/#2f44b8, what our last round transcribed) and crashtest's own docs layout has the same UNDECLARED accent-deep its web half declares - so the value is adopter brand data, not engine data, and flowforge's web sheet is the adopter truth here. Docs keeps its --ink-light alias + layout dims (header-height/ sidebar-width) and web keeps --nav-bg/--accent-contrast - surface roles differ, values now don't.

- Verified: lint:docs PASS (frontmatter 2 pages, links, style, fiction now scanning 29 files, filters). The Jekyll + engine build is proven by the CI docs-deploy + test battery on this push (no local Ruby); live-check after deploy: header brand, footer links, layout title, and og:title = "flowforge docs | flowforge".

- Note (unchanged, documented homework): docs og.image still deliberately absent (the PNG set is web-side truth; an og:image pointing at a 404 is worse than none until the docs PNG set lands).

---

### 2026-10-25 - test.yml: packstruct + crashtest wired from start (poststruct/eyestruct TBA slots documented)

- Lead-in receipts, from answering the user's "did we hook packstruct + crashtest into CI?" question: the shell shipped NO family CI (docs-deploy
  + release only), /packs was the README-contract-only empty state by design, and the packstruct-in-CI + crashtest-dogfood hookups live in the freestruct repo. User asked to wire packstruct + crashtest NOW and carry poststruct + eyestruct ("TBA") from the start too.

- Fact-check before wiring (truth over vibes): poststruct = README + horcrux parked archive + labs stubs (NO product), eyestruct = README only. Both on npm-ready: packstruct@1.0.0, crashtest@1.1.0.

- `test.yml` (new, the shell's push/PR battery):
  1. the five scripts/ gates (npm run check + lint:docs),
  2. web build through the ENGINE's own gates (prestruct build + the repair-404 assert-clean step - so a prestruct#33-class leak also red-lights CI, not just deploys),
  3. docs Jekyll build (PR coverage docs-deploy's main-push-only lane doesn't give),
  4. packstruct lint over packs/ - PINNED npm 1.0.0, vacuous green proven locally ("0 pack(s) checked", exit 0) on the empty-shells state; the first pack.json is gated from its FIRST commit,
  5. crashtest row ARM-GATED on crashtest.config.js existing (checked upstream first: `crashtest run` with no config is a hard EXIT 2, never a pass - the shell has no handlers/scripts to attack yet, so the step parks with pinned crashtest@1.1.0 instead of fake-red; remove the `if:` lines the day a config lands).

- poststruct + eyestruct: explicitly NOT wired, wired = theater with no CLI to pin. Both live as documented TBA slots in the workflow header with individual wake conditions (poststruct: published check-profile CLI or first check-profile pack in packs/public/; eyestruct: same rule once it exits README-only). Pins never float: any future bump moves the MANIFEST row in the same commit (workflow header says so too).

- CI CAUGHT the first mark, same commit (the battery earning its keep one run in): the first CI run red-lit packstruct lint with "missing packs//public/ - packs live at <packs-root>/public/<name>/""
  - the shell NEVER committed packs/public/ (empty dirs don't track, and the cut only shipped packs/README.md + packs/.gitignore) while my local pre-push probe ran in a scratch tree that HAD created packs/public manually - masking the defect. Fix: packs/public/.gitkeep committed so the tracked tree carries the contract shape; packstruct re-run locally against the REAL repo tree: 0 packs / exit 0. FICTION CLASS (first catch, so no new gate per house law - second catch mints one): "a verification run in a constructed fixture can pass for the repo; run the pre-push probe against the REAL tree".

- Local verify before push: js-yaml parse of test.yml OK, npm run lint:docs PASS, npm install+build --prefix web = 3/3 pages + REPAIR-404 PASS. CI run (40236634491) proved the other legs: all gates, web build, Ruby/Jekyll docs build green first try; after the .gitkeep fix, packstruct also joins. crashtest rows skipped as designed (no crashtest.config.js yet).

- Receipts: MANIFEST.md (test.yml row + packstruct/crashtest pin rows, crashtest marked arm-gated). Open asks: none new.

---

### 2026-10-25 - freestruct 1.1.0 precursor close-out (issue #3: trim + pin bump, landed the same day the tag shipped)

- New tracker item flowforge#3 (filed by the freebuff-web bot) turned out to be a DO-IT-TODAY, not a queue item: freestruct's 1.1.0 tag was already on the repo + npm by the time we looked (dhaupin/freestruct tags: v1.0.0 @ 1e71a66, v1.1.0 @ 473318e00; npm serves 1.1.0). Two asks, both landed now, plus two ride-alongs.

- **Layout head trim** (docs/_layouts/default.html, transcribed from freestruct's own adapted copy @ 4e1facc): the baked canonical/og:title/og:description/og:url/og:type/og:site_name block is gone; the layout keeps title + description (SSG-owned frontmatter facts) + favicon/color-scheme and the per-page `{% if page.noindex %}` robots line (missing-only engine respects an existing robots meta, so noindex pages keep their gate). freestruct's audit grades zero consumer rows now.

- **Template retro-fit** (docs/_freestruct/inject-brand.html): with the layout trimmed, our dupe-free-from-crashtest-cut template no longer matches reality (it carried ONLY twitter/og:image/JSON-LD against the old baked head - those tags would've been owned by nobody). Now carries the full per-page engine set (canonical + og:title/ description/url/type/site_name/locale via the engine's {{pageTitle}}/ {{pageUrl}}/{{canonicalUrl}} placeholders - the same shape freestruct's own docs template carries), with our extras kept (SoftwareApplication JSON-LD + Organization author from the {{siteAuthor}}-fix receipt, twitter set unchanged). og:image still intentionally absent until the PNG set lands - the engine strips the line when no image is configured (verified live, the line vanishes), so no 404 bait.

- **Pin bump** (docs-deploy.yml): `github:dhaupin/freestruct#dfb30aa498` -> `freestruct@^1.1.0` npm, and the invocation `node node_modules/freestruct/docs/lib/inject.js` -> `node node_modules/freestruct/engine/inject.js` (1.1.0 reorganized docs/lib -> engine/, added a bin/freestruct.mjs shim; the old docs/lib path is GONE in the npm package - contents API 404s at the tag). Contract verified engine-side @ v1.1.0: config still discovered walking up from cwd, output defaults to docs/_site next to the config, positional override + --strict unchanged. Local smoke run (npm 1.1.0 engine, scratch tree with our config + template + a trimmed-head shape page): exit 0, og/canonical fills are per-page, twitter + JSON-LD present, no og:image (stripped), missing-only left the pre-existing description alone, rerun dedupes the injected region.

- Ride-alongs from the same walk, landed with it: `bigdecimal ~> 3.1` into docs/Gemfile (a BUNDLED gem on Ruby 3.4 that liquid 4.0.4 needs; the day a Gemfile.lock gets committed, CI goes dark without it), and `--accent-deep` declared in docs/_layouts/default.html BOTH themes (the Rouge .no/.mi/.mf/.mh rules referenced it while :root never declared it - two raw-highlight classes rendered colorless since the extraction; freestruct's adapted copy fixes it upstream, so we took it with receipts).

- Known-not-run locally: `bundle exec jekyll build` (no Ruby on this host) - the Jekyll build of the trimmed layout is proven by the CI docs-deploy run on this push instead; everything engine-side and everything against the assembled head shape ran locally against npm 1.1.0. Receipts: MANIFEST.md (Gemfile, layout-trim, template-trim rows; freestruct pin row moved to npm semver).

- Open asks (carry forward): the docs BRANDING homework is still open and now twice-visible in the head - layout title suffix ("Your Site / Your Site" renders as the h1-title while og:title carries it into search results too) + page frontmatter titles on the sample pages. The engine surface itself is correctly flowforge-branded (og:site_name = flowforge, canonical/og:url = docs.creadev.org/flowforge, SoftwareApplication name = flowforge). One round: swap the layout title line + index.md frontmatter to flowforge truth.

---

- The archived rig extraction landed: verified the parked seed archive byte-for-byte first (`sha256 horcrux/flowforge.tar.gz` = `51577a971225419c277051a3570763e2bc6b0bea2c6ad02b3839293b916e093a`, matching the receipt in the onboarding issue), then unpacked it and moved `flowforge/*` to the repo root (the rig is written as a root tree: MANIFEST paths are root-relative, `web/` + `docs/` + `scripts/` sit at top). `horcrux/` stays as the parked archive; `LICENSE` kept. The rig's own README replaced the 11-byte stub.
- Issue #1 convention pulls folded in: direct Creadev.org backlink bullet added to the root README's map section (the workshop -> creadev.org); second ask already satisfied by the rig - `docs/discussions/index.md` ships the file-IS-the-post release-post boilerplate. Edited that index to point the exemplar link at crashtest's conventions index + announcing-v1.0.0 per the amended convention (the prestruct link was the older shape issue #1 says to skip). File-body edits only; receipt discipline: no MANIFEST rows rewired, changes logged here.
- Gates run on the unpacked rig: `npm run check` PASS (all five gate scripts compile), `npm run lint:docs` PASS (frontmatter 2 pages, links 2 files, style 2 files, fiction 26 files/4 signatures, Jekyll filters). `npm install --prefix web && prestruct build`: **1/1 pages rendered, exit 0** (this genericized cut ships one route - N/N is the healthy signal; the source repo's 6/6 bullet is crashtest-specific).
- Observed, not bent: one dev-mode JSX warning from the extracted react-router UMD build ("Invalid value for prop `className` on <a>") during prerender. Engine files are byte-exact copies (MANIFEST web/; copy once, never edit), so nothing was touched for it - logged for the next bump review instead.- Unpack audit dot (same session, still 2026-10-25): the docs-deploy freestruct step discovers its config from repo root (`docs/freestruct.config.yml`, legacy `ssr-config.yml`) and the crashtest cut shipped NEITHER - the layer would have been dropped - so added `docs/freestruct.config.yml` (placeholder identity mirroring `docs/_config.yml`). While wiring it, checked the pinned freestruct substitution table (seo.js @ dfb30aa498): `{{siteAuthor}}` in `_freestruct/inject-brand.html` was never a supported placeholder and would have shipped literally into the JSON-LD; the author block now rides the supported `{{siteName}}`/`{{siteUrl}}` (Organization). Both receipts landed as new rows in [../MANIFEST.md](../MANIFEST.md).
- First docs-deploy run on main red-lit at pagefind: `_site` had ZERO .html files. Root cause: both sample pages carried `.md`-suffixed permalinks (`permalink: index.md` / `discussions/index.md`) - Jekyll preserves the permalink extension verbatim in output, so the site emitted `_site/index.md` / `_site/discussions/index.md` (HTML inside .md filenames). It exited 0 and looked healthy locally; only the hard-failing pagefind caught it. Fixed to the gate-shaped permalinks (`/` for the docs home, `discussions/` for the release-posts index). FICTION CLASS logged (first catch, so no new gate per house law - second catch mints one): "a permalink that exits every gate but ends in .md renders zero html; only the search-index step refuses".
- Second docs-deploy run: GREEN (build + deploy, run 40161588398). Site live at https://docs.creadev.org/flowforge/ (HTTP 200 + HTTPS 200; Pages API reports no repo-level CNAME, the docs.* domain resolves family-side). With the real deploy home now observable from the deployment URL, swapped the `/project` + `your-site.example.com` placeholders for the computed truth: `docs/_config.yml` (url `https://docs.creadev.org`, baseurl `/flowforge`), `scripts/check-docs-links.cjs` `SITE_PREFIX` = `/flowforge` (the mirror DEPLOY.md asks for), and `docs/freestruct.config.yml` `site.url` (freestruct canonical/OG truth). `web/ssr.config.js` stays placeholder - that surface belongs to the web host, whose URL lands when the CF-Pages deploy names it.
- Same-session placeholder round (also 2026-10-25): the live docs head still carried placeholder identity and the sidebar nav was still pasted from the `/project` era, so: `_data/nav.yml` URLs moved onto the deployed baseurl (`/flowforge/`, `/flowforge/discussions/` - the layout emits `item.url` verbatim, active-state strip only), `freestruct.config.yml` identity set to flowforge truth, `og.image` REMOVED until the PNG set lands (og-image.png stays documented adopter homework; an og:image pointing at a 404 is worse than none, and the pinned freestruct dropped the tag accordingly).
- Open asks (carry forward until landed): wire the estate per issue #2 step 3 - docs-deploy.yml the real Pages lane, the web host per DEPLOY.md (CF-Pages shape), and the OIDC release template when there is an artifact to release.

### 2026-10-25 - web surface round (CF Pages live at flowforge.creadev.org)

- CF Pages first build: green (9 assets uploaded, 5 header rules parsed, 0 redirect rules). From the deploy log + the user's screenshots, six unpack -audit items: leaked raw text on the 404, missing favicon/PNG wiring, TWO different 404 experiences, a doubled brand logo, missing syntax-tint class usage, unstyled CTAs, and a dead About nav route.

- 404 root cause (items 1/2/4 of the audit in one): prestruct's engine `generate404()` uses FUNCTION replacers whose return strings still carry literal `$1/$2`. A string replacer expands those group references; a function replacer inserts them LITERALLY - so the description/og:title/ twitter:title/canonical tags get consumed and ship as leaked text that the browser hoists into the body (visibly, above the styled page). Verified live on crashtest.creadev.org's 404 and reproduced from the npm 1.1.0 source - still unfixed upstream at crashtest main. Flowforge-side fix: `web/scripts/repair-404.cjs` rebuilds the four tags from ssr.config truth, then ASSERTS the repair (any leftover `$1`/`$2`, a missing description, or a canonical not on the configured origin exits 1). Wired after `prestruct build` in web package.json so CF runs it too (CF's command is `npm run build` in web/). Also added the `notFound` block to ssr.config (heading/body/CTA = the SPA NotFound copy) and rebuilt pages/NotFound with the matching `.nf` + `.btn` shape, so the host-served 404 and the hydrate-rendered 404 read as ONE page, not two "types".
- favicon/PNG set: the 404 render keeps the build-time-injected shell head, so the favicon links were already there - the missing piece was the PNG files themselves (icon-192/512, favicon-32, apple-touch-icon, og-image were all 404ing). Generated from our own placeholder `icon.svg`, deterministically, out-of-tree (no rasterizer dep committed). NOTHING copied from crashtest's PNGs - their mark is brand data and stays per-repo. Receipts in [../MANIFEST.md](../MANIFEST.md).
- doubled logo (item 2): the genericizing cut pasted TWO `<img className="brand-logo">` rows into Nav.jsx; back to one. Brand text to `<accent>flow</accent>forge`, GitHub href to `dhaupin/flowforge`.
- CTA + syntax classes (items 3+4): styles.css never lacked `.btn`/`.code` rules - the cut pages had the WRONG class names (`.hero-actions` div + bare `.btn-primary` modifiers). Home went to crashtest's fixed shape: `.hero`/`.cta-row` and COMPOSED classes (`.btn` + `.btn-primary/-ghost`; the base class carries the geometry, ours rendered as default links), and the `.code` pre uses `.k` spans on commands like the docs Rouge output. Repo/docs CTAs point at the real dhaupin/flowforge + docs.creadev.org/flowforge/ surfaces (the old /docs/ href 404ed).
- terms/privacy pages (item 5): blank h1 placeholders at /terms + /privacy (filled-in family examples live in crashtest web/pages), routes in AppLayout + ssr.config entries (0.3 priority, yearly changefreq), head metas via usePageMeta.
- About removed from navItems (item 6) - the route led nowhere.
- React #321 receipt from crashtest, transcribed: the head-tag hook must live in the component BODY (hook-in-effect was an invalid hook call and tore the tree down on their live site); Terms/Privacy/Home call usePageMeta in-body now.
- CF-log warnings fixed: the `Invalid value for prop className on <a>` prerender warning came from the sidebar LEGAL links - plain `<Link>` spreads className straight onto the `<a>` and a function className there warns (NavLink handles function classNames, Link does not, react-router -dom v6.23) - those links carry no className now; plus the canonical placeholder (`your-site.example.com`) died with the ssr.config identity swap (siteUrl https://flowforge.creadev.org), and web/package.json got its real name (flowforge-site, version 0.9.0 = the version protocol).
- Open asks (carry forward): upstream prestruct#33 (generate404 function replacers emit literal $1/$2, opened 2026-10-23, root-fix proposal in prestruct#42) - RETIRE the repair script at the pin bump that carries that fix, per MANIFEST. Filed the adjacent freestruct latent as freestruct#24 (config-carried values riding string-form replace() in purge commands + head/body insertions; template core itself is split/join safe) - tag along a retire-note there too when both upstream fixes land.

---

### 2026-10-24 - 0.9.0 scaffold cut (the shell extracted from crashtest @ 905aa91)

- The rig was extracted, not written from memory: every file is either a byte-exact copy or a small genericization of a deployed, verified surface
  - the per-file receipts live in [../MANIFEST.md](../MANIFEST.md) (extraction SHA: dhaupin/crashtest@905aa91, which itself carried the theme-port + highlight work verified same-day: suite green, web prerender 6/6 pages, docs deploy live).
- What landed: `web/` landing shell (light/dark switch, tokens-only palette, one nav vocabulary, islands engine), `docs/` Jekyll rig (pagefind search, shared Rouge token colors, freestruct SEO layer), five `scripts/` gates, two workflows (docs deploy with the hardened pagefind scrape + PINNED freestruct; npm OIDC release template), plus this log, [../CHANGELOG.md](../CHANGELOG.md) 0.9.0, the [../packs/README.md](../packs/README.md) contract, and the three crosslinked core docs ([../README.md](../README.md) / [../AGENTS.md](../AGENTS.md) / [../DEPLOY.md](../DEPLOY.md)).
- Verification receipts (run on the extracted rig, not the source): all five docs gates PASS against the generic `docs/` (1 sample page), fresh `npm install` + `prestruct build` prerendered the shell clean (1/1 pages, zero JSX warnings), `web/public/icon.svg` and `docs/icon.svg` verified byte-equal (the two-surface brand contract).
- Deliberately left for adopters (documented, not shipped): PNG icon slots + `og-image.png` (referenced in `site.webmanifest`), the docs sidebar data (`docs/_data/nav.yml` - one group/`items` shape, see the sample page), and any pack content (`packs/public/` stays empty in the shell).
- First release path (manual, per [../DEPLOY.md](../DEPLOY.md)): bump check -> `v0.9.0` tag -> OIDC publish -> GitHub release from the tag with the changelog entry as its body.

---

### 2026-10-29 - two-bucket round on `staging` (Buckets A + B)

Branch `staging` off `main` @ df86464 (2026-10-25 "Family reqs round"), clean tree, shallow clone. Version stays 0.9.0 (no tag yet - the census leg holds every surface honest meanwhile). All 29 open issues read via the GitHub REST API (gh CLI unauthenticated -> GITHUB_TOKEN + REST). Receipts gathered from dhaupin/{eyestruct,prestruct,crashtest,freestruct}.

**Bucket A - adopt the fixes the newest family repos already paid for**

- A1 (#16): `web/public/robots.txt` - flowforge crawler policy + sitemap pointer (`https://flowforge.creadev.org/sitemap.xml`).
- A2 (#7): Rouge/code token parity - `docs/_layouts/default.html` Rouge block expanded (`.cs/.ch` comment rules, `--err` token) and a matching `.code` syntax-token block added to `web/src/styles.css` (same class vocabulary + palette).
- A3 (#13): mobile table guard - `docs/_layouts/default.html` `.main { min-width: 0 }`; `web/src/styles.css` `table:not(.attacks)` display/overflow guard + `.table-wrap` (transcribed from eyestruct).
- A4 (#15): `docs/_layouts/default.html` header brand link now `{{ site.baseurl }}/`; `docs/_data/nav.yml` gained a Reference group ("Release posts"); `docs/discussions/index.md` leaned + a flowing-prose note.
- A5 (#6): `web/src/islands.js` observer guard (`mounted`/`observers`/`observing` WeakSets; `mount()` disconnects its observer) - transcribed from prestruct `engine/src/islands.js`.

**Bucket B - bring the process surfaces up to the family standard**

- B1 (#25): flowing prose. `scripts/unwrap-prose.cjs` transcribed from eyestruct; ran it over README/AGENTS/CHANGELOG/DEPLOY/MANIFEST/labs/docs (no re-wrap); gates green after.
- B2/B7 (#23/#29): the publish ladder. `package.json` gained `test` + `prepublishOnly` (`npm test && npm run check && npm run lint:docs`); `release.yml` gained a gate refusing 0.x and a tag that disagrees with the packaged version (every github context value reaches the script through env, never inline interpolation).
- B3 (#22): root `.gitignore` (docs-preview block) + a `DEPLOY.md` out-of-tree local-preview recipe (unpacked Ruby in `$HOME`, shimmed binstubs, `BUNDLE_PATH` outside the repo, build from a scratch copy of `docs/`).
- B4 (#24): `scripts/ship-from-download.cjs` + `tests/ship-from-download.test.cjs` (21 pass; renamed `.cjs` - the root package is ESM).
- B5 (#17): `web/scripts/adopt-icons.mjs` (sharp + potrace + resvg -> traced SVG + icon set + authored `brand-mark.json`) and `web/scripts/og-image.mjs` (1200x630 card consuming the mark + `ssr.config.js` identity). Both smoke-tested on synthetic art; generated output reverted (the pipeline is the deliverable, not new icons for the shell).
- B6 (#10/#11): `docs/_freestruct/inject-brand.html` upgraded to the engine-edition JSON-LD (Organization + WebSite pair, `{{authorJson}}` founder seam, `{{searchActionJson}}` seam); `docs/freestruct.config.yml` gained `author` + `jsonLd` identity. Verified LIVE against the pinned freestruct 1.1.0 engine on a scratch build - the injected head carries the founder Person, the maintainer Person, and the WebSite block.
- B8 (#12): `scripts/lint-packs.cjs` + `npm run lint:packs` (wrapper verb); `test.yml` routed through it. Verified both paths: exit 2 naming the exact-devDep fix with no install, exit 0 with packstruct 1.0.0 installed.
- B9 (#5): `scripts/check-birth-gate.cjs` (five checks: workflow YAML parse + duplicate-key refusal, mount independence, gc-safe serde, determinism note, and the pins-never-float rule - every `uses:` must be a 40-hex SHA), wired into `npm run check`; consumes the root `js-yaml` devDep + a committed lockfile.
- B10 (#6): every action SHA-pinned across `test.yml`, `docs-deploy.yml`, `release.yml` (checkout v7, setup-node v7, ruby/setup-ruby v1.335.0, upload-pages-artifact v5, deploy-pages v5) - the comment names the human tag, the birth-gate's fifth check enforces the 40-hex form, and each SHA was verified to map to its claimed tag via the API.
- B11 (#28): `tests/census.test.cjs` - the version-truth census leg (root `package.json` is THE version source; `web/package.json` + the README Status line cannot drift). README gained the Status line the leg pins.

**Gates (all run on the branch)**

- `npm ci` -> clean (one root devDep: js-yaml).
- `npm test` -> 22 pass / 0 fail (census + 21 ship-lane behavior tests).
- `npm run check` -> PASS (five gate compile checks + birth-gate lane: 3 workflows parsed, 4 checks incl. 9 action refs all SHA-pinned).
- `npm run lint:docs` -> PASS (frontmatter, links, style, fiction signatures, jekyll filters).
- `npm run lint:packs` -> PASS (packstruct 1.0.0 over packs/, 0 packs checked).
- `npm install --prefix web && npm run build --prefix web` -> 3/3 pages rendered, REPAIR-404 PASS.
- freestruct engine smoke test (pinned 1.1.0) -> injected head carries founder + maintainer + WebSite JSON-LD.

**Receipts / SHAs**

- Extraction source receipts (real SHAs, verified via the API at extraction time): dhaupin/eyestruct `scripts/unwrap-prose.cjs` @ 3adda1dc, `scripts/ship-from-download.cjs` @ 9744c768 (+ `tests/ship-from-download.test.js`), `lib/lint-packs.js` @ cd135a91, `web/scripts/make-icons.mjs` @ e4a73ac (introduced 6556225) + `web/scripts/og-image.mjs` @ 33a7c19, `tests/census.test.js` @ 3d8a822 (introduced); the local docs-preview recipe @ 8a194ad + its gitignore block @ ca2f62a; prestruct `engine/src/islands.js` @ 59cb0469; the Rouge full-vocabulary block @ prestruct c915760 and the mobile table guard @ eyestruct 138fda9.
- Action pins: checkout `3d3c42e5aac5ba805825da76410c181273ba90b1` (v7), setup-node `949feb2413d6458794dcd2491c4babbbce0c15c1` (v7), ruby/setup-ruby `7f797815d8adceb1c412e7abefdd1ab4abc47a5f` (v1.335.0), upload-pages-artifact `fc324d3547104276b827a68afc52ff2a11cc49c9` (v5), deploy-pages `368f82528645a54fb793d4d04e342629a3f51346` (v5).

**Left open (next round candidates)**

- #27 / #29 remainder: poststruct + eyestruct CI slots stay TBA (both are README/horcrux stubs - no CLI to pin yet).
- #4: the deterministic-pack / pack-twice byte-compare step is noted by the birth-gate but not exercised (the shell ships no packer).

## 2026-10-29 (later) - logo round: the icon pipeline runs on real art (issue #17)

The user supplied brand art at `web/public/brand/flowforge-logo.jpg` (203301 bytes, 2048x2048, moved off the `public/` root into `public/brand/` to match the family convention - eyestruct ships `web/public/brand/`, and the script's own example is `--art public/brand/logo.png`). Ran the pipeline on it and found a real bug inherited from the extraction source.

**The bug: the icon shipped as a photographic negative.**

- `web/scripts/adopt-icons.mjs` builds `inkMask` by setting ink pixels to **255 (white)** on a 0 (black) field, then calls potrace with `blackOnWhite: true`. potrace's `blackOnWhite` means "the input is dark-on-light, trace the DARK pixels" - so it traced the **background frame**, not the mark. The script then fills that frame with the light ink color, and the icon renders as a light tile with a dark mark: the negative of the art.
- Receipt: upstream `dhaupin/eyestruct` `web/scripts/make-icons.mjs` @ e4a73ac carries the exact same line (`potrace.trace(inkPng, { ..., blackOnWhite: true }, ...)` over the same ink=255 mask), so the class is inherited, not introduced.
- Proof, not a guess: correlate the traced fill against the ground-truth ink mask. `blackOnWhite: true` -> **-0.999** (perfectly inverted); `blackOnWhite: false` -> **+0.999**. End-to-end, the rendered `icon.svg` correlates with the source art at **-0.648** before and **+0.658** after the fix.
- Fix: `blackOnWhite: false` (trace the white pixels the mask actually wrote), plus an in-script **polarity guard** - it compares the traced-path bbox to the ink-mask bbox and throws if the paths span the full frame while the mask is inset (exactly the inverted case), so the class cannot return silently. Negative-tested: forcing `true` makes the script exit 1 with the named error.
- Regenerated the whole set from the real art: `icon.svg` (both faces, byte-equal), `icon-192/512.png`, `favicon-32.png`, `apple-touch-icon.png`, `og-image.png`. Verified orientation (dark tile, transparent rounded corners, light mark, accent ring + horizontal strike) and byte-parity `web/public/icon.svg` == `docs/icon.svg`.

**Also fixed**

- `MANIFEST.md` - the `icon.svg` row had merged with the `index.md` row (a stray `||`); split, and the icon rows now say REAL BRAND ART instead of "placeholder", with the brand-master row and the adoption-fix note on the `adopt-icons.mjs` row.
- `CHANGELOG.md` - Added entry for the brand master + regenerated set; Fixed entry for the polarity adoption fix.

**Gates (all green on the branch)**

- `npm test` -> 22 pass / 0 fail.
- `npm run check` -> PASS (five compile checks + birth-gate: 3 workflows, 4 checks incl. 9 SHA-pinned action refs).
- `npm run lint:docs` -> PASS (frontmatter, links, style, fiction signatures, jekyll filters).
- `npm run build --prefix web` -> 3/3 pages rendered, REPAIR-404 PASS; `dist/brand/flowforge-logo.jpg` ships (adopter brand data, the eyestruct convention).

Version stays 0.9.0 (no bump, no OIDC - the user's manual push comes first).

---

### 2026-10-29 - session: staging branch in CI (c), paint-scheme axis + picker (e), repair-404 blocked (d)

The user asked for all three carry-forward options this session. Two landed; one is honestly blocked on an unpublished upstream fix.

**c - the permanent `staging` branch (issue #30)**

- `.github/workflows/test.yml` - the push trigger is now `branches: [main, staging]`, so the integration branch runs the whole battery (gates, web build, docs build, packstruct, crashtest row), not just `main`. Before this, work could pile up on `staging` with zero CI signal.
- `.github/workflows/docs-deploy.yml` - push now also fires on `staging` (docs-build validation on the integration branch), and the `deploy` job carries `if: github.ref == 'refs/heads/main'`. This is the #30 point-3 trap: once `staging` is a trigger, the trigger itself no longer keeps staging's content out of production - the job guard does. Without the guard, a push to `staging` would publish.
- `DEPLOY.md` - new "## 3. The staging branch (issue #30)" section; the following sections renumbered to 4/5/6 (a duplicate `## 4` died in the process).
- Receipt: the birth-gate re-ran clean after the edits - "BIRTH-GATE: PASS (3 workflow(s) parsed, 4 checks clean)" - so the new trigger/gate survive the YAML-parse + SHA-pin checks.

**e - the paint-scheme axis + palette picker (issues #18 petrol, #19 jade, #20 picker, #21 golden hour)**

- `web/src/styles.css` - a second, orthogonal axis beside light/dark: `html[data-scheme="petrol|golden|jade"]` token blocks that override only the identity tokens (iris stays the default - it IS the base `:root`). Each preset is a FULL palette with a `html[data-scheme=...][data-theme="light"]` half, so light mode always wins inside every scheme. golden/jade share one warm-graphite cast and differ only in the accent trio. No layout class branches - house rule 1 holds.
- `web/src/theme.js` (new) - the two axes as data: `THEME_KEY`, `SCHEME_KEY`, `SCHEMES`, and `paperFor(scheme, theme)` (the per-scheme paper map the theme-color meta reads). One source for the switch, the picker, the bootstrap, and the gate.
- `web/src/components/SchemeSwitch.jsx` (new) - a native `<select class="scheme-switch">` beside the light/dark switch; writes `<html data-scheme>`, persists `flowforge-paint-scheme`, re-sets theme-color via `paperFor`. Hydration-safe: the first client render is the deterministic default (matching prerender), and an effect adopts the persisted scheme after mount.
- `web/src/components/ThemeSwitch.jsx` - now scheme-aware (reads `THEME_KEY`/`paperFor` from `theme.js`).
- `web/src/components/Nav.jsx` - renders `<SchemeSwitch />` before `<ThemeSwitch />`.
- `web/index.html` - the no-flash bootstrap applies BOTH axes pre-paint (theme + scheme), so a persisted scheme never flashes the wrong palette.
- `docs/_layouts/default.html` - the docs rig mirrors the whole axis: the same three `[data-scheme]` token blocks (both halves, `--accent-deep` set in each), the `.scheme-switch` picker + CSS, the two-axis bootstrap, and the change handler persisting the same key. The landing shell and the docs now agree on the palette in every scheme.
- `scripts/check-theme-parity.cjs` (new) + `tests/theme-parity.test.cjs` (new) - the parity gate (house rule 3: a bug caught twice becomes a gate). It reads `SCHEMES` from `web/src/theme.js` and refuses: a scheme present in only one surface (web styles.css vs docs layout), a scheme missing its light half or `--accent`/`--accent-deep` (the missing-accent-deep bug from #18/#19/#21), or an orphan `[data-scheme]` block the picker does not offer. Names file:line. Wired into `npm run check` and `npm run lint:docs`.
- Negative-tested, not assumed: deleting jade's light half makes the gate exit 1 naming the file; adding a `bogus` scheme block trips the orphan check; a scheme name inside a CSS comment does NOT (comments are stripped first). The seven behavior tests cover each class, green on the live tree.
- Browser-verified end to end: served `web/dist`, switched the picker to petrol, confirmed `localStorage["flowforge-paint-scheme"]="petrol"`, reloaded, and sampled the rendered page background - iris dark paper `#10131a` -> petrol dark paper `#0a1113`. The no-flash bootstrap was also unit-simulated: with `{scheme: petrol, theme: light}` it sets `data-scheme=petrol`, `data-theme=light`, and `theme-color=#edf3f2` (petrol's light paper).
- `web/scripts/adopt-icons.mjs` - documented the #20 art ruling at the source: the mark's accent is baked at generation time and stays the STATIONARY iris default (option a), so dau art never mismatches a runtime scheme switch.

**d - retire `repair-404` (BLOCKED, honestly)**

- The root fix for the literal-`$1`/`$2` 404 leak (prestruct#33, root-fix proposal prestruct#42 - generate the 404 through the injection pipeline so function replacers expand) is on prestruct `main` as **1.2.0** but is **NOT on npm**: `npm view prestruct version` = **1.1.0**, and the 1.1.0 tarball still ships the bug (`init/scripts/prerender.js` lines 426-438: `() => `$1...$2`` function replacers whose returns carry literal `$1`/`$2`). Confirmed on `main` (raw `engine/scripts/prerender.js`): the four 404 text tags now go through the injection pipeline, and the canonical uses a function replacer with a literal-result guarantee.
- Decision: `repair-404.cjs` STAYS until the pin bump that carries 1.2.0. Retiring it now would ship the leak. No code change; the blocker is recorded in `CHANGELOG.md` under "### Blocked".

**Gates (all green on the branch)**

- `npm test` -> **29 pass / 0 fail** (was 22; +7 parity tests).
- `npm run check` -> PASS (six compile checks + birth-gate 3 workflows/4 checks + theme-parity PASS).
- `npm run lint:docs` -> PASS (frontmatter, links, style, fiction signatures, jekyll filters, theme-parity).
- `npm run build --prefix web` -> "[prerender] Done. 3/3 pages rendered."; built CSS carries `[data-scheme=petrol|golden|jade]` plus their `[data-theme=light]` halves.

**House rules**

- No version bump (per the user): `package.json` = `web/package.json` = 0.9.0, still equal.
- `MANIFEST.md` - rows updated/added for `theme.js`, `SchemeSwitch.jsx`, the styles.css scheme axis, the two-axis `index.html` bootstrap, the docs-layout scheme row, `check-theme-parity.cjs`, `tests/theme-parity.test.cjs`, and the two workflow rows (also fixed a pre-existing merged `docs-deploy.yml`/`release.yml` row).
- `CHANGELOG.md` - Added entries for the theme files + presets + gate; a Changed entry for the `staging` branch; a Blocked entry for `repair-404`.

---

### 2026-10-29 - session: issue #9, the docs lane promoted to a reusable workflow

`docs-deploy.yml` was a per-repo one-off and the runbook it encoded had been hand-copied three times (flowforge / gistory / eyestruct) - and the copies had already drifted (Ruby 3.2 vs 3.4, upload-pages-artifact v3 vs v5, a pagefind scrape vs an npm pin). The issue asked to promote the lane to `on: workflow_call`.

- `.github/workflows/docs-build.yml` (new) - the reusable lane. `on: workflow_call` with inputs `docs-path` (default `docs`), `ruby-version` (3.2), `node-version` (22), `pagefind-version` (`latest` scrapes the newest release; any other value installs verbatim - the npm-pin shape the drifted copies wanted), `freestruct-version` (`^1.1.0`); output `pagefind-version`. Carries the whole runbook once: checkout, Setup Ruby, Jekyll build, the token-auth pagefind scrape (the rate-limit receipt), the search index, Setup Node, the PINNED freestruct install + post-build SEO layer, and the Pages artifact upload. Actions stay SHA-pinned; a fresh `setup-node` pin joins the set.
- `.github/workflows/docs-deploy.yml` - now a THIN CALLER (197 -> 55 lines): trigger, permissions (`contents: read` + `pages: write` + `id-token: write` - the caller grants the ceiling; the reusable half declares `contents: read` for itself), concurrency group, `build: uses: ./.github/workflows/docs-build.yml`, and the `deploy` job still gated to `main` (issue #30). The `paths:` filter gains `docs-build.yml` so a lane edit re-validates.
- `scripts/check-birth-gate.cjs` - new **check 6**, the reusable-workflow contract (house rule 3): a local `uses: ./...` must point at a file that exists AND declares `on: workflow_call`, and a `workflow_call` file must be called by someone. Both directions, so a thin-caller refactor cannot half-land. The re-parse is guarded - an unparseable file is named by check 1 and skipped here (found by the new test, not by inspection).
- `tests/birth-gate.test.cjs` (new) - 7 behavior tests: green on the live tree; caller -> `workflow_call` file (pass); caller -> non-`workflow_call` file (fail); caller -> missing file (fail); a `workflow_call` file nobody calls (fail, dead lane); a floating action pin (fail); the duplicate-YAML-key class (fail). Fixtures copy the gate into a temp tree and point `NODE_PATH` at the real `node_modules` so `js-yaml` resolves.
- Negative-tested by hand too: each of the four contract failures exits 1 naming the file, and the restored tree exits 0.

**Docs / receipts**

- `DEPLOY.md` - section 2 now describes the thin-caller + reusable-lane split and the sibling call shape (`uses: dhaupin/flowforge/.github/workflows/docs-build.yml@<ref>`).
- `MANIFEST.md` - new `docs-build.yml` row; `docs-deploy.yml` row rewritten as the thin caller; `check-birth-gate.cjs` row gains check 6; new `tests/birth-gate.test.cjs` row.
- `README.md` + `AGENTS.md` - workflow lines updated.
- `CHANGELOG.md` - Added entries (the reusable lane, the birth-gate test) + a Changed entry (the thin-caller refactor).

**Gates (all green on the branch)**

- `npm test` -> **36 pass / 0 fail** (was 29; +7 birth-gate tests).
- `npm run check` -> PASS (six compile checks + birth-gate 4 workflows/5 checks incl. the new reusable contract + theme-parity PASS).
- `npm run lint:docs` -> PASS.

**House rules**

- No version bump (per the user): `package.json` = `web/package.json` = 0.9.0, still equal.
- This closes issue #9 - the rig's docs lane is a versioned call, not a fourth drifted copy.

---

### 2026-10-29 - session: productization PRD (flowforge as a real tool)

Owner asked what actually ships in the npm package and how to make it a system users pull in and run, not a copy-and-hand-edit template. Answered by inspection: `package.json` has no `bin`/`main`/`exports` (nothing runs on install), brand literals are hardcoded across ~18 shipped files in three languages, and the tool shares a tree with its own dogfood deployment. Owner confirmed the direction (full CLI, `example/` folder like prestruct, GH "use this template", npm + GH release on tag like eyestruct) and asked to write it up.

- **`labs/prd-flowforge.md`** (new) - the productization PRD: two-identity model (rig vs site), the `site.config.js` contract, the five verbs (`create`/`sync`/`build`/`check`/`doctor`), the package layout (`bin/` + `lib/` + `templates/site/` + `example/`), the derivation model + brand census gate, the three distribution channels, and four migration phases (Phase 0 brand contract first).
- **Config name resolved to `site.config.js`** (owner call, same session): the first draft said `flowforge.config.js`, but a product-named config would force prestruct and freestruct to depend on flowforge - inverting the engine-to-shell dependency (this repo already carries two engine-owned identity files: `web/ssr.config.js` for prestruct, `docs/freestruct.config.yml` for freestruct). The family convention is concern-named configs (`crashtest.config.js` lives in five repos), so the neutral `site.config.js` wins: one authored file, three readers, engines stay product-agnostic (flowforge derives the two engine files in `sync`). PRD section 5.1.
- **Surveyed monoforge** (`dhaupin/gistory@main:monoforge-staging`) as the sibling precedent: it already ships `bin/forge.mjs`, `src/` verbs (stamp/doctor/lock/cut), `templates/` with `__TOKEN__` substitution, `factory.json`, and a `.monoforge-stamp.json` manifest that scopes the doctor's truth-slot scan. The PRD aligns flowforge's config vocabulary with `factory.json` and records the two ways the tools relate (flowforge as a monoforge provider, or standalone config-compatible - lean: standalone first, provider once the profile is proven).
- **Receipts read**: eyestruct `publish.yml` (the npm OIDC + GH release + verify ladder the owner asked to mirror) + `scripts/release-notes.cjs` (release notes extracted from the CHANGELOG, refuses empty); prestruct `package.json` + `bin/cli.mjs` + `init/` + `example/` (the layout precedent, and the "we can do it better" note: our example is tool-generated in CI so it cannot drift).
- Gates green after the add: `npm run lint:docs` PASS (fiction gate now 43 files), `npm run check` PASS. No version bump (0.9.0 = 0.9.0); no code change yet - PRD only, awaiting owner review on the open questions (section 13) before Phase 0.

---

### 2026-10-29 - session: Phase 0 - the brand contract (site.config.js)

Owner approved the PRD path and asked to push + start Phase 0. Also asked whether `site.config.js` collides outside the ecosystem, and asked for an issue so the "shared schema package" idea is not forgotten.

- **Naming research (answer: it helps, cannot hurt).** npm `site.config` + `site-config` both FREE (404). GitHub has ~77 repos with a root `site.config.js` (small portfolio/blog sites; no dominant tool). Major SSGs all use their own: `astro.config.mjs`, `docusaurus.config.js`, `eleventy.config.js`, `.vitepress/config.js`, `next.config.js` - none claims `site.config.js`. Config filenames are repo-local (not a global namespace), so a collision is a non-event; a bespoke name would be more distinctive but less self-explanatory. Keep `site.config.js`.
- **Issue #32 created** - "Graduate site.config.js to a shared schema package (prestruct + freestruct read it directly)". Records the next step (one source, three readers, no derivation) with the trigger (a second consumer, or friction) per the family rule of three. https://github.com/dhaupin/flowforge/issues/32
- **Pushed staging** (`819b5f2`) - PRD + the config rename. (First push reported OK but the local tracking ref was stale; re-fetched, remote confirmed at `819b5f2` via the API.)
- **Phase 0 shipped:**
  - `site.config.js` (root) - THE identity source (name, wordmark, tagline, description, url, repo, author, maker, org, docs block, theme keys, nav, footer extras, routes, 404). Added to `package.json` `files`.
  - `web/src/site.js` - the web bundle's one accessor (+ `routeMeta(path)`).
  - `web/ssr.config.js` - now an ADAPTER over site.config.js (prestruct reads what it always read; no engine change, no engine depends on flowforge).
  - `web/src/components/navItems.js`, `Nav.jsx`, `Footer.jsx`, `pages/Home|Terms|Privacy.jsx` - identity from the config.
  - `web/src/theme.js` - keys sourced from config, renamed to the neutral `site-theme`/`site-paint-scheme` (protocol, not brand); `web/index.html` + docs layout mirror the rename.
  - `docs/_layouts/default.html` - identity now Liquid (`{{ site.* }}`); nav URLs baseurl-relative (layout prefixes `site.baseurl`).
  - `docs/_data/nav.yml` - baseurl-relative, brand-free.
  - `scripts/flowforge-sync.mjs` + `npm run sync`/`sync:check` - generates `docs/_config.yml`, `docs/freestruct.config.yml`, `web/public/robots.txt`, `web/public/site.webmanifest`; deterministic; `--check` refuses drift. Wired into `npm run check`.
  - `scripts/check-brand-census.mjs` - the teeth: refuses an identity literal in any structural surface outside `site.config.js`, names file:line, strips comments, skips the sync-owned outputs.
  - `tests/brand-contract.test.cjs` - 8 behavior tests (live pass, determinism, drift fails, planted literal fails, comments ignored, ssr adapter literal-free, no product-named config).
- **Verification:** `npm test` 44 pass / 0 fail (was 36; +8). `npm run check` green (sync:check PASS, BRAND-CENSUS PASS). `npm run lint:docs` green (fiction gate now 48 files). **`npm run build --prefix web` -> 3/3 pages rendered**, inject-brand + repair-404 PASS; dist carries the config-derived wordmark/title/canonical and the neutral keys.
- **Receipts:** CHANGELOG.md (Added/Changed block), MANIFEST.md (new "root (the identity contract)" table), AGENTS.md (layout tree + house rule 1 rewritten for the one-file rebrand). No version bump (0.9.0 = 0.9.0).
- **CI catch (same session).** The first Phase 0 push went red on `Deploy Docs` -> `Build Jekyll`. Cause: `site.config.js`'s description contains `from: landing`; emitted unquoted into `docs/_config.yml`, the `: ` read as a nested mapping and Jekyll refused the whole config. Fixed in `flowforge-sync.mjs`: a `yamlStr()` helper quotes any unsafe scalar (colon+space, leading indicator, trailing space, control chars), and every YAML target is `yaml.load()`-ed before it is written (fail at cause, file named). Added two tests (both generated YAML files parse; a colon+space value round-trips). `npm test` 46/46.
- **Next (Phase 1, not started):** split tool from site - `templates/site/`, `lib/`, `example/`. Awaiting owner review.

---

### 2026-10-29 - session: the parent product is railyard (mounts proto-spec)

Owner asked to (a) settle the dogfood folder, (b) adopt the `mounts/[public,private,local]` system, and (c) name the factory product that drives flowforge + monoforge together.

- **Correction accepted: `/mounts` is not law.** I first read gistory's `mounts/README.md` as a frozen family spec and argued it could not apply to flowforge. Owner corrected: it is a proto-spec the family is building *alongside* monoforge + flowforge, and gistory is only the first testbed (it grew monoforge from a PRD inside itself). So flowforge and monoforge can share a `mounts/` structure - nothing forbids it.
- **Receipts read** (`dhaupin/gistory@main`): `mounts/README.md` (the three tiers + `boot/` carry folders + the "staging trees stay where they are, `mounts/` holds PAYLOADS only" contract), `mounts/state.json` (`"tiers": ["public","private","local"]`; `monoforge` + `poststruct` both `tier: public`), `mounts/public/monoforge/boot/README.md` (tarball-first landing, sha-gated), and `monoforge-staging/AGENTS.md` + `package.json` + tree. The parity ask ("models/mounts/packs rigs all speak public/private/local the same way") is filed to vant + packstruct.
- **Option 1 confirmed: the dogfood stays at `web/` + `docs/`** - no `example/` folder. Receipt: `monoforge-staging/web` is the same shape (prestruct landing at `web/`, docs engine beside it). PRD sections 7 + 9 rewritten; section 13 Q1 resolved.
- **Product named: `railyard`** (owner call). Verified free: `dhaupin/railyard` (404), npm `railyard` is TAKEN but irrelevant - railyard is a **service, not an npm package** (the components are the packages; npm `railyard` is a dead "generic railyard parser", 23 dl/mo, last publish 2022). Collision scan via DuckDuckGo: existing "railyard" hits are all real railroad yard-management software (a different domain) plus a data-centre rack planner; nothing in the dev-tooling space. The name fits the container role - a yard is where forges sit and staged work is switched/dispatched - where a `-forge` name would read as a third sibling. PRD section 11.1 added; section 13 Q7 resolved.
- **mounts/ recorded as the shared proto-spec** (PRD section 11.2): three tiers, one `state.json`; railyard is the first real home, with all three tiers **visible at first** (the `private/` + `local/` gitignore lines written but commented out, flipped private later without a migration).
- **No version bump** (0.9.0 = 0.9.0); labs/PRD only, no code change. PRD-only edits do not touch CHANGELOG (not a versioned surface).
- **Next:** owner to create `dhaupin/railyard`; then scaffold its skeleton (`mounts/{public,private,local}` + commented gitignore + `factory.json` + PRD stub), and either start flowforge Phase 1 or hold until railyard's shape is set.

### 2026-10-29 - session: railyard skeleton landed

Owner created `dhaupin/railyard` (private, access confirmed: push permission, default branch `main`, empty). Scaffolded and pushed the skeleton as `c8d10e3`.

- **railyard skeleton** (`dhaupin/railyard@c8d10e3`): `factory.json` (name, species "the forge yard", pitch, `siteDomain` railyard.creadev.org, version 0.9.0), `mounts/README.md`, `mounts/state.json` (`"tiers": ["public","private","local"]`; `flowforge` + `monoforge` registered as the first two public mounts, `tree` + `repo` per mount), `mounts/public/<mount>/boot/README.md`, `mounts/{private,local}/.gitkeep`, `.gitignore` (the `private/` + `local/` lines written but COMMENTED - all three tiers visible while the spec is young), plus README, AGENTS, CHANGELOG, LICENSE, and a PRD stub.
- **Receipts** (dhaupin/gistory@main): `mounts/README.md` + `mounts/state.json` (the proto-spec, 2026-10-28), `mounts/public/monoforge/boot/README.md` (tarball-first landing). railyard's `mounts/README.md` records the proto-spec provenance and the parity ask to vant + packstruct.
- **No payloads yet** - the mounts are registered, not landed. monoforge's move out of gistory (owner-driven: an agent cuts the staging tar) is what lands the first boot bytes.
- **Next:** (3) monoforge staging tar out of gistory onto `dhaupin/monoforge` staging (owner will signal when the tar is ready); (2) flowforge Phase 1 (split tool from site).

---

### 2026-10-29 - session: flowforge Phase 1 - split tool from site

Phase 1 of the PRD: separate the tool (versioned once, imported by adopters) from the site (the dogfood, left in place). Landed on `staging`; no version bump.

- **`lib/` - the tool half.** `git mv` moved the whole `check-*.cjs` family to `lib/gates/`, `scripts/flowforge-sync.mjs` -> `lib/sync.mjs`, and `lint-packs.cjs`/`ship-from-download.cjs`/`unwrap-prose.cjs` -> `lib/`. The gates reach an adopter by `npm update` (the PRD 7 reason for `lib/` over a per-site copy).
- **`lib/root.cjs` + `lib/root.mjs` - the root resolver.** Every gate resolved `path.resolve(__dirname, '..')`, true only while the gate sat beside the site it checks. The resolver walks up to the nearest `site.config.js` (skipping candidates under `node_modules`, so the tool's own copy never wins) with a `--root <dir>` override for tests; the CJS + ESM twins let both gate families share one rule. `check-docs-links.cjs` also stopped hardcoding `SITE_PREFIX = '/flowforge'` - it now reads `baseurl` from the generated `docs/_config.yml`, so the gate carries no adopter brand.
- **`lib/template.mjs` + `templates/site/` - the copy source, GENERATED.** `npm run template` builds `templates/site/` from the dogfood tree with the identity swapped for monoforge-convention tokens (`__NAME__`, `__SITE_URL__`, `__DOCS_URL__`, `__REPO_URL__`, `__AUTHOR__`, `__ORG_NAME__`, `__ORG_URL__`, `__MAKER_LABEL__`, `__DOCS_HOST__`, `__DOCS_BASEURL__`). Generated, not hand-kept: a hand-maintained duplicate would reintroduce exactly the churn the dogfood-in-place call avoids. `npm run template:check` (in `npm run check` + CI) refuses a drifted or stale template; the generator refuses to emit if any dogfood identity literal survives tokenization. Sync-owned outputs are excluded (the adopter regenerates them). Token convention transcribed from monoforge's `src/stamp.mjs`.
- **Dogfood unchanged in place** (`web/` + `docs/` + `site.config.js`), per the owner call; receipt: `dhaupin/gistory@main:monoforge-staging/` keeps its dogfood at `web/` + `docs/`.
- **One brand literal a rebrand would have missed:** `web/public/brand/flowforge-logo.jpg` -> `logo.jpg`. A brand name in a filename is invisible to the census gate, so it was the one identity string the gate could not catch.
- **Verification:** `npm test` 51 pass / 0 fail (was 46; +5 template tests). `npm run check` green (birth-gate, sync:check, **template:check**, BRAND-CENSUS). `npm run lint:docs` green. `npm run build --prefix web` -> **3/3 pages rendered**, inject-brand + repair-404 PASS. Jekyll is CI's job (no local bundler in the sandbox).
- **Receipts:** CHANGELOG.md ("Phase 1 - split tool from site"), MANIFEST.md (new "lib/ (the tool)" table + moved rows + the logo rename), AGENTS.md (layout tree + rule 3), README.md (box table + commands), DEPLOY.md (local-check paths), labs/prd-flowforge.md (sections 7 + 9 rewritten for the landed shape and the generated-template decision). No version bump (0.9.0 = 0.9.0).
- **Still open:** file the "site.config.js as a family-shared schema package" issue (owner asked explicitly); Phase 2 (the `bin/flowforge.mjs` CLI + the five verbs).

---

### 2026-10-29 - session: the release ladder adopted from eyestruct

Scope, per the owner: "we can apply anything you find to monoforge + railyard + flowforge. Use eyestruct as a template (its workflows/ci works, it's been updated recently)." So eyestruct's `.github/workflows/` and its two generic scripts are the template; adopt the applicable parts here. Receipts: `dhaupin/eyestruct@4e2b552` (`.github/workflows/publish.yml`, `scripts/release-notes.cjs`, `scripts/verify-release.cjs`, `tests/release-verify.test.js`).

- **`release.yml` is now the 3-job ladder** (publish / release / verify) plus a `verify-only` dispatch mode, transcribed from `dhaupin/eyestruct@4e2b552`. The gap the shape closes (eyestruct's 1.0.0 cut proved it): a publish step can go green while the registry result is wrong, because nothing asserted the tarball between proof-of-publish and proof-of-work. The publish job keeps the OIDC trusted-publishing publish and the 0.x + tag==version gate; the release job cuts the GH release from the tag with notes extracted from the changelog; the verify job re-proves the cut against npm and the GH release.
- **`lib/release-notes.cjs`** (the release-body extractor) and **`lib/verify-release.cjs`** (the pack/npm/gh trust ladder) are the two generic scripts, identical across the family. Two local additions to the ladder over the upstream copy: a named `--allow` prefix list (this shell ships the whole rig on purpose: `web/`, `docs/`, `tests/`, `labs/`, `packs/`, `templates/`, `.github/`) and a named SKIP when a package declares no `main`/`exports`/`bin` (nothing to load; this shell is that shape). Fixed over the upstream `release-notes.cjs`: the newest section is also the last heading on the first cut, so an absent following heading now slices to EOF instead of erroring.
- **`tests/release-verify.test.cjs`** runs the pack ladder OFFLINE every push (the standing receipt eyestruct carries): a positive case over real `npm pack` output and a negative case refusing a doctored tarball by name, so the contents assertions do not live only on release days.
- **`CHANGELOG.md` headings normalized** to the family keep-a-changelog shape (`## [Unreleased]`, `## [0.9.0]`) so `lib/release-notes.cjs` can slice the release body. (Upstream eyestruct/poststruct/gistory already use the bracketed form; flowforge was the odd one.)
- **`lib/gates/check-birth-gate.cjs` serde check narrowed** to git verbs that WRITE a git dir (`init`/`add`/`commit`/`-C`). The old heuristic matched any script that mentioned `git` + `tar`, which flagged the new `lib/verify-release.cjs` (it only READS history: `git archive`, `git rev-parse`). Read-only verbs never mutate the tree being packed, so the ladder is not that class.
- **Verification:** `npm test` 53 pass / 0 fail (was 51; +2 release-verify). `npm run check` green (birth-gate, sync:check, template:check, BRAND-CENSUS). `lib/verify-release.cjs --pack` on a real `npm pack` of this tree PASSes the whole ladder.
- **Not adopted here, on purpose:** the docs lane. flowforge already carries the reusable `docs-build.yml` + thin-caller `docs-deploy.yml` (issue #9), which is a stronger shape than eyestruct's inline `docs.yml`; there is nothing to pull in that direction. The `publish.yml` name is `release.yml` here (the existing flowforge convention) - the shape is eyestruct's, the filename stays.
- **No version bump** (0.9.0 = 0.9.0); this is CI/plumbing, not a released surface.

---

### 2026-10-29 - session: the frontmatter gate gets YAML teeth (rule #3)

monoforge's `docs/index.md` shipped with `description: slots: generated by the factory` - an unquoted scalar carrying a colon-space. YAML reads that as a nested mapping, the frontmatter block fails to parse, and Jekyll drops the WHOLE block: no layout, no head injection, a page rendered without its own chrome. Every `check-docs-frontmatter` gate in the family (vant -> crashtest -> eyestruct -> monoforge -> flowforge) regex-scanned for `key: value` and never noticed, because a regex scan says nothing about whether YAML parses. Caught in monoforge, so it becomes a gate (house rule #3).

- **`lib/gates/check-docs-frontmatter.cjs`** - added a dependency-free scalar check. Every frontmatter field value must be a valid plain YAML scalar: an unquoted colon-space (`: `), an unquoted ` #` comment start, a leading YAML indicator, or an unterminated quote is refused by name (file:line). The check scans EVERY top-level field, not only the REQUIRED four - the monoforge bug landed in `description`, which a variant gate that did not require that field would have scanned past. Dependency-free on purpose: the gate rides a zero-dep tool tree and a stamped repo with no install step, so it cannot lean on `js-yaml`.
- **`tests/docs-frontmatter.test.cjs`** - the gate's scalar leg, four behavior tests: a clean page passes, an unquoted colon-space in a required field is refused by name, the same in a NON-required field is refused too (the monoforge shape), and a quoted colon-space stays lawful.
- **Propagation:** the gate lives in `lib/gates/` and reaches every adopter through `npm update`, so this fix is not a per-site copy. The same fix landed in monoforge's `scripts/` + `templates/scripts/` copies (that repo's `templates/` is the stamp source, so a stamped repo inherits it from birth).
- **Verification:** `npm test` 53 -> 57 pass / 0 fail. `npm run lint:docs` green. The gate bites on a planted colon-space in both the dogfood tree and a fixture.
- **No version bump** (0.9.0 = 0.9.0); a gate fix, not a released surface.

---

### 2026-10-29 - promotion: staging -> main

Promoted `staging` to `main`: the release ladder (3-job OIDC publish / release / verify), the frontmatter gate's YAML-scalar teeth, and the Phase 1 tool/site split (`lib/` + `templates/site/`) all reach main. `main` carried two commits `staging` lacked (a direct `Logo` drop); they stay as merge parents, and the logo blob is preserved at its Phase 1 home `web/public/brand/logo.jpg`. Per DEPLOY.md section 3, `staging` fast-forwards back to `main` after the merge so the two do not drift.

---

### 2026-10-29 - session: the brand census scans filenames (rule #3)

The promotion merge resurrected a stray `web/public/flowforge-logo.jpg`: main's direct `Logo` commit (aa5c350) had dropped the art at the public root, and Phase 1 had already renamed the real master to `web/public/brand/logo.jpg` (a brand name in a filename is invisible to a content scan - CHANGELOG Phase 1 called exactly this out). The merge brought the old path back, the template builder copied it, and `template:check` failed on the main CI run (`fc83be7`). Caught twice now, so it becomes a gate.

- **`lib/gates/check-brand-census.mjs`** - the census now walks the shipped surfaces (`web/` + `docs/`) and refuses any PATH carrying an identity literal, not just file CONTENTS. Build products (`dist/`, `node_modules/`, `.prestruct`, `_site`, ...) are skipped: they are regenerated, not source, and a stale local `dist/` must not fail the gate. A filename cannot be tokenized, so a rebrand renames it by hand - only a path scan catches the one a hand-rename missed.
- **`tests/brand-contract.test.cjs`** - the filename leg: a planted `flowforge-logo.jpg` is refused by name.
- **`web/public/flowforge-logo.jpg`** - removed (the stray duplicate; the real master stays at `web/public/brand/logo.jpg`, byte-identical blob `77838b7`).
- **Verification:** `npm test` 57 -> 58 pass / 0 fail. `npm run check` green (BRAND-CENSUS PASS, template:check PASS, sync:check PASS, birth-gate PASS, theme-parity PASS). `npm run lint:docs` 6/6 PASS.
- **No version bump** (0.9.0 = 0.9.0); a gate fix, not a released surface.

---

### 2026-11-04 - session: family parity (CI truth, language gate, fuller template)

The shell's CI, gates, and generated template were audited against the nine struct-family repos and brought into line. The rename was already done; this is the "get coreforge up to snuff" pass the owner asked for.

- **Action pins, truth in the comments.** `actions/setup-node@949feb24...` is v7 (resolved against the upstream tag), but `release.yml` (twice) and `docs-build.yml` labeled it `# v5`; `test.yml` already said `# v7`. All three now read `# v7`. The pin gate only checks the SHA, so a lying tag comment was invisible to it - worth a future soft check.
- **Publish step -> family canon.** Dropped `--access public` (the family shape is `npm publish --provenance`; the flag is a no-op for an unscoped name) and dropped `registry-url` from the publish job's `setup-node` (it writes an `.npmrc` expecting `NODE_AUTH_TOKEN`, which OIDC does not have).
- **`lib/gates/check-language.cjs` (new).** The family language gate (canon: monoforge/poststruct/prestruct/packstruct/freestruct) - committed prose is English-only, detected by Unicode script-block longest run. Adapted to the shell's `lib/root.cjs`; wired as `lint:language` and into `check`. `tests/language-gate.test.cjs` ships the 7 behavior cases (live tree, English pass, flagged run, 2-vs-3 threshold, fenced + inline-code exemption, env escape hatch) - a new law with a fixture that breaks it.
- **`.github/workflows/staging-ff-sync.yml` (new).** The family automation that fast-forwards `staging` to `main` after a promotion (fast-forward-only refspec; a divergence fails loudly). The shell previously documented this as a manual step.
- **`templates/site/` -> 51 files.** The generated copy source now carries the standalone CI (docs lane + thin caller + staging fast-forward), the `.gitignore`, and the `packs/` slot, alongside the site half. `release.yml` and `test.yml` are EXCLUDED: both are coupled to the `coreforge` package (release publishes it; test runs the dogfood battery with its pins + `flowforge#N` citations) and to the dogfood's `lib/` path - they belong to the `create` CLI (Phase 2), which stamps an adopter's own.
- **Docs:** README box table + AGENTS layout updated for the new template scope and the 5-workflow set.
- **`release.yml` -> `publish.yml`** (file + `name:`). The family canon names the tag-driven ladder `publish.yml` (all nine siblings), and the shell's own PRD §10 names it `publish.yml` - the `release.yml` filename was a holdover from the pre-parity convention (an earlier TASKS entry records that choice). Nothing cross-references the file, no ruleset pins the check name, so the rename is safe; the ladder's shape is unchanged. (Frozen receipts - this log, CHANGELOG, MANIFEST - keep their historical `release.yml` mentions; only the rename note above is new.)
- **Receipts:** `npm test` 82 pass / 0 fail; `npm run check` green (birth-gate 5 workflows, theme-parity, sync:check, template:check 51 files, brand census, action pins 14 refs); `npm run lint:docs` 6/6 PASS; `npm run lint:language` PASS (8 prose files).
- **No version bump** (0.9.0 = 0.9.0); a parity pass, not a released surface.

---

### 2026-11-04 - session: canon parity (release ladder, phone lane, prose flow)

The shell carried its own cut of the family release tooling and it had drifted from the canon the nine struct-family repos now share. Brought it into line so every suite in the family publishes, releases, ships from the phone, and writes prose the same way.

- **`lib/verify-release.cjs`** - replaced with the family canon (byte-identical across the nine). The expected-set authority is a REAL `npm pack` of this tree, never a `--dry-run --json` parse (some npm builds answer that with empty stdout, which read as a capability failure on a clean tree). Carries the two 1.2.0-cut fixes (`releaseTargetMatches` accepts a branch-name `target_commitish`; `registryHasVersion` waits out read-replica lag), the dry-run strip, and `--asset`.
- **`lib/release-notes.cjs`**, **`lib/check-action-pins.cjs`** - landed for parity (the extractor the release body uses; the pins-never-float guard). Pin guard wired as `npm run lint:pins` and inside `npm run check`; it passes on the live tree (14 refs, 4 workflows, all SHA-pinned).
- **`scripts/ship-from-download.cjs`** - the phone lane refreshed: the staged `.npmrc` carries the `_authToken` line ONLY (the deprecated `always-auth` line is gone - npm >=9 warns "Unknown project config" and that warning can corrupt the child `npm pack --dry-run --json`).
- **`.github/workflows/release.yml`** - the publish step is idempotent; the release job attaches the EXACT served tarball (polled, read-replica lag); the verify job runs `--npm` + `--gh --asset`.
- **Prose flow** - `lib/unwrap-prose.cjs` refreshed to the hardened canon and the AGENTS.md prose-flow law added. Living prose flowed across README/AGENTS/DEPLOY/MANIFEST/CHANGELOG/packs/README/labs (packs README 50 -> 22 non-blank lines, TASKS 514 -> 262, prd 266 -> 140).
- **Receipts:** `npm test` 71 pass / 0 fail (7 release-verify + 8 pin cases new); `npm run check` green (birth-gate, theme-parity, sync, template, brand-census, action-pins); `npm run lint:docs` 6/6 PASS.
- **No version bump** (0.9.0 = 0.9.0); a tooling-parity pass, not a released surface.

---

### 2026-11-03 - session: the rename lands (flowforge -> coreforge)

The member formerly called `flowforge` is now **coreforge** (govstruct PRD §16.5, the first proving case). The repo is `dhaupin/coreforge`, the site `coreforge.creadev.org`, the docs `docs.creadev.org/coreforge`. It is also a collision fix: npm `flowforge` is owned by an unrelated party, so the package could never publish under that name; `coreforge` is free on npm (404) and GitHub (404).

- **`site.config.js`** - the one identity source, swapped first: name, wordmark (`core`/`forge`), url, repo, docs block (host + baseurl `/coreforge`), nav, route meta. `npm run sync` then regenerated the derived surfaces (`docs/_config.yml`, `docs/freestruct.config.yml`, `web/public/robots.txt`, `web/public/site.webmanifest`), and `npm run template` re-tokenized `templates/site/` (43 files).
- **Living references** updated across `.github/workflows/*`, `lib/*`, `tests/*`, `web/scripts/*`, `web/src/*`, `docs/`, `AGENTS.md`, `README.md`, `DEPLOY.md`; `package.json` + `web/package.json` names (`coreforge`, `coreforge-site`) and both lockfiles regenerated.
- **Frozen receipts kept as written** - the earlier CHANGELOG sections, `MANIFEST.md`, this log's prior entries, `labs/prd-flowforge.md`, and code comments citing `flowforge#N` (issue citations are history). A comment describing the old `flowforge-logo.jpg` incident also stays - the census gate strips comments precisely because prose about the brand is not a hardcode.
- **Theme/scheme keys are protocol constants, not brand** (`site-theme`, `site-paint-scheme`), so they were left stable across the rebrand - the same rule site.config.js documents.
- **Verification:** `npm test` 71 pass / 0 fail; `npm run check` green (birth-gate, theme-parity, sync:check, template:check, BRAND-CENSUS PASS - 5 literals confined to site.config.js across 22 surfaces, action-pins PASS 14 refs); `npm run lint:docs` 6/6 PASS.
- **No version bump** (0.9.0 = 0.9.0); a rename pass, not a released surface.

---

### 2026-11-04 - session: the `create` CLI (Phase 2) + the docs-lane call

The shell's Phase 2 landed: the `coreforge` command exists, and the two tool-coupled CI lanes now have an adopter-safe stamp. Scope this session: the CLI (PRD 6), the template token gaps, the soft action-pin check, and the docs-lane topology call.

- **`bin/coreforge.mjs`** (new) - the five site verbs (`create` / `sync` / `build` / `check` / `doctor`) plus three release verbs (`verify-release` / `release-notes` / `lint-packs`) that forward to the `lib/` scripts the family's `publish.yml` calls. `create` fills every site-template token from a `site.json` (or flags), refuses a surviving `__TOKEN__` by name, and never clobbers. `doctor` is the load-bearing half: config + placeholder residue + derived-freshness + `check`, and generated green is never shipped.
- **`templates/adopter/`** (new) - the two CI lanes `create` stamps into an adopter (`test.yml`, `publish.yml`), wired to the installed tool. The site template excludes them because they call the `coreforge` package, not the dogfood's `lib/`.
- **`package.json`** - `bin.coreforge` added; `files` ships `bin/`; `js-yaml` moved devDeps -> deps (the birth-gate and `sync` parse YAML at runtime, so an adopter's install needs it). PRD 7 said "files tightens to bin/, lib/, templates/" - landed.
- **`lib/release-notes.cjs`** - root now `process.cwd()` (was `__dirname/..`), so an adopter's installed copy reads THEIR changelog. **`lib/verify-release.cjs`** - a `bin` is no longer treated as a loadable root (the new `bin` entry tripped the consumer load probe; a bin is proven by the `bin --version` leg).
- **`lib/check-action-pins.cjs`** - opt-in `--verify-tags`: resolve each `owner/repo@sha` and refuse a `# vN` comment whose tag does not point at that SHA (the setup-node `# v5`-vs-v7 class). Offline/unauthenticated it SKIPs by name. Live: 13/13 verified.
- **`docs/cli.md`** (new) + a nav row - the CLI reference. Copied VERBATIM (`lib/template.mjs` `VERBATIM` set): it is prose about the `coreforge` command, whose name is also the dogfood brand, so tokenizing it would rename the command in every stamped site. The brand census does not scan `.md` content, so the doc may name the tool freely.
- **`site.config.js`** - the comment citing `labs/prd-flowforge.md` (a stale filename an adopter would not have) now states the derivation model inline. This closes the last known template-leak residual.
- **Docs-lane topology - DECIDED (the user's call): leave it alone.** freestruct is the source of truth for the docs CONTENT; coreforge is the provider of a reusable docs LANE (`docs-build.yml` + `docs-deploy.yml`), consumed cross-repo by crashtest. The family runs two topologies on purpose: freestruct's `docs-lane.yml` (which others call) and coreforge's local reusable that calls itself. coreforge is not a docs-site consumer of freestruct's lane, so the crashtest-dogfood-leg blocker (freestruct's lane runs `crashtest run` unconditionally; coreforge ships no `crashtest.config.js`) never arises. No change; recorded so the next agent does not "fix" it.
- **Template token gaps - CLOSED.** The wordmark composite `__WORDMARK__` token (from the prior session) plus the `site.config.js` comment fix; `create`'s residue guard and the `VERBATIM` set leave no residual leak. `npm run template` green (52 files).
- **Receipts:** `npm test` 91 pass / 0 fail (7 CLI + 2 pin cases new); `npm run check` green (birth-gate 5 workflows / 14 pins, brand census, sync:check, template:check, theme parity, language); `npm run lint:docs` 6/6 PASS; a temp-dir `create` -> `sync` -> `doctor` round trip is PASS.
- **No version bump** (0.9.0 = 0.9.0). v1.0.0 is NOT cut - functional first, per the session constraint.

---

### 2026-11-04 - session: the docs-lane consolidation (coreforge delegates)

SUPERSEDES the "Docs-lane topology - DECIDED: leave it alone" note above. That note recorded the pre-consolidation call. Owner then chose the full consolidation: one docs lane, no drift. coreforge no longer ships a fork.

- **`.github/workflows/docs-build.yml` DELETED.** It was a fork of `dhaupin/freestruct`'s `docs-lane.yml` under a second name, and the two had drifted (ruby 3.2 vs 3.4, pagefind `latest` scrape vs npm pin, no `strict`, no crashtest gate). One lane now.
- **`.github/workflows/docs-deploy.yml`** - now a thin caller: `uses: dhaupin/freestruct/.github/workflows/docs-lane.yml@<sha>` with `ruby-version: '3.4'` (the Gemfile's bigdecimal note is a 3.4 fact) and `freestruct-version: '1.2.0'` (exact, never a range). The lane owns the runbook, the pinned tool installs, and the main-gated deploy job.
- **`templates/site/`** - no longer ships a forked lane (51 files, was 52). The stamped `docs-deploy.yml` is the same thin caller; an adopter gets one lane, not a copy. `tests/template.test.cjs` now ASSERTS the absence of `docs-build.yml` (the drift cannot come back through the template).
- **`lib/check-action-pins.cjs`** - the opt-in `--verify-tags` slug derivation now takes the first two path segments, so a cross-repo reusable ref (`owner/repo/.github/workflows/x.yml@sha`) resolves to the right repo (was `owner/repo/.github`, which would never resolve).
- **`lib/template.mjs` + `bin/coreforge.mjs`** - a `__LANE_REPO__` token (filled to `dhaupin/freestruct`) protects the fixed engine repo: without it the `__AUTHOR__` token rewrote `dhaupin` in the stamped caller and broke the ref for every adopter. `tests/cli.test.cjs` asserts the stamped caller names `dhaupin/freestruct` at a 40-hex SHA and carries no token.
- **Docs updated:** README (workflows + templates/site rows), DEPLOY.md section 2, AGENTS.md layout.
- **Receipts:** `npm test` 91 pass / 0 fail; `npm run check` green (birth-gate 4 workflows, 9 pins, reusable call verified); `npm run lint:docs` 6/6 PASS; `template:check` PASS (51 files); a `create` smoke test stamps the caller at `dhaupin/freestruct@<sha>` with no residue.
- **No version bump** (0.9.0 = 0.9.0); a workflow consolidation, not a released surface.


- **The pin guard now scans `action.yml` (2026-11-04 sweep).** The family pin guard (`scripts/check-action-pins.cjs`) scanned only `.github/workflows/`, so a floating `uses:` in a repo-root composite Action manifest went unseen. crashtest's `action.yml` (the gate other repos add) carried `actions/setup-node@v6` and `actions/upload-artifact@v6` plus a duplicated `default:` key; both are now pinned and the key is gone. The guard scans the manifest alongside the workflows, and its battery proves the new leg bites. Sweep finding; no version bump.


- **The docs lane went red on `main` - the config shape, not the links (2026-11-04 sweep).** The consolidation moved the family onto one reusable docs lane whose strict link check is on by default. coreforge and govstruct were the ONLY two repos whose generated `docs/freestruct.config.yml` baked the deploy path into `site.url` and omitted `basePath`; every other repo (eyestruct, monoforge, gistory, crashtest, packstruct, poststruct, prestruct) is origin-only + `basePath`. freestruct joins `site.url + basePath + slug` (engine/urls.js), so with no `basePath` the link checker resolved root-absolute `/coreforge/...` hrefs against the tree root and reported them missing: 12 false-positive broken links, build failed. Fix is one-source: `lib/sync.mjs` emits `site.url = docs.host`, `basePath = docs.baseurl`, `linkCheck: true`; the generated file follows; a new `tests/brand-contract.test.cjs` law (with a planted pre-fix fixture) proves the guard bites. Receipts: `npm test` 105/105, `npm run check` green. No version bump; v1.0.0 still held.


- **The second coreforge docs bug: nav `/cli/` vs `permalink: cli` (2026-11-04 sweep).** Once the basePath fix cut the false positives (12 -> 3), the strict gate surfaced a REAL broken link that the old `linkCheck: false` had hidden: `docs/_data/nav.yml` links `/cli/` (directory route) but `docs/cli.md` declared `permalink: cli`, which Jekyll resolves to `cli.html` (flat). freestruct's checker reads a trailing-slash href as a directory route (index first, then the .html sibling), so `/coreforge/cli/` was a true 404. Fix: `permalink: cli/` builds `cli/index.html`, matching the nav (the sibling `discussions/` was already correct). PROVEN against a real Jekyll build in docker: `permalink: cli` -> `_site/cli.html` (nav broken), `permalink: cli/` -> `_site/cli/index.html` (checkLinks 0 broken). Propagated to the VERBATIM template copy `templates/site/docs/cli.md`. New law in `tests/docs-frontmatter.test.cjs` holds every nav url to its page's route shape, with a planted mismatch fixture. Receipts: `npm test` 107/107, `npm run check` green.


- **The link gate's blind spot, family-wide: page-relative links (2026-11-04 sweep).** A crawl of every family docs site found 5 real broken links (freestruct's hits were code-sample false positives). Root cause, one shared blind spot across the link gates: a page-relative link (`./x`, `../x`) was resolved against the SOURCE tree, which always holds the file, so a served-broken link never bit. On a no-trailing-slash permalink page the browser reads `<baseurl>/foo` as a FILE and resolves the relative target one level off - a real 404 (gistory + poststruct `discussions` were the live cases; govstruct/monoforge had `permalink: discussions/`, so their relative links happened to resolve). The gates now refuse the relative shape by name (internal links are root-absolute). Hardened in `lib/gates/check-docs-links.cjs` (this repo - the gate ships to every adopter via `coreforge check`), plus the sibling copies in crashtest, poststruct, govstruct, monoforge, eyestruct, and packstruct, and gistory's `scripts/check-docs.mjs`. `tests/docs-links.test.cjs` (new) proves the leg bites (root-absolute passes, `./x` and `../x` refused, external untouched). Receipts: `npm test` 111/111, `npm run check` green, `npm run lint:docs` 6/6 PASS; the post-fix crawl is 237 pages / 0 broken.
- **packstruct's link gate had a copy-paste baseurl bug (2026-11-04 sweep).** `scripts/check-docs-links.cjs` was still checking `/prestruct/` permalinks and naming `/prestruct` in the failure message - a leftover from the prestruct port. Corrected to `/packstruct` (the real baseurl) as a named `SITE_PREFIX` constant, alongside the page-relative refusal above. Receipt: `npm run lint:docs` PASS (14 files).
- **The Ruby leg was two versions in one tree (2026-11-04 sweep).** `.github/workflows/test.yml` (and its `templates/adopter/` mirror) built docs on Ruby **3.2** while `docs-deploy.yml` and the Gemfile note run **3.4** (bigdecimal is a 3.4 bundled gem) - the exact drift the docs-lane consolidation removed, left stale in the battery. Both legs now build on 3.4, held by a new `tests/workflow-ruby-parity.test.cjs` law (every Ruby leg in the tree, dogfood + template, must declare ONE version). Receipts: `npm test` 111/111, `npm run check` green. No version bump; v1.0.0 still held.

- **Adopter hardening: the stamp leaked the shell's brand, shipped a stale tree, and baked the scheme-less docs host (2026-11-08).** Grafting the shell onto memstruct (a real adopter) surfaced four defects in `coreforge create` + the template - each one a thing a human had to fix by hand. Fixed at cause, each with a fixture that breaks it.

  1. **The stamp leaked coreforge's own brand art.** `templates/site/web/public/` shipped the dogfood's traced `icon.svg`, the PNG ladder, the OG card, and `brand/logo.jpg`; `web/scripts/brand-mark.json` shipped the dogfood's mark data. Binary art cannot be tokenized, so the copy pass carried it verbatim into every stamped site. Fix: `lib/template.mjs` now excludes the shell's art (`EXCLUDE_ART`) and treats a hand-kept NEUTRAL placeholder set (`HANDKEPT`: the placeholder `icon.svg`/PNGs/OG card/`brand-mark.json` committed in `templates/site/`) as its own class - never written, never pruned. A separation guard refuses a rebuild that made any placeholder byte-identical to the dogfood's. Fixtures: `tests/template.test.cjs` (the placeholder differs; a clobbered placeholder fails `template:check`).
  2. **`create` left a stale tree.** It stamped the surfaces but never ran `sync`, so a fresh stamp failed its own `doctor` on "derived surfaces are stale" - the adopter's first commit was red. Fix: `create` derives the surfaces itself (calls the same `sync` path), so create -> doctor is clean with no manual step. Fixture: `tests/cli.test.cjs` (create leaves a doctor-clean tree; the stale-derived law still bites via a hand-deleted generated file).
  3. **The scheme-less docs host baked the memstruct docs failure into every adopter.** `create` defaulted `docsHost` to `docs.creadev.org` (no scheme), so the generated `docs/_config.yml` `url` and `freestruct.config.yml` `site.url` were scheme-less - and the docs lane's strict link check reads a scheme-less `host/path` href as a RELATIVE path (the exact 3-link failure memstruct's staging push hit). Fix: the default now carries `https://`, and a new `lib/identity.mjs` validates `url`/`docs.host`/`docs.url`/`docs.baseurl`; both `create` (before it writes anything) and `sync` (on the committed config) refuse a malformed identity at cause. Fixtures: `tests/cli.test.cjs` (a scheme-less `docsHost` refuses before the stamp; `sync` refuses a scheme-less `docs.host`).
  4. **The fiction gate tripped on its own signature file when vendored.** The self-allow-list was path-keyed (`lib/gates/...`), but an adopter vendors the gates under `scripts/` - so the gate read its own `check-docs-style.cjs` signature line as a fiction hit (the false positive memstruct and crashtest both reported). Fix: the allow-list matches by BASENAME. Fixture: `tests/fiction-allow.test.cjs` (vendored under `scripts/` passes; a planted fiction line still bites).

  Receipts: `npm test` 126/126 (was 119; +7 new laws), `npm run check` green (sync:check, template:check, brand-census, pins, language all PASS). No version bump; v1.0.0 still held. Re-stamped a scratch adopter end-to-end: create (no manual sync) -> `doctor: 0 fail(s) - PASS`, docs `url` carries `https://`, art is the neutral placeholder, `brand/` absent.

- **The lander copy: "two sites" -> "every site" (2026-11-03 session).** The shell's hero, `site.config.js` tagline/description, and the README/DEPLOY/AGENTS headers all said "one repo, two sites" - a count that reads as a ceiling, not the derivation model the rig actually ships (one authored brand file fanning out to the landing, the docs, and whatever else an adopter adds). Copy pass only, no shape change: the H1 and tagline are now "one repo, every site: one brand file, zero drift" (keeping the old "zero drift" value prop), the lede spells out the one-file-to-every-surface flow, and the route meta description follows. `lib/template.mjs` regenerated `templates/site/` (41 files, `template:check` PASS), so a stamped site inherits the same wording.
- **`docs/cli.md` walked an adopter into the scheme-less docsHost trap (2026-11-03 session).** The quick-start `site.json` example carried `"docsHost": "docs.creadev.org"` - the exact value `lib/identity.mjs` now refuses, and the failure the 2026-11-08 adopter-hardening round was written to catch (a scheme-less host makes the docs lane read every internal link as relative). The example now carries `https://docs.creadev.org`; the docs head page was refreshed to the plural-site wording and now links the CLI page (root-absolute `/coreforge/cli/`, matching the link gate's rule). Propagated to the VERBATIM template copy. Receipts: `npm test` 126/126, `npm run check` green, `npm run lint:docs` 6/6 PASS, `web` build 3/3 prerender clean. No version bump; v1.0.0 still held.

- **The adopter hardening sweep: #48 / #49 / #47 / #35 / #36 (2026-11-10 session).** Five of the six open coreforge issues land together - three adopter-facing bugs the stamped tree rediscovered, the missing family arm, and the in-repo half of the rename.

  1. **#48 - the template `.gitignore` missed the in-tree Jekyll + pagefind products.** `npm run docs` builds IN-TREE (unlike the issue #22 scratch-copy recipe), so Jekyll drops `docs/.jekyll-cache/` + `docs/.jekyll-metadata` beside the source and pagefind drops `docs/pagefind/` - gamestruct had to add all four by hand to keep a local build from showing up as untracked noise. Fix: the root `.gitignore` and the generated `templates/site/.gitignore` carry the four lines. Fixture: `tests/template.test.cjs` (both trees must ignore them).
  2. **#49 - the docs-deploy caller missed `site.config.js`.** The docs identity (`docs/_config.yml`, `docs/freestruct.config.yml`) is DERIVED from `site.config.js`, so an identity-only edit is a real docs change - but the path filter named only `docs/**`, so it never fired unless the author also committed the regenerated files. Fix: the caller's `paths` now names `site.config.js` (and, in the dogfood, the sync entrypoint `lib/sync.mjs`). The stamped caller names ONLY `site.config.js` - an adopter syncs with the `coreforge sync` CLI, not a repo file, so `lib/template.mjs` gained a token that strips `'lib/sync.mjs', ` from the copy. Fixture: `tests/template.test.cjs` (the stamped caller triggers on `site.config.js` and never carries the dogfood sync path).
  3. **#47 - the docs-preview `PermissionError` trap.** A no-sudo sandbox with a ruby already on the box hits `Bundler::PermissionError` (Bundler defaulted to the SYSTEM gem dir) - DEPLOY.md §5 walked only the fully-unpacked-ruby path and never named the failure. Fix: §5 now leads with the `bundle config set --local path 'vendor/bundle'` one-liner (and the error text it cures), with the full recipe kept for the no-ruby case; the belt-and-suspenders list is updated to the new ignore block.
  4. **#35 - the eyestruct snapshot leg.** eyestruct 1.0.0 froze the contract and ships `eyestruct gate` (browserless, read-only over `labs/.eyes/`, exit 1 on unexplained drift), so the slot is no longer theater to wire. Fix: the dogfood battery (`test.yml`) and the stamped adopter battery carry an ARM-GATED eyestruct row (pinned `eyestruct@1.1.0`, gated on `labs/.eyes/manifest.yml` existing), so an unseeded site stays parked instead of fake-red. Canon is CI-cut (eyestruct's own ratify lane) - the push battery only refuses drift. `MANIFEST.md` gains the engine-pin row. Fixture: `tests/template.test.cjs` (both batteries carry the arm-gated leg).
  5. **#36 - the in-repo rename half.** The living surfaces were already `coreforge`; what remained was prose + citation drift: `MANIFEST.md`'s title (`# flowforge MANIFEST`) and its living-surface rows (`flowforge create`, `flowforge-theme` -> `site-theme`, `flowforge-paint-scheme` -> `site-paint-scheme`), the `flowforge#NN` issue citations in `test.yml` / `check-birth-gate.cjs` / `lint-packs.cjs` / `adopt-icons.mjs` / `census.test.cjs` -> `coreforge#NN`, and `check-birth-gate.cjs`'s stale `scripts/` path comment. Era rows (`labs/prd-flowforge.md`, the dated `2026-10-25 flowforge round` history) keep `flowforge` by design - lawful era wording, never rewritten. The YARD half (railyard `mounts/state.json` + the `railyard_ferry`) and the govstruct roster flip are cross-repo and tracked on railyard (see the sibling-issue note below).

  Receipts: `npm test` 129/129 (was 126; +3 new laws), `npm run check` green (birth-gate, theme-parity, sync:check, template:check 41 files, brand-census, action pins, prestruct pins, language), `npm run lint:docs` 6/6 PASS. No version bump; v1.0.0 still held.

---

### 2026-11-03 - session: breadcrumbs on (engine + this site)

Google Search Console showed the family's properties under a breadcrumbs enhancement with 0 results. Recon split the fleet: the docs sites run freestruct (auto BreadcrumbList since 1.1.0); the product sites run prestruct, whose `buildJsonLd()` is site-wide by contract and could never emit a per-route trail. prestruct gained engine-level `breadcrumb: true` (injectMeta already owns the route path); this repo turned the discovery surface on.

- `lib/sync.mjs` renders `breadcrumb: true` into every adopter's docs config (regenerated here, sync:check PASS); `web/ssr.config.js` + `templates/site/web/ssr.config.js` - `breadcrumb: true`.
- Receipts: docs config validates against the pinned engine; docs sync:check PASS where generated; prestruct's own `example/` build proves emission (BreadcrumbList on a sub-route, none on `/`).
- No version bump; a discovery-surface opt-in.

---

### 2026-11-10 - light mode by default (web + docs)

Owner directive: the family defaults to light. The product sites and docs sites shipped dark-first (a persisted `light` was the opt-in); now light is the first paint and a persisted `dark` theme is the opt-in. Shape: `<html>` pins `data-theme="light"`, the pre-paint bootstrap applies only a persisted `dark`, and the `theme-color` meta flips to the light paper. The CSS token blocks are untouched (the light block is already the second half of one set), so no palette, toggle handler, or gate changed.

- `web/index.html` - `<html data-theme="light">`; two-axis bootstrap applies a persisted `dark`; `theme-color` light (`#edf3f2`); `site.config.js` `defaultMode` dark -> light.
- `docs/_layouts/default.html` - `<html data-theme="light">`; bootstrap inverted; `color-scheme` `light dark`.
- `lib/sync.mjs` - the PWA manifest `background_color`/`theme_color` go light; regenerated (`sync:check` PASS).
- `templates/site/` - regenerated (`npm run template`), so a stamped site is light-first (`web/index.html`, `docs/_layouts/default.html`, `site.config.js`).
- Receipts: `npm test` 129/129; `npm run check` green (theme-parity, template:check, brand census, docs-lint).

---

### 2026-11-11 - the mobile nav fits the viewport

Owner report (mobile-first): the header overflowed the phone screen and the burger - the only menu control below 640px - sat off-screen. Measured at 390px (headless probe): `document.scrollWidth` 431 vs `clientWidth` 375; the burger at x=397..431. The right cluster (GitHub icon + paint-scheme select + theme switch + burger) needs ~200px against ~144px free after the wordmark.

- **Fix (`web/src/styles.css`, the 640px block).** The decorative badge hides, the gaps tighten (`.nav-inner` 22->8px, `.nav-right` 8->4px), and the wordmark may shrink (`.brand { min-width: 0; overflow: hidden; white-space: nowrap }`). Every control is kept; the row can always fit, so the burger is always reachable.
- **Receipts.** Rebuilt dist probed at 320/360/375/390/414px - no overflow at any width, burger on-screen, all controls present. `npm run check` green.
- **Fleet.** The same defect + fix landed in all 9 sites carrying the family shell (coreforge, crashtest, govstruct, monoforge, poststruct, eyestruct, packstruct, memstruct, gamestruct); coreforge's `templates/site/` carries the same block, so a stamped repo inherits it.

### 2026-11-12 - session: the release-readiness pass reaches the forge (publish metadata + stale bugs)

Owner-driven family release-readiness pass (bug/gap/edge/vuln). coreforge was swept alongside the ten siblings; the parent receipt lives in `dhaupin/railyard` (`CHANGELOG.md` + `labs/TASKS.md`).

- **Publish metadata gap (fixed).** `package.json` was published without `repository`, `homepage`, and `bugs` - the three fields every sibling carries. Added byte-for-byte the sibling shape (`repository` = `git+https://github.com/dhaupin/coreforge.git`; `homepage` = `https://github.com/dhaupin/coreforge#readme`; `bugs` = `https://github.com/dhaupin/coreforge/issues`, verified against monoforge/prestruct). JSON valid; `npm run check` green.
- **Issues #47/#48/#49 are already fixed in-tree (stale, not closed).** The three open `[bug]` issues were resolved by PR #54 (the adopter sweep, `fix: the adopter sweep - #47/#48/#49/#35/#36`) and recorded in `CHANGELOG.md`: #49 (docs-deploy `paths` names `site.config.js`; verified `templates/site/.github/workflows/docs-deploy.yml` line 34 + the dogfood caller), #48 (the template + root `.gitignore` carry `docs/.jekyll-cache/`, `docs/.jekyll-metadata`, `docs/pagefind/`, `docs/pagefind*`; verified both), #47 (DEPLOY.md §5 leads with `bundle config set --local path 'vendor/bundle'`; verified lines 78-79). Verified against the current tree - the issues should be closed with the PR #54 receipts.
- **Vuln/edge (clean).** `npm audit --omit=dev` = 0 vulnerabilities; `npm pack --dry-run` builds (150 files); actions 40-hex pinned (`lib/check-action-pins.cjs`); `npm test` exit=0.
- **No version bump** (0.9.0). **Hard constraint held.**

### 2026-11-12 - session: the Dependabot flow lands (railyard#31)

- **Change.** Added `.github/dependabot.yml` (weekly Monday, grouped minor/patch, majors alone, plus the `github-actions` ecosystem). npm directories `/`, `/web`.
- **Shape (receipt).** `dhaupin/creadev` PR #38 (`fca49c6`); the family-wide rollout is tracked on `dhaupin/railyard#31`.
- **Guard.** railyard's `scripts/check-dependabot.cjs` (the shape) + `scripts/check-dependabot.test.cjs` (it bites), wired into railyard CI.
- **No version bump.**

### 2026-11-12 - session: the v1.0.0 cut

The family release-readiness pass (owner-driven). This repo's first stable cut:

- **Version.** `0.9.0 -> 1.0.0` (package.json + web/package.json + the README Status line - all held by the version-truth census leg). The shell's identity phase is the story: one `site.config.js`, the `sync` verb that fans it out, and the brand census that proves no literal hid.
- **Changelog.** `## [Unreleased] - staging (2026-10-29)` cut to `## [1.0.0] - 2026-11-12`; entries stay verbatim.
- **Announcement.** `docs/discussions/announcing-v1.0.0.md` + the first index row.
- **Release.** Branch -> PR -> `staging` -> PR -> `main`, then the `v1.0.0` tag drives the OIDC ladder.

---

### 2026-11-13 - session: the /web family matrix (React 19 + Vite 8, prestruct ^1.5.0)

Unblocked by prestruct 1.5.0 (it widened its peer ceilings `react`/`react-dom` `>=18 <20`, `vite` `>=5 <9` after the example-lane bake proved React 19 + vite 8). This repo's own landing site moves onto the matrix.

- **web/package.json.** `react`/`react-dom` `-> ^19.3.1`, `vite` `-> ^8.3.7`, `@vitejs/plugin-react` `-> ^6.3.0`, `prestruct` `-> ^1.5.0`; `engines.node >=20.19` (vite 8's floor).
- **web/vite.config.js.** `manualChunks` is a FUNCTION (the object form vite <=7 accepted is rejected by rolldown); `minify: 'esbuild'` dropped (esbuild unbundled, oxc default).
- **Proof.** The site bakes 3/3 pages, audit 0 failures, on the new matrix; the repo's own battery + `check` stay green.
- **No version bump** (the repo's own landing site, not the shipped surface; the crashtest `deps: web toolchain` precedent).


---

### 2026-11-13 (cont.) - the release post was invisible to the sitemap (permalink shape)

`docs/discussions/announcing-v1.0.0.md` carried a dotted, slashless permalink; Jekyll emits the page extensionless (Ruby reads the `.0` as a file extension) and freestruct's `.html`/`.htm` scanner never sees it - no sitemap `<loc>`, no og/canonical, though the page serves 200. The post was absent from the live sitemap. Fix: trailing-slash the permalink; correct the index's "staged for the v1.0.0 tag" marker (1.0.0 is on npm, 2026-11-13). Two biting tests in `tests/docs-post-permalinks.test.cjs`. Ported from eyestruct.
