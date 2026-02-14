import { registerPage } from "../../repositories/DocsRepository";
import type { DocPageData } from "../../../domain/entities/DocPage";

// Helper for creating simple feature pages with consistent structure
function featurePage(
  slug: string,
  key: string,
  order: number,
  sections: DocPageData["sections"],
  related: string[] = []
): void {
  registerPage({
    slug: `features/${slug}`,
    titleKey: `features.${key}.title`,
    descriptionKey: `features.${key}.description`,
    category: "features",
    order,
    relatedSlugs: related,
    sections,
  });
}

// ─── Authentication ──────────────
featurePage(
  "authentication",
  "authentication",
  1,
  [
    { type: "paragraph", contentKey: "features.authentication.description" },
    {
      type: "flowchart",
      title: "Login Flow",
      direction: "vertical",
      nodes: [
        { id: "credentials", label: "User Credentials", type: "default" },
        { id: "validate", label: "Validate User", type: "info" },
        { id: "check2fa", label: "2FA Enabled?", type: "warning" },
        { id: "generate", label: "Generate JWT + Refresh", type: "success" },
        { id: "cache", label: "Cache Permissions", type: "primary" },
      ],
      connections: [
        { from: "credentials", to: "validate", label: "POST /auth/login" },
        { from: "validate", to: "check2fa", label: "Valid ✓" },
        { from: "check2fa", to: "generate", label: "No / Verified" },
        { from: "generate", to: "cache", label: "Server-side" },
      ],
    },
    { type: "info", variant: "note", contentKey: "features.authentication.description" },
  ],
  ["features/two-factor-auth", "features/session-management"]
);

// ─── Two-Factor Auth ──────────────
featurePage(
  "two-factor-auth",
  "twoFactorAuth",
  2,
  [
    { type: "paragraph", contentKey: "features.twoFactorAuth.description" },
    {
      type: "table",
      headers: ["Feature", "Details"],
      rows: [
        ["Method", "Email-based OTP"],
        ["Code Length", "6 digits"],
        ["Expiry", "5 minutes"],
        ["Attempts", "Max 3 before lockout"],
      ],
    },
    { type: "info", variant: "tip", contentKey: "features.twoFactorAuth.description" },
  ],
  ["features/authentication", "security/tokens"]
);

// ─── Session Management ──────────────
featurePage(
  "session-management",
  "sessionManagement",
  3,
  [
    { type: "paragraph", contentKey: "features.sessionManagement.description" },
    {
      type: "table",
      headers: ["Token", "Purpose", "Lifetime"],
      rows: [
        ["Access Token (JWT)", "API authentication", "15 minutes"],
        ["Refresh Token", "Renew access token", "7 days"],
        ["2FA Token", "Temporary 2FA session", "5 minutes"],
      ],
    },
    {
      type: "code",
      language: "typescript",
      filename: "Token Refresh Pattern",
      code: `// Automatic refresh via API interceptor
apiService.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const newToken = await refreshToken();
      error.config.headers.Authorization = \`Bearer \${newToken}\`;
      return apiService(error.config);
    }
    return Promise.reject(error);
  }
);`,
    },
  ],
  ["features/authentication", "security/tokens"]
);

// ─── Profile Management ──────────────
featurePage(
  "profile-management",
  "profileManagement",
  4,
  [
    { type: "paragraph", contentKey: "features.profileManagement.description" },
    {
      type: "list",
      variant: "unordered",
      items: [
        "View and edit personal information",
        "Change password with current password validation",
        "Upload profile picture",
        "Enable/disable two-factor authentication",
        "View login history and active sessions",
      ],
    },
    { type: "info", variant: "tip", contentKey: "features.profileManagement.description" },
  ],
  ["frontend/profile-module"]
);

