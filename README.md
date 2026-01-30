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
- **Production Ready**: Optimized Build, SEO, and Environment Validation.

---

## 📂 Architecture Overview

We follow the **Verified Modular Monolith** pattern:

```bash
src/
├── app/               # 🔌 Route Connectors (Pages only, no logic)
├── config/            # ⚙️ Global Config (Env, Constants)
├── core/              # 🧠 Shared Infrastructure (The Engine)
│   ├── ui/            # Design System (Shadcn)
│   ├── crud/          # Generic CRUD Engine
│   ├── store/         # Global State (Zustand)
│   └── di.ts          # Dependency Injection Container
└── modules/           # 📦 Feature Domains (Self-Contained)
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

## 🔒 Security & Auth

- **RouteGuard**: Automatically protects pages based on Auth state.
- **RBAC**: `usePermissions()` hook for granular control (`'products:create'`).
- **Hydration**: Prevents "flash of unauthenticated content".
- **Interceptors**: Auto-refresh tokens on 401.

---

## 📚 Documentation

Detailed guides can be found in the `/docs` directory:
- [📖 Architecture Guide](docs/architecture/01-modularity.md)
- [🏗️ Creating Your First Module](docs/tutorial/01-first-module.md)
- [🧠 State Management](docs/architecture/02-state-management.md)

---

## 🤝 Contribution

Strict architectural rules apply. Please read the [Checklist](docs/CHECKLIST.md) before submitting PRs.

---

**Built with ❤️ and Precision.**
