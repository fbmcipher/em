import { ElementHandle, KnownDevices } from 'puppeteer'
import newSubthoughtCommand from '../../../commands/newSubthought'
import newThoughtCommand from '../../../commands/newThought'
import exportThoughts from '../helpers/exportThoughts'
import gesture from '../helpers/gesture'
import keyboard from '../helpers/keyboard'
import paste from '../helpers/paste'
import waitForAlertContent from '../helpers/waitForAlertContent'
import waitForEditable from '../helpers/waitForEditable'
import { page } from '../setup'

vi.setConfig({ testTimeout: 20000, hookTimeout: 20000 })

/**
 * Test suite for gesture alert behavior.
 *
 * These tests verify that gesture alerts follow the correct timing:
 * - No alerts should appear during gesture progress
 * - Alerts should appear only after gesture completion.
 *
 * This ensures a clean user experience where alerts don't interfere
 * with ongoing gesture interactions.
 */
describe('alerts', () => {
  beforeEach(async () => {
    await page.emulate(KnownDevices['iPhone 15 Pro'])
  })

  /**
   * Test that verifies no alert appears during gesture progress.
   *
   * This test ensures that when a user starts a gesture but doesn't complete it
   * (no touchEnd event), no alert should be shown. This prevents alerts from
   * appearing prematurely and interfering with the gesture interaction.
   */
  it('should not show alert during gesture progress', async () => {
    // Perform an incomplete gesture (no touchEnd) - create a new thought
    await gesture(newSubthoughtCommand, { hold: true })

    // Check that no alert content is visible during gesture progress
    const alertContent = await page.$('[data-testid=alert-content]')
    expect(alertContent).toBeNull()
  })

  /**
   * Test that verifies alert appears after gesture completion.
   *
   * This test ensures that when a user completes a gesture (with touchEnd event),
   * an alert should be shown to provide feedback about the executed command.
   * This confirms that alerts are properly triggered after gesture completion.
   */
  it('should show alert after gesture completion', async () => {
    // Perform a complete gesture - create a new thought
    await gesture(newSubthoughtCommand)

    // Check that alert content is visible after gesture completion
    const alertContent = await page.$('[data-testid=alert-content]')
    expect(alertContent).not.toBeNull()

    // Verify alert content contains gesture hint text
    const alertText = await page.$eval('[data-testid=alert-content]', el => el.textContent)
    expect(alertText).toBeTruthy()
  })
})

describe('chaining commands', () => {
  beforeEach(async () => {
    await page.emulate(KnownDevices['iPhone 15 Pro'])
  })

  it('chained command', async () => {
    await gesture(newThoughtCommand)
    await keyboard.type('a')
    await gesture(newSubthoughtCommand)
    await keyboard.type('b')

    // New Thought + Outdent
    await gesture('rd' + 'lrl')

    const exported1 = await exportThoughts()
    expect(exported1).toBe(`
- a
  - b
- 
`)
  })

  it('prioritize exact match over chained command', async () => {
    await gesture(newThoughtCommand)
    await keyboard.type('a')
    await gesture(newSubthoughtCommand)

    const exported1 = await exportThoughts()
    expect(exported1).toBe(`
- a
  - 
`)
  })
})

describe('gesture after drag of duplicate to home', () => {
  beforeEach(async () => {
    await page.emulate(KnownDevices['iPhone 15 Pro'])
  })

  /**
   * Regression test for: [Mobile] Unable to draw tracing after moving a duplicate thought to Home (root).
   *
   * When a subthought is dragged to the home context where a thought with the same value already exists,
   * the thoughts are merged. Due to a missing longPress state reset after the drag, the gesture system
   * incorrectly believes a drag is still in progress and cancels all subsequent gestures.
   */
  it('should allow gestures after moving a duplicate subthought to the home context', async () => {
    await paste(`
      - A
      - B
        - C
      - C
    `)

    // The first C in DOM order is the subthought under B (B's child comes before root C in the DOM)
    const subCHandle = await waitForEditable('C')
    const subCElement = subCHandle.asElement()
    if (!subCElement) throw new Error('Sub-C element not found')

    const subCBox = await subCElement.boundingBox()
    if (!subCBox) throw new Error('Sub-C bounding box not found')

    // Find the bullet element of sub-C for long-press detection
    const bulletElement = await page.evaluateHandle((el: Node) => {
      const element = el as Element
      const container = element.closest('[aria-label="thought-container"]')
      if (!container) throw new Error('Thought container not found')
      const bullet = container.querySelector('[aria-label="bullet"]')
      if (!bullet) throw new Error('Bullet element not found')
      return bullet
    }, subCElement)

    if (!(bulletElement instanceof ElementHandle)) throw new Error('Bullet ElementHandle not found')

    // Begin touch on sub-C to initiate long press
    const touchX = subCBox.x + 1
    const touchY = subCBox.y + subCBox.height / 2
    await page.touchscreen.touchStart(touchX, touchY)

    // Wait until long press activates (bullet becomes highlighted)
    await page.waitForFunction(
      (bulletEl: Element) => bulletEl.getAttribute('data-highlighted') === 'true',
      { timeout: 5000 },
      bulletElement,
    )

    // Get B's position; drag to above B (before B in the root context) so that
    // sub-C lands in the home context where a duplicate C already exists.
    const bHandle = await waitForEditable('B')
    const bElement = bHandle.asElement()
    if (!bElement) throw new Error('B element not found')

    const bBox = await bElement.boundingBox()
    if (!bBox) throw new Error('B bounding box not found')

    // Drop target: center of B triggers "drop before B" (i.e. between A and B at root level)
    const destX = bBox.x + bBox.width / 2
    const destY = bBox.y + bBox.height / 2

    // Move in small steps to simulate a realistic touch drag
    const steps = 20
    const dx = (destX - touchX) / steps
    const dy = (destY - touchY) / steps

    for (let i = 1; i <= steps; i++) {
      await page.touchscreen.touchMove(touchX + dx * i, touchY + dy * i)
    }

    await page.touchscreen.touchEnd()

    // Perform a gesture to verify the gesture system is still functional after the drag.
    // The newThought gesture (swipe right-down) should create a new thought and show a "New Thought" alert.
    // If the longPress state was not properly reset after the drag, shouldCancelGesture() will return true
    // and the gesture will be silently abandoned with no alert.
    await gesture(newThoughtCommand)

    await waitForAlertContent('New Thought')
  })
})
