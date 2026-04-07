import { KnownDevices } from 'puppeteer'
import newThoughtCommand from '../../../commands/newThought'
import clickThought from '../helpers/clickThought'
import dragAndDropThought from '../helpers/dragAndDropThought'
import gesture from '../helpers/gesture'
import hideHUD from '../helpers/hideHUD'
import paste from '../helpers/paste'
import waitForEditable from '../helpers/waitForEditable'
import { page } from '../setup'

vi.setConfig({ testTimeout: 20000, hookTimeout: 20000 })

/**
 * Test suite for issue #9: Unable to draw tracing after moving a duplicate thought to Home (root).
 *
 * These tests verify that gestures still work after moving a duplicate thought to the root level.
 * The bug causes the gesture system to become non-functional after this specific drag-and-drop operation.
 */
describe('duplicate thought drag-and-drop gesture bug', () => {
  beforeEach(async () => {
    await page.emulate(KnownDevices['iPhone 15 Pro'])
    await hideHUD()
  })

  /**
   * Test for moving duplicate thought above the sibling.
   *
   * Steps:
   * 1. Place the cursor on Subthought C under Thought B.
   * 2. Tap and hold.
   * 3. Drag to the root above Thought B.
   *
   * Expected: Gestures should still work after the move.
   * Actual: User cannot draw any tracing on screen.
   */
  it('gestures should work after moving duplicate thought above sibling', async () => {
    // Paste the thought structure
    await paste(`
- A
- B
  - C
- C
`)

    // Wait for the thoughts to be rendered
    await waitForEditable('A')
    await waitForEditable('B')
    await waitForEditable('C')

    // Click on thought B to expand it
    await clickThought('B')

    // Wait for the subthought C to be visible
    await waitForEditable('C')

    // Get the editable element handle for drag and drop
    await page.evaluate(() => {
      const editables = Array.from(document.querySelectorAll('[data-editable]'))
      const cElements = editables.filter(el => el.innerHTML === 'C')
      // Click on the first C (the subthought under B)
      if (cElements[0] instanceof HTMLElement) {
        cElements[0].click()
      }
    })

    // Drag subthought C to root above B
    // We need to find the C that is a child of B and drag it above B
    await dragAndDropThought('C', 'B', { position: 'before', dropUncle: false })

    // Now try to execute a gesture - this should work but currently fails
    // Try to create a new thought with a gesture
    await gesture(newThoughtCommand)

    // Check that an alert appeared (which indicates the gesture was executed)
    const alertContent = await page.$('[data-testid=alert-content]')
    expect(alertContent).not.toBeNull()
  })

  /**
   * Test for moving duplicate thought below the sibling.
   *
   * Steps:
   * 1. Place the cursor on Subthought C under Thought B.
   * 2. Tap and hold.
   * 3. Drag to the root below Thought C.
   *
   * Expected: Gestures should still work after the move.
   * Actual: User cannot draw any tracing on screen.
   */
  it('gestures should work after moving duplicate thought below sibling', async () => {
    // Paste the thought structure
    await paste(`
- A
- B
  - C
- C
`)

    // Wait for the thoughts to be rendered
    await waitForEditable('A')
    await waitForEditable('B')
    await waitForEditable('C')

    // Click on thought B to expand it
    await clickThought('B')

    // Wait for the subthought C to be visible
    await waitForEditable('C')

    // Click on the subthought C (first C element)
    await page.evaluate(() => {
      const editables = Array.from(document.querySelectorAll('[data-editable]'))
      const cElements = editables.filter(el => el.innerHTML === 'C')
      // Click on the first C (the subthought under B)
      if (cElements[0] instanceof HTMLElement) {
        cElements[0].click()
      }
    })

    // Drag subthought C to root below the root-level C
    await dragAndDropThought('C', 'C', { position: 'after', dropUncle: false })

    // Now try to execute a gesture - this should work but currently fails
    // Try to create a new thought with a gesture
    await gesture(newThoughtCommand)

    // Check that an alert appeared (which indicates the gesture was executed)
    const alertContent = await page.$('[data-testid=alert-content]')
    expect(alertContent).not.toBeNull()
  })
})
