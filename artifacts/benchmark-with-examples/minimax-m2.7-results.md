```json
[
  {
    "file": "src/device/virtual-keyboard/safeArea.ts",
    "line": 5,
    "message": "The CSS string literal is recreated on every function call; static constants should be declared at module scope.",
    "suggestion": "const SAFE_AREA_CSS = 'position:fixed;bottom:0;height:env(safe-area-inset-bottom);visibility:hidden'\n\n/** Measures the safe-area-bottom inset in pixels. Returns 0 if unavailable. */\nconst measureSafeAreaBottom = (): number => {\n  if (typeof document === 'undefined') return 0\n  const div = document.createElement('div')\n  div.style.cssText = SAFE_AREA_CSS\n  document.body.appendChild(div)\n  const value = div.getBoundingClientRect().height\n  document.body.removeChild(div)\n  return value\n}"
  }
]
```

[]

```json
[
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 73,
    "message": "STRICT-004: Magic number literal 16.666 should be extracted to a named constant for better maintainability.",
    "suggestion": "const THROTTLE_MS = 16.666\n\nconst onResize = _.throttle(() => {\n  updateSize()\n  updateIOSSafariKeyboardState()\n}, THROTTLE_MS)"
  }
]
```

```json
[
  {
    "file": "src/browser.ts",
    "line": 26,
    "message": "HYGIENE-001: Remove debug artifacts like '# added' markers before merging.",
    "suggestion": null
  },
  {
    "file": "src/browser.ts",
    "line": 27,
    "message": "HYGIENE-001: Remove '# added' debug marker from end of line.",
    "suggestion": "/** Returns true if the application is running in Capacitor (on either iOS or Android). */"
  },
  {
    "file": "src/browser.ts",
    "line": 28,
    "message": "HYGIENE-001: Remove '# added' debug marker from end of line.",
    "suggestion": "export const isCapacitor = () => Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android'"
  }
]
```

```json
[
  {
    "file": "src/util/initEvents.ts",
    "line": 381,
    "message": "ARCH-005: The virtual keyboard handler initialization is applied unconditionally. If it contains platform-specific logic, it should still be gated with a platform check to avoid affecting other platforms.",
    "suggestion": "Gate the virtualKeyboardHandler.init() call with the appropriate platform condition, e.g.:\nif (isTouch && isAndroidWebView()) {\n  virtualKeyboardHandler.init()\n}"
  }
]
```

[]

```json
[]
```

[]

[]

```json
[
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 35,
    "message": "STYLE-002: The spring animation config object is duplicated. Extract to a module-level constant.",
    "suggestion": "const springAnimationConfig = {\n  type: 'spring',\n  stiffness: 3600,\n  damping: 220,\n  mass: 1.2,\n}\n\ncontrols = animate(virtualKeyboardStore.getState().height, height, springAnimationConfig)"
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 61,
    "message": "STYLE-002: The spring animation config object is duplicated. Use the shared constant instead.",
    "suggestion": "controls = animate(virtualKeyboardStore.getState().height, 0, springAnimationConfig)"
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 33,
    "message": "DOCS-001: Comment explains what the code does, not why. Consider removing or explaining the intent.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 60,
    "message": "DOCS-001: Comment explains what the code does, not why. Consider removing or explaining the intent.",
    "suggestion": null
  }
]
```

[]

```json
[
  {
    "file": "src/stores/safariKeyboardStore.ts",
    "line": 1,
    "message": "ARCH-004: This entire file is being deleted without explaining why it is safe to remove. There is no explanation of what replaces this keyboard animation functionality or what regression risk the deletion introduces.",
    "suggestion": null
  }
]
```

[]

```json
[
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 9,
    "message": "STYLE-002: The platform detection condition `isCapacitor() && isIOS` is duplicated in both `init` and `destroy` methods. Factor out the shared logic.",
    "suggestion": "const initIOSHandler = isCapacitor() && isIOS\n\ninit: () => {\n  if (initIOSHandler) {\n    iOSCapacitorHandler.init()\n  } else {\n    // fallback\n    iOSSafariHandler.init()\n  }\n},"
  }
]
```

```json
[]
```

