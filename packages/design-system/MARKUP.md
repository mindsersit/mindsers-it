# Shared markup

The styles in `scss/` and the script in `js/menu.js` expect the HTML below.
Both themes must output it so that mindsers.it (Ghost) and shop.mindsers.it
(Shopify) look and behave the same.

Source of truth: `themes/ghost/default.hbs`. The Shopify theme (planned, not
yet in the repo) will implement it in `themes/shopify/layout/theme.liquid`,
`sections/header.liquid` and `sections/footer.liquid`. When you change one
side, change the other.

URLs below are shown as rendered on production. Ghost outputs them from
`{{@site.url}}`; don't hard-code them in templates.

## Page shell

```html
<body class="…">
  <div class="mds-viewport">
    <header id="mds-head" class="mds-head">…</header>
    <main class="mds-main">…</main>
    <footer class="mds-foot">…</footer>
  </div>
  <!-- module, no async: menu.js relies on the document being parsed -->
  <script type="module" src="…/menu.js"></script>
</body>
```

## Header

```html
<header id="mds-head" class="mds-head">
  <nav class="mds-head-inner mds-container" role="navigation" aria-label="Main Navigation">
    <div class="mds-head-brand">
      <a class="mds-head-logo" href="https://mindsers.it">
        <img src="…" alt="MindsersIT - Back to home page" />   <!-- or the site title as text -->
      </a>
    </div>

    <div class="mds-head-placeholder"></div>  <!-- before the menu unless "Menu on the left side" -->
    <div class="mds-head-menu">
      <nav class="mds-main-menu">
        <!-- NAV LIST, see below -->
      </nav>
    </div>
    <div class="mds-head-placeholder"></div>  <!-- after the menu unless "Menu on the right side" -->

    <div class="mds-head-actions">
      <!-- optional: only when search is enabled -->
      <a class="search-button" …><svg …/></a>
      <!-- optional: only when a CTA URL is configured -->
      <a class="button highlighted shop-button" target="_blank" href="CTA_URL">CTA_TEXT</a>
      <!-- theme-specific action icons go here (Shopify: account, cart) -->
      <button type="button" class="more-button-small-screen" aria-label="Menu"
              aria-controls="mds-more-menu" aria-expanded="false"><svg …/></button>

      <div class="more-menu" id="mds-more-menu">   <!-- mobile drawer, toggled by .menu-open -->
        <header class="mds-head">
          <div class="mds-container">
            <div class="mds-head-brand"><a class="mds-head-logo" href="https://mindsers.it">…</a></div>
            <div class="mds-head-placeholder"></div>
            <button type="button" class="close-button" aria-label="Fermer le menu"><svg …/></button>
          </div>
        </header>
        <!-- NAV LIST, see below -->
        <ul>
          <!-- optional: only when a CTA URL is configured -->
          <li><a class="button highlighted" href="CTA_URL">CTA_TEXT</a></li>
          <!-- optional: only when search is enabled; SEARCH_URL is #/search on Ghost -->
          <li><a href="SEARCH_URL">Recherche</a></li>
        </ul>
      </div>
    </div>
  </nav>
</header>
```

### Nav list

The HTML that Ghost's `{{navigation}}` helper outputs, here on the Studio SaaS
page:

```html
<ul class="nav">
  <li class="nav-studio-saas nav-current"><a href="https://mindsers.it/studio-saas/">Studio SaaS</a></li>
  <li class="nav-boutique"><a href="https://shop.mindsers.it/">Boutique</a></li>
</ul>
```

- `nav-{slug}`: the slugified label.
- `nav-current`: Ghost adds it only to the item whose URL matches the current
  page. The Shopify theme must add it to the Boutique item on every shop page.
- Links are **absolute** because the menu is shared across two domains. It is
  maintained by hand in both admins (Ghost navigation and the Shopify
  `main-menu`).

## Footer

```html
<footer class="mds-foot">
  <div class="mds-container">
    <div class="mds-foot-meta">
      Développé avec amour par <a href="https://nathanaelcherrier.dev/">Nathanaël Cherrier</a>.
      &copy;YYYY <a href="https://mindsers.it/">MindsersIT</a>. Tous droits réservés.<br />
      <a href="https://mindsers.it/legal-notices/">Mentions Légales</a>
      <!-- theme-specific links go after this one (Shopify: policies, currency selector) -->
    </div>
  </div>
</footer>
```

## CSS custom properties

| Property | Required | Ghost | Shopify (planned) |
|---|---|---|---|
| `--ghost-accent-color` | no (falls back to `#f4be7e`) | injected by `{{ghost_head}}`, and overridden on `body.mds-talent` / `body.mds-shopify` in `default.hbs` | set in `layout/theme.liquid` from an `accent_color` setting |
| `--gh-font-body`, `--gh-font-heading` | no (the shared styles fall back to Fira Sans) | injected by Ghost only when a custom font is chosen in the admin | not set |

## Sass configuration

`_fonts.scss` reads font files from `$font-path` (default `/assets/fonts/`).
Configure it in the entry file, before any other design-system module:

```scss
@use 'fonts' with ($font-path: ''); // Shopify: fonts sit next to the CSS on the CDN
@use 'global';
```

## JS hooks (`js/menu.js`)

- Clicking any `.more-button-small-screen`, `.close-button` or
  `.profile-button` opens or closes **every** `.more-menu` and `.profile-menu`
  together (class `.menu-open`), and sets `.no-scroll-small-screen` on
  `<body>`. A page should contain only one of the two menus.
  `.profile-button` / `.profile-menu` are optional hooks: `_global.scss`
  styles them, but the Ghost theme doesn't use them.
- The open/closed state is read from the first `.more-menu` / `.profile-menu`
  in the document.
- `Escape` closes the menu. Opening it moves focus to its `.close-button`;
  closing it moves focus back to the first `.more-button-small-screen`.
- `aria-expanded` on every `.more-button-small-screen` follows that state.
