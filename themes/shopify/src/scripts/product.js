// Variant picker and quantity buttons on the product page. Prices and badges
// are pre-rendered per variant in Liquid ([data-variants]), so this script
// only swaps HTML.
for (const root of document.querySelectorAll('[data-product]')) {
  const variants = JSON.parse(
    root.querySelector('[data-variants]')?.textContent || '[]',
  )
  const fieldsets = [...root.querySelectorAll('[data-option]')]
  const idInput = root.querySelector('[data-variant-id]')
  const button = root.querySelector('[data-add-button]')
  const price = root.querySelector('[data-price]')
  const badges = root.querySelector('[data-badges]')
  const gallery = root.querySelector('[data-gallery]')
  const error = root.querySelector('[data-form-error]')

  const selectedOptions = () =>
    fieldsets.map(fieldset => fieldset.querySelector('input:checked')?.value)

  const matches = (variant, options) =>
    options.every((value, index) => variant.options[index] === value)

  function markUnavailable(options) {
    fieldsets.forEach((fieldset, index) => {
      for (const input of fieldset.querySelectorAll('input')) {
        const candidate = options.map((value, i) =>
          i === index ? input.value : value,
        )
        const available = variants.some(
          variant => variant.available && matches(variant, candidate),
        )
        input.classList.toggle('unavailable', !available)
      }
    })
  }

  // Moves the variant's image to the front of the gallery: top of the column
  // on desktop, first slide on mobile
  function showMedia(mediaId) {
    const item = gallery?.querySelector(`[data-media-id="${mediaId}"]`)
    if (!item) return
    gallery.prepend(item)
    gallery.scrollTo({ left: 0, behavior: 'smooth' })
  }

  function update() {
    const options = selectedOptions()
    const variant = variants.find(candidate => matches(candidate, options))
    markUnavailable(options)
    error.textContent = ''

    if (!variant) {
      idInput.disabled = true
      button.disabled = true
      button.textContent = button.dataset.labelUnavailable
      return
    }

    idInput.disabled = false
    idInput.value = variant.id
    button.disabled = !variant.available
    button.textContent = variant.available
      ? button.dataset.labelAdd
      : button.dataset.labelSoldOut
    price.innerHTML = variant.price
    badges.innerHTML = variant.badges
    if (variant.media) showMedia(variant.media)

    const url = new URL(window.location.href)
    url.searchParams.set('variant', variant.id)
    window.history.replaceState({}, '', url)
  }

  for (const fieldset of fieldsets) {
    fieldset.addEventListener('change', update)
  }

  for (const step of root.querySelectorAll('[data-quantity-step]')) {
    step.addEventListener('click', () => {
      const input = step.parentElement.querySelector('input')
      const next = Number(input.value || 1) + Number(step.dataset.quantityStep)
      input.value = Math.max(Number(input.min || 1), next)
    })
  }
}
