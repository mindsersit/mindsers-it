# Shared markup

The styles in `scss/` and the script in `js/menu.js` expect the HTML below.
Both themes must output it so that mindsers.it (Ghost) and shop.mindsers.it
(Shopify) look and behave the same.

Source of truth: `themes/ghost/default.hbs`. The Shopify version lives in
`themes/shopify/layout/theme.liquid`, `sections/header.liquid` and
`sections/footer.liquid`. When you change one, change the other.

## Page shell

```html
<body class="…">
  <div class="mds-viewport">
    <header id="mds-head" class="mds-head">…</header>
    <main class="mds-main">…</main>
    <footer class="mds-foot">…</footer>
  </div>
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
      <a class="search-button" …><svg …/></a>                         <!-- optional -->
      <a class="button highlighted shop-button" target="_blank" href="CTA_URL">CTA_TEXT</a>
      <!-- theme-specific action icons go here (Shopify: account, cart) -->
      <a class="more-button-small-screen" href="#" aria-label="Menu" aria-expanded="false"><svg …/></a>

      <div class="more-menu">                    <!-- mobile drawer, toggled by .menu-open -->
        <header class="mds-head">
          <div class="mds-container">
            <div class="mds-head-brand"><a class="mds-head-logo" href="https://mindsers.it">…</a></div>
            <div class="mds-head-placeholder"></div>
            <div class="close-button" tabindex="0"><svg …/></div>
          </div>
        </header>
        <!-- NAV LIST, see below -->
        <ul>
          <li><a class="button highlighted" href="CTA_URL">CTA_TEXT</a></li>
          <li><a href="SEARCH_URL">Recherche</a></li>
        </ul>
      </div>
    </div>
  </nav>
</header>
```

### Nav list

The HTML that Ghost's `{{navigation}}` helper outputs:

```html
<ul class="nav">
  <li class="nav-studio-saas"><a href="https://mindsers.it/studio-saas/">Studio SaaS</a></li>
  <li class="nav-boutique nav-current"><a href="https://shop.mindsers.it/">Boutique</a></li>
</ul>
```

- `nav-{slug}`: the slugified label.
- `nav-current`: added to the item for the current site/page.
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

| Property | Required | Ghost | Shopify |
|---|---|---|---|
| `--ghost-accent-color` | no (falls back to `#f4be7e`) | injected by `{{ghost_head}}` | set in `layout/theme.liquid` from the `accent_color` setting |
| `--gh-font-body`, `--gh-font-heading` | no (fall back to Fira Sans) | injected by Ghost's font settings | not set |

## Sass configuration

`_fonts.scss` reads font files from `$font-path` (default `/assets/fonts/`).
Configure it the first time the module is loaded:

```scss
@use 'fonts' with ($font-path: ''); // Shopify: fonts sit next to the CSS on the CDN
@use 'global';
```

## JS hooks (`js/menu.js`)

- `.more-button-small-screen`, `.close-button`, `.profile-button` toggle
  `.menu-open` on `.more-menu` / `.profile-menu`, and
  `.no-scroll-small-screen` on `<body>`.
- `aria-expanded` on `.more-button-small-screen` follows the drawer state.
