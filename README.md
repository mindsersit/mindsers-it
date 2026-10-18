![Repo header image](https://repository-images.githubusercontent.com/189204408/ea286180-8cf2-11e9-9c88-ad7a2517c8f8)

# @mindsersit/mindsers-it

The two websites of MindsersIT, built from one design system:

- **mindsers.it**: the studio's website, a [Ghost][ghost-blog] theme
- **shop.mindsers.it**: the merch shop, a Shopify Online Store 2.0 theme

**Some parts of the themes are hardcoded for the needs of MindsersIT. They are not meant to be reused as is.**

## Repository layout

```
packages/design-system/   shared Sass, fonts and menu script (see MARKUP.md)
themes/ghost/             Ghost theme for mindsers.it (package "mindsers-it")
themes/shopify/           Shopify theme for shop.mindsers.it (package "@mindsers/shopify-theme")
```

Both themes compile `packages/design-system` into their own assets. The HTML both
themes must output for the header, footer and navigation is described in
[`packages/design-system/MARKUP.md`](packages/design-system/MARKUP.md): when you
change one theme, change the other.

## Getting started

Requirements: Node (see `.node-version`), pnpm 10, and the
[Shopify CLI](https://shopify.dev/docs/api/shopify-cli) for the shop.

```sh
pnpm install
pnpm build        # builds both themes (Ghost zip in themes/ghost/dist/)
pnpm lint         # Biome
pnpm test         # gscan on the Ghost theme
```

- `pnpm dev:ghost`: rebuilds the Ghost theme on change (use it with a local Ghost).
- `pnpm dev:shop`: rebuilds the Shopify theme on change and runs `shopify theme dev`
  (log in first with `shopify theme list --store <store>.myshopify.com`).
- `pnpm --filter @mindsers/shopify-theme check`: Shopify theme check.

## Deploying

Deploys run from GitHub Actions (`.github/workflows/deploy.yml`) when a release is
published, or by hand from the Actions tab (Ghost, Shopify or both):

- Ghost: the built zip is uploaded with `GHOST_ADMIN_API_URL` / `GHOST_ADMIN_API_KEY`.
- Shopify (only when the `SHOPIFY_ENABLED` variable is `true`): `shopify theme push`
  to `SHOPIFY_THEME_ID` on `SHOPIFY_FLAG_STORE`, with the Theme Access password in
  `SHOPIFY_CLI_THEME_TOKEN`. Global theme settings (`config/settings_data.json`) are
  never overwritten.

### Release checklist

1. **Pull the shop's editor changes first.** Section content edited in the Shopify
   theme editor lives in `templates/*.json`, `sections/*.json` and `locales/*.json`,
   which a deploy overwrites:
   `SHOPIFY_THEME_ID=<id> pnpm shop:pull`, then commit.
2. Move the `[Unreleased]` entries of `CHANGELOG.md` under a new version.
3. Tag `vX.Y.Z` and push the tag: the GitHub Release is created from the changelog.
4. If the release didn't trigger the Deploy workflow (no `RELEASE_TOKEN` secret),
   run it by hand.

## License

MIT License

**Copyright (c) 2025 Nathanaël CHERRIER**

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

[ghost-blog]: https://ghost.org?lmref=739
