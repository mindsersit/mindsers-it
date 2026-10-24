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
    const current = drawer.querySelector('#shopify-section-cart-drawer')
    // The cart did change: rather than keep showing the old one, reload
    if (!next || !current) {
      console.error('cart: unexpected cart-drawer section', sections)
      window.location.reload()
      return
    }
    current.replaceChildren(...next.childNodes)
  }
  if (sections['cart-button']) {
    const next = parse(sections['cart-button']).getElementById('CartButton')
    if (next) document.getElementById('CartButton')?.replaceWith(next)
  }
}

// For a failure the cart doesn't describe (network error, an HTML error page)
const cartError = () => new Error(drawer.dataset.error)

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
    }).catch(error => {
      console.error('cart: request failed', path, error)
      throw cartError()
    })
    const data = await response.json().catch(() => null)
    if (!response.ok || !data) {
      console.error('cart: request failed', path, response.status, data)
      const message = data?.description || data?.message
      throw message ? new Error(message) : cartError()
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

// Cart changes run one after the other. A "+" or "−" computes its quantity
// from the line's rendered quantity (its input's defaultValue) once the
// previous change has rendered: two quick "+" clicks add two items instead of
// sending the same quantity twice. Lines are found by their key (data-key in
// snippets/cart-item.liquid), which, unlike their position, survives a removal.
let changes = Promise.resolve()

function showError(text) {
  const message = drawer.querySelector('[data-cart-error]')
  if (message) message.textContent = text
}

function changeLine(key, quantityFrom, { removal = false } = {}) {
  const item = () => drawer.querySelector(`[data-key="${CSS.escape(key)}"]`)
  changes = changes
    .then(async () => {
      const input = item()?.querySelector('[data-line-quantity]')
      if (!input) {
        // gone already: fine for a second "remove", not for a "+"
        if (!removal) showError(drawer.dataset.error)
        return
      }
      try {
        const rendered = Number(input.defaultValue)
        const quantity = Math.max(0, quantityFrom(rendered))
        await post('cart/change.js', { id: key, quantity })
        const next = item()?.querySelector('[data-line-quantity]')
        ;(next ?? drawer.querySelector('[data-cart-close]')).focus()
      } catch (error) {
        // the drawer wasn't re-rendered: show the quantity the cart still has
        input.value = input.defaultValue
        showError(error.message)
      }
    })
    // keep the queue going whatever a step throws
    .catch(error => {
      console.error('cart: change failed', key, error)
      showError(drawer.dataset.error)
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
      changeLine(key, () => 0, { removal: true })
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
    // An emptied or invalid field would read as 0 and remove the line: put
    // the quantity back instead (the remove button is there for that)
    const typed = input.value === '' ? Number.NaN : Number(input.value)
    if (!Number.isInteger(typed) || typed < 0) {
      input.value = input.defaultValue
      return
    }
    changeLine(input.closest('[data-key]').dataset.key, () => typed)
  })
}
