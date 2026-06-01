# System Module

> Admin, roles, permissions, tenants, menus, messaging, dashboard, analytics, audit, and recycle bin.

---

## Overview

The System module is a **parent module** that contains all system administration sub-modules. Each sub-module is fully self-contained following the SOLID View/ViewModel pattern. The parent module provides shared navigation and layout.

---

## Sub-Module Inventory

```
modules/system/
├── admin/              # Admin management CRUD
├── analytics/          # Analytics dashboard (charts, trends)
├── audit/              # Audit log viewer
├── customization/      # Login Customizer Studio (branding, tokens, accessibility)
├── dashboard/          # Main dashboard (KPIs, charts)
├── menus/              # Menu management (tree, drag-drop)
├── messaging/          # Email composer, templates, notifications
│   ├── email-composer/
│   ├── message-templates/
│   └── notification-sender/
├── permissions/        # Permission viewer (read-only)
├── recycle-bin/        # Recycle bin (restore deleted items)
├── roles/              # Role management CRUD + permissions
├── security/           # Security dashboard
├── tenants/            # Tenant management CRUD
└── tenant-settings/    # Tenant settings
```

---

## Sub-Module Details

### Admin Management (`/admins`)

| Feature    | Implementation                                       |
| ---------- | ---------------------------------------------------- |
| List       | `GenericCrudView` with pagination, search, filters   |
| Create     | `FormDialog` with role assignment                    |
| Edit       | `FormDialog` with inline role management             |
| Bulk Ops   | Activate/deactivate/delete selected                  |
| Statistics | Cards showing total, active, inactive, locked counts |

**Key ViewModels**:

- `useAdminManagementViewModel` — Orchestrator
- `useStatisticsViewModel` — KPI cards
- `useFilterViewModel` — Search + filters

---

### Role Management (`/roles`)

| Feature     | Implementation                                                |
| ----------- | ------------------------------------------------------------- |
| List        | `GenericCrudView` with admin count per role                   |
| Detail      | Role info + permission assignment by category                 |
| Clone       | Anti-privilege-escalation clone                               |
| Permissions | Grouped by category, field-level restrictions, scope selector |

**Key ViewModels**:

- `useRoleListViewModel` — List page
- `useRoleDetailViewModel` — Detail page with permissions

---

### Permission Viewer (`/settings/permissions`)

| Feature   | Implementation                                 |
| --------- | ---------------------------------------------- |
| View      | All permissions grouped by category            |
| Search    | Filter by name/category                        |
| Read-only | No create/edit/delete — permissions are seeded |

---

### Tenant Management (`/tenants`)

| Feature   | Implementation                              |
| --------- | ------------------------------------------- |
| List      | `GenericCrudView` with hierarchy indicators |
| Hierarchy | Tree visualization of tenant structure      |
| Detail    | Settings form + permission pool management  |
| Stats     | Admin count, role count, child count        |

**Key ViewModels**:

- `useTenantListViewModel` — List page
- `useTenantDetailViewModel` — Detail + settings

---

### Menu Management (`/settings/menus`)

| Feature     | Implementation                            |
| ----------- | ----------------------------------------- |
| Tree        | Drag-and-drop tree view of all menu items |
| Create/Edit | Form dialog for menu item properties      |
| Reorder     | Drag items to reorder or reparent         |
| Visibility  | Per-role visibility toggles               |

---

### Dashboard (`/dashboard`)

| Feature         | Implementation                                         |
| --------------- | ------------------------------------------------------ |
| KPI Cards       | Admin count, sessions, today's logins, failed attempts |
| Login Chart     | Line chart of login activity over time                 |
| Event Pie       | Distribution of event types                            |
| Security Events | Recent security incidents table                        |
| Top Blocked IPs | Most blocked IP addresses                              |
| Export          | CSV/Excel/PDF export for each section                  |

**Key ViewModels**:

- `useDashboardViewModel` — Orchestrator
- `useKPIViewModel` — Summary cards
- `useLoginChartViewModel` — Login activity chart
- `useSecurityViewModel` — Security events

---

### Analytics (`/analytics`)

Extended analytics with more detailed charts and configurable date ranges.

---

### Audit Log (`/audit`)

