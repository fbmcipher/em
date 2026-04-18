This is a Typescript/React/Redux web app that runs as a PWA on mobile.

Background: https://github.com/cybersemics/em/wiki/Docs

Contributing Guidelines: https://github.com/cybersemics/em/blob/main/CONTRIBUTING.md

## Setup and Development

### Installation

- Run `yarn` to install dependencies.
- Postinstall automatically runs `yarn build:packages` and `yarn build:styles`.

### Development Server

- Run `yarn start` to start the Vite dev server on port 3000.

### Build

- Run `yarn build` to build the project (builds packages, styles, and Vite bundle).

## Code Standards

### Files, modules, and exports

- Do not create new files for constants, hooks, components, selectors, or helper functions that are only used in a single file. Instead, define them in the same file where they are used.
- Only a single, default export is allowed. Named exports are not allowed.
  - Exception: action-creators are co-located with reducers in `src/actions` and exported as named exports.
- Filename should exactly match the default export name.
- Prefer co-located functions over unnecessary abstraction. If a function is only used in one module, define it there instead of abstracting it out into a separate file.

### Required Before Each Commit

- Run `yarn prettier --write .` before committing any changes to ensure proper code formatting.

### Functional Programming

- Prefer pure functions.
- Prefer ternary operators over if statements.
- Avoid mutations and side effects when possible.
- Use `const`; avoid `let`.
- Avoid `for` loops; use `map`, `filter`, `reduce`.
- Use point-free style when appropriate: Avoid `setTimeout(() => cb())`; use `setTimeout(cb)`.

### React

- Use hooks.

### CSS

- Inline styles using PandaCSS: `className={css({ marginTop: '1em' })}`
- Only use style attribute for dynamic runtime value. PandaCSS can only handle statically analyzable values.

### Code Quality

- Write a JSDOC comment for each function definition.
- Add descriptive comments to code that is counterintuitive, non-obvious, or requires explanation.
- Avoid overly vague variable names or extraneous affixes such as "data".
- Avoid redundancy in code and naming.

### Testing

- Tests are located in `**/__tests__/*`.
- Testing guidelines are described in https://github.com/cybersemics/em/wiki/Testing.
- Use existing test helpers and follow conventions in existing tests.
- Run linter with `yarn lint`.
- Run unit tests with `yarn test`.
- Run Puppeteer tests with `yarn test:puppeteer`.
- Ensure linter, unit tests, and puppeteer tests all pass before requesting a review.
- **CI Verification Loop**: After completing your changes, you MUST verify all CI checks pass before marking a PR as ready for review. Follow this process:
  1. Run `yarn lint` and `yarn test` locally and fix any failures.
  2. Push your branch and open a **draft** pull request: `gh pr create --draft --title "..." --body "..."`
  3. Wait for all CI checks to complete by polling: `gh pr checks <pr-number> --watch --fail-fast`
  4. If any check fails, inspect the failure logs with: `gh run view <run-id> --log-failed`
  5. Fix the issues, push again, and repeat from step 3.
  6. Once ALL checks pass (including Puppeteer e2e tests), mark the PR as ready: `gh pr ready <pr-number>`
  - Do NOT mark a PR as ready for review until all CI checks are green.
  - Do NOT skip Puppeteer tests — they require the CI environment (Docker) and cannot be run locally in your session.
  - **Snapshot failures**: If Puppeteer tests fail due to snapshot mismatches, do NOT delete or manually edit snapshot files. Instead, trigger the snapshot update workflow and wait for it to commit the updated snapshots to your branch:
    1. `gh workflow run update-snapshots.yml -f branch=<your-branch>`
    2. Poll until complete: `gh run list --workflow=update-snapshots.yml --branch=<your-branch> --limit=1 --json status,conclusion`
    3. Pull the updated snapshots: `git pull`
    4. Wait for CI to re-run and pass, then mark the PR as ready.
- Checking if the CI is running using if-statements in the application source code is a bad practice and should be avoided if at all possible. It adds noise to application code, pollutes the production build, and sets up potentially hard to catch bugs where the application is behaving differently in tests than in production. When mocking functionality, find a way to modify/inject the mock from the test code. For example, if you need to mock commands in the GestureMenu in the Puppeteer tests, you might use direct DOM manipulation to replace whatever commands appear with dummy commands after they are rendered in the UI. This will create a small dependency on the DOM structure (though sticking to `data-testid` and `aria-label` will mitigate this), but it's better than mocks leaking into the application code.
- Do not silently ignore unexpected states in tests by adding if-statements. Assume elements are present (or poll until they are present if there is an asynchronous action that must be awaited). Do not clutter test code with unnecessary if-stateents or try-catch statements. Allow the tests to fail hard otherwise.
- Do not use element selectors in tests. That creates unnecessary dependencies on the DOM structure. Instead, select based on `data-testid` or `aria-label` only. Add these attributes to the source code as needed.