// ─── Admin Management ──────────────
featurePage(
  "admin-management",
  "adminManagement",
  5,
  [
    { type: "paragraph", contentKey: "features.adminManagement.description" },
    {
      type: "table",
      headers: ["Action", "Permission", "Description"],
      rows: [
        ["View Admins", "Admins.View", "See list of all administrators"],
        ["Create Admin", "Admins.Create", "Add new administrator accounts"],
        ["Edit Admin", "Admins.Edit", "Modify admin details and roles"],
        ["Delete Admin", "Admins.Delete", "Soft-delete admin (recoverable)"],
        ["Block Admin", "Admins.Block", "Temporarily disable access"],
      ],
    },
  ],
  ["features/role-management", "api-reference/admin-management"]
);

// ─── Role Management ──────────────
featurePage(
  "role-management",
  "roleManagement",
  6,
  [
    { type: "paragraph", contentKey: "features.roleManagement.description" },
    {
      type: "flowchart",
      title: "Role Assignment Flow",
      direction: "vertical",
      nodes: [
        { id: "role", label: "Define Role", type: "primary" },
        { id: "perms", label: "Assign Permissions", type: "info" },
        { id: "fields", label: "Set Field Access", type: "warning" },
        { id: "assign", label: "Assign to Users", type: "success" },
      ],
      connections: [
        { from: "role", to: "perms" },
        { from: "perms", to: "fields" },
        { from: "fields", to: "assign" },
      ],
    },
    { type: "info", variant: "note", contentKey: "features.roleManagement.description" },
  ],
  ["features/permission-system", "security/rbac"]
);

// ─── Permission System ──────────────
featurePage(
  "permission-system",
  "permissionSystem",
  7,
  [
    { type: "paragraph", contentKey: "features.permissionSystem.description" },
    {
      type: "table",
      headers: ["Category", "Permissions"],
      rows: [
        ["Admins", "View, Create, Edit, Delete, Block, Export"],
        ["Roles", "View, Create, Edit, Delete, AssignPermissions"],
        ["Tenants", "View, Create, Edit, Delete, ManageSettings"],
        ["Menus", "View, Create, Edit, Delete"],
        ["Audit", "View, Export, Delete"],
        ["Settings", "View, Edit"],
      ],
    },
    { type: "info", variant: "warning", contentKey: "features.permissionSystem.description" },
  ],
  ["security/rbac", "security/field-level"]
);

// ─── Tenant Management ──────────────
featurePage(
  "tenant-management",
  "tenantManagement",
  8,
  [
    { type: "paragraph", contentKey: "features.tenantManagement.description" },
    {
      type: "table",
      headers: ["Feature", "Description"],
      rows: [
        ["Hierarchical Structure", "Parent/child tenant relationships"],
        ["Data Isolation", "Tenant-scoped queries via IsTenantScoped"],
        ["Custom Settings", "Per-tenant configuration (logo, name, etc.)"],
        ["User Pool", "Separate user management per tenant"],
        ["Permission Pool", "Tenant-specific permission allocation"],
      ],
    },
  ],
  ["api-reference/tenants"]
);

// ─── Menu System ──────────────
featurePage(
  "menu-system",
  "menuSystem",
  9,
  [
    { type: "paragraph", contentKey: "features.menuSystem.description" },
    {
      type: "table",
      headers: ["Property", "Type", "Description"],
      rows: [
        ["Name", "string", "Display label"],
        ["URL", "string?", "Navigation target"],
        ["Icon", "string?", "Lucide icon name"],
        ["ParentId", "Guid?", "For nested menus"],
        ["Order", "int", "Sort order"],
        ["RequiredPermission", "string?", "Permission-based visibility"],
      ],
    },
  ],
  ["api-reference/menus"]
);

