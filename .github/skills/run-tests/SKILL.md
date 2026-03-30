---
name: run-tests
description: "Run the repository's tests and linter directly in the shell. Use this skill after every code change to verify tests pass, check lint results, or debug test failures."
---

# Run Tests

Run tests and linting directly in the shell. The Node.js environment and dependencies are already set up by copilot-setup-steps.

## Commands

Run **all three** after every code change:

```sh
yarn test
yarn lint
yarn test:puppeteer
```

- `yarn test` — Vitest unit tests
- `yarn lint` — ESLint + TypeScript type checking
- `yarn test:puppeteer` — Puppeteer browser E2E tests (requires `yarn build` first)

## Workflow

1. Make a code change.
2. Run `yarn test` and `yarn lint`. These are fast — run them first.
3. If unit tests or lint fail, fix the issues before proceeding.
4. Run `yarn build && yarn test:puppeteer` for E2E tests. These are slower.
5. If E2E tests fail, fix and re-run.
6. Only consider the change complete when all three pass.

## Diagnosing Failures

- **Unit test failures**: Vitest output shows the failing test file, test name, and assertion diff.
- **Lint failures**: Output shows ESLint errors or TypeScript type errors with file paths and line numbers.
- **Puppeteer failures**: Output shows the failing E2E test name and error. Image snapshot mismatches will show expected vs. received paths.

## Notes

- All commands run in the project root directory.
- The Puppeteer E2E tests require a build (`yarn build`) before they can run.
- Run `yarn prettier --write .` before committing.
