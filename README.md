# sergei-doroshenko.github.io

Personal blog. Built with [Astro](https://astro.build), deployed to GitHub Pages via GitHub Actions.

## Local development

```bash
npm install
npm run dev      # http://localhost:4321, hot reload
npm run build    # static build into dist/
npm run preview  # serve the built site locally
```

## Writing a post

Add a markdown file to `src/content/blog/`. Frontmatter is validated at build time (`src/content.config.ts`):

```yaml
---
title: 'Post title'
description: 'One-sentence summary — feeds <meta description> and RSS.'  # max 200 chars
date: 2026-07-19
tags: [aws, bash]
draft: true   # excluded from the site and RSS until set to false
---
```

The URL becomes `/blog/<filename-without-extension>/`.

## Syndication (POSSE)

Canonical posts live here. RSS feed at `/rss.xml` — dev.to and Medium can import from it; set the canonical URL to this site when cross-posting.

## Structure

- `src/content/blog/` — posts (markdown)
- `src/content.config.ts` — frontmatter schema
- `src/layouts/` — Base (head/header/footer)
- `src/pages/` — index, `blog/[...slug]`, `rss.xml.js`
- `astro.config.mjs` — site URL, sitemap, redirects from old Jekyll permalinks
