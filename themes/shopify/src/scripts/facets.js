// Submits the filter/sort form as soon as a value changes. Without this
// script the form still works through its submit button.
for (const form of document.querySelectorAll('[data-facets]')) {
  form.addEventListener('change', () => form.requestSubmit())

  // Leave empty fields (an unset price bound) out of the URL
  form.addEventListener('submit', () => {
    for (const field of form.elements) {
      if (field.name && field.value === '' && !field.disabled) {
        field.disabled = true
        field.dataset.emptyDisabled = ''
      }
    }
  })
  // ...and re-enable them when the page comes back from the back/forward cache
  window.addEventListener('pageshow', () => {
    for (const field of form.querySelectorAll('[data-empty-disabled]')) {
      field.disabled = false
      delete field.dataset.emptyDisabled
    }
  })

  // Only one filter panel open at a time
  const panels = form.querySelectorAll('details')
  for (const panel of panels) {
    panel.addEventListener('toggle', () => {
      if (!panel.open) return
      for (const other of panels) {
        if (other !== panel) other.open = false
      }
    })
  }
}
