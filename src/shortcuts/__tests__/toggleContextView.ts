import { importTextActionCreator as importText } from '../../actions/importText'
import contextToPath from '../../selectors/contextToPath'
import { addMulticursorAtFirstMatchActionCreator as addMulticursor } from '../../test-helpers/addMulticursorAtFirstMatch'
import createTestStore from '../../test-helpers/createTestStore'
import { setCursorFirstMatchActionCreator as setCursor } from '../../test-helpers/setCursorFirstMatch'
import { executeShortcutWithMulticursor } from '../../util/executeShortcut'
import hashPath from '../../util/hashPath'
import toggleContextViewShortcut from '../toggleContextView'

describe('toggleContextView', () => {
  describe('multicursor', () => {
    it('toggles context view for multiple thoughts', async () => {
      const store = createTestStore()

      store.dispatch([
        importText({
          text: `
            - a
              - m
                - x
            - b
              - m
                - y
          `,
        }),
        setCursor(['a', 'm']),
        addMulticursor(['b', 'm']),
      ])

      executeShortcutWithMulticursor(toggleContextViewShortcut, { store })

      const stateNew = store.getState()

      const am = contextToPath(stateNew, ['a', 'm'])
      const bm = contextToPath(stateNew, ['b', 'm'])

      expect(stateNew.contextViews).toEqual({
        [hashPath(am)]: true,
        [hashPath(bm)]: true,
      })
    })
  })
})
