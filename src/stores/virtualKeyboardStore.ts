import VirtualKeyboardState from '../@types/VirtualKeyboardState'
import reactMinistore from './react-ministore'

/** A store that tracks the state of the virtual keyboard.
 * Its value is updated by platform-specific handlers (see `src/device/virtual-keyboard/handlers/`). */
const virtualKeyboardStore = reactMinistore<VirtualKeyboardState>({
  open: false,
  height: 0,
})

// Sync the store's height to a CSS custom property outside of React, so
// per-frame spring updates drive the DOM without triggering re-renders.
virtualKeyboardStore.subscribeSelector(
  state => state.height,
  height => {
    document.documentElement.style.setProperty('--virtual-keyboard-height', `${height}px`)
  },
)

export default virtualKeyboardStore
