#!/usr/bin/env bash

# Excluding scripts/ excludes this gate itself, so a change to it no longer
# triggers the deploy that would exercise it. Accepted rather than overlooked:
# D-260904b kept this gate out of the shared classifier because it cannot be
# exercised before a real deploy either way.
readonly DEPLOYMENT_EXCLUSIONS=(
  .
  ':(exclude)*.md'
  ':(exclude).claude'
  ':(exclude).env.test'
  ':(exclude).github'
  ':(exclude).husky'
  ':(exclude).prettier*'
  ':(exclude).worktreeinclude'
  ':(exclude)codecov.yml'
  ':(exclude)docs'
  ':(exclude)e2e'
  ':(exclude)eslint.config.mjs'
  ':(exclude)jest.*'
  ':(exclude)playwright*.config.ts'
  ':(exclude)scripts'
)

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
