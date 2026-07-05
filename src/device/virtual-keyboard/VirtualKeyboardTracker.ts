import { PluginListenerHandle, registerPlugin } from '@capacitor/core'

/** Payload for the `keyboardProgress` event. */
export interface KeyboardProgressEvent {
  /** The keyboard's current height in CSS pixels, sampled per animation frame. */
  height: number
}

/** Native plugin (Android) that streams the live per-frame virtual keyboard height via
 * WindowInsetsAnimationCompat. See android/.../VirtualKeyboardTracker.java. */
export interface VirtualKeyboardTrackerPlugin {
  addListener(
    eventName: 'keyboardProgress',
    listenerFunc: (event: KeyboardProgressEvent) => void,
  ): Promise<PluginListenerHandle>
  removeAllListeners(): Promise<void>
}

const VirtualKeyboardTracker = registerPlugin<VirtualKeyboardTrackerPlugin>('VirtualKeyboardTracker')

export default VirtualKeyboardTracker
