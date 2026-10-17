// Loaded with <script type="module"> (no async), so it runs once the document
// is parsed. Kept free of imports: Shopify serves assets with a cache-busting
// query string that relative imports wouldn't carry.
const menus = document.querySelectorAll('.profile-menu, .more-menu')
const toggles = document.querySelectorAll('.more-button-small-screen')
const page = document.querySelector('body')

function setOpen(open) {
  page.classList.toggle('no-scroll-small-screen', open)

  for (const menu of menus) {
    menu.classList.toggle('menu-open', open)
  }

  for (const toggle of toggles) {
    toggle.setAttribute('aria-expanded', String(open))
  }

  if (open) {
    document.querySelector('.menu-open .close-button')?.focus()
  } else {
    toggles[0]?.focus()
  }
}

const isOpen = () => menus[0]?.classList.contains('menu-open') ?? false

for (const button of document.querySelectorAll(
  '.profile-button, .close-button, .more-button-small-screen',
)) {
  button.addEventListener('click', event => {
    event.preventDefault()
    setOpen(!isOpen())
  })
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && isOpen()) {
    setOpen(false)
  }
})
