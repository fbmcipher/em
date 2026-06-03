import { KnownDevices } from 'puppeteer'
import click from '../helpers/click'
import emulate from '../helpers/emulate'
import longPressThought from '../helpers/longPressThought'
import openModal from '../helpers/openModal'
import paste from '../helpers/paste'
import waitForEditable from '../helpers/waitForEditable'
import waitForSelector from '../helpers/waitForSelector'
import { page } from '../session'

vi.setConfig({ testTimeout: 20000, hookTimeout: 20000 })

describe('command center', () => {
  beforeEach(async () => {
    await emulate(KnownDevices['iPhone 15 Pro'])
  }, 10000)

  // Regression test for https://github.com/cybersemics/em/issues/4331
  // The Command Center overlay became transparent after a modal (Export / Device Management / Settings)
  // opened over it was closed, because the Command Center is unmounted while the modal is open and its
  // sheet opacity transform did not re-sync to the open state on remount.
  // .skip keeps normal CI green while the test is red; remove the .skip when the fix lands.
  it.skip('overlay stays solid after a modal opened over it is closed', async () => {
    await paste(`
      - a
      - b
      - c
    `)

    // open the Command Center by multiselecting two thoughts
    const a = await waitForEditable('a')
    const b = await waitForEditable('b')
    await longPressThought(a, { edge: 'right' })
    await longPressThought(b, { edge: 'right' })

    await page.waitForFunction(
      () => document.querySelector('[data-testid=command-center-panel]')?.textContent?.includes('thoughts selected'),
      { timeout: 8000 },
    )

    // open a modal over the Command Center, then close it
    await openModal('settings')
    await click('.modal__root > a')

    // wait for the Command Center to be visible again after the modal closes
    await waitForSelector('[data-testid=command-center-overlay]')

    const opacity = await page.$eval('[data-testid=command-center-overlay]', el => getComputedStyle(el).opacity)

    expect(opacity).toBe('1')
  })
})
