```json
[
  {
    "file": "src/util/initEvents.ts",
    "line": 382,
    "message": "ARCH-023: DOM listener initialization (virtualKeyboardHandler.init()) is being called at module execution scope indirectly, but more specifically the old platform-conditional guard (isTouch && isAndroidWebView()) has been removed, making this unconditional across all platforms — violating ARCH-005 (platform-specific fixes must be wrapped in platform-detection conditionals).",
    "suggestion": null
  },
  {
    "file": "src/util/initEvents.ts",
    "line": 382,
    "message": "ARCH-005: The Android-specific visual viewport keyboard detection (previously guarded by `isTouch && isAndroidWebView()`) is now initialized unconditionally via `virtualKeyboardHandler.init()`, which may affect non-Android and non-touch platforms.",
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
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 12,
    "message": "DOCS-001: The comment '// fallback' restates what the code does (else branch) without explaining why iOSSafariHandler is the fallback or what platforms it covers.",
    "suggestion": "// non-Capacitor iOS or other platforms fall back to the Safari handler"
  },
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 21,
    "message": "DOCS-001: The comment '// fallback' in the destroy method restates what the code does without explaining intent.",
    "suggestion": "// non-Capacitor iOS or other platforms fall back to the Safari handler"
  },
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 18,
    "message": "STYLE-002: The condition `isCapacitor() && isIOS` is duplicated verbatim in both `init` and `destroy`; factor it out into a shared constant or helper to avoid repetition.",
    "suggestion": "const isIOSCapacitor = isCapacitor() && isIOS\n\nconst virtualKeyboardHandler = {\n  init: () => {\n    if (isIOSCapacitor) {\n      iOSCapacitorHandler.init()\n    } else {\n      iOSSafariHandler.init()\n    }\n  },\n  destroy: () => {\n    if (isIOSCapacitor) {\n      iOSCapacitorHandler.destroy()\n    } else {\n      iOSSafariHandler.destroy()\n    }\n  },\n}"
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
    "file": "package.json",
    "line": 120,
    "message": "HYGIENE-001: Inline comment `# added` is a debug/annotation artifact that should be removed before merging; JSON does not support comments and this will cause a parse error.",
    "suggestion": "    \"motion\": \"^12.28.1\","
  }
]
```

```json
[
  {
    "file": "src/components/PopupBase.tsx",
    "line": 70,
    "message": "DOCS-001: The comment '// measure on mount' restates what the empty dependency array already communicates; it should explain WHY useLayoutEffect is used here instead of useEffect (to avoid a flash of incorrect position).",
    "suggestion": "    }, [anchorFromBottom]) // useLayoutEffect avoids a visible flash of incorrect position before the browser paints"
  },
  {
    "file": "src/components/PopupBase.tsx",
    "line": 57,
    "message": "DOCS-001: The comment on line 56 ('Used when anchorFromBottom = true for calculating position on mobile safari') now describes the old useState(50) initial value; the initial value changed to 0 and the comment should be updated to reflect the new behavior.",
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
    "file": "src/hooks/usePositionFixed.ts",
    "line": 22,
    "message": "DOCS-001: The comment on line 22 restates what the code does ('backslash' artifact aside) rather than explaining why; the trailing backslash on line 22 is also a typo (HYGIENE-006).",
    "suggestion": " * 3. Broken `position: fixed` on iOS Safari: In MobileSafari, position: fixed is disabled when the keyboard\n *    opens, leaving elements to scroll out of place. The workaround is to switch to `position: absolute`\n *    and recompute `top` from the current scroll position on every scroll frame, effectively re-implementing\n *    fixed positioning."
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 48,
    "message": "DOCS-001: The comment '// Only subscribe to scroll events when emulating with position: fixed. mode — in fixed mode, scroll position' restates the code and contains a grammatical artifact ('position: fixed. mode'); it should explain the intent more precisely.",
    "suggestion": "  // Subscribing to scroll events is only necessary when emulating fixed positioning with absolute;\n  // in true fixed mode the element does not move with scroll, so we skip the subscription to avoid unnecessary re-renders."
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 81,
    "message": "STYLE-014: The two top-level `if (position === 'absolute')` and `if (position === 'fixed')` blocks could be an if/else, avoiding the need for a reader to verify they are mutually exclusive; using `else if` (or a single if/else) is cleaner.",
    "suggestion": "  } else {\n    // position === 'fixed'\n    if (fromBottom) {"
  }
]
```

```json
[
  {
    "file": "src/browser.ts",
    "line": 28,
    "message": "STYLE-002: `Capacitor.getPlatform()` is called twice; hoist it into a variable to avoid the redundant call.",
    "suggestion": "export const isCapacitor = () => { const platform = Capacitor.getPlatform(); return platform === 'ios' || platform === 'android' }"
  }
]
```

Reviewing the diff against the codebook rules.

**STYLE-001 – Inline single-use variables**

Line 26 computes `height` but then on line 27 uses `rawHeight` (not `height`) for `viewportStore.update`. The `height` variable is only used later in the `animate` call (line 35). However, `rawHeight` is also a single-use variable used only on line 26 and 27. These are borderline but `rawHeight` on line 21 is used twice (lines 26 and 27), so it's not single-use. No clear violation here.

**STYLE-002 – Factor out shared expressions**

The spring animation options object `{ type: 'spring', stiffness: 3600, damping: 220, mass: 1.2, onUpdate: ... }` is duplicated between `keyboardWillShow` (lines 36–43) and `keyboardWillHide` (lines 62–69). The `onUpdate` callback is identical too.

**ARCH-030 – Eliminate code duplication by extracting shared abstractions**

The `animate(...)` call with identical spring parameters and `onUpdate` callback is duplicated in `keyboardWillShow` and `keyboardWillHide`.

**DOCS-001 – Comments should explain intent, not restate code**

Line 30: `// Stop any existing animation to prevent conflicts` and line 33: `// Start storing animated height values in virtualKeyboardStore` — these restate what the code does rather than explaining why.

