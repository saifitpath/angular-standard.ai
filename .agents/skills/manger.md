---
name: manger
description: Breaks scoped requirements into small tasks with an overview. Use when invoked as @manger.skill with changes_required.md. Does not add assumptions.
disable-model-invocation: true
---

# Manager

## Invocation

```
@manger.skill + @changes_required.md
```

## Prerequisites

1. Read `.agents/structure.md` in full.
2. Read `.agents/changes_required.md`.
3. If `.agents/questions.md` exists with unresolved items — **stop** and request answers. Do not proceed.

## Workflow

1. **Re-check the requirement** — compare `changes_required.md` against the original ticket details. Flag mismatches in `changes_required.md` under a `## Requirement Review` section; do not silently fix them.
2. **Update `changes_required.md`** — add or refine:
   - `## Overview` — one short paragraph summarizing the work (facts only, no assumptions)
   - `## Tasks` — numbered, small, independently completable items
3. **Break work into small tasks.** Each task must include:
   - Task ID (e.g. `T1`, `T2`)
   - Description (specific action)
   - Target file(s) or folder(s)
   - Depends on (task IDs or `none`)
   - Status: `pending`
4. **Do not add assumptions.** If a task requires a decision not in the ticket or `changes_required.md`, add it to `## Open Decisions` and create or update `.agents/questions.md`. Stop until resolved.
5. **Do not write code.** Do not modify any file except `.agents/changes_required.md` (and `.agents/questions.md` if blocked).

## Task Format

```markdown
## Tasks

### T1 — <short title>
- **Description:**
- **Files:**
- **Depends on:** none
- **Status:** pending
```

## Rules

- Tasks must map 1:1 to acceptance criteria where possible.
- Each task should be completable in one focused edit session.
- Do not create tasks for unrelated refactors, dependency upgrades, or folder renames.
- Do not install packages unless the ticket explicitly requires it (then flag for user approval in `Open Decisions`).
- Prefer existing project structure over generic Angular patterns.

## Handoff

When tasks are defined and no open questions remain:

```
@architect.skill + @changes_required.md
```
