# Module Boundary Rules

> **ABSOLUTE LAW**: Modules are isolated islands. They CANNOT import from each other.

## The Golden Rule (Module Imports)

```
┌─────────────────────────────────────────────────────────────┐
│                     ALLOWED IMPORTS                          │
├─────────────────────────────────────────────────────────────┤
│  ✅ @core/*           → Shared infrastructure                │
│  ✅ @modules/{self}/* → Own module files only                │
│  ✅ External packages → npm dependencies                      │
├─────────────────────────────────────────────────────────────┤
│                    FORBIDDEN IMPORTS                         │
├─────────────────────────────────────────────────────────────┤
│  ❌ @modules/other/*  → NEVER import from other modules      │
│  ❌ ../../../modules/ → Relative paths to other modules      │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer Boundary Rules (STRICT)

> **ABSOLUTE LAW**: Each layer can ONLY call the layer directly below it.

```
┌─────────────────────────────────────────────────────────────┐
│                      LAYER HIERARCHY                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   View  →  ViewModel  →  Repository  →  Service  →  API     │
│            (via DI)      (via Mapper)  (injected)            │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                      LAYER RULES                             │
├─────────────────────────────────────────────────────────────┤
│  View       │ ✅ ViewModel hooks    │ ❌ Repository, Service │
│  ViewModel  │ ✅ Repository (DI)    │ ❌ Service, IApiService│
│  Repository │ ✅ Service (injected) │ ❌ IApiService directly│
│  Service    │ ✅ IApiService        │ ❌ Repository, Mapper  │
│  Mapper     │ ✅ Nothing (pure)     │ ❌ Any other layer     │
└─────────────────────────────────────────────────────────────┘
```

### Why ViewModels CANNOT Call Services

```typescript
// ❌ WRONG: ViewModel calling Service
const productService = systemContainer.productService;
await productService.create(data);

// ✅ CORRECT: ViewModel calling Repository
const productRepo = systemContainer.productRepository;
await productRepo.create(data);
```

**Reason:** Repository handles mapping. If ViewModel calls Service directly, it must know about Models (DTOs), breaking separation of concerns.

## Import Examples

### ✅ ALLOWED

```typescript
// Inside src/modules/hr/src/presentation/views/EmployeeList.tsx

// ✅ Core imports
import { Result } from "@core/common/Result";
import { useTranslation } from "@core/localization";
import { Button } from "@core/ui/button";

// ✅ Own module imports
import { useEmployees } from "@modules/hr/src/presentation/viewmodels/useEmployees";
import { Employee } from "@modules/hr/src/domain/entities/Employee";

// ✅ External packages
import { useQuery } from "@tanstack/react-query";
```

### ❌ FORBIDDEN

```typescript
// Inside src/modules/hr/src/presentation/views/EmployeeList.tsx

// ❌ BANNED: Importing from another module
import { Vendor } from "@modules/vendor/src/domain/entities/Vendor";
import { useVendors } from "@modules/vendor/src/presentation/viewmodels/useVendors";

// ❌ BANNED: Relative path to another module
import { RFQ } from "../../../rfq/src/domain/entities/RFQ";
```

---

## Cross-Module Communication

When modules need to interact, use these patterns:

### Pattern 1: URL Navigation

```typescript
// In HR module, link to Vendor details
import Link from 'next/link';

export function EmployeeCard({ employee }) {
  return (
    <div>
      <span>{employee.name}</span>
      {/* Navigate to vendor module via URL */}
      <Link href={`/vendor/${employee.assignedVendorId}`}>
        View Assigned Vendor
      </Link>
    </div>
  );
}
```

### Pattern 2: Core Event Bus (Future)

```typescript
// src/core/events/EventBus.ts
type EventMap = {
  "employee:created": { id: string; name: string };
  "vendor:updated": { id: string };
};

// Publishing from HR module
eventBus.emit("employee:created", { id: "123", name: "John" });

// Subscribing in Vendor module
eventBus.on("employee:created", (data) => {
  // React to employee creation
});
```

### Pattern 3: Shared IDs Only

```typescript
// ✅ Store vendor ID in HR entity (just the ID, not the object)
export const EmployeeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  assignedVendorId: z.string().uuid().optional(), // Just the ID
});

// ❌ DON'T embed the entire Vendor entity
export const EmployeeSchema = z.object({
  vendor: VendorSchema, // WRONG: Creates coupling
});
```

---

## Why This Matters

| Without Boundaries              | With Boundaries               |
| ------------------------------- | ----------------------------- |
| Spaghetti imports               | Clear dependencies            |
| Breaking one module breaks all  | Isolated failures             |
| Cannot extract to separate repo | Easy Git Submodule extraction |
| Merge conflicts everywhere      | Team autonomy                 |
| Full rebuild on any change      | Incremental builds            |

---

## Enforcement

### 1. TypeScript Path Mapping

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@core/*": ["./src/core/*"],
      "@modules/*": ["./src/modules/*"]
    }
  }
}
```

### 2. ESLint Rules (Future)

```javascript
// eslint.config.mjs
{
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['@modules/hr/*'],
          message: 'Cannot import HR module from here',
        },
        // Add pattern for each module
      ],
    }],
  },
}
```

### 3. Code Review Checklist

- [ ] No imports from `@modules/{other}/`
- [ ] Cross-module data passed via route params only
- [ ] Shared logic moved to `@core/`

---

## The Shared Kernel (`src/core/`)

The **only** code that can be imported by all modules:

```
src/core/
├── common/       # Result, AppError, Constants
├── network/      # API client, interceptors
├── locales/      # Dictionary files (ar.ts, en.ts)
├── providers/    # LanguageProvider, MainProvider
├── store/        # Global Zustand stores
├── ui/           # Shadcn components, cn utility
└── di/           # Core DI container
```

If you need to share code between modules, it MUST go in `@core/`.
