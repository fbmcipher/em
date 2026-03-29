```json
[]
```

[]

```json
[
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 28,
    "message": "STYLE-001 – `keyboardIsVisible` is a single-use variable that just aliases `isKeyboardOpen === true`; inline the check directly.",
    "suggestion": "    if (isKeyboardOpen === true && !virtualKeyboardStore.getState().open) {"
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 18,
    "message": "DOCS-001 – Comment restates what the code does (`Get the raw height...from the viewport store`) rather than explaining why.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 71,
    "message": "DOCS-001 – Comment `// Ensure viewportStore is updated` restates the obvious purpose of `updateSize()`.",
    "suggestion": "    updateSize()"
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 73,
    "message": "STRICT-004 – Magic number `16.666` should be a named constant (e.g., `FRAME_DURATION_MS` or similar) to clarify intent.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 37,
    "message": "ARCH-030 / STYLE-002 – The spring animation config `{ type: 'spring', stiffness: 3600, damping: 220, mass: 1.2 }` and the `controls?.stop()` + `animate(...)` pattern are duplicated across the open and close branches. Extract the shared config into a constant and the shared stop-then-animate logic into a helper.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 20,
    "message": "STRICT-001 – `|| 0` is redundant if `virtualKeyboardHeight` is already typed as a number (defaulting to 0). If it can be `undefined`, consider fixing the source type instead.",
    "suggestion": null
  }
]
```

[]

[]

```json
[
  {
    "file": "src/components/PopupBase.tsx",
    "line": 65,
    "message": "DOCS-001 – The comment 'measure the height of the popup after it has been rendered' restates what the code obviously does (calling getBoundingClientRect().height in a useLayoutEffect). It should explain *why* this measurement is needed (e.g., for bottom-anchored positioning) rather than restating the what.",
    "suggestion": "    // Height is needed for bottom-anchored positioning via usePositionFixed"
  },
  {
    "file": "src/components/PopupBase.tsx",
    "line": 57,
    "message": "PERF-011 – Initializing height to 0 and then immediately setting it in useLayoutEffect causes a double render on every mount. Consider using useRef + useLayoutEffect to measure and set the initial value, or using a callback ref to measure synchronously before the first paint, to avoid the extra render pass.",
    "suggestion": null
  }
]
```

```json
[]
```

```json
[]
```

```json
[
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 80,
    "message": "DOCS-001 – The comment \"Calculate `top` values for normal `position: fixed`\" restates the code (`if (position === 'fixed')`) rather than explaining intent. The block also sets `bottom`, not just `top`, making the comment misleading (DOCS-007).",
    "suggestion": "  // Fixed positioning: offset by safe-area insets and virtual keyboard height."
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 55,
    "message": "DOCS-001 – The comment \"Calculate `top` values for absolute positioning (emulating `position: fixed`)\" restates the immediately following `if (position === 'absolute')` check rather than explaining why.",
    "suggestion": null
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 22,
    "message": "STYLE-011 / DOCS-007 – The JSDoc line ends with a stray backslash (`absolute`\\) which appears to be a typo.",
    "suggestion": " * opens, leaving elements to scroll out of place. The workaround is to switch to `position: absolute`"
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 48,
    "message": "DOCS-001 – The comment says \"position: fixed. mode\" which is garbled and restates the code logic. It should explain *why* scroll subscription is disabled in fixed mode.",
    "suggestion": "  // In fixed mode the element stays in place regardless of scroll, so subscribing to scroll\n  // events would only cause unnecessary re-renders."
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 56,
    "message": "ARCH-007 – The original code did not account for `virtualKeyboard.height` in the fixed+fromBottom branch (it only used `spacing.safeAreaBottom + offset`). The new code adds `virtualKeyboard.height` to the fixed bottom calculation (line 86), which is a behavioral change beyond a refactor. Verify this is intentional and not a regression for non-Safari platforms where `virtualKeyboard.height` may be non-zero.",
    "suggestion": null
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 72,
    "message": "DOCS-001 – The comment `// fromTop` merely labels the else-branch, which is already obvious from the `if (fromBottom)` above. Remove or replace with intent-explaining comment.",
    "suggestion": null
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 88,
    "message": "DOCS-001 – The comment `// fromTop` merely labels the else-branch, which is already obvious from the `if (fromBottom)` above. Remove or replace with intent-explaining comment.",
    "suggestion": null
  }
]
```

```json
[
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 37,
    "message": "STRICT-004 – Magic numbers 3600, 220, 1.2 are used for spring animation parameters without named constants; these are repeated again on lines 63-65.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 20,
    "message": "DOCS-001 – Comment '// Get the raw height of the keyboard from the event...' restates what the code already says (`info.keyboardHeight`). Either remove it or explain *why* (e.g., why the fallback to 0 is needed).",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 30,
    "message": "DOCS-001 – Comment '// Stop any existing animation to prevent conflicts' restates the obvious `controls?.stop()` call. Remove or replace with intent-based reasoning.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 57,
    "message": "DOCS-001 – Comment '// Stop any existing animation to prevent conflict.' restates the obvious `controls?.stop()` call.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 33,
    "message": "DOCS-001 – Comment '// Start storing animated height values in virtualKeyboardStore' restates what the code on the next line already shows.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 60,
    "message": "DOCS-001 – Comment '// Start storing animated height values in virtualKeyboardStore.' restates what the code on the next line already shows.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 35,
    "message": "ARCH-030 – The spring animation configuration (type, stiffness, damping, mass, onUpdate) is duplicated between keyboardWillShow (lines 35-43) and keyboardWillHide (lines 61-69). Extract a shared helper or constant for the spring config.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 21,
    "message": "STYLE-002 – The expression `rawHeight - measureSafeAreaBottom()` is duplicated on lines 26 and 48. Factor it out into a small helper or extract the pattern to avoid repetition.",
    "suggestion": null
  }
]
```

[]

Looking at the diff, I need to check for violations of the codebook rules.

The key change here is replacing platform-specific inline code (Safari keyboard state updates and Android WebView keyboard visibility handling) with a unified `virtualKeyboardHandler` abstraction that has `init()` and `destroy()` methods.

Let me check each relevant rule:

1. **ARCH-007 (preserve all existing behavior when refactoring)**: The Safari keyboard state update (`updateSafariKeyboardState()`) was called inside the `selectionchange` event handler (around line 218-223), guarded by `isTouch && isSafari() && !isIOS`. This behavior has been removed without any apparent replacement in this file. The `virtualKeyboardHandler.init()` is added in the resize section, not in the selectionchange handler. This looks like a potential silent drop of existing behavior.

2. The Android WebView keyboard visibility handling is being moved to `virtualKeyboardHandler`, which seems like a proper refactor with `init()`/`destroy()` lifecycle.

However, I can only see the diff for `initEvents.ts` — I don't have visibility into what `virtualKeyboardHandler` does internally. But the `updateSafariKeyboardState()` call was in the `selectionchange` handler, and the new `virtualKeyboardHandler.init()` is in a completely different location (the resize section). This is a strong signal that the Safari selectionchange behavior may have been dropped.

```json
[
  {
    "file": "src/util/initEvents.ts",
    "line": 382,
    "message": "ARCH-007: The `updateSafariKeyboardState()` call was previously invoked inside the `selectionchange` event handler (guarded by `isTouch && isSafari() && !isIOS`). This behavior appears to have been silently dropped — `virtualKeyboardHandler.init()` is placed in the resize listener section, not in the selectionchange handler. Verify that the new abstraction accounts for this Safari-specific selectionchange behavior.",
    "suggestion": null
  }
]
```

```json
[
  {
    "file": "src/browser.ts",
    "line": 26,
    "message": "HYGIENE-006: There is a stray whitespace-only line (line 26 appears to be an empty line with a trailing space). Remove the trailing whitespace.",
    "suggestion": ""
  },
  {
    "file": "src/browser.ts",
    "line": 28,
    "message": "STYLE-002: `Capacitor.getPlatform()` is called twice; factor out the shared expression into a single variable or compare against both values in one call.",
    "suggestion": "export const isCapacitor = () => { const platform = Capacitor.getPlatform(); return platform === 'ios' || platform === 'android' }"
  },
  {
    "file": "src/browser.ts",
    "line": 28,
    "message": "NAMING-002: The name `isCapacitor` suggests it checks whether the Capacitor runtime is available, but the implementation checks whether the platform is iOS or Android (i.e., a native mobile platform). Consider a more accurate name like `isNativeMobile` or `isCapacitorNative`.",
    "suggestion": null
  }
]
```

```json
[
  {
    "file": "src/device/virtual-keyboard/safeArea.ts",
    "line": 1,
    "message": "ARCH-001: This is a generic utility for measuring CSS safe-area insets, not specific to virtual-keyboard. It should be placed in its own file under `src/util/`.",
    "suggestion": null
  }
]
```

```json
[
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 12,
    "message": "DOCS-001 – The comment `// fallback` restates the else-branch structure without explaining *why* iOSSafariHandler is the fallback or what platforms it covers. Replace with a comment explaining intent (e.g., which platforms this branch handles).",
    "suggestion": "      // Non-Capacitor iOS (e.g., Safari PWA) uses the Safari-specific handler"
  },
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 22,
    "message": "DOCS-001 – Same issue: `// fallback` restates the code structure. Explain the intent.",
    "suggestion": "      // Non-Capacitor iOS (e.g., Safari PWA) uses the Safari-specific handler"
  },
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 6,
    "message": "STYLE-002 / ARCH-030 – The platform-detection condition `isCapacitor() && isIOS` is duplicated in both `init` and `destroy`. Factor it out (e.g., select the handler once at the top) to eliminate the duplication.",
    "suggestion": "const virtualKeyboardHandler = (() => {\n  const handler = isCapacitor() && isIOS ? iOSCapacitorHandler : iOSSafariHandler\n  return {\n    /** Initializes the appropriate virtual keyboard handler based on the platform. */\n    init: () => handler.init(),\n    /** Destroys the appropriate virtual keyboard handler based on the platform. */\n    destroy: () => handler.destroy(),\n  }\n})()"
  },
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 11,
    "message": "ARCH-005 – The else branch unconditionally applies iOSSafariHandler for all non-Capacitor-iOS platforms (including Android, desktop browsers, etc.). This iOS-Safari-specific handler should be scoped conditionally to iOS Safari only, not applied as a universal fallback.",
    "suggestion": null
  }
]
```

