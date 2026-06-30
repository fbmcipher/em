import { KnownDevices } from 'puppeteer'
import openCommandCenterCommand from '../../../commands/openCommandCenter'
import clickThought from '../helpers/clickThought'
import emulate from '../helpers/emulate'
import gesture from '../helpers/gesture'
import paste from '../helpers/paste'
import waitForSelector from '../helpers/waitForSelector'
import { page } from '../session'

vi.setConfig({ testTimeout: 20000, hookTimeout: 20000 })

describe('Command Center', () => {
  beforeEach(async () => {
    await emulate(KnownDevices['iPhone 15 Pro'])
  }, 10000)

  // Regression test for https://github.com/fbmcipher/em/issues/87
  it('tap and hold should not activate iOS text selection on Command Center buttons', async () => {
    await paste('Hello')
    await clickThought('Hello')
    await gesture(openCommandCenterCommand)
    await waitForSelector('[data-testid=command-center-panel]')

    // Check the inner clickable button elements (not the outer container which inherits user-select from react-modal-sheet).
    // The panelCommandRecipe base styles use `all: 'unset'`, so user-select must be explicitly set.
    // For iOS, WebkitUserSelect must be applied as an inline style (in addition to the CSS userSelect property)
    // to prevent the long-tap text selection magnifier — same pattern as TraceGesture.tsx.
    const webkitUserSelect = await page.$eval(
      '[data-testid="panel-command"]',
      (el: Element) => (el as HTMLElement).style.webkitUserSelect,
    )

    expect(webkitUserSelect).toBe('none')
  })
})
