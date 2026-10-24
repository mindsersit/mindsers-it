// Cart drawer: adds products to the cart, changes quantities and refreshes the
// drawer and the header cart button with the Section Rendering API, so each
// change takes a single request. Only loaded when the theme setting "cart
// type" is "drawer"; every form and link still works without it.
const drawer = document.getElementById('CartDrawer')
const root = window.Shopify?.routes?.root ?? '/'
const SECTIONS = ['cart-drawer', 'cart-button']

function render(sections) {
  if (!sections) return
  const parse = html => new DOMParser().parseFromString(html, 'text/html')

  if (sections['cart-drawer']) {
    const next = parse(sections['cart-drawer']).getElementById(
      'shopify-section-cart-drawer',
    )
    drawer
      .querySelector('#shopify-section-cart-drawer')
      .replaceChildren(...next.childNodes)
  }
  if (sections['cart-button']) {
    const next = parse(sections['cart-button']).getElementById('CartButton')
    document.getElementById('CartButton')?.replaceWith(next)
  }
}

async function post(path, body) {
  const isForm = body instanceof FormData
  if (isForm) {
    body.append('sections', SECTIONS.join(','))
    body.append('sections_url', window.location.pathname)
  } else {
    body.sections = SECTIONS
    body.sections_url = window.location.pathname
  }

  drawer.setAttribute('aria-busy', 'true')
  try {
    const response = await fetch(`${root}${path}`, {
      method: 'POST',
      headers: isForm
        ? { Accept: 'application/json' }
        : { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: isForm ? body : JSON.stringify(body),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.description || data.message || response.statusText)
    }
    render(data.sections)
    return data
  } finally {
    drawer.removeAttribute('aria-busy')
  }
}

function open() {
  if (drawer.open) return
  document.body.classList.add('dialog-open')
  drawer.showModal()
}

// Cart changes run one after the other, and each computes its quantity from
// what the drawer shows once the previous one has rendered: two quick "+"
// clicks add two items instead of sending the same quantity twice. Lines are
// found by their key, which, unlike their position, survives a removal.
let changes = Promise.resolve()

function changeLine(key, quantityFrom) {
  const item = () => drawer.querySelector(`[data-key="${CSS.escape(key)}"]`)
  changes = changes.then(async () => {
    const input = item()?.querySelector('[data-line-quantity]')
    if (!input) return
    try {
      const quantity = Math.max(0, quantityFrom(Number(input.value)))
      await post('cart/change.js', { id: key, quantity })
      const next = item()?.querySelector('[data-line-quantity]')
      ;(next ?? drawer.querySelector('[data-cart-close]')).focus()
    } catch (error) {
      const message = drawer.querySelector('[data-cart-error]')
      if (message) message.textContent = error.message
    }
  })
}

if (drawer) {
  drawer.addEventListener('close', () =>
    document.body.classList.remove('dialog-open'),
  )

  document.addEventListener('submit', async event => {
    const form = event.target
    if (form.dataset.type !== 'add-to-cart-form') return
    event.preventDefault()

    const button = form.querySelector('[type="submit"]')
    const error = form.querySelector('[data-form-error]')
    button?.setAttribute('aria-busy', 'true')
    if (button) button.disabled = true
    if (error) error.textContent = ''

    try {
      await post('cart/add.js', new FormData(form))
      open()
    } catch (err) {
      if (error) error.textContent = err.message
    } finally {
      button?.removeAttribute('aria-busy')
      if (button) button.disabled = false
    }
  })

  document.addEventListener('click', event => {
    if (event.target.closest('#CartButton')) {
      event.preventDefault()
      open()
      return
    }
    // a click on the backdrop lands on the <dialog> element itself
    if (event.target === drawer || event.target.closest('[data-cart-close]')) {
      drawer.close()
      return
    }

    const key = event.target.closest('[data-key]')?.dataset.key
    if (!key) return
    if (event.target.closest('[data-line-remove]')) {
      changeLine(key, () => 0)
      return
    }
    const step = event.target.closest('[data-quantity-change]')
    if (step) {
      const by = Number(step.dataset.quantityChange)
      changeLine(key, quantity => quantity + by)
    }
  })

  drawer.addEventListener('change', event => {
    const input = event.target.closest('[data-line-quantity]')
    if (!input) return
    const typed = Number(input.value)
    changeLine(input.closest('[data-key]').dataset.key, () => typed)
  })
}
