```json
[]
```

```json
[
  {
    "file": "src/stores/viewport.ts",
    "line": 53,
    "message": "ARCH-007 – The original code unconditionally updated `virtualKeyboardHeight` with `currentKeyboardHeight`, meaning it was set to 0 when the keyboard closed. The new code now falls back to the cached height when the keyboard is closed, which changes the observable behavior of `virtualKeyboardHeight` (it will never be 0 once a keyboard height has been cached). Ensure all consumers of `virtualKeyboardHeight` are accounted for — any code that relied on `virtualKeyboardHeight === 0` to detect a closed keyboard will now break.",
    "suggestion": null
  }
]
```

```json
[
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 37,
    "message": "STRICT-004 – Magic numbers 3600, 220, 1.2 are used for spring animation parameters without named constants. These same values are duplicated in the keyboardWillHide listener (lines 63-65). Extract them into named constants (e.g., at module scope or in durations.config.ts).",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 30,
    "message": "DOCS-001 – Comment 'Stop any existing animation to prevent conflicts' restates what `controls?.stop()` obviously does. Instead, explain *why* stopping is needed (e.g., to avoid two concurrent spring animations writing to the same store value).",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 20,
    "message": "DOCS-001 – Comment 'Get the raw height of the keyboard from the event...' merely restates the code `info.keyboardHeight`. Remove or replace with intent-explaining comment.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 33,
    "message": "DOCS-001 – Comment 'Start storing animated height values in virtualKeyboardStore' restates what the code does. Replace with a comment explaining *why* a spring animation is used (e.g., to match the native iOS keyboard animation curve).",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 35,
    "message": "ARCH-030 – The spring animation config object `{ type: 'spring', stiffness: 3600, damping: 220, mass: 1.2, onUpdate: ... }` is duplicated between keyboardWillShow (line 35) and keyboardWillHide (line 61). Extract a shared helper or constant to eliminate duplication.",
    "suggestion": null
  }
]
```

[]

```json
[
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 12,
    "message": "DOCS-001 – The comment '// fallback' restates the else-branch without explaining *why* iOSSafariHandler is the correct fallback or what platforms it covers. Explain the intent (e.g., which platforms this branch handles).",
    "suggestion": "      // Non-Capacitor iOS (e.g., Safari PWA) uses the Safari-specific handler"
  },
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 11,
    "message": "ARCH-005 – The else branch unconditionally initializes iOSSafariHandler for all non-iOS-Capacitor platforms (including Android and desktop), but iOSSafariHandler is iOS-specific. This platform-specific handler should be scoped conditionally (e.g., guard with an `isIOS && isSafari()` check) so it does not affect other platforms.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 6,
    "message": "STYLE-002 – The platform check `isCapacitor() && isIOS` is duplicated in both `init` and `destroy`. Factor it out (e.g., select the handler once at module scope or in a helper) to avoid repeating the same conditional logic.",
    "suggestion": null
  }
]
```

```json
[]
```

```json
[
  {
    "file": "src/device/virtual-keyboard/safeArea.ts",
    "line": 2,
    "message": "ARCH-023 – DOM manipulation (createElement, appendChild, getBoundingClientRect) is performed at potential module-scope call time. This measurement function creates and removes DOM elements synchronously, which is fine as a callable function, but consider whether callers might invoke it during module initialization. More importantly, the result could be cached after first measurement to avoid repeated DOM thrashing (see PERF-017).",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/safeArea.ts",
    "line": 5,
    "message": "DOCS-012 – The inline style string uses `env(safe-area-inset-bottom)` which is a non-obvious technique for measuring the safe area via a temporary DOM element. Add a brief comment explaining why this approach is used (creating a hidden element to resolve the CSS environment variable into a pixel value).",
    "suggestion": null
  }
]
```

[]

[]

```json
[
  {
    "file": "src/browser.ts",
    "line": 28,
    "message": "PERF-001 – `Capacitor.getPlatform()` is called twice with the same result; hoist the call into a single variable or use `Capacitor.isNativePlatform()` which already encapsulates this check.",
    "suggestion": "export const isCapacitor = () => Capacitor.isNativePlatform()"
  },
  {
    "file": "src/browser.ts",
    "line": 26,
    "message": "HYGIENE-006 – Extraneous trailing whitespace on this blank line.",
    "suggestion": ""
  }
]
```

