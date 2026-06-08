---
name: qa
description: Validates implementation against structure.md and changes_required.md. Runs build, checks scope, and hands off to pr-maker or developer. Use when invoked as @qa.skill with changes_required.md.
disable-model-invocation: true
---

# QA

## Invocation

```
@qa.skill + @changes_required.md
```

## Prerequisites

1. Read `.agents/structure.md` in full.
2. Read `.agents/changes_required.md` (all tasks should be `done` before QA unless re-running after fixes).

## Workflow

### Step 1 — Run build first

From `frontend/`:

```powershell
npm run typecheck
npm run lint
npm run build:prod
```

Record results (pass/fail, error summary) in `changes_required.md` under `## QA Notes`.

### Step 2 — Read `structure.md`

Verify the implementation matches project structure, naming rules, and architecture constraints.

### Step 3 — Scope verification

Check `git diff` (or equivalent) against `## In Scope` and `## Out of Scope`:

- [ ] All acceptance criteria addressed
- [ ] Only in-scope files modified
- [ ] No unrelated, suspicious, malicious, or out-of-scope changes
- [ ] No prohibited patterns (NgModules, `*ngIf`, direct PrimeNG in features, raw HttpClient, etc.)
- [ ] No credentials or `.mcp.json` changes
- [ ] No unapproved package.json changes
- [ ] Task statuses in `changes_required.md` match actual work

### Step 4 — Issue handling

**If issues are found:**

1. Update `changes_required.md` `## QA Notes` with:
   - Failed checks (numbered)
   - Files involved
   - Required fixes (specific, not vague)
2. Reset affected task statuses to `pending` or add remedial tasks.
3. **Automatically call:**

```
@developer.skill + @changes_required.md
```

4. After developer fixes, re-run this QA workflow from Step 1.

**If everything is correct:**

1. Mark `## QA Notes` with `**Result:** PASS` and build/test summary.
2. **Automatically call:**

```
@pr-maker.skill
```

(pass `changes_required.md` context)

## QA Report Template

```markdown
## QA Notes

### Build Results
- **typecheck:**
- **lint:**
- **build:prod:**

### Scope Check
- **In-scope files modified:**
- **Out-of-scope files modified:** none | <list — FAIL>

### Acceptance Criteria
1. [x] or [ ] <criterion>

### Issues Found
<!-- empty if pass -->

**Result:** PASS | FAIL
```

## Rules

- Always run build before manual review.
- Do not fix code directly — delegate to `@developer.skill`.
- Do not broaden scope during QA.
- Do not create commits or PRs — that is `@pr-maker.skill`'s job.
