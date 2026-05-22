import { page } from '../setup'

/**
 * Click the note for the given note value. Waits for the note in case it hasn't been rendered yet.
 */
const clickNote = async (value: string) => {
  const noteHandle = await page.waitForFunction(
    (value: string) => {
      return Array.from(document.querySelectorAll('[aria-label="note-editable"]')).find(
        element => element.innerHTML === value,
      )
    },
    // 6 seconds matches waitForEditable; round trips can exceed 1–2 seconds when tests run in parallel
    { timeout: 6000 },
    value,
  )
  // @ts-expect-error - https://github.com/puppeteer/puppeteer/issues/8852
  await noteHandle.asElement()?.click()
}

export default clickNote
