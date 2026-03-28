import { isCapacitor, isIOS, isAndroid } from '../../browser'
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

/** A controller for managing the virtual keyboard handlers based on the platform. */
const virtualKeyboardHandler = {
  /** Initializes the appropriate virtual keyboard handler based on the platform. */
  init: () => getHandler().init(),
  /** Destroys the appropriate virtual keyboard handler based on the platform. */
  destroy: () => getHandler().destroy(),
}

export default virtualKeyboardHandler
