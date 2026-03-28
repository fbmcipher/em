/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FEEDBACK_URL: string
  readonly VITE_WEBSOCKET_HOST: string
  readonly VITE_WEBSOCKET_PORT: number
  readonly VITE_AI_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** VirtualKeyboard API types. https://developer.mozilla.org/en-US/docs/Web/API/VirtualKeyboard_API */
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
