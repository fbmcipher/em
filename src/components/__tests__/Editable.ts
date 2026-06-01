import { fireEvent } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { HOME_TOKEN } from '../../constants'
import * as selection from '../../device/selection'
import exportContext from '../../selectors/exportContext'
import store from '../../stores/app'
import createTestApp, { cleanupTestApp } from '../../test-helpers/createTestApp'
import findThoughtByText from '../../test-helpers/queries/findThoughtByText'
import windowEvent from '../../test-helpers/windowEvent'

beforeEach(createTestApp)
afterEach(cleanupTestApp)

// Using a clipboard app such as Paste for iOS or the built-in clipboard viewer on Android directly modifies the innerHTML and triggers an onChange event on the contenteditable.
it('"paste" from clipboard app into empty thought', async () => {
  act(() => {
    windowEvent('keydown', { key: 'Enter' })
  })

  const editable = (await findThoughtByText(''))!
  expect(editable).toBeVisible()

  // The clipboard app replaces plaintext newlines with divs.
  editable.innerHTML = '- a<div>  -b</div><div>    - c</div>'
  fireEvent.input(editable, { bubbles: true })
  await act(vi.runAllTimersAsync)

  const exported = exportContext(store.getState(), [HOME_TOKEN], 'text/plain')
  expect(exported).toEqual(`- ${HOME_TOKEN}
  - a
    - b
      - c`)
})

it('"paste" from clipboard app into non-empty thought', async () => {
  act(() => {
    windowEvent('keydown', { key: 'Enter' })
  })

  const editable = (await findThoughtByText(''))!
  expect(editable).toBeVisible()

  const user = userEvent.setup({ delay: null })
  await user.type(editable, 'test')
  await act(vi.runAllTimersAsync)

  // The clipboard app appends the text to the existing content.
  editable.innerHTML = 'test- a<div>  -b</div><div>    - c</div>'
  fireEvent.input(editable, { bubbles: true })
  await act(vi.runAllTimersAsync)

  const exported = exportContext(store.getState(), [HOME_TOKEN], 'text/plain')
  expect(exported).toEqual(`- ${HOME_TOKEN}
  - test
    - a
      - b
        - c`)
})

it('inserts emoji spacing immediately and allows Backspace at the emoji boundary', async () => {
  act(() => {
    windowEvent('keydown', { key: 'Enter' })
  })

  const editable = (await findThoughtByText(''))!
  expect(editable).toBeVisible()

  editable.innerHTML = '🧠Hello'
  fireEvent.input(editable, { bubbles: true })
  expect(editable.textContent).toBe('🧠 Hello')

  const user = userEvent.setup({ delay: null })
  editable.focus()
  selection.set(editable, { offset: '🧠 '.length })
  await user.keyboard('{Backspace}')
  await act(vi.runAllTimersAsync)

  expect(editable.textContent).toBe('🧠Hello')
})

it('re-applies emoji spacing after IME composition reverts the DOM update', async () => {
  act(() => {
    windowEvent('keydown', { key: 'Enter' })
  })

  const editable = (await findThoughtByText(''))!
  expect(editable).toBeVisible()

  // type "Hello" so the thought is non-empty
  const user = userEvent.setup({ delay: null })
  await user.type(editable, 'Hello')
  await act(vi.runAllTimersAsync)

  // Simulate inserting an emoji at the beginning via IME composition.
  // 1. compositionstart – browser enters composition mode
  fireEvent.compositionStart(editable)

  // 2. input – our onChangeHandler runs, detects the emoji, inserts a space, and dispatches editThought({force:true})
  editable.innerHTML = '🧠Hello'
  fireEvent.input(editable, { bubbles: true })

  // 3. Simulate the browser reverting the innerHTML (as happens during IME composition on mobile)
  editable.innerHTML = '🧠Hello'

  // 4. compositionend – browser releases composition control; our handler should re-apply the space
  fireEvent.compositionEnd(editable)

  expect(editable.textContent).toBe('🧠 Hello')
})
