---
permalink: /
layout: default
title: __NAME__ docs
description: The docs rig the struct family ships sites from - this page proves the shell builds, searches, and highlights with your brand aboard.
nav_order: 1
---

# __NAME__ docs

This is the docs head of the __NAME__ shell: one sample page, so the frontmatter gate, the link check, and the Rouge highlighter all have real bytes to chew on. Replace it with your own pages, and keep the four required frontmatter fields (permalink, layout, title, description) on every page you add.

The docs are one of the sites the shell ships. The landing, the docs, and the CI/release plumbing all read one brand file (`site.config.js`), so a rebrand is one edit, not a hunt across three languages. The [CLI](__DOCS_BASEURL__/cli/) page covers the verbs that stamp, sync, and prove a site.

## Highlighting works out of the box

```js
const hello = 'world'   // strings go green via the shared token block
if (hello === 'world') { // keywords go accent
  console.log(`shell says ${hello}`)
}
```

```bash
# build + deploy the docs rig
bundle exec jekyll build
./pagefind --site _site
```

## The sidebar nav

Sidebar sections come from `docs/_data/nav.yml`: a list of groups, each with a `title` and an `items` list of `{title, url}` entries. The shipped starter nav links only pages the shell actually carries (this page and the release-posts index) with exemplar rows commented - replace it with yours as your pages land.
