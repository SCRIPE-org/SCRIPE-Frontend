# 🏗️ Next Frontend Template — Modular Clean Architecture

> **The "Perfect" Foundation.**
> A Scalable, Type-Safe, and Modular Monolith Architecture for Next.js 16.
> Combining the power of an ERP Engine with the soul of a Premium UI.

---

## 🚀 Why This Template?

This is not just another boilerplate. It is a **strict architectural standard** designed for teams building large-scale applications (ERPs, dashboards, SaaS) who refuse to compromise on code quality or user experience.

### ✅ Key Features

- **Modular Monolith**: Strict domain separation — Core shared kernel + isolated feature modules
- **ERP Engine**: Generic CRUD system builds full-featured data management pages in minutes
- **SOLID View/ViewModel**: Views are pure UI (~60 lines), ViewModels handle all logic
- **State Management**: Zustand (client state) + TanStack Query v5 (server state)
- **Robust Auth**: JWT + refresh tokens, 2FA (TOTP), session management, permission guards
- **Type Safety**: End-to-end TypeScript + Zod validation
- **Premium UI**: Shadcn/ui components, dark mode, RTL/LTR support, micro-animations
- **Bilingual**: Full Arabic + English localization with `LanguageProvider`
- **Security**: Input sanitization, API retries, RBAC permission gate, route protection

---

## 📂 Architecture Overview

```bash
src/
├── app/                # 🔌 Route Connectors (Server Components — no logic)
│   ├── (auth)/        #     Auth routes (login)
│   └── (modules)/     #     Protected module routes
│       ├── admins/
│       ├── analytics/
│       ├── audit/
│       ├── dashboard/
│       ├── profile/
│       ├── recycle-bin/
│       ├── roles/
│       ├── security/
│       ├── settings/
│       └── tenants/
│
├── config/             # ⚙️ Environment validation & constants
│
├── core/               # 🧠 Shared Infrastructure (The Engine)
│   ├── common/        #     Utilities (sanitize, format, Result)
│   ├── crud/          #     Generic CRUD Engine (GenericCrudView, DataTable, forms)
│   ├── locales/       #     Dictionary files (en.ts, ar.ts)
│   ├── network/       #     API service (Axios + interceptors + retry)
│   ├── providers/     #     LanguageProvider, MainProvider, QueryProvider
│   ├── store/         #     Zustand stores (auth, UI, toast)
│   └── ui/            #     Shadcn/ui design system (65+ components)
│
└── modules/            # 📦 Feature Domains (Self-Contained)
    ├── auth/          #     Authentication (signin, 2FA verify)
    ├── home/          #     Home page
    ├── profile/       #     Profile, security, sessions, activity log
    └── system/        #     System administration
        ├── admin/     #       Admin management (CRUD, bulk ops)
        ├── analytics/ #       Analytics dashboard
        ├── audit/     #       Audit log viewer
        ├── dashboard/ #       Dashboard (KPIs, charts)
        ├── menus/     #       Menu management
        ├── permissions/#      Permission viewer
        ├── recycle-bin/#      Recycle bin
        ├── roles/     #       Role management (CRUD, permissions)
        ├── security/  #       Security dashboard
        ├── tenants/   #       Tenant management (CRUD, settings)
        └── tenant-settings/  # Tenant settings
```

### Module Structure (per module)

```
module/
├── di.ts                     # Module DI Container
├── index.ts                  # Public API exports
└── src/
    ├── domain/               # Business Logic (Pure TS)
    │   ├── entities/         #   Zod schemas
    │   └── interfaces/       #   Repository contracts
    ├── data/                 # Data Access
    │   ├── models/           #   API DTOs
    │   ├── mappers/          #   DTO ↔ Entity mapping
    │   └── repositories/     #   API implementations
    └── presentation/         # UI (SOLID Pattern)
        ├── viewmodels/       #   All logic lives here
        ├── views/            #   Pure UI (~60 lines)
        └── components/       #   Section components
```

---

## 🛠️ Getting Started

### 1. Prerequisites

- Node.js 18+
- pnpm 8+

### 2. Installation

```bash
pnpm install
cp .env.example .env
```

### 3. Run Development

