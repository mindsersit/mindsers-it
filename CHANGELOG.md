# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[unreleased]: https://github.com/mindsersit/mindsers-it/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/mindsersit/mindsers-it/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/mindsersit/mindsers-it/releases/tag/v1.0.0