```json
[
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 35,
    "message": "ARCH-030 / STYLE-002: The animate() call with identical spring parameters and onUpdate callback is duplicated in keyboardWillShow and keyboardWillHide; extract into a shared helper to avoid duplication.",
    "suggestion": "const animateTo = (target: number) => {\n  controls?.stop()\n  controls = animate(virtualKeyboardStore.getState().height, target, {\n    type: 'spring',\n    stiffness: 3600,\n    damping: 220,\n    mass: 1.2,\n    onUpdate: value => {\n      virtualKeyboardStore.update({ height: value })\n    },\n  })\n}"
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 30,
    "message": "DOCS-001: Comment 'Stop any existing animation to prevent conflicts' restates what the code does; explain why stopping is necessary (e.g., a new show event may fire before the previous animation completes).",
    "suggestion": "// A new keyboard event may fire before the previous animation completes, so stop it first."
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 33,
    "message": "DOCS-001: Comment 'Start storing animated height values in virtualKeyboardStore' restates the code; explain the intent (approximating iOS spring physics for smooth height transitions).",
    "suggestion": "// Approximate iOS keyboard spring physics so the layout height tracks the native animation."
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 21,
    "message": "STRICT-001: `info.keyboardHeight || 0` is redundant if keyboardHeight is typed as a number; if it can be undefined, prefer an explicit fallback with a comment explaining why.",
    "suggestion": null
  }
]
```

```json
[
  {
    "file": "src/device/virtual-keyboard/safeArea.ts",
    "line": 5,
    "message": "STRICT-004: 'visibility:hidden' is a magic string literal for a CSS property that could be expressed more clearly; more importantly, the entire cssText string is a hardcoded implementation detail that should be documented with an inline comment explaining why each property is necessary (e.g., why `position:fixed;bottom:0` is required to measure the inset).",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/safeArea.ts",
    "line": 5,
    "message": "DOCS-012: The non-obvious technique of creating a throwaway div with `height:env(safe-area-inset-bottom)` and measuring its rendered height via getBoundingClientRect to read a CSS env() value deserves an inline comment explaining why this indirect approach is necessary (CSS env() values cannot be read directly from JS).",
    "suggestion": "  // CSS env() values cannot be read directly from JS; create a temporary element\n  // with height:env(safe-area-inset-bottom) and measure its rendered height instead.\n  div.style.cssText = 'position:fixed;bottom:0;height:env(safe-area-inset-bottom);visibility:hidden'"
  }
]
```

```json
[]
```

```json
[
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 5,
    "message": "ARCH-017: In action-creators/thunks, use getState from thunk arguments rather than importing store directly to avoid circular dependency risks.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 28,
    "message": "STYLE-001: `keyboardIsVisible` is a single-use variable that can be inlined directly into the condition on line 30.",
    "suggestion": "    if (isKeyboardOpen === true && !virtualKeyboardStore.getState().open) {"
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 73,
    "message": "STRICT-004: The magic number `16.666` (approximately one frame at 60fps) should be replaced with a named constant to clarify intent.",
    "suggestion": "const FRAME_DURATION_MS = 16.666\n\nconst onResize = _.throttle(() => {\n  updateSize()\n  updateIOSSafariKeyboardState()\n}, FRAME_DURATION_MS)"
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 37,
    "message": "ARCH-030: The spring animation parameters (stiffness: 3600, damping: 220, mass: 1.2) are duplicated verbatim in both the open and close branches; extract them into a shared constant to eliminate duplication.",
    "suggestion": "const IOS_KEYBOARD_SPRING = { type: 'spring' as const, stiffness: 3600, damping: 220, mass: 1.2 }"
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 85,
    "message": "ARCH-030: `const resizeHost = window.visualViewport || window` is duplicated in both `init` and `destroy`; extract it to a module-level constant or a shared helper.",
    "suggestion": "const resizeHost = window.visualViewport ?? window"
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 71,
    "message": "DOCS-001: The comment `// Ensure viewportStore is updated` restates what the code does; it should explain why `updateSize` must be called before `updateIOSSafariKeyboardState`.",
    "suggestion": "  updateSize() // viewportStore must reflect the new dimensions before reading virtualKeyboardHeight"
  }
]
```

