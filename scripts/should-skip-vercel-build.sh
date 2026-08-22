#!/usr/bin/env bash

readonly DEPLOYMENT_EXCLUSIONS=(
  .
  ':(exclude)docs'
  ':(exclude)*.md'
  ':(exclude).claude'
  ':(exclude).worktreeinclude'
  ':(exclude)e2e'
  ':(exclude)playwright.config.ts'
)

# Vercel treats every non-zero result as a build, but keep that contract explicit.
compare_deployment_changes() {
  git diff --quiet "$@"
  local status=$?

  if ((status > 1)); then
    exit 1
  fi

  exit "$status"
}

if [[ "$VERCEL_ENV" == "production" ]]; then
  compare_deployment_changes HEAD^ HEAD -- "${DEPLOYMENT_EXCLUSIONS[@]}"
elif [[ -n "$VERCEL_GIT_PREVIOUS_SHA" ]]; then
  compare_deployment_changes "$VERCEL_GIT_PREVIOUS_SHA" HEAD -- "${DEPLOYMENT_EXCLUSIONS[@]}"
else
  exit 1
fi
