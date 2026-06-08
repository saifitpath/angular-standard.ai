# Consumer Portal — Agent Structure Reference

> **Every agent skill MUST read this file before doing any work.**
> Last updated: 2026-06-09.

---

## 1. Repository Layout

```
Consumer-Portal/
├── CLAUDE.md                          ← session quick-start checklist
├── docs/
│   └── PROJECT_RULES.md               ← architecture, security, a11y, API rules (authoritative)
├── .agents/
│   ├── structure.md                   ← this file — workflow + structure reference
│   └── skills/
│       ├── angular-developer/         ← Angular coding standards (SKILL.md + references/)
│       ├── requirement-taker.skill
│       ├── manger.skill
│       ├── architect.skill
│       ├── developer.skill
│       ├── qa.skill
│       └── pr-maker.skill
├── frontend/                          ← Angular 22 application (all UI work happens here)
│   └── src/
│       ├── app/
│       ├── assets/
│       └── environments/
└── backend/                           ← separate concern; do not modify unless explicitly scoped
```

All Angular application code lives under `frontend/`. Commands run from `frontend/`.

---

## 2. Core Folders (`frontend/src/app/`)

| Folder | Purpose | Modify when |
|--------|---------|-------------|
| `core/` | API layer, auth, branding, config, guards, interceptors, i18n, shared services | Adding/changing services, guards, interceptors, typed models |
| `features/` | Lazy-loaded feature pages (16 features) | Feature-specific UI, routes, feature services |
| `layout/` | Shell layouts (public, secure), header, footer, sidebar, breadcrumb | Layout or navigation shell changes |
| `shared/ui/` | `cp-*` design system components (26 components) | New or updated reusable UI primitives |
| `shared/pipes/` | Shared pipes (e.g. `translate`) | Shared template utilities |
| `shared/payments/` | Apple Pay, Google Pay wrappers | Payment widget integration |
| `accessibility/` | Skip link, focus management | A11y infrastructure |
| `security/` | Security-related app code | Security-scoped changes only |

### Feature modules (`features/`)

`accounts`, `ai-assistant`, `auth`, `dashboard`, `disputes`, `documents`, `live-chat`, `not-found`, `notifications`, `payment-plans`, `payments`, `profile`, `settings`, `settlement-offers`

### Core subfolders (`core/`)

| Subfolder | Contents |
|-----------|----------|
| `api/models/` | Typed request/response interfaces |
| `api/` | `api-routes.constants.ts` |
| `auth/guards/` | `guest.guard`, auth guards |
| `auth/services/` | `AuthService`, `TokenService` |
| `branding/` | `BrandingService`, branding models |
| `config/` | `RuntimeConfigService`, `AppConfig`, enums, constants |
| `guards/` | `feature-flag.guard` |
| `interceptors/` | `auth.interceptor`, `error.interceptor` |
| `i18n/` | `I18nService`, language models |
| `services/` | `ApiService`, `ErrorHandlerService`, `LoggerService`, `StorageService` |

### Layout subfolders (`layout/`)

`breadcrumb`, `feedback`, `footer`, `header`, `public-layout`, `secure-layout`, `sidebar`

### Design system (`shared/ui/` — `cp-*` components)

`accordion`, `alert`, `avatar`, `badge`, `button`, `card`, `chart`, `checkbox`, `date-picker`, `dialog`, `dropdown`, `file-upload`, `input`, `language-switcher`, `loader`, `pagination`, `radio`, `slider`, `table`, `tabs`, `terms-modal`, `textarea`, `toast`, `toggle`, `tooltip`

---

## 3. Naming Rules

| Type | Convention | Example |
|------|-----------|---------|
| Component files | `kebab-case.component.ts` | `payment-allocation-dialog.component.ts` |
| Component selectors | `cp-kebab-case` | `cp-payment-allocation-dialog` |
| Service files | `kebab-case.service.ts` | `branding.service.ts` |
| Signal variables | `camelCase` | `readonly isLoading = signal(false)` |
| SCSS classes | BEM with feature prefix | `.pa-overlay`, `.pa-dialog__header` |
| Git branches | `feature/`, `fix/`, `chore/`, `docs/` + description | `feature/quick-pay-screen` |
| Commits | `<type>(<scope>): <description>` | `feat(payments): add allocation dialog` |

---

## 4. Architecture Rules (from `docs/PROJECT_RULES.md`)

### Mandatory

- **Standalone components only** — no NgModules
- **`ChangeDetectionStrategy.OnPush`** on every component
- **Signals** for component state: `signal()`, `computed()`, `input()`, `output()`, `model()`, `toSignal()`
- **Control flow**: `@if`, `@for`, `@switch` — never `*ngIf`, `*ngFor`, `[ngSwitch]`
- **Strict TypeScript** — no `any` without documented justification
- **Zoneless** — `provideZonelessChangeDetection()`; do not add `zone.js`
- **Lazy-loaded feature routes** — `loadComponent()` or `loadChildren()`
- **All HTTP via `ApiService`** — `javaGet`/`javaPost`/`dotnetGet`/`dotnetPost`; never raw `HttpClient` in features
- **All feature UI via `cp-*` components** — check `shared/ui/` before creating new UI
- **PrimeNG only inside `shared/ui/` wrappers** — never in `features/` or `layout/`
- **i18n keys** for all user-visible strings — no hardcoded English in production templates
- **Branding via `BrandingService`** — no hardcoded Cedar Financial branding
- **WCAG 2.2 AA** — keyboard access, ARIA, contrast, focus management

