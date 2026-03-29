```json
[]
```

```json
[
  {
    "file": "src/device/virtual-keyboard/safeArea.ts",
    "line": 12,
    "message": "NAMING-006 Naming – file name must match the primary default export: The default export `measureSafeAreaBottom` does not match the filename `safeArea.ts`.",
    "suggestion": null
  }
]
```

```json
[
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 60,
    "message": "DOCS-001: This comment restates the code's calculation step-by-step instead of explaining the intent.",
    "suggestion": null
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 69,
    "message": "REACT-006: Do not query the DOM (document.body.scrollHeight) in the render body; use useLayoutEffect or a store value to avoid layout thrashing.",
    "suggestion": null
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 80,
    "message": "HYGIENE-006: Fix typo in comment (calculates both top and bottom, not just top).",
    "suggestion": "  // Calculate `top` and `bottom` values for normal `position: fixed`."
  }
]
```

```json
[
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 20,
    "message": "Inline this single-use variable directly into the `targetHeight` calculation (STYLE-001).",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 27,
    "message": "Inline this single-use variable directly at the point of use (STYLE-001).",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 28,
    "message": "Remove the redundant `=== true` check (STRICT-001).",
    "suggestion": "    const keyboardIsVisible = isKeyboardOpen"
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 37,
    "message": "Factor out the shared spring animation configuration duplicated across these conditional branches (STYLE-002).",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 39,
    "message": "Replace hardcoded numeric literals for spring physics with named constants (STRICT-004).",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 73,
    "message": "Replace the hardcoded numeric literal 16.666 with a named constant (STRICT-004).",
    "suggestion": null
  }
]
```

```json
[
  {
    "file": "src/components/PopupBase.tsx",
    "line": 65,
    "message": "DOCS-001: Inline comments must explain intent, not restate what the code does.",
    "suggestion": null
  },
  {
    "file": "src/components/PopupBase.tsx",
    "line": 67,
    "message": "STYLE-014: Invert the guard condition and return early rather than wrapping the entire effect body in an if-block.",
    "suggestion": null
  },
  {
    "file": "src/components/PopupBase.tsx",
    "line": 70,
    "message": "DOCS-010: Place comments above the code line rather than at the end of the line.",
    "suggestion": "    // measure on mount\n    }, [anchorFromBottom])"
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
[]
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
    "file": "src/util/initEvents.ts",
    "line": 381,
    "message": "This comment merely restates the code below it; comments should explain intent, not what the code does (DOCS-001).",
    "suggestion": null
  }
]
```

```json
[
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 16,
    "message": "DOCS-009: Use `//` for inline comments; reserve `/** */` for function and type declarations.",
    "suggestion": "    // Provides control over the spring animation."
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 36,
    "message": "STYLE-012: Declare static constants at module scope. Extract the spring configuration object to avoid recreating it and duplicating it.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 47,
    "message": "STYLE-001: Inline single-use variables (`rawHeight`); do not create unnecessary intermediates.",
    "suggestion": null
  }
]
```

```json
[
  {
    "file": "src/browser.ts",
    "line": 28,
    "message": "STYLE-002: Factor out the repeated `Capacitor.getPlatform()` call.",
    "suggestion": "export const isCapacitor = () => ['ios', 'android'].includes(Capacitor.getPlatform())"
  }
]
```

```json
[
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 6,
    "message": "STYLE-002: Factor out the repeated platform check by selecting the handler once at module scope (e.g., `const virtualKeyboardHandler = isCapacitor() && isIOS ? iOSCapacitorHandler : iOSSafariHandler`).",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 7,
    "message": "DOCS-001: This comment merely restates the method name and adds no value.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 16,
    "message": "DOCS-001: This comment merely restates the method name and adds no value.",
    "suggestion": null
  }
]
```

```json
[]
```

