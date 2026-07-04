import { Capacitor } from '@capacitor/core'
import { Keyboard } from '@capacitor/keyboard'
import { AnimationPlaybackControls, animate } from 'framer-motion'
import VirtualKeyboardHandler from '../../../@types/VirtualKeyboardHandler'
import viewportStore from '../../../stores/viewport'
import virtualKeyboardStore from '../../../stores/virtualKeyboardStore'
import getSafeAreaBottom from '../getSafeAreaBottom'

/** A virtual keyboard handler for Android Capacitor that uses native events and spring physics.
 * Normalizes native keyboard height by subtracting safe-area-bottom, so the store value
 * represents the keyboard's contribution above the safe-area baseline. */
const androidCapacitorHandler: VirtualKeyboardHandler = {
  init: () => {
    if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable('Keyboard')) return

    let controls: AnimationPlaybackControls | null = null

    /** Stops any in-flight spring animation. */
    const stopAnimation = () => {
      controls?.stop()
      controls = null
    }

    Keyboard.addListener('keyboardWillShow', info => {
      const targetHeight = (info.keyboardHeight || 0) - getSafeAreaBottom()
      viewportStore.update({ virtualKeyboardHeight: targetHeight })
      virtualKeyboardStore.update({ open: true })

      stopAnimation()

      controls = animate(virtualKeyboardStore.getState().height, targetHeight, {
        type: 'spring',
        stiffness: 500,
        damping: 50,
        mass: 1,
        onUpdate: value => {
          virtualKeyboardStore.update({ height: value })
        },
      })
    })

    Keyboard.addListener('keyboardDidShow', info => {
      // Use keyboardDidShow as the authoritative height — on Android the height
      // reported by keyboardWillShow can differ depending on whether the
      // autocomplete/suggestions bar is visible.
      const targetHeight = (info.keyboardHeight || 0) - getSafeAreaBottom()
      stopAnimation()
      virtualKeyboardStore.update({ open: true, height: targetHeight })
    })

    Keyboard.addListener('keyboardWillHide', () => {
      virtualKeyboardStore.update({ open: true })

      stopAnimation()

      controls = animate(virtualKeyboardStore.getState().height, 0, {
        type: 'spring',
        stiffness: 500,
        damping: 50,
        mass: 1,
        onUpdate: value => {
          virtualKeyboardStore.update({ height: value })
        },
      })
    })

    Keyboard.addListener('keyboardDidHide', () => {
      stopAnimation()
      virtualKeyboardStore.update({ open: false, height: 0 })
    })
  },
  destroy: () => {
    Keyboard.removeAllListeners()
  },
}

export default androidCapacitorHandler
