# Angular Code Review Checklist

> Use this checklist when reviewing Angular pull requests via the `review_angular_pr` MCP tool or manual review.

## Architecture

- [ ] Components are standalone (`standalone: true` or implicit standalone).
- [ ] `ChangeDetectionStrategy.OnPush` is set on every component.
- [ ] Feature code lives under `src/app/features/<feature>/`.
- [ ] Shared UI lives under `src/app/shared/ui/`.
- [ ] API services live under `shared/data-access/` or feature `data-access/`.
- [ ] No NgModules introduced.
- [ ] Routes are lazy-loaded.

## Signals & Reactivity

- [ ] Component state uses `signal()`, `computed()`, `input()`, `output()`.
- [ ] No `.subscribe()` in component classes.
- [ ] No `BehaviorSubject` / `Subject` for component state.
- [ ] Observables bridged with `toSignal()` at component boundary.
- [ ] `@for` blocks include a `track` expression.

## Data Access

- [ ] No `HttpClient` imports in component files.
- [ ] No raw `fetch()` calls in components.
- [ ] API logic encapsulated in injectable services.
- [ ] Request/response types are explicitly defined.

## Maintainability

- [ ] No unjustified `any` types.
- [ ] Dependencies injected via `inject()` function.
- [ ] Components are focused — single responsibility.
- [ ] Templates use modern control flow (`@if`, `@for`, `@switch`).
- [ ] No dead code or commented-out blocks.
- [ ] File naming follows kebab-case conventions.

## Performance

- [ ] OnPush change detection on all components.
- [ ] Lists use `@for` with `track` (not index tracking on mutable lists).
- [ ] Heavy computations wrapped in `computed()` (not template methods).
- [ ] No unnecessary re-renders from mutable object references in signals.
- [ ] Feature routes lazy-loaded.

## Accessibility & i18n

- [ ] User-visible strings use i18n keys (not hardcoded English).
- [ ] Interactive elements are keyboard accessible.
- [ ] Images have meaningful `alt` text.
- [ ] ARIA attributes used where semantic HTML is insufficient.

## Review Output Format

When reviewing, categorize findings as:

| Category | Severity | Example |
|----------|----------|---------|
| Architecture | Error | Component outside `features/` folder |
| Signal violation | Error | `.subscribe()` in component |
| Folder structure | Error | File in `src/app/components/` |
| Maintainability | Warning | Method called in template for filtering |
| Performance | Warning | Missing `track` in `@for` |

Errors block merge. Warnings should be addressed or documented with justification.
