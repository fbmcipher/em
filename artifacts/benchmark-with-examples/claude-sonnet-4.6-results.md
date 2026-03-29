```json
[
  {
    "file": "src/browser.ts",
    "line": 28,
    "message": "STYLE-001: `Capacitor.getPlatform()` is called twice; inline a single call or extract to a variable to avoid the redundant call.",
    "suggestion": "export const isCapacitor = () => { const platform = Capacitor.getPlatform(); return platform === 'ios' || platform === 'android' }"
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
    "line": 6,
    "message": "ARCH-023: DOM initialization code (document.createElement, document.body.appendChild) is executed at call-time inside a utility function, but this function is called at module scope or in hot paths — the DOM manipulation pattern here bypasses the project's device abstraction layer (ARCH-013) and creates a temporary DOM node on every call, which is a performance concern (PERF-017).",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/safeArea.ts",
    "line": 5,
    "message": "PANDACSS-007: The style is set via direct DOM style assignment (`div.style.cssText`) rather than using the project's CSS abstraction; while this is a measurement utility (not a component), the `visibility:hidden` approach mounts a real DOM node on every call — consider using a cached/singleton element to avoid repeated DOM mutations.",
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
    "file": "src/components/PopupBase.tsx",
    "line": 70,
    "message": "DOCS-001: The comment '// measure on mount' restates what the empty dependency array already communicates; it should explain WHY useLayoutEffect is used instead of useEffect (to avoid a visible flash/layout shift).",
    "suggestion": "    }, [anchorFromBottom]) // useLayoutEffect avoids a visible flash by measuring before the browser paints"
  },
  {
    "file": "src/components/PopupBase.tsx",
    "line": 57,
    "message": "STYLE-001: `height` is initialized to `0` but the previous value was `50`; if this is intentional (e.g., to avoid a layout shift on first render), a comment explaining the change from 50 to 0 is needed per DOCS-005/DOCS-012, but more mechanically the magic literal `0` should use a named constant or at least an inline comment.",
    "suggestion": null
  }
]
```

```json
[
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 48,
    "message": "DOCS-001: Comment restates what the code does ('Only subscribe to scroll events when emulating with position: fixed. mode — in fixed mode, scroll position is irrelevant') rather than explaining why this matters (unnecessary re-renders are the concern, but the phrasing is still mostly descriptive). Also contains a typo: 'fixed. mode' should be 'fixed mode'.",
    "suggestion": "  // Avoid subscribing to scroll events in fixed mode — scroll position is irrelevant and would cause unnecessary re-renders."
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 22,
    "message": "DOCS-001: The old JSDoc comment ('Emulates position fixed on mobile Safari with positon absolute. Returns { position, top, bottom } in absolute mode.') contained a typo ('positon'). The new JSDoc is much improved, but line 22 in the original (now removed) had 'positon' — flagging for awareness that the replacement is correct.",
    "suggestion": null
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 46,
    "message": "ARCH-005: The condition `virtualKeyboard.open && isSafari() && !isCapacitor()` applies the absolute-positioning workaround only on Safari non-Capacitor, which is correct. However, the previous code used `safariKeyboardStore` (which already encapsulated the platform check), and the new code re-implements the platform detection inline. Consider whether this platform-detection logic should be encapsulated in `virtualKeyboardStore` or a helper rather than scattered at the call site.",
    "suggestion": null
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 53,
    "message": "STRICT-010: `let` is used for `top` and `bottom` variables. The project convention is to prefer `const` over `let`.",
    "suggestion": null
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 80,
    "message": "STYLE-003: The two `if (position === 'absolute')` and `if (position === 'fixed')` blocks are mutually exclusive but written as separate if-statements rather than an if/else. This could be combined into a single if/else block to make the mutual exclusivity explicit.",
    "suggestion": "  if (position === 'absolute') {\n    if (fromBottom) {\n      const visibleBottom = Math.min(document.body.scrollHeight, scrollTop + innerHeight - virtualKeyboard.height)\n      top = `calc(${visibleBottom - (height ?? 0) - offset}px - ${token('spacing.safeAreaBottom')})`\n    } else {\n      top = `calc(${scrollTop}px + ${token('spacing.safeAreaTop')} + ${offset}px)`\n    }\n  } else {\n    if (fromBottom) {\n      bottom = `calc(${token('spacing.safeAreaBottom')} + ${virtualKeyboard.height}px + ${offset}px)`\n    } else {\n      top = `calc(${token('spacing.safeAreaTop')} + ${offset}px)`\n    }\n  }"
  }
]
```

