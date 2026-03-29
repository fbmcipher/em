[]

```json
[
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 73,
    "message": "STRICT-004: Magic number 16.666 for throttle duration should be a named constant or computed value. Consider using 1000 / 60 for 60fps or defining a FRAME_DURATION constant.",
    "suggestion": "}, 1000 / 60)"
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 39,
    "message": "STRICT-002: Spring animation parameters (stiffness, damping, mass) are duplicated at lines 39-41 and 55-57. Extract to a shared constant at module scope and use in both animate calls.",
    "suggestion": null
  }
]
```

[]

[]

[]

```json
[]
```

[]

```json
[
  {
    "file": "src/stores/safariKeyboardStore.ts",
    "line": 1,
    "message": "ARCH-004: This PR deletes a non-trivial file (57 lines) without explanation. Please explain what replaces this functionality and what regression risks the deletion introduces.",
    "suggestion": null
  }
]
```

```json
[
  {
    "file": "src/device/virtual-keyboard/safeArea.ts",
    "line": 1,
    "message": "NAMING-006: File name must match the primary default export. The file is named 'safeArea.ts' but the default export is 'measureSafeAreaBottom'.",
    "suggestion": null
  }
]
```

```json
[
  {
    "file": "src/browser.ts",
    "line": 28,
    "message": "STYLE-002 (Style – factor out shared expressions from conditional branches): Capacitor.getPlatform() is called twice; store the result in a variable and compare once.",
    "suggestion": "export const isCapacitor = () => {\n  const platform = Capacitor.getPlatform()\n  return platform === 'ios' || platform === 'android'\n}"
  }
]
```

```json
[
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 37,
    "message": "STRICT-004: Use named constants instead of magic number literals. The spring animation parameters (stiffness: 3600, damping: 220, mass: 1.2) should be extracted to named constants with documentation explaining why these specific values were chosen.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 63,
    "message": "STYLE-002: Factor out shared expressions from conditional branches and repeated calculations. The spring animation configuration (stiffness, damping, mass) is duplicated from lines 37-39. Extract to a shared constant at module scope.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 35,
    "message": "DOCS-012: Add comments explaining non-obvious values. The spring animation parameters (stiffness: 3600, damping: 220, mass: 1.2) approximate iOS keyboard animation but the rationale for these specific values is not documented.",
    "suggestion": null
  }
]
```

[]

[]

```json
[]
```

```json
[]
```

