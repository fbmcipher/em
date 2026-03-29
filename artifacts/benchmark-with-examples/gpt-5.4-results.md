[
  {
    "file": "src/browser.ts",
    "line": 28,
    "message": "HYGIENE-005 remove the unused isCapacitor export if it is not referenced outside this module, since unused code should not be committed.",
    "suggestion": null
  }
]

[]

[
  {
    "file": "src/util/initEvents.ts",
    "line": 382,
    "message": "ARCH-005 Arch – scope platform-specific fixes conditionally: initializing the virtual keyboard handler unconditionally may apply platform-specific behavior on unsupported platforms.",
    "suggestion": "  if (isTouch && window.visualViewport) {\n    virtualKeyboardHandler.init()\n  }"
  },
  {
    "file": "src/util/initEvents.ts",
    "line": 408,
    "message": "ARCH-005 Arch – scope platform-specific fixes conditionally: destroying the virtual keyboard handler should use the same platform guard as initialization.",
    "suggestion": "    if (isTouch && window.visualViewport) {\n      virtualKeyboardHandler.destroy()\n    }"
  }
]

[
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 16,
    "message": "DOCS-009 (Docs – use // for inline comments; reserve /** */ for function and type declarations): Change this inline JSDoc-style comment to a normal comment.",
    "suggestion": "    // Provides control over the spring animation."
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 27,
    "message": "ARCH-007 (Arch – preserve all existing behavior when refactoring): The normalized `height` is computed above, but `viewportStore` is updated with `rawHeight`, which likely changes behavior from the documented normalization.",
    "suggestion": "      viewportStore.update({ virtualKeyboardHeight: height })"
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 37,
    "message": "STRICT-004 (Strict – use named constants instead of magic number literals): Replace the spring tuning magic number with a named constant so its purpose is clear and reusable.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 38,
    "message": "STRICT-004 (Strict – use named constants instead of magic number literals): Replace the spring tuning magic number with a named constant so its purpose is clear and reusable.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 39,
    "message": "STRICT-004 (Strict – use named constants instead of magic number literals): Replace the spring tuning magic number with a named constant so its purpose is clear and reusable.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 63,
    "message": "STRICT-004 (Strict – use named constants instead of magic number literals): Replace the spring tuning magic number with a named constant so its purpose is clear and reusable.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 64,
    "message": "STRICT-004 (Strict – use named constants instead of magic number literals): Replace the spring tuning magic number with a named constant so its purpose is clear and reusable.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 65,
    "message": "STRICT-004 (Strict – use named constants instead of magic number literals): Replace the spring tuning magic number with a named constant so its purpose is clear and reusable.",
    "suggestion": null
  }
]

[
  {
    "file": "src/stores/viewport.ts",
    "line": 42,
    "message": "DOCS-002: Shorten this multi-line inline comment to a concise explanation of the non-obvious caching behavior.",
    "suggestion": "// Preserve the last nonzero keyboard height so iOSSafariHandler can use it during the opening animation."
  }
]

[
  {
    "file": "package.json",
    "line": 120,
    "message": "HYGIENE-001 remove the debug-style inline annotation because JSON does not support comments and this will break parsing.",
    "suggestion": "    \"motion\": \"^12.28.1\","
  }
]

[
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 12,
    "message": "DOCS-001: Replace this comment with a more specific explanation or remove it since \"fallback\" just restates the else branch.",
    "suggestion": "      iOSSafariHandler.init()"
  },
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 21,
    "message": "DOCS-001: Replace this comment with a more specific explanation or remove it since \"fallback\" just restates the else branch.",
    "suggestion": "      iOSSafariHandler.destroy()"
  }
]

