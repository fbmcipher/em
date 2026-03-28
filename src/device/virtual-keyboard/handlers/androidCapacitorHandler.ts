import { Capacitor } from '@capacitor/core'
import { Keyboard } from '@capacitor/keyboard'
import { AnimationPlaybackControls, animate } from 'motion'
import VirtualKeyboardHandler from '../../../@types/VirtualKeyboardHandler'
import viewportStore from '../../../stores/viewport'
import virtualKeyboardStore from '../../../stores/virtualKeyboardStore'

/** A virtual keyboard handler for Android Capacitor that uses native events and spring physics.
 *  Animates the --virtual-keyboard-height CSS custom property directly on document.documentElement
 *  via motion's DOM animate, bypassing React and manual onUpdate callbacks entirely. */
const androidCapacitorHandler: VirtualKeyboardHandler = {
  init: () => {
    if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable('Keyboard')) return

    let controls: AnimationPlaybackControls | null = null

    /** Stop any in-flight animation. Uses stop() to commit the current animated
     *  value to the inline style, preventing visual discontinuity. */
    const stopAnimation = () => {
      controls?.stop()
      controls = null
    }

    Keyboard.addListener('keyboardWillShow', info => {
      const height = info.keyboardHeight || 0
      viewportStore.update({ virtualKeyboardHeight: height })
      virtualKeyboardStore.update({ open: true, source: 'android-capacitor' })

      stopAnimation()

      controls = animate(document.documentElement, {
        '--virtual-keyboard-height': `${height}px`,
      } as Record<string, string>, {
        type: 'spring',
        stiffness: 500,
        damping: 50,
        mass: 1,
      })
    })

    Keyboard.addListener('keyboardDidShow', info => {
      // Use keyboardDidShow as the authoritative height — on Android the height
      // reported by keyboardWillShow can differ depending on whether the
      // autocomplete/suggestions bar is visible.
      const height = info.keyboardHeight || 0
      stopAnimation()
      document.documentElement.style.setProperty('--virtual-keyboard-height', `${height}px`)
      virtualKeyboardStore.update({ open: true, height, source: 'android-capacitor' })
    })

    Keyboard.addListener('keyboardWillHide', () => {
      virtualKeyboardStore.update({ open: true, source: 'android-capacitor' })

      stopAnimation()

      controls = animate(document.documentElement, {
        '--virtual-keyboard-height': '0px',
      } as Record<string, string>, {
        type: 'spring',
        stiffness: 500,
        damping: 50,
        mass: 1,
      })
    })

    Keyboard.addListener('keyboardDidHide', () => {
      stopAnimation()
      document.documentElement.style.setProperty('--virtual-keyboard-height', '0px')
      virtualKeyboardStore.update({ open: false, height: 0, source: 'android-capacitor' })
    })
  },
  destroy: () => {
    Keyboard.removeAllListeners()
  },
}

export default androidCapacitorHandler
