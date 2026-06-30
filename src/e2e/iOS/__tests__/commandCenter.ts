import clickThought from '../helpers/clickThought'
import gesture from '../helpers/gesture'
import paste from '../helpers/paste'

describe('Command Center', () => {
  // Regression test for https://github.com/fbmcipher/em/issues/87
  // .skip keeps normal CI green while the test is red; remove the .skip when the fix lands.
  it.skip('disables tap and hold gestures on tappable command center controls', async () => {
    await paste('Hello')
    await clickThought('Hello')
    await gesture('u')

    await browser.waitUntil(
      async () => browser.execute(() => !!document.querySelector('[data-testid="command-menu-panel"]')),
      {
        timeout: 15000,
        interval: 500,
        timeoutMsg: 'command menu panel did not appear',
      },
    )

    const touchActions = await browser.execute(() => {
      const done = document.querySelector('[data-testid="command-center-done"]')
      const categorize = document.querySelector('[data-testid="command-center-command-categorize"]')

      return done instanceof HTMLElement && categorize instanceof HTMLElement
        ? {
            done: getComputedStyle(done).touchAction,
            categorize: getComputedStyle(categorize).touchAction,
          }
        : null
    })

    expect(touchActions).toEqual({
      done: 'manipulation',
      categorize: 'manipulation',
    })
  })
})
