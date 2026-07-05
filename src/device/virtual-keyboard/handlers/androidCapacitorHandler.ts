import { Capacitor } from '@capacitor/core'
import { Keyboard } from '@capacitor/keyboard'
import VirtualKeyboardHandler from '../../../@types/VirtualKeyboardHandler'
import viewportStore from '../../../stores/viewport'
import virtualKeyboardStore from '../../../stores/virtualKeyboardStore'
import VirtualKeyboardTracker from '../VirtualKeyboardTracker'
import getSafeAreaBottom from '../getSafeAreaBottom'

/** A virtual keyboard handler for Android Capacitor.
 *
 * Uses @capacitor/keyboard for open/close lifecycle and the authoritative final height, and the
 * native VirtualKeyboardTracker plugin (WindowInsetsAnimationCompat) to drive the store's height
 * from the keyboard's real per-frame position — rather than approximating the animation with a spring.
 *
 * Heights are normalized by subtracting safe-area-bottom, so the store value represents the keyboard's
 * contribution above the safe-area baseline (consistent with the iOS handlers). */
const androidCapacitorHandler: VirtualKeyboardHandler = {
  init: () => {
    if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable('Keyboard')) {
      console.log("not initing")
      return
    }

    console.log("init")

    // Drive the store height from the real per-frame keyboard position streamed by the native plugin.
    VirtualKeyboardTracker.addListener('keyboardProgress', ({ height }) => {
      console.log("Got keyboard update", { height });
      virtualKeyboardStore.update({ height: Math.max(0, height - getSafeAreaBottom()) })
    })

    Keyboard.addListener('keyboardWillShow', info => {
      // The final height is known upfront; expose it via viewportStore for consumers that need it.
      // The animated store height is driven by the per-frame progress stream, not this value.
      const targetHeight = (info.keyboardHeight || 0) - getSafeAreaBottom()
      viewportStore.update({ virtualKeyboardHeight: targetHeight })
      virtualKeyboardStore.update({ open: true })
    })

    Keyboard.addListener('keyboardDidShow', info => {
      // Use keyboardDidShow as the authoritative final height — on Android the height reported by
      // keyboardWillShow can differ depending on whether the autocomplete/suggestions bar is visible.
      const targetHeight = (info.keyboardHeight || 0) - getSafeAreaBottom()
      viewportStore.update({ virtualKeyboardHeight: targetHeight })
    })

    Keyboard.addListener('keyboardWillHide', () => {
      // Leave open: true during the closing animation; the progress stream drives height down to 0.
      virtualKeyboardStore.update({ open: true })
    })

    Keyboard.addListener('keyboardDidHide', () => {
      viewportStore.update({ virtualKeyboardHeight: 0 })
      virtualKeyboardStore.update({ open: false, height: 0 })
    })
  },
  destroy: () => {
    Keyboard.removeAllListeners()
    VirtualKeyboardTracker.removeAllListeners()
  },
}

export default androidCapacitorHandler
