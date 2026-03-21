# Interface-Driven Design Rule

## Convention: All External Dependencies Behind Interfaces

All external dependencies (databases, APIs, services) must be abstracted behind owned interfaces defined in `src/core/`.

## Structure

```
src/
├── core/               # Domain layer - Interfaces (we own these)
│   ├── identity/
│   │   └── types.ts    # IdentityProvider interface
│   ├── data/
│   │   └── types.ts    # DataStore, ObjectStore interfaces
│   └── executor/
│       └── types.ts    # AgentExecutor interface
│
└── adapters/           # Infrastructure layer - Implementations (swappable)
    ├── keycloak/
    │   └── identity-provider.ts   # Implements IdentityProvider
    ├── postgres/
    │   ├── data-store.ts          # Implements DataStore
    │   └── object-store.ts        # Implements ObjectStore
    └── ollama/
        └── llm-provider.ts        # Implements LLMProvider
```

## Rules

### ✅ DO: Define Interface in Core

```typescript
// src/core/identity/types.ts
export interface IdentityProvider {
  authenticate(credentials: Credentials): Promise<AuthToken>;
  validateToken(token: string): Promise<User>;
}
```

### ✅ DO: Implement in Adapter

```typescript
// src/adapters/keycloak/identity-provider.ts
import { AuthToken, IdentityProvider, User } from '../../core/identity/types.ts';
import Keycloak from 'keycloak-js'; // External dependency ONLY in adapter

export class KeycloakIdentityProvider implements IdentityProvider {
  constructor(private keycloak: Keycloak) {}

  async authenticate(credentials: Credentials): Promise<AuthToken> {
    // Use Keycloak SDK here
  }
}
```

### ✅ DO: Consume via Interface

```typescript
// src/api/routes/auth.routes.ts
import { IdentityProvider } from '../../core/identity/types.ts';

export function createAuthRoutes(identity: IdentityProvider) {
  // Use interface, not concrete implementation
  return async (c: Context) => {
    const token = await identity.authenticate(credentials);
    return c.json({ token });
  };
}
```

### ❌ DON'T: Import External Deps in Core

```typescript
// BAD: src/core/identity/auth-service.ts
import Keycloak from 'keycloak-js'; // ❌ External dep in core!

export class AuthService {
  constructor(private keycloak: Keycloak) {} // ❌ Coupled to Keycloak
}
```

### ❌ DON'T: Import Adapters in Domain Logic

```typescript
// BAD: src/api/routes/auth.routes.ts
import { KeycloakIdentityProvider } from '../../adapters/keycloak/identity-provider.ts'; // ❌

// Domain logic should use interface, not concrete adapter
```

## Benefits

### 1. Zero Vendor Lock-In

```typescript
// Easy migration: Keycloak → Auth0
const identity = new Auth0IdentityProvider(config); // Same interface!
```

### 2. Testability

```typescript
// tests/unit/api/auth.test.ts
import { createMockIdentityProvider } from '../../helpers/test-utils.ts';

const mockIdentity = createMockIdentityProvider();
const routes = createAuthRoutes(mockIdentity); // No Keycloak needed!
```

### 3. Evolution Without Breaking Changes

```typescript
// Interface stays stable
interface IdentityProvider { ... }

// Adapter can change implementation completely
class KeycloakV2IdentityProvider implements IdentityProvider {
  // New implementation, same interface
}
```

## Interface Naming Convention

- **Interface name:** Describes capability, not implementation
  - ✅ `IdentityProvider` (capability-focused)
  - ❌ `KeycloakService` (implementation-focused)

- **Adapter name:** Includes implementation detail
  - ✅ `KeycloakIdentityProvider`
  - ✅ `PostgresDataStore`
  - ✅ `RedisLockManager`

## Dependency Injection Pattern

Always inject interfaces, never concrete adapters:

```typescript
// Good: Constructor accepts interface
class AgentExecutor {
  constructor(
    private identity: IdentityProvider, // Interface
    private dataStore: DataStore, // Interface
    private llm: LLMProvider, // Interface
  ) {}
}

// Bad: Constructor accepts concrete class
class AgentExecutor {
  constructor(
    private keycloak: KeycloakIdentityProvider, // ❌ Concrete
    private postgres: PostgresDataStore, // ❌ Concrete
  ) {}
}
```

## Interface Definition Checklist

When creating a new interface:

- [ ] Defined in `src/core/{domain}/types.ts`
- [ ] Name describes capability, not implementation
- [ ] Methods use domain types, not external library types
- [ ] Error types defined in same file
- [ ] Documentation includes purpose and example usage
- [ ] At least one adapter implemented
- [ ] Mock helper created in `tests/helpers/test-utils.ts`

## Adapter Implementation Checklist

When creating a new adapter:

- [ ] Implements interface from `src/core/`
- [ ] External dependency imported ONLY in adapter file
- [ ] Adapter name includes implementation (e.g., `Postgres`, `Keycloak`)
- [ ] Error handling maps external errors to domain errors
- [ ] Unit tests with mocked external dependency
- [ ] Integration tests with real external dependency

## Migration Example

### Before (Tightly Coupled)

```typescript
// Keycloak everywhere
import Keycloak from 'keycloak-js';

class AuthService {
  keycloak: Keycloak;
}

class AgentService {
  keycloak: Keycloak;
}

// Hard to test, hard to migrate
```

### After (Interface-Driven)

```typescript
// Interface in core
interface IdentityProvider { ... }

// Adapter
class KeycloakIdentityProvider implements IdentityProvider { ... }

// Services use interface
class AuthService {
  identity: IdentityProvider;
}

class AgentService {
  identity: IdentityProvider;
}

// Easy to test (mock), easy to migrate (swap adapter)
```

## Enforcement

- Manual code review
- Claude Code awareness (this rule)
- Architecture documentation
- Example patterns in codebase

## Exceptions

None. All external dependencies must be behind interfaces.
