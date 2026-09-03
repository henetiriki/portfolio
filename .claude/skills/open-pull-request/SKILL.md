---
name: open-pull-request
description: How to open a pull request in this repository — the two-item human checklist every PR body must start with, and why the body is written to a file and passed with `gh pr create --body-file` rather than inline. Use when opening a pull request, writing a PR description, or asked to push work up for review.
---

# Opening a pull request

**Start every pull request body with the human checklist**, before any explanation:

```markdown
### Before merging

- [ ] Nothing changed outside git for this work — ruleset, Codecov, Vercel, repository settings — or if something did, it is recorded in the docs in this PR
- [ ] Manual QA on the **preview URL**, not localhost
```

Two items, deliberately. The long list is the [release checklist](../../../docs/release-checklist.md), and it is worked through before the pull request is opened rather than read at merge time — a checklist nobody reads is worse than none. These two are here because they are the ones an agent **cannot** answer: the first is knowable only by whoever clicked around in a web console, and the second needs eyes on a running site.

The first item exists because that is the gap that actually bit — see the settings bullet under [Documentation discipline](../../../AGENTS.md#documentation-discipline).

A `.github/pull_request_template.md` would not help: `gh pr create --body-file` bypasses templates entirely, so the section has to be written into the body. It costs nothing at merge time either, because `squash_merge_commit_message` is `COMMIT_MESSAGES` — the squash commit is built from commit messages, so the checklist never reaches the history.

**Write the body to a file and pass `--body-file`, never `--body "…"` or a heredoc.** The shell-hygiene hook tests the whole command string, so a semicolon anywhere in the prose refuses the command — and bodies this project asks for are long enough that one usually appears. See [Shell hygiene](../../../AGENTS.md#shell-hygiene).
