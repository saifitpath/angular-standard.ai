# Angular Signals Standards

> Company policy for reactive state management using Angular Signals.

## Core Principles

1. **Signals first** — all component-local state must use `signal()`, `computed()`, or derived APIs.
2. **No RxJS in components** — observables belong in services; components consume via `toSignal()` or template `async` pipe.
3. **Readonly exposure** — services expose `.asReadonly()` versions of internal writable signals.

## Approved APIs

### Writable Signals

```typescript
import { signal } from '@angular/core';

readonly isLoading = signal(false);
readonly items = signal<Item[]>([]);

// Updates
this.isLoading.set(true);
this.items.update(current => [...current, newItem]);
```

### Computed Signals

```typescript
import { computed } from '@angular/core';

readonly filteredItems = computed(() =>
  this.items().filter(item => item.active)
);
```

### Component Inputs/Outputs

```typescript
import { input, output, model } from '@angular/core';

readonly title = input.required<string>();
readonly saved = output<void>();
readonly value = model<string>('');
```

### Bridging Observables

When a service returns an `Observable`, bridge it at the component boundary with `toSignal()`:

```typescript
import { toSignal } from '@angular/core/rxjs-interop';

private readonly accountsService = inject(AccountsApiService);

readonly accounts = toSignal(this.accountsService.getAccounts(), {
  initialValue: [] as Account[],
});
```

**Never** do this in a component:

```typescript
// ❌ PROHIBITED
this.accountsService.getAccounts().subscribe(accounts => {
  this.accounts = accounts;
});
```

## Service Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class AccountsStore {
  private readonly _accounts = signal<Account[]>([]);
  readonly accounts = this._accounts.asReadonly();

  private readonly accountsApi = inject(AccountsApiService);

  loadAccounts(): void {
    this.accountsApi.getAccounts().pipe(
      tap(accounts => this._accounts.set(accounts)),
    ).subscribe(); // ✅ subscribe is allowed in services, not components
  }
}
```

## Violations Checklist

| Violation | Detection |
|-----------|-----------|
| `.subscribe(` in `.component.ts` | Regex scan |
| `BehaviorSubject` in `.component.ts` | Import/usage scan |
| `Subject` / `ReplaySubject` in `.component.ts` | Import/usage scan |
| Missing `toSignal()` when Observable consumed in component | Heuristic: Observable assignment without toSignal |
| `signal(` not used for mutable component state | Manual review |

## Effects

Use `effect()` sparingly and only for side effects (logging, DOM sync). Prefer `computed()` for derived state.

```typescript
import { effect } from '@angular/core';

constructor() {
  effect(() => {
    console.log('Count changed:', this.count());
  });
}
```

## Async Context Warning

Signal reads after `await` are **not tracked** in reactive contexts. Always read signals before asynchronous boundaries.
