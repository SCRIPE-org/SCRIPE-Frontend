import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "apiReference.systemApi.intro" },

  // ─── Dashboard ────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.systemApi.dashboardTitle",
    id: "dashboard",
  },
  { type: "paragraph", contentKey: "apiReference.systemApi.dashboardIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/dashboard/summary",
        descriptionKey: "apiReference.systemApi.summaryDesc",
        auth: "dashboard.view",
      },
      {
        method: "GET",
        path: "/api/v1/dashboard/login-activity",
        descriptionKey: "apiReference.systemApi.loginActivityDesc",
        auth: "dashboard.view",
      },
      {
        method: "GET",
        path: "/api/v1/dashboard/recent-changes",
        descriptionKey: "apiReference.systemApi.recentChangesDesc",
        auth: "dashboard.view",
      },
      {
        method: "GET",
        path: "/api/v1/dashboard/event-distribution",
        descriptionKey: "apiReference.systemApi.eventDistDesc",
        auth: "dashboard.view",
      },
      {
        method: "GET",
        path: "/api/v1/dashboard/security-events",
        descriptionKey: "apiReference.systemApi.securityEventsDesc",
        auth: "dashboard.view",
      },
      {
        method: "GET",
        path: "/api/v1/dashboard/top-blocked-ips",
        descriptionKey: "apiReference.systemApi.blockedIpsDesc",
        auth: "dashboard.view",
      },
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "KPI Summary",
        language: "json",
        filename: "GET /dashboard/summary — Response",
        code: `{
  "totalAdmins": 25,
  "activeAdmins": 22,
  "totalUsers": 1500,
  "activeUsers": 1340,
  "totalTenants": 8,
  "activeTenants": 7,
  "totalRoles": 12,
  "todayLogins": 45,
  "failedLoginsToday": 3,
  "storageUsedMB": 2400,
  "pendingNotifications": 12
}`,
      },
      {
        label: "Login Activity",
        language: "json",
        filename: "GET /dashboard/login-activity?period=7d",
        code: `{
  "period": "7d",
  "data": [
    { "date": "2026-02-14", "successful": 42, "failed": 2 },
    { "date": "2026-02-15", "successful": 38, "failed": 0 },
    { "date": "2026-02-16", "successful": 55, "failed": 5 },
    { "date": "2026-02-17", "successful": 61, "failed": 1 },
    { "date": "2026-02-18", "successful": 44, "failed": 3 },
    { "date": "2026-02-19", "successful": 50, "failed": 2 },
    { "date": "2026-02-20", "successful": 33, "failed": 0 }
  ]
}`,
      },
      {
        label: "Security Events",
        language: "json",
        filename: "GET /dashboard/security-events",
        code: `{
  "threats": 12,
  "failedLogins": 15,
  "blockedIPs": 3,
  "suspiciousActivities": 2,
  "events": [
    {
      "type": "brute_force_detected",
      "ip": "192.168.1.100",
      "attempts": 25,
      "timestamp": "2026-02-20T10:15:00Z"
    },
    {
      "type": "account_locked",
      "userId": "user-uuid",
      "email": "user@example.com",
      "timestamp": "2026-02-20T11:30:00Z"
    }
  ]
}`,
      },
    ],
  },

  // ─── Dashboard Export ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.systemApi.dashboardExportTitle",
    id: "dashboard-export",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/dashboard/export/overview",
        descriptionKey: "apiReference.systemApi.exportOverviewDesc",
        auth: "dashboard.export",
      },
      {
        method: "GET",
        path: "/api/v1/dashboard/export/analytics",
        descriptionKey: "apiReference.systemApi.exportAnalyticsDesc",
        auth: "dashboard.export",
      },
      {
        method: "GET",
        path: "/api/v1/dashboard/export/security",
        descriptionKey: "apiReference.systemApi.exportSecurityDesc",
        auth: "dashboard.export",
      },
    ],
  },
  {
    type: "table",
    headers: ["Parameter", "Values", "Description"],
    rows: [
      ["format", "csv, excel, pdf", "Export file format"],
      ["period", "7d, 30d, 90d, 1y", "Date range for data"],
      ["includeCharts", "true/false", "Include chart images (PDF only)"],
    ],
  },

  // ─── Menu Management ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.systemApi.menuTitle",
    id: "menus",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/menus",
        descriptionKey: "apiReference.systemApi.listMenusDesc",
        auth: "menus.view",
      },
      {
        method: "GET",
        path: "/api/v1/menus/my-menu",
        descriptionKey: "apiReference.systemApi.myMenuDesc",
        auth: "Bearer Token",
      },
      {
        method: "POST",
        path: "/api/v1/menus",
        descriptionKey: "apiReference.systemApi.createMenuDesc",
        auth: "menus.create",
      },
      {
        method: "PUT",
        path: "/api/v1/menus/{id}",
        descriptionKey: "apiReference.systemApi.updateMenuDesc",
        auth: "menus.update",
      },
      {
        method: "DELETE",
        path: "/api/v1/menus/{id}",
        descriptionKey: "apiReference.systemApi.deleteMenuDesc",
        auth: "menus.delete",
      },
      {
        method: "PUT",
        path: "/api/v1/menus/reorder",
        descriptionKey: "apiReference.systemApi.reorderMenuDesc",
        auth: "menus.update",
      },
      {
        method: "PUT",
        path: "/api/v1/menus/{id}/role-visibility",
        descriptionKey: "apiReference.systemApi.roleVisibilityDesc",
        auth: "menus.update",
      },
      {
        method: "PUT",
        path: "/api/v1/menus/{id}/tenant-override",
        descriptionKey: "apiReference.systemApi.tenantOverrideDesc",
        auth: "menus.update",
      },
      {
        method: "GET",
        path: "/api/v1/menus/my-overrides",
        descriptionKey: "apiReference.systemApi.myOverridesDesc",
        auth: "Bearer Token",
      },
    ],
  },
  {
    type: "code",
    language: "json",
    filename: "GET /menus/my-menu — Personalized Menu Tree",
    code: `[
  {
    "id": "menu-1",
    "title": "Dashboard",
    "icon": "LayoutDashboard",
    "path": "/dashboard",
    "order": 1,
    "children": []
  },
  {
    "id": "menu-2",
    "title": "User Management",
    "icon": "Users",
    "path": null,
    "order": 2,
    "children": [
      { "id": "menu-3", "title": "Users", "path": "/users", "order": 1 },
      { "id": "menu-4", "title": "Roles", "path": "/roles", "order": 2 }
    ]
  }
]`,
  },

  // ─── Recycle Bin ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.systemApi.recycleBinTitle",
    id: "recycle-bin",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/recycle-bin",
        descriptionKey: "apiReference.systemApi.listDeletedDesc",
        auth: "recyclebin.view",
      },
      {
        method: "POST",
        path: "/api/v1/recycle-bin/{id}/restore",
        descriptionKey: "apiReference.systemApi.restoreDesc",
        auth: "recyclebin.restore",
      },
      {
        method: "DELETE",
        path: "/api/v1/recycle-bin/{id}",
        descriptionKey: "apiReference.systemApi.purgeDesc",
        auth: "recyclebin.purge",
      },
    ],
  },
  {
    type: "code",
    language: "json",
    filename: "GET /recycle-bin — Deleted Items",
    code: `{
  "items": [
    {
      "id": "entity-uuid",
      "entityType": "Admin",
      "displayName": "John Doe (john@acme.com)",
      "deletedBy": "SuperAdmin",
      "deletedAt": "2026-02-19T14:30:00Z",
      "canRestore": true
    }
  ],
  "totalCount": 5
}`,
  },

  // ─── File Management ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.systemApi.filesTitle",
    id: "files",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/files/upload",
        descriptionKey: "apiReference.systemApi.uploadDesc",
        auth: "Bearer Token",
      },
      {
        method: "GET",
        path: "/api/v1/files/{id}",
        descriptionKey: "apiReference.systemApi.downloadDesc",
        auth: "Bearer Token",
      },
      {
        method: "DELETE",
        path: "/api/v1/files/{id}",
        descriptionKey: "apiReference.systemApi.deleteFileDesc",
        auth: "files.delete",
      },
    ],
  },
  {
    type: "table",
    headers: ["Constraint", "Value"],
    rows: [
      ["Max file size", "10 MB (configurable)"],
      ["Max image dimensions", "4096 x 4096 px"],
      ["Allowed image types", "jpg, jpeg, png, gif, webp, svg"],
      ["Allowed document types", "pdf, doc, docx, xls, xlsx, csv"],
      ["Avatar max size", "2 MB"],
      ["Tenant logo max size", "5 MB"],
      ["Storage providers", "Local, Azure Blob, AWS S3, MinIO"],
    ],
  },

  // ─── Settings ─────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.systemApi.settingsTitle",
    id: "settings",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/settings",
        descriptionKey: "apiReference.systemApi.getSettingsDesc",
        auth: "settings.view",
      },
      {
        method: "PUT",
        path: "/api/v1/settings",
        descriptionKey: "apiReference.systemApi.updateSettingsDesc",
        auth: "settings.update",
      },
      {
        method: "POST",
        path: "/api/v1/settings/reset",
        descriptionKey: "apiReference.systemApi.resetSettingsDesc",
        auth: "settings.update",
      },
    ],
  },

  // ─── Health Checks ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.systemApi.healthTitle",
    id: "health",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/health",
        descriptionKey: "apiReference.systemApi.healthCheckDesc",
        auth: "None",
      },
      {
        method: "GET",
        path: "/health/ready",
        descriptionKey: "apiReference.systemApi.readinessDesc",
        auth: "None",
      },
    ],
  },
  {
    type: "code",
    language: "json",
    filename: "GET /health — Response",
    code: `{
  "status": "Healthy",
  "totalDuration": "00:00:00.1234567",
  "entries": {
    "database": { "status": "Healthy", "duration": "00:00:00.0521" },
    "cache": { "status": "Healthy", "duration": "00:00:00.0012" },
    "blob-storage": { "status": "Healthy", "duration": "00:00:00.0345" },
    "hangfire": { "status": "Healthy", "duration": "00:00:00.0089" }
  }
}`,
  },
];

registerPage({
  slug: "api-reference/system-api",
  titleKey: "apiReference.systemApi.title",
  descriptionKey: "apiReference.systemApi.description",
  category: "api-reference",
  order: 8,
  sections,
  relatedSlugs: [
    "api-reference/admin-api",
    "security/audit-compliance",
    "api-reference/webhook-email-api",
  ],
  lastUpdated: "2026-02-20",
});
