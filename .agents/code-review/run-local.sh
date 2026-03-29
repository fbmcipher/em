#!/usr/bin/env bash
set -euo pipefail

# Usage: ./run-local.sh [model] [pr-number]
# Example: ./run-local.sh anthropic/claude-sonnet-4 1
# Example: ./run-local.sh google/gemini-2.5-pro 1

MODEL="${1:-anthropic/claude-opus-4.6}"
PR_NUMBER="${2:-1}"

# Load secrets
[[ -f ~/.secrets ]] && source ~/.secrets
export GITHUB_TOKEN="${GITHUB_TOKEN:-$(gh auth token 2>/dev/null)}"
: "${OPENROUTER_API_KEY:?Set OPENROUTER_API_KEY in ~/.secrets}"
: "${GITHUB_TOKEN:?Set GITHUB_TOKEN in ~/.secrets or log in with gh auth}"

export LLM__PROVIDER=OPENROUTER
export LLM__META__MODEL="$MODEL"
export LLM__META__MAX_TOKENS=15000
export LLM__META__TEMPERATURE=0.3
export LLM__HTTP_CLIENT__API_URL=https://openrouter.ai/api/v1
export LLM__HTTP_CLIENT__API_TOKEN="$OPENROUTER_API_KEY"

export VCS__PROVIDER=GITHUB
export VCS__PIPELINE__OWNER=fbmcipher
export VCS__PIPELINE__REPO=em
export VCS__PIPELINE__PULL_NUMBER="$PR_NUMBER"
export VCS__HTTP_CLIENT__API_URL=https://api.github.com
export VCS__HTTP_CLIENT__API_TOKEN="$GITHUB_TOKEN"

export REVIEW__DRY_RUN=true
export ARTIFACTS__LLM_ENABLED=true
export ARTIFACTS__LLM_DIR="artifacts/${MODEL//\//_}_pr${PR_NUMBER}"

echo "Model:      $MODEL"
echo "PR:         fbmcipher/em#$PR_NUMBER"
echo "Artifacts:  $ARTIFACTS__LLM_DIR"
echo "---"

ai-review run-inline