```json
[
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 53,
    "message": "STRICT-010 – `let` is used for `top` and `bottom`; prefer `const` with a single assignment (e.g., compute values in a conditional expression or separate branches that each return).",
    "suggestion": null
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 22,
    "message": "DOCS-001 – The comment \"// fromTop\" merely restates the else-branch condition and adds no explanatory value beyond what the code already says.",
    "suggestion": null
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 88,
    "message": "DOCS-001 – The comment \"// fromTop\" merely restates the else-branch condition and adds no explanatory value beyond what the code already says.",
    "suggestion": null
  }
]
```

```json
[
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 28,
    "message": "STYLE-001: `keyboardIsVisible` is a single-use variable that simply restates `isKeyboardOpen === true`; inline the expression directly in the condition on line 30.",
    "suggestion": "    const isKeyboardOpen = store.getState().isKeyboardOpen\n\n    if (isKeyboardOpen === true && !virtualKeyboardStore.getState().open) {"
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 73,
    "message": "STRICT-004: The magic number `16.666` (presumably 1000/60 for ~60fps) should be a named constant to clarify intent.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 37,
    "message": "STYLE-002: The spring animation config `{ type: 'spring', stiffness: 3600, damping: 220, mass: 1.2 }` and the `onUpdate` callback pattern are duplicated between the opening (line 37-45) and closing (line 53-64) branches. Extract the shared config into a module-scope constant and factor out the common animation logic.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 71,
    "message": "DOCS-001: The comment `// Ensure viewportStore is updated` restates what `updateSize()` does. Either remove it or explain *why* it must be called before `updateIOSSafariKeyboardState` (e.g., because the keyboard height is derived from the viewport dimensions).",
    "suggestion": "  // updateSize must be called first so viewportStore.virtualKeyboardHeight is current before we read it\n  updateSize()"
  }
]
```

[]

Looking at the diff, I need to check the codebook rules against the changes made in `src/util/initEvents.ts`.

The key change here is replacing platform-specific keyboard visibility handling (with `isTouch`, `isAndroidWebView()`, `isSafari()`, `isIOS` checks and direct `window.visualViewport.addEventListener` calls) with a `virtualKeyboardHandler` abstraction that has `init()` and `destroy()` methods.

Let me check each rule carefully:

1. **ARCH-007** - The old code had a `selectionchange` handler that called `updateSafariKeyboardState()` conditionally (`if (isTouch && isSafari() && !isIOS)`). This logic has been removed but there's no indication it was moved into `virtualKeyboardHandler`. This could be a silent drop of existing behavior.

2. The `virtualKeyboardHandler.init()` and `virtualKeyboardHandler.destroy()` pattern looks clean and follows ARCH-009/ARCH-013 principles (moving implementation details into the module that owns them, using abstractions).

Let me focus on the high-confidence violation:

The `updateSafariKeyboardState()` call was previously inside the `selectionchange` event handler (lines 221-223 in the old code), gated by `isTouch && isSafari() && !isIOS`. This was removed from the `selectionchange` handler but the new `virtualKeyboardHandler.init()` is only called once during initialization — it doesn't appear to be called on every `selectionchange` event. This is a potential behavioral drop.

```json
[
  {
    "file": "src/util/initEvents.ts",
    "line": 219,
    "message": "ARCH-007: The `updateSafariKeyboardState()` call that was previously invoked on every `selectionchange` event (gated by `isTouch && isSafari() && !isIOS`) has been removed from the selectionchange handler. Ensure this behavior is preserved inside `virtualKeyboardHandler.init()` (e.g., by subscribing to selectionchange internally), otherwise Safari keyboard state tracking on non-iOS touch devices will silently break.",
    "suggestion": null
  }
]
```

```json
[
  {
    "file": "src/components/PopupBase.tsx",
    "line": 70,
    "message": "DOCS-001 – The end-of-line comment `// measure on mount` restates what the code does; it should explain *why* measurement only happens on mount (e.g., the popup's height is assumed to be static after initial render) or be removed.",
    "suggestion": "    }, [anchorFromBottom]) // height is static after mount; re-measure only if anchorFromBottom changes"
  }
]
```

