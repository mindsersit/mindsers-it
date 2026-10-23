# Shared markup

The styles in `scss/` and the script in `js/menu.js` expect the HTML below.
Both themes must output it so that mindsers.it (Ghost) and shop.mindsers.it
(Shopify) look and behave the same.

Source of truth: `themes/ghost/default.hbs`. The Shopify theme implements it
in `themes/shopify/layout/theme.liquid`, `sections/header.liquid` and
`sections/footer.liquid`. When you change one side, change the other.

Shopify wraps each section in `<div class="shopify-section …">`. The theme
gives the header group's wrapper `display: contents` so that the sticky
`.mds-head` stays sticky across the whole page.

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
      <a class="search-button" aria-label="Recherche" …><svg …/></a>
      <!-- theme-specific action icons go here (Shopify: account, cart).
           Icons are 20×20 outline SVGs with a 1.5 stroke, so they all match. -->
      <!-- optional: only when a CTA URL is configured; always the last action -->
      <a class="button primary shop-button" target="_blank" href="CTA_URL">CTA_TEXT</a>
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
          <li><a class="button primary" href="CTA_URL">CTA_TEXT</a></li>
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
  <li class="nav-agence-shopify"><a href="https://mindsers.it/agence-shopify/">Agence Shopify</a></li>
  <li class="nav-talents"><a href="https://mindsers.it/talent-freelance/">Talents</a></li>
</ul>
```

- `nav-{slug}`: the slugified label.
- `nav-current`: Ghost adds it only to the item whose URL matches the current
  page. On the shop, it marks the item that points to the shop itself (its URL
  contains the shop's origin), which also gets `aria-current="page"`.
- Links are **absolute** because the menu is shared across two domains. It is
  maintained by hand in both admins (Ghost navigation and the Shopify
  `main-menu`).

## Footer

```html
<footer class="mds-foot">
  <div class="mds-container">
    <div class="mds-foot-top">
      <div class="mds-foot-brand">
        <a class="mds-foot-logo" href="https://mindsers.it/"><img src="…" alt="MindsersIT" /></a>
        <p>Studio de développement de SaaS</p>  <!-- Ghost: @site.description -->
        <!-- optional: only when a CTA URL is configured -->
        <a class="button primary" href="CTA_URL">CTA_TEXT</a>
        <ul class="mds-foot-social">  <!-- each item only when the profile is set -->
          <li><a href="https://x.com/MindsersCodes" aria-label="MindsersIT sur X"><svg …/></a></li>
          <li><a href="https://www.facebook.com/MindsersCodes" aria-label="MindsersIT sur Facebook"><svg …/></a></li>
        </ul>
      </div>
      <nav class="mds-foot-menu" aria-label="Plan du site">
        <div class="mds-foot-col">
          <h2>Studio</h2>
          <!-- NAV LIST: the main menu again -->
        </div>
        <div class="mds-foot-col">
          <h2>Liens</h2>
          <!-- Ghost: secondary navigation; Shopify: the "footer" menu -->
          <ul><li><a href="https://shop.mindsers.it/">Boutique</a></li></ul>  <!-- Ghost: only when shop_url is set -->
        </div>
      </nav>
    </div>
    <div class="mds-foot-bottom">
      <p class="mds-foot-meta">
        Développé avec amour par <a href="https://nathanaelcherrier.dev/">Nathanaël Cherrier</a>.
        &copy;YYYY <a href="https://mindsers.it/">MindsersIT</a>. Tous droits réservés.
      </p>
      <ul class="mds-foot-legal">
        <li><a href="https://mindsers.it/legal-notices/">Mentions légales</a></li>
        <!-- Shopify: store policies, except its own legal notice -->
      </ul>
      <!-- Shopify: country/currency selector -->
    </div>
  </div>
</footer>
```

- Social profiles come from Ghost's settings (X, Facebook) and, on the shop,
  from the "Réseaux sociaux" theme settings; keep them identical.
- The shop isn't in the main menu (selling merch isn't the main business); the
  footer's "Liens" column links to it.

## CSS custom properties

| Property | Required | Ghost | Shopify |
|---|---|---|---|
| `--ghost-accent-color` | no (falls back to `#f4be7e`) | injected by `{{ghost_head}}`, and overridden on `body.mds-talent` / `body.mds-shopify` in `default.hbs` | set in `layout/theme.liquid` from the `accent_color` theme setting |
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
