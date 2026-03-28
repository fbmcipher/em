/** VirtualKeyboard API types. See https://developer.mozilla.org/en-US/docs/Web/API/VirtualKeyboard_API. */
interface VirtualKeyboard extends EventTarget {
  boundingRect: DOMRect
  overlaysContent: boolean
  show(): void
  hide(): void
  addEventListener(type: 'geometrychange', listener: EventListenerOrEventListenerObject): void
  removeEventListener(type: 'geometrychange', listener: EventListenerOrEventListenerObject): void
}

interface Navigator {
  virtualKeyboard?: VirtualKeyboard
}
