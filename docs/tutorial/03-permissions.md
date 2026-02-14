# 🛡️ Global Permissions System

This guide shows how to use the robust, enterprise-grade permission system that works across the entire application - not just menu-based actions.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  BACKEND (Source of Truth)                          │
│  • Calculates permissions from Admin's roles        │
│  • Returns flattened permissions[] in AdminResponse │
│  • Enforces via [PermissionRequired] attributes     │
└─────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────┐
│  FRONTEND (UX Layer)                                │
│  • Stores permissions in Zustand (persisted)        │
│  • usePermission() hook for checking                │
│  • PermissionGate component for declarative UI      │
│  • GenericCrudView auto-permission support          │
└─────────────────────────────────────────────────────┘
```

> ⚠️ **Important Security Note**: Frontend permission checks are for **UX only**. The backend is the ultimate gatekeeper and will reject unauthorized requests regardless of frontend state.

---

## 1. Using the `usePermission()` Hook

The simplest way to check a single permission:

```tsx
import { usePermission } from "@core/hooks/use-permission";

export function ReportsPage() {
  const canExport = usePermission("reports.export");
  const canPrint = usePermission("reports.print");

  return (
    <div>
      <h1>Reports</h1>
      {canExport && <Button onClick={handleExport}>Export PDF</Button>}
      {canPrint && <Button onClick={handlePrint}>Print</Button>}
    </div>
  );
}
```

---

## 2. Using `usePermissions()` for Multiple Checks

When you need to check multiple permissions:

```tsx
import { usePermissions } from "@core/hooks/use-permission";

export function AdminDashboard() {
  const { has, hasAny, hasAll, permissions } = usePermissions();

  return (
    <div>
      {/* Single permission */}
      {has("admins.create") && <CreateButton />}

      {/* ANY of these permissions */}
      {hasAny(["users.view", "admins.view"]) && <UserSection />}

      {/* ALL of these permissions required */}
      {hasAll(["reports.view", "reports.export"]) && <ExportSection />}
    </div>
  );
}
```

---

## 3. Using `<PermissionGate>` Component

Declarative permission-based rendering:

```tsx
import { PermissionGate } from "@core/components/permission-gate";

export function ProductPage() {
  return (
    <div>
      {/* Single permission */}
      <PermissionGate permission="products.create">
        <Button>Create Product</Button>
      </PermissionGate>

      {/* Multiple permissions - ANY required */}
      <PermissionGate permissions={["products.update", "products.delete"]}>
        <ActionButtons />
      </PermissionGate>

      {/* Multiple permissions - ALL required */}
      <PermissionGate permissions={["analytics.view", "analytics.export"]} requireAll>
        <AnalyticsExport />
      </PermissionGate>

      {/* With fallback */}
      <PermissionGate permission="premium.feature" fallback={<UpgradePrompt />}>
        <PremiumFeature />
      </PermissionGate>
    </div>
  );
}
```

---

## 4. GenericCrudView Permission Integration

The easiest way - just specify the `resource` name:

```tsx
const adminsConfig: CrudConfig<Admin> = {
  titleKey: "admins.title",
  subtitleKey: "admins.subtitle",
  columns: [...],
  createFields: [...],
  editFields: [...],

  // ✅ Auto-checks: admins.create, admins.update, admins.delete
  resource: "admins",
};
```

Or use explicit permissions:

```tsx
const config: CrudConfig<Product> = {
  // ... other config

  permissions: {
    canCreate: "products.create", // Dynamic check
    canUpdate: "products.update", // Dynamic check
    canDelete: false, // Static: always hidden
  },
};
```

---

## 5. Permission Code Format

Permissions follow a `resource.action` format:

| Permission            | Description            |
| --------------------- | ---------------------- |
| `admins.view`         | View admin list        |
| `admins.create`       | Create new admins      |
| `admins.update`       | Edit existing admins   |
| `admins.delete`       | Delete admins          |
| `admins.assign_roles` | Assign roles to admins |
| `reports.print`       | Print reports          |
| `reports.export`      | Export reports to PDF  |

---

## 6. Data Flow

```
1. Login
   └─→ POST /api/auth/admin/login
   └─→ GET /api/auth/admin/me
       └─→ Returns: { user, permissions: ["admins.view", "reports.print", ...] }
       └─→ Saved to: useAppStore.permissions (Zustand + localStorage)

2. Page Load
   └─→ usePermission("reports.print")
   └─→ Reads from store (NO API call)
   └─→ Returns: true/false

3. API Request (always enforced)
   └─→ POST /api/reports/print
   └─→ Backend checks [PermissionRequired("reports.print")]
   └─→ Returns: 200 OK or 403 Forbidden
```

---

## 7. Security Principles

| Principle                | Implementation                                  |
| ------------------------ | ----------------------------------------------- |
| **Backend is truth**     | All APIs have `[PermissionRequired]` attributes |
| **Frontend is UX**       | Hide buttons users can't use                    |
| **Never trust client**   | Modified localStorage won't bypass backend      |
| **Privilege escalation** | Backend prevents assigning higher permissions   |

---

## Quick Reference

```tsx
// Hook - single permission
const canCreate = usePermission("admins.create");

// Hook - multiple checks
const { has, hasAny, hasAll } = usePermissions();

// Component - declarative
<PermissionGate permission="admins.delete">
  <DeleteButton />
</PermissionGate>

// GenericCrudView - automatic
<GenericCrudView config={{ resource: "admins", ... }} />
```
