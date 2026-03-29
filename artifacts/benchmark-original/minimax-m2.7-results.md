[]

```json
[]
```

```json
[
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 9,
    "message": "isIOS is called as a function (isCapacitor()) but isIOS is not called. Either both are functions (isIOS()) or both are boolean constants. This appears to be an inconsistency that may cause incorrect platform detection.",
    "suggestion": "if (isCapacitor() && isIOS())"
  }
]
```

[]

[]

[]

[]

[  
  {
    "file": "src/device/virtual-keyboard/safeArea.ts",
    "line": 6,
    "message": "Missing try-finally to ensure the temporary div is removed even if getBoundingClientRect throws an exception.",
    "suggestion": "try {\n  document.body.appendChild(div)\n  const value = div.getBoundingClientRect().height\n  return value\n} finally {\n  document.body.removeChild(div)\n}"
  }
]

[
  {
    "file": "src/stores/viewport.ts",
    "line": 42,
    "message": "ARCH-007: The refactor removes the unconditional cache update logic. The old code set virtualKeyboardHeightPortrait/Landscape to 0 whenever currentKeyboardHeight was 0 (e.g., on window resize without keyboard). The new code only updates the cache when keyboard is open, preserving the last-known height.",
    "suggestion": "This appears to be an intentional behavioral change (the comment explains it preserves cache for iOSSafariHandler). If intentional, the comment on line 43-44 should also document that the previous behavior was to overwrite the cache with 0 on resize events without keyboard activity."
  }
]

[]

```json
[
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 36,
    "message": "The spring animation parameters (stiffness, damping, mass) are duplicated identically in two places (lines 36-40 and 62-66). Factor out these shared values to avoid repetition.",
    "suggestion": "const springConfig = { type: 'spring', stiffness: 3600, damping: 220, mass: 1.2 }\n\ncontrols = animate(virtualKeyboardStore.getState().height, height, {\n  ...springConfig,\n  onUpdate: value => {\n    virtualKeyboardStore.update({ height: value })\n  },\n})"
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 62,
    "message": "The spring animation parameters (stiffness, damping, mass) are duplicated identically in two places (lines 36-40 and 62-66). Factor out these shared values to avoid repetition.",
    "suggestion": "controls = animate(virtualKeyboardStore.getState().height, 0, {\n  ...springConfig,\n  onUpdate: value => {\n    virtualKeyboardStore.update({ height: value })\n  },\n})"
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 36,
    "message": "The magic numbers 3600, 220, and 1.2 for spring physics have non-obvious meaning. Add a comment explaining the intent or derive these from project animation constants.",
    "suggestion": null
  }
]
```

```json
[
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 36,
    "message": "The `height` parameter lacks JSDoc documentation. Per DOCS-006, all hook parameters should have JSDoc comments describing their purpose.",
    "suggestion": "  /** The height of the container, used to calculate the bottom offset on mobile safari. Only use with `fromBottom`. */\n  height?: number"
  }
]
```

[]

[]

[]