| Feature   | Implementation                                |
| --------- | --------------------------------------------- |
| Log Table | Paginated, searchable audit events            |
| Detail    | Side-by-side diff of entity changes           |
| Filters   | By event type, entity type, admin, date range |
| Export    | CSV/Excel/PDF                                 |

---

### Recycle Bin (`/recycle-bin`)

| Feature      | Implementation                             |
| ------------ | ------------------------------------------ |
| List         | All soft-deleted items across entity types |
| Restore      | Restore individual items                   |
| Bulk Restore | Restore selected items                     |
| Filter       | By entity type                             |

---

### Messaging (`/messaging`)

See the dedicated [Messaging Module](messaging-module.md) documentation for full details on:

- **Email Composer** — Rich email composing with templates, attachments, scheduling
- **Message Templates** — CRUD, live preview, placeholder schema builder, design variables
- **Notification Sender** — In-app notification composing with admin/role targeting

---

### Security Dashboard (`/security`)

Security-focused view with:

- Active lockouts
- Recent failed login attempts
- 2FA statistics
- Rate limit events

---

### Tenant Settings (`/customization/branding`)

| Feature         | Implementation                           |
| --------------- | ---------------------------------------- |
| Settings Form   | Theme, colors, language, session timeout |
| Logo Upload     | Upload/remove tenant logo                |
| Permission Pool | View tenant's available permissions      |

---

## Common Patterns

All sub-modules follow the same SOLID architecture:

### View (~60 lines)

```typescript
'use client';
export function SubModuleView() {
    const vm = useSubModuleViewModel();
    return (
        <div>
            <StatisticsSection {...vm.statistics} />
            <FilterSection {...vm.filters} />
            <GenericCrudView crud={vm.table} columns={vm.columns} />
        </div>
    );
}
```

### ViewModel (Orchestrator)

```typescript
export function useSubModuleViewModel() {
    const statistics = useStatisticsViewModel();
    const filters = useFilterViewModel();
    const table = useCrudViewModel(config);
    const columns = [...]; // Defined here
    return { statistics, filters, table, columns };
}
```

### Data Flow

```
View → ViewModel → Repository → API Service → Backend
  ↑         ↑                        ↓
  └─ JSX    └─ TanStack Query   Response DTO
                  hooks               ↓
                                   Mapper
                                      ↓
                                   Entity
```

---

## Route Registration

Each sub-module is connected to the app router via `src/app/(modules)/`:

```
src/app/(modules)/
├── admins/page.tsx          → AdminManagementView
├── analytics/page.tsx       → AnalyticsView
├── audit/page.tsx           → AuditLogView
├── dashboard/page.tsx       → DashboardView
├── recycle-bin/page.tsx     → RecycleBinView
├── roles/page.tsx           → RoleListView
├── roles/[id]/page.tsx      → RoleDetailView
├── tenants/page.tsx         → TenantListView
├── tenants/[id]/page.tsx    → TenantDetailView
├── messaging/
│   ├── email-composer/page.tsx  → EmailComposerView
│   ├── templates/page.tsx       → MessageTemplatesView
│   ├── templates/[id]/page.tsx  → TemplateFormView
│   └── notifications/page.tsx   → NotificationSenderView
└── settings/
    ├── menus/page.tsx       → MenuManagementView
    ├── permissions/page.tsx → PermissionListView
    └── tenant/page.tsx      → TenantSettingsView
```

---

## Related Docs

- [Messaging Module](messaging-module.md) — Frontend messaging sub-modules
- [Backend — Admin Management](../../SCRIPE-Backend/docs/features/admin-management.md)
- [Backend — Role Management](../../SCRIPE-Backend/docs/features/role-management.md)
- [Backend — Permission System](../../SCRIPE-Backend/docs/features/permission-system.md)
- [Backend — Tenant Management](../../SCRIPE-Backend/docs/features/tenant-management.md)
- [Backend — Menu System](../../SCRIPE-Backend/docs/features/menu-system.md)
- [Backend — Messaging & Communication](../../SCRIPE-Backend/docs/messaging-communication-center.md)
- [Backend — Dashboard & Analytics](../../SCRIPE-Backend/docs/features/dashboard-analytics.md)
- [Backend — Audit Logging](../../SCRIPE-Backend/docs/features/audit-logging.md)
- [Backend — Recycle Bin](../../SCRIPE-Backend/docs/features/recycle-bin.md)
