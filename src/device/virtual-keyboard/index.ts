import { isAndroid, isCapacitor, isIOS } from '../../browser'
import androidCapacitorHandler from './handlers/androidCapacitorHandler'
import iOSCapacitorHandler from './handlers/iOSCapacitorHandler'
import iOSSafariHandler from './handlers/iOSSafariHandler'
import virtualKeyboardAPIHandler from './handlers/virtualKeyboardAPIHandler'

/** Returns the appropriate virtual keyboard handler based on the platform. */
const getHandler = () => {
  // On Capacitor, consume the native keyboard events emitted by the Capacitor plugins.
  if (isCapacitor() && isIOS) return iOSCapacitorHandler
  if (isCapacitor() && isAndroid) return androidCapacitorHandler

  // Used on platforms that support the VirtualKeyboard API, like Android Chrome.
  if (navigator.virtualKeyboard) return virtualKeyboardAPIHandler

  // Fallback (keyboard height estimation logic) for iOS Safari, which does not yet support the VirtualKeyboard API.
  return iOSSafariHandler
}

/** A controller for managing the virtual keyboard handlers based on the platform. */
const virtualKeyboardHandler = {
  /** Initializes the appropriate virtual keyboard handler based on the platform. */
  init: () => getHandler().init(),
  /** Destroys the appropriate virtual keyboard handler based on the platform. */
  destroy: () => getHandler().destroy(),
}

export default virtualKeyboardHandler
