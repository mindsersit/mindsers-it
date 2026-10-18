// Predictive search in the header search dialog. Results are rendered by
// sections/predictive-search.liquid through the Section Rendering API.
const dialog = document.getElementById('SearchDialog')

if (dialog) {
  const input = dialog.querySelector('input[name="q"]')
  const results = document.getElementById('PredictiveSearchResults')
  const status = document.getElementById('PredictiveSearchStatus')
  let controller
  let timer

  async function search() {
    const terms = input.value.trim()
    controller?.abort()
    if (!terms) {
      results.replaceChildren()
      status.textContent = ''
      return
    }

    controller = new AbortController()
    const params = new URLSearchParams({
      q: terms,
      section_id: 'predictive-search',
      'resources[type]': 'product,collection,page',
      'resources[limit]': '6',
    })
    results.setAttribute('aria-busy', 'true')
    try {
      const response = await fetch(`${dialog.dataset.suggestUrl}?${params}`, {
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(response.statusText)
      const html = await response.text()
      const doc = new DOMParser().parseFromString(html, 'text/html')
      const content = doc.querySelector('.predictive-search')
      results.replaceChildren(...(content ? [content] : []))
      status.textContent = content?.dataset.status ?? ''
    } catch (error) {
      if (error.name === 'AbortError') return
      status.textContent = dialog.dataset.error
      results.textContent = dialog.dataset.error
    } finally {
      results.removeAttribute('aria-busy')
    }
  }

  input.addEventListener('input', () => {
    clearTimeout(timer)
    timer = setTimeout(search, 250)
  })

  document.addEventListener('click', event => {
    if (event.target.closest('[data-search-open]')) {
      event.preventDefault()
      dialog.showModal()
      input.select()
      return
    }
    // a click on the backdrop lands on the <dialog> element itself
    if (
      event.target === dialog ||
      event.target.closest('[data-search-close]')
    ) {
      dialog.close()
    }
  })
}
