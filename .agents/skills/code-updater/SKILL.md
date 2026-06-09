---

name: code-updater
description: Migrates old Consumer Portal Angular NgModule/RxJS code into the new Angular 22 standalone/signals Consumer Portal structure. Use when prompt contains @code-updater with old-version and new-version paths/links.
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Code Updater Skill

## Mandatory First Step

Before doing any work, read:

```txt
.agents/structure.md
docs/PROJECT_RULES.md
CLAUDE.md
.agents/changes_required.md
.agents/skills/angular-developer/SKILL.md
```

If `.agents/structure.md` is missing, stop and create:

```txt
.agents/questions.md
```

Do not continue.

## Trigger

Use this skill when user provides:

```txt
@code-updater @older-version-link <old path/link> @new-version-link <new path/link>
```

Example:

```txt
@code-updater
@older-version-link D:\Cedar Repo\Old version\ConsumerPortal\client\src\app\...
@new-version-link frontend\src\app\features\payments\...
```

## Purpose

Read the older Angular implementation and recreate the same feature in the new Consumer Portal Angular 22 app.

Preserve from old version:

* business logic
* API behavior
* field names
* validation rules
* UI design
* styles
* states
* loading behavior
* error handling
* empty states
* routing behavior
* user interactions
* permissions
* edge cases

But implement using new standards from:

```txt
.agents/structure.md
docs/PROJECT_RULES.md
.agents/skills/angular-developer/
```

## Absolute Rules

Never violate these:

* All Angular work must stay under `frontend/`.
* Commands must run from `frontend/`.
* Do not modify `backend/`.
* Do not modify files outside `.agents/changes_required.md` scope.
* Do not change `package.json` or dependencies unless explicitly approved.
* Do not modify `.mcp.json`, `.env`, credentials, or Git config.
* Do not introduce NgModules.
* Do not introduce `zone.js`.
* Do not use raw `HttpClient` in features.
* Do not import PrimeNG directly in `features/` or `layout/`.
* Do not use `*ngIf`, `*ngFor`, or `[ngSwitch]`.
* Do not use hardcoded English in production templates.
* Do not use hardcoded branding.
* Do not use `any` unless documented in the migration report.
* Do not create extra files except required implementation files and the migration report.
* Do not refactor unrelated code.

## Required New Angular Standards

New implementation must use:

* standalone components only
* `ChangeDetectionStrategy.OnPush`
* Angular Signals:

  * `signal()`
  * `computed()`
  * `input()`
  * `output()`
  * `model()`
  * `toSignal()`
* `inject()` for dependency injection
* Angular control flow:

  * `@if`
  * `@for`
  * `@switch`
* lazy-loaded routes using `loadComponent()` or `loadChildren()`
* all API calls through `ApiService`
* all user-visible strings through i18n keys
* `cp-*` shared UI components
* WCAG 2.2 AA accessibility rules

## Source Of Truth Priority

When behavior conflicts, use this priority:

1. Figma MCP for visual/layout decisions
2. Old portal for API calls, business rules, field names
3. `docs/PROJECT_RULES.md` for architecture/security/a11y/API rules
4. `.agents/structure.md` for workflow and folder scope
5. `CLAUDE.md` for quick-start checklist

## Required Workflow

### Step 1 — Confirm Scope

Read `.agents/changes_required.md`.

Only implement tasks listed there.

If the requested old/new paths are not included in scope, create or update:

```txt
.agents/questions.md
```

Then stop.

### Step 2 — Read Old Version

Read all relevant old files before coding:

* component `.ts`
* component `.html`
* component `.scss` / `.css`
* module file
* routing file
* services
* models/interfaces
* constants/enums
* pipes
* child components
* parent component integration
* API calls
* validation logic

Create an internal behavior inventory before implementation.

### Step 3 — Read New Version Structure

Read the new project structure from:

```txt
.agents/structure.md
```

Then inspect existing new project examples under:

```txt
frontend/src/app/features/
frontend/src/app/core/
frontend/src/app/shared/ui/
```

Use existing patterns before creating new ones.

### Step 4 — Map Old To New

Prepare mapping before code changes:

