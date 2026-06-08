---
name: pr-maker
description: Creates final PR summary from changes_required.md after QA pass. Auto-invoked by qa.skill. Writes pr-summary.md with tasks, files, build results, and risks.
disable-model-invocation: true
---

# PR Maker

## Invocation

Auto-called by `@qa.skill` when QA result is **PASS**.

Manual invocation (only after QA pass):

```
@pr-maker.skill + @changes_required.md
```

## Prerequisites

1. Read `.agents/structure.md` in full.
2. Read `.agents/changes_required.md` — confirm `## QA Notes` shows **Result: PASS**.
3. If QA has not passed — **stop**. Return to `@qa.skill`.

## Workflow

1. **Gather facts** (no assumptions):
   - Ticket info from `changes_required.md`
   - Completed tasks from `## Task Status`
   - Files changed (`git diff --name-only` against base branch, typically `main`)
   - Build/test results from `## QA Notes`
   - Architecture restrictions that were applied
2. **Create `.agents/pr-summary.md`** using the template below.
3. **Do not create the PR automatically** unless the user explicitly requests it. Deliver the summary for human review.
4. **Do not modify application code** or `changes_required.md`.

## PR Summary Template

```markdown
# PR Summary

## Ticket
- **ID:**
- **Title:**

## Overview

## Completed Tasks
| Task | Description | Status |
|------|-------------|--------|
| T1   |             | done   |

## Files Changed
-

## Build / Test Results
- **typecheck:**
- **lint:**
- **build:prod:**

## Acceptance Criteria Verification
1. [x]

## Architecture Compliance
- Standalone / OnPush / Signals: verified
- cp-* design system used: verified
- Scope respected: verified

## Risks & Notes

## Suggested PR Title

## Suggested PR Body

### Summary
-

### Test plan
- [ ]
```

## Suggested PR Body Rules

Follow `docs/PROJECT_RULES.md` Git conventions:

- Branch: `feature/`, `fix/`, `chore/`, or `docs/` + description
- Commit: `<type>(<scope>): <description>`
- PR targets `main`

## Rules

- Include only completed work — no planned-but-undone tasks.
- Flag any residual risks honestly (e.g. browser QA pending, Google Pay compatibility).
- Do not install packages.
- Do not modify unrelated files.
- Do not force-push to `main`.
