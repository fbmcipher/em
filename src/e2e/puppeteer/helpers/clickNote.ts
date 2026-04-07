import { page } from '../setup'

/**
 * Click the note for the given thought value. Waits for the note at the beginning in case it hasn't been rendered yet.
 */
const clickNote = async (thoughtValue: string) => {
  // First wait for the thought to exist, then find its note
  const noteNode = await page.waitForFunction(
    (value: string) => {
      // Find the thought with matching value
      const editables = Array.from(document.querySelectorAll('[data-editable]'))
      const thoughtEditable = editables.find(element => element.innerHTML === value)

      if (!thoughtEditable) return null

      // Find the note element that is a sibling of this thought
      // The note should be within the same thought container
      const thoughtContainer = thoughtEditable.closest('.thought-container')
      if (!thoughtContainer) return null

      const note = thoughtContainer.querySelector('[aria-label="note-editable"]')
      return note
    },
    {
      timeout: 6000,
    },
    thoughtValue,
  )

  // @ts-expect-error - https://github.com/puppeteer/puppeteer/issues/8852
  await noteNode.asElement()?.click()
}

export default clickNote
