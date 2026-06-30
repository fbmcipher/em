import { KnownDevices } from 'puppeteer'
import emulate from '../helpers/emulate'
import longPressThought from '../helpers/longPressThought'
import paste from '../helpers/paste'
import waitForEditable from '../helpers/waitForEditable'
import { page } from '../session'

vi.setConfig({ testTimeout: 20000, hookTimeout: 20000 })

describe('command center', () => {
  beforeEach(async () => {
    await emulate(KnownDevices['iPhone 15 Pro'])
  }, 10000)

  // Regression test for https://github.com/cybersemics/em/issues/87
  // Tap-and-hold on the Command Center must not trigger iOS text selection / the magnifier,
  // i.e. the tappable panel must disable user selection.
  // .skip keeps normal CI green while the test is red; remove the .skip when the fix lands (Step 6).
  it.skip('disables text selection on the tappable area', async () => {
    await paste(`
      - a
      - b
    `)

    const a = await waitForEditable('a')
    await longPressThought(a, { edge: 'right' }) // long press → open Command Center

    // Wait for the Command Center to render.
    await page.waitForFunction(
      () => {
        const panel = document.querySelector('[data-testid=command-center-panel]')
        return panel?.textContent?.includes('thought selected') ?? false
      },
      { timeout: 6000 },
    )

    const userSelect = await page.$eval(
      '[data-testid="command-menu-panel"]',
      el => getComputedStyle(el).webkitUserSelect,
    )

    expect(userSelect).toBe('none')
  })
})
