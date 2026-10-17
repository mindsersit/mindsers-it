// Loaded with <script type="module">, so it runs once the document is parsed.
// Kept free of imports: Shopify serves assets with a cache-busting query
// string that relative imports wouldn't carry.
const menus = document.querySelectorAll('.profile-menu, .more-menu')
const page = document.querySelector('body')

for (const button of document.querySelectorAll(
  '.profile-button, .close-button, .more-button-small-screen',
)) {
  button.addEventListener('click', event => {
    event.preventDefault()
    page.classList.toggle('no-scroll-small-screen')

    for (const menu of menus) {
      menu.classList.toggle('menu-open')
    }

    for (const toggle of document.querySelectorAll(
      '.more-button-small-screen',
    )) {
      toggle.setAttribute(
        'aria-expanded',
        String(menus[0]?.classList.contains('menu-open') ?? false),
      )
    }
  })
}
