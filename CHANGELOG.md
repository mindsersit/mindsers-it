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
