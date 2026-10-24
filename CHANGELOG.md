# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

-   CI runs one job, on pull requests only: not on drafts, not on a change to
    Markdown alone, and not again on `main` once merged (`docs/ops/ci.md`)
-   A release goes through a pull request: `pnpm release:prepare X.Y.Z` opens
    it, `pnpm release:tag X.Y.Z` tags it once merged and deploys
-   The deploy runs one job for both themes; every action is pinned by commit
    SHA and every workflow declares its token's permissions
-   Dependabot opens one grouped pull request a month for npm updates
-   Fonts are served as WOFF2 (2.6 MB of TTF down to 644 KB), and the team
    photos and client logos are resized to their display size (1.1 MB less)
-   Illustrations are cached images instead of SVG inlined in every landing
    page (60 to 190 KB of HTML per page)
-   The Ghost theme no longer preloads an outdated Portal script nor opens
    connections to Facebook and Google on every page
-   Landing pages share partials for their calls to action and offer cards
-   Node 24 LTS; the Shopify CLI is a devDependency of the Shopify theme, so
    CI, the deploy and local commands use the version in the lockfile
-   A release also bumps the Shopify theme's `theme_version`, which now
    matches the packages

### Removed

-   Styles, illustrations, icons, scripts and dependencies nothing used, the
    Merriweather font, and tag archive pages (upload `routes.yaml` in Ghost
    Admin)

### Fixed

-   Bold text (headings, `<strong>`) rendered in Fira Sans Black
-   Typographic characters (’ — … € →) fell back to the system font
-   The FAQs, the shop's filters and the Ghost search button can be used with
    the keyboard
-   Client logos, team and testimonial photos have a text alternative
-   Ghost pages honour "Show title and feature image"
-   Two quick clicks on a cart drawer's "+" added one item, not two: a change
    now waits for the previous one
-   Without JavaScript, the product page adds the variant chosen
-   The client logo strip loops without a jump, and stays still for visitors
    who reduce motion
-   Copy: "vous" throughout the MVP page, a doubled "!" on the SaaS page

## [2.1.0] - 2026-10-23

### Added

-   Home: "Nos produits" section showing our own SaaS (MyCellier, Unitae, Tokens On Me)
    with their screenshots, right after "Un studio né de nos propres produits"

### Fixed

-   Two-card grids (home "Nos univers" and offer pages) left an empty third column

## [2.0.2] - 2026-10-19

### Changed

-   "Pour qui ?" cards sit on one row on desktop

## [2.0.1] - 2026-10-18

### Fixed

-   Unreadable "Pour qui ?" cards on the Studio SaaS and Agence Shopify pages
-   Publishing a release now deploys both themes (it needed a manual run)

## [2.0.0] - 2026-10-18

### Added

-   Shopify theme for shop.mindsers.it: product, collection with filters, cart drawer,
    predictive search, product recommendations, French translations
-   Shared design system (`packages/design-system`) used by both themes
-   Footer with the site menus, call to action, social links and legal links
-   Link to the shop in the footer (Ghost `shop_url` setting)

### Changed

-   The repository is now a pnpm monorepo; the Ghost theme lives in `themes/ghost`
-   Redesigned landing pages: one content width, one card style, one main button style
-   Compact header with one icon set; mobile menu with the site navigation
-   CI and deploys modernised; Ghost and Shopify deploy from GitHub Actions

### Fixed

-   Mobile menu drawer was clipped to the header height
-   Sideways scrolling on mobile landing pages
-   Team bios were not styled (curly quotes in the HTML class)

## [1.0.0] - 2025-06-17

### Added

-   First version of the website

[unreleased]: https://github.com/mindsersit/mindsers-it/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/mindsersit/mindsers-it/compare/v2.0.2...v2.1.0
[2.0.2]: https://github.com/mindsersit/mindsers-it/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/mindsersit/mindsers-it/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/mindsersit/mindsers-it/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/mindsersit/mindsers-it/releases/tag/v1.0.0
