# 🧪 Testing Guide: Vitest & React Testing Library

We use **Vitest** for unit and integration testing. It's fast, compatible with Jest, and integrates perfectly with Vite.

---

## 🚀 Running Tests

### Run All Tests

```bash
pnpm test
```

### Run in UI Mode (Interactive)

Opens a web interface to see test results and code coverage visually.

```bash
pnpm test:ui
```

### Check Coverage

Generates a coverage report in `coverage/` folder.

```bash
pnpm test:coverage
```

---

## 📂 Test Structure

We follow a **co-located** testing strategy for unit tests:

```bash
src/core/
├── hooks/
│   ├── usePermissions.ts
│   └── __tests__/              # Tests live here!
│       └── usePermissions.test.ts
├── common/
│   ├── utils.ts
│   └── __tests__/
│       └── utils.test.ts
```

---

## 📝 Writing Your First Test

### 1. Unit Test (Pure Function)

`src/core/common/__tests__/math.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { add } from "../math";

describe("Math Utils", () => {
  it("should add numbers", () => {
    expect(add(1, 2)).toBe(3);
  });
});
```

### 2. Hook Test (React Hooks)

`src/core/hooks/__tests__/useCounter.test.ts`:

```typescript
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "../useCounter";

describe("useCounter", () => {
  it("should increment", () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

---

## 🛠️ Mocking (The "Fake" Parts)

We use `vi` from Vitest (similar to `jest`) to mock dependencies.

### Mocking Stores (Zustand)

```typescript
import { vi } from "vitest";

vi.mock("@core/stores/auth-store", () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: "1", role: "admin" },
    isAuthenticated: true,
  })),
}));
```

### Mocking Next.js Router

The router is **automatically mocked** in `vitest.setup.ts`. You can use `useRouter` in tests without errors.

---

## 🎯 What to Test?

1.  **Utilities**: Helper functions (date formatting, calculation).
2.  **Hooks**: Custom logic hooks (permissions, cart logic).
3.  **Components**: Complex UI components (forms, tables).
    _(Skip testing simple UI components that just render props)_