```bash
pnpm dev
```

### 4. Production Build

```bash
pnpm build
pnpm start
```

---

## 🧩 The Generic CRUD Engine

Stop writing the same table code 100 times. Use the engine:

```tsx
export function AdminManagementView() {
  const vm = useAdminManagementViewModel();

  return (
    <div>
      <StatisticsSection {...vm.statistics} />
      <FilterSection {...vm.filters} />
      <GenericCrudView crud={vm.table} columns={vm.columns} />
    </div>
  );
}
```

### Column Helpers

```typescript
column.index('No')
column.text('name', 'Name')
column.date('createdAt', 'Date', { locale: 'en-GB' })
column.status('status', 'Status', statusMap)
column.switch('isActive', 'Active', { getChecked, onChange, isLoading })
column.link('email', 'Email', { type: 'email' })
column.custom('any', 'Header', renderFn)
```

---

## 🔒 Security & Permissions

### Global Permissions System

```tsx
// Hook — check permission
const canCreate = usePermission("admins.create");

// Component — declarative UI gating
<PermissionGate permission="reports.export">
  <ExportButton />
</PermissionGate>
```

### Security Layers

| Layer | Protection |
|-------|------------|
| **Backend** | `[PermissionRequired]` attributes on all endpoints |
| **Frontend** | UX-only permission hiding (not security) |
| **Sanitization** | All inputs sanitized via `@core/common/sanitize.ts` |
| **API Retry** | 5xx errors auto-retried with exponential backoff |
| **Route Guard** | Automatic page protection based on auth state |
| **Hydration** | Prevents "flash of unauthenticated content" |

> ⚠️ **Security Principle**: Frontend checks are UX-only. Backend is the gatekeeper.

---

## 🌐 Localization

Full Arabic + English support with RTL/LTR auto-switching:

```typescript
const { t, language, direction, setLanguage } = Language();

// Simple key
<p>{t('common.loading')}</p>

// With interpolation
<p>{t('errors.minLength', { min: 5 })}</p>

// Switch language
<button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}>
  {language === 'ar' ? 'English' : 'العربية'}
</button>
```

---

## 📚 Documentation

### Architecture

| Topic | Guide |
|-------|-------|
| Modularity & Boundaries | [01-modularity.md](docs/architecture/01-modularity.md) |
| State Management | [02-state-management.md](docs/architecture/02-state-management.md) |
| SOLID View/ViewModel | [solid-patterns.md](docs/architecture/solid-patterns.md) |
| Server vs Client Components | [components.md](docs/architecture/components.md) |
| Module Boundaries | [boundaries.md](docs/architecture/boundaries.md) |

### Feature Documentation

| Feature | Guide |
|---------|-------|
| Auth Module | [auth-module.md](docs/features/auth-module.md) |
| Profile Module | [profile-module.md](docs/features/profile-module.md) |
| System Module | [system-module.md](docs/features/system-module.md) |

### Tutorials

| # | Tutorial | Description |
|---|----------|-------------|
| 1 | [First Module](docs/tutorial/01-first-module.md) | Create a complete module |
| 2 | [API Integration](docs/tutorial/02-api-integration.md) | Connect to backend |
| 3 | [Permissions](docs/tutorial/03-permissions.md) | Integrate RBAC |
| 4 | [Testing Guide](docs/tutorial/04-testing-guide.md) | Write tests |
| 5 | [Security Guide](docs/tutorial/05-security-guide.md) | Secure your module |
| 6 | [Code Quality](docs/tutorial/06-code-quality.md) | Linting & formatting |

---

## 📊 Project Stats

| Metric | Count |
|--------|-------|
| **Frontend Modules** | 4 (auth, home, profile, system) |
| **System Sub-Modules** | 12 (admin, analytics, audit, dashboard, menus, permissions, recycle-bin, roles, security, tenants, tenant-settings, core) |
| **Routes** | 21 pages |
| **Core UI Components** | 65+ (Shadcn/ui) |
| **Supported Languages** | 2 (English, Arabic) |
| **Architecture** | SOLID View/ViewModel, Clean Architecture, Modular Monolith |

---

**Built with Next.js 16, precision architecture, and zero compromises.**
