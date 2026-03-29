---
name: run-tests
description: "Run the repository's test and lint workflows via GitHub Actions and monitor the results. Use this skill when you need to verify that code changes pass tests, check lint results, or debug CI failures."
---

# Run Tests

This skill triggers and monitors the repository's CI workflows.

## Available Workflows

| Workflow file | Name | What it runs |
|---|---|---|
| `test.yml` | Test | `yarn test` (Vitest unit tests) |
| `lint.yml` | Lint | `yarn lint` (ESLint + TypeScript type checking) |
| `puppeteer.yml` | Puppeteer | `yarn test:puppeteer` (browser E2E tests with image snapshots) |

All three workflows support `workflow_dispatch` and trigger on `pull_request`.

## Step 1: TRIGGER the workflows

**Always trigger new runs. Do not just list existing runs.**

Use `gh workflow run` to dispatch each workflow on the current branch:

```sh
BRANCH=$(git branch --show-current)
gh workflow run test.yml --ref "$BRANCH"
gh workflow run lint.yml --ref "$BRANCH"
gh workflow run puppeteer.yml --ref "$BRANCH"
```

When verifying a code change, trigger **all three**.

**Fallback:** If `gh` is not authenticated, push your changes and create/update a PR instead — the `pull_request` trigger will start all three workflows automatically.

## Step 2: Poll for results

Wait ~15 seconds for runs to register, then poll:

```sh
gh run list --branch "$BRANCH" --limit 10
```

Or use the `actions_list` MCP tool to list workflow runs filtered by branch. Poll until all three runs (Test, Lint, Puppeteer) reach a terminal status.

The Test and Lint runs take a few minutes. Puppeteer takes longer because it builds first.

## Step 3: Check results

- If all runs succeed, report that tests passed.
- If any run fails, get the logs:

```sh
gh run view <run-id> --log-failed
```

Or use the `get_job_logs` MCP tool.

## Step 4: Diagnose failures

When a workflow fails:

1. Get the failed job logs (see Step 3).
2. Look for the failing test name and error message.
3. For **unit test** failures: the log will show the Vitest output with the failing test file and assertion.
4. For **lint** failures: the log will show ESLint errors or TypeScript type errors.
5. For **Puppeteer** failures: the log will show the failing E2E test. Image snapshot diffs are uploaded as artifacts — check with `actions_get`.

## Notes

- All workflows use Node.js 22 and Yarn.
- The Puppeteer workflow requires a build step (`yarn build`) before tests run, so it takes longer.
