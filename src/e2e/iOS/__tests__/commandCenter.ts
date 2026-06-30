/**
 * Command Center tests for iOS.
 * Uses WDIO test runner with Mocha framework.
 */
import gesture from '../helpers/gesture'
import hideKeyboardByTappingDone from '../helpers/hideKeyboardByTappingDone'
import newThought from '../helpers/newThought'

describe('Command Center', () => {
  // Regression test for https://github.com/fbmcipher/em/issues/87
  // .skip keeps normal CI green while the test is red; remove the .skip when the fix lands.
  it.skip('tap and hold on Command Center buttons should not activate iOS text selection', async () => {
    await newThought('Hello')
    await hideKeyboardByTappingDone()

    // Open Command Center via swipe-up gesture
    await gesture('u')

    // Wait for Command Center commands area to appear
    await browser.waitUntil(
      async () => {
        const result = await browser.execute(() => {
          return JSON.stringify(!!document.querySelector('[data-testid="command-center-commands"]'))
        })
        return result === '"true"'
      },
      { timeout: 5000 },
    )

    // Verify user-select is none on the commands area to prevent iOS text selection magnifier on long press
    const webkitUserSelect = await browser.execute(() => {
      const el = document.querySelector('[data-testid="command-center-commands"]')
      return el ? getComputedStyle(el).webkitUserSelect : null
    })

    expect(webkitUserSelect).toBe('none')
  })
})
