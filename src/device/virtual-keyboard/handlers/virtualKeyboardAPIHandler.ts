import { AnimationPlaybackControls, animate } from 'motion'
import VirtualKeyboardHandler from '../../../@types/VirtualKeyboardHandler'
import virtualKeyboardStore from '../../../stores/virtualKeyboardStore'

let controls: AnimationPlaybackControls | null = null

/** Handles geometrychange events from the VirtualKeyboard API. */
const onGeometryChange = () => {
  if (!navigator.virtualKeyboard) return
  const { height } = navigator.virtualKeyboard.boundingRect
  const isOpen = height > 0

  virtualKeyboardStore.update({ open: isOpen })

  controls?.stop()

  controls = animate(virtualKeyboardStore.getState().height, height, {
    type: 'spring',
    stiffness: 2500,
    damping: 125,
    mass: 1,
    onUpdate: value => {
      virtualKeyboardStore.update({ height: value })
    },
    onComplete: () => {
      virtualKeyboardStore.update({ height })
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