| Old Item              | New Location                       | Notes                      |
| --------------------- | ---------------------------------- | -------------------------- |
| NgModule component    | standalone component               | must use OnPush            |
| component API calls   | data/core service using ApiService | no raw HttpClient          |
| BehaviorSubject state | signal/computed                    | no component Subject state |
| *ngIf/*ngFor          | @if/@for                           | Angular 22 control flow    |
| PrimeNG direct usage  | cp-* shared UI wrapper             | no PrimeNG in features     |

### Step 5 — Implement

Implement only scoped changes.

Required conversions:

#### NgModule to standalone

Old:

```ts
@NgModule({
  declarations: [...]
})
```

New:

```ts
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...]
})
```

#### RxJS to Signals

Old component state:

```ts
loading$ = new BehaviorSubject(false);
data$ = this.service.getData();
this.service.getData().subscribe(...)
```

New component state:

```ts
readonly loading = signal(false);
readonly data = toSignal(this.service.getData(), { initialValue: null });
readonly vm = computed(() => ({ ... }));
```

Rules:

* No `.subscribe()` in components.
* No `Subject` or `BehaviorSubject` for UI state.
* RxJS may remain inside services only when appropriate.
* Use `toSignal()` for Observable consumption.

#### API calls

Old direct API/component API logic must move to:

```txt
frontend/src/app/core/
```

or the approved feature data-access location from `.agents/structure.md`.

Use existing `ApiService` methods:

```txt
javaGet
javaPost
dotnetGet
dotnetPost
```

Never use raw `HttpClient` in features.

#### UI

Use existing `cp-*` components from:

```txt
frontend/src/app/shared/ui/
```

Do not directly import PrimeNG in features/layout.

#### Templates

Convert:

```html
*ngIf
*ngFor
[ngSwitch]
```

to:

```html
@if
@for
@switch
```

Preserve all bindings, conditions, validation messages, empty states, and accessibility behavior.

## Required Migration Report

After implementation, create a migration report next to the new feature/component.

File name:

```txt
<component-name>.migration-report.md
```

Example:

```txt
payment-allocation-dialog.migration-report.md
```

The report must contain:

```md
# Migration Report: <Component Name>

## Source Links / Paths

Old version:
New version:

## Mandatory Files Read

- [ ] .agents/structure.md
- [ ] docs/PROJECT_RULES.md
- [ ] CLAUDE.md
- [ ] .agents/changes_required.md
- [ ] .agents/skills/angular-developer/SKILL.md

## Old Version Files Read

- [ ] component.ts
- [ ] component.html
- [ ] component.scss/css
- [ ] module.ts
- [ ] route file
- [ ] services
- [ ] models/interfaces
- [ ] constants/enums
- [ ] child components
- [ ] parent integration

## New Version Files Created / Updated

- path:

## Behavior Mapping

| Old Behavior | New Implementation | Status |
|---|---|---|
|  |  | Done / Partial / Not Implemented |

## State Mapping

| Old State | Old Type | New State | New Type | Status |
|---|---|---|---|---|
| loading$ | BehaviorSubject<boolean> | loading | Signal<boolean> | Done |

## API Mapping

| Old API Call | New ApiService Method | New Location | Status |
|---|---|---|---|
|  | javaGet/javaPost/dotnetGet/dotnetPost |  |  |

## Template Mapping

| Old Template Behavior | New Angular 22 Template | Status |
|---|---|---|
| *ngIf | @if | Done |
| *ngFor | @for | Done |

## Style Migration

Describe copied/adapted classes and visual parity.

## Accessibility Checks

- [ ] Keyboard accessible
- [ ] ARIA preserved/added
- [ ] Focus behavior preserved
- [ ] WCAG 2.2 AA considered

## Structure Compliance

Explain how files follow `.agents/structure.md`.

## Not Implemented / Differences

If everything is implemented:

All identified old-version behavior has been implemented.

Otherwise list gaps honestly.

## Validation Results

Run from `frontend/`:

- [ ] npm run typecheck
- [ ] npm run lint
- [ ] npm run build:prod

## Final Checklist

- [ ] Standalone component only
- [ ] OnPush used
- [ ] Signals used for component state
- [ ] No `.subscribe()` in components
- [ ] No component `BehaviorSubject`
- [ ] No component `Subject`
- [ ] No raw `HttpClient` in features
- [ ] No PrimeNG direct imports in features/layout
- [ ] Uses `cp-*` UI where applicable
- [ ] Uses i18n keys for user-visible text
- [ ] No hardcoded branding
- [ ] No unrelated files changed
```

## Required Final Response

Final answer must include:

* old files read
* new files created/updated
* migration report path
* validation commands run
* validation results
* incomplete items, if any

Never say “fully migrated” unless the migration report proves all old behavior was implemented.

## Stop Conditions

Stop and create `.agents/questions.md` if:

* `.agents/structure.md` is missing
* `.agents/changes_required.md` is missing
* old-version path/link is inaccessible
* new-version path/link is inaccessible
* requested work is outside ticket scope
* Figma/old portal/project rules conflict and cannot be resolved
* required API behavior is unclear
* implementation requires dependency/package changes
