# 🏗️ Next Frontend Template - Modular Clean Architecture

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg) ![Status](https://img.shields.io/badge/status-production_ready-success)

> **The "Perfect" Foundation.**
> A Scalable, Type-Safe, and Modular Monolith Architecture for Next.js.
> Combining the power of an ERP Engine with the soul of a Premium UI.

---

## 🚀 Why This Template?

This is not just another boilerplate. It is a **strict architectural standard** designed for teams building large-scale applications (ERPs, dashboards, SaaS) who refuse to compromise on code quality or user experience.

### ✅ Key Features

- **Modular Monolith**: Strict domain separation (Core vs Modules).
- **ERP Engine**: "Generic CRUD" system builds full features in minutes.
- **State Management**: Zustand (Client) + React Query (Server) + Hydration Guards.
- **Robust Auth**: RBAC (Role-Based Access Control) + JWT Interceptors.
- **Type Safety**: End-to-End TypeScript + Zod Validation.
- **Premium UI**: 65+ Shadcn Components, Motion Animations, Dark Mode.
- **Storybook**: Isolated UI Workshop & Auto-Documentation.
- **Testing Suite**: Vitest + React Testing Library + Coverage Reports.
- **Security**: Input Sanitization + API Retries + RBAC Guards.
- **Code Quality**: Prettier + Husky Pre-Commit Hooks + Lint Staged.
- **Production Ready**: Optimized Build, SEO, and Environment Validation.

---

## 📂 Architecture Overview

We follow the **Verified Modular Monolith** pattern:

```bash
src/
├── app/               # 🔌 Route Connectors (Pages only, no logic)
├── config/            # ⚙️ Global Config (Env, Constants)
├── core/              # 🧠 Shared Infrastructure (The Engine)
│   ├── common/        # Shared Utilities (Sanitize, Format)
│   ├── ui/            # Design System (Shadcn)
│   ├── crud/          # Generic CRUD Engine
│   ├── services/      # API Service (Axios + Retry)
│   ├── store/         # Global State (Zustand)
│   └── stories/       # Storybook Stories (Core)
├── modules/           # 📦 Feature Domains (Self-Contained)
    ├── auth/          # Authentication Domain
    ├── product/       # Example Domain
    └── _template/     # Copy-paste this to start!
```

---

## 🛠️ Getting Started

### 1. Prerequisites

- Node.js 18+
- pnpm 8+ (Recommended)

### 2. Installation

```bash
# Install dependencies
pnpm install

# Setup Environment
cp .env.example .env
```

### 3. Run Development

```bash
pnpm dev
# OR Run Storybook
pnpm storybook
```

### 4. Run Tests

```bash
pnpm test
```

### 5. Production Build

```bash
pnpm build
pnpm start
```

---

## 🧩 The Generic CRUD Engine

Stop writing the same table code 100 times. Use the engine:

```tsx
export function ProductView() {
  const settings = useProductViewModel(); // Connects to Repository

  return (
    <GenericCrudView
      title="Products"
      columns={columns}
      crud={settings.crud} // Just pass the controller!
      schema={ProductSchema}
    />
  );
}
```

---

## 🔒 Security & Permissions

### Global Permissions System

A robust, enterprise-grade permission system that works for **any** action or page:

```tsx
// Hook - check single permission
const canCreate = usePermission("admins.create");

// Component - declarative UI gating
<PermissionGate permission="reports.export">
  <ExportButton />
</PermissionGate>

// GenericCrudView - automatic permission checking
<GenericCrudView config={{ resource: "admins", ... }} />
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

## 📚 Documentation

Detailed guides can be found in the `/docs` directory:

| Topic               | Guide                                                             |
| :------------------ | :---------------------------------------------------------------- |
| **Architecture**    | [📖 Architecture Guide](docs/architecture/01-modularity.md)       |
| **Modules**         | [🏗️ Creating Your First Module](docs/tutorial/01-first-module.md) |
| **API Integration** | [🔌 Connecting to API](docs/tutorial/02-api-integration.md)       |
| **Permissions**     | [🛡️ Global Permissions System](docs/tutorial/03-permissions.md)  |
| **Testing**         | [🧪 Vitest Guide](docs/tutorial/04-testing-guide.md)              |
| **Security**        | [🔒 Security & Sanitization](docs/tutorial/05-security-guide.md)  |
| **Code Quality**    | [✨ Husky & Prettier](docs/tutorial/06-code-quality.md)           |
| **Storybook**       | [📘 Storybook Guide](docs/tutorial/storybook-guide.md)            |

---

## 🤝 Contribution

Strict architectural rules apply. Please read the [Checklist](docs/CHECKLIST.md) before submitting PRs.

---

**Built with ❤️ and Precision.**
