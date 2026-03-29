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
frequency (most commonly flagged first). Each rule includes cherry-picked
examples of actual review comments that matched it.

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

**Examples:**

> **components/Editable.tsx**
> If you override `style`, it will delete [existing styles](https://github.com/cybersemics/em/pull/786/files#diff-6c9d2035e60990112aa478966a00f0a7R494).

> **components/ModalExport.tsx**
> I'm not sure I understand this. Selecting the export format should not affect `shouldIncludeMetaAttributes`. Can you explain what your intention was?

> **components/Editable.js**
> Unfortunately, removing this breaks the desired behavior of being able to paste from a bulleted list (from a webpage or word processor for example).

### ARCH-010
**Arch – pass only the minimum data across boundaries; derive late** (53 hits)

Pass only the minimum data across module and component boundaries and derive other values as late as possible. Do not pass pre-computed or redundant data when the receiver can derive it from what it already has. Flag arguments or props that pass derived values when the source data is already available to the callee.

**Examples:**

> **components/Subthoughts.js**
> `cursor` currently contains `{ rank, value }`. If we changed the `cursor` type to `{ rank, value, index }`, then it would save us a lot of time here.

> **components/PopupBase.tsx**
> `PopupBase` already gets the ref that is used to calculate the height, so maybe `PopupBase` can calculate it internally rather than having it passed in?

> **components/DropDownMenu.js**
> Let's pass the options in as props so that the DropDownMenu component remains generic. Otherwise it can only be used for the export dropdown.

### ARCH-009
**Arch – move implementation details into the component or module that owns them** (52 hits)

Implementation details (e.g., internal calculations, magic numbers, configuration) should live in the component or module that uses them, not be defined externally. Flag implementation details that are defined far from their single point of use.

**Examples:**

> **actions/updateThoughts.ts**
> Even better, could this logic be moved into `mergeUpdates`? It has access to `thoughtIndexOld`. That would be better encapsulated, if that's possible.

> **components/LayoutTree.tsx**
> Can we move the `FadeTransition` into `TreeNode`? The extra complexity of managing `TreeNode` refs outside the `TreeNode` component is less than ideal.

> **components/Sidebar.js**
> Can we make this internal to the Breadcrumbs component? I think it makes more sense there than in the Sidebar, which shouldn't be concerned with ellipses.

### ARCH-001
**Arch – place utility functions in their own file under util/** (49 hits)

Utility functions that are not specific to the module where they were written should be placed in their own file under the util/ directory. Do not collocate generic helper functions in unrelated modules. Flag utility functions added to files where they do not belong topically.

**Examples:**

> **shortcuts/exportContext.js**
> This `exec` function should now simply dispatch `{ type: 'showModal', id: 'export' }`. The downloading itself should be in the `ExportModal` component.

> **test-helpers/getThoughtFromDB.ts**
> I believe this file should go in `/src/test-helpers/e2e-helpers` since it is embedded in the puppeteer environment vs being called directly in test code.

> **e2e/__tests__/caret.ts**
> How about simply checking the `textContext` of the `focusNode`? That would be a bit simpler and obviate the need for `getEditableContextHashFromSelection`.

### ARCH-014
**Arch – do not add redundant guards when the default flow handles the null case** (48 hits)

Do not add null/undefined checks before operations that already handle the null case correctly (e.g., iterating an empty array, querying with no results). Redundant guards add noise without changing behavior. Flag null checks that guard operations whose empty/null path already produces the correct result.

**Examples:**

> **util/compareThought.ts**
> If the thoughts are the same, then this function will return `0` anyway, so no need for a special case from what I can tell.

Removed in 72d4b7bacf9.

> **util/isEM.ts**
> Since we already know `thought.length === 1`, then we don't need to check `!!thoughts[0]`. An empty thought will be handled by the subsequent case.

> **components/Editable.tsx**
> `stripEmptyFormattingTags` does not need to be called on `oldValue`, since `oldValue` merely contains the last `newValue` and is already stripped.

### ARCH-016
**Arch – do not add abstractions or parameters for hypothetical future cases** (35 hits)

Do not add abstraction layers, helper functions, optional parameters, or polymorphic APIs to handle cases that do not yet exist. Build for the current requirements only. Flag new parameters, branches, or abstractions that serve no current use case.

**Examples:**

> **shortcuts.js**
> Thank you, good question. We should `.toLowerCase` the shortcut `key` in the comparison. This will be more resilient for the addition new shortcuts.

> **components/icons/AnimatedIcon.tsx**
> Unless you plan on using it within the same PR, I think I'd prefer we remove it. We don't want to add additional complexity unless there is a real need.

> **redux-enhancers/cursorChanged.ts**
> I'm not sure I understand why all this logic is necessary. Can you just check `updatedState.cursor && isDivider(headValue(updatedState.cursor))`?

### ARCH-005
**Arch – scope platform-specific fixes conditionally** (33 hits)

Platform-specific fixes must be wrapped in platform-detection conditionals so they do not affect other platforms. An unconditional fix for one platform can regress another. Flag platform-specific workarounds that are applied unconditionally.

**Examples:**

> **components/VirtualThought.tsx**
> I don't believe we need to check `isiPhone`, as it is assumed with `isTouch && isSafari()`.

Also might yield a false negative for iPads.

> **actions/deleteThought.ts**
> We definitely want to abstract this out since the condition is present with every Haptics call. It should always NOOP on other platforms.

> **components/ToolbarButton.tsx**
> I don't think applying all the desktop and mobile handlers is correct. `fastClick` checked `isTouch` to determine which handlers to apply depending on the platform.

### ARCH-002
**Arch – keep generic utilities free of feature-specific special cases** (29 hits)

Generic utility functions must not contain knowledge of specific features, attribute types, or domain-specific branches. If feature-specific behavior is needed, extract it into a dedicated reducer, action-creator, or wrapper. Flag utility functions that contain if/switch branches for specific feature cases.

**Examples:**

> **components/Link.js**
> No need to conditionalize; just fire the action, similar to 'search' and 'setCursor' above. Then we don't have to add complexity to the component signature.

> **hooks/useMaxSiblingWidth.ts**
> You can reuse [isDivider](https://github.com/cybersemics/em/blob/e7da6e07a42ca2156a0d6fbf8836e10d858870bb/src/util/isDivider.ts) to check if it is a divider.

> **components/TreeNode.tsx**
> There is a lot of divider-specific functionality in this function that does not seem relevant here. I'd like to see a function that is more tailed to the purpose.

### ARCH-004
**Arch – follow a protocol when deleting existing code** (22 hits)

When removing existing code, explain its origin, what replaces it, and what regression risk the deletion introduces. Do not silently remove code. Flag PRs that delete non-trivial code without explaining why it is safe to remove.

**Examples:**

> **components/AppComponent.js**
> For some reason moving the `Toolbar` outside the SplitPane causes the transform to make it disappear. We'll have to address that in a separate issue.

> **components/BulletEllipsis.tsx**
> I believe it's safe to remove the `onMouseDown` now that `fastClick` uses `onClick` and has its own `e.stopPropagation()`.

6d034178c5

> **components/Editable.tsx**
> Superscript positioning is broken anyway and needs to be solved a different way, so it's okay to remove this line. See #894.

### ARCH-006
**Arch – single default export per module; no redundant named re-exports** (21 hits)

Each module should have a single default export. Do not add a named export that re-exports the same value as the default. Flag modules that export both a named and a default export for the same value.

**Examples:**

> **reducers/splitView.js**
> There should be one reducer per file, and the filename should match the reducer name. This makes it easier find reducer definitions with some editors.

> **util/fauxAnimation.ts**
> On this project we follow a convention where the filename matches the default export name. This makes it easier to know where every function lives.

> **util/keyboardVisibility.ts**
> The file name should match the name of the default export: `handleKeyboardVisibility.ts`. This makes it easier to find where functions live in the codebase.

### ARCH-003
**Arch – group optional parameters into an Options object** (17 hits)

When a function has optional parameters beyond its required ones, group them into a single Options object rather than adding standalone arguments. Flag functions with more than one optional parameter that are not grouped into an options bag.

**Examples:**

> **selectors/getSortedRank.ts**
> I don't love the new API of this function. That third parameter is very awkward. I think this needs some work, or needs to be addressed higher up.

> **device/disableScroll.ts**
> Another way to do this would be to have a single default export that takes a boolean argument, e.g. `allowScrolling(false)`.

> **components/Alert.tsx**
> Are you sure that `trigger` is actually needed? Would be better with just `callback` and `delay` args.

### ARCH-030
**Arch - eliminate code duplication by extracting shared abstractions** (14 hits)

Eliminate code duplication by extracting shared logic into a shared component, helper, or abstraction (DRY principle).

**Examples:**

> **components/SortButton.tsx**
> I think there is enough duplicated code here to warrant factoring it out into a `SortOption` component. It can encapsulate the label + input + h3.

> **redux-middleware/remoteSync.ts**
> Is this identical to `getVisibleContexts` in `pullQueue`? If so, it should be factored out to avoid duplication.

> **test-helpers/exportWithoutRoot.js**
> That sounds good. Please replace the duplicate code in other files with a reference to `exportWithoutRoot`.

### ARCH-008
**Arch – do not add try-catch inside utility/helper functions; let errors propagate** (12 hits)

Utility and helper functions should not catch errors internally. Let errors propagate to the caller, which has the context to handle them appropriately. Flag try-catch blocks inside utility functions that swallow or re-throw errors without adding value.

**Examples:**

> **commands/generateThought.ts**
> Never swallow error messages. Allow it to bubble up and catch it above where an error action can be dispatched.

> **data-providers/yjs/permissionsModel.ts**
> If a function can't handle an error, it should throw it up the call stack rather than return it.

> **commands/generateThought.ts**
> Try again. The empty `catch (err)` is still there.

Do not put the try-catch in this function.

### ARCH-013
**Arch – use the project's device abstraction layer instead of direct browser APIs** (9 hits)

Access browser-specific APIs (window.getSelection, window.scrollTo, etc.) through the project's platform-abstracted modules (e.g., selection.ts, scrollTo.ts). Direct browser API calls break cross-platform compatibility. Flag direct window/document API calls where an abstraction exists.

**Examples:**

> **util/splitAtSelection.ts**
> If you can use [createDocumentFragment](https://developer.mozilla.org/en-US/docs/Web/API/Document/createDocumentFragment) that would be better.

> **components/ModalExport.tsx**
> I would prefer a simpler touch detection mechanism. You can use [isTouch](https://github.com/cybersemics/em/blob/dev/src/browser.ts#L6) which is already defined.

> **e2e/iOS/__tests__/caret.ts**
> Could you do this with `tapWithOffset`? `getElementRectByScreen` would be handy in other situations, but maybe here we can use what we already have. It would be nice to abstract away the pixel calculations anyway.

### ARCH-012
**Arch – functions should return a single cohesive value, not arbitrary bundles** (7 hits)

Functions should return a single meaningful value. Do not return plain objects that group unrelated values just because they happen to be computed together. If there is no single concept for the return value, split into separate functions. Flag functions that return ad-hoc objects bundling unrelated results.

**Examples:**

> **hooks/useMoveThoughtAnimation.ts**
> Okay, thanks.

FYI A tuple is a composite object, but worse because the entries are unnamed.

> **e2e/puppeteer/helpers/longPressThought.ts**
> I think I'd rather have this functionality in its own helper or in `dragAndDropThought`. I understand the desire to reuse some of the existing logic, but a long press is not a drag-and-drop. It's important that we keep the test API clear and intuitive, and dragging to the `QuickDropPanel` is best understood as a type of drag-and-drop operation.

> **e2e/puppeteer/helpers/simulateDragAndDrop.ts**
> This function can be split into a function for general drag-and-drop (of any element) and a function for dragging and dropping a thought.

```ts
dragAndDrop(page: Page, selectorDrag: string, selectorDrop: string)

dragAndDropThought(
  page: Page, 
  sourceValue: string, 
  destValue: string, 
  { position: 'after' | 'before' | 'child' }
)
```

### ARCH-015
**Arch – do not export symbols that are only used within the same module** (6 hits)

If a function, constant, or type is only used within its own module, remove the export keyword. Unnecessary exports widen the public API surface and make refactoring harder. Flag exported symbols with no external consumers.

**Examples:**

> **selectors/getChildren.ts**
> Is `isChildVisibleWithCursorCheck` still used externally to this module? If not, we can remove `export` and make it internal.

> **components/LayoutTree.tsx**
> `TreeThoughtPositioned` already inherits `isLastVisible` from `TreeThoughts`.

> **util/normalizeThought.ts**
> These are internal API and should not be exported, but not a big issue.

### ARCH-017
**Arch – use getState from thunk arguments, not by importing store directly** (5 hits)

In thunk action-creators, use the getState function provided as the second argument rather than importing store and calling store.getState(). Importing store creates circular dependency risks. Flag store imports in action-creator files.

**Examples:**

> **components/Editable.js**
> You can also use the `dispatch` variable which we have closure over that is passed to the component from `connect`.

> **action-creators/undoArchive.js**
> Use the second argument to the thunk rather than importing the store. See other action-creators for this pattern.

> **action-creators/toggleToolbarAndBreadCrumbs.ts**
> The second argument after `dispatch` is `getState`. Use that to avoid accessing the `store` directly.

### ARCH-011
**Arch – store sensitive or environment-specific values in environment variables** (4 hits)

API endpoints, keys, and environment-specific configuration must not be hardcoded in source files. Use environment variables or gitignored config files. Flag hardcoded URLs, API keys, or environment-specific strings in committed source code.

**Examples:**

> **.env.development**
> Please revert and use `.env.development.local` for your personal Firebase config.

> **constants.ts**
> Presumably `applicationId` should be an environment variable as well.

> **search/getSearchApiKey.ts**
> Let's store this in an environment variable.

### ARCH-034
**Arch - handle pure state-to-state transitions in reducers** (4 hits)

State-to-state logic (e.g. updating showCommandMenu when cursor changes) belongs in a reducer, not in a component hook or action-creator side effect.

**Examples:**

> **components/Editable.tsx**
> I believe this will be covered if we move this logic to the `setCursor` reducer as [mentioned above](https://github.com/cybersemics/em/pull/2874#discussion_r2019971281), allowing us to remove this special case.

> **components/Note.tsx**
> Let's close the Command Menu in the `setCursor` reducer whenever `editing` is set to true. That will cover this case and others without having to dispatch another action, and the logic will be a bit more hidden away.

> **actions/setCursor.ts**
> It would be preferable to push this all the way down to the reducer. Action-creators are better for browser state and side effects, while reducers are better for pure input/output.

Followup on https://github.com/cybersemics/em/pull/2874#discussion_r2019971281.

### ARCH-036
**Arch - dispatch error action-creator instead of bare try-catch or console** (4 hits)

Use dispatch(error(...)) from action-creators rather than swallowing errors or logging directly.

**Examples:**

> **components/SearchSubthoughts.tsx**
> If there is an error I think the global error detection will catch it and alert the user, but we still need a try-catch here to `setIsRemoteSearching(false)`.

> **components/SearchSubthoughts.tsx**
> Let's use our `error` action-creator from `/action-creators/index` since we want to inform the user that something went wrong.

> **stores/virtualKeyboardStore.ts**
> What would cause a `NaN` or `null` height?

Let's avoid `console.warn`. Either the error can be handled, in which case no logging is needed, or it can't be handled, in which a hard error should be thrown or handled higher up.

### ARCH-028
**Arch - reuse existing library helpers instead of reimplementing** (3 hits)

Reuse existing library functions (e.g., hexToRgb/rgbToHex from @mui/material) instead of reimplementing them in the project.

**Examples:**

> **components/icons/AnimatedIcon.tsx**
> You can use `rgbToHex` provided by `@mui/material` which is already included in the project.

> **components/icons/LottieAnimation.tsx**
> If we are using `rgbToHex` from the `@mui/material` library, we should also use `hexToRgb` from the library for consistency. It doesn't matter how simple the implementation is when it has already been implemented for us. 

If implementing it ourselves meant we could remove `@mui/material` as a dependency, that would be a compelling case. As it stands there does not seem to be anything to gain.

> **components/icons/LottieAnimation.tsx**
> I think you can use `hexToRgb` provided by `@mui/material` which is already included in the project.

---

FYI I follow a simple rule when it comes to helper functions: If it's only used in one file, define it in that file. If it's used by multiple files, define it in the `util` directory.

This reduces surface area and provides a more deterministic rule-of-thumb that avoids developers ha...

### ARCH-027
**Arch - define shared constants in constants.ts** (2 hits)

Extract shared constants (e.g., icon scaling factors) into constants.ts rather than repeating them per file.

**Examples:**

> **components/RedoIcon.tsx**
> If the scaling factor is the same for all icons, we should probably add it to `constants.ts` rather than repeating it each time.

> **components/Toolbar.tsx**
> Hoist this into `constants.ts` so that `ToolbarButton` can use it. That will help avoid one getting accidentally changed without the other.

You can give it a more globally unique name, like `TOOLBAR_PRESS_ANIMATION` and add a JSDOC comment that explains its usage.

### ARCH-029
**Arch - place state-mutating logic in reducers, not in selectors** (2 hits)

Selectors must be pure read operations; state-mutating logic belongs in reducers.

**Examples:**

> **selectors/move.ts**
> Why is this a selector rather than a reducer? Selectors are meant to select i.e. read data, so this is a bit confusing.

> **selectors/mergeThoughts.ts**
> I'm also not clear why this is a selector rather than a reducer? It sounds as if it is meant to change state.

### ARCH-019
**Arch – keep web and native platform variants in sync** (1 hits)

When modifying shared logic (e.g., switching from mapStateToProps to useSelector), apply the same change to both the web and native variants of the component. Unnecessary divergence between web and native implementations increases maintenance burden. Flag PRs that change architectural patterns in one platform variant but not the other.

**Examples:**

> **components/Editable.native.tsx**
> I tried this before and it seemed like it made the Editable get re-rendered too often. We can try it again but let's make sure it does not introduce additional re-renders. I believe `connect` shields the child component so that it is not re-rendered when the parent is re-rendered.

Since this is not platform specific, it should be applied to both `Editable.native.tsx` and `Editable.tsx`.

### ARCH-022
**Arch – duplicate config values to avoid tight cross-module coupling** (1 hits)

When two modules need similar configuration values (e.g., shortcut key definitions), duplicate the values rather than importing one module's config into another. Sharing config by reference creates tight coupling between otherwise independent modules. Flag config imports between unrelated modules where duplication would be more appropriate.

**Examples:**

> **shortcuts/indent.tsx**
> In this case we should just duplicate the config, because we don't want this tightly coupled to `moveCursorForward`.

### ARCH-026
**Arch – minimize cross-module DOM coupling; prefer encapsulated data flow** (1 hits)

Modules should not directly read or manipulate DOM elements owned by other modules. Cross-module DOM coupling creates fragile dependencies on DOM structure. Instead, pass data through typed props, Redux state, or store subscriptions. Flag cases where one module accesses DOM nodes created or managed by a different module.

**Examples:**

> **components/ThoughtAnnotation.tsx**
> Worth a try. We want to avoid direct DOM manipulation when possible.

### ARCH-018
**Arch – do not await fire-and-forget background operations**

When an operation is intentionally fire-and-forget (it should run in the background without blocking the caller), do not add await before it. Adding await changes the semantics by making the caller wait for completion. Flag await calls on operations that are designed to run asynchronously in the background.

*(No matching examples in corpus)*

### ARCH-020
**Arch – fix conditions at the source, not the call site**

When a derived value needs special-case handling, fix the logic that produces the value rather than adding an override at the point of use. Overriding at the call site masks bugs in the upstream logic and creates fragile workarounds. Flag code that overrides or ignores a computed value at the point of use rather than correcting its derivation.

*(No matching examples in corpus)*

### ARCH-021
**Arch – document race conditions from async read-modify-write operations**

When performing async read-then-write operations on shared data, the sequence introduces a race condition because the data may be modified between the read and write. If an atomic solution is not readily available, add a TODO comment explaining the race condition and its implications. Flag sequential async read-modify-write patterns on shared data without acknowledgment of the race condition.

*(No matching examples in corpus)*

### ARCH-023
**Arch – initialize DOM listeners in a loading phase, not at module scope**

Do not register document-level event listeners or DOM initialization code at module scope (top-level). Instead, call initialization in a dedicated loading phase so that setup timing is predictable and teardown is possible. Flag top-level document.addEventListener or DOM API calls in module scope.

*(No matching examples in corpus)*

### ARCH-024
**Arch – use metadata flags on entity definitions instead of hardcoding IDs in consuming code**

Component rendering logic should not branch on specific entity IDs (e.g., command names) as hardcoded strings. If an entity needs to opt out of a behavior, the entity definition itself should carry that metadata as a flag. Hardcoding IDs couples the UI to specific entity names and breaks when entities are renamed. Flag conditional logic that branches on specific string literal IDs.

*(No matching examples in corpus)*

### ARCH-025
**Arch – clean or filter data at the point of creation, not consumption**

When data is produced or cloned, apply any necessary filtering or transformation at that point. Do not rely on consumers to clean up data they receive. Cleaning at the consumption point scatters responsibility and makes the data contract unclear. Flag code that modifies or hides properties of received data rather than ensuring correctness before passing it.

*(No matching examples in corpus)*

---

## Code Style
<a id="style"></a>

*19 rules | 340 total hits*

### STYLE-001
**Style – inline single-use variables; do not create unnecessary intermediates** (137 hits)

If a variable is used only once and the expression is simple, inline it directly at the point of use. Do not assign a value to an intermediate variable only to immediately use it once. Flag single-use variables where the expression could be inlined without reducing readability.

**Examples:**

> **e2e/__tests__/caret.ts**
> Could we combine these two lines (or make it possible to do so)?

```ts
const editableNodeHandle = await waitForEditable(page, 'Purple Rain')
```

> **util/treeToFlatArray.js**
> I would just use `childPath.length` inline. Object dereference is cheap and in this case the variable is only one character shorter than the expression.

> **util/initialState.js**
> This is a bit cleaner and does not involve two calls to `getItem`:

```js
splitPosition: JSON.parse(localStorage.getItem('splitPosition') || '0')
```

### STYLE-002
**Style – factor out shared expressions from conditional branches and repeated calculations** (86 hits)

When the same expression appears in both branches of a conditional (or is repeated across multiple calculations), hoist it out. For ternaries, move the shared part outside. For repeated offsets or constants, apply the value once at the call site rather than embedding it in every calculation. Flag code that duplicates the same expression across branches or iterations.

**Examples:**

> **test-helpers/e2e-helpers/clickWithOffset.ts**
> I suggest changing `boundingBox.width` to `boundingBox.width - 1` on L39 instead of here so that the `horizontalClickLine` logic is all in one place.

> **shortcuts/__tests__/undo.ts**
> Maybe this can be ~removed~ moved immediately after `initialize` and the actions can be combined into one dispatch ~once `initialize` is awaited?~

> **util/treeToFlatArray.js**
> Combine nested ternary:

```js
cursor && cursor.length - (isLeaf ? 3 : 2) > 0
  ? cursor.slice(0, cursor.length - (isLeaf ? 3 : 2))
  : RANKED_ROOT
```

### STYLE-005
**Style – prefer functional patterns over classes** (21 hits)

Prefer functional patterns (plain functions, closures, modules) over classes. Do not introduce classes unless there is a compelling reason. Flag new class declarations where a functional approach would suffice.

**Examples:**

> **actions/swapParent.ts**
> Currying really shines in situations like this where `state` is passed through the flow functions, but is not needed for the arguments.

See: c6033652ece

> **util/nativeStorageHelper.ts**
> I'm not sure why the linter is not catching this, but we try to avoid `let` and mutations. This expression can easily be rewritten with a ternary statement.

> **selectors/getChildren.ts**
> Since `getVisibleThoughts` is curried, you can simplify as follows:

```js
export const getVisibleChildrenSorted = getVisibleThoughts(getChildrenSorted)
```

### STYLE-006
**Style – organize imports at the top of the file, grouped by source** (14 hits)

Place all imports at the top of the file and group them by their source module. Follow the existing section conventions (e.g., a 'util' section for imports from util modules). Flag imports that are scattered through the file or placed outside the import block.

**Examples:**

> **components/AppComponent.tsx**
> Group all `useBodyAttribute` first, and all `useBodyAttributeSelector` second for better organization.

> **test-helpers/createRtlTestApp.tsx**
> Let's place the `render` import in the top section of imports. This section is just for components.

> **shortcuts/cursorDown.js**
> This import should go at the top of the file. "util" is reserved for imports from `util.js`.

### STYLE-003
**Style – combine nested if-statements into a single condition** (12 hits)

When an inner if-statement can be merged with its outer if by composing the conditions with &&, do so. Unnecessary nesting reduces readability. Flag if-statements nested directly inside another if-statement where the conditions can be combined.

**Examples:**

> **components/ThoughtAnnotation.tsx**
> You can invert this condition and `return` to short circuit the function and make this a little cleaner by avoiding the extra indentation level.

> **hooks/useHideBullet.ts**
> It would be a bit cleaner to place this condition in the existing return statement.

I try to avoid multiple consecutive return statements.

> **util/nextThought.js**
> When there are no context children, we can allow it to move to the default case. This simplifies this case.

### STYLE-007
**Style – prefer single return with composite boolean expressions** (12 hits)

Prefer a single return statement using composite boolean variables over multiple early returns scattered through the function body. The code structure should mirror the decision structure. Flag functions with multiple return statements that could be expressed as a single composed return.

**Examples:**

> **util/getNextThoughtsWithContextChain.js**
> Having `return` statements interspersed throughout the function makes it harder to see the control flow. Instead, build up the correct result and return it at the end.

> **util/deleteThought.js**
> The multi-line ternary is more compact. Please follow existing project conventions where possible.

> **util/nextThought.js**
> Combine into single logical expression with single return statement. This makes it easier to evaluate the logic as a whole instead of reading fragmented pieces of logic then piecing them together in your head.

### STYLE-011
**Style – break long ternary expressions across multiple lines** (11 hits)

Long ternary expressions should be split across multiple lines: condition on the first line, truthy branch (after ?) on the second, falsy branch (after :) on the third. Flag single-line ternaries that exceed ~80 characters.

**Examples:**

> **reducers/splitSentences.ts**
> This looks good.

I might suggest breaking `existingThoughtChange` onto multiple lines. We usually don't want lines that long.

> **redux-enhancers/undoRedoReducerEnhancer.js**
> Split long lines onto multiple lines for readability. `?` and `:` would be a good place to split this line.

> **util/getSortPreference.js**
> Break long ternary statements into three lines logically corresponding to "if", "then", and "else".

### STYLE-013
**Style – prefer null over undefined for intentional absence of a value** (9 hits)

Use null to represent intentional absence of a value. Reserve undefined for unset optional parameters or uninitialized state. Flag functions that return undefined or false to represent 'no value' when null would be more semantically correct.

**Examples:**

> **reducers/moveThought.ts**
> I'd suggest `duplicateThought && isPendingMerge ? mergeThoughts(...) : null`. A nullable `State` is a better type here than `State | false`.

> **components/Toolbar.tsx**
> Default state should be `null` which makes it more explicit. Empty string is more error prone.

```ts
useState<null | string>(null)
```

> **shortcuts/__tests__/undo.ts**
> Use `thoughtsRanked: null` explicitly with `setCursor`. `undefined` is not a valid value for `cursor`. You can also dispatch `render` if you want to just update `dataNonce`.

### STYLE-012
**Style – declare static constants at module scope, not inside functions** (6 hits)

Constants that do not depend on function arguments or closure variables should be declared at module scope. Declaring them inside functions causes needless re-creation on each call. Flag const declarations inside functions that use only literal values or other module-scope references.

**Examples:**

> **hooks/useCachedNode.ts**
> Would it be possible to instantiate this regex outside the function, or even at compile-time? `new RegExp` is known to be slow, and the className will never change in a given build.

> **util/sync.js**
> You'll want to declare static constants like this outside the function so that they are not redeclared each time.

> **components/CommandTable.tsx**
> `commands` can be calculated at load-time rather than render-time since it does not use any runtime values.

### STYLE-015
**Style – separate pure predicate functions from functions with side effects** (6 hits)

A function whose name implies a boolean predicate (should*, is*, can*) should return only a boolean and not perform side effects. If both a check and an action are needed, split them into separate functions. Flag predicate-named functions that perform side effects or accept callback parameters.

**Examples:**

> **action-creators/newThought.ts**
> Let's make `isDuplicateOnSplit` a function (in the same scope, not in a separate file). That will provide better encapsulation of its inputs and a helpful JSDOC.

> **components/Editable.tsx**
> I don't understand why `preventDefault` is being structured as a callback here. It's redundant with the return type, yet written as if it is independent. It should be handled by the caller.

> **e2e/puppeteer/__tests__/editable-gap.ts**
> I probably wouldn't bundle the editing text value assertion into `isCursorInMiddle`. Were you doing that for efficiency? I think it's probably better to let the function stick to its main purpose.

### STYLE-009
**Style – omit .js file extension in import paths** (4 hits)

Do not include .js file extensions in import paths. Omitting extensions allows files to be renamed to .ts/.tsx without updating all importers. Flag import statements that include .js extensions.

**Examples:**

> **action-creators/newThoughtAtCursor.js**
> Please omit .js suffix so that files can be converted to typescript without having to change the import statements.

> **util.js**
> Let's omit the `.js` extension to make the transition to typescript smoother.

> **util.js**
> Please omit file extension to ease the transition to typescript.

### STYLE-010
**Style – sort collection values for deterministic order before processing** (4 hits)

Object.values() and Set iteration order is implementation-defined. When processing order matters (e.g., rendering, serialization), sort values explicitly before iterating. Flag code that assumes a specific iteration order from Object.values(), Object.keys(), or Set without sorting.

**Examples:**

> **actions/subcategorizeMulticursor.ts**
> Ranks are not unique across contexts, so this isn't safe. You will need to first sort by the parent path, e.g. `hashPath(parentOf(a))`, then sort by rank.

> **util/executeShortcut.ts**
> Same here. You will need to first sort by the parent path, e.g. `hashPath(parentOf(a))`, then sort by rank. Otherwise two thoughts in different contexts of the same depth will be treated as comparable.

> **components/DropHover.tsx**
> I think `draggingThoughts.slice(1)` is wrong for the same reason that `draggingThoughts[0]` is wrong. `draggingThoughts` are unordered so there's nothing special about the first dragging thought.

What would make sense here for multiple dragging thoughts?

### STYLE-014
**Style – invert guard conditions and return early rather than nesting the entire body** (4 hits)

When a guard condition would wrap the entire body of a function or effect in an if-block, invert the condition and return/continue early at the top. This reduces nesting and makes the main logic path clearer. Flag functions where the entire body is wrapped in a single if-block that could be an early return.

**Examples:**

> **components/LayoutTree.tsx**
> Similar opportunity to short circuit. I would probably add `fadeThoughtRef` as well:

```ts
if (!caretRef.current || !fadeThoughtRef.current) return
```

> **commands/generateThought.ts**
> The `return` statement is still there, in the middle of the function. Don't do that.

> **components/TreeNode.tsx**
> Maybe we should short circuit if `!isLastActionSort` to avoid false positives?

### STYLE-025
**Style - apply consistent formatting to code and templates** (4 hits)

Apply consistent formatting: multi-line objects, Prettier for templates, etc.

**Examples:**

> **util/recentlyEditedTree.js**
> I recommend placing each `key: value` pair on a separate line to help readability with all but the smallest object declarations.

> **functions/feedbackEmail.ts**
> I'm not sure what a template engine is but I as just thinking newlines with proper indentation.

> **functions/templates/feedback.hbs**
> Prettify CSS

### STYLE-004
**Style – do not redeclare variables that already exist in the enclosing scope** (3 hits)

If a variable is already accessible from an enclosing scope, do not create a new binding with the same name or value. Flag `const x = ...` declarations where `x` already exists and is accessible in the current scope.

**Examples:**

> **components/TreeNode.tsx**
> Try to avoid re-aliasing a variable. It adds an unnecessary level of indirection.

> **components/GestureDiagram.tsx**
> No reason to redeclare `fullPath`

> **actions/editThought.ts**
> Reusing the existing `sortPreference` in the outer scope will incorrectly cause the rank of `thoughtNew` to change when editing a note value within an alphabetically sorted list.

```
- a
- =sort
  - Alphabetical
    - Asc
  - b
    - =note
      - value
```

This may not have any adverse effect, as note values are expected to be the only child of `=note`, so the rank doesn't matter...

### STYLE-020
**Style - prefer JSX/HTML tag syntax over string concatenation** (3 hits)

Prefer JSX/HTML tag syntax over string concatenation for inline formatting.

**Examples:**

> **actions/importMarkdown.ts**
> Prefer `<strike>{text}</strike>`

> **actions/importMarkdown.ts**
> Prefer `<i>{text}</i>`

> **actions/importMarkdown.ts**
> Prefer `<b>{text}</b>`

### STYLE-019
**Style - prefer async/await over .then() Promise chains** (2 hits)

Prefer async/await syntax over Promise .then() chains.

**Examples:**

> **util/nativeStorageHelper.ts**
> This would be cleaner with `async/await` (and `try/catch` as needed).

> **initialize.ts**
> You can use `await` here instead of `then` syntax.

### STYLE-016
**Style – use static ES module imports; avoid dynamic require() inside functions** (1 hits)

Do not use require() inside function bodies to lazily load modules. Use static ES module imports at the top of the file. Dynamic require breaks tree-shaking and static analysis. Flag require() calls inside functions.

**Examples:**

> **selectors/exportContext.ts**
> I'd prefer a normal import. You can initialize the turndown service when the module is loaded or when the component is initialized.

### STYLE-017
**Style – use named z-index classes instead of hardcoded z-index values** (1 hits)

Reference z-index values via project-defined named classes (e.g., .z-index-popup) rather than hardcoded integer literals. Centralizing z-index values prevents stacking conflicts and makes it easier to reason about layer ordering. Flag hardcoded z-index integer literals in style declarations.

**Examples:**

> **components/dialog/Dialog.tsx**
> You can use a predefined zIndex from the Panda config. This helps ensure we have a consistent total ordering of layered elements.

https://github.com/cybersemics/em/blob/f8df451f3e3a4b45697d4e5d8167ead3373af52c/panda.config.ts#L294-L319.

---

## Documentation & Comments
<a id="docs"></a>

*11 rules | 291 total hits*

### DOCS-001
**Docs – comments should explain intent, not restate code** (99 hits)

Inline comments must explain WHY the code does something — the intent, context, or non-obvious reasoning — not WHAT it does. A comment that restates the code in English adds no value. Flag comments that merely describe what the adjacent code already says.

**Examples:**

> **components/Editable.js**
> Let's move the content above and change to:

```js
// store ContentEditable ref to update DOM without re-rendering the Editable during editing
```

> **recipes/fadeTransition.ts**
> When code is non-obvious, please leave a comment for future developers to make sense of it without having to do a `git blame` and retrace the history.

> **components/Sidebar.js**
> I understand now. In that case, your approach is fine. If you could just leave a comment in the code to clarify this necessity that would be great!

### DOCS-006
**Docs – add JSDoc to functions, hooks, and component prop interfaces** (69 hits)

Functions, hooks, and component prop interfaces should have JSDoc comments that describe their purpose, behavior, and return values. For hooks, document what the returned value (especially refs) represents. For prop interfaces, explain purpose and general behavior without referencing the consuming component's internals. Flag exported functions, hooks, or prop interfaces that lack JSDoc.

**Examples:**

> **.typedoc-plugin-external-module-name.js**
> Can you flesh out this comment more? Explain clearly what the purpose of the module is, and what effect it has on the documentation generation. Thanks!

> **@types/State.ts**
> Let's add a descriptive JSDOC comment here. It should explain the unique semantics of `null`.

(FYI This accidentally picked up the comment for `pushQueue`.)

> **util/head.ts**
> For overloaded functions, you can move the JSDOC above the implementation. It doesn't look as good, but it avoids the need to suppress the linter.

cf00a0321e

### DOCS-007
**Docs – JSDoc must accurately describe the current implementation** (48 hits)

JSDoc comments must match the current behavior of the code. When functionality changes, update the JSDoc to reflect the new behavior. Include algorithmic complexity (e.g., O(depth)) where relevant. Flag JSDoc that describes behavior the code no longer exhibits.

**Examples:**

> **components/PopupBase.tsx**
> Could you clarify the difference between the `Popup` component and the `PopupBase` component in their JSDocs? They currently have the same description.

> **@types/DragThoughtOrFiles.ts**
> Update comment from "thought" to "thoughts". 

It might be a good idea to go through related comments to make sure none are still in the singular.

> **App.css**
> This comment doesn't make sense, as .url is only applied when single-line URLs are ellipsized. Do you mean to prevent cropping/truncating the icon?

### DOCS-005
**Docs – add comments when non-obvious preconditions allow omitting a guard** (24 hits)

When code omits a safety check because a precondition was already verified elsewhere (e.g., a canExecute function already ran), add a comment explaining why the guard is unnecessary. Flag code that relies on non-local preconditions without documenting the assumption.

**Examples:**

> **components/Thought.tsx**
> Got it, sorry about that. I didn't realize it was intentional. Just leave a note for me so that I know next time.

I see they may be needed for drop target color blocking.

> **actions/formatSelection.ts**
> Can you explain the difference between `color` and `colors`? Setting a proper type will help with the understanding as well.

> **@types/DragThoughtItem.ts**
> Can you explain this new field to me?

It needs to be narrowed at least, but I'd like to understand its purpose first.

### DOCS-004
**Docs – be precise in comments; avoid vague terms** (19 hits)

Comments must use specific, unambiguous language. Avoid subjective or relative terms like 'correct', 'proper', or 'appropriate' without defining what they mean in context. Flag comments that use vague terms where a precise description would be clearer.

**Examples:**

> **.eslintrc.json**
> You can use the actual url here. `bit.ly` links give you no indication about the destination, forcing you to click on it to learn anything about the source.

> **hooks/useFauxCaretCssVars.ts**
> "keyboard is open" not "keyboard input mode is on"

Please make this change in all other comments that refer to this as "keyboard input mode".

> **util/recentlyEditedTree.js**
> The last part doesn't make sense: `the updating just its descendants like A.E.O.M to A.EM.O.M.` Can you find a different way to say this?

### DOCS-012
**Docs - explain non-obvious values, formulas, and behavior with inline comments** (17 hits)

Add comments explaining non-obvious values, magic numbers, math, or behavior.

**Examples:**

> **components/Editable.tsx**
> When adding behavior like this that may not be obvious to other developers, it might be good to leave a descriptive comment and link to the issue.

> **components/Editable.tsx**
> When adding behavior like this that may not be obvious to other developers, it might be good to leave a descriptive comment and link to the issue.

> **components/Bullet.tsx**
> Let's add a descriptive comment explaining the need for the rounding since it is not obvious from the code. You can include a link to the issue.

### DOCS-008
**Docs – prefer block JSDoc comments over @param annotations** (6 hits)

Use /** ... */ block comments to describe function behavior rather than @param annotations. Block comments surface in VS Code IntelliSense on hover, while @param annotations may not. Flag functions that use @param annotations instead of a descriptive block comment.

**Examples:**

> **actions/importData.ts**
> Parameters should be described with JSDOC comments to make it easier for other developers to understand the use of this action.

> **hooks/useIsVisible.ts**
> It appears `@param` comments do not work with VS Code's IntelliSense, but `/** ... */` comments do.

<img width="435" src="https://github.com/user-attachments/assets/20c87102-cc0d-4c80-9e9b-7d2b021d868c">

9eef751896

> **components/Breadcrumbs.js**
> These comments are very helpful, thank you! 

You may want to do parameter comments in JSDoc format, [like here](https://github.com/cybersemics/em/blob/6c05e049e05aac1bb6425f20685408e52893445e/src/components/GestureDiagram.js#L9-L14).

### DOCS-009
**Docs – use // for inline comments; reserve /** */ for function and type declarations** (4 hits)

Use // comments for inline code annotations. Reserve JSDoc /** ... */ block comments for documenting functions, hooks, classes, and type declarations. Do not use /** */ for inline explanatory notes inside function bodies. Flag /** */ comments used for inline annotations rather than declarations.

**Examples:**

> **initialize.ts**
> This should be a normal comment, not a JSDOC-style comment, which is reserved for variable, function, class, and module declarations.

> **shortcuts/__tests__/deleteEmptyThoughtOrOutdent.ts**
> Use JSDOC-style comments `/** ... */` only for function, module, and class declarations. Use plain `// ...` comments for other code.

> **util/checkIfPathShareSubcontext.js**
> Use `//` single-line comments for regular comments, `/*` block comments for JSDOC and comments longer than 2 lines.

### DOCS-010
**Docs - place comments above the line, not at end-of-line** (3 hits)

Put comments above the code line rather than at the end of the line.

**Examples:**

> **recipes/fadeTransition.ts**
> I slightly prefer placing the comment above `_safari` since it only applies to that section, not all of `disappearingUpperRight`.

> **components/ThoughtAnnotation.js**
> Place this comment before the line rather than at the end. Comments should only go at the end if they are very short, and the overall line length is no more than 75-100 characters.

> **components/DropHover.tsx**
> Small tip: I recommend generally placing comments above the line, instead of on the same line. This results in a cleaner git diff, making it clearer when the code or the comment has changed independently.

### DOCS-003
**Docs – do not reference line numbers in comments** (2 hits)

Never reference specific line numbers in code comments. Line numbers become stale as code changes and create misleading references. Flag any comment that mentions a line number (e.g., 'see line 42').

**Examples:**

> **App.css**
> We should avoid specifying exact line numbers in comments, as they are quickly invalidated if any code is added or removed above.

> **constants.ts**
> All you've done is factor out the variable, but the padding in `Content.tsx` remains completely decoupled.

Please ensure that these are *programmatically* coupled. Comments are not a substitute for the type system. Line numbers in comments are even worse, as they will be invalidated when the file changes.

Continuation of https://github.com/cybersemics/em/pull/3103#discussion_r2190805150

### DOCS-002
**Docs – keep inline comments concise and targeted**

Inline comments should be 1-2 sentences that answer a specific question. Long, discursive comments should be shortened to their essential point. Flag comments that are significantly longer than the code they annotate or that ramble beyond a single concern.

*(No matching examples in corpus)*

---

## Testing
<a id="test"></a>

*29 rules | 272 total hits*

### TEST-007
**Test – use minimal, semantic selectors; prefer data-testid or aria-label** (34 hits)

Test selectors should be minimal and semantic. Prefer data-testid or aria-label attributes over class names, IDs, or deeply nested CSS paths. Avoid chaining multiple ancestor selectors that make tests brittle to markup changes. Flag test selectors that use class names, IDs, or deeply nested CSS chains.

**Examples:**

> **components/__tests__/SubThought.js**
> In general, we want the minimal, semantic selector that identifies the relevant element for the test. This will be more resilient to markup changes.

> **e2e/iOS/helpers/getEditingText.ts**
> I think this should be `[data-editing=true] .${editable()}` (added: `.`)

I'm curious if this will work inside the webdriver's browser context.

> **components/__tests__/SubThought.js**
> `.transformContain` is not relevant for this test. We should try to write selectors that are semantically relevant for the current test.

### TEST-001
**Test – test descriptions must match what the test actually asserts** (32 hits)

The test description string (it/test first argument) must accurately describe the behavior being verified. If the test asserts that a split does NOT occur, the description must not say 'splits'. Flag test descriptions that contradict or misrepresent the assertion.

**Examples:**

> **commands/__tests__/splitSentences.ts**
> The test title is misleading, as none of the thoughts contain a dash. Maybe "does not split decimal numbers" would be more accurate.

> **commands/__tests__/undo-redo.ts**
> Since you are exporting as text/plain, this doesn't actually test if the formatting was undone. You need to export as text/html.

> **redux-middleware/__tests__/pushQueue.ts**
> This test description is too implementation specific. We need to frame it in terms of the user's experience. What actions is the user taking, and what is the expected result?

### TEST-005
**Test – assert all related data integrity constraints** (32 hits)

When testing data mutations, assert all correlated invariants — not just the primary field. For example, if creating a contextIndex entry, also assert that the corresponding lastUpdated field exists. Flag tests that verify one aspect of a data structure but ignore closely related fields that should also be checked.

**Examples:**

> **util/__tests__/importRoam.ts**
> If you make assertions in a loop, you also need to assert the expected length of the array. Otherwise if no results came back the test would incorrectly pass.

> **reducers/__tests__/existingThoughtMove.ts**
> You'll want to test `getContexts` as well, since `exportContext` is only touching `contextIndex` while `getThought` or `getContexts` will touch `thoughtIndex`.

> **commands/__tests__/extractThought.ts**
> If a thought with the text `this is a thought` still exists, then `extractThought` didn't work. It would have extracted "thought".

### TEST-002
**Test – use clearly placeholder-named test data** (27 hits)

Test fixture data should use obviously generic placeholder names (e.g., 'Example Title', 'Title', 'a', 'b') so readers know the specific value is not meaningful to the test logic. Flag test data that uses realistic-looking but arbitrary values that could mislead readers into thinking the value matters.

**Examples:**

> **selectors/__tests__/getChildResolvedPath.ts**
> You have to import the thoughts first for this to be a valid `setCursor` call. At the moment it does not error, but we should expect this to not work.

> **selectors/__tests__/getChildResolvedPath.ts**
> `/m` and `/a` can't have the same rank since they are both in the root context. Not relevant for this test, but invalid states could lead to inconsistencies later on.

> **reducers/__tests__/deleteEmptyThought.ts**
> Also, let's use an inert hidden thought like `=one` or `=test` rather than `=archive`. `=archive` is a special case and usually is deleted permanently when it is archived.

### TEST-004
**Test – prefer callable helper functions over test-name-based heuristics** (26 hits)

Test setup should use explicit callable helper functions, not regex matching against test names or feature flags. If a test needs special setup, call a helper function directly rather than detecting the test name at runtime. Flag test infrastructure that inspects test names to determine behavior.

**Examples:**

> **actions/__tests__/addAllMulticursor.ts**
> Let's use `addMulticursorAtFirstMatch` in all multicursor tests, and implement `removeMulticursorAtFirstMatch` for similar readability.

> **action-creators/__tests__/cursorPrev.js**
> This line won't do anything, since you're not using the return value. `setCursorFirstMatch` is a reducer, so it returns the new state.

> **e2e/puppeteer/helpers/index.ts**
> Yeah, I don't think this is so good. We need a more imperative way to set this explicitly on a per-test basis, such as a testFlag.

### TEST-006
**Test – do not use arbitrary sleep/delays in tests; wait for specific conditions** (23 hits)

Do not use sleep(), setTimeout, or hardcoded delay values in tests. Use polling helpers (waitUntil, waitFor) that check for specific DOM or state conditions. Hardcoded waits slow CI and create flaky tests. Flag sleep/setTimeout calls in test files.

**Examples:**

> **e2e/puppeteer/__tests__/drag-and-drop.ts**
> Can you explain this? Slowing down each of the drag-and-drop tests by 1000s is a major impact on the test performance. Maybe we can find a better way.

> **e2e/puppeteer/test-puppeteer.sh**
> What is this 5 seconds for? Any way we can do polling instead? We want to shave off any time we can from the puppeteer tests, as they are already quite slow.

> **e2e/puppeteer/helpers/waitForEditingState.ts**
> I'm not willing to slow down the tests with retries and delays. You'll have to get to the bottom of why the categorize button does not work.

### TEST-011
**Test – exercise real code paths; do not mock the function under test** (21 hits)

Tests must exercise the actual code they verify. Do not mock the primary function under test. Do not modify source code to behave differently in test environments. Do not use snapshot tests to verify behavioral outcomes — use explicit assertions instead. Flag tests that mock their primary subject, source files with NODE_ENV branches, or snapshot tests used for behavior.

**Examples:**

> **e2e/puppeteer/__tests__/__image_snapshots__/modal/modal-help.png**
> It looks like the search icon is missing from the snapshot. 

Ideally we want the search icon to be included so we have visual regression coverage over it.

> **e2e/puppeteer/__tests__/color.ts**
> This test will break of the particular blue hue is changed. See if you can find a way to decouple the test from the particular theme colors.

> **App.js**
> What if we called `initialize` in onComponentMount of the `App` component? Then it would only load when the `App` itself loaded, and we could avoid test detection.

### TEST-012
**Test – interact with the UI the way a user would; assert through rendered output** (12 hits)

Tests should interact with components via user-centric APIs (RTL events, clicks, keyboard input), not by dispatching Redux actions directly. Assert through rendered UI (screen.getByText, queryByRole), not by reading Redux state. Simulate interactions at the exact element a user would interact with. Flag tests that dispatch to the store or read store state instead of using RTL APIs.

**Examples:**

> **test-helpers/e2e-helpers/clickEditable.ts**
> Ah, must have been a miscommunication. The test case is the other. It should click to the left of the thought, outside the editable.

> **e2e/__tests__/editContext.ts**
> This is creative, though we want to emulate the actual keyboard typing with [page.type](https://pptr.dev/#?product=Puppeteer&version=v9.0.0&show=api-pagetypeselector-text-options).

> **components/__tests__/Bullet.ts**
> We already have reducer tests that make assertions about the Redux state, so we actually want to avoid accessing or exporting the state in the component tests.

The component tests should test what is rendered to the DOM.

### TEST-013
**Test – test both directions of conditional behavior** (9 hits)

When testing conditional behavior (if A then B), also test the inverse (if not A then not B). A test that only asserts one direction can pass even when the implementation is incorrect. Flag test files that verify a condition's positive case without a corresponding negative case.

**Examples:**

> **e2e/puppeteer/__tests__/thought-trim.ts**
> It would be good to have one test for paste and one test that creates a thought and types a value with spaces at the beginning/end. Otherwise we're only testing the paste case.

> **components/__tests__/SortPicker.ts**
> The tests look good!

Let's add a test for mixed lists that contain some thoughts with notes and some thoughts without.

> **shortcuts/__tests__/extractThought.ts**
> One more requirement to test:

- Activating with no selection results in an alert: "No text selected to extract"

### TEST-008
**Test – fail hard on unexpected states; do not silently continue** (8 hits)

In tests, if an expected element or condition is not found, throw an error or use a hard assertion immediately. Do not silently continue past unexpected states, as this masks real failures. Flag try-catch blocks in tests that swallow errors without asserting.

**Examples:**

> **e2e/puppeteer/helpers/mockGestureMenuCommands.ts**
> Do not silently fail if `popup` is not defined. Silently ignoring unexpected states in tests is a bad idea. Fail hard if things are not as expected.

> **e2e/puppeteer/helpers/dragAndDropThought.ts**
> Since this is in the context of testing, you generally want to `throw` instead of silently returning. Tests should fail hard if any of the preconditions are invalid.

> **e2e/puppeteer/helpers/mockGestureMenuCommands.ts**
> Silently ignoring unexpected states in tests is a bad idea. Fail hard if things are not as expected, or assume elements are present to avoid adding noise to the tests.

### TEST-029
**Test - add test coverage for untested features and edge cases** (8 hits)

Add test coverage for untested features or edge cases identified during review.

**Examples:**

> **reducers/__tests__/existingThoughtMove.ts**
> Let's save this test for our next fix. Please write a test specifically for this fix. It should pass when run on the PR, but fail if it were to be run on current `dev`.

> **selectors/__tests__/expandThoughts.ts**
> Let's also add a test for the [clearMulticursors](https://github.com/cybersemics/em/pull/2704#pullrequestreview-2507726298) case.

> **components/__tests__/ThoughtDelete.js**
> This looks good, and we will need a test for the `delete` shortcut which deletes a non-empty thought.

### TEST-010
**Test – initialize shared mutable state in beforeEach, not beforeAll** (7 hits)

Shared mutable state (such as test store instances) should be initialized in beforeEach so each test starts fresh. beforeAll allows state from one test to bleed into the next, causing order-dependent failures. Flag beforeAll blocks that initialize mutable state shared across tests.

**Examples:**

> **e2e/puppeteer/__tests__/snapshot.ts**
> Please add this to the puppeteer [teardown](https://github.com/cybersemics/em/blob/6275018b29631e5d7939fab42e677b8137b8b00d/src/e2e/puppeteer-environment.ts#L46) function.

> **components/__tests__/Subthoughts.js**
> Good catch, we definitely need to reset this on each test. 

I believe this should go in `cleanupTestApp`.

> **shortcuts/__tests__/newThoughtOrOutdent.js**
> This should probably be assigned in `beforeEach`, otherwise data could carry over between tests.

### TEST-003
**Test – use queryByLabelText for single-element assertions, not queryAllByLabelText** (6 hits)

When asserting the presence or absence of a single accessible element, use queryByLabelText (singular) rather than queryAllByLabelText (plural). The singular query communicates that exactly one element is expected. Flag queryAllByLabelText calls followed by [0] indexing or length === 1 checks.

**Examples:**

> **components/__tests__/Note.ts**
> Let's use `screen.queryByLabelText('note-editable')`. It is equivalent, but `queryByLabelText` is more in line with RTL philosophy of not tightly coupling to the DOM structure.

> **shortcuts/__tests__/extractThought.ts**
> We need a query that returns one thought rather than two here in order to more closely match what the user sees. Whatever it is returning two for is an implementation detail that should not be tested against.

> **components/__tests__/Note.ts**
> Use `queryByLabelText`

### TEST-009
**Test – test utility logic at the utility layer, not through component tests** (6 hits)

Unit test utility functions and pure logic in their own test files adjacent to the module, not through higher-level component tests. Testing deep logic through mounted components makes tests slow, brittle, and hard to diagnose. Flag component tests that primarily exercise utility function logic.

**Examples:**

> **components/__tests__/Subthoughts.js**
> Rather than test the detailed comparison functionality within the Subthoughts component, we should test it lower down, in `util/__tests__/compareThought.js`.

> **e2e/puppeteer/__tests__/cursor-move.ts**
> Any reason you changed this to a puppeteer test? We really want to use RTL tests when possible since puppeteer tests are so slow.

> **actions/__tests__/cursorUp.ts**
> Is there a reason you did a full shortcut test instead of a reducer test? Generally reducer tests are going to be faster and more minimal because they do not require `act`.

### TEST-026
**Test - e2e helper functions should use named options objects** (6 hits)

E2e test helper functions should use named options objects rather than positional or implicit parameters.

**Examples:**

> **e2e/puppeteer/helpers/simulateDragAndDrop.ts**
> Can you structure the options as an object, i.e. `{ drag: true, drop: true }`? This will make it a little more readable at the call site.

> **e2e/puppeteer/helpers/dragAndDropThought.ts**
> Please add `mouseUp` as an optional property in the `DragAndDropOptions` object. `mouseUp: true` is more readable at the call site than a positional boolean variable.

> **e2e/puppeteer/__tests__/snapshot.ts**
> I think I would prefer an API of:

```ts
await dragAndDropThought('x', 'd', { position: 'uncle' })
```

which would mean "drag `x` after `d`, as its uncle."

`childrenCount` will not work for multiline thoughts in either col1 or col2.

### TEST-027
**Test - remove duplicate test cases** (5 hits)

Do not include duplicate or redundant test cases.

**Examples:**

> **commands/__tests__/archive.ts**
> The other test already covers this case, so the new test is effectively a duplicate and can be removed.

> **components/__tests__/SortPicker.ts**
> This test looks identical to the one above. Did you have something else in mind?

> **selectors/__tests__/expandThoughts.ts**
> This is identical to the "ancestors of a multicursor path are expanded" test

### TEST-015
**Test – use the most specific Jest matcher available** (3 hits)

Use specific Jest matchers (toHaveLength, toBeNull, toBeUndefined, toContain) rather than generic comparisons (toBe with .length, toBe(null)). Specific matchers produce more informative error messages on failure. Flag expect().toBe() patterns that could use a more specific matcher.

**Examples:**

> **e2e/__tests__/editContext.ts**
> Use `expect(updatedFirstThought).toBe('apple')` in order to get more readable output from the testing framework. i.e. Inform it that we're testing a string rather than a boolean.

> **db.test.js**
> Use `toHaveLength`

### TEST-017
**Test – encapsulate repeated test interactions and DOM queries in named helper functions** (2 hits)

When the same multi-step interaction, DOM query, or test setup pattern appears in multiple tests, extract it into a named helper function. This decouples tests from implementation details and reduces duplication. Flag repeated inline interaction sequences (3+ lines) across test files that could be a helper.

**Examples:**

> **redux-middleware/__tests__/pushQueue.ts**
> I believe we've used this simulated page refresh in a number of places at this point. What do you think about encapsulating this in a test helper?

> **e2e/puppeteer/__tests__/quickdrop-panel.ts**
> This pattern of reading the alert content is used multiple times. Might benefit from a helper function?

### TEST-018
**Test – omit outer describe block when there is only one group in the file** (2 hits)

If all tests in a file belong to one logical group, omit the outer describe block. Jest displays the file path in test output, which already provides grouping context. Flag files with a single top-level describe block whose name matches the filename or module.

**Examples:**

> **selectors/__tests__/exportContext.ts**
> You can omit the outer `describe` since Jest groups the tests by filename.

> **e2e/puppeteer/__tests__/color.ts**
> You can omit the `describe` block in this case.

### TEST-030
**Test - split tests covering multiple behaviors** (2 hits)

Split tests that cover multiple independent behaviors into separate cases.

**Examples:**

> **e2e/puppeteer/__tests__/color.ts**
> Does this test assert both empty `<font>` and `<span>`? If so, it should be split into two tests.

Does the test only assert one? In that case, the test title should be specific and say just the one that it asserts.

### TEST-025
**Test – assert exact expected values, not relative or inequality conditions** (1 hits)

Test assertions should specify the exact expected value rather than a relative condition (e.g., > 0, !== null). An exact assertion documents expected behavior precisely and catches regressions that a relative assertion would miss. Flag assertions that use inequality conditions when the exact expected value is known.

**Examples:**

> **util/__tests__/importText.ts**
> Let's remove the `trim`; I think in all our tests we do an exact match on the `importExport` result.

### TEST-014
**Test – place test files adjacent to or under the module they test**

Test files must be placed in a directory that corresponds to the module being tested (e.g., /src/__tests__/ or /src/db/__tests__/), not in an unrelated directory. Flag test files placed in directories that do not correspond to the module under test.

*(No matching examples in corpus)*

### TEST-016
**Test – omit module name prefix from individual test descriptions**

Do not prefix individual test descriptions with the module name. Jest includes the file path in output, making the module name prefix redundant and verbose. Flag it/test descriptions that start with the module name.

*(No matching examples in corpus)*

### TEST-019
**Test – use multiple representative data points, not a single example**

Test cases that check behavior over collections should include multiple items, not just one. A test that passes with a single child may fail with multiple children due to off-by-one or ordering bugs. Flag tests that use a single-element collection when the behavior under test operates on collections.

*(No matching examples in corpus)*

### TEST-020
**Test – cover related edge cases in the same PR**

When adding a test for a new feature or bug fix, also add tests for related edge cases identified during review. Do not leave obvious variant cases uncovered when they can be addressed in the same PR. Flag PRs that test the primary case but omit closely related edge cases.

*(No matching examples in corpus)*

### TEST-021
**Test – add or update tests when modifying utility functions**

When modifying existing utility functions, add or update tests to cover the changed behavior. Utility function changes without corresponding test updates are a regression risk. Flag PRs that modify utility function logic without adding or updating tests.

*(No matching examples in corpus)*

### TEST-022
**Test – place global test mocks in setupTests, not per-file**

Global mocks needed by many tests (e.g., document.execCommand) should be set up in the shared setupTests file rather than duplicated in beforeEach/afterAll blocks in individual test files. Flag mock setups that appear in multiple test files when they could be centralized.

*(No matching examples in corpus)*

### TEST-023
**Test – add regression tests for documented bug fixes**

When fixing a bug, add a test that captures the correct state so the bug cannot silently reappear. This is especially important for visual or structural regressions where the fix addresses a specific, reproducible problem. Flag bug-fix PRs that do not include a regression test.

*(No matching examples in corpus)*

### TEST-024
**Test – assertions must be robust to browser and environment variation**

Test assertions should not rely on values that may differ across browser widths, operating systems, or other environmental factors (e.g., exact caret offset after line wrapping). Assert on stable invariants or constrain the environment so the assertion holds consistently. Flag assertions that depend on pixel positions, line wrapping, or other environment-sensitive values.

*(No matching examples in corpus)*

---

## Naming
<a id="naming"></a>

*7 rules | 260 total hits*

### NAMING-002
**Naming – names must accurately describe what they represent** (165 hits)

Variable, function, hook, and option names must accurately describe the value they hold, the action they perform, or the concept they abstract. Function names should describe their return value (e.g., getRootPath not getRoot). Hook names should surface the underlying library or concept (e.g., useRxCollection not useObserveCol). Flag names that are vague, misleading about the value's type, or that fail to describe what the identifier actually represents.

**Examples:**

> **components/Divider.tsx**
> Thanks, this is much better.

Let's call this `dependentThoughtIds`. 

Could you also add a couple inline comments that explain the two branches?

> **components/Divider.tsx**
> Thanks, this is much better.

Let's call this `dependentThoughtIds`. 

Could you also add a couple inline comments that explain the two branches?

> **utilTypes.ts**
> `MimeType` would be a more appropriate name.

A type should generally be in the singular. The plural would likely be its own array or collection type.

### NAMING-001
**Naming – follow casing conventions (camelCase variables, PascalCase types)** (58 hits)

Use camelCase for variable and function names. Reserve PascalCase for types, interfaces, and classes. Follow the project's existing capitalization conventions for identifiers and filenames (e.g., Superscript not SuperScript). Flag any identifier that deviates from these casing conventions.

**Examples:**

> **redux-middleware/remoteSync.ts**
> Let's use the term `remoteSubscribe` rather than `remoteSync` since it handles subscribing to remote changes and sync could also refer to pull or push.

> **@types/State.ts**
> Let's call this `showGestureCheatsheet` to follow the convention of `showLetterCase`, `showColorPicker`, `showCommandPalette`, `showModal`, etc.

> **components/Subthoughts.js**
> Let's initialize this to `0` and update the dependent logic accordingly. It is more conventional to start counting at `0` in programming due to array indices.

### NAMING-005
**Naming – use project domain terminology over generic terms** (14 hits)

Use the project's established domain vocabulary when naming variables and parameters. For example, use 'child' (the domain concept for a Path node) not 'pathItem' (a generic implementation term). When the project's type system defines a concept, identifiers should reflect that terminology. Flag identifiers that use generic or implementation-oriented terms when an established domain term exists.

**Examples:**

> **reducers/join.ts**
> Since `pathToContext` converts the `Path` to a `Context`, it's actually unranked. `context` would be a better name.

> **util/mergeUpdates.ts**
> Let's just call these "thoughts" rather than "parents". Usually we reserve parents to refer to `thought.parentId`.

> **reducers/updateThoughts.ts**
> Also regarding terminology: a [`Path`](https://github.com/cybersemics/em/wiki/Technical-Overview#314-path) consists of `Child` nodes from different `Parents`. So I renamed `pathItem` to `child`.

### NAMING-006
**Naming – file name must match the primary default export** (7 hits)

Each file should be named after its primary default export. If a component or function is the sole export, the file name must match exactly. Flag files whose name does not match their default export.

**Examples:**

> **components/dialog/GestureCheatsheet.tsx**
> Just noticing this, but could you rename `disableScroll.ts` to `allowScroll.ts`? I'd like to follow the convention that filenames match the name of the default export.

> **components/icons/StarIcon.tsx**
> The file name should always match the component name, so rename this file to `FavoritesIcon.tsx`.

> **util/flatRender.js**
> We have a convention to name the file the same as the function when there is a single export.

### NAMING-009
**Naming - action-creator imports must follow the ActionCreator suffix/alias convention** (7 hits)

Action-creator imports must use the ActionCreator suffix and alias convention.

**Examples:**

> **components/Note.tsx**
> ```ts
import { keyboardOpenActionCreator as keyboardOpen } from '../actions/keyboardOpen'
```

> **hooks/useLongPress.ts**
> ```ts
import { keyboardOpenActionCreator as keyboardOpen } from '../actions/keyboardOpen'
```

> **util/handleKeyboardVisibility.ts**
> ```ts
import { keyboardOpenActionCreator as keyboardOpen } from '../actions/keyboardOpen'
```

### NAMING-003
**Naming – avoid confusingly similar names for related identifiers** (5 hits)

Do not introduce identifiers that are near-duplicates of existing ones (e.g., initState and initialState). When related identifiers coexist, their names must clearly distinguish their roles. Flag any new identifier that could be confused with an existing one in the same scope or module.

**Examples:**

> **actions/formatSelection.ts**
> We need better naming here. `newValue` and `newThoughtValue` are too similar. You should probably rename `newThoughtValue` if there is something newer.

> **util.js**
> Having both `initState` and `initialState` is very confusing. Let's come up with a more coherent strategy where we either combine them or come up with better names.

> **components/Tutorial/TutorialUtils.js**
> Why take both `rootSubthoughts` and `rootChildren`? They're the same thing, just accidentally split up due to a renaming mixup.

### NAMING-004
**Naming – name properties from the owning module's perspective** (4 hits)

A hook's or module's exported values should be named for what they represent within the module's own domain (e.g., 'hide', 'styles'), not prefixed with context that only makes sense to the caller. Flag returned properties that are named from the consumer's perspective rather than the provider's.

**Examples:**

> **hooks/useLottieIntervalAnimation.ts**
> Arguably "focus" and "Lottie" shouldn't be mentioned in the JSDOC or the name of the hook, since you actually have written something more general than that. Those are choices of the caller.

> **util/voidAreaDetection.ts**
> This function and its comments make a lot of references to a "tap", but as far as I can tell that's only *how* this function is used by the caller. The function itself only knows that it is finding an offset relative to the point that was passed it. It's usually better to avoid having callees know about callers and how they are being used.

> **components/Breadcrumbs.js**
> To preserve modularization, `Breadcrumbs` should not be aware of its container, so we don't want `isThoughtsTab` being passed here, at least not in those terms. If it were functionally necessary, we could rename it to something more descriptive of the change in behavior rather than the ancestor component. In this case however, since it's only a CSS change, I think it may be best to use a descen...

---

## Code Hygiene
<a id="hygiene"></a>

*8 rules | 194 total hits*

### HYGIENE-001
**Hygiene – remove debug artifacts before merging (console.log, debug try-catch, etc.)** (155 hits)

Remove all debug scaffolding before pushing: console.log statements, accidental try-catch blocks, debugger statements, and other temporary instrumentation. Run the linter before pushing. Flag any console.log, debugger statement, or try-catch block that appears to be leftover debug scaffolding.

**Examples:**

> **components/Toolbar.tsx**
> No need to make it conditional. We always want this behavior. 

The `handleMouseUp` parameter was masked by the local variable with the same name btw.

> **components/CommandTable.tsx**
> While we're at it, could you remove `command is Command` from here and L131? I believe Typescript now infers the correct return type of `filter`.

> **components/icons/LottieAnimation.tsx**
> Instead of `console.warn`, we likely either want to fully allow `null` (by not throwing a warning) or fully disallow `null` (by not allowing it in the type).

### HYGIENE-002
**Hygiene – document why eslint-disable comments are needed** (13 hits)

Linter rules must not be suppressed via eslint-disable comments without a clear inline explanation of why the suppression is necessary. Flag eslint-disable comments that lack a justifying explanation.

**Examples:**

> **util/__tests__/validateRoam.ts**
> Okay, good to know. In that case I guess we need to disable the linter and leave a comment that explains that we are just using destructuring to get the `rest`.

> **util/nativeStorageHelper.ts**
> This can be fixed without having to disable the linter:

```
const syncStorage = new syncStorage
export default syncStorage
```

> **components/icons/IndentIcon.tsx**
> I'm not sure why `react-refresh/only-export-components` is needed here, since it is a component. does it need to be typed as `FC`?

### HYGIENE-006
**Hygiene - fix typos in identifiers, comments, and strings** (13 hits)

Fix spelling mistakes and typos in identifiers, comments, and user-facing strings.

**Examples:**

> **util/splitSentence.ts**
> There is a typo: `spliters` should be `splitters`. Please do a search and replace to fix all instances of `spliter`.

> **e2e/puppeteer/helpers/dragAndDropThought.ts**
> Incorrect capitalization and typo: "hought" → "thought".

> **test-helpers/e2e-helpers/clickEditable.ts**
> Typo: `offsetCooridinates` → `offsetCoordinates`

### HYGIENE-005
**Hygiene - remove unused variables, parameters, props, and dead code** (7 hits)

Remove dead code: unused parameters, variables, props, or test assertions.

**Examples:**

> **components/Sidebar.js**
> We can remove `_.sortedUniqBy` since the tree eliminates duplicates now.

Should also be able to get rid of the `eslint-disable-line` as well.

> **components/TreeNode.tsx**
> If `marginRight` is no longer used, this prop can be removed.

> **components/VirtualThought.tsx**
> If `marginRight` is no longer used, it can be removed.

### HYGIENE-008
**Hygiene - use appropriate console log level (error/info/warn)** (4 hits)

Use the correct console log level (console.error/info/warn) rather than console.log.

**Examples:**

> **e2e/puppeteer-environment.js**
> Use `console.info` for informational logging and preserve `console.log` for debugging.

> **functions/index.ts**
> Use `console.error` instead of `console.log` when logging errors.

> **e2e/puppeteer-environment.ts**
> Use `console.error` so you don't have to suppress the linter.

### HYGIENE-007
**Hygiene - do not commit unintended changes to package-lock.json** (2 hits)

Revert accidental changes to package-lock.json.

**Examples:**

> **package-lock.json**
> Please reset the `package-lock.json`. We don't want to set `resolved: false`.

> **package-lock.json**
> Revert `package-lock.json`

### HYGIENE-003
**Hygiene – replace existing assets rather than adding new versions alongside them**

When updating an asset (image, file), replace the existing one rather than adding a new file alongside it. Multiple versions of the same asset create confusion about which is canonical. Flag PRs that add new asset files when the intent is to update an existing one.

*(No matching examples in corpus)*

### HYGIENE-004
**Hygiene – rename files via git mv to preserve commit history**

When a file needs to be renamed, use git mv (or an equivalent rename) rather than creating a new file and deleting the old one. Renaming preserves commit history, making it easier to understand the provenance of the code. Flag PRs that delete a file and create a new one with similar content under a different name.

*(No matching examples in corpus)*

---

## App (em Domain Model)
<a id="app"></a>

*23 rules | 151 total hits*

### APP-002
**App – Paths must start at ROOT; build from cursor or selectors** (31 hits)

Every Path must begin at ROOT. Do not construct Paths starting from an arbitrary ThoughtId. Use the cursor or existing selectors (e.g., simplifyPath, contextToPath) to obtain Paths — do not reconstruct them via heuristics like rankThoughtsFirstMatch. Flag Path construction that does not start from ROOT or that uses heuristic-based reconstruction.

**Examples:**

> **reducers/deleteThought.ts**
> This isn't a valid way to construct a Path, as a Path must start at the ROOT. You probably want something like `[...parentOf(state.cursor), prevThought.id]`.

> **reducers/existingThoughtChange.js**
> `rankThoughtsFirstMatch` is off limits. It merely guesses at the ranks, and should only be used for restoring the cursor from a lossy url.

> **shortcuts/__tests__/redo.ts**
> `[{ value: 'b', rank: 0 }]` is not a valid `Path` since `b` was indented to become `[{ value: 'a', rank: 0 }, { value: 'b', rank: 0 }]`.

### APP-006
**App – use selector functions; do not access thoughtIndex or contextIndex directly** (26 hits)

Always use selector functions (getThought, getAllChildren, getParent, etc.) to look up thoughts. Never access state.thoughts.thoughtIndex or state.thoughts.contextIndex directly. Direct index access bypasses selector logic and creates tight coupling to the state shape. Flag direct property access on state.thoughts.thoughtIndex or contextIndex.

**Examples:**

> **db.test.js**
> Please use the `getThought` selector. We never want to access `thoughtIndex` directly, as then we will be tightly coupled to the implementation details.

> **util/getNextThoughtsWithContextChain.js**
> I recommend using `getThought` in cases like this. You should not be accessing `thoughtIndex` directly, but instead using the selectors and accessor methods.

> **action-creators/preloadSources.ts**
> We always want to avoid low-level thought access in higher level functions. Use `getParent`, `getParentThought`, or (if we create it) `getThoughtById`, as needed.

### APP-001
**App – use 'shortcut' not 'command' for keyboard/gesture actions** (11 hits)

In comments, UI copy, and identifier names, use 'shortcut' when referring to keyboard or gesture shortcuts. Do not use 'command' for this concept. Flag instances of 'command' that refer to keyboard/gesture shortcuts.

**Examples:**

> **hooks/useFilteredCommands.ts**
> This should be "commands" (as indicated in https://github.com/cybersemics/em/pull/2782/#discussion_r1929840742).

> **components/modals/Export.tsx**
> This should still be "shortcut" since it is referring specifically to the keyboard shortcut.

> **components/Note.tsx**
> This can stay as "shortcut" since it specifically for keyboard shortcuts.

### APP-005
**App – use head()/contextOf() accessors on Path and Context; do not use array indexing** (10 hits)

Do not use array methods (indexing with [0], slice, splice) directly on Path or Context types. Use the provided accessor functions head() and contextOf() instead. Direct array manipulation couples code to the internal array representation. Flag array index access or array methods on Path or Context values.

**Examples:**

> **util/recentlyEditedTree.js**
> Let's use the available `head` function here:

```js
else if (head(oldContext) !== head(newContext)) _.unset(tree, oldContext)
```

> **actions/editThought.ts**
> Generally I prefer `rootedParentOf(parentOf(path))` to access grandparents rather than using `getThoughtById`.

> **components/Thought.js**
> Use `contextOf` instead of indexing into `draggingThoughtPath` manually.

### APP-009
**App – define comparators independently; compose with makeOrderedComparator** (9 hits)

Each sort comparator should handle exactly one criterion. Compose comparators using makeOrderedComparator rather than embedding multiple criteria in a single function. Flag comparator functions that handle more than one sort criterion.

**Examples:**

> **selectors/getChildren.ts**
> Did you mean to import `compareThoughtByCreated`? The low level comparison logic should probably go there.

> **util/compareThought.ts**
> Even better, create a higher order function that allows you to reverse a comparator:

```js
const reverse = comp => (a, b) => comp(b, a)
const compareThoughtDescending = reverse(compareThought)
```

> **util/compareThought.js**
> I would prefer this in its own comparator function to keep things clean. I'm very proud of my comparator composition 😂. Please define `compareEmpty` and add it to the `makeOrderedComparator` argument list.

### APP-019
**App - use durations.config.ts for animation durations** (8 hits)

Use predefined animation durations from durations.config.ts instead of hard-coding millisecond values.

**Examples:**

> **components/dialog/CloseButton.tsx**
> You can use a predefined duration from https://github.com/cybersemics/em/blob/f8df451f3e3a4b45697d4e5d8167ead3373af52c/src/durations.config.ts.

> **components/dialog/GestureCheatsheet.tsx**
> You can use a predefined duration from https://github.com/cybersemics/em/blob/f8df451f3e3a4b45697d4e5d8167ead3373af52c/src/durations.config.ts.

> **components/CommandMenu/PanelCommand.tsx**
> You can use a predefined duration from https://github.com/cybersemics/em/blob/f8df451f3e3a4b45697d4e5d8167ead3373af52c/src/durations.config.ts.

### APP-004
**App – use store.useEffect() for ministore subscriptions, not store.subscribe()** (7 hits)

When subscribing to ministore changes in a React component, use store.useEffect() to ensure the subscription is synchronized with the React render lifecycle. Do not use store.subscribe() directly. Flag direct store.subscribe() calls inside React components.

**Examples:**

> **components/LayoutTree.tsx**
> Can we use `editingValueStore.useEffect`, or is the raw subscribe needed for some reason?

`useEffect` handles unsubscribing, which is missing here.

> **components/Divider.tsx**
> You can use `editingValueStore.useEffect` provided by the [react-ministore](https://github.com/cybersemics/em/blob/98dff32074ed855a4e9348a2bc00c20cbf3fa42c/src/stores/react-ministore.ts) mixin.

> **components/Editable.tsx**
> If you are looking for a way to avoid all the props drilling, perhaps you can create a new ministore that the FauxCaret component can subscribe to, that can be directly updated from `Editable`. Or maybe you have another idea.

### APP-008
**App – use getThoughts (unordered) when order does not matter; getThoughtsRanked only when needed** (7 hits)

getThoughtsRanked performs a sort pass. Use getThoughts (O(1)) when only the set of children is needed. Reserve getThoughtsRanked for code that assumes a specific ordering. Flag getThoughtsRanked calls where the result is not order-dependent.

**Examples:**

> **components/Subthoughts.js**
> If `sortPreference === 'Alphabetical'`, you'll want to call `getThoughts` instead of `getThoughtsRanked` to avoid an unnecessary sort by rank.

> **util/treeToFlatArray.js**
> `getThoughts` is unordered so technically we should not be indexing into it. Since you are assuming there is only one subthought, `getThoughtsRanked` will be no less efficient.

> **reducers/archiveThought.js**
> I would use `getThoughts` here. It is much faster than `getDescendants`, and has the same effect in this case.

### APP-013
**App - follow wording conventions for user-facing alert and error messages** (7 hits)

User-facing alert and error messages must follow specific wording conventions (e.g., "Subthoughts of the...", "Cannot move the..."). Flag messages that deviate from the established copy patterns.

**Examples:**

> **action-creators/outdent.js**
> "Subthoughts of the..."

> **action-creators/subCategorizeAll.js**
> "Subthoughts of the..."

> **action-creators/subCategorizeOne.js**
> "Subthoughts of the..."

### APP-003
**App – prefer pathToThought and id-based selectors over context-based selectors** (5 hits)

Use pathToThought and thought-id-based selectors for looking up thoughts. Context-based selectors are deprecated now that thoughts have unique ids. Flag usage of context-based selector functions (e.g., getThoughtByContext) when an id-based equivalent exists.

**Examples:**

> **components/LayoutTree.tsx**
> Let's use the path helper functions instead of interacting directly with `Path` as an array:

```tsx
parentId={parentOf(cursorThoughtPositioned.path)}
```

> **components/__tests__/Bullet.ts**
> Get the path of the desired thought directly: `contextToPath(store.getState(), ['x', 'a'])`

> **components/ContextBreadcrumbs.tsx**
> Use `parentOf`

### APP-015
**App - unroot paths/contexts when concatenating to avoid embedded ROOT tokens** (4 hits)

When concatenating Paths or Contexts, always call unroot() on the result so ROOT is not embedded in a descendant path.

**Examples:**

> **selectors/getContextsSortedAndRanked.ts**
> When concatenating `Contexts` or `Paths` you always have to `unroot` the result since the ROOT token is only used in the ROOT context itself, not any of its descendants.

> **selectors/attribute.ts**
> Prefer `[...unroot(context), attributeName]`

> **reducers/toggleAttribute.ts**
> Let's use `[...unroot(context), key]`

### APP-016
**App - batch multiple actions in a single store.dispatch call** (4 hits)

Pass an array of actions to store.dispatch rather than dispatching individually to reduce middleware overhead.

**Examples:**

> **components/Tips/NewSubthoughtTip.tsx**
> Use `useDispatch` and take advantage of the `multi` middleware to dispatch an array:

```
dispatch([
  removeToolbarButton('newSubthought'),
  dismissTip()
])
```

> **shortcuts/__tests__/undo.ts**
> Include this in the previous `store.dispatch` call.

> **shortcuts/__tests__/undo.ts**
> Include this in the previous `store.dispatch` call.

### APP-022
**App - use mergeThoughts/mergeUpdates to apply thought index updates** (4 hits)

Use mergeThoughts/mergeUpdates utilities to merge thought index updates into state; do not spread nullable update objects directly.

**Examples:**

> **util/importJSON.ts**
> Use `thoughts: mergeThoughts(state.thoughts, accum)` using https://github.com/cybersemics/em/blob/dev/src/util/mergeThoughts.ts.

> **util/importJSON.ts**
> This is also incorrectly copying nullable updates directly into a `ThoughtsInterface` (1).

> **util/importJSON.ts**
> This is also incorrectly copying nullable updates directly into a `ThoughtsInterface` (2).

### APP-007
**App – read settings via getSetting or Redux state, not localStorage** (3 hits)

Read app settings using the getSetting utility or Redux state selectors, not by accessing localStorage directly. localStorage is a persistence layer; the canonical runtime source is Redux state. Flag localStorage.getItem calls for settings values in components or action-creators.

**Examples:**

> **components/Subthoughts.js**
> This should not be read directly from `localStorage`. Instead, use `getSetting`.

> **action-creators/moveThoughtDown.js**
> I recommend [`getSetting(['Global Sort'])`](https://github.com/cybersemics/em/blob/dev/src/util/getSetting.js) here. `localStorage` is used as a persistence layer from which `state` is loaded at startup. The Redux store will be faster for in-app lookups.

### APP-025
**App - use commandById and gestureString helpers** (3 hits)

Use commandById and gestureString helper functions instead of accessing commandIdIndex directly.

**Examples:**

> **commands.ts**
> You can use the `gestureString` helper to get the normalized gesture string:

https://github.com/cybersemics/em/blob/75b8c516e70922bdfa44d29a8cc47e33c942e865/src/commands.ts#L321-L323

> **components/CommandPalette.tsx**
> Let's use [gestureString](https://github.com/cybersemics/em/blob/75b8c516e70922bdfa44d29a8cc47e33c942e865/src/commands.ts#L321-L323) and [commandById](https://github.com/cybersemics/em/blob/75b8c516e70922bdfa44d29a8cc47e33c942e865/src/commands.ts#L325-L326) here as well.

> **commands.ts**
> Let's use `commandById` rather than accessing `commandIdIndex` directly. We already have `commandById`, so we might as well use and it and hide `commandIdIndex` as an implementation detail.

https://github.com/cybersemics/em/blob/75b8c516e70922bdfa44d29a8cc47e33c942e865/src/commands.ts#L325-L326

### APP-023
**App - use the storage abstraction (storage.getItem/setItem)** (2 hits)

Use the cross-platform storage abstraction (storage.getItem/setItem) rather than directly assigning to localStorage properties.

**Examples:**

> **util/localStorage.native.ts**
> Yes. `localStorage` is special in that assignment is equivalent to `setItem`. We should use `getItem` and `setItem` instead.

> **action-creators/fontSize.ts**
> This doesn't work on web. It saves to `storage.fontSize`, not the browser's `localStorage`. I think you need `storage.setItem('fontSize', value)`.

You can reproduce this by increasing the font size using the links in the footer and then refreshing the page.

### APP-026
**App - use the FadeTransition component for fade animations** (2 hits)

Use the FadeTransition component for fade animations instead of directly manipulating DOM opacity or writing custom CSS transitions.

**Examples:**

> **components/dialog/GestureCheatsheet.tsx**
> Setting the `opacity` directly on the DOM ref feels a bit low-level here. Would it be possible to do this in a more React-centric way? Or even use the [FadeTransition](https://github.com/cybersemics/em/blob/f8df451f3e3a4b45697d4e5d8167ead3373af52c/src/components/FadeTransition.tsx#L14) component if necessary?

> **components/CommandTable.tsx**
> Would it be possible to use the existing [FadeTransition](https://github.com/cybersemics/em/blob/37f3e98916904810830c18b92436cad2016fac47/src/components/FadeTransition.tsx) component? This helps abstract away the timing and animation details.

Note that all of our animation durations are defined in https://github.com/cybersemics/em/blob/37f3e98916904810830c18b92436cad2016fac47/src/durations.c...

### APP-027
**App - use hashPath to convert a Path to a string** (2 hits)

Use hashPath to explicitly convert a Path to a string key; do not rely on Array.prototype.toString().

**Examples:**

> **components/LayoutTree.tsx**
> Use [hashPath](https://github.com/cybersemics/em/blob/98dff32074ed855a4e9348a2bc00c20cbf3fa42c/src/util/hashPath.ts) for a more explicit conversion of `Path` to a `string`.

> **components/LayoutTree.tsx**
> Use [hashPath](https://github.com/cybersemics/em/blob/98dff32074ed855a4e9348a2bc00c20cbf3fa42c/src/util/hashPath.ts) to explicitly convert a `Path` to a string rather than relying on `Array.prototype.toString()`.

### APP-028
**App - use getSortPreference selector instead of checking =sort attribute** (2 hits)

Use the getSortPreference selector to encapsulate sort preference logic instead of directly checking for the =sort attribute.

**Examples:**

> **actions/collapseContext.ts**
> You can use [getSortPreference](https://github.com/cybersemics/em/blob/a27f56c62a1a16d0b31435201cd77aed7ccd156e/src/selectors/getSortPreference.ts).

> **actions/collapseContext.ts**
> FYI We should use `getSortPreference` here instead of just checking for the presence of `=sort`, since it is possible for the sort preference to be set to None.

### APP-029
**App - place haptic feedback in onTouchEnd to avoid triggering on cancelled gestures** (2 hits)

Trigger haptic feedback and tap handlers in onTouchEnd (successful tap), not onTouchStart (which also fires on cancelled gestures).

**Examples:**

> **util/fastClick.ts**
> I believe this should go in the else statement below with `tapUp`, as that is where a successful click occurs. Cancelled clicks and move events are filtered out on purpose.

> **util/fastClick.ts**
> It might make more sense to place the hapic in `onTouchEnd`, since that is where the handler fires. Then the haptic feedback will occur at the same time as the execution of the handler. If done in `onTouchStart`, there will be a gap between the haptic and the execution, and haptics will unintentionally occur on cancelled clicks (such as a drag or scroll).

### APP-030
**App - prefer Path over SimplePath when context-view boundaries must be preserved** (2 hits)

Use Path over SimplePath in contexts where the full path including context-view ancestors is needed.

**Examples:**

> **components/Bullet.tsx**
> Prefer `path` instead of `simplePath`.

> **actions/subcategorizeMulticursor.ts**
> Any reason you are using `simplifyPath` here? In general we want to use `Path`, as that works across context view boundaries. 

The Context View requires a good bit of custom handling, but it'll be easier if we use `Path` in places that support it, like `moveThought`.

### APP-010
**App – quote and ellipsize thought values in user-facing text**

When displaying thought values in user-facing strings (tutorial text, error messages, UI copy), wrap them in quotes and apply ellipsize() to truncate long values. Unquoted or untruncated values can break UI layout and look inconsistent. Flag user-facing strings that reference thought values without quotes or ellipsize().

*(No matching examples in corpus)*

### APP-011
**App – omit zero-value counts from user-facing messages**

When constructing user-facing messages that include counts (e.g., 'Copied N thoughts and M descendants'), omit the count phrase when the value is 0. Zero-value phrases add noise without informing the user. Flag user-facing alert or message strings that include a count phrase for a zero value.

*(No matching examples in corpus)*

---

## Code Strictness
<a id="strict"></a>

*14 rules | 150 total hits*

### STRICT-001
**Strict – remove redundant expressions (|| false, unnecessary fallbacks on booleans)** (41 hits)

Do not add falsy fallbacks like `|| false` when the expression already evaluates to a boolean. These are redundant and add noise. Flag `|| false`, `|| 0`, or similar fallbacks on expressions that are already the expected type.

**Examples:**

> **util/nextThought.js**
> Logical simplification: If `thought.contexts.length < 1`, then `thought.contexts.find` will immediately return `null`, so there is no need for a conditional.

> **components/Editable.js**
> `isDocumentEditable()` is unnecessary since the `Editable` is [disabled in Thought.js](https://github.com/cybersemics/em/blob/dev/src/components/Thought.js#L351).

> **util/moveThought.js**
> I think you only have to check against `newContext` here. We already know that `thought` is in `oldContext`.

Also you can omit ` ? true : false` as it is redundant.

### STRICT-002
**Strict – consolidate duplicate constants; do not create new ones that duplicate existing patterns** (22 hits)

Before defining a new constant (especially regex patterns), check if an equivalent one already exists. If it does, reuse or extend it rather than creating a duplicate. Flag new constant definitions that duplicate the value or pattern of an existing one.

**Examples:**

> **e2e/puppeteer/__tests__/drag-and-drop-multiselect.ts**
> Let's use `HOME_TOKEN` instead of hardcoding `__ROOT__`:

```ts
    expect(exported).toBe(`- ${HOME_TOKEN}
  - y
  - z
  - a
  - x`)
```

> **components/Tips/Tip.tsx**
> Maybe you can use [usePrevious](https://github.com/cybersemics/em/blob/8e794ad2ead51c83d0e8a5b27a513aa2fd6f9939/src/hooks/usePrevious.ts#L4)?

> **util/compareThought.ts**
> You've defined a regex here for `slashPattern`, but we also have `REGEX_SHORT_DATE_WITH_DASH`. Please unify or put them on the same footing so that we have a more cohesive design.

### STRICT-005
**Strict – do not mutate data; use non-destructive methods** (20 hits)

Do not mutate arrays or objects in place. Use non-destructive alternatives (spread, map, filter, toSorted, toReversed) instead of mutating methods (sort, reverse, splice, push). Flag calls to Array.prototype.sort(), .reverse(), .splice(), or .push() on existing arrays or objects.

**Examples:**

> **util/formattingNodeToHtml.ts**
> Please create a new variable rather than mutating the old one. 

It's never a good idea to mutate arguments, as they are meant to be inputs only.

> **data-providers/yjs/permissionsModel.ts**
> Is the `permission` object changed through mutation, or the return value? We should pick one, as doing both is confusing. Preferably without mutating the argument.

> **reducers/existingThoughtDelete.js**
> While sort and reverse are done non-destructively here, it still trips up the linter. Let's use lodash's non-destructive sort and reverse methods to keep this clean.

### STRICT-013
**Strict - omit empty object literal arguments and return values** (17 hits)

Do not pass {} as a superfluous argument or return it as a no-op.

**Examples:**

> **actions/removeToolbarButton.ts**
> Remove empty object literal

> **commands/copyCursor.ts**
> Omit empty object literal

> **commands/generateThought.ts**
> Omit empty object literal

### STRICT-004
**Strict – use named constants instead of magic number literals** (15 hits)

Replace hardcoded numeric literals (especially durations, timeouts, and thresholds) with named constants from the project's configuration (e.g., duration constants). Magic numbers obscure intent. Flag numeric literals used for durations, delays, or thresholds that could reference a named constant.

**Examples:**

> **stores/navigated.ts**
> Where does the 200ms come from? Is that meant to match the [duration of the browser's smooth scroll](https://stackoverflow.com/a/71417475/480608)?

> **components/ThoughtAnnotation.tsx**
> What's this magic number? Does it have any dependencies? We will need to document it with inline comments and possibly create a constant or derived value.

> **components/BulletCursorOverlay.tsx**
> I use `fontSize * 2 - 2` in [useSingleLineHeight](https://github.com/ethan-james/em/blob/4ab019689e80e6640fd430e60c118466d01b1f5f/src/components/LayoutTree.tsx#L36).

### STRICT-006
**Strict – throw on violated preconditions rather than silently continuing** (9 hits)

When a function has a required precondition (e.g., a non-null parent node), throw an error if the precondition is not met rather than silently returning or producing incorrect output. Silent failures mask bugs. Flag functions that return early or produce default values when critical preconditions fail.

**Examples:**

> **components/Divider.tsx**
> Let's throw an exception if `parentNode` does not exist, since that is a precondition for this function to work and we want it to fail hard if the DOM structure gets refactored.

> **components/Thought.js**
> What is the faulty condition that is causing `getSortPreference` to return an array? That should be investigated. We want to get to the root of the problem rather than covering it up.

> **components/Thought.js**
> Typescript would throw an error if any of the callers were expecting an array. There are only seven places in the codebase where `getSortPreference` is called, so it is easy to confirm by hand.

### STRICT-003
**Strict – remove redundant 'return await' in async functions** (6 hits)

In async functions, `return await promise` is equivalent to `return promise` — the await is redundant. Remove it. Flag `return await` at the end of async functions where the await serves no purpose (no try-catch wrapping the return).

**Examples:**

> **e2e/iOS/config/wdio.browserstack.conf.ts**
> `return await` can always be simplified to `return` since waiting for the promise to resolve and then returning within an async function is equivalent to returning a promise.

> **e2e/puppeteer/__tests__/render-thoughts.ts**
> FYI `return await` can always be simplified to `return`. The `await` is implied by the async function.

> **redux-middleware/__tests__/pullQueue.ts**
> `return await` is redundant. You can always just return the promise.

### STRICT-009
**Strict – use strict undefined check (=== undefined) when empty string is a valid value** (5 hits)

When a value can legitimately be an empty string, check for undefined explicitly (=== undefined) rather than using a falsy check (!value). Falsy checks incorrectly exclude empty strings. Flag !value or if (!x) guards on values typed as string | undefined where empty string should be treated as valid.

**Examples:**

> **actions/archiveThought.ts**
> We should just check for `undefined`. For our purposes empty string is a valid thought value and should be treated no differently than any other value.

> **components/CopyOneDrop.tsx**
> `value === undefined`

> **components/DeleteDrop.tsx**
> `value === undefined`

### STRICT-012
**Strict - remove CSS/SVG attributes that replicate browser defaults** (4 hits)

Remove redundant CSS or SVG attributes that equal browser/spec defaults.

**Examples:**

> **components/CommandItem.tsx**
> This does not seem to do anything, since this is the default font size.

> **components/SearchIcon.tsx**
> `scale(1, 1)` is the default, so this shouldn't be needed.

> **components/icons/BumpThoughtDownIcon.tsx**
> `scale(1, 1)` is the default, so this shouldn't be needed.

### STRICT-016
**Strict - prefer spread syntax over Array.prototype.concat** (4 hits)

Prefer spread syntax over Array.prototype.concat for non-destructive array construction.

**Examples:**

> **selectors/getChildResolvedPath.ts**
> Prefer the spread operator over `concat` (better performance and arguably easier to read).

> **components/ModalComponent.tsx**
> Let's replace `Object.assign` with the spread operator while we're here.

> **components/ModalComponent.tsx**
> Convert to spread operator

### STRICT-010
**Strict - do not use let; prefer const** (3 hits)

Use const with descriptive names instead of let.

**Examples:**

> **shortcuts/__tests__/redo.ts**
> Please do not use `let`. You can call the first variable `exportedAfterUndo` and the second variable `exportedAfterRedo`.

> **util.js**
> Again note the Contributing Guidelines. `let` and `for` are not allowed on this project.

> **components/Editable/useOnPaste.ts**
> Avoid mutable state (`let`) when possible. Here we can easily use a constant if we set the value in a single ternary expression.

Furthermore, since we are using `text/em` as a boolean flag, let's convert it to a boolean right away. Usually we want to convert to proper types as soon as possible when moving across serialization boundaries.

```ts
const emText = navigator.webdriver || !!e.cl...

### STRICT-015
**Strict - use clearly namespaced sentinel values to avoid collisions** (2 hits)

Use clearly namespaced sentinel/dummy string values that are unlikely to conflict with real values.

**Examples:**

> **reducers/updateThoughts.ts**
> The empty id seems like a tenuous thing to code against. That is, I'm skeptical about treating that as a formal API. I'd like to consider other ways to detect this.

> **constants.js**
> It would be better to use a value of `__DUMMY__` as it is less likely to conflict with real values.

This can also be defined in `recentlyEditedTree.js` since it is only used in that one file.

### STRICT-007
**Strict – use .filter(nonNull) instead of .filter(Boolean) on typed arrays** (1 hits)

Do not use .filter(Boolean) on typed arrays where falsy-but-valid values (empty strings, 0) may exist. Use .filter(nonNull) to explicitly filter only null/undefined. filter(Boolean) silently drops valid falsy values. Flag .filter(Boolean) on arrays whose element type includes non-null falsy values.

**Examples:**

> **components/DropHover.tsx**
> `.filter(Boolean)` shouldn't be used on `string[]`, otherwise it will incorrectly filter out empty strings. 

Use `.filter(nonNull)` instead.

### STRICT-008
**Strict – do not declare functions async unless they contain await** (1 hits)

Do not declare a function as async if it does not contain any await expressions. Async functions have overhead and signal to callers that they should be awaited. Only use async when the function actually performs asynchronous work. Flag async function declarations with no await in the body.

**Examples:**

> **components/ColorPicker.tsx**
> Why `async`? `formatSelection` does not appear to be async.

---

## Performance
<a id="perf"></a>

*15 rules | 133 total hits*

### PERF-001
**Perf – combine loops and hoist loop-invariant calculations** (78 hits)

When two loops iterate over the same collection, combine them into one. Move calculations that do not depend on the loop variable outside the loop body. Flag adjacent loops over the same array and expressions inside loops that could be computed once before the loop.

**Examples:**

> **reducers/editThought.ts**
> Rather than comparing the whole Path in O(2*depth), compare the head thought in O(1):

```ts
state.cursor && head(state.cursor) === editedThought.id
```

> **util/compareThought.ts**
> You can move the regex to the module scope since it does not change between invocations. Regex instantiation is not trivial like object literals.

> **util/expandThoughts.js**
> This is an expensive operation within a loop. It seems like we've traded extra recursion for extra computation. I'm not really satisfied with this solution.

### PERF-015
**Perf - avoid unnecessary React re-renders** (22 hits)

Avoid unnecessary re-renders by using stable references, boolean selectors, and useSelectorEffect for side effects.

**Examples:**

> **hooks/useMaxSiblingWidth.ts**
> I think this will update on every render since `parentPath` is a new reference every time. You'll need to memoize `parentPath` so it has a stable object reference.

> **hooks/useMaxSiblingWidth.ts**
> Move the `!!` inside the selector, otherwise the component will re-render every time `findAnyChild` returns a different thought.

> **components/Bullet.tsx**
> It's better to move `isDivider` into the selector here. Then the component will only be re-rendered when the boolean value changes, not every time the thought value changes.

### PERF-002
**Perf – prefer requestAnimationFrame over arbitrary setTimeout for UI synchronization** (8 hits)

For cursor positioning, scroll synchronization, or other UI-timing operations, use requestAnimationFrame to align with the browser's render cycle. Do not use setTimeout with arbitrary delays (e.g., 100ms). Flag setTimeout calls used for UI synchronization where requestAnimationFrame would be more appropriate.

**Examples:**

> **action-creators/subCategorizeOne.js**
> I'm guessing the `setTimeout` was necessary, but I wonder if this would work by dispatching another thunk instead of the `setTimeout`? That would be a cleaner option.

> **device/scrollCursorIntoView.ts**
> Can we add the 100ms only when needed? 100ms is going to cause a noticeable delay in a lot of other cases.

> **action-creators/newThoughtAtCursor.js**
> I wonder if this could be done by dispatching a thunk or if the `setTimeout` is necessary.

### PERF-003
**Perf – use perma() to lazily evaluate expensive values used conditionally** (8 hits)

Wrap non-trivial computations in perma() when they are only needed in some code paths. perma() defers execution until first access and memoizes the result. Flag expensive computations in conditional branches that are always eagerly evaluated but only sometimes used.

**Examples:**

> **action-creators/cursorDown.js**
> It would be better to place this line of code in the `if` scope. Then it doesn't get called unnecessarily when `nextThought` is `null`.

> **util/nextThought.js**
> Here we simply call `firstChild()` as many times as needed since `perma` ensures the calculation will only be made once. The function call overhead is trivial and can be optimized as a last resort.

> **selectors/expandThoughts.ts**
> You'll want to keep `isExpansionBasePath` a function so that `equalArrays` can be short-circuited when possible (due the order of the return condition. This is for performance reasons. `equalArrays` is O(n).

### PERF-004
**Perf – use short-circuit iteration (find/some/every) instead of full scans** (8 hits)

When checking whether any element satisfies a condition, prefer short-circuit methods (some, find, every) over building intermediate arrays with filter/map. Short-circuit methods stop at the first match. Flag filter().length > 0, map().filter(), or reduce() patterns that could use some/find.

**Examples:**

> **util/isDescendant.js**
> I would recommend `return contextA.every((value, i) => contextB[i] === value)` to avoid traversing the entire list when an early failure case is hit.

> **hooks/useDragThoughtAnimation.ts**
> Instantiating a Set is unnecessary if we're just checking if any operation in the patch contains `moveThought`. Maybe you use a nested `some`?

> **selectors/resolveNotePath.ts**
> You can use [anyChild](https://github.com/cybersemics/em/blob/af741ca404652aacab93746fee3941f8c43a5a05/src/selectors/getChildren.ts#L116-L121) instead of getting all the children.

### PERF-008
**Perf – batch multiple database writes into a single call** (5 hits)

When multiple records need to be written to the database as part of the same operation, batch them into a single write call instead of issuing one call per record. Batching reduces round-trips and improves performance. Flag loops or sequential await calls that each write a single database record.

**Examples:**

> **redux-middleware/pullBeforeMove.ts**
> We'll want to limit the depth of the pull, otherwise there could be a large number of thoughts pulled unnecessarily.

> **redux-middleware/pullBeforeMove.ts**
> We'll want to limit the depth of the pull, otherwise there could be a large number of thoughts pulled unnecessarily.

> **data-providers/yjs/thoughtspace.ts**
> Can these updates be batched for better performance?

### PERF-017
**Perf - avoid instantiating expensive objects in hot paths** (2 hits)

Avoid instantiating expensive Web API objects (DOMParser, canvas context) on every keystroke; cache or use a lightweight alternative.

**Examples:**

> **util/getCommandState.ts**
> That helps, but the problem still exists when color is used. We either need a very efficient parser that is tailor-made for parsing color, or we need to throttle this at least to the next animation frame.

> **util/getCommandState.ts**
> `getCommandState` is called on every keystroke, so it's highly performance sensitive. Instantiating a new `DOMParser` on every keystroke is too heavy a solution unfortunately.

We could maybe use this approach if we throttle it.

### PERF-005
**Perf – return stable references from selectors for empty collection fallbacks** (1 hits)

Selectors that return empty arrays or objects as fallbacks should return a module-level constant rather than creating a new literal on each call. New literals create unstable references that trigger unnecessary React re-renders. Flag selectors that return [] or {} inline as fallbacks.

**Examples:**

> **selectors/getChildren.ts**
> `getAllChildrenAsThoughtsById` and `getAllChildrenAsThoughts` should return `noChildren` rather than creating a new empty array each time. All of the non-sorting getChildren* functions need to return a static reference otherwise it can cause components to re-render excessively.

### PERF-009
**Perf – throttle/debounce at the event source, outside the dispatched function** (1 hits)

Apply throttle or debounce wrappers as close to the event source as possible, before the dispatch call, not inside the dispatched function body. Throttling inside the dispatch creates new function instances on every event and may not effectively limit work. Flag throttle/debounce calls inside dispatched function bodies.

**Examples:**

> **util/initEvents.ts**
> Okay. Can you look for another way to do it? I'm really not comfortable dispatching an action on every mousemove trigger.

### PERF-007
**Perf – gate data migrations with a version or flag check so they run exactly once**

Data migrations must be idempotent and gated so they run exactly once. Do not unconditionally run a migration on every page load or app startup. Use a schema version check or a migration flag to skip the migration after the first successful run. Flag migration functions called unconditionally on every initialization.

*(No matching examples in corpus)*

### PERF-010
**Perf – do not set reactive stores to intermediate transient values; commit only the final value**

Setting a reactive store to an intermediate null/reset value before setting it to the real value fires subscribers twice with potentially invalid states. Compute the final value first, then set it once. Flag reactive store setter calls that set an intermediate value before immediately setting the final value.

*(No matching examples in corpus)*

### PERF-011
**Perf – avoid patterns that cause double renders; achieve the goal in a single render pass**

Do not use patterns like setting a mounted state in a useEffect to delay initialization, as they cause every component instance to render twice. Find solutions that produce the correct result in the initial render pass. Flag useState(false) + useEffect(() => setState(true), []) mount-detection patterns.

*(No matching examples in corpus)*

### PERF-012
**Perf – use store selector effects for side-effect-only subscriptions, not useState**

When a subscription to a ministore or selector is only needed to run a side effect (not to update rendered output), use the store's selector effect API rather than useState + useSelector. useState causes a React re-render on every change; a selector effect runs the callback without triggering a render. Flag useState variables set exclusively inside a store subscription and not used in JSX.

*(No matching examples in corpus)*

### PERF-013
**Perf – do not memoize trivially computed primitives**

Do not wrap simple boolean expressions or primitive computations in useMemo. Since primitives are compared by value, memoizing them provides no benefit — the consumer will not re-render whether the primitive is memoized or not. Reserve useMemo for expensive computations or reference-unstable objects/arrays. Flag useMemo calls that compute a plain boolean or other primitive.

*(No matching examples in corpus)*

### PERF-014
**Perf – throttle scroll and resize event handlers to avoid layout thrashing**

Scroll and resize event handlers fire very frequently. Do not call getBoundingClientRect, scrollTop, or other layout-triggering operations on every event tick. Throttle the handler or use requestAnimationFrame to limit the rate of layout recalculations. Flag unthrottled scroll or resize handlers that call layout-triggering DOM APIs.

*(No matching examples in corpus)*

---

## TypeScript
<a id="ts"></a>

*11 rules | 100 total hits*

### TS-001
**TypeScript – use the most precise type available; do not widen to primitives** (50 hits)

Use narrow, specific types rather than broad primitives. Prefer named union types (e.g., 'thought' | 'toolbar-button') over string, prefer existing project type aliases (Context | Path) over manually constructed inline types, and prefer Direction[] over string[]. Flag parameters or variables typed as string, number, or other primitives when a more precise union type or project type exists.

**Examples:**

> **util/deleteThought.ts**
> Why use `Child[]` when we have a `Path` type? Also, why `Thought[]` at all? A `Thought` is an entry in the `thoughtIndex` which is not related to a `Path`.

> **components/Content.tsx**
> Note that `[]` is not a valid `Path`; a `Path` must have length of at least 1. (Unfortunately the type checker is not able to catch this.)

> **util/compareThought.ts**
> You can make this generic:

```ts
const reverse = <T>(comparator: ComparatorFunction<T>) => (a: T, b: T) => comparator(b, a)
```

### TS-004
**TypeScript – avoid unsafe type casts; type values correctly** (27 hits)

Do not use 'as' casts to override the type system, especially on values that may be null or undefined. Instead, type the value correctly so the type system enforces runtime safety. Flag 'as' casts that silence potential null/undefined errors or that widen/narrow types unsafely.

**Examples:**

> **components/Thought.tsx**
> `value` is already typed as non-null above:

https://github.com/cybersemics/em/blob/9889f4a15288d82c787e2ea5b4e3ef976f8fe4f3/src/components/Thought.tsx#L521-L522

> **device/selection.ts**
> Return `null` if range is undefined. `!` is usually used when there are other runtime conditions that guarantee the value is truthy, and should be used sparingly.

> **components/Thought.tsx**
> Avoid overriding the type system with `!`. Usually it's preferable to add a runtime guard.

In the rare instances where it is needed, add an explanatory comment.

### TS-002
**TypeScript – use React/library utility types instead of hand-rolling equivalents** (7 hits)

Use standard utility types provided by React or other libraries (e.g., PropsWithChildren, ReturnType) instead of manually declaring equivalent interfaces or types. Flag custom type definitions that duplicate a built-in utility type.

**Examples:**

> **components/dialog/DialogContent.tsx**
> We can use the React-provided `PropsWithChildren`:

```ts
const DialogContent: React.FC<PropsWithChildren> = ({ children }) => {
```

> **components/dialog/Dialog.tsx**
> For consistency, let's remove `children` from the props and use the React-provided `PropsWithChildren` generic:

```ts
React.FC<PropsWithChildren<DialogProps>>
```

> **test-helpers/createRtlTestApp.tsx**
> ~`ReactWrapper` is an Enzyme type. This should be typed as the return type of RTL's `render` function.~

Since RTL's queries are global, we may not need to return `wrapper` at all.

### TS-003
**TypeScript – declare optional props with '?' not '| undefined'** (5 hits)

Use the optional property syntax (selected?: boolean) rather than an explicit union with undefined (selected: boolean | undefined). Flag prop definitions that use `| undefined` when `?` would be idiomatic.

**Examples:**

> **util/importJSON.ts**
> `skipRoot` should just be `boolean` since it does not itself distinguish between `false` and `undefined`. `undefined` values should be coerced to boolean higher up.

> **components/Content.tsx**
> I might suggest making `path` optional. If it is not present we can simply use `simplePath`.

> **selectors/__tests__/expandThoughts.ts**
> The options object should be optional.

### TS-005
**TypeScript – functions should return a single consistent type** (5 hits)

A function should return a single type (or a nullable variant). Do not write functions that return fundamentally different types depending on a boolean flag or parameter. Split into separate functions instead. Flag functions whose return type is a union of unrelated types controlled by a parameter.

**Examples:**

> **actions/setIsMulticursorExecuting.ts**
> `ActionType` and `CommandType` are very different things. I don't think we should union them together.

Please try to find a different approach that does not combine these types.

> **util/convertHTMLtoJSON.ts**
> Similar question about polymorphic return type

> **util/recentlyEditedTree.js**
> Function should just return one type of data (or a nullable type), in this case a `{ node, path }`. I'm not sure if there is logic that relies on it returning a `tree` in some circumstances, but if so I think it should be handled differently so that the function can always return `{ node, path }`.

### TS-011
**TypeScript - do not use any; use precise types** (2 hits)

Do not use TypeScript's any type; use precise types or explicit typecasts.

**Examples:**

> **components/SortPicker.tsx**
> Is this not `SortPreference`? I'm not sure I understand the conflict you documented.

Either way, `any` is not allowed.

### TS-012
**TypeScript - omit optional boolean props at call site** (2 hits)

At call site, omit optional props rather than passing false.

**Examples:**

> **components/ContextBreadcrumbs.tsx**
> For optional props, it's more idiomatic to leave it undefined and treat `undefined` and `false` the same, rather than explicitly set it to `false`.

> **reducers/collapseContext.ts**
> You can omit `showContexts` instead of explicitly setting it to false since it is an optional variable.

### TS-006
**TypeScript – extract inline anonymous types into named type aliases** (1 hits)

When a complex inline type is used as a type parameter (e.g., in reduce<TypeHere>), extract it into a named type alias defined at the module level with a descriptive comment. This improves readability and allows reuse. Flag complex inline type expressions that could be named type aliases.

**Examples:**

> **components/SortButton.tsx**
> Let's factor out `alphabetical' | 'type' into its own type since it is shared by `CommandTable` and `SortButton`.

### TS-007
**TypeScript – omit explicit generic type arguments when inference suffices** (1 hits)

When TypeScript can infer a generic type from the provided initializer or arguments, do not explicitly provide the type argument. Redundant explicit generics add noise without adding type safety. Flag explicit generic type arguments on function calls where inference would produce the same type.

**Examples:**

> **stores/longPressStore.ts**
> You can omit `<{ isLocked: boolean }>` since it will infer the type.

### TS-008
**TypeScript – default array-typed state fields to empty array, not undefined**

State fields that hold arrays should default to an empty array ([]) rather than undefined. Defaulting to undefined forces all consumers to handle both undefined and [] as equivalent, duplicating null-check logic. Flag optional state properties typed as T[] where an empty array default would eliminate undefined handling.

*(No matching examples in corpus)*

### TS-009
**TypeScript – make implicit cross-module string coupling explicit via shared constants**

When two modules rely on the same set of string values (e.g., CSS class names, attribute names), make that coupling explicit by importing from a shared constant or type rather than duplicating string literals. Implicit coupling creates silent drift if one module is updated but not the other. Flag identical string literals in multiple modules where a shared constant would prevent divergence.

*(No matching examples in corpus)*

---

## PandaCSS & Styling
<a id="pandacss"></a>

*11 rules | 95 total hits*

### PANDACSS-001
**PandaCSS – use theme tokens or themeColors selector, not hardcoded color values** (33 hits)

Reference colors via theme tokens (e.g., colors.bg) or the themeColors selector rather than hardcoding hex values, rgb(), or other literal color values. Flag any hardcoded color value in css() calls, inline styles, or style objects.

**Examples:**

> **components/SortButton.tsx**
> This can just be `backgroundColor: 'bg'`, as PandaCSS knows the named colors from our config. 

The braces are only needed for interpolation.

> **stores/commandStateStore.ts**
> We can't hardcode these colors in, as they depend on whether the Light or Dark theme is active.

You should probably be one of `false`, `null`, or `undefined` by default.

> **util/getCommandState.ts**
> The specific foreground/background color we use will depend on the current theme, so we can't hardcode these here unfortunately.

### PANDACSS-007
**PandaCSS – use className={css(...)} for static styles, not inline style={}** (14 hits)

For styles that do not depend on runtime values, use className={css({...})} rather than style={{...}}. PandaCSS can optimize className-based styles at build time. Reserve inline style for truly dynamic runtime values only. Flag style={{...}} attributes containing static values that could be className={css(...)}.

**Examples:**

> **components/CommandCenter/CommandCenter.tsx**
> Is there a reason that `style` is used instead of `className`?

```jsx
          className={css({
            zIndex: 'commandCenter',
          })}
```

> **components/Thought.tsx**
> This can go in the `css({ ... })` block below since `right` is statically analyzable.

`style` is reserved for values that PandaCSS cannot determine at compile-time.

> **components/LetterCasePicker.tsx**
> `position` and `width` can be done with `className={css(...)}`. We usually just reserve `style={...}` for dynamic runtime values.

### PANDACSS-004
**PandaCSS – inline styles in the component that uses them; split into smaller components for complexity** (10 hits)

Co-locate CSS variables and style objects within the component that uses them rather than extracting to separate constants. If a component's styles become too verbose, split the component into smaller sub-components rather than hoisting styles out. Flag style constants extracted into separate files or defined far from their usage.

**Examples:**

> **index.html**
> Can we apply this style in [panda.config.ts](https://github.com/cybersemics/em/blob/82c1f68a31df4086867f3e809c563cdfe2e84ac4/panda.config.ts#L159) for consistency?

> **recipes/conditionalMultiline.ts**
> For applying or not applying an entire recipe, it would be better to just use `base` styles and put the condition in React:

```ts
cx(multiline ? multilineRecipe() : null, ...)
```

> **globalStyles.ts**
> You can define this in `panda.config.js` since that is the only place it is used. I usually only factor out functions into separate files when they need to be exported and imported into different modules.

### PANDACSS-005
**PandaCSS – avoid cssRaw and open-ended style override APIs** (10 hits)

Do not use cssRaw or provide open-ended style override props that let parent components freely customize child CSS. Instead, expose typed props or use CSS custom properties sparingly. The goal is type-safe, meaningful component interfaces. Flag components that accept arbitrary style objects or use cssRaw.

**Examples:**

> **components/LayoutTree.tsx**
> Can these be pushed into the `hideCaret` recipe? It would be great to remove the raw css variables from the high level components.

> **components/CommandItem.tsx**
> Try to avoid wide open types such as `style` or `cssRaw`, as we lose a lot of type safety with this. Which variants do we need to support, how might this be encapsulated, and what public API should the component expose?

> **components/ContextBreadcrumbs.tsx**
> These aren't ideal. `style` is way too wide an interface, and it's strange for the parent to be controlling the margin of its child by passing props. 

If the margin depends on the context, why is `ContextBreadcrumbs` handling it instead of the parent?

### PANDACSS-003
**PandaCSS – use relative units (em) for spacing instead of computed pixel values** (9 hits)

Use em-based values for spacing and padding rather than computing pixel values from fontSize at runtime (e.g., use '0.667em' instead of `fontSize * 2/3 + 'px'`). Flag dynamically computed pixel values that could be expressed as a simple em value.

**Examples:**

> **components/LayoutTree.tsx**
> The `fontSize` division is unnecessary, as we can just specify it in px instead of em in the CSS `calc` below. Less work and less prone to rounding errors.

> **components/CommandItem.tsx**
> This would be better specified in native css `em` units, as described in https://github.com/cybersemics/em/pull/2928#discussion_r2123447495.

> **components/CommandPalette.tsx**
> This would be better as `padding: 0.66em` as described in https://github.com/cybersemics/em/pull/2928#discussion_r2123447495.

### PANDACSS-008
**PandaCSS – do not use !important** (6 hits)

Do not use !important in CSS declarations. Use PandaCSS recipes, layer-based specificity, or restructured selectors to manage style precedence. Flag !important in css() calls or style objects.

**Examples:**

> **App.css**
> Please find another way to accomplish this besides `!important`. It makes the css harder to maintain if it needs to be overridden in the future.

> **components/ThoughtAnnotationWrapper.tsx**
> Let's avoid the use of `!important`. There should be other ways to set up the styles or create Panda recipes to allow style overriding in a less brute force way.

> **App.css**
> `!important` is often a bad practice. Can you explain why it was necessary here? Is there a cleaner way to do this?

### PANDACSS-010
**PandaCSS – do not use will-change without an associated animation; use safer stacking context methods** (4 hits)

will-change should only be set on an element when it is known to animate or transition imminently. Using will-change without a corresponding animation creates a persistent GPU layer, wastes memory, and may cause rendering artifacts. When the goal is to create a stacking context, use transform: 'translateZ(0)' or contain: 'layout paint' instead. Flag will-change declarations that are not paired with a matching animation or transition.

**Examples:**

> **components/CommandTable.tsx**
> Are you sure we need `willChange`? Usually it's needed only in rare circumstances. It does come with a (memory) performance cost.

> **components/CommandsGroup.tsx**
> Similarly, is `willChange` necessary here?

> **components/SortButton.tsx**
> Is `willChange` necessary?

### PANDACSS-002
**PandaCSS – adapt native UI chrome to the active theme** (3 hits)

Native platform elements (e.g., status bar, navigation bar) must dynamically reflect the active theme (dark/light) rather than being hardcoded to one style. Flag native UI configuration that uses a fixed dark or light value instead of reading from the current theme.

**Examples:**

> **e2e/puppeteer/__tests__/__image_snapshots__/sidebar/sidebar-empty-light.png**
> It should probably fade from white in Light mode. Maybe a color is configured incorrectly or a new color field should be defined?

> **components/AppComponent.tsx**
> You should set `Style.Dark` or `Style.Light` depending on the value of the `dark` prop.

> **e2e/puppeteer/__tests__/__image_snapshots__/sidebar/sidebar-empty-light.png**
> We'll probably need to do a full Light Mode design at some point, but for now let's at least make sure the contrast is correct when it switches to dark-on-light. That will make it easier to theme in the future, because we'll at least have the basic theme colors in place.

### PANDACSS-009
**PandaCSS – use statically analyzable class names; avoid dynamic string templates** (3 hits)

PandaCSS performs static analysis at build time and cannot process dynamically constructed class strings (template literals, concatenation). Use conditional objects or recipe variants instead of string interpolation for dynamic classes. Flag template literals or string concatenation in css() or className expressions.

**Examples:**

> **panda.config.ts**
> `.modal__root` and `.modal__actions` are build artifacts, so we don't want to code against them. Is there a different we can apply these styles?

> **components/Subthought.tsx**
> `.editable--preventAutoscroll_true` is autogenerated by PandaCSS so it's dangerous to hardcode it into the component. If the [recipe variant](https://github.com/cybersemics/em/blob/42b1ef55abd5457ecbbbc39512be3dc6a1682fb5/src/recipes/editable.ts#L41) changes, this will break without us knowing.

I believe PandaCSS has a way to programmatically get the className of a recipe variant, although I...

### PANDACSS-012
**PandaCSS - use CSS custom properties to share values across declarations** (2 hits)

Use CSS custom properties (design tokens) to enforce that the same value is reused across multiple properties.

**Examples:**

> **components/DropUncle.tsx**
> Does this balance out another value? If so, we need to use a shared variable. Right now all the values appear to be independent.

> **App.css**
> We can leverage CSS variables for a more explicit enforcement of using the same value across multiple properties.

### PANDACSS-006
**PandaCSS – omit easing on color transitions; reserve easing for kinematic animations** (1 hits)

Do not apply easing functions (ease-in, ease-out, cubic-bezier) to color transitions. Easing is semantically tied to physical motion and has no meaningful effect on color interpolation. Use linear or no timing function for color transitions. Flag color transitions that specify an easing function.

**Examples:**

> **components/Sidebar.tsx**
> You can drop the easing on the hue/sat animation. Easing is meant to approximate non-linear kinematics for moving bodies, which doesn't apply to color. 

(As a gaseous entity, it would technically follow pressure gradients, but I don't think we want to build a fluid dynamic physics engine into our color system 😂).

---

## React
<a id="react"></a>

*17 rules | 70 total hits*

### REACT-001
**React – pass callbacks directly instead of wrapping in unnecessary handlers** (11 hits)

When a callback prop can be passed directly to a child component, do not wrap it in an anonymous function or intermediate handler that just calls through to it. Flag wrapper functions like `() => someCallback()` or `(e) => someCallback(e)` that add no logic beyond forwarding the call.

**Examples:**

> **components/Divider.js**
> Wrapping a function with no arguments in a lambda function is redundant. You can simply pass the function reference: `useEffect(setStyle)`.

> **components/Toolbar.js**
> The extra lambda function is unnecessary here. You can simply do `window.addEventListener('mouseup',  clearHoldTimer)`.

> **hooks/useLottieIntervalAnimation.ts**
> FYI You can omit the empty function wrapper and return the function reference:

```ts
return clearTimers
```

### REACT-007
**React – use useDispatch/useSelector hooks; do not import the global store in components** (10 hits)

In React components, use the useDispatch hook to dispatch actions and useSelector to read state. Do not import the global store directly. Direct store imports bypass React's subscription model and can cause stale reads. Flag store imports in component files.

**Examples:**

> **hooks/useLongPress.ts**
> You can use `reactMinistore`'s built-in hooks:

```ts
const isLocked = longPressStore.useSelector(state => state.isLocked)
```

> **components/Content.tsx**
> Getting the state directly from the store is usually incorrect, as it can go stale. You need `useSelector` to ensure your derived values are updated when the state changes.

> **components/Content.tsx**
> You would need to add `useSelector` outside the function, or turn the whole callback into a `useSelector`.

### REACT-003
**React – avoid routing imperative side-effects through state + useEffect** (8 hits)

When an event handler needs to trigger a side effect (e.g., calling animate()), call it directly from the handler. Do not set a boolean state flag and then react to it in a useEffect. Flag patterns where local state is set solely to trigger a useEffect that performs an imperative action.

**Examples:**

> **components/Toolbar.js**
> Why create another state variable instead of just calling `overlayHide`?

Let's try to accomplish this without adding more complexity to state.

> **components/ColorPicker.tsx**
> It looks like you have a computed value based on cursorStyle, backgroundColor, and color. If that's the case, you can use `useMemo` rather than `useState`.

> **components/Divider.tsx**
> I think you can replace `dividerSetWidth`, `width/setWidth`, and the `useEffect` with a single `useMemo` that depends on `maxSiblingWidth`.

### REACT-005
**React – extract large JSX sub-trees into named sub-components** (8 hits)

When a component's JSX contains large or logically distinct sub-trees, extract them into named sub-components (in the same file if not reused elsewhere). This keeps the main component's render method readable. Flag components with deeply nested JSX that contains logically separable sections.

**Examples:**

> **components/Tips/Tip.tsx**
> Let's factor this out into a `TipBlur` component. You can keep it in the Tip module, but separating it into a separate component will keep the main `Tip` component cleaner.

> **components/GestureDiagram.tsx**
> Let's factor out the question mark diagram (same file, different component) as the main component is getting quite long.

> **components/QuickDropIcon.tsx**
> You can combine `QuickDropIcon` and `DroppableQuickDropIcon` into one component. The separation no longer makes sense.

### REACT-004
**React – do not pass inline object or array literals as props** (7 hits)

Do not pass array literals ([...]) or object literals ({...}) directly as JSX props. Each render creates a new reference, breaking React.memo and useMemo optimizations. Extract to a const outside the component or use useMemo. Flag inline array/object literals in JSX prop positions.

**Examples:**

> **components/ContextBreadcrumbs.tsx**
> This also has the object reference problem, although it's not as significant since `HomeLink` is rendered rarely, and is a very light component.

> **components/ContextBreadcrumbs.tsx**
> Actually this will create a new object reference every call to render. You have to move it to the module scope at the top of the file :).

> **components/Content.tsx**
> I think you will have to `filter` within the `render` function. Otherwise `filter` creates a new object references and `mapStateToProps` will force a re-render even if the thoughts have not changed.

### REACT-008
**React – model mutually exclusive states as an enum/union, not multiple booleans** (6 hits)

When multiple boolean flags represent mutually exclusive states (e.g., open, opening, closing), model them as a single state variable with a union type. Multiple booleans allow invalid combinations and require coordinated updates. Flag two or more booleans that represent phases of a single process.

**Examples:**

> **hooks/useThoughtMultiline.ts**
> I'm not totally satisfied with the handoff between `multilineDelayed` and `multilineImmediate`. It seems like you should be able to find a way to get this into a single variable.

> **stores/safariKeyboardStore.ts**
> The keyboard can't be opening and closing at the same time, so I don't believe those need to be modeled as independent variables. Can it model as `state: 'open' | 'opening' | 'closing'` or is it more complex than that?

> **hooks/useFauxCaretCssVars.ts**
> Defining four separate state vars for the faux caret line states would suggest that they are orthogonal, but I'm not sure if that's the case. 

For example, would `showLineStartFauxCaret` and `showLineEndFauxCaret` ever both be true?

### REACT-006
**React – do not query or measure the DOM in the render body** (5 hits)

DOM queries (querySelector, getBoundingClientRect, getComputedStyle) must not be called in the render body of a React component. Use useLayoutEffect or useEffect for DOM measurements. Render-body DOM access causes layout thrashing and breaks SSR. Flag DOM API calls outside of effects or refs.

**Examples:**

> **hooks/useThoughtMultiline.ts**
> Maybe you want to do this in `useLayoutEffect`? It's not really appropriate to access the DOM directly in a React render function.

> **components/LayoutTree.tsx**
> This needs to go in the `useLayoutEffect`. Never query the DOM in the body of a React function.

> **components/Subthoughts.js**
> Instead of doing state mutations from within the `render` function outside of any event handlers, I suggest putting this in the `page` initializer. This saves unnecessary renders and follows best practices.

### REACT-018
**React - keep hook dependency arrays accurate** (5 hits)

Ensure all reactive dependencies are declared in useMemo/useCallback/useEffect dependency arrays. Remove unused dependencies.

**Examples:**

> **components/Content.js**
> I think this needs to memoize on `isTutorial()` as well, otherwise `contentClassNames` will not be updated when `isTutorial()` changes.

> **components/Divider.tsx**
> It's better to pass the dependencies that are expected here. No need to override the linter from what I can tell.

> **components/TreeNode.tsx**
> `x` is no longer a dependency, so it can be removed.

### REACT-009
**React – prefer conditional rendering over visibility:hidden for unmounted content** (3 hits)

Use conditional rendering (returning null or omitting a subtree) instead of CSS visibility:hidden or opacity:0 for content that should not be shown. Hidden-but-mounted components still render, run effects, and consume resources. Flag visibility:hidden or opacity:0 used to hide components that could be conditionally unmounted.

**Examples:**

> **components/BulletCursorOverlay.tsx**
> Also, can the nodes be removed completely instead of hiding them?

> **components/Thought.js**
> Instead of hiding paged thoughts, they should not be rendered. Part of the reason for pagination is for performance. Rendering and hiding them with CSS somewhat defeats this purpose. I recommend using a different approach that ensures that the correct thoughts are rendered or re-rendered in React based on the paging logic.

> **components/ThoughtAnnotationWrapper.tsx**
> Using `visibility: hidden` still renders all the React components, which can hurt performance. React rendering might be fast, but some components have additional hooks and effects that will run, e.g. `FauxCaret`. It would be better to selectively show/hide the necessary descendants at the React level.

In a normal app this might not matter, but **em** is highly performance sensitive so we have ...

### REACT-011
**React – use useRef for mutable cross-render state; useMemo for cached derived values** (2 hits)

useRef is for holding mutable values that persist across renders without triggering re-renders (e.g., tracking previous values). useMemo is for caching derived values that are expensive to compute. Do not use useRef to cache derived values or useMemo for mutable state. Flag useRef used to cache derived values or useMemo used for mutable tracking.

**Examples:**

> **components/LayoutTree.tsx**
> Yes, that's correct.

I would recommend storing it in a ref rather than state, otherwise it will force a re-render.

> **components/LayoutTree.tsx**
> Why use a ref? This value should not be preserved across renders.

### REACT-014
**React – access Redux state imperatively via thunks, not hooks, in event handlers** (2 hits)

When an event handler or callback needs to read Redux state imperatively (not reactively for rendering), dispatch a thunk rather than subscribing via a hook. Using a hook to access state that is only needed imperatively causes unnecessary re-renders when that state changes. Flag hooks used solely to capture state values only read inside event handlers.

**Examples:**

> **components/Editable.tsx**
> Are you sure this needs to be reactive? It's only used in the change handler from what I can tell.

You can reorganize `newValue` into the thunk to get access so the Redux state.

> **components/ColorPicker.tsx**
> Since `simplePath` is only used when you dispatch `editThought`, I would recommend using a thunk rather than useSelector:

```ts
  dispatch((dispatch, getState) => {
    const state = getState()
    if (!state.cursor) return
    const thought = getThoughtById(state, head(state.cursor))
    const simplePath = simplifyPath(state, state.cursor)
    dispatch(editThought({ 
      oldValue: ...

### REACT-016
**React - define variables inside useEffect scope where they are used** (2 hits)

Define variables inside the useEffect scope where they are used rather than at the component level.

**Examples:**

> **components/Toolbar.tsx**
> `onMouseLeave` can be defined inside the `useEffect` so that it doesn't have to be memoized and its closer to where its used.

> **components/Toolbar.tsx**
> `toolbarContainer` would be better defined inside the `useEffect`, inside the scope where it is used.

### REACT-002
**React – do not add redundant guards around React state setters** (1 hits)

React state setters (useState, setState) already no-op when the new value equals the current value. Do not add equality checks before calling a setter. Flag patterns like `if (value !== state) setState(value)` — just call `setState(value)` directly.

**Examples:**

> **components/Sidebar.tsx**
> As far as I know, React setters already have this condition built in as a no-op.

### REACT-010
**React – subscribe to state changes via delta detection, not presence checks**

When subscribing to a store and acting on a state change, detect the transition (e.g., isPulling changed from true to false) rather than just checking the current value. A presence check fires on every update where the condition holds, not just at the moment of change. Flag store subscriptions that check a boolean's current value without comparing to the previous value.

*(No matching examples in corpus)*

### REACT-012
**React – hooks must return a callback, not be used directly as event handlers**

A custom hook should return a callback function rather than accepting the event as a parameter and being called directly as the handler. A hook called with useOnCut(event) is not a proper hook; it should return a function assignable as the event handler. Flag custom hooks that take event objects as direct parameters instead of returning handler functions.

*(No matching examples in corpus)*

### REACT-013
**React – hidden-but-mounted components must have pointer-events: none**

When a component is visually hidden (e.g., via opacity: 0 or transform: translateY offscreen) but still mounted, it must have pointer-events: none to prevent users from interacting with invisible elements. Flag components that hide themselves via opacity or transform without also disabling pointer events.

*(No matching examples in corpus)*

### REACT-015
**React – prefer native React event handler props over manual addEventListener in effects**

Use native React event handler props (onMouseMove, onClick, etc.) rather than manually attaching event listeners via addEventListener in useEffect. Native React handlers are declarative, automatically cleaned up, and do not require a useEffect. Flag useEffect blocks whose sole purpose is to attach and remove an event listener when a React event prop would suffice.

*(No matching examples in corpus)*

---

## Redux
<a id="redux"></a>

*13 rules | 70 total hits*

### REDUX-007
**Redux – subscribe to the minimal derived value, not the whole object** (25 hits)

When selecting from the Redux store, subscribe to the specific primitive value needed rather than the entire object. Selecting a full object causes re-renders whenever any property changes, even unrelated ones, because the object reference is unstable. Flag useSelector calls that select an entire object when only one property is used.

**Examples:**

> **components/BulletCursorOverlay.tsx**
> Rather than having closure over a separate `cursor` variable, access `state.cursor` directly in this `useSelector`. This will be more self-contained.

> **components/Toolbar.tsx**
> Re-rendering the Toolbar when anything in the state changes is overkill and likely to introduce performance issues. It should only re-render when it needs to.

> **components/Editable/useMultiline.ts**
> This would cause every `Editable` component to re-render whenever any thought is edited. That's too broad and will clobber performance.

### REDUX-001
**Redux – prefer reducers over action-creators for state logic** (10 hits)

State transitions and conditional logic based on current state should be handled in reducers, not in action-creators. Action-creators should be reserved for side effects (network requests, DOM interactions, async flows). If an action-creator reads state and dispatches based on it, that logic belongs in a reducer.

**Examples:**

> **redux-enhancers/undoRedoReducerEnhancer.ts**
> Think of any function that takes a `State` and returns a new `State` as a reducer. `state: State` should be the first argument by convention.

> **action-creators/logout.ts**
> Let's move `setRemoteSearch(false)` to the `clear` reducer so that we hide the details of resetting the state from `logout`.

> **store.js**
> Ideally this would be handled "higher up", i.e. prevent `existingItemChange` from getting dispatched at all. The check should happen where code is merged, probably in `deleteItem`.

### REDUX-004
**Redux – avoid DOM access in action-creators** (6 hits)

Action-creators must not query or manipulate the DOM directly. DOM-derived values should be obtained via Redux selectors or passed as arguments from the component layer. Flag any document.querySelector, getElementById, or similar DOM API calls inside action-creator functions.

**Examples:**

> **reducers/importText.ts**
> Can you use `state.cursorOffset` instead of `selection.offset()`? I'm not sure if it will work, but it would be nice to not need the `selection` dependency.

> **actions/textColor.ts**
> You should move the selection logic into the action-creator. Reducers must be pure functions and not rely on any global or window context. `state1 + args → state2`

> **actions/textColor.ts**
> You need to move the selection logic into the action-creator. Reducers must be pure functions and not rely on any global or window context. `state1 + args → state2`

### REDUX-006
**Redux – use selectors instead of DOM queries for deriving structural data** (5 hits)

Use Redux selectors or hierarchical component data to derive structural relationships between thoughts. Do not traverse the DOM to find parent/child/sibling relationships when that information is already available in Redux state. Flag DOM traversal (parentElement, closest, querySelector) used to derive data that existing selectors provide.

**Examples:**

> **stores/viewport.ts**
> I don't love the dependency on the DOM. I will await your explanation of the use of `contentWidth`, but this is looking a bit fragile and not typesafe.

> **e2e/puppeteer/helpers/mockGestureMenuCommands.ts**
> Do not use `parentElement` as that creates an unnecessary dependency on the DOM structure.

> **components/Divider.tsx**
> With `:not(.thought-divider)`, wouldn't this return 0 elements in the case of the divider only-child? 

I don't see how the next condition of `elements.length === 1` will match in this case, but maybe you can explain it to me.

### REDUX-008
**Redux – selectors should accept the full state object, not a slice** (5 hits)

Selector functions should accept the full Redux state object as their first parameter, not a specific slice (e.g., thoughtIndex). This keeps the selector interface consistent and allows selectors to access any part of state if needed later. Flag selector functions whose first parameter is a state slice rather than the full state.

**Examples:**

> **shortcuts/deleteEmptyThoughtOrOutdent.js**
> Subtle point, but I would recommend passing `state` directly here, as then the function better conforms to a selector signature.

> **shortcuts/deleteEmptyThoughtOrOutdent.js**
> Now that I think about it, I think `shortcuts` should pass `state` directly so that `canExecute` also matches the selector signature. That doesn't have to be done in this PR.

> **util/importJSON.ts**
> It's recommended that `state` is always the first argument so it follows the convention of other selectors.

### REDUX-012
**Redux – guard thunks against no-op dispatches** (4 hits)

Action-creator thunks should check whether dispatching would actually change state before dispatching. Dispatching a no-op action fires middleware unnecessarily and clutters Redux DevTools action history. Flag thunks that dispatch reducers unconditionally when a cheap state read would allow skipping the dispatch.

**Examples:**

> **action-creators/setEditingValue.js**
> I think we should only dispatch an event if the value has actually changed, in order to avoid unnecessary actions. What do you think?

> **action-creators/setInvalidState.js**
> Same question as with `setEditingValue`

> **components/Thought.js**
> I think it might be better to not `dispatch` an error here actually, because `canDrag` is called for every drag check and the user may still be in the process of dragging the thought where they want it to go. Preventing the `drag` is sufficient.

Side note: Be aware that `props.cursor` can be `null`.

### REDUX-002
**Redux – do not proliferate single-purpose reducers unnecessarily** (3 hits)

Avoid creating new reducers for logic that can be handled by existing reducers or consolidated into them. Prefer extending an existing reducer over introducing a new one when the logic is closely related. Flag new reducer files that handle logic already covered or easily absorbed by an existing reducer.

**Examples:**

> **action-creators/index.js**
> Let's combine these into a single, parameterized reducer. Possible input values may be `'top'`, `'bottom'`, or `null`. `null` can be used to remove pins.

> **components/Thought.js**
> I think we can store `dragTimeoutId` locally rather than add an additional global reducer. I'm not sure whether closure, `useState` or `useEffect` is the right solution. 

@shresthabijay What do you think?

> **reducers/setCursorInitialized.ts**
> I'm not sure it's safe to change the cursor directly. We typically dispatch `setCursor` which keeps edit mode, `expanded`, and other cursor-related state in sync. Can we add an `init: boolean` option to `setCursor` instead of creating a separate reducer?

### REDUX-005
**Redux – prefer single-purpose action-creators over polymorphic ones** (3 hits)

Action-creators should have a single, clear responsibility. Avoid polymorphic action-creators that accept flags or modes to perform different operations (e.g., toggleDropdown that can also close). Instead, create dedicated action-creators for each distinct operation. Flag action-creators that use parameters to switch between fundamentally different behaviors.

**Examples:**

> **actions/showTip.ts**
> I should probably add a dedicated `closeDropdowns` action-creator. `toggleDropdown` is a bit too polymorphic. Totally not obvious.

> **components/Sidebar.js**
> If the user clicks the link twice in a row, the sidebar will incorrectly toggle back on. I recommend passing an optional `value` argument that can force the sidebar on or off.

```
export const toggleSidebar = (state, value) => ({
  showSidebar: value == null ? !state.showSidebar : value
})  
```

> **actions/showTip.ts**
> Are you sure you need to check `hasOpenDropdown` first? Just calling `toggleDropdown` should close any open dropdowns.

Note that this would be a suboptimal way to do it anyway, as it requires the list of dropdowns be maintained separately from `toggleDropdown`. The main purpose of `toggleDropdown` is to centralize dropdown handling and avoid duplication and accidental decoupling.

### REDUX-009
**Redux – use compact reducer style; return partial state, not spread** (3 hits)

Reducers should return a partial state object that gets merged by the root reducer. Do not explicitly spread the full state (return { ...state, key: value }). The compact form reduces boilerplate. Flag reducers that return { ...state, ... } when a partial return would work.

**Examples:**

> **reducers/highlightBullet.js**
> Use compact representation with paren-wrapped object rather than explicit return.

> **reducers/dragInProgress.js**
> Revert to compact representation

> **reducers/existingThoughtDelete.js**
> You can return nothing, as the main reducer handles it when [merging the updated fields into state](https://github.com/cybersemics/em/blob/dev/src/reducers/index.js#L98).

Can you add a `console.error` here? This *shouldn't* happen normally, so I'd like to be aware of it if it does.

### REDUX-010
**Redux – reducers must be pure functions with no browser API dependencies** (2 hits)

Reducer functions must not import or use browser APIs (window, document, Selection). Browser-derived values should be passed as action payload from the component layer or action-creators. Flag import statements for browser APIs in reducer files.

**Examples:**

> **reducers/splitView.js**
> There shouldn't be any side effects in reducers. I believe this should go in the action-creator thunk.

> **reducers/importText.ts**
> Reducers need to be pure functions, so we shouldn't have any browser dependencies in this file. Instead, move this up a level to the `importText` action-creator and override the cursor offset with a reducer parameter. It increases the complexity of the reducer signature, but it's worth it to maintain the purity of the function.

### REDUX-017
**Redux - use reducerFlow patterns correctly** (2 hits)

Use uncurried reducer form when intermediate state access is needed in reducerFlow. Apply changes incrementally.

*(No matching examples in corpus)*

### REDUX-003
**Redux – handle Redux-to-Redux state transitions in reducers or middleware, not useEffect** (1 hits)

When one Redux state change should trigger another Redux state change, the logic belongs in a reducer or middleware — not in a React component's useEffect hook. useEffect should not be used to bridge Redux state transitions. Flag useEffect hooks that read Redux state and dispatch actions in response to state changes.

*(No matching examples in corpus)*

### REDUX-011
**Redux – derive transient flags from state transitions, not mutable enhancer variables** (1 hits)

When a Redux enhancer or middleware needs to react to a state transition, derive the condition by comparing prevState and nextState rather than tracking a mutable boolean in the enhancer's closure. Closure-level mutable variables are invisible to DevTools, not reset on store reinitialization, and duplicate information in the Redux state tree. Flag mutable boolean or counter variables in enhancer closures that could be derived from state.

*(No matching examples in corpus)*

---
