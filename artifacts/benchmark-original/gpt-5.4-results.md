[
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 12,
    "message": "DOCS-001: The comment restates the code without explaining intent, so remove it.",
    "suggestion": "      iOSSafariHandler.init()"
  },
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 21,
    "message": "DOCS-001: The comment restates the code without explaining intent, so remove it.",
    "suggestion": "      iOSSafariHandler.destroy()"
  },
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 6,
    "message": "ARCH-006: Export the controller directly as the module default instead of creating a separate same-file binding used only for export.",
    "suggestion": "export default {\n  /** Initializes the appropriate virtual keyboard handler based on the platform. */\n  init: () => {\n    if (isCapacitor() && isIOS) {\n      iOSCapacitorHandler.init()\n    } else {\n      iOSSafariHandler.init()\n    }\n  },\n  /** Destroys the appropriate virtual keyboard handler based on the platform. */\n  destroy: () => {\n    if (isCapacitor() && isIOS) {\n      iOSCapacitorHandler.destroy()\n    } else {\n      iOSSafariHandler.destroy()\n    }\n  },\n}"
  }
]

[
  {
    "file": "src/util/initEvents.ts",
    "line": 382,
    "message": "ARCH-005 Arch – scope platform-specific fixes conditionally: initializing the virtual keyboard handler unconditionally may apply platform-specific behavior outside the affected platforms.",
    "suggestion": "  // Initialize virtual keyboard handlers\n  if (isTouch && isSafari()) {\n    virtualKeyboardHandler.init()\n  }"
  },
  {
    "file": "src/util/initEvents.ts",
    "line": 408,
    "message": "ARCH-005 Arch – scope platform-specific fixes conditionally: destroying the virtual keyboard handler should use the same platform guard as initialization.",
    "suggestion": "    if (isTouch && isSafari()) {\n      virtualKeyboardHandler.destroy()\n    }"
  }
]

[
  {
    "file": "src/browser.ts",
    "line": 26,
    "message": "HYGIENE-001 remove the leftover debug artifact \"# added\" from the source file.",
    "suggestion": ""
  }
]

[
  {
    "file": "package.json",
    "line": 120,
    "message": "HYGIENE-001 remove the debug-style inline annotation because JSON does not support comments and this artifact will break parsing.",
    "suggestion": "    \"motion\": \"^12.28.1\","
  }
]

[
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 17,
    "message": "PERF-002: Use requestAnimationFrame instead of setTimeout for UI synchronization with selection and viewport updates.",
    "suggestion": "  requestAnimationFrame(() => {"
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 73,
    "message": "STRICT-004: Replace the magic number throttle interval with a named constant so the frame-rate intent is explicit.",
    "suggestion": "}, FRAME_DURATION_MS)"
  }
]

[]

[
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 16,
    "message": "DOCS-009: Use // for inline annotations inside function bodies instead of a JSDoc block comment.",
    "suggestion": "    // Provides control over the spring animation.\n    let controls: AnimationPlaybackControls | null = null"
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 27,
    "message": "ARCH-007: The normalized height is computed above, but viewportStore is updated with rawHeight, which drops the intended safe-area normalization behavior described here.",
    "suggestion": "      viewportStore.update({ virtualKeyboardHeight: height })"
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 37,
    "message": "STRICT-004: Replace the hardcoded spring stiffness with a named constant or shared configuration value instead of a magic number.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 38,
    "message": "STRICT-004: Replace the hardcoded spring damping with a named constant or shared configuration value instead of a magic number.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 39,
    "message": "STRICT-004: Replace the hardcoded spring mass with a named constant or shared configuration value instead of a magic number.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 63,
    "message": "STRICT-004: Replace the hardcoded spring stiffness with a named constant or shared configuration value instead of a magic number.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 64,
    "message": "STRICT-004: Replace the hardcoded spring damping with a named constant or shared configuration value instead of a magic number.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 65,
    "message": "STRICT-004: Replace the hardcoded spring mass with a named constant or shared configuration value instead of a magic number.",
    "suggestion": null
  }
]

[
  {
    "file": "yarn.lock",
    "line": 11366,
    "message": "HYGIENE-007: Revert unintended lockfile changes unless this dependency addition is required by a corresponding package manifest change.",
    "suggestion": null
  }
]

[
  {
    "file": "src/components/PopupBase.tsx",
    "line": 65,
    "message": "DOCS-001 Docs – comments should explain intent, not restate code; this comment just repeats that the effect measures the popup height after render.",
    "suggestion": "    // use layout effect so the measured height is available before paint when anchoring from the bottom"
  },
  {
    "file": "src/components/PopupBase.tsx",
    "line": 70,
    "message": "DOCS-010 Docs - place comments above the line, not at end-of-line; move the inline comment to its own line above the effect dependency line or remove it.",
    "suggestion": "    }, [anchorFromBottom])"
  }
]

[]

[
  {
    "file": "src/device/virtual-keyboard/safeArea.ts",
    "line": 1,
    "message": "DOCS-006 add JSDoc to the exported function using a block comment that describes its behavior instead of an inline one-liner.",
    "suggestion": "/**\n * Measures the current safe-area bottom inset in pixels.\n * Returns 0 when the DOM is unavailable or the inset cannot be measured.\n */\nconst measureSafeAreaBottom = (): number => {"
  },
  {
    "file": "src/device/virtual-keyboard/safeArea.ts",
    "line": 3,
    "message": "ARCH-013 use the project's device/browser abstraction rather than accessing document directly in this utility.",
    "suggestion": null
  }
]

[
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 48,
    "message": "DOCS-001 comments should explain intent, not restate the code, so remove this line-by-line explanation of the disabled flag.",
    "suggestion": "  const scrollTop = useScrollTop({ disabled: position === 'fixed' })"
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 55,
    "message": "DOCS-001 comments should explain intent, not restate the code, so remove this heading comment above the absolute-position branch.",
    "suggestion": "  if (position === 'absolute') {"
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 72,
    "message": "DOCS-001 comments should explain intent, not restate the code, so remove this redundant branch label comment.",
    "suggestion": "    } else {"
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 80,
    "message": "DOCS-001 comments should explain intent, not restate the code, so remove this heading comment above the fixed-position branch.",
    "suggestion": "  if (position === 'fixed') {"
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 88,
    "message": "DOCS-001 comments should explain intent, not restate the code, so remove this redundant branch label comment.",
    "suggestion": "    } else {"
  }
]

[]

[]

[
  {
    "file": "src/stores/viewport.ts",
    "line": 42,
    "message": "DOCS-002 comments should be concise and targeted, so shorten this multi-line explanation to the essential intent.",
    "suggestion": "// Preserve the last nonzero keyboard height so iOSSafariHandler can animate reopening."
  },
  {
    "file": "src/stores/viewport.ts",
    "line": 45,
    "message": "STYLE-003 combine the nested if-statements into a single condition to reduce unnecessary nesting.",
    "suggestion": "    if (currentKeyboardHeight > 0 && isPortrait) {\n      virtualKeyboardHeightPortrait = currentKeyboardHeight\n    } else if (currentKeyboardHeight > 0) {\n      virtualKeyboardHeightLandscape = currentKeyboardHeight\n    }"
  },
  {
    "file": "src/stores/viewport.ts",
    "line": 56,
    "message": "DOCS-002 this explanatory comment is longer than necessary and should be reduced to a short intent-focused note.",
    "suggestion": "      // Fall back to the cached keyboard height when closed."
  }
]

