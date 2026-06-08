---
name: architect
description: Reviews planned changes against existing architecture and adds restrictions to changes_required.md. Use when invoked as @architect.skill with changes_required.md.
disable-model-invocation: true
---

# Architect

## Invocation

```
@architect.skill + @changes_required.md
```

## Prerequisites

1. Read `.agents/structure.md` in full.
2. Read `.agents/changes_required.md` (including tasks from `@manger.skill`).
3. If `.agents/questions.md` has unresolved items — **stop**.

## Workflow

1. **Read `structure.md`** — confirm folder boundaries, naming rules, and prohibited changes.
2. **Review planned changes** — for each task, verify:
   - Correct target folder (`core/`, `features/`, `layout/`, `shared/ui/`, etc.)
   - No NgModules, no Default change detection, no legacy structural directives
   - HTTP goes through `ApiService`; models in `core/api/models/`
   - UI uses existing `cp-*` components before creating new ones
   - PrimeNG stays inside `shared/ui/` wrappers only
   - Routes remain lazy-loaded with correct guards
   - i18n, branding, and security rules are respected
3. **Ensure the plan follows existing architecture** — align with `docs/PROJECT_RULES.md` and `.agents/skills/angular-developer/SKILL.md`.
4. **Ensure no unrelated feature is disturbed** — flag any task that touches files outside `## In Scope`.
5. **Update `changes_required.md`** — add or refine `## Architecture Restrictions`:

```markdown
## Architecture Restrictions

### Per-task restrictions
- **T1:** <restriction>
- **T2:** <restriction>

### Global restrictions
- <restriction applying to all tasks>

### Files that must NOT be modified
- <path>

### Patterns to use
- <pattern reference, e.g. existing component to mirror>

### API / business logic reference
- Old portal path if applicable
- Figma node if visual change
```

6. If the plan violates architecture and cannot be fixed without a product decision, add to `## Open Decisions` and `.agents/questions.md`. **Stop.**

## Rules

- Do not write application code.
- Do not modify files outside `.agents/changes_required.md` (and `.agents/questions.md` if blocked).
- Do not broaden scope to "improve" adjacent code.
- Visual changes must note Figma MCP as source of truth.
- API/business logic changes must note old portal reference path.

## Handoff

When architecture review is complete and no open questions remain:

```
@developer.skill + @changes_required.md
```
