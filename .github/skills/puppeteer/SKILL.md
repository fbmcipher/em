---
name: puppeteer
description: Run Puppeteer e2e tests locally using Docker. Use this skill when you need to verify that Puppeteer tests pass before pushing or requesting review.
allowed-tools:
  - bash
---

# Run Puppeteer Tests

Run the full Puppeteer e2e test suite locally. Docker is available in your environment.

## Command

```bash
GITHUB_ACTIONS="" yarn test:puppeteer
```

Unsetting `GITHUB_ACTIONS` makes the test script automatically:
1. Pull and start the `browserless/chrome` Docker container on port 7566
2. Start the Vite dev server with HTTPS on port 2552
3. Run all Puppeteer e2e tests
4. Clean up containers and servers on exit

## When to use

- After making changes that affect the UI, run this before pushing to verify Puppeteer tests pass.
- After fixing a Puppeteer test failure, run this to confirm the fix works.

## Notes

- The first run may take a few minutes to pull Docker images. Subsequent runs are faster.
- One test (`gestures.ts > chaining commands > chained command`) is known to be flaky. If only that test fails, it is not related to your changes.
- Do NOT run `yarn test:puppeteer` without unsetting `GITHUB_ACTIONS` -- the script will skip Docker and server setup and tests will fail.
