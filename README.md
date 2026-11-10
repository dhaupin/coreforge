# coreforge - the shell the struct family ships sites from

One repo, every site: one brand file, zero drift. This is the **rig** half of a site: the landing rig, the docs rig, and the CI/release plumbing that the struct family (dhaupin/crashtest, dhaupin/packstruct, ...) keeps rebuilding and re-porting. Every elapsed bug got paid for once, here; new adopters inherit it.

Status: **0.9.0, scaffold cut.** The shell ships the landing and the docs rig plus the CI/release plumbing; the version below is held equal to `package.json` by the version-truth census leg (`npm test`), so a release moves `package.json`, `web/package.json`, and this line together.

## What is in the box

| piece            | what it carries                                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| `bin/`           | the CLI: `coreforge create` / `sync` / `build` / `check` / `doctor` (PRD 6) plus the release verbs (`verify-release`, `release-notes`, `lint-packs`) the family's `publish.yml` calls. `doctor` is the truth battery - generated green is never shipped. |
| `web/`           | the landing shell: prestruct-prerendered React/Vite app, light/dark theme switch (no-flash bootstrap, icon-as-action), tokens-only palette (dark + light), nav/sidebar/footer from one vocabulary file, island engine, placeholder pages + a highlighted terminal block |
| `docs/`          | the Jekyll rig: fixed header (search > GitHub icon > theme switch > menu), slide-out sidebar, pagefind modal search (Cmd+K), Rouge token colors shared with the landing, freestruct SEO layer, sample page proving frontmatter + highlighting |
| `lib/`           | the TOOL, versioned once and imported by adopters: `gates/` (frontmatter, links (doubled-baseurl trap), style/voice, fiction signatures, the single-arg Liquid filter trap, theme parity, brand census, birth-gate), the `sync` fan-out, the `template` builder, the packstruct wrapper, and the release ladder (`release-notes`, `verify-release`) |
| `scripts/`       | the family-canon tools that travel by COPY: `ship-from-download.cjs`, the phone publish lane (product-agnostic, so every sibling vendors it verbatim at `scripts/`) |
| `templates/site/` | the copy source `coreforge create` stamps - GENERATED from the dogfood by `lib/template.mjs` (`npm run template`), tokenized (`__NAME__`, `__SITE_URL__`, ...) the way monoforge tokenizes its blocks. Carries the site half (`web/` + `docs/` + `site.config.js`), the `.gitignore`, the `packs/` slot, and the standalone CI plumbing (the thin docs caller + the staging fast-forward); the two tool-coupled workflows (the publish ladder + the dogfood test battery) are excluded until `create` stamps an adopter's own |
| `templates/adopter/` | the two CI lanes `coreforge create` stamps INTO an adopter (`test.yml` + `publish.yml`), wired to the installed `coreforge` package rather than the dogfood's `lib/` |
| `.github/workflows/` | `docs-deploy.yml` (thin caller of THE one docs lane, `dhaupin/freestruct`'s `docs-lane.yml`), `publish.yml` (npm Trusted Publishing OIDC template), `test.yml` (the shell's own battery), `staging-ff-sync.yml` (fast-forward staging to main after a promotion) |
| `MANIFEST.md`    | the receipts: every extracted file -> its source repo+SHA, engine pins, and the one review rule for bumping them   |

## The map (with the sibling docs)

- [AGENTS.md](./AGENTS.md) - agent cheat sheet: layout, house rules, the version protocol, and the commands to run before any push
- [DEPLOY.md](./DEPLOY.md) - deploy/release runbook: landing host, docs Pages + pagefind, the OIDC release ritual, retry rules
- [CHANGELOG.md](./CHANGELOG.md) - npm-format version history; every version bump lands here in the same commit
- [MANIFEST.md](./MANIFEST.md) - the receipt table (which file came from where, which pins guard which engine)
- [labs/TASKS.md](./labs/TASKS.md) - the rolling work log (newest last)
- [packs/README.md](./packs/README.md) - the `/packs` contract + the struct-family links (SPEC v1, the linter, the two profile hosts)
- **The workshop** -> [Creadev.org](https://creadev.org) (coreforge is made by Rook @ Creadev.org - the same workshop as the struct family above)

## The rules the family already runs on

1. **Tokens own the palette.** Every color rides semantic variables (`--paper/--surface/--raised/--ink/--ink-soft/--accent/--moss/--err/...`); the light theme is a second block of the SAME token set; no layout class ever hardcodes a hex. Brand = edit tokens + navItems + ssr.config.
2. **Theme = one `<html data-theme>` attribute.** No-flash bootstrap inline script, both switch icons always render (CSS picks), so the prerendered bytes and the hydrated DOM are identical. Icon is the ACTION (sun shows in dark mode - clicking goes light), the shared family convention.
3. **Gates fail at cause.** The docs lint chain (`check-docs-*` + the Jekyll filter trap) names file:line. A lint pass is added the day a bug is caught twice; it becomes a gate, not a memory.
4. **Pins, never floats.** freestruct + prestruct + the pagefind scrape are pinned in the workflow files. Bumping a pin is a deliberate, reviewed step - MANIFEST.md says which receipt to carry.
5. **Adopt explicitly.** Start from a checkout, not an npm install: diff this rig against your target repo (intent: a diff that shows ONLY your brand data), replace every YOUR... value, remove sample pages, wire your content.

## Verify before shipping (the same gates the family runs)

```bash
npm ci                                   # hermetic - one root devDep (js-yaml, the birth-gate parser)
npm test                                 # version-truth census + ship-lane behavior tests
npm run check                            # node --check the gates + birth-gate + sync:check + template:check + brand census
npm run lint:docs                        # frontmatter, links, style, fiction signatures, liquid trap, theme parity
npm run template                         # rebuild templates/site/ after a shell change (never hand-edit it)
npm run lint:packs                       # packstruct over packs/ (needs a packstruct install; exit 2 names the fix)
npm install --prefix web && npm run build --prefix web   # 3/3 prerender is healthy
```

Docs deploy lives in CI (Jekyll is too much runtime to demand locally); the workflow self-verifies: gates -> jekyll -> freestruct --strict -> pagefind -> Pages. The `prepublishOnly` gate runs `npm test && npm run check && npm run lint:docs` on every `npm publish`, so a red battery cannot mint a tarball on any machine.

## Provenance

Extracted from **dhaupin/crashtest @ 905aa91** (2026-10-24), the deployed state the theme-port round verified: suite green, web prerender 6/6 pages, docs deploy live. See `MANIFEST.md` for the per-file receipt table.
