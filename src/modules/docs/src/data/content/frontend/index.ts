import { registerPage } from "../../repositories/DocsRepository";
import type { DocPageData } from "../../../domain/entities/DocPage";

function frontendPage(
  slug: string,
  key: string,
  order: number,
  sections: DocPageData["sections"],
  related: string[] = []
): void {
  registerPage({
    slug: `frontend/${slug}`,
    titleKey: `frontend.${key}.title`,
    descriptionKey: `frontend.${key}.description`,
    category: "frontend",
    order,
    relatedSlugs: related,
    sections,
  });
}

// ─── Auth Module ──────────────
frontendPage(
  "auth-module",
  "authModule",
  1,
  [
    { type: "paragraph", contentKey: "frontend.authModule.description" },
    {
      type: "code",
      language: "text",
      filename: "Auth Module Structure",
      code: `modules/auth/
├── di.ts
├── index.ts
└── src/
    ├── domain/entities/User.ts
    ├── domain/interfaces/IAuthRepository.ts
    ├── data/repositories/AuthRepository.ts
    └── presentation/
        ├── viewmodels/useLoginViewModel.ts
        ├── views/LoginView.tsx
        └── components/LoginForm.tsx`,
    },
    { type: "info", variant: "tip", contentKey: "frontend.authModule.description" },
  ],
  ["features/authentication", "architecture/solid-pattern"]
);

// ─── Profile Module ──────────────
frontendPage(
  "profile-module",
  "profileModule",
  2,
  [
    { type: "paragraph", contentKey: "frontend.profileModule.description" },
    {
      type: "list",
      variant: "unordered",
      items: [
        "Profile header with avatar and stats",
        "Personal information form (editable)",
        "Password change with validation",
        "2FA toggle and setup",
        "Active sessions list with revoke capability",
      ],
    },
  ],
  ["features/profile-management"]
);

// ─── System Module ──────────────
frontendPage(
  "system-module",
  "systemModule",
  3,
  [
    { type: "paragraph", contentKey: "frontend.systemModule.description" },
    {
      type: "table",
      headers: ["Sub-Module", "Path", "Description"],
      rows: [
        ["Dashboard", "/admin/dashboard", "KPIs, charts, recent activity"],
        ["User Management", "/admin/user-management", "CRUD for admin users"],
        ["Role Management", "/admin/role-management", "Roles + permission assignment"],
        ["Tenant Management", "/admin/tenant-management", "Multi-tenant administration"],
        ["Menu Management", "/admin/menu-management", "Dynamic menu builder"],
        ["Audit Logs", "/admin/audit-logs", "System activity viewer"],
      ],
    },
  ],
  ["features/admin-management", "features/dashboard-analytics"]
);

// ─── CRUD Engine ──────────────
frontendPage(
  "crud-engine",
  "crudEngine",
  4,
  [
    { type: "paragraph", contentKey: "frontend.crudEngine.description" },
    {
      type: "code",
      language: "typescript",
      filename: "Column Helpers",
      code: `// Available column helpers
column.index('No')                              // Row number
column.text('name', 'Name')                     // Text display
column.date('createdAt', 'Date', { locale })    // Formatted date
column.status('status', 'Status', statusMap)    // Status badge
column.switch('block', 'Block', { ... })        // Toggle switch
column.link('email', 'Email', { type: 'email' })// Clickable link
column.custom('any', 'Header', renderFn)        // Custom renderer`,
    },
    {
      type: "code",
      language: "typescript",
      filename: "GenericCrudView Usage",
      code: `// In your ViewModel
const crud = useCrudViewModel({
  queryKey: ['products'],
  repository: container.productRepository,
  formSchema: productFormSchema,
});

// In your View
<GenericCrudView
  {...crud}
  columns={columns}
  title="Products"
  createLabel="Add Product"
/>`,
    },
    { type: "info", variant: "tip", contentKey: "frontend.crudEngine.description" },
  ],
  ["architecture/solid-pattern", "tutorials/first-frontend-module"]
);
