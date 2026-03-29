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

All three workflows support `workflow_dispatch`.

## Step 1: TRIGGER the workflows FIRST

**IMPORTANT: Do NOT use `actions_list` to look for existing runs. Always trigger new runs first.**

Use `gh workflow run` in a shell to dispatch each workflow on the current branch. When verifying a code change, trigger **all three**:

```sh
BRANCH=$(git branch --show-current)
gh workflow run test.yml --ref "$BRANCH"
gh workflow run lint.yml --ref "$BRANCH"
gh workflow run puppeteer.yml --ref "$BRANCH"
```

## Step 2: Wait, then poll for results

After triggering, wait ~15 seconds for the runs to register, then poll with `gh run list`:

```sh
gh run list --branch "$BRANCH" --limit 10
```

Or use the `actions_list` MCP tool to list workflow runs filtered by branch. Poll until all runs reach a terminal status (`completed`, `failure`).

## Step 3: Check results

- If all runs succeed, report that tests passed.
- If any run fails, get the logs:

```sh
gh run view <run-id> --log-failed
```

Or use the `get_job_logs` MCP tool to retrieve logs for failed jobs.

## Step 4: Diagnose failures

When a workflow fails:

1. Get the failed job logs (see Step 3).
2. Look for the failing test name and error message.
3. For **unit test** failures: the log will show the Vitest output with the failing test file and assertion.
4. For **lint** failures: the log will show ESLint errors or TypeScript type errors.
5. For **Puppeteer** failures: the log will show the failing E2E test. Image snapshot diffs are uploaded as artifacts — check with `gh run view <run-id>` or `actions_get`.

## Notes

- All workflows use Node.js 22 and Yarn.
- The Puppeteer workflow requires a build step (`yarn build`) before tests run, so it takes longer.
