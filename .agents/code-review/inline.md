You are a code review agent for a project called em. Your task is to catch mechanical, rule-based issues so the lead reviewer can focus on higher-level judgment call feedback.

Read the attached codebook, which contains coding derived from 9 years of review history on this project. Each rule has an ID (e.g. HYGIENE-001), a label, and a description of the violation pattern.

Then, review the attached PR diff. For each violation you find:
1. Cite the rule ID and label.
2. Quote the specific line(s) in the diff.
3. Suggest a fix – a code snippet if straightforward, or a high-level description if the change is more involved.

IMPORTANT:
- Only flag violations of rules explicitly listed in the codebook. Do not invent rules or identify issues that aren't listed in the codebook.
- Only flag when you have high confidence (90%+). A false positive is worse than a miss.
- Do not leave general commentary – only actionable rule violations.

---

# em Code Review Codebook

210 rules derived from classifying 4,074 review comments by @raineorshine
across ~9 years of pull requests on the **em** project.

Rules are organized by domain. Within each section, rules are sorted by
frequency (most commonly flagged first). The hit count reflects how many
review comments matched each rule in the corpus.

## Table of Contents

- [Architecture](#arch) (32 rules, 572 hits)
- [Code Style](#style) (19 rules, 340 hits)
- [Documentation & Comments](#docs) (11 rules, 291 hits)
- [Testing](#test) (29 rules, 272 hits)
- [Naming](#naming) (7 rules, 260 hits)
- [Code Hygiene](#hygiene) (8 rules, 194 hits)
- [App (em Domain Model)](#app) (23 rules, 151 hits)
- [Code Strictness](#strict) (14 rules, 150 hits)
- [Performance](#perf) (15 rules, 133 hits)
- [TypeScript](#ts) (11 rules, 100 hits)
- [PandaCSS & Styling](#pandacss) (11 rules, 95 hits)
- [React](#react) (17 rules, 70 hits)
- [Redux](#redux) (13 rules, 70 hits)

---

## Architecture
<a id="arch"></a>

*32 rules | 572 total hits*

### ARCH-007
**Arch – preserve all existing behavior when refactoring** (138 hits)

Refactors must not silently drop existing logic, edge-case handling, or guard conditions. Every behavioral branch in the original code must be accounted for in the rewritten version. Flag refactored code that removes guards, conditions, or edge-case handling present in the original without explicit justification.

### ARCH-010
**Arch – pass only the minimum data across boundaries; derive late** (53 hits)

Pass only the minimum data across module and component boundaries and derive other values as late as possible. Do not pass pre-computed or redundant data when the receiver can derive it from what it already has. Flag arguments or props that pass derived values when the source data is already available to the callee.

### ARCH-009
**Arch – move implementation details into the component or module that owns them** (52 hits)

Implementation details (e.g., internal calculations, magic numbers, configuration) should live in the component or module that uses them, not be defined externally. Flag implementation details that are defined far from their single point of use.

### ARCH-001
**Arch – place utility functions in their own file under util/** (49 hits)

Utility functions that are not specific to the module where they were written should be placed in their own file under the util/ directory. Do not collocate generic helper functions in unrelated modules. Flag utility functions added to files where they do not belong topically.

### ARCH-014
**Arch – do not add redundant guards when the default flow handles the null case** (48 hits)

Do not add null/undefined checks before operations that already handle the null case correctly (e.g., iterating an empty array, querying with no results). Redundant guards add noise without changing behavior. Flag null checks that guard operations whose empty/null path already produces the correct result.

### ARCH-016
**Arch – do not add abstractions or parameters for hypothetical future cases** (35 hits)

Do not add abstraction layers, helper functions, optional parameters, or polymorphic APIs to handle cases that do not yet exist. Build for the current requirements only. Flag new parameters, branches, or abstractions that serve no current use case.

### ARCH-005
**Arch – scope platform-specific fixes conditionally** (33 hits)

Platform-specific fixes must be wrapped in platform-detection conditionals so they do not affect other platforms. An unconditional fix for one platform can regress another. Flag platform-specific workarounds that are applied unconditionally.

### ARCH-002
**Arch – keep generic utilities free of feature-specific special cases** (29 hits)

Generic utility functions must not contain knowledge of specific features, attribute types, or domain-specific branches. If feature-specific behavior is needed, extract it into a dedicated reducer, action-creator, or wrapper. Flag utility functions that contain if/switch branches for specific feature cases.

### ARCH-004
**Arch – follow a protocol when deleting existing code** (22 hits)

When removing existing code, explain its origin, what replaces it, and what regression risk the deletion introduces. Do not silently remove code. Flag PRs that delete non-trivial code without explaining why it is safe to remove.

### ARCH-006
**Arch – single default export per module; no redundant named re-exports** (21 hits)

Each module should have a single default export. Do not add a named export that re-exports the same value as the default. Flag modules that export both a named and a default export for the same value.

### ARCH-003
**Arch – group optional parameters into an Options object** (17 hits)

When a function has optional parameters beyond its required ones, group them into a single Options object rather than adding standalone arguments. Flag functions with more than one optional parameter that are not grouped into an options bag.

### ARCH-030
**Arch - eliminate code duplication by extracting shared abstractions** (14 hits)

Eliminate code duplication by extracting shared logic into a shared component, helper, or abstraction (DRY principle).

### ARCH-008
**Arch – do not add try-catch inside utility/helper functions; let errors propagate** (12 hits)

Utility and helper functions should not catch errors internally. Let errors propagate to the caller, which has the context to handle them appropriately. Flag try-catch blocks inside utility functions that swallow or re-throw errors without adding value.

### ARCH-013
**Arch – use the project's device abstraction layer instead of direct browser APIs** (9 hits)

Access browser-specific APIs (window.getSelection, window.scrollTo, etc.) through the project's platform-abstracted modules (e.g., selection.ts, scrollTo.ts). Direct browser API calls break cross-platform compatibility. Flag direct window/document API calls where an abstraction exists.

### ARCH-012
**Arch – functions should return a single cohesive value, not arbitrary bundles** (7 hits)

Functions should return a single meaningful value. Do not return plain objects that group unrelated values just because they happen to be computed together. If there is no single concept for the return value, split into separate functions. Flag functions that return ad-hoc objects bundling unrelated results.

### ARCH-015
**Arch – do not export symbols that are only used within the same module** (6 hits)

If a function, constant, or type is only used within its own module, remove the export keyword. Unnecessary exports widen the public API surface and make refactoring harder. Flag exported symbols with no external consumers.

### ARCH-017
**Arch – use getState from thunk arguments, not by importing store directly** (5 hits)

In thunk action-creators, use the getState function provided as the second argument rather than importing store and calling store.getState(). Importing store creates circular dependency risks. Flag store imports in action-creator files.

### ARCH-011
**Arch – store sensitive or environment-specific values in environment variables** (4 hits)

API endpoints, keys, and environment-specific configuration must not be hardcoded in source files. Use environment variables or gitignored config files. Flag hardcoded URLs, API keys, or environment-specific strings in committed source code.

### ARCH-034
**Arch - handle pure state-to-state transitions in reducers** (4 hits)

State-to-state logic (e.g. updating showCommandMenu when cursor changes) belongs in a reducer, not in a component hook or action-creator side effect.

### ARCH-036
**Arch - dispatch error action-creator instead of bare try-catch or console** (4 hits)

Use dispatch(error(...)) from action-creators rather than swallowing errors or logging directly.

### ARCH-028
**Arch - reuse existing library helpers instead of reimplementing** (3 hits)

Reuse existing library functions (e.g., hexToRgb/rgbToHex from @mui/material) instead of reimplementing them in the project.

### ARCH-027
**Arch - define shared constants in constants.ts** (2 hits)

Extract shared constants (e.g., icon scaling factors) into constants.ts rather than repeating them per file.

### ARCH-029
**Arch - place state-mutating logic in reducers, not in selectors** (2 hits)

Selectors must be pure read operations; state-mutating logic belongs in reducers.

### ARCH-019
**Arch – keep web and native platform variants in sync** (1 hits)

When modifying shared logic (e.g., switching from mapStateToProps to useSelector), apply the same change to both the web and native variants of the component. Unnecessary divergence between web and native implementations increases maintenance burden. Flag PRs that change architectural patterns in one platform variant but not the other.

### ARCH-022
**Arch – duplicate config values to avoid tight cross-module coupling** (1 hits)

When two modules need similar configuration values (e.g., shortcut key definitions), duplicate the values rather than importing one module's config into another. Sharing config by reference creates tight coupling between otherwise independent modules. Flag config imports between unrelated modules where duplication would be more appropriate.

### ARCH-026
**Arch – minimize cross-module DOM coupling; prefer encapsulated data flow** (1 hits)

Modules should not directly read or manipulate DOM elements owned by other modules. Cross-module DOM coupling creates fragile dependencies on DOM structure. Instead, pass data through typed props, Redux state, or store subscriptions. Flag cases where one module accesses DOM nodes created or managed by a different module.

### ARCH-018
**Arch – do not await fire-and-forget background operations**

When an operation is intentionally fire-and-forget (it should run in the background without blocking the caller), do not add await before it. Adding await changes the semantics by making the caller wait for completion. Flag await calls on operations that are designed to run asynchronously in the background.

### ARCH-020
**Arch – fix conditions at the source, not the call site**

When a derived value needs special-case handling, fix the logic that produces the value rather than adding an override at the point of use. Overriding at the call site masks bugs in the upstream logic and creates fragile workarounds. Flag code that overrides or ignores a computed value at the point of use rather than correcting its derivation.

### ARCH-021
**Arch – document race conditions from async read-modify-write operations**

When performing async read-then-write operations on shared data, the sequence introduces a race condition because the data may be modified between the read and write. If an atomic solution is not readily available, add a TODO comment explaining the race condition and its implications. Flag sequential async read-modify-write patterns on shared data without acknowledgment of the race condition.

### ARCH-023
**Arch – initialize DOM listeners in a loading phase, not at module scope**

Do not register document-level event listeners or DOM initialization code at module scope (top-level). Instead, call initialization in a dedicated loading phase so that setup timing is predictable and teardown is possible. Flag top-level document.addEventListener or DOM API calls in module scope.

### ARCH-024
**Arch – use metadata flags on entity definitions instead of hardcoding IDs in consuming code**

Component rendering logic should not branch on specific entity IDs (e.g., command names) as hardcoded strings. If an entity needs to opt out of a behavior, the entity definition itself should carry that metadata as a flag. Hardcoding IDs couples the UI to specific entity names and breaks when entities are renamed. Flag conditional logic that branches on specific string literal IDs.

### ARCH-025
**Arch – clean or filter data at the point of creation, not consumption**

When data is produced or cloned, apply any necessary filtering or transformation at that point. Do not rely on consumers to clean up data they receive. Cleaning at the consumption point scatters responsibility and makes the data contract unclear. Flag code that modifies or hides properties of received data rather than ensuring correctness before passing it.

---

## Code Style
<a id="style"></a>

*19 rules | 340 total hits*

### STYLE-001
**Style – inline single-use variables; do not create unnecessary intermediates** (137 hits)

If a variable is used only once and the expression is simple, inline it directly at the point of use. Do not assign a value to an intermediate variable only to immediately use it once. Flag single-use variables where the expression could be inlined without reducing readability.

### STYLE-002
**Style – factor out shared expressions from conditional branches and repeated calculations** (86 hits)

When the same expression appears in both branches of a conditional (or is repeated across multiple calculations), hoist it out. For ternaries, move the shared part outside. For repeated offsets or constants, apply the value once at the call site rather than embedding it in every calculation. Flag code that duplicates the same expression across branches or iterations.

### STYLE-005
**Style – prefer functional patterns over classes** (21 hits)

Prefer functional patterns (plain functions, closures, modules) over classes. Do not introduce classes unless there is a compelling reason. Flag new class declarations where a functional approach would suffice.

### STYLE-006
**Style – organize imports at the top of the file, grouped by source** (14 hits)

Place all imports at the top of the file and group them by their source module. Follow the existing section conventions (e.g., a 'util' section for imports from util modules). Flag imports that are scattered through the file or placed outside the import block.

### STYLE-003
**Style – combine nested if-statements into a single condition** (12 hits)

When an inner if-statement can be merged with its outer if by composing the conditions with &&, do so. Unnecessary nesting reduces readability. Flag if-statements nested directly inside another if-statement where the conditions can be combined.

### STYLE-007
**Style – prefer single return with composite boolean expressions** (12 hits)

Prefer a single return statement using composite boolean variables over multiple early returns scattered through the function body. The code structure should mirror the decision structure. Flag functions with multiple return statements that could be expressed as a single composed return.

### STYLE-011
**Style – break long ternary expressions across multiple lines** (11 hits)

Long ternary expressions should be split across multiple lines: condition on the first line, truthy branch (after ?) on the second, falsy branch (after :) on the third. Flag single-line ternaries that exceed ~80 characters.

### STYLE-013
**Style – prefer null over undefined for intentional absence of a value** (9 hits)

Use null to represent intentional absence of a value. Reserve undefined for unset optional parameters or uninitialized state. Flag functions that return undefined or false to represent 'no value' when null would be more semantically correct.

### STYLE-012
**Style – declare static constants at module scope, not inside functions** (6 hits)

Constants that do not depend on function arguments or closure variables should be declared at module scope. Declaring them inside functions causes needless re-creation on each call. Flag const declarations inside functions that use only literal values or other module-scope references.

### STYLE-015
**Style – separate pure predicate functions from functions with side effects** (6 hits)

A function whose name implies a boolean predicate (should*, is*, can*) should return only a boolean and not perform side effects. If both a check and an action are needed, split them into separate functions. Flag predicate-named functions that perform side effects or accept callback parameters.

### STYLE-009
**Style – omit .js file extension in import paths** (4 hits)

Do not include .js file extensions in import paths. Omitting extensions allows files to be renamed to .ts/.tsx without updating all importers. Flag import statements that include .js extensions.

### STYLE-010
**Style – sort collection values for deterministic order before processing** (4 hits)

Object.values() and Set iteration order is implementation-defined. When processing order matters (e.g., rendering, serialization), sort values explicitly before iterating. Flag code that assumes a specific iteration order from Object.values(), Object.keys(), or Set without sorting.

### STYLE-014
**Style – invert guard conditions and return early rather than nesting the entire body** (4 hits)

When a guard condition would wrap the entire body of a function or effect in an if-block, invert the condition and return/continue early at the top. This reduces nesting and makes the main logic path clearer. Flag functions where the entire body is wrapped in a single if-block that could be an early return.

### STYLE-025
**Style - apply consistent formatting to code and templates** (4 hits)

Apply consistent formatting: multi-line objects, Prettier for templates, etc.

### STYLE-004
**Style – do not redeclare variables that already exist in the enclosing scope** (3 hits)

If a variable is already accessible from an enclosing scope, do not create a new binding with the same name or value. Flag `const x = ...` declarations where `x` already exists and is accessible in the current scope.

### STYLE-020
**Style - prefer JSX/HTML tag syntax over string concatenation** (3 hits)

Prefer JSX/HTML tag syntax over string concatenation for inline formatting.

### STYLE-019
**Style - prefer async/await over .then() Promise chains** (2 hits)

Prefer async/await syntax over Promise .then() chains.

### STYLE-016
**Style – use static ES module imports; avoid dynamic require() inside functions** (1 hits)

Do not use require() inside function bodies to lazily load modules. Use static ES module imports at the top of the file. Dynamic require breaks tree-shaking and static analysis. Flag require() calls inside functions.

### STYLE-017
**Style – use named z-index classes instead of hardcoded z-index values** (1 hits)

Reference z-index values via project-defined named classes (e.g., .z-index-popup) rather than hardcoded integer literals. Centralizing z-index values prevents stacking conflicts and makes it easier to reason about layer ordering. Flag hardcoded z-index integer literals in style declarations.

---

## Documentation & Comments
<a id="docs"></a>

*11 rules | 291 total hits*

### DOCS-001
**Docs – comments should explain intent, not restate code** (99 hits)

Inline comments must explain WHY the code does something — the intent, context, or non-obvious reasoning — not WHAT it does. A comment that restates the code in English adds no value. Flag comments that merely describe what the adjacent code already says.

### DOCS-006
**Docs – add JSDoc to functions, hooks, and component prop interfaces** (69 hits)

Functions, hooks, and component prop interfaces should have JSDoc comments that describe their purpose, behavior, and return values. For hooks, document what the returned value (especially refs) represents. For prop interfaces, explain purpose and general behavior without referencing the consuming component's internals. Flag exported functions, hooks, or prop interfaces that lack JSDoc.

### DOCS-007
**Docs – JSDoc must accurately describe the current implementation** (48 hits)

JSDoc comments must match the current behavior of the code. When functionality changes, update the JSDoc to reflect the new behavior. Include algorithmic complexity (e.g., O(depth)) where relevant. Flag JSDoc that describes behavior the code no longer exhibits.

### DOCS-005
**Docs – add comments when non-obvious preconditions allow omitting a guard** (24 hits)

When code omits a safety check because a precondition was already verified elsewhere (e.g., a canExecute function already ran), add a comment explaining why the guard is unnecessary. Flag code that relies on non-local preconditions without documenting the assumption.

### DOCS-004
**Docs – be precise in comments; avoid vague terms** (19 hits)

Comments must use specific, unambiguous language. Avoid subjective or relative terms like 'correct', 'proper', or 'appropriate' without defining what they mean in context. Flag comments that use vague terms where a precise description would be clearer.

### DOCS-012
**Docs - explain non-obvious values, formulas, and behavior with inline comments** (17 hits)

Add comments explaining non-obvious values, magic numbers, math, or behavior.

### DOCS-008
**Docs – prefer block JSDoc comments over @param annotations** (6 hits)

Use /** ... */ block comments to describe function behavior rather than @param annotations. Block comments surface in VS Code IntelliSense on hover, while @param annotations may not. Flag functions that use @param annotations instead of a descriptive block comment.

### DOCS-009
**Docs – use // for inline comments; reserve /** */ for function and type declarations** (4 hits)

Use // comments for inline code annotations. Reserve JSDoc /** ... */ block comments for documenting functions, hooks, classes, and type declarations. Do not use /** */ for inline explanatory notes inside function bodies. Flag /** */ comments used for inline annotations rather than declarations.

### DOCS-010
**Docs - place comments above the line, not at end-of-line** (3 hits)

Put comments above the code line rather than at the end of the line.

### DOCS-003
**Docs – do not reference line numbers in comments** (2 hits)

Never reference specific line numbers in code comments. Line numbers become stale as code changes and create misleading references. Flag any comment that mentions a line number (e.g., 'see line 42').

### DOCS-002
**Docs – keep inline comments concise and targeted**

Inline comments should be 1-2 sentences that answer a specific question. Long, discursive comments should be shortened to their essential point. Flag comments that are significantly longer than the code they annotate or that ramble beyond a single concern.

---

## Testing
<a id="test"></a>

*29 rules | 272 total hits*

### TEST-007
**Test – use minimal, semantic selectors; prefer data-testid or aria-label** (34 hits)

Test selectors should be minimal and semantic. Prefer data-testid or aria-label attributes over class names, IDs, or deeply nested CSS paths. Avoid chaining multiple ancestor selectors that make tests brittle to markup changes. Flag test selectors that use class names, IDs, or deeply nested CSS chains.

### TEST-001
**Test – test descriptions must match what the test actually asserts** (32 hits)

The test description string (it/test first argument) must accurately describe the behavior being verified. If the test asserts that a split does NOT occur, the description must not say 'splits'. Flag test descriptions that contradict or misrepresent the assertion.

### TEST-005
**Test – assert all related data integrity constraints** (32 hits)

When testing data mutations, assert all correlated invariants — not just the primary field. For example, if creating a contextIndex entry, also assert that the corresponding lastUpdated field exists. Flag tests that verify one aspect of a data structure but ignore closely related fields that should also be checked.

### TEST-002
**Test – use clearly placeholder-named test data** (27 hits)

Test fixture data should use obviously generic placeholder names (e.g., 'Example Title', 'Title', 'a', 'b') so readers know the specific value is not meaningful to the test logic. Flag test data that uses realistic-looking but arbitrary values that could mislead readers into thinking the value matters.

### TEST-004
**Test – prefer callable helper functions over test-name-based heuristics** (26 hits)

Test setup should use explicit callable helper functions, not regex matching against test names or feature flags. If a test needs special setup, call a helper function directly rather than detecting the test name at runtime. Flag test infrastructure that inspects test names to determine behavior.

### TEST-006
**Test – do not use arbitrary sleep/delays in tests; wait for specific conditions** (23 hits)

Do not use sleep(), setTimeout, or hardcoded delay values in tests. Use polling helpers (waitUntil, waitFor) that check for specific DOM or state conditions. Hardcoded waits slow CI and create flaky tests. Flag sleep/setTimeout calls in test files.

### TEST-011
**Test – exercise real code paths; do not mock the function under test** (21 hits)

Tests must exercise the actual code they verify. Do not mock the primary function under test. Do not modify source code to behave differently in test environments. Do not use snapshot tests to verify behavioral outcomes — use explicit assertions instead. Flag tests that mock their primary subject, source files with NODE_ENV branches, or snapshot tests used for behavior.

### TEST-012
**Test – interact with the UI the way a user would; assert through rendered output** (12 hits)

Tests should interact with components via user-centric APIs (RTL events, clicks, keyboard input), not by dispatching Redux actions directly. Assert through rendered UI (screen.getByText, queryByRole), not by reading Redux state. Simulate interactions at the exact element a user would interact with. Flag tests that dispatch to the store or read store state instead of using RTL APIs.

### TEST-013
**Test – test both directions of conditional behavior** (9 hits)

When testing conditional behavior (if A then B), also test the inverse (if not A then not B). A test that only asserts one direction can pass even when the implementation is incorrect. Flag test files that verify a condition's positive case without a corresponding negative case.

### TEST-008
**Test – fail hard on unexpected states; do not silently continue** (8 hits)

In tests, if an expected element or condition is not found, throw an error or use a hard assertion immediately. Do not silently continue past unexpected states, as this masks real failures. Flag try-catch blocks in tests that swallow errors without asserting.

### TEST-029
**Test - add test coverage for untested features and edge cases** (8 hits)

Add test coverage for untested features or edge cases identified during review.

### TEST-010
**Test – initialize shared mutable state in beforeEach, not beforeAll** (7 hits)

Shared mutable state (such as test store instances) should be initialized in beforeEach so each test starts fresh. beforeAll allows state from one test to bleed into the next, causing order-dependent failures. Flag beforeAll blocks that initialize mutable state shared across tests.

### TEST-003
**Test – use queryByLabelText for single-element assertions, not queryAllByLabelText** (6 hits)

When asserting the presence or absence of a single accessible element, use queryByLabelText (singular) rather than queryAllByLabelText (plural). The singular query communicates that exactly one element is expected. Flag queryAllByLabelText calls followed by [0] indexing or length === 1 checks.

### TEST-009
**Test – test utility logic at the utility layer, not through component tests** (6 hits)

Unit test utility functions and pure logic in their own test files adjacent to the module, not through higher-level component tests. Testing deep logic through mounted components makes tests slow, brittle, and hard to diagnose. Flag component tests that primarily exercise utility function logic.

### TEST-026
**Test - e2e helper functions should use named options objects** (6 hits)

E2e test helper functions should use named options objects rather than positional or implicit parameters.

### TEST-027
**Test - remove duplicate test cases** (5 hits)

Do not include duplicate or redundant test cases.

### TEST-015
**Test – use the most specific Jest matcher available** (3 hits)

Use specific Jest matchers (toHaveLength, toBeNull, toBeUndefined, toContain) rather than generic comparisons (toBe with .length, toBe(null)). Specific matchers produce more informative error messages on failure. Flag expect().toBe() patterns that could use a more specific matcher.

### TEST-017
**Test – encapsulate repeated test interactions and DOM queries in named helper functions** (2 hits)

When the same multi-step interaction, DOM query, or test setup pattern appears in multiple tests, extract it into a named helper function. This decouples tests from implementation details and reduces duplication. Flag repeated inline interaction sequences (3+ lines) across test files that could be a helper.

### TEST-018
**Test – omit outer describe block when there is only one group in the file** (2 hits)

If all tests in a file belong to one logical group, omit the outer describe block. Jest displays the file path in test output, which already provides grouping context. Flag files with a single top-level describe block whose name matches the filename or module.

### TEST-030
**Test - split tests covering multiple behaviors** (2 hits)

Split tests that cover multiple independent behaviors into separate cases.

### TEST-025
**Test – assert exact expected values, not relative or inequality conditions** (1 hits)

Test assertions should specify the exact expected value rather than a relative condition (e.g., > 0, !== null). An exact assertion documents expected behavior precisely and catches regressions that a relative assertion would miss. Flag assertions that use inequality conditions when the exact expected value is known.

### TEST-014
**Test – place test files adjacent to or under the module they test**

Test files must be placed in a directory that corresponds to the module being tested (e.g., /src/__tests__/ or /src/db/__tests__/), not in an unrelated directory. Flag test files placed in directories that do not correspond to the module under test.

### TEST-016
**Test – omit module name prefix from individual test descriptions**

Do not prefix individual test descriptions with the module name. Jest includes the file path in output, making the module name prefix redundant and verbose. Flag it/test descriptions that start with the module name.

### TEST-019
**Test – use multiple representative data points, not a single example**

Test cases that check behavior over collections should include multiple items, not just one. A test that passes with a single child may fail with multiple children due to off-by-one or ordering bugs. Flag tests that use a single-element collection when the behavior under test operates on collections.

### TEST-020
**Test – cover related edge cases in the same PR**

When adding a test for a new feature or bug fix, also add tests for related edge cases identified during review. Do not leave obvious variant cases uncovered when they can be addressed in the same PR. Flag PRs that test the primary case but omit closely related edge cases.

### TEST-021
**Test – add or update tests when modifying utility functions**

When modifying existing utility functions, add or update tests to cover the changed behavior. Utility function changes without corresponding test updates are a regression risk. Flag PRs that modify utility function logic without adding or updating tests.

### TEST-022
**Test – place global test mocks in setupTests, not per-file**

Global mocks needed by many tests (e.g., document.execCommand) should be set up in the shared setupTests file rather than duplicated in beforeEach/afterAll blocks in individual test files. Flag mock setups that appear in multiple test files when they could be centralized.

### TEST-023
**Test – add regression tests for documented bug fixes**

When fixing a bug, add a test that captures the correct state so the bug cannot silently reappear. This is especially important for visual or structural regressions where the fix addresses a specific, reproducible problem. Flag bug-fix PRs that do not include a regression test.

### TEST-024
**Test – assertions must be robust to browser and environment variation**

Test assertions should not rely on values that may differ across browser widths, operating systems, or other environmental factors (e.g., exact caret offset after line wrapping). Assert on stable invariants or constrain the environment so the assertion holds consistently. Flag assertions that depend on pixel positions, line wrapping, or other environment-sensitive values.

---

## Naming
<a id="naming"></a>

*7 rules | 260 total hits*

### NAMING-002
**Naming – names must accurately describe what they represent** (165 hits)

Variable, function, hook, and option names must accurately describe the value they hold, the action they perform, or the concept they abstract. Function names should describe their return value (e.g., getRootPath not getRoot). Hook names should surface the underlying library or concept (e.g., useRxCollection not useObserveCol). Flag names that are vague, misleading about the value's type, or that fail to describe what the identifier actually represents.

### NAMING-001
**Naming – follow casing conventions (camelCase variables, PascalCase types)** (58 hits)

Use camelCase for variable and function names. Reserve PascalCase for types, interfaces, and classes. Follow the project's existing capitalization conventions for identifiers and filenames (e.g., Superscript not SuperScript). Flag any identifier that deviates from these casing conventions.

### NAMING-005
**Naming – use project domain terminology over generic terms** (14 hits)

Use the project's established domain vocabulary when naming variables and parameters. For example, use 'child' (the domain concept for a Path node) not 'pathItem' (a generic implementation term). When the project's type system defines a concept, identifiers should reflect that terminology. Flag identifiers that use generic or implementation-oriented terms when an established domain term exists.

### NAMING-006
**Naming – file name must match the primary default export** (7 hits)

Each file should be named after its primary default export. If a component or function is the sole export, the file name must match exactly. Flag files whose name does not match their default export.

### NAMING-009
**Naming - action-creator imports must follow the ActionCreator suffix/alias convention** (7 hits)

Action-creator imports must use the ActionCreator suffix and alias convention.

### NAMING-003
**Naming – avoid confusingly similar names for related identifiers** (5 hits)

Do not introduce identifiers that are near-duplicates of existing ones (e.g., initState and initialState). When related identifiers coexist, their names must clearly distinguish their roles. Flag any new identifier that could be confused with an existing one in the same scope or module.

### NAMING-004
**Naming – name properties from the owning module's perspective** (4 hits)

A hook's or module's exported values should be named for what they represent within the module's own domain (e.g., 'hide', 'styles'), not prefixed with context that only makes sense to the caller. Flag returned properties that are named from the consumer's perspective rather than the provider's.

---

## Code Hygiene
<a id="hygiene"></a>

*8 rules | 194 total hits*

### HYGIENE-001
**Hygiene – remove debug artifacts before merging (console.log, debug try-catch, etc.)** (155 hits)

Remove all debug scaffolding before pushing: console.log statements, accidental try-catch blocks, debugger statements, and other temporary instrumentation. Run the linter before pushing. Flag any console.log, debugger statement, or try-catch block that appears to be leftover debug scaffolding.

### HYGIENE-002
**Hygiene – document why eslint-disable comments are needed** (13 hits)

Linter rules must not be suppressed via eslint-disable comments without a clear inline explanation of why the suppression is necessary. Flag eslint-disable comments that lack a justifying explanation.

### HYGIENE-006
**Hygiene - fix typos in identifiers, comments, and strings** (13 hits)

Fix spelling mistakes and typos in identifiers, comments, and user-facing strings.

### HYGIENE-005
**Hygiene - remove unused variables, parameters, props, and dead code** (7 hits)

Remove dead code: unused parameters, variables, props, or test assertions.

### HYGIENE-008
**Hygiene - use appropriate console log level (error/info/warn)** (4 hits)

Use the correct console log level (console.error/info/warn) rather than console.log.

### HYGIENE-007
**Hygiene - do not commit unintended changes to package-lock.json** (2 hits)

Revert accidental changes to package-lock.json.

### HYGIENE-003
**Hygiene – replace existing assets rather than adding new versions alongside them**

When updating an asset (image, file), replace the existing one rather than adding a new file alongside it. Multiple versions of the same asset create confusion about which is canonical. Flag PRs that add new asset files when the intent is to update an existing one.

### HYGIENE-004
**Hygiene – rename files via git mv to preserve commit history**

When a file needs to be renamed, use git mv (or an equivalent rename) rather than creating a new file and deleting the old one. Renaming preserves commit history, making it easier to understand the provenance of the code. Flag PRs that delete a file and create a new one with similar content under a different name.

---

## App (em Domain Model)
<a id="app"></a>

*23 rules | 151 total hits*

### APP-002
**App – Paths must start at ROOT; build from cursor or selectors** (31 hits)

Every Path must begin at ROOT. Do not construct Paths starting from an arbitrary ThoughtId. Use the cursor or existing selectors (e.g., simplifyPath, contextToPath) to obtain Paths — do not reconstruct them via heuristics like rankThoughtsFirstMatch. Flag Path construction that does not start from ROOT or that uses heuristic-based reconstruction.

### APP-006
**App – use selector functions; do not access thoughtIndex or contextIndex directly** (26 hits)

Always use selector functions (getThought, getAllChildren, getParent, etc.) to look up thoughts. Never access state.thoughts.thoughtIndex or state.thoughts.contextIndex directly. Direct index access bypasses selector logic and creates tight coupling to the state shape. Flag direct property access on state.thoughts.thoughtIndex or contextIndex.

### APP-001
**App – use 'shortcut' not 'command' for keyboard/gesture actions** (11 hits)

In comments, UI copy, and identifier names, use 'shortcut' when referring to keyboard or gesture shortcuts. Do not use 'command' for this concept. Flag instances of 'command' that refer to keyboard/gesture shortcuts.

### APP-005
**App – use head()/contextOf() accessors on Path and Context; do not use array indexing** (10 hits)

Do not use array methods (indexing with [0], slice, splice) directly on Path or Context types. Use the provided accessor functions head() and contextOf() instead. Direct array manipulation couples code to the internal array representation. Flag array index access or array methods on Path or Context values.

### APP-009
**App – define comparators independently; compose with makeOrderedComparator** (9 hits)

Each sort comparator should handle exactly one criterion. Compose comparators using makeOrderedComparator rather than embedding multiple criteria in a single function. Flag comparator functions that handle more than one sort criterion.

### APP-019
**App - use durations.config.ts for animation durations** (8 hits)

Use predefined animation durations from durations.config.ts instead of hard-coding millisecond values.

### APP-004
**App – use store.useEffect() for ministore subscriptions, not store.subscribe()** (7 hits)

When subscribing to ministore changes in a React component, use store.useEffect() to ensure the subscription is synchronized with the React render lifecycle. Do not use store.subscribe() directly. Flag direct store.subscribe() calls inside React components.

### APP-008
**App – use getThoughts (unordered) when order does not matter; getThoughtsRanked only when needed** (7 hits)

getThoughtsRanked performs a sort pass. Use getThoughts (O(1)) when only the set of children is needed. Reserve getThoughtsRanked for code that assumes a specific ordering. Flag getThoughtsRanked calls where the result is not order-dependent.

### APP-013
**App - follow wording conventions for user-facing alert and error messages** (7 hits)

User-facing alert and error messages must follow specific wording conventions (e.g., "Subthoughts of the...", "Cannot move the..."). Flag messages that deviate from the established copy patterns.

### APP-003
**App – prefer pathToThought and id-based selectors over context-based selectors** (5 hits)

Use pathToThought and thought-id-based selectors for looking up thoughts. Context-based selectors are deprecated now that thoughts have unique ids. Flag usage of context-based selector functions (e.g., getThoughtByContext) when an id-based equivalent exists.

### APP-015
**App - unroot paths/contexts when concatenating to avoid embedded ROOT tokens** (4 hits)

When concatenating Paths or Contexts, always call unroot() on the result so ROOT is not embedded in a descendant path.

### APP-016
**App - batch multiple actions in a single store.dispatch call** (4 hits)

Pass an array of actions to store.dispatch rather than dispatching individually to reduce middleware overhead.

### APP-022
**App - use mergeThoughts/mergeUpdates to apply thought index updates** (4 hits)

Use mergeThoughts/mergeUpdates utilities to merge thought index updates into state; do not spread nullable update objects directly.

### APP-007
**App – read settings via getSetting or Redux state, not localStorage** (3 hits)

Read app settings using the getSetting utility or Redux state selectors, not by accessing localStorage directly. localStorage is a persistence layer; the canonical runtime source is Redux state. Flag localStorage.getItem calls for settings values in components or action-creators.

### APP-025
**App - use commandById and gestureString helpers** (3 hits)

Use commandById and gestureString helper functions instead of accessing commandIdIndex directly.

### APP-023
**App - use the storage abstraction (storage.getItem/setItem)** (2 hits)

Use the cross-platform storage abstraction (storage.getItem/setItem) rather than directly assigning to localStorage properties.

### APP-026
**App - use the FadeTransition component for fade animations** (2 hits)

Use the FadeTransition component for fade animations instead of directly manipulating DOM opacity or writing custom CSS transitions.

### APP-027
**App - use hashPath to convert a Path to a string** (2 hits)

Use hashPath to explicitly convert a Path to a string key; do not rely on Array.prototype.toString().

### APP-028
**App - use getSortPreference selector instead of checking =sort attribute** (2 hits)

Use the getSortPreference selector to encapsulate sort preference logic instead of directly checking for the =sort attribute.

### APP-029
**App - place haptic feedback in onTouchEnd to avoid triggering on cancelled gestures** (2 hits)

Trigger haptic feedback and tap handlers in onTouchEnd (successful tap), not onTouchStart (which also fires on cancelled gestures).

### APP-030
**App - prefer Path over SimplePath when context-view boundaries must be preserved** (2 hits)

Use Path over SimplePath in contexts where the full path including context-view ancestors is needed.

### APP-010
**App – quote and ellipsize thought values in user-facing text**

When displaying thought values in user-facing strings (tutorial text, error messages, UI copy), wrap them in quotes and apply ellipsize() to truncate long values. Unquoted or untruncated values can break UI layout and look inconsistent. Flag user-facing strings that reference thought values without quotes or ellipsize().

### APP-011
**App – omit zero-value counts from user-facing messages**

When constructing user-facing messages that include counts (e.g., 'Copied N thoughts and M descendants'), omit the count phrase when the value is 0. Zero-value phrases add noise without informing the user. Flag user-facing alert or message strings that include a count phrase for a zero value.

---

## Code Strictness
<a id="strict"></a>

*14 rules | 150 total hits*

### STRICT-001
**Strict – remove redundant expressions (|| false, unnecessary fallbacks on booleans)** (41 hits)

Do not add falsy fallbacks like `|| false` when the expression already evaluates to a boolean. These are redundant and add noise. Flag `|| false`, `|| 0`, or similar fallbacks on expressions that are already the expected type.

### STRICT-002
**Strict – consolidate duplicate constants; do not create new ones that duplicate existing patterns** (22 hits)

Before defining a new constant (especially regex patterns), check if an equivalent one already exists. If it does, reuse or extend it rather than creating a duplicate. Flag new constant definitions that duplicate the value or pattern of an existing one.

### STRICT-005
**Strict – do not mutate data; use non-destructive methods** (20 hits)

Do not mutate arrays or objects in place. Use non-destructive alternatives (spread, map, filter, toSorted, toReversed) instead of mutating methods (sort, reverse, splice, push). Flag calls to Array.prototype.sort(), .reverse(), .splice(), or .push() on existing arrays or objects.

### STRICT-013
**Strict - omit empty object literal arguments and return values** (17 hits)

Do not pass {} as a superfluous argument or return it as a no-op.

### STRICT-004
**Strict – use named constants instead of magic number literals** (15 hits)

Replace hardcoded numeric literals (especially durations, timeouts, and thresholds) with named constants from the project's configuration (e.g., duration constants). Magic numbers obscure intent. Flag numeric literals used for durations, delays, or thresholds that could reference a named constant.

### STRICT-006
**Strict – throw on violated preconditions rather than silently continuing** (9 hits)

When a function has a required precondition (e.g., a non-null parent node), throw an error if the precondition is not met rather than silently returning or producing incorrect output. Silent failures mask bugs. Flag functions that return early or produce default values when critical preconditions fail.

### STRICT-003
**Strict – remove redundant 'return await' in async functions** (6 hits)

In async functions, `return await promise` is equivalent to `return promise` — the await is redundant. Remove it. Flag `return await` at the end of async functions where the await serves no purpose (no try-catch wrapping the return).

### STRICT-009
**Strict – use strict undefined check (=== undefined) when empty string is a valid value** (5 hits)

When a value can legitimately be an empty string, check for undefined explicitly (=== undefined) rather than using a falsy check (!value). Falsy checks incorrectly exclude empty strings. Flag !value or if (!x) guards on values typed as string | undefined where empty string should be treated as valid.

### STRICT-012
**Strict - remove CSS/SVG attributes that replicate browser defaults** (4 hits)

Remove redundant CSS or SVG attributes that equal browser/spec defaults.

### STRICT-016
**Strict - prefer spread syntax over Array.prototype.concat** (4 hits)

Prefer spread syntax over Array.prototype.concat for non-destructive array construction.

### STRICT-010
**Strict - do not use let; prefer const** (3 hits)

Use const with descriptive names instead of let.

### STRICT-015
**Strict - use clearly namespaced sentinel values to avoid collisions** (2 hits)

Use clearly namespaced sentinel/dummy string values that are unlikely to conflict with real values.

### STRICT-007
**Strict – use .filter(nonNull) instead of .filter(Boolean) on typed arrays** (1 hits)

Do not use .filter(Boolean) on typed arrays where falsy-but-valid values (empty strings, 0) may exist. Use .filter(nonNull) to explicitly filter only null/undefined. filter(Boolean) silently drops valid falsy values. Flag .filter(Boolean) on arrays whose element type includes non-null falsy values.

### STRICT-008
**Strict – do not declare functions async unless they contain await** (1 hits)

Do not declare a function as async if it does not contain any await expressions. Async functions have overhead and signal to callers that they should be awaited. Only use async when the function actually performs asynchronous work. Flag async function declarations with no await in the body.

---

## Performance
<a id="perf"></a>

*15 rules | 133 total hits*

### PERF-001
**Perf – combine loops and hoist loop-invariant calculations** (78 hits)

When two loops iterate over the same collection, combine them into one. Move calculations that do not depend on the loop variable outside the loop body. Flag adjacent loops over the same array and expressions inside loops that could be computed once before the loop.

### PERF-015
**Perf - avoid unnecessary React re-renders** (22 hits)

Avoid unnecessary re-renders by using stable references, boolean selectors, and useSelectorEffect for side effects.

### PERF-002
**Perf – prefer requestAnimationFrame over arbitrary setTimeout for UI synchronization** (8 hits)

For cursor positioning, scroll synchronization, or other UI-timing operations, use requestAnimationFrame to align with the browser's render cycle. Do not use setTimeout with arbitrary delays (e.g., 100ms). Flag setTimeout calls used for UI synchronization where requestAnimationFrame would be more appropriate.

### PERF-003
**Perf – use perma() to lazily evaluate expensive values used conditionally** (8 hits)

Wrap non-trivial computations in perma() when they are only needed in some code paths. perma() defers execution until first access and memoizes the result. Flag expensive computations in conditional branches that are always eagerly evaluated but only sometimes used.

### PERF-004
**Perf – use short-circuit iteration (find/some/every) instead of full scans** (8 hits)

When checking whether any element satisfies a condition, prefer short-circuit methods (some, find, every) over building intermediate arrays with filter/map. Short-circuit methods stop at the first match. Flag filter().length > 0, map().filter(), or reduce() patterns that could use some/find.

### PERF-008
**Perf – batch multiple database writes into a single call** (5 hits)

When multiple records need to be written to the database as part of the same operation, batch them into a single write call instead of issuing one call per record. Batching reduces round-trips and improves performance. Flag loops or sequential await calls that each write a single database record.

### PERF-017
**Perf - avoid instantiating expensive objects in hot paths** (2 hits)

Avoid instantiating expensive Web API objects (DOMParser, canvas context) on every keystroke; cache or use a lightweight alternative.

### PERF-005
**Perf – return stable references from selectors for empty collection fallbacks** (1 hits)

Selectors that return empty arrays or objects as fallbacks should return a module-level constant rather than creating a new literal on each call. New literals create unstable references that trigger unnecessary React re-renders. Flag selectors that return [] or {} inline as fallbacks.

### PERF-009
**Perf – throttle/debounce at the event source, outside the dispatched function** (1 hits)

Apply throttle or debounce wrappers as close to the event source as possible, before the dispatch call, not inside the dispatched function body. Throttling inside the dispatch creates new function instances on every event and may not effectively limit work. Flag throttle/debounce calls inside dispatched function bodies.

### PERF-007
**Perf – gate data migrations with a version or flag check so they run exactly once**

Data migrations must be idempotent and gated so they run exactly once. Do not unconditionally run a migration on every page load or app startup. Use a schema version check or a migration flag to skip the migration after the first successful run. Flag migration functions called unconditionally on every initialization.

### PERF-010
**Perf – do not set reactive stores to intermediate transient values; commit only the final value**

Setting a reactive store to an intermediate null/reset value before setting it to the real value fires subscribers twice with potentially invalid states. Compute the final value first, then set it once. Flag reactive store setter calls that set an intermediate value before immediately setting the final value.

### PERF-011
**Perf – avoid patterns that cause double renders; achieve the goal in a single render pass**

Do not use patterns like setting a mounted state in a useEffect to delay initialization, as they cause every component instance to render twice. Find solutions that produce the correct result in the initial render pass. Flag useState(false) + useEffect(() => setState(true), []) mount-detection patterns.

### PERF-012
**Perf – use store selector effects for side-effect-only subscriptions, not useState**

When a subscription to a ministore or selector is only needed to run a side effect (not to update rendered output), use the store's selector effect API rather than useState + useSelector. useState causes a React re-render on every change; a selector effect runs the callback without triggering a render. Flag useState variables set exclusively inside a store subscription and not used in JSX.

### PERF-013
**Perf – do not memoize trivially computed primitives**

Do not wrap simple boolean expressions or primitive computations in useMemo. Since primitives are compared by value, memoizing them provides no benefit — the consumer will not re-render whether the primitive is memoized or not. Reserve useMemo for expensive computations or reference-unstable objects/arrays. Flag useMemo calls that compute a plain boolean or other primitive.

### PERF-014
**Perf – throttle scroll and resize event handlers to avoid layout thrashing**

Scroll and resize event handlers fire very frequently. Do not call getBoundingClientRect, scrollTop, or other layout-triggering operations on every event tick. Throttle the handler or use requestAnimationFrame to limit the rate of layout recalculations. Flag unthrottled scroll or resize handlers that call layout-triggering DOM APIs.

---

## TypeScript
<a id="ts"></a>

*11 rules | 100 total hits*

### TS-001
**TypeScript – use the most precise type available; do not widen to primitives** (50 hits)

Use narrow, specific types rather than broad primitives. Prefer named union types (e.g., 'thought' | 'toolbar-button') over string, prefer existing project type aliases (Context | Path) over manually constructed inline types, and prefer Direction[] over string[]. Flag parameters or variables typed as string, number, or other primitives when a more precise union type or project type exists.

### TS-004
**TypeScript – avoid unsafe type casts; type values correctly** (27 hits)

Do not use 'as' casts to override the type system, especially on values that may be null or undefined. Instead, type the value correctly so the type system enforces runtime safety. Flag 'as' casts that silence potential null/undefined errors or that widen/narrow types unsafely.

### TS-002
**TypeScript – use React/library utility types instead of hand-rolling equivalents** (7 hits)

Use standard utility types provided by React or other libraries (e.g., PropsWithChildren, ReturnType) instead of manually declaring equivalent interfaces or types. Flag custom type definitions that duplicate a built-in utility type.

### TS-003
**TypeScript – declare optional props with '?' not '| undefined'** (5 hits)

Use the optional property syntax (selected?: boolean) rather than an explicit union with undefined (selected: boolean | undefined). Flag prop definitions that use `| undefined` when `?` would be idiomatic.

### TS-005
**TypeScript – functions should return a single consistent type** (5 hits)

A function should return a single type (or a nullable variant). Do not write functions that return fundamentally different types depending on a boolean flag or parameter. Split into separate functions instead. Flag functions whose return type is a union of unrelated types controlled by a parameter.

### TS-011
**TypeScript - do not use any; use precise types** (2 hits)

Do not use TypeScript's any type; use precise types or explicit typecasts.

### TS-012
**TypeScript - omit optional boolean props at call site** (2 hits)

At call site, omit optional props rather than passing false.

### TS-006
**TypeScript – extract inline anonymous types into named type aliases** (1 hits)

When a complex inline type is used as a type parameter (e.g., in reduce<TypeHere>), extract it into a named type alias defined at the module level with a descriptive comment. This improves readability and allows reuse. Flag complex inline type expressions that could be named type aliases.

### TS-007
**TypeScript – omit explicit generic type arguments when inference suffices** (1 hits)

When TypeScript can infer a generic type from the provided initializer or arguments, do not explicitly provide the type argument. Redundant explicit generics add noise without adding type safety. Flag explicit generic type arguments on function calls where inference would produce the same type.

### TS-008
**TypeScript – default array-typed state fields to empty array, not undefined**

State fields that hold arrays should default to an empty array ([]) rather than undefined. Defaulting to undefined forces all consumers to handle both undefined and [] as equivalent, duplicating null-check logic. Flag optional state properties typed as T[] where an empty array default would eliminate undefined handling.

### TS-009
**TypeScript – make implicit cross-module string coupling explicit via shared constants**

When two modules rely on the same set of string values (e.g., CSS class names, attribute names), make that coupling explicit by importing from a shared constant or type rather than duplicating string literals. Implicit coupling creates silent drift if one module is updated but not the other. Flag identical string literals in multiple modules where a shared constant would prevent divergence.

---

## PandaCSS & Styling
<a id="pandacss"></a>

*11 rules | 95 total hits*

### PANDACSS-001
**PandaCSS – use theme tokens or themeColors selector, not hardcoded color values** (33 hits)

Reference colors via theme tokens (e.g., colors.bg) or the themeColors selector rather than hardcoding hex values, rgb(), or other literal color values. Flag any hardcoded color value in css() calls, inline styles, or style objects.

### PANDACSS-007
**PandaCSS – use className={css(...)} for static styles, not inline style={}** (14 hits)

For styles that do not depend on runtime values, use className={css({...})} rather than style={{...}}. PandaCSS can optimize className-based styles at build time. Reserve inline style for truly dynamic runtime values only. Flag style={{...}} attributes containing static values that could be className={css(...)}.

### PANDACSS-004
**PandaCSS – inline styles in the component that uses them; split into smaller components for complexity** (10 hits)

Co-locate CSS variables and style objects within the component that uses them rather than extracting to separate constants. If a component's styles become too verbose, split the component into smaller sub-components rather than hoisting styles out. Flag style constants extracted into separate files or defined far from their usage.

### PANDACSS-005
**PandaCSS – avoid cssRaw and open-ended style override APIs** (10 hits)

Do not use cssRaw or provide open-ended style override props that let parent components freely customize child CSS. Instead, expose typed props or use CSS custom properties sparingly. The goal is type-safe, meaningful component interfaces. Flag components that accept arbitrary style objects or use cssRaw.

### PANDACSS-003
**PandaCSS – use relative units (em) for spacing instead of computed pixel values** (9 hits)

Use em-based values for spacing and padding rather than computing pixel values from fontSize at runtime (e.g., use '0.667em' instead of `fontSize * 2/3 + 'px'`). Flag dynamically computed pixel values that could be expressed as a simple em value.

### PANDACSS-008
**PandaCSS – do not use !important** (6 hits)

Do not use !important in CSS declarations. Use PandaCSS recipes, layer-based specificity, or restructured selectors to manage style precedence. Flag !important in css() calls or style objects.

### PANDACSS-010
**PandaCSS – do not use will-change without an associated animation; use safer stacking context methods** (4 hits)

will-change should only be set on an element when it is known to animate or transition imminently. Using will-change without a corresponding animation creates a persistent GPU layer, wastes memory, and may cause rendering artifacts. When the goal is to create a stacking context, use transform: 'translateZ(0)' or contain: 'layout paint' instead. Flag will-change declarations that are not paired with a matching animation or transition.

### PANDACSS-002
**PandaCSS – adapt native UI chrome to the active theme** (3 hits)

Native platform elements (e.g., status bar, navigation bar) must dynamically reflect the active theme (dark/light) rather than being hardcoded to one style. Flag native UI configuration that uses a fixed dark or light value instead of reading from the current theme.

### PANDACSS-009
**PandaCSS – use statically analyzable class names; avoid dynamic string templates** (3 hits)

PandaCSS performs static analysis at build time and cannot process dynamically constructed class strings (template literals, concatenation). Use conditional objects or recipe variants instead of string interpolation for dynamic classes. Flag template literals or string concatenation in css() or className expressions.

### PANDACSS-012
**PandaCSS - use CSS custom properties to share values across declarations** (2 hits)

Use CSS custom properties (design tokens) to enforce that the same value is reused across multiple properties.

### PANDACSS-006
**PandaCSS – omit easing on color transitions; reserve easing for kinematic animations** (1 hits)

Do not apply easing functions (ease-in, ease-out, cubic-bezier) to color transitions. Easing is semantically tied to physical motion and has no meaningful effect on color interpolation. Use linear or no timing function for color transitions. Flag color transitions that specify an easing function.

---

## React
<a id="react"></a>

*17 rules | 70 total hits*

### REACT-001
**React – pass callbacks directly instead of wrapping in unnecessary handlers** (11 hits)

When a callback prop can be passed directly to a child component, do not wrap it in an anonymous function or intermediate handler that just calls through to it. Flag wrapper functions like `() => someCallback()` or `(e) => someCallback(e)` that add no logic beyond forwarding the call.

### REACT-007
**React – use useDispatch/useSelector hooks; do not import the global store in components** (10 hits)

In React components, use the useDispatch hook to dispatch actions and useSelector to read state. Do not import the global store directly. Direct store imports bypass React's subscription model and can cause stale reads. Flag store imports in component files.

### REACT-003
**React – avoid routing imperative side-effects through state + useEffect** (8 hits)

When an event handler needs to trigger a side effect (e.g., calling animate()), call it directly from the handler. Do not set a boolean state flag and then react to it in a useEffect. Flag patterns where local state is set solely to trigger a useEffect that performs an imperative action.

### REACT-005
**React – extract large JSX sub-trees into named sub-components** (8 hits)

When a component's JSX contains large or logically distinct sub-trees, extract them into named sub-components (in the same file if not reused elsewhere). This keeps the main component's render method readable. Flag components with deeply nested JSX that contains logically separable sections.

### REACT-004
**React – do not pass inline object or array literals as props** (7 hits)

Do not pass array literals ([...]) or object literals ({...}) directly as JSX props. Each render creates a new reference, breaking React.memo and useMemo optimizations. Extract to a const outside the component or use useMemo. Flag inline array/object literals in JSX prop positions.

### REACT-008
**React – model mutually exclusive states as an enum/union, not multiple booleans** (6 hits)

When multiple boolean flags represent mutually exclusive states (e.g., open, opening, closing), model them as a single state variable with a union type. Multiple booleans allow invalid combinations and require coordinated updates. Flag two or more booleans that represent phases of a single process.

### REACT-006
**React – do not query or measure the DOM in the render body** (5 hits)

DOM queries (querySelector, getBoundingClientRect, getComputedStyle) must not be called in the render body of a React component. Use useLayoutEffect or useEffect for DOM measurements. Render-body DOM access causes layout thrashing and breaks SSR. Flag DOM API calls outside of effects or refs.

### REACT-018
**React - keep hook dependency arrays accurate** (5 hits)

Ensure all reactive dependencies are declared in useMemo/useCallback/useEffect dependency arrays. Remove unused dependencies.

### REACT-009
**React – prefer conditional rendering over visibility:hidden for unmounted content** (3 hits)

Use conditional rendering (returning null or omitting a subtree) instead of CSS visibility:hidden or opacity:0 for content that should not be shown. Hidden-but-mounted components still render, run effects, and consume resources. Flag visibility:hidden or opacity:0 used to hide components that could be conditionally unmounted.

### REACT-011
**React – use useRef for mutable cross-render state; useMemo for cached derived values** (2 hits)

useRef is for holding mutable values that persist across renders without triggering re-renders (e.g., tracking previous values). useMemo is for caching derived values that are expensive to compute. Do not use useRef to cache derived values or useMemo for mutable state. Flag useRef used to cache derived values or useMemo used for mutable tracking.

### REACT-014
**React – access Redux state imperatively via thunks, not hooks, in event handlers** (2 hits)

When an event handler or callback needs to read Redux state imperatively (not reactively for rendering), dispatch a thunk rather than subscribing via a hook. Using a hook to access state that is only needed imperatively causes unnecessary re-renders when that state changes. Flag hooks used solely to capture state values only read inside event handlers.

### REACT-016
**React - define variables inside useEffect scope where they are used** (2 hits)

Define variables inside the useEffect scope where they are used rather than at the component level.

### REACT-002
**React – do not add redundant guards around React state setters** (1 hits)

React state setters (useState, setState) already no-op when the new value equals the current value. Do not add equality checks before calling a setter. Flag patterns like `if (value !== state) setState(value)` — just call `setState(value)` directly.

### REACT-010
**React – subscribe to state changes via delta detection, not presence checks**

When subscribing to a store and acting on a state change, detect the transition (e.g., isPulling changed from true to false) rather than just checking the current value. A presence check fires on every update where the condition holds, not just at the moment of change. Flag store subscriptions that check a boolean's current value without comparing to the previous value.

### REACT-012
**React – hooks must return a callback, not be used directly as event handlers**

A custom hook should return a callback function rather than accepting the event as a parameter and being called directly as the handler. A hook called with useOnCut(event) is not a proper hook; it should return a function assignable as the event handler. Flag custom hooks that take event objects as direct parameters instead of returning handler functions.

### REACT-013
**React – hidden-but-mounted components must have pointer-events: none**

When a component is visually hidden (e.g., via opacity: 0 or transform: translateY offscreen) but still mounted, it must have pointer-events: none to prevent users from interacting with invisible elements. Flag components that hide themselves via opacity or transform without also disabling pointer events.

### REACT-015
**React – prefer native React event handler props over manual addEventListener in effects**

Use native React event handler props (onMouseMove, onClick, etc.) rather than manually attaching event listeners via addEventListener in useEffect. Native React handlers are declarative, automatically cleaned up, and do not require a useEffect. Flag useEffect blocks whose sole purpose is to attach and remove an event listener when a React event prop would suffice.

---

## Redux
<a id="redux"></a>

*13 rules | 70 total hits*

### REDUX-007
**Redux – subscribe to the minimal derived value, not the whole object** (25 hits)

When selecting from the Redux store, subscribe to the specific primitive value needed rather than the entire object. Selecting a full object causes re-renders whenever any property changes, even unrelated ones, because the object reference is unstable. Flag useSelector calls that select an entire object when only one property is used.

### REDUX-001
**Redux – prefer reducers over action-creators for state logic** (10 hits)

State transitions and conditional logic based on current state should be handled in reducers, not in action-creators. Action-creators should be reserved for side effects (network requests, DOM interactions, async flows). If an action-creator reads state and dispatches based on it, that logic belongs in a reducer.

### REDUX-004
**Redux – avoid DOM access in action-creators** (6 hits)

Action-creators must not query or manipulate the DOM directly. DOM-derived values should be obtained via Redux selectors or passed as arguments from the component layer. Flag any document.querySelector, getElementById, or similar DOM API calls inside action-creator functions.

### REDUX-006
**Redux – use selectors instead of DOM queries for deriving structural data** (5 hits)

Use Redux selectors or hierarchical component data to derive structural relationships between thoughts. Do not traverse the DOM to find parent/child/sibling relationships when that information is already available in Redux state. Flag DOM traversal (parentElement, closest, querySelector) used to derive data that existing selectors provide.

### REDUX-008
**Redux – selectors should accept the full state object, not a slice** (5 hits)

Selector functions should accept the full Redux state object as their first parameter, not a specific slice (e.g., thoughtIndex). This keeps the selector interface consistent and allows selectors to access any part of state if needed later. Flag selector functions whose first parameter is a state slice rather than the full state.

### REDUX-012
**Redux – guard thunks against no-op dispatches** (4 hits)

Action-creator thunks should check whether dispatching would actually change state before dispatching. Dispatching a no-op action fires middleware unnecessarily and clutters Redux DevTools action history. Flag thunks that dispatch reducers unconditionally when a cheap state read would allow skipping the dispatch.

### REDUX-002
**Redux – do not proliferate single-purpose reducers unnecessarily** (3 hits)

Avoid creating new reducers for logic that can be handled by existing reducers or consolidated into them. Prefer extending an existing reducer over introducing a new one when the logic is closely related. Flag new reducer files that handle logic already covered or easily absorbed by an existing reducer.

### REDUX-005
**Redux – prefer single-purpose action-creators over polymorphic ones** (3 hits)

Action-creators should have a single, clear responsibility. Avoid polymorphic action-creators that accept flags or modes to perform different operations (e.g., toggleDropdown that can also close). Instead, create dedicated action-creators for each distinct operation. Flag action-creators that use parameters to switch between fundamentally different behaviors.

### REDUX-009
**Redux – use compact reducer style; return partial state, not spread** (3 hits)

Reducers should return a partial state object that gets merged by the root reducer. Do not explicitly spread the full state (return { ...state, key: value }). The compact form reduces boilerplate. Flag reducers that return { ...state, ... } when a partial return would work.

### REDUX-010
**Redux – reducers must be pure functions with no browser API dependencies** (2 hits)

Reducer functions must not import or use browser APIs (window, document, Selection). Browser-derived values should be passed as action payload from the component layer or action-creators. Flag import statements for browser APIs in reducer files.

### REDUX-017
**Redux - use reducerFlow patterns correctly** (2 hits)

Use uncurried reducer form when intermediate state access is needed in reducerFlow. Apply changes incrementally.

### REDUX-003
**Redux – handle Redux-to-Redux state transitions in reducers or middleware, not useEffect** (1 hits)

When one Redux state change should trigger another Redux state change, the logic belongs in a reducer or middleware — not in a React component's useEffect hook. useEffect should not be used to bridge Redux state transitions. Flag useEffect hooks that read Redux state and dispatch actions in response to state changes.

### REDUX-011
**Redux – derive transient flags from state transitions, not mutable enhancer variables** (1 hits)

When a Redux enhancer or middleware needs to react to a state transition, derive the condition by comparing prevState and nextState rather than tracking a mutable boolean in the enhancer's closure. Closure-level mutable variables are invisible to DevTools, not reset on store reinitialization, and duplicate information in the Redux state tree. Flag mutable boolean or counter variables in enhancer closures that could be derived from state.

---
