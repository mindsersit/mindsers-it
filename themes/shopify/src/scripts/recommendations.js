// Loads "Vous aimerez aussi" product recommendations after the page renders.
// The section stays empty (and invisible) if the request fails.
for (const container of document.querySelectorAll('[data-recommendations]')) {
  if (container.children.length > 0) continue

  fetch(container.dataset.url)
    .then(response => (response.ok ? response.text() : ''))
    .then(html => {
      const next = new DOMParser()
        .parseFromString(html, 'text/html')
        .querySelector('[data-recommendations]')
      if (next) container.replaceChildren(...next.childNodes)
    })
    .catch(() => {})
}
