---
permalink: discussions/announcing-v1.0.0/
layout: default
title: Announcing coreforge v1.0.0
description: coreforge v1.0.0 is the first stable cut of the shell the struct family ships sites from - one site identity in site.config.js, a sync verb that fans it out, and a brand census that proves no literal hid.
version: 1.0.0
nav_order: 20
---

# Announcing coreforge v1.0.0

coreforge is the shell the struct family ships sites from: the landing and the docs rig plus the CI and release plumbing, stamped and rebranded for each adopter. v1.0.0 is the first stable cut. It lands the identity phase - one `site.config.js`, a sync verb that fans it out, and a census that proves no brand literal hid anywhere else - and it brings the shell's process surfaces up to the family standard. This post ships with the v1.0.0 tag: npm has the tarball by the time you read it.

```bash
npm i -g coreforge
```

## What landed

**One site identity, authored once.** `site.config.js` at the root is THE site identity, read everywhere: name, wordmark, tagline, description, url, repo, author, maker, org, the docs block, the theme block (the two axes as protocol constants), the nav vocabulary, footer extras, routes, and the 404 copy. It is named for the concern, not the tool: a product-named config would force prestruct and freestruct to depend on the shell, inverting the engine-to-shell dependency. `web/src/site.js` is the bundle's single accessor for it, so the deep relative path appears exactly once.

**A sync verb, and a census that proves it.** `scripts/flowforge-sync.mjs` (with `npm run sync` / `npm run sync:check`) fans the identity out to the surfaces that cannot import it - `docs/_config.yml`, `docs/freestruct.config.yml`, `web/public/robots.txt`, `web/public/site.webmanifest`. It is deterministic (same config, same bytes, no wall clock), `--check` refuses a drifted file, and every YAML target is parsed before it is written, so the generator fails at cause. `scripts/check-brand-census.mjs` is the missing teeth: it refuses an identity literal in any structural surface outside `site.config.js`, naming the file and line, so "replace every placeholder value" is a mechanical guarantee, not a manual hunt.

**The adapter, not a second source.** `web/ssr.config.js` now imports `site.config.js` and reshapes it for prestruct (`siteUrl`, `siteName`, `routes`, `notFound`). prestruct reads exactly what it always read, so the engine needs no change.

**The birth gate and the pack passthrough.** `scripts/check-birth-gate.cjs` carries six checks: YAML-parse every workflow (a duplicate key dies at GitHub's parser with zero check runs), assert staging-mount independence, gc-safe serde on any pack script, a determinism note, the pins-never-float rule (every `uses:` must be a 40-hex commit SHA), and the reusable-workflow contract. `scripts/lint-packs.cjs` is the packstruct passthrough verb, and `scripts/ship-from-download.cjs` is the phone publish lane.

## Also in this round

The brand art pipeline (`web/scripts/adopt-icons.mjs` + `og-image.mjs`) traces the mark into a full icon set and an OG card. The version-truth census holds `package.json` as the single version source: `web/package.json` and the README Status line cannot drift. The `.gitignore` docs block carries the in-tree Jekyll and pagefind products.

## Links

- Repo and docs: https://github.com/dhaupin/coreforge / https://docs.creadev.org/coreforge
- Release posts: https://docs.creadev.org/coreforge/discussions
- Changelog: https://github.com/dhaupin/coreforge/blob/main/CHANGELOG.md
- Issues: https://github.com/dhaupin/coreforge/issues
