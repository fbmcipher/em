import { isAndroid, isCapacitor, isIOS } from '../../browser'
import virtualKeyboardStore from '../../stores/virtualKeyboardStore'
import androidCapacitorHandler from './handlers/androidCapacitorHandler'
import iOSCapacitorHandler from './handlers/iOSCapacitorHandler'
import iOSSafariHandler from './handlers/iOSSafariHandler'

/** Returns the appropriate virtual keyboard handler based on the platform. */
const getHandler = () => {
  if (isCapacitor() && isIOS) return iOSCapacitorHandler
  if (isCapacitor() && isAndroid) return androidCapacitorHandler
  // fallback
  return iOSSafariHandler
}

let unsubscribeCSSSync: (() => void) | null = null

/** A controller for managing the virtual keyboard handlers based on the platform. */
const virtualKeyboardHandler = {
  /** Initializes the appropriate virtual keyboard handler based on the platform. */
  init: () => {
    getHandler().init()

    // Sync the store's height to a CSS custom property outside of React, so
    // per-frame spring updates drive the DOM without triggering re-renders.
    unsubscribeCSSSync = virtualKeyboardStore.subscribeSelector(
      state => state.height,
      height => {
        document.documentElement.style.setProperty('--virtual-keyboard-height', `${height}px`)
      },
    )
  },
  /** Destroys the appropriate virtual keyboard handler based on the platform. */
  destroy: () => {
    getHandler().destroy()
    unsubscribeCSSSync?.()
    unsubscribeCSSSync = null
  },
}

export default virtualKeyboardHandler