[
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 22,
    "message": "DOCS-009: Use regular // comments for inline notes inside the JSDoc body instead of adding a stray escaped character that makes the comment inaccurate.",
    "suggestion": "/**\n * Safe-area-aware, keyboard-aware and iOS-safe fixed positioning for mobile.\n *\n * Returns `{ position, top, bottom }` styles that keep an element pinned to a viewport edge, while offsetting the\n * position of the element to ensure it remains visible when the keyboard is open and avoids safe areas.\n *\n * The hook handles three concerns:\n *\n * 1. Safe-area insets: Offsets elements from the notch/status bar (top) and home indicator\n * (bottom) on rounded screens via `spacing.safeAreaTop` / `spacing.safeAreaBottom` tokens.\n *\n * 2. Keyboard avoidance: For bottom-anchored elements, offsets y position by the virtual keyboard\n * height – ensuring they remain visible even when the keyboard is open.\n *\n * 3. Broken `position: fixed` on iOS Safari: In MobileSafari, position: fixed is disabled when the keyboard\n * opens, leaving elements to scroll out of place. The workaround is to switch to `position: absolute`\n * and recompute `top` from the current scroll position on every scroll frame, effectively re-implementing\n * fixed positioning.\n */"
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 48,
    "message": "DOCS-001: This comment restates the code and includes a typo, so either remove it or rewrite it to explain the non-obvious reason for the subscription behavior.",
    "suggestion": "  // Subscribe to scroll only while emulating fixed positioning with absolute positioning on iOS Safari."
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 69,
    "message": "ARCH-013: Avoid direct document access here and use the project's browser abstraction layer if available so this stays cross-platform-safe.",
    "suggestion": null
  }
]

[
  {
    "file": "src/components/PopupBase.tsx",
    "line": 65,
    "message": "DOCS-009: Use a regular inline comment here instead of JSDoc block syntax inside the component body.",
    "suggestion": "    // measure the height of the popup after it has been rendered"
  },
  {
    "file": "src/components/PopupBase.tsx",
    "line": 70,
    "message": "DOCS-010: Move the end-of-line comment above the effect so the diff stays cleaner and the comment is easier to maintain.",
    "suggestion": "    // measure on mount\n    }, [anchorFromBottom])"
  }
]

[]

[]

[]

[]

[
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 5,
    "message": "ARCH-017 and REACT-007: Avoid importing the global store here and derive the needed state from the existing viewport/keyboard flow instead of calling store.getState directly.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 17,
    "message": "TEST-006 and PERF-002: Avoid setTimeout for UI synchronization here and use requestAnimationFrame or another event-driven approach to wait for the post-selection layout update.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 39,
    "message": "STRICT-004: Replace this hardcoded animation constant with a named constant or configured duration/animation value so the spring tuning is documented and reusable.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 40,
    "message": "STRICT-004: Replace this hardcoded animation constant with a named constant or configured duration/animation value so the spring tuning is documented and reusable.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 41,
    "message": "STRICT-004: Replace this hardcoded animation constant with a named constant or configured duration/animation value so the spring tuning is documented and reusable.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 55,
    "message": "STRICT-004: Replace this hardcoded animation constant with a named constant or configured duration/animation value so the spring tuning is documented and reusable.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 56,
    "message": "STRICT-004: Replace this hardcoded animation constant with a named constant or configured duration/animation value so the spring tuning is documented and reusable.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 57,
    "message": "STRICT-004: Replace this hardcoded animation constant with a named constant or configured duration/animation value so the spring tuning is documented and reusable.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 73,
    "message": "STRICT-004: Replace this hardcoded throttle interval with a named constant so its relationship to frame timing is explicit.",
    "suggestion": null
  }
]

[
  {
    "file": "src/device/virtual-keyboard/safeArea.ts",
    "line": 1,
    "message": "DOCS-008 prefer a descriptive block JSDoc comment over inline @style summary so the function purpose is documented consistently.",
    "suggestion": "/**\n * Measures the safe-area-bottom inset in pixels.\n * Returns 0 when the DOM is unavailable or the inset cannot be measured.\n */"
  }
]

