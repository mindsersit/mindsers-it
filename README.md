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
.github/workflows/        CI, GitHub Release and deploys
docs/ops/ci.md            what CI runs, and why (CI minutes are paid for)
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
pnpm test:scripts # the release script's tests
```

- `pnpm dev:ghost`: rebuilds the Ghost theme on change, with livereload. Link
  `themes/ghost` into a local Ghost's `content/themes/` and activate it there.
- `pnpm dev:shop`: rebuilds the Shopify theme on change and runs `shopify theme dev`
  (log in first with `shopify theme list --store <store>.myshopify.com`).
- `pnpm --filter @mindsers/shopify-theme check`: Shopify theme check.

Built files (`themes/ghost/assets/{css,js,fonts}/`, and the generated files in
`themes/shopify/assets/`) are not committed: edit `styles/` and `scripts/` in the
Ghost theme, `src/` in the Shopify theme, or the design system.

## Ghost theme

`routes.yaml` gives each landing page its template:

| URL | Template | Stylesheet |
|---|---|---|
| `/` | `home.hbs` | `home.css` |
| `/studio-saas/` | `home-saas.hbs` | `home.css` |
| `/studio-saas/landing-page/`, `/mvp/`, `/saas/` | `pack-validation.hbs`, `pack-mvp.hbs`, `pack-saas.hbs` | `landing.css` |
| `/agence-shopify/` | `home-shopify.hbs` | `home.css` |
| `/agence-shopify/basic/`, `/personnalise/`, `/enterprise/` | `agence-basic.hbs`, `agence-personnalise.hbs`, `agence-enterprise.hbs` | `landing.css` |
| `/talent-freelance/` | `home-talent.hbs` | `landing.css` |
| pages and posts | `page.hbs`, `post.hbs` | `pages.css` |

Deploying the theme doesn't apply `routes.yaml` or `redirects.yaml`: when you
change them, upload them in Ghost Admin's settings.

Theme settings (Ghost Admin, Design):

- `global_cta_url`, `global_cta_text`: the call to action in the header, the
  footer and every landing page
- `enable_search`, `menu_position`: header search button and menu position
- `shop_url`: the "Boutique" link in the footer
- `talent_accent_color`, `shopify_accent_color`: the accent colour of the
  Talents and Agence Shopify pages (their `mds-talent` / `mds-shopify` body class)
- `amount_of_project_done`, `amount_of_landing_pages_done`,
  `amount_of_ecommerce_websites_done`, `amount_of_freelancers_recommended`,
  `price_of_mvp`, `price_of_landing_page`: figures shown on the landing pages

## Shopify theme

The shop's settings (brand, link back to mindsers.it, call to action, accent
colour, cart, social profiles) are in `config/settings_schema.json`. The header
menu is the shop's `main-menu`: its links are absolute and point to mindsers.it,
like the Ghost navigation, and both are maintained by hand.

Content edited in the Shopify theme editor lives in `templates/*.json`,
`sections/*.json` and `locales/*.json`, which a deploy overwrites: pull it before
releasing (see below).

## CI

Every pull request that is not a draft runs one job: `pnpm lint`, then, when
their files change (or the design system, the lockfile, the root's
configuration or `.github/`), the Ghost theme is built and checked with
`gscan --fatal`, and the Shopify theme is built and checked with
`shopify theme check`. A pull request that changes only Markdown runs nothing,
and `main` is not checked again once merged. Why, and what it saves:
[`docs/ops/ci.md`](docs/ops/ci.md), after the fleet's standard.

## Deploying

Deploys run from GitHub Actions (`.github/workflows/deploy.yml`) right after the
release workflow publishes a release (prereleases excepted), or by hand from the Actions tab (Ghost, Shopify or both):

- Ghost: the built zip is uploaded with `GHOST_ADMIN_API_URL` / `GHOST_ADMIN_API_KEY`.
- Shopify (only when the `SHOPIFY_ENABLED` variable is `true`): `shopify theme push`
  to `SHOPIFY_THEME_ID` on `SHOPIFY_FLAG_STORE`, with the Theme Access password in
  `SHOPIFY_CLI_THEME_TOKEN`. Global theme settings (`config/settings_data.json`) are
  never overwritten.

### Release checklist

Nothing is committed straight to `main`: the release goes through a pull request
that CI checks, and the tag is pushed once it is merged. Both steps run on your
machine, with your own git and `gh` login (`scripts/release.mjs`).

1. **Pull the shop's editor changes first.** Section content edited in the Shopify
   theme editor lives in `templates/*.json`, `sections/*.json` and `locales/*.json`,
   which a deploy overwrites:
   `SHOPIFY_THEME_ID=<id> pnpm shop:pull`. If it changed anything, merge it
   through a pull request of its own first.
2. From an up-to-date, clean `main`, run `pnpm release:prepare X.Y.Z`. It:
   - moves the `[Unreleased]` entries of `CHANGELOG.md` under
     `## [X.Y.Z] - <today>` and updates the compare links at the bottom;
   - bumps `version` in `packages/design-system`, `themes/ghost` and
     `themes/shopify` (`package.json`);
   - commits `chore(release): X.Y.Z` on `release/X.Y.Z`, pushes it and opens
     the pull request.
3. Merge that pull request once CI passes, and merge nothing else before step 4.
4. Run `pnpm release:tag X.Y.Z`. It checks that `main`'s last commit is that
   release, tags it `vX.Y.Z` and pushes the tag: the GitHub Release is created
   from the changelog (`.github/workflows/gh-release.yml`), then both themes are
   deployed. A version the changelog marks as a prerelease gets a prerelease and
   no deploy.

The tag is pushed from your machine on purpose: a tag or a pull request made in
Actions with `GITHUB_TOKEN` starts no other workflow, so it would neither
release nor run CI.

## License

The code is under the MIT License, see [`LICENSE.md`](LICENSE.md). It doesn't
cover the following, which keep their own terms:

- the MindsersIT name and logo, and the client logos in `themes/ghost/assets/images/`:
  trademarks of their owners, not licensed for reuse;
- the websites' content (texts, team photos, product screenshots): not licensed
  for reuse;
- the illustrations in `themes/ghost/partials/images/`: most come from
  [unDraw](https://undraw.co/license) and are under its license;
- the fonts in `packages/design-system/fonts/` (Fira Sans, Fira Code,
  Merriweather): SIL Open Font License 1.1, embedded in each file.

`themes/shopify` also contains Shopify's theme license
([`themes/shopify/LICENSE.md`](themes/shopify/LICENSE.md)).

[ghost-blog]: https://ghost.org?lmref=739