// ─── Dashboard ──────────────
featurePage(
  "dashboard-analytics",
  "dashboardAnalytics",
  10,
  [
    { type: "paragraph", contentKey: "features.dashboardAnalytics.description" },
    {
      type: "list",
      variant: "unordered",
      items: [
        "KPI Cards — Total users, active sessions, recent signups, storage usage",
        "User Registration Chart — Line chart with daily/weekly/monthly views",
        "Tenant Distribution — Pie chart by tenant type",
        "Security Events — Recent auth failures, lockouts, 2FA triggers",
        "Audit Activity — Real-time log stream via SignalR",
        "Export — PDF/Excel reports for compliance",
      ],
    },
  ],
  ["frontend/system-module"]
);

// ─── Audit Logging ──────────────
featurePage(
  "audit-logging",
  "auditLogging",
  11,
  [
    { type: "paragraph", contentKey: "features.auditLogging.description" },
    {
      type: "flowchart",
      title: "Audit Sources",
      direction: "horizontal",
      nodes: [
        { id: "middleware", label: "Request Middleware", type: "info" },
        { id: "interceptor", label: "EF Interceptor", type: "success" },
        { id: "behavior", label: "Audit Behavior", type: "warning" },
        { id: "manual", label: "IAuditService", type: "danger" },
      ],
      connections: [
        { from: "middleware", to: "interceptor" },
        { from: "interceptor", to: "behavior" },
        { from: "behavior", to: "manual" },
      ],
    },
    {
      type: "table",
      headers: ["Source", "What It Logs"],
      rows: [
        ["RequestLoggingMiddleware", "All HTTP requests (method, path, status, duration)"],
        ["AuditableEntityInterceptor", "Entity CRUD (old/new values, field changes)"],
        ["AuditBehavior", "MediatR command execution details"],
        ["IAuditService.LogAsync()", "Custom security/business events"],
      ],
    },
  ],
  ["api-reference/audit"]
);

// ─── Recycle Bin ──────────────
featurePage(
  "recycle-bin",
  "recycleBin",
  12,
  [
    { type: "paragraph", contentKey: "features.recycleBin.description" },
    {
      type: "table",
      headers: ["Feature", "Description"],
      rows: [
        ["Soft Delete", "Records marked IsDeleted=true, not physically removed"],
        ["EF Global Filter", "HasQueryFilter(x => !x.IsDeleted) auto-excludes deleted"],
        ["Restore", "Admin can undelete records"],
        ["Permanent Delete", "Hard delete with audit trail"],
        ["Retention", "Configurable auto-purge after N days"],
      ],
    },
    { type: "info", variant: "note", contentKey: "features.recycleBin.description" },
  ],
  ["features/audit-logging"]
);

// ─── File Management ──────────────
featurePage(
  "file-management",
  "fileManagement",
  13,
  [
    { type: "paragraph", contentKey: "features.fileManagement.description" },
    {
      type: "table",
      headers: ["Feature", "Details"],
      rows: [
        ["Chunked Upload", "Large files split into configurable chunks"],
        ["Resumable Download", "Range headers for partial downloads"],
        ["ETag Validation", "Prevents unnecessary re-downloads"],
        ["Mime Detection", "Automatic content type detection"],
        ["Tenant Scoping", "Files isolated per tenant directory"],
      ],
    },
  ],
  ["infrastructure/database"]
);

// ─── User Authentication (Tenant-side) ──────────────
featurePage(
  "user-authentication",
  "userAuthentication",
  14,
  [
    { type: "paragraph", contentKey: "features.userAuthentication.description" },
    {
      type: "table",
      headers: ["Feature", "Admin Auth", "User Auth"],
      rows: [
        ["Endpoint", "/api/auth/admin/*", "/api/auth/user/*"],
        ["Tokens", "JWT + Refresh", "JWT + Refresh"],
        ["2FA", "✅ Supported", "✅ Supported"],
        ["Scope", "System-wide", "Tenant-scoped"],
        ["Permissions", "All categories", "Tenant-specific pool"],
      ],
    },
    { type: "info", variant: "note", contentKey: "features.userAuthentication.description" },
  ],
  ["features/authentication", "api-reference/user-auth"]
);
