# Angular Company Standards

> Single source of truth for Angular application development across all company projects.
> Last updated: 2026-06-09.

## Mandatory Patterns

### Components

- **Standalone components only** — never create or import NgModules for feature UI.
- **`ChangeDetectionStrategy.OnPush`** on every component.
- Use **`inject()`** for dependency injection instead of constructor injection when possible.
- Use modern control flow: `@if`, `@for`, `@switch` — never `*ngIf`, `*ngFor`, or `[ngSwitch]`.
- Component selectors use the project prefix (e.g. `cp-kebab-case`).

### State Management

- **Signals** are the preferred mechanism for component state: `signal()`, `computed()`, `input()`, `output()`, `model()`.
- Use **`toSignal()`** when bridging RxJS observables into templates or signal-based components.
- **Never** use `.subscribe()` inside component classes — delegate subscription logic to services or use `toSignal()` / `async` pipe in templates.
- **Never** use `BehaviorSubject`, `Subject`, or `ReplaySubject` for component-local state.
- Expose readonly signals from services via `.asReadonly()`.

### Data Access

- **No direct HTTP calls in components** — all API access goes through dedicated services in `shared/data-access` or feature-level data-access layers.
- Never import `HttpClient` directly in component files under `features/`.
- Typed request/response models live alongside their data-access services.

### TypeScript

- **Strict TypeScript** — no `any` without documented justification in a code comment.
- Prefer `readonly` for injected dependencies and signal declarations.

### Performance

- Lazy-load feature routes with `loadComponent()` or `loadChildren()`.
- Prefer zoneless change detection (`provideZonelessChangeDetection()`) where supported.
- Use `@for` with a required `track` expression for list rendering.

## Prohibited Patterns

| Pattern | Reason |
|---------|--------|
| NgModules for UI | Standalone is mandatory |
| `.subscribe()` in components | Leaks subscriptions; use signals or services |
| `BehaviorSubject` / `Subject` in components | Use `signal()` instead |
| Raw `HttpClient` in components | Violates separation of concerns |
| `*ngIf`, `*ngFor`, `[ngSwitch]` | Legacy syntax; use built-in control flow |
| Default change detection | Always use `OnPush` |

## Validation Gate

Before merging any Angular PR, ensure:

```bash
npm run typecheck   # zero TypeScript errors
npm run lint        # zero ESLint errors
npm run build:prod  # production build succeeds
```

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Component files | `kebab-case.component.ts` | `payment-dialog.component.ts` |
| Service files | `kebab-case.service.ts` | `accounts-api.service.ts` |
| Signal variables | `camelCase` | `readonly isLoading = signal(false)` |
| Git branches | `feature/`, `fix/`, `chore/` + description | `feature/quick-pay-screen` |
| Commits | `<type>(<scope>): <description>` | `feat(payments): add allocation dialog` |
