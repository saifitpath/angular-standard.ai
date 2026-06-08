---
name: requirement-taker
description: Parses ticket details into a scoped change plan. Use when invoked as @requirement-taker.skill with ticket details. Creates changes_required.md and questions.md when requirements are unclear.
disable-model-invocation: true
---

# Requirement Taker

## Invocation

```
@requirement-taker.skill + <ticket details>
```

## Prerequisites

Read `.agents/structure.md` in full before any other action.

## Workflow

1. **Read `structure.md`** — understand project structure, naming rules, scope limits, and prohibited changes.
2. **Read ticket details** — accept only what is explicitly stated in the ticket. Do not infer missing requirements.
3. **Create `.agents/changes_required.md`** with:
   - Ticket reference (ID, title, source)
   - Problem statement (verbatim from ticket where possible)
   - Acceptance criteria (numbered, testable)
   - In-scope files/folders (explicit list)
   - Out-of-scope areas (explicit list)
   - Required changes (exact description of what must change)
   - Open decisions (empty if none)
4. **If anything is unclear** — create `.agents/questions.md`:
   - One section per ambiguity
   - State what is unknown and why it blocks progress
   - List concrete options only if the ticket provides them; otherwise ask
   - **Stop.** Do not continue to `@manger.skill` or any downstream skill until answers are provided and recorded in `changes_required.md`.
5. **Do not write code.** Do not modify any file outside `.agents/changes_required.md` and `.agents/questions.md`.

## `changes_required.md` Template

```markdown
# Changes Required

## Ticket
- **ID:**
- **Title:**
- **Source:**

## Problem Statement

## Acceptance Criteria
1.

## In Scope
-

## Out of Scope
-

## Required Changes

### Change 1
- **What:**
- **Where:**
- **Why:**

## Open Decisions

## Tasks
<!-- Populated by @manger.skill -->

## Architecture Restrictions
<!-- Populated by @architect.skill -->

## QA Notes
<!-- Populated by @qa.skill -->

## Task Status
<!-- Populated by @developer.skill -->
```

## `questions.md` Template

```markdown
# Open Questions

> Work is blocked until all questions below are answered.
> Answers must be recorded in `changes_required.md` before proceeding.

## Question 1
- **Context:**
- **What is unclear:**
- **Blocking:**
- **Answer:** _(pending)_
```

## Rules

- Do not assume anything.
- Do not add features not mentioned in the ticket.
- Do not install packages.
- Do not rename folders.
- Every decision belongs in `changes_required.md` or `questions.md` — not in chat only.
- When answers arrive, update `changes_required.md`, remove or resolve items in `questions.md`, then hand off to `@manger.skill`.

## Handoff

When `changes_required.md` is complete and no open questions remain:

```
@manger.skill + @changes_required.md
```
