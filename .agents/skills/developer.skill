---
name: developer
description: Implements scoped tasks from changes_required.md one by one. Use when invoked as @developer.skill with changes_required.md. Marks tasks done and follows structure.md and angular-developer standards.
disable-model-invocation: true
---

# Developer

## Invocation

```
@developer.skill + @changes_required.md
```

## Prerequisites

1. Read `.agents/structure.md` in full.
2. Read `.agents/changes_required.md` (tasks, architecture restrictions, in/out of scope).
3. Read `.agents/skills/angular-developer/SKILL.md` for Angular coding standards.
4. If `.agents/questions.md` has unresolved items — **stop**.

## Workflow

1. **Work only on listed tasks** — process in dependency order (`Depends on` field).
2. **Complete tasks one by one:**
   - Implement only what the task describes
   - Respect `## Architecture Restrictions` and `## In Scope` / `## Out of Scope`
   - Check `frontend/src/app/shared/ui/` for existing `cp-*` components before creating UI
   - For API/business logic, reference old portal at `D:\Cedar Repo\Old version\ConsumerPortal\client\`
   - For visual changes, use Figma MCP before pixel decisions
3. **After each task**, update `changes_required.md`:

```markdown
## Task Status

| Task | Status | Notes |
|------|--------|-------|
| T1   | done   |       |
| T2   | pending|       |
```

Also set the individual task `**Status:**` to `done` in the `## Tasks` section.

4. **Do not change anything outside scope** — no drive-by refactors, no unrelated file edits, no package installs without explicit approval in `changes_required.md`.
5. When all tasks are `done`, hand off to QA:

```
@qa.skill + @changes_required.md
```

## Implementation Checklist (per task)

- [ ] Standalone component with `OnPush`
- [ ] Signals for state; `@if` / `@for` / `@switch` in templates
- [ ] `cp-*` components for UI; no direct PrimeNG in features/layout
- [ ] HTTP via `ApiService` only; typed models in `core/api/models/`
- [ ] i18n keys for user-visible strings
- [ ] No card PAN/CVV/expiry stored anywhere
- [ ] Files touched are within task `Files` and `## In Scope`

## Rules

- Do not assume anything not in `changes_required.md`.
- Do not rename folders.
- Do not create extra files unless a task requires them.
- Do not install packages unless explicitly required and approved.
- If blocked mid-task, document in `changes_required.md` and create/update `.agents/questions.md`. Stop.

## Re-invocation

`@qa.skill` may call this skill again to fix issues. On re-invocation:

1. Read updated `changes_required.md` (QA notes, failed checks).
2. Fix only the listed issues.
3. Mark remedial work in `## Task Status` notes.
4. Return to `@qa.skill`.
