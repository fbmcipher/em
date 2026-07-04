import { AnimationPlaybackControls, animate } from 'framer-motion'
import VirtualKeyboardHandler from '../../../@types/VirtualKeyboardHandler'
import virtualKeyboardStore from '../../../stores/virtualKeyboardStore'
import getSafeAreaBottom from '../getSafeAreaBottom'

let controls: AnimationPlaybackControls | null = null

/** Handles geometrychange events from the VirtualKeyboard API. */
const onGeometryChange = () => {
  if (!navigator.virtualKeyboard) return
  const rawHeight = navigator.virtualKeyboard.boundingRect.height
  const isOpen = rawHeight > 0

  // Normalize by subtracting safe-area-bottom so the store value represents the keyboard's
  // contribution above the safe-area baseline (consistent with the Capacitor/Safari handlers).
  const targetHeight = isOpen ? Math.max(0, rawHeight - getSafeAreaBottom()) : 0

  virtualKeyboardStore.update({ open: isOpen })

  controls?.stop()

  controls = animate(virtualKeyboardStore.getState().height, targetHeight, {
    type: 'spring',
    stiffness: 2500,
    damping: 125,
    mass: 1,
    onUpdate: value => {
      virtualKeyboardStore.update({ height: value })
    },
    onComplete: () => {
      virtualKeyboardStore.update({ height: targetHeight })
    },
  })
}

/** A virtual keyboard handler that uses the VirtualKeyboard API.
 *
 * This API provides `geometrychange` events with the keyboard's bounding rect.
 * A spring animation is applied to smooth the height transition. */
const virtualKeyboardAPIHandler: VirtualKeyboardHandler = {
  init: () => {
    if (!navigator.virtualKeyboard) return

    // Opt in to manual keyboard geometry handling.
    // This prevents the browser from automatically resizing the viewport,
    // giving us control over how the keyboard offset is applied.
    navigator.virtualKeyboard.overlaysContent = true

    navigator.virtualKeyboard.addEventListener('geometrychange', onGeometryChange)
  },
  destroy: () => {
    if (!navigator.virtualKeyboard) return
    controls?.stop()
    controls = null
    navigator.virtualKeyboard.overlaysContent = false
    navigator.virtualKeyboard.removeEventListener('geometrychange', onGeometryChange)
  },
}

export default virtualKeyboardAPIHandler
