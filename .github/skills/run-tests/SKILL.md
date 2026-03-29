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

All three workflows support `workflow_dispatch`.

## Step 1: TRIGGER the workflows FIRST

**IMPORTANT: Do NOT use `actions_list` to look for existing runs. Always trigger new runs.**

Use `actions_run_trigger` to dispatch each workflow on the current branch. When verifying a code change, trigger **all three** workflows:

```
actions_run_trigger({ method: "trigger_workflow", owner: "<owner>", repo: "em", workflow_id: "test.yml", ref: "<current-branch>" })
actions_run_trigger({ method: "trigger_workflow", owner: "<owner>", repo: "em", workflow_id: "lint.yml", ref: "<current-branch>" })
actions_run_trigger({ method: "trigger_workflow", owner: "<owner>", repo: "em", workflow_id: "puppeteer.yml", ref: "<current-branch>" })
```

## Step 2: Wait, then poll for results

After triggering, wait 10 seconds, then use `actions_list` to list workflow runs filtered by the current branch. Poll until all runs reach a terminal status (`completed`, `failure`, `cancelled`).

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
