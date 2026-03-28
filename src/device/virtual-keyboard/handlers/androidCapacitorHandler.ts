import { Capacitor } from '@capacitor/core'
import { Keyboard } from '@capacitor/keyboard'
import { AnimationPlaybackControls, animate } from 'motion'
import VirtualKeyboardHandler from '../../../@types/VirtualKeyboardHandler'
import viewportStore from '../../../stores/viewport'
import virtualKeyboardStore from '../../../stores/virtualKeyboardStore'

/** A virtual keyboard handler for Android Capacitor that uses native events and spring physics. */
const androidCapacitorHandler: VirtualKeyboardHandler = {
  init: () => {
    if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable('Keyboard')) return

    let controls: AnimationPlaybackControls | null = null

    const stopAnimation = () => {
      controls?.stop()
      controls = null
    }

    Keyboard.addListener('keyboardWillShow', info => {
      const height = info.keyboardHeight || 0
      viewportStore.update({ virtualKeyboardHeight: height })
      virtualKeyboardStore.update({ open: true, source: 'android-capacitor' })

      stopAnimation()

      controls = animate(virtualKeyboardStore.getState().height, height, {
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
      const height = info.keyboardHeight || 0
      stopAnimation()
      virtualKeyboardStore.update({ open: true, height, source: 'android-capacitor' })
    })

    Keyboard.addListener('keyboardWillHide', () => {
      virtualKeyboardStore.update({ open: true, source: 'android-capacitor' })

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
      virtualKeyboardStore.update({ open: false, height: 0, source: 'android-capacitor' })
    })
  },
  destroy: () => {
    Keyboard.removeAllListeners()
  },
}

export default androidCapacitorHandler
