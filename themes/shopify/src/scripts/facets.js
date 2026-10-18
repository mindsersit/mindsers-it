// Submits the filter/sort form as soon as a value changes. Without this
// script the form still works through its submit button.
for (const form of document.querySelectorAll('[data-facets]')) {
  form.addEventListener('change', () => form.requestSubmit())

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
