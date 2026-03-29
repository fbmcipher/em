[
  {
    "file": "src/components/PopupBase.tsx",
    "line": 66,
    "message": "STYLE-014 (invert guard conditions) / DOCS-010 (place comments above the line) – invert this guard into an early return and remove the end-of-line comment.",
    "suggestion": "    useLayoutEffect(() => {\n      if (!innerRef.current || !anchorFromBottom) return\n      setHeight(innerRef.current.getBoundingClientRect().height)\n    }, [anchorFromBottom])"
  }
]

[]

[
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 11,
    "message": "ARCH-005 Arch – scope platform-specific fixes conditionally: this fallback initializes the iOS Safari handler on every non-Capacitor platform, so gate it to iOS and otherwise no-op.",
    "suggestion": "    } else if (isIOS) {\n      iOSSafariHandler.init()\n    }"
  },
  {
    "file": "src/device/virtual-keyboard/index.ts",
    "line": 20,
    "message": "ARCH-005 Arch – scope platform-specific fixes conditionally: this fallback destroys the iOS Safari handler on every non-Capacitor platform, so gate it to iOS and otherwise no-op.",
    "suggestion": "    } else if (isIOS) {\n      iOSSafariHandler.destroy()\n    }"
  }
]

[]

[
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 16,
    "message": "DOCS-009 - Use a normal `//` comment here instead of a JSDoc-style block inside the function body.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 21,
    "message": "STRICT-001 - `info.keyboardHeight` is already numeric here, so the `|| 0` fallback is redundant.",
    "suggestion": "const rawHeight = info.keyboardHeight"
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 37,
    "message": "STRICT-004 - Hoist these spring tuning values into a named constant so the magic numbers are documented and reused in both animation blocks.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSCapacitorHandler.ts",
    "line": 47,
    "message": "STRICT-001 - `info.keyboardHeight` is already numeric here, so the `|| 0` fallback is redundant.",
    "suggestion": "const rawHeight = info.keyboardHeight"
  }
]

[
  {
    "file": "package.json",
    "line": 120,
    "message": "DOCS-010 – place comments above the line, not at end-of-line: remove the trailing `# added` from `\"motion\": \"^12.28.1\", # added` so package.json stays valid JSON.",
    "suggestion": "    \"motion\": \"^12.28.1\","
  }
]

[
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 11,
    "message": "STRICT-010 (Strict – do not use let; prefer const): Replace `let controls` with a const ref-style object (for example `controlsRef.current`) to follow the project's no-`let` convention.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 37,
    "message": "STYLE-002 (Style – factor out shared expressions from conditional branches and repeated calculations): The spring options (`type`, `stiffness`, `damping`, and `mass`) are duplicated in both `animate` calls, so hoist them into one shared constant.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 71,
    "message": "DOCS-010 (Docs - place comments above the line, not at end-of-line): Move the `Ensure viewportStore is updated` comment onto its own line above `updateSize()`.",
    "suggestion": null
  },
  {
    "file": "src/device/virtual-keyboard/handlers/iOSSafariHandler.ts",
    "line": 73,
    "message": "STRICT-004 (Strict – use named constants instead of magic number literals): Replace `16.666` with a named module constant such as `FRAME_DURATION_MS` so the resize throttle interval is self-explanatory.",
    "suggestion": null
  }
]

[
  {
    "file": "src/browser.ts",
    "line": 28,
    "message": "STYLE-002 Style – factor out shared expressions from conditional branches and repeated calculations: `Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android'` repeats the same lookup twice.",
    "suggestion": "export const isCapacitor = () => {\n  const platform = Capacitor.getPlatform()\n  return platform === 'ios' || platform === 'android'\n}"
  }
]

[
  {
    "file": "src/util/initEvents.ts",
    "line": 381,
    "message": "DOCS-001 (Docs – comments should explain intent, not restate code): \"// Initialize virtual keyboard handlers\" just restates `virtualKeyboardHandler.init()` and should be removed or replaced with why initialization is needed here.",
    "suggestion": "  virtualKeyboardHandler.init()"
  }
]

[
  {
    "file": "src/@types/VirtualKeyboardState.ts",
    "line": 3,
    "message": "DOCS-001 – Comments like \"True if the virtual keyboard is open.\" and \"The height of the virtual keyboard in pixels.\" just restate the field names and types, so remove them or replace them with a single comment that explains the state semantics.",
    "suggestion": null
  }
]

[
  {
    "file": "src/device/virtual-keyboard/safeArea.ts",
    "line": 12,
    "message": "NAMING-006 (file name must match the primary default export): `export default measureSafeAreaBottom` should live in a file named `measureSafeAreaBottom.ts` instead of `safeArea.ts`.",
    "suggestion": null
  }
]

[]

[
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 22,
    "message": "HYGIENE-006 – fix typos in identifiers, comments, and strings: remove the stray backslash from this JSDoc sentence.",
    "suggestion": null
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 46,
    "message": "STYLE-011 – break the long ternary `virtualKeyboard.open && isSafari() && !isCapacitor() ? 'absolute' : 'fixed'` across multiple lines for readability.",
    "suggestion": "  const position =\n    virtualKeyboard.open && isSafari() && !isCapacitor()\n      ? 'absolute'\n      : 'fixed'"
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 48,
    "message": "HYGIENE-006 – fix the typo in this comment because `position: fixed. mode` is garbled and refers to the wrong mode.",
    "suggestion": null
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 69,
    "message": "REACT-006 – do not query or measure the DOM in the render body; move the `document.body.scrollHeight` read behind a layout effect or another measured source.",
    "suggestion": null
  },
  {
    "file": "src/hooks/usePositionFixed.ts",
    "line": 80,
    "message": "DOCS-007 – comments must accurately describe the current implementation, and this block calculates both `top` and `bottom`, not just `top` values.",
    "suggestion": null
  }
]

[]

[
  {
    "file": "src/@types/VirtualKeyboardHandler.ts",
    "line": 1,
    "message": "DOCS-001 (Docs – comments should explain intent, not restate code): This JSDoc repeats the interface name instead of explaining the shared contract it provides.",
    "suggestion": "/**\n * Defines the lifecycle used to hide platform-specific virtual keyboard event wiring behind a shared API.\n */"
  }
]

