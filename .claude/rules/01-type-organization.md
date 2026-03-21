# Type Organization Rule

## Convention: Path Alias Imports (Required)

All TypeScript imports in this project **MUST use path aliases** to maintain clarity, enable easy refactoring, and prevent broken imports when files are moved.

## Structure

Types are organized in domain-specific directories under `src/core/`:

```
src/core/
├── chat/types.ts
├── config/types.ts
├── conversation/types.ts
├── executor/types.ts
├── identity/types.ts
├── llm/types.ts
├── orchestration/types.ts
├── tools/types.ts
└── validation/types.ts
```

## Rules

### ✅ DO: Use Path Aliases (Required)

**Always use path aliases for all imports** - this makes refactoring easier and paths cleaner:

```typescript
// ✅ CORRECT: Path aliases (required for cross-directory imports)
import { AuthToken, User } from '@/core/identity/types.ts';
import { DataStore, Query } from '@/core/data/types.ts';
import { loadAgent } from '@/agents/mod.ts';
import { executeAgent } from '@/core/executor/mod.ts';

// ✅ ACCEPTABLE: Relative imports ONLY for same-directory files
import { LLMProvider, LLMRequest } from './types.ts';
import { helperFunction } from './utils.ts';

// ❌ INCORRECT: Relative paths across directories (deprecated)
import { User } from '../../../core/identity/types.ts';
import { DataStore } from '../../core/data/types.ts';
```

**Available Path Aliases:**

- `@/core/chat/` - Chat service types
- `@/core/conversation/` - Conversation store types
- `@/core/memory/` - Backend memory types
- `@/core/observability/` - Logging, tracing, metrics
- `@/core/orchestrator/` - Orchestration types
- `@/core/tools/` - Tool registry and execution
- `@/agents/` - Agent configurations
- `@/api/` - API routes and schemas
- `@/tools/` - Tool implementations

### ❌ DON'T: Use Barrel Exports for Types

Do NOT create `mod.ts` or `index.ts` files to re-export types:

```typescript
// ❌ BAD: DO NOT create this barrel export pattern for types
// src/core/mod.ts
export * from './identity/types.ts';
export * from './data/types.ts';

// ✅ GOOD: Barrel exports OK for implementations (not types)
// src/core/llm/mod.ts
export { getDefaultProvider, isLLMError } from './provider.ts';
```

**Note:** Barrel exports (`mod.ts`) are acceptable for grouping **implementations**, but should never be used to re-export types. Always import types directly from their `types.ts` file.

## Rationale

1. **Refactoring Safety**: Path aliases remain valid when files are moved - no need to update import paths
2. **Clarity**: Clear, consistent paths across the entire codebase
3. **No Brittle Relative Paths**: Avoid `../../../` path fragility
4. **IDE Support**: Better autocomplete and navigation with absolute paths
5. **Type-Only Imports**: Clear separation of type-only vs runtime imports

## Examples

### Adapter Importing Core Types

```typescript
// src/adapters/postgres/data-store.ts
import { createDataError, DataStore, Query, Transaction } from '@/core/data/types.ts';

export class PostgresDataStore implements DataStore {
  // Implementation
}
```

### API Route Importing Multiple Types

```typescript
// src/api/routes/auth.routes.ts
import { AuthToken, User } from '@/core/identity/types.ts';
import { createIdentityError } from '@/core/identity/types.ts';
import type { Context } from 'hono';

export function authRoutes(app: Hono) {
  // Routes
}
```

### Test File Importing Types

```typescript
// tests/unit/adapters/postgres/data-store.test.ts
import { assertEquals } from '@std/assert';
import { DataStore, Query } from '@/core/data/types.ts';
import { PostgresDataStore } from '@/adapters/postgres/data-store.ts';
```

## Type File Structure

Each `types.ts` file should contain:

1. **Interfaces** - Core abstractions
2. **Types** - Type aliases and unions
3. **Error Classes** - Domain-specific errors
4. **Helper Functions** - Error creators, validators

```typescript
// Example: src/core/data/types.ts

// 1. Main interface
export interface DataStore {
  get<T>(collection: string, id: string): Promise<T | null>;
  // ... other methods
}

// 2. Supporting types
export interface Query {
  where?: Record<string, unknown>;
  limit?: number;
}

// 3. Error class
export class DataError extends Error {
  constructor(message: string, public code: DataErrorCode) {
    super(message);
    this.name = 'DataError';
  }
}

// 4. Error type
export type DataErrorCode =
  | 'NOT_FOUND'
  | 'INVALID_QUERY';

// 5. Helper function
export function createDataError(
  code: DataErrorCode,
  message: string,
): DataError {
  return new DataError(message, code);
}
```

## Enforcement

This convention is enforced through:

- Code review
- Claude Code awareness (this rule file)
- Developer documentation
- Example code patterns

## Exceptions

**Same-directory imports**: You may use relative imports (e.g., `./types.ts`, `./utils.ts`) when importing files from the same directory. For all other imports, path aliases are required.

**Test files**: Test files should use path aliases when importing from `src/` but may use relative paths for imports within the `tests/` directory structure (e.g., `../../../helpers/test-utils.ts` within tests is acceptable).