```json
[
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 12,
    "message": "DOCS-001: The comment '// fallback' merely restates what the else branch does without explaining why iOSSafariHandler is the fallback or under what conditions this path is taken.",
    "suggestion": "// fall back to Safari handler for non-Capacitor iOS and other platforms"
  },
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 21,
    "message": "DOCS-001: The comment '// fallback' merely restates what the else branch does without explaining why iOSSafariHandler is the fallback or under what conditions this path is taken.",
    "suggestion": "// fall back to Safari handler for non-Capacitor iOS and other platforms"
  },
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 18,
    "message": "STYLE-002: The condition `isCapacitor() && isIOS` is duplicated across both `init` and `destroy`; the shared expression should be factored out to a single constant at module scope.",
    "suggestion": "const isIOSCapacitor = isCapacitor() && isIOS\n\nconst virtualKeyboardHandler = {\n  init: () => {\n    if (isIOSCapacitor) {\n      iOSCapacitorHandler.init()\n    } else {\n      iOSSafariHandler.init()\n    }\n  },\n  destroy: () => {\n    if (isIOSCapacitor) {\n      iOSCapacitorHandler.destroy()\n    } else {\n      iOSSafariHandler.destroy()\n    }\n  },\n}"
  }
]
```

```json
[]
```

Looking at the diff, I'll check for violations against the codebook rules.

The key change is replacing the inline platform-specific keyboard visibility logic with a `virtualKeyboardHandler.init()/destroy()` abstraction. Let me check each rule carefully.

The removed code had a platform guard:
```js
if (isTouch && isAndroidWebView() && window.visualViewport) {
  window.visualViewport.addEventListener('resize', handleKeyboardVisibility)
  handleKeyboardVisibility()
}
```

The new code calls `virtualKeyboardHandler.init()` unconditionally. The question is whether `virtualKeyboardHandler` itself contains the platform guard internally — that's not visible in this diff, but the comment change from a specific description to a generic "Initialize virtual keyboard handlers" suggests the abstraction may handle it. Without seeing the implementation of `virtualKeyboardHandler`, I can't flag ARCH-005 with 90%+ confidence.

The removed `updateSafariKeyboardState()` call also had a platform guard:
```js
if (isTouch && isSafari() && !isIOS) {
  updateSafariKeyboardState()
}
```

This is removed entirely without replacement in the new code. This could be ARCH-007 (dropped existing behavior), but it may be intentional if `virtualKeyboardHandler` now covers Safari too. Again, not enough context to flag with 90%+ confidence.

The comment on line 381 is generic:

```js
// Initialize virtual keyboard handlers
```

This restates what the code does (calls `init()`), rather than explaining *why* or *what* the handler does.

```json
[
  {
    "file": "src/util/initEvents.ts",
    "line": 381,
    "message": "DOCS-001: Comment restates the code ('Initialize virtual keyboard handlers') instead of explaining intent or what the handler manages (e.g., Android WebView visual viewport resize for keyboard detection).",
    "suggestion": "  // Listen for virtual keyboard open/close events to adjust layout (e.g., Android WebView visual viewport resize)"
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
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 17,
    "message": "STRICT-010: Use const instead of let where possible. `controls` is reassigned, so let is technically required here, but the pattern of a mutable closure variable tracking animation state is worth flagging. However, since it is genuinely reassigned, this is acceptable — no violation.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 21,
    "message": "STRICT-001: `|| 0` is a redundant fallback if `keyboardHeight` is typed as a number; verify the type. If it can be undefined/null, this is fine, but if it is always a number, the `|| 0` is redundant noise.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 37,
    "message": "STRICT-004: Magic number literals 3600, 220, and 1.2 are used for spring physics parameters without named constants. These should be extracted to named constants at module scope.",
    "suggestion": "const SPRING_STIFFNESS = 3600\nconst SPRING_DAMPING = 220\nconst SPRING_MASS = 1.2"
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 30,
    "message": "DOCS-001: The comment 'Stop any existing animation to prevent conflicts' restates what the code does (controls?.stop()) rather than explaining why conflicts would occur or what the consequence of not stopping would be.",
    "suggestion": "// Stop any in-progress animation so the new target height takes over immediately without fighting the previous spring"
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 35,
    "message": "ARCH-030: The spring animation configuration (stiffness, damping, mass, type) is duplicated verbatim between the keyboardWillShow (line 35-43) and keyboardWillHide (line 61-69) handlers. Extract into a shared constant to avoid duplication.",
    "suggestion": "const SPRING_CONFIG = {\n  type: 'spring',\n  stiffness: SPRING_STIFFNESS,\n  damping: SPRING_DAMPING,\n  mass: SPRING_MASS,\n} as const"
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
    "message": "ARCH-017: In thunk action-creators, use getState from thunk arguments, not by importing store directly. Here the global app store is imported and called directly instead of using a thunk-provided getState.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 28,
    "message": "STYLE-001: `keyboardIsVisible` is a single-use variable that could be inlined directly at the point of use on line 30.",
    "suggestion": "    if (isKeyboardOpen === true && !virtualKeyboardStore.getState().open) {"
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 73,
    "message": "STRICT-004: The magic number 16.666 should be replaced with a named constant (e.g., representing one frame at 60fps) to clarify intent.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 85,
    "message": "STYLE-002: The expression `window.visualViewport || window` is duplicated on lines 80 and 85; it should be factored out into a shared variable or helper to avoid repetition.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 31,
    "message": "DOCS-001: The comment '// Stop any existing animation to prevent conflicts' (repeated on lines 31 and 47) merely restates what the code does; it should explain why stopping is necessary at this point.",
    "suggestion": null
  }
]
```

