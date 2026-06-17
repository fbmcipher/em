/**
 * iOS Safari export/share modal tests.
 * Uses WDIO test runner with Mocha framework.
 */
import type { Element } from 'webdriverio'
import isKeyboardShown from '../helpers/isKeyboardShown'
import paste from '../helpers/paste'
import tap from '../helpers/tap'
import waitForEditable from '../helpers/waitForEditable'
import waitUntil from '../helpers/waitUntil'

/**
 * Taps an element with a touch pointer at its center.
 *
 * Unlike the shared `tap` helper (which uses a mouse pointer), this dispatches real touch events.
 * Tapping a toolbar button with touch fires ToolbarButton's onTouchEnd handler, which calls
 * preventDefault to keep the focused Editable from blurring — exactly the path that keeps the
 * virtual keyboard up when opening the Export modal (see https://github.com/cybersemics/em/issues/71).
 */
const touchTap = async (node: Element) => {
  const rect = await browser.getElementRect(node.elementId)
  await browser.performActions([
    {
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        {
          type: 'pointerMove',
          duration: 0,
          x: Math.round(rect.x + rect.width / 2),
          y: Math.round(rect.y + rect.height / 2),
          origin: 'viewport',
        },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 80 },
        { type: 'pointerUp', button: 0 },
      ],
    },
  ])
}

describe('Export', () => {
  // Regression test for https://github.com/cybersemics/em/issues/71
  // Sharing while the keyboard is open must not leave the keyboard up (it would overlap the share sheet).
  // .skip keeps normal CI green while the test is red; remove the .skip when the fix lands.
  it.skip('keyboard stays hidden after sharing', async () => {
    await paste(`
      - A
      - B
      - C
    `)
    const editableA = await waitForEditable('A')

    // place the cursor on a thought and open the keyboard (mirrors the caret.ts pattern)
    await tap(editableA, { y: 60, x: 20 })
    await waitUntil(isKeyboardShown)

    // open the Export modal via the toolbar. The Export icon is off-screen in the scrollable toolbar.
    // Tap it with a touch pointer so the focused Editable is not blurred (keeping the keyboard "open" in state).
    const exportButton = await browser.$('[data-testid="toolbar-icon"][aria-label="Export"]').getElement()
    await browser.execute((el: HTMLElement) => el.scrollIntoView({ inline: 'center', block: 'center' }), exportButton)
    await touchTap(exportButton)
    await browser.$('[data-testid="export-phrase-container"]').waitForExist()

    // share/export and close the modal
    await touchTap(await browser.$('[data-testid="export-share"]').getElement())
    await waitUntil(async () => !(await browser.$('[data-testid="export-phrase-container"]').isExisting()))

    // give the keyboard time to (incorrectly) re-open before asserting it stays hidden
    await browser.pause(1500)
    expect(await isKeyboardShown()).toBe(false)
  })
})
