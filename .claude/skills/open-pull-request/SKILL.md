---
name: open-pull-request
description: How to open a pull request in this repository — the two-question human checklist every PR body must start with, and why the body is written to a file and passed with `gh pr create --body-file` rather than inline. Use when opening a pull request, writing a PR description, or asked to push work up for review.
---

# Opening a pull request

**Start every pull request body with the human checklist**, before any explanation. It lives in [`.github/pull_request_template.md`](../../../.github/pull_request_template.md) — read that file and copy the `### Before merging` block into the body verbatim, leaving both questions unanswered for the human to tick.

**The template is the only copy, and that is deliberate.** GitHub applies it automatically to a pull request raised through the web interface or by `gh pr create` without a body, which is the path a human takes. `--body-file` bypasses templates entirely, which is the path this skill takes — so the same text has to be written into the body by hand. Restating it here as well would give the checklist two homes and one of them would drift.

Two questions, deliberately. The long list is the [release checklist](../../../docs/release-checklist.md), and it is worked through before the pull request is opened rather than read at merge time — a checklist nobody reads is worse than none. These two are here because they are the ones an agent **cannot** answer: the first is knowable only by whoever clicked around in a web console, and the second needs eyes on a running site.

**Each question offers two boxes rather than one, because an unticked box says nothing.** A single `- [ ]` left empty is indistinguishable from a question nobody read, which is the failure mode a checklist exists to prevent. Two boxes force a positive answer either way: nothing changed, or something did and it is written down. An agent opening the pull request leaves all four unticked, because neither question is its to answer.

The first question exists because that is the gap that actually bit — see the settings bullet under [Documentation discipline](../../../AGENTS.md#documentation-discipline).

The checklist costs nothing at merge time, because `squash_merge_commit_message` is `COMMIT_MESSAGES` — the squash commit is built from commit messages, so it never reaches the history.

**Write the body to a file and pass `--body-file`, never `--body "…"` or a heredoc.** The shell-hygiene hook tests the whole command string, so a semicolon anywhere in the prose refuses the command — and bodies this project asks for are long enough that one usually appears. See [Shell hygiene](../../../AGENTS.md#shell-hygiene).
