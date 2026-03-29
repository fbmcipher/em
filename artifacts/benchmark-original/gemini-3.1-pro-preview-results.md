```json
[
  {
    "file": "src/stores/viewport.ts",
    "line": 59,
    "message": "STRICT-001: Remove redundant fallback expression; the cached variables were just updated to `currentKeyboardHeight` when > 0, so they already hold the correct value.",
    "suggestion": "        isPortrait\n          ? virtualKeyboardHeightPortrait\n          : virtualKeyboardHeightLandscape,"
  }
]
```

```json
[
  {
    "file": "src/components/PopupBase.tsx",
    "line": 65,
    "message": "DOCS-001 (Docs – comments should explain intent, not restate code): This comment merely restates what the adjacent `useLayoutEffect` and `getBoundingClientRect` code does.",
    "suggestion": null
  },
  {
    "file": "src/components/PopupBase.tsx",
    "line": 70,
    "message": "DOCS-010 (Docs - place comments above the line, not at end-of-line): Move the inline comment above the code line.",
    "suggestion": "    // measure on mount\n    }, [anchorFromBottom])"
  }
]
```

```json
[
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 16,
    "message": "DOCS-009 (Docs – use // for inline comments): Do not use JSDoc /** */ comments for inline variable declarations inside function bodies.",
    "suggestion": "    // Provides control over the spring animation."
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 20,
    "message": "DOCS-001 (Docs – comments should explain intent, not restate code): This comment merely restates that the code is getting the raw height from the event.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 26,
    "message": "STYLE-001 (Style – inline single-use variables): `height` is used only once and can be inlined directly into the `animate` call.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 36,
    "message": "STYLE-002 (Style – factor out shared expressions): The spring animation configuration is duplicated here and on line 62. Extract it into a shared constant.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 47,
    "message": "STYLE-001 (Style – inline single-use variables): `rawHeight` is used only once and can be inlined into the `height` calculation.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 60,
    "message": "DOCS-001 (Docs – comments should explain intent, not restate code): This comment merely restates that the code is animating and storing height values.",
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
    "file": "src/@types/VirtualKeyboardState.ts",
    "line": 1,
    "message": "DOCS-001: Comments should explain intent, not restate code. This comment merely restates the interface name.",
    "suggestion": null
  },
  {
    "file": "src/@types/VirtualKeyboardState.ts",
    "line": 3,
    "message": "DOCS-001: Comments should explain intent, not restate code. This comment merely restates the property name.",
    "suggestion": null
  },
  {
    "file": "src/@types/VirtualKeyboardState.ts",
    "line": 5,
    "message": "DOCS-001: Comments should explain intent, not restate code. This comment merely restates the property name.",
    "suggestion": null
  },
  {
    "file": "src/@types/VirtualKeyboardState.ts",
    "line": 7,
    "message": "DOCS-001: Comments should explain intent, not restate code. This comment merely restates the property name.",
    "suggestion": null
  }
]
```

```json
[
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 28,
    "message": "Remove the redundant `=== true` check.",
    "suggestion": "    const keyboardIsVisible = isKeyboardOpen"
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 53,
    "message": "Factor out the shared animation options (type, stiffness, damping, mass, onUpdate) rather than duplicating them across branches.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 73,
    "message": "Replace the hardcoded 16.666 numeric literal with a named constant.",
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
    "file": "src/device/virtual-keyboard/safeArea.ts",
    "line": 12,
    "message": "NAMING-006 (Naming – file name must match the primary default export): The default export `measureSafeAreaBottom` does not match the file name `safeArea.ts`.",
    "suggestion": null
  }
]
```

```json
[
  {
    "file": "src/browser.ts",
    "line": 28,
    "message": "STYLE-002 (Style – factor out shared expressions from conditional branches and repeated calculations): Factor out the repeated call to Capacitor.getPlatform().",
    "suggestion": "export const isCapacitor = () => ['ios', 'android'].includes(Capacitor.getPlatform())"
  }
]
```

```json
[
  {
    "file": "src/util/initEvents.ts",
    "line": 381,
    "message": "DOCS-001: Comments should explain intent, not restate the code.",
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
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 5,
    "message": "DOCS-001 (Docs – comments should explain intent, not restate code): This comment merely restates the variable name and adds no explanatory value.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 7,
    "message": "DOCS-001 (Docs – comments should explain intent, not restate code): This comment merely restates the function name and adds no explanatory value.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 11,
    "message": "ARCH-005 (Arch – scope platform-specific fixes conditionally): The iOS Safari handler is applied unconditionally as a fallback, which will incorrectly run on non-iOS platforms.",
    "suggestion": "    } else if (isIOS) {"
  },
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 16,
    "message": "DOCS-001 (Docs – comments should explain intent, not restate code): This comment merely restates the function name and adds no explanatory value.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 20,
    "message": "ARCH-005 (Arch – scope platform-specific fixes conditionally): The iOS Safari handler is applied unconditionally as a fallback, which will incorrectly run on non-iOS platforms.",
    "suggestion": "    } else if (isIOS) {"
  }
]
```

```json
[
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 22,
    "message": "HYGIENE-006: Remove stray backslash at the end of the comment line.",
    "suggestion": " * opens, leaving elements to scroll out of place. The workaround is to switch to `position: absolute`"
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 46,
    "message": "STYLE-011: Break long ternary expressions across multiple lines.",
    "suggestion": "  const position = virtualKeyboard.open && isSafari() && !isCapacitor()\n    ? 'absolute'\n    : 'fixed'"
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 48,
    "message": "HYGIENE-006: Fix garbled text in comment (\"emulating with position: fixed. mode —\").",
    "suggestion": "  // Only subscribe to scroll events when emulating position: fixed. In fixed mode, scroll position"
  }
]
```

