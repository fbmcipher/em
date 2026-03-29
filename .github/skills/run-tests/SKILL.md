---
name: run-tests
description: "Run the repository's test and lint workflows via GitHub Actions and monitor the results. Use this skill when you need to verify that code changes pass tests, check lint results, or debug CI failures."
---

# Run Tests

This skill triggers and monitors the repository's CI workflows using GitHub Actions MCP tools.

## Available Workflows

| Workflow file | Name | What it runs |
|---|---|---|
| `test.yml` | Test | `yarn test` (Vitest unit tests) |
| `lint.yml` | Lint | `yarn lint` (ESLint + TypeScript type checking) |
| `puppeteer.yml` | Puppeteer | `yarn test:puppeteer` (browser E2E tests with image snapshots) |

## How to Run Tests

### 1. Trigger the workflows

Use `actions_run_trigger` to dispatch the workflows you need on the current branch:

- For unit tests: trigger `test.yml`
- For linting: trigger `lint.yml`
- For E2E browser tests: trigger `puppeteer.yml`

When verifying a code change, trigger **all three** workflows in parallel unless you have a specific reason to run only one.

### 2. Monitor the runs

Use `actions_list` to list recent workflow runs for this repository filtered by branch. Poll until the runs complete.

### 3. Check results

- If all runs succeed, report that tests passed.
- If any run fails, use `get_job_logs` to retrieve the logs for the failed jobs.

### 4. Diagnose failures

When a workflow fails:

1. Fetch the job logs with `get_job_logs`.
2. Look for the failing test name and error message.
3. For **unit test** failures: the log will show the Vitest output with the failing test file and assertion.
4. For **lint** failures: the log will show ESLint errors or TypeScript type errors.
5. For **Puppeteer** failures: the log will show the failing E2E test. Image snapshot diffs are uploaded as artifacts if visual regressions are detected — use `actions_get` to check for artifacts.

## Notes

- All workflows use Node.js 22 and Yarn.
- The Puppeteer workflow requires a build step (`yarn build`) before tests run, so it takes longer.
- The Test and Puppeteer workflows support `workflow_dispatch` and can be triggered on any branch.
- The Lint workflow triggers on push/PR only — it does not have `workflow_dispatch`, so it cannot be manually triggered. Check existing runs instead.
