# Test-Driven Development (TDD) Rule

## Convention: Tests Written Before Implementation

All code must follow strict Test-Driven Development workflow. No implementation without tests.

## Red-Green-Refactor Cycle

### 1. RED: Write Failing Test

```typescript
// tests/unit/adapters/postgres/data-store.test.ts
import { assertEquals } from '@std/assert';
import { PostgresDataStore } from '../../../../src/adapters/postgres/data-store.ts';

Deno.test('DataStore - get returns user by ID', async () => {
  const store = new PostgresDataStore(mockClient);
  const user = await store.get('users', '123');

  assertEquals(user.username, 'test-user');
});
```

**Run:** `deno task test:watch` - Test should FAIL

### 2. GREEN: Write Minimal Implementation

```typescript
// src/adapters/postgres/data-store.ts
import { DataStore } from '../../core/data/types.ts';

export class PostgresDataStore implements DataStore {
  async get<T>(collection: string, id: string): Promise<T | null> {
    // Minimal implementation to make test pass
    const result = await this.client.query(
      'SELECT * FROM $1 WHERE id = $2',
      [collection, id],
    );
    return result.rows[0] || null;
  }
}
```

**Run:** `deno task test:watch` - Test should PASS

### 3. REFACTOR: Improve Code Quality

```typescript
// src/adapters/postgres/data-store.ts
export class PostgresDataStore implements DataStore {
  async get<T>(collection: string, id: string): Promise<T | null> {
    // Refactored: Better error handling, validation
    if (!collection || !id) {
      throw createDataError('INVALID_QUERY', 'Collection and ID required');
    }

    try {
      const result = await this.client.query(
        'SELECT data FROM $1 WHERE id = $2',
        [collection, id],
      );
      return result.rows[0]?.data || null;
    } catch (error) {
      throw createDataError('STORE_UNAVAILABLE', 'Database error', error);
    }
  }
}
```

**Run:** `deno task test:watch` - Tests still PASS

## Coverage Requirements

| Phase   | Minimum Coverage | Target Coverage |
| ------- | ---------------- | --------------- |
| Phase 1 | 80%              | 85%             |
| Phase 2 | 85%              | 90%             |
| Phase 3 | 90%              | 95%             |

### Check Coverage

```bash
# Run tests with coverage
deno task test:coverage

# Generate HTML report
deno task coverage

# View report
open coverage/html/index.html
```

## Test Types & Distribution

### Unit Tests (70% of tests)

**Characteristics:**

- Mock all external dependencies
- Fast (<1ms per test)
- No I/O operations
- Test single function/class in isolation

**Location:** `tests/unit/{domain}/{file}.test.ts`

**Example:**

```typescript
// tests/unit/adapters/postgres/data-store.test.ts
import { createMockPgClient } from '../../../helpers/test-utils.ts';

Deno.test('DataStore - handles missing item', async () => {
  const mockClient = createMockPgClient({
    query: async () => ({ rows: [] }),
  });

  const store = new PostgresDataStore(mockClient);
  const result = await store.get('users', 'nonexistent');

  assertEquals(result, null);
});
```

### Integration Tests (25% of tests)

**Characteristics:**

- Use real external services (Postgres, Redis, Keycloak)
- Slower (100-500ms per test)
- Test adapter implementations
- Can be skipped with `SKIP_INTEGRATION=true`

**Location:** `tests/integration/{service}/{file}.test.ts`

**Example:**

```typescript
// tests/integration/postgres/data-store.test.ts
import { createTestPgClient } from '../../helpers/test-utils.ts';

Deno.test({
  name: 'DataStore - persists data to real Postgres',
  ignore: Deno.env.get('SKIP_INTEGRATION') === 'true',
  async fn() {
    const client = await createTestPgClient();
    const store = new PostgresDataStore(client);

    await store.set('users', '123', { username: 'test' });
    const result = await store.get('users', '123');

    assertEquals(result.username, 'test');

    await client.close();
  },
});
```

### E2E Tests (5% of tests)

**Characteristics:**

- Full system tests
- HTTP requests → responses
- Test user workflows
- Slowest (1-5s per test)

**Location:** `tests/e2e/{workflow}.test.ts`

**Example:**

```typescript
// tests/e2e/auth-flow.test.ts
Deno.test('E2E - Complete authentication flow', async () => {
  // 1. Login
  const loginRes = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'test', password: 'pass' }),
  });
  const { accessToken } = await loginRes.json();

  // 2. Access protected resource
  const agentsRes = await fetch('http://localhost:3000/agents', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  assertEquals(agentsRes.status, 200);
});
```

## Test File Naming

- Unit: `{module}.test.ts`
- Integration: `{service}.test.ts`
- E2E: `{workflow}.test.ts`

## Test Utilities

Create mocks for all interfaces in `tests/helpers/test-utils.ts`:

```typescript
// tests/helpers/test-utils.ts

export function createMockDataStore(): DataStore {
  const store = new Map();
  return {
    async get(collection, id) {
      return store.get(`${collection}:${id}`) || null;
    },
    async set(collection, id, data) {
      store.set(`${collection}:${id}`, data);
    },
    // ... other methods
  };
}

export function createMockIdentityProvider(): IdentityProvider {
  return {
    async authenticate() {
      return { accessToken: 'mock', refreshToken: 'mock', expiresIn: 3600, tokenType: 'Bearer' };
    },
    async validateToken() {
      return {
        id: '1',
        username: 'mock',
        email: 'mock@test.com',
        roles: [],
        permissions: [],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
    // ... other methods
  };
}
```

## Test Commands

```bash
# Watch mode (TDD workflow)
deno task test:watch

# Run all tests
deno task test

# Run only unit tests
deno task test:unit

# Run only integration tests
deno task test:integration

# Skip integration tests
SKIP_INTEGRATION=true deno task test

# Run with coverage
deno task test:coverage

# Generate coverage report
deno task coverage
```

## Test Organization

```
tests/
├── helpers/
│   └── test-utils.ts          # Mocks and utilities
├── fixtures/
│   └── sample-data.ts         # Test data
├── unit/
│   ├── core/
│   │   ├── identity/
│   │   ├── data/
│   │   └── executor/
│   ├── adapters/
│   │   ├── postgres/
│   │   ├── keycloak/
│   │   └── redis/
│   └── api/
│       └── routes/
├── integration/
│   ├── postgres/
│   ├── redis/
│   └── keycloak/
└── e2e/
    ├── auth-flow.test.ts
    └── agent-execution.test.ts
```

## Pre-Commit Checklist

Before committing code:

- [ ] All tests pass: `deno task test`
- [ ] Coverage meets minimum: `deno task test:coverage`
- [ ] Code formatted: `deno task fmt`
- [ ] No lint errors: `deno task lint`
- [ ] Types check: `deno task check`

## Common Patterns

### Testing Async Functions

```typescript
Deno.test('Async operation completes', async () => {
  const result = await asyncFunction();
  assertEquals(result, expected);
});
```

### Testing Error Handling

```typescript
Deno.test('Throws error on invalid input', async () => {
  await assertRejects(
    async () => await functionThatThrows(),
    DataError,
    'Expected error message',
  );
});
```

### Testing with Timeouts

```typescript
Deno.test({
  name: 'Operation completes within timeout',
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const result = await Promise.race([
      longRunningOperation(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000)),
    ]);
    assertExists(result);
  },
});
```

## Enforcement

- Tests MUST be written before implementation
- Pull requests require passing tests
- Coverage must meet phase requirements
- Claude Code enforces this workflow
- No commits without tests

## Exceptions

None. TDD is mandatory for all code.
