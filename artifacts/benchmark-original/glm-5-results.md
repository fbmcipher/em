```json
[]
```

```json
[
  {
    "file": "src/device/virtual-keyboard/safeArea.ts",
    "line": 12,
    "message": "NAMING-006: File name must match the primary default export. The file is named 'safeArea.ts' but the default export is 'measureSafeAreaBottom'.",
    "suggestion": null
  }
]
```

```json
[
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 48,
    "message": "HYGIENE-006: Comment contains a typo and inaccuracy - 'position: fixed. mode' should be 'absolute mode'. The code uses position: absolute when emulating fixed positioning, and scroll events are only needed in absolute mode.",
    "suggestion": "  // Only subscribe to scroll events in absolute mode — in fixed mode, scroll position\n  // is irrelevant and listening would cause unnecessary re-renders."
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
    "file": "src/browser.ts",
    "line": 28,
    "message": "STYLE-002: The expression `Capacitor.getPlatform()` is called twice. Hoist it to a local variable to avoid the repeated call.",
    "suggestion": "export const isCapacitor = () => {\n  const platform = Capacitor.getPlatform()\n  return platform === 'ios' || platform === 'android'\n}"
  }
]
```

[]

```json
[
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 16,
    "message": "DOCS-009: Use `//` for inline comments inside function bodies, not JSDoc `/** */` which is reserved for function and type declarations.",
    "suggestion": "    // Provides control over the spring animation."
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 36,
    "message": "STYLE-002: Extract the duplicated spring animation options (type, stiffness, damping, mass) to a module-level constant and use spread syntax in both animate calls to avoid repetition between keyboardWillShow and keyboardWillHide handlers.",
    "suggestion": null
  }
]
```

Looking at this diff, I see changes to `yarn.lock` adding a new "motion" package dependency. 

The codebook rule HYGIENE-007 mentions "package-lock.json" specifically, not "yarn.lock". These are different package manager lock files (npm vs yarn). The rule text is:

> "Hygiene - do not commit unintended changes to package-lock.json"

Since this is `yarn.lock` and the changes appear intentional (adding a new dependency), there are no violations of the explicitly listed rules in the codebook.

```json
[]
```

Looking at this diff, I need to check for violations of the codebook rules.

The diff shows a refactoring that:
1. Removes platform-specific keyboard handling code (Safari keyboard state, Android WebView keyboard visibility)
2. Replaces it with a new `virtualKeyboardHandler` module abstraction
3. Removes related imports that are no longer needed

Let me verify this follows the relevant rules:

- **ARCH-005** (platform-specific fixes): The old code properly scoped platform checks with conditionals (`isTouch && isSafari() && !isIOS`, `isTouch && isAndroidWebView()`). The new code moves this into `virtualKeyboardHandler`, which should handle platform detection internally. This appears to be a valid refactoring.

- **ARCH-013** (use device abstraction layer): The refactoring actually improves this - moving direct `window.visualViewport` access into a device abstraction module (`virtual-keyboard`).

- **ARCH-004** (protocol for deleting code): The code isn't being deleted without explanation - it's being moved to a new module.

- **ARCH-023** (DOM listeners in loading phase): Event listeners are registered in the `init` function, not at module scope.

The refactoring appears to be a valid architectural improvement that consolidates platform-specific keyboard handling into a dedicated abstraction. The removed imports (`isAndroidWebView`, `isIOS`, `updateSafariKeyboardState`, `handleKeyboardVisibility`) are no longer needed since their usage has been moved to the new module.

I don't see any violations of the codebook rules in this diff. The changes follow good architectural patterns by:
- Creating a device abstraction for platform-specific keyboard handling
- Properly scoping platform detection (moved into the handler module)
- Maintaining proper initialization/cleanup lifecycle with `init()` and `destroy()` methods

[]

```json
[
  {
    "file": "src/components/PopupBase.tsx",
    "line": 70,
    "message": "DOCS-010: Comments should be placed above the line, not at the end. This comment is redundant with the one above and should be removed.",
    "suggestion": "    }, [anchorFromBottom])"
  }
]
```

```json
[]
```

[]

```json
[
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 38,
    "message": "STYLE-002: The spring animation options (type, stiffness, damping, mass) are duplicated in both the opening (lines 38-41) and closing (lines 54-57) animation branches. Extract them to a shared constant at module scope.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 73,
    "message": "STRICT-004: The throttle duration 16.666 is a magic number. Use a named constant or the expression 1000 / 60 to clarify the intent (60fps frame duration).",
    "suggestion": "}, 1000 / 60)"
  }
]
```

