[
  {
    "file": "src/components/PopupBase.tsx",
    "line": 67,
    "message": "STYLE-014 Style – invert guard conditions and return early rather than nesting the entire body: `if (innerRef.current && anchorFromBottom) {` can become an early return.",
    "suggestion": "      if (!anchorFromBottom || !innerRef.current) return\n      setHeight(innerRef.current.getBoundingClientRect().height)"
  },
  {
    "file": "src/components/PopupBase.tsx",
    "line": 70,
    "message": "DOCS-010 Docs – place comments above the line, not at end-of-line: `}, [anchorFromBottom]) // measure on mount` should move the note above the hook or drop it.",
    "suggestion": "    }, [anchorFromBottom])"
  }
]

[
  {
    "file": "package.json",
    "line": 120,
    "message": "DOCS-010 (place comments above the line, not at end-of-line): remove the trailing comment from `\"motion\": \"^12.28.1\", # added`.",
    "suggestion": "    \"motion\": \"^12.28.1\","
  }
]

[
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 46,
    "message": "STYLE-011 Style – break long ternary expressions across multiple lines: `const position = virtualKeyboard.open && isSafari() && !isCapacitor() ? 'absolute' : 'fixed'` should use the project's multiline ternary format.",
    "suggestion": "  const position = virtualKeyboard.open && isSafari() && !isCapacitor()\n    ? 'absolute'\n    : 'fixed'"
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 48,
    "message": "HYGIENE-006 Hygiene - fix typos in identifiers, comments, and strings: `emulating with position: fixed. mode` is garbled and should describe the absolute-position fallback clearly.",
    "suggestion": "  // Only subscribe to scroll events when emulating fixed positioning with `position: absolute`.\n  // In fixed mode, scroll position is irrelevant and listening would cause unnecessary re-renders."
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 69,
    "message": "REACT-006 React – do not query or measure the DOM in the render body: `document.body.scrollHeight` is a layout measurement inside the hook body, so cache it in an effect/store and read that value here instead.",
    "suggestion": null
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 72,
    "message": "DOCS-001 Docs – comments should explain intent, not restate code: `// fromTop` here (and the same comment below) adds no context and should be removed.",
    "suggestion": null
  }
]

[]

[]

[]

[
  {
    "file": "src/stores/viewport.ts",
    "line": 45,
    "message": "STYLE-002 (factor out shared expressions): `currentKeyboardHeight > 0` is repeated in both `if (currentKeyboardHeight > 0)` and the `virtualKeyboardHeight` ternary, so hoist it into a single `isKeyboardOpen` boolean.",
    "suggestion": "    const isKeyboardOpen = currentKeyboardHeight > 0\n\n    if (isKeyboardOpen) {\n      if (isPortrait) {\n        virtualKeyboardHeightPortrait = currentKeyboardHeight\n      } else {\n        virtualKeyboardHeightLandscape = currentKeyboardHeight\n      }\n    }\n\n    viewportStore.update({\n      innerWidth: window.innerWidth,\n      innerHeight: window.innerHeight,\n      virtualKeyboardHeight: isKeyboardOpen\n        ? currentKeyboardHeight\n        : isPortrait\n          ? virtualKeyboardHeightPortrait\n          : virtualKeyboardHeightLandscape,\n    })"
  }
]

[
  {
    "file": "src/@types/VirtualKeyboardState.ts",
    "line": 3,
    "message": "DOCS-001 – comments should explain intent, not restate code: `/** True if the virtual keyboard is open. */` just repeats `open: boolean`, so remove it or document a non-obvious semantic instead.",
    "suggestion": null
  },
  {
    "file": "src/@types/VirtualKeyboardState.ts",
    "line": 7,
    "message": "DOCS-001 – comments should explain intent, not restate code: `/** The source of the virtual keyboard state. */` only repeats the `source` property name instead of explaining what the source values mean.",
    "suggestion": null
  }
]

[
  {
    "file": "src/util/initEvents.ts",
    "line": 381,
    "message": "DOCS-001 (Docs – comments should explain intent, not restate code): `// Initialize virtual keyboard handlers` just repeats the next line, so remove it or explain why initialization is needed here.",
    "suggestion": "  virtualKeyboardHandler.init()"
  }
]

[
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 16,
    "message": "DOCS-009 use // for inline comments: `/** Provides control over the spring animation. */` should be a normal line comment instead of JSDoc.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 21,
    "message": "STRICT-001 redundant expressions: `const rawHeight = info.keyboardHeight || 0` should not use `|| 0` because `keyboardHeight` is already numeric.",
    "suggestion": "      const rawHeight = info.keyboardHeight"
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 37,
    "message": "DOCS-012 explain non-obvious values: the spring constants `3600`, `220`, and `1.2` should be documented or extracted into a named constant so their purpose is clear.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 47,
    "message": "STRICT-001 redundant expressions: `const rawHeight = info.keyboardHeight || 0` should not use `|| 0` because `keyboardHeight` is already numeric.",
    "suggestion": "      const rawHeight = info.keyboardHeight"
  }
]

[]

[
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 10,
    "message": "DOCS-009 (Docs – use // for inline comments; reserve /** */ for function and type declarations): `/** Provides control over the spring animation. */` should use `//` because it documents a variable, not a function or type.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 37,
    "message": "STYLE-002 (Style – factor out shared expressions from conditional branches and repeated calculations): the shared spring config in `type: 'spring'`, `stiffness: 3600`, `damping: 220`, and `mass: 1.2` is duplicated in both `animate(...)` calls, so extract it once and reuse it.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 71,
    "message": "DOCS-010 (Docs - place comments above the line, not at end-of-line): move `// Ensure viewportStore is updated` above `updateSize()` instead of keeping it inline.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 73,
    "message": "STRICT-004 (Strict – use named constants instead of magic number literals): `16.666` should be replaced with a named frame-interval constant so the throttle timing is self-explanatory.",
    "suggestion": null
  }
]

[
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 11,
    "message": "ARCH-005 (Arch – scope platform-specific fixes conditionally): `else { iOSSafariHandler.init() }` applies an iOS-specific handler on every non-Capacitor platform, so guard the Safari fallback with `isIOS`.",
    "suggestion": "    } else if (isIOS) {\n      iOSSafariHandler.init()\n    }"
  },
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 20,
    "message": "ARCH-005 (Arch – scope platform-specific fixes conditionally): `else { iOSSafariHandler.destroy() }` should also be limited to iOS Safari instead of running on all non-Capacitor platforms.",
    "suggestion": "    } else if (isIOS) {\n      iOSSafariHandler.destroy()\n    }"
  }
]

[
  {
    "file": "src/browser.ts",
    "line": 28,
    "message": "STYLE-002 (Style – factor out shared expressions from conditional branches and repeated calculations): `Capacitor.getPlatform()` is called twice here, so read it once before comparing the platform.",
    "suggestion": "export const isCapacitor = () => {\n  const platform = Capacitor.getPlatform()\n  return platform === 'ios' || platform === 'android'\n}"
  }
]

[
  {
    "file": "src/device/virtual-keyboard/safeArea.ts",
    "line": 12,
    "message": "NAMING-006 (file name must match the primary default export): `export default measureSafeAreaBottom` means this file should be renamed to `measureSafeAreaBottom.ts` so the sole export matches the filename.",
    "suggestion": null
  }
]