### Source-of-truth hierarchy

1. **Figma MCP** — visual/layout decisions
2. **Old portal** (`D:\Cedar Repo\Old version\ConsumerPortal\client\`) — API calls, business rules, field names
3. **`docs/PROJECT_RULES.md`** — architecture, security, accessibility, workflow
4. **`CLAUDE.md`** — session quick reference

### Validation gate (run from `frontend/`)

```powershell
npm run typecheck      # zero TypeScript errors
npm run lint           # zero ESLint errors (warnings OK)
npm run build:prod     # production build must succeed
```

---

## 5. Angular Standards (from `.agents/skills/angular-developer/`)

Use `.agents/skills/angular-developer/SKILL.md` and its `references/` folder **only** for Angular coding guidance. Key points:

- Analyze Angular version (22) before generating code
- Prefer **signal forms** for new forms (Angular 21+)
- Use `inject()` for dependency injection
- Run `ng build` (or `npm run build:prod`) after code changes
- Consult reference docs for: components, signals, forms, DI, routing, styling, testing, CLI

**Developer skill delegation:** When implementing Angular code, follow `developer.skill` tasks and apply `angular-developer` standards for code quality.

---

## 6. What Must NOT Be Changed

Unless **explicitly listed** in `changes_required.md` for the current ticket:

| Area | Rule |
|------|------|
| Folder structure | Do not rename, move, or reorganize folders |
| `backend/` | Do not modify |
| `app.config.ts` router config | Do not change `paramsInheritanceStrategy` without explicit approval |
| `package.json` / dependencies | Do not install or upgrade packages without explicit approval |
| `.mcp.json`, `.env`, credentials | Never commit or modify for tickets |
| Unrelated features | Do not touch files outside the scoped feature/folders |
| PrimeNG in features/layout | Never add direct PrimeNG imports |
| NgModules, zone.js, `*ngIf`/`*ngFor` | Never introduce prohibited patterns |
| Git config | Never modify |
| Force-push to `main` | Never |

---

## 7. Scope-Control Rules

### General

1. **Do not assume anything.** If requirements are ambiguous, create `.agents/questions.md` and stop.
2. **Do not perform actions outside the requested scope.**
3. **No skill may modify unrelated files.**
4. **Do not create extra files** unless required by the workflow (`changes_required.md`, `questions.md`, `pr-summary.md`).
5. **Do not refactor unrelated code.**
6. **Every decision must be written** into the relevant markdown file (`changes_required.md` or `questions.md`).
7. **All work must follow this file** (`structure.md`).

### Workflow artifacts (created per ticket, not pre-created)

| File | Created by | Purpose |
|------|-----------|---------|
| `.agents/changes_required.md` | `requirement-taker.skill` | Scoped change plan, tasks, architecture restrictions |
| `.agents/questions.md` | Any skill when blocked | Open questions; work stops until answered |
| `.agents/pr-summary.md` | `pr-maker.skill` | Final PR summary |

### Skill pipeline

```
@requirement-taker.skill + ticket
        ↓
  changes_required.md  (stop if questions.md exists)
        ↓
@manger.skill + changes_required.md
        ↓
@architect.skill + changes_required.md
        ↓
@developer.skill + changes_required.md
        ↓
@qa.skill + changes_required.md
        ↓ (on pass)
@pr-maker.skill (auto)
```

### Per-skill constraints

| Skill | May modify code? | May modify `changes_required.md`? |
|-------|------------------|-----------------------------------|
| `requirement-taker` | No | Yes (create) |
| `manger` | No | Yes (tasks, overview) |
| `architect` | No | Yes (architecture restrictions) |
| `developer` | Yes (scoped tasks only) | Yes (mark tasks done) |
| `qa` | No | Yes (issues found) |
| `pr-maker` | No | No (reads only; writes `pr-summary.md`) |

---

## 8. Key Paths Quick Reference

| Path | Purpose |
|------|---------|
| `frontend/src/app/shared/ui/` | `cp-*` design system — check first |
| `frontend/src/app/core/` | Services, interceptors, guards, models |
| `frontend/src/app/features/` | Lazy-loaded feature pages |
| `frontend/src/app/layout/` | Shell layouts |
| `D:\Cedar Repo\Old version\ConsumerPortal\client\` | Legacy portal — API & business logic |
| `docs/PROJECT_RULES.md` | Full project rules |
| `.agents/skills/angular-developer/` | Angular coding standards |
