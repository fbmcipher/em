---
name: run-tests
description: "Run the repository's test and lint workflows via GitHub Actions and monitor the results. Use this skill when you need to verify that code changes pass tests, check lint results, or debug CI failures."
---

# Run Tests

This skill runs the repository's CI workflows and monitors results.

## Available Workflows

| Workflow file | Name | What it runs |
|---|---|---|
| `test.yml` | Test | `yarn test` (Vitest unit tests) |
| `lint.yml` | Lint | `yarn lint` (ESLint + TypeScript type checking) |
| `puppeteer.yml` | Puppeteer | `yarn test:puppeteer` (browser E2E tests with image snapshots) |

All three workflows trigger automatically on `pull_request` events.

## Step 1: Trigger workflows by pushing and opening a PR

Workflows cannot be triggered directly from this environment. Instead, they run automatically when a pull request is created or updated.

1. Commit and push your changes to the branch.
2. If no PR exists for the branch yet, create one.
3. If a PR already exists, the push will automatically trigger new workflow runs.

## Step 2: Poll for results

After pushing, wait ~15 seconds for the runs to register, then use `actions_list` to list workflow runs for the current branch. Poll until all three runs (Test, Lint, Puppeteer) reach a terminal status (`completed`, `failure`).

Expect three separate runs. The Test and Lint runs take a few minutes. The Puppeteer run takes longer because it builds the app first.

## Step 3: Check results

- If all runs succeed, report that tests passed.
- If any run fails, use `get_job_logs` to retrieve the logs for the failed jobs.

## Step 4: Diagnose failures

When a workflow fails:

1. Fetch the job logs with `get_job_logs`.
2. Look for the failing test name and error message.
3. For **unit test** failures: the log will show the Vitest output with the failing test file and assertion.
4. For **lint** failures: the log will show ESLint errors or TypeScript type errors.
5. For **Puppeteer** failures: the log will show the failing E2E test. Image snapshot diffs are uploaded as artifacts if visual regressions are detected — use `actions_get` to check for artifacts.

## Notes

- All workflows use Node.js 22 and Yarn.
- The Puppeteer workflow requires a build step (`yarn build`) before tests run, so it takes longer.
- The `gh` CLI is not available in this environment. Use the MCP tools (`actions_list`, `actions_get`, `get_job_logs`) for all GitHub Actions operations.
