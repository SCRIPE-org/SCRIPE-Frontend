import { describe, expect, it } from "vitest";
import {
  LandingTargetCatalog,
  WorkspaceGroup,
  buildStructuredLandingTargetOptions,
  buildWorkspaceScopedMenuOptions,
  formatLandingTargetLabel,
} from "@core/navigation";

const baseLabels = {
  defaultLabel: "Default (System Automatic)",
  overviewLabel: "Overview (/overview)",
  hubLabel: "Workspace Hub (/hub)",
  workspacePrefix: "Workspace:",
  menuPrefix: "Page:",
  unavailablePageLabel: "Unavailable page",
  systemGroupLabel: "General Destinations",
};

function makeUnhydratedWorkspace(
  key: string,
  overrides: Partial<ConstructorParameters<typeof WorkspaceGroup>[0]> = {}
) {
  return new WorkspaceGroup({
    workspaceId: `ws-${key}`,
    workspaceKey: key,
    workspaceNameEn: key.toUpperCase(),
    workspaceNameAr: key,
    workspaceIcon: "LayoutGrid",
    workspaceSortOrder: 10,
    colorHue: 145,
    colorChroma: 0.14,
    workspaceType: "Module",
    contextScope: "TenantOnly",
    menuItems: [],
    isLocked: false,
    homeRoute: `/${key}`,
    platformHomeRoute: null,
    effectiveHomeRoute: `/${key}`,
    isPinned: false,
    pinSortOrder: null,
    accessibleItemCount: 3,
    ...overrides,
  });
}

describe("landing-target-options — lazy catalog merging, scope filtering, and unavailable formatting", () => {
  it("populates all unlocked workspaces' menu:<slug> options from lazy catalog even when workspaceGroups are unhydrated", () => {
    const workspaceGroups = [
      makeUnhydratedWorkspace("crm", {
        workspaceNameEn: "CRM",
        workspaceNameAr: "إدارة علاقات العملاء",
        workspaceSortOrder: 1,
      }),
      makeUnhydratedWorkspace("venue", {
        workspaceNameEn: "Venue",
        workspaceNameAr: "المرافق",
        workspaceSortOrder: 2,
      }),
      makeUnhydratedWorkspace("locked-academy", {
        workspaceNameEn: "Academy",
        workspaceSortOrder: 3,
        isLocked: true,
      }),
    ];

    const catalog = new LandingTargetCatalog({
      scopeMode: "current_context",
      contextKey: "tenant:ahly",
      overviewAuthorized: true,
      workspaces: [
        {
          workspaceKey: "crm",
          workspaceNameEn: "CRM",
          workspaceNameAr: "إدارة علاقات العملاء",
          workspaceIcon: "LayoutGrid",
          workspaceSortOrder: 1,
          workspaceType: "Module",
          contextScope: "TenantOnly",
          effectiveHomeRoute: "/crm",
        },
        {
          workspaceKey: "venue",
          workspaceNameEn: "Venue",
          workspaceNameAr: "المرافق",
          workspaceIcon: "Building2",
          workspaceSortOrder: 2,
          workspaceType: "Module",
          contextScope: "TenantOnly",
          effectiveHomeRoute: "/venue",
        },
        {
          workspaceKey: "locked-academy",
          workspaceNameEn: "Academy",
          workspaceNameAr: "الأكاديمية",
          workspaceIcon: "GraduationCap",
          workspaceSortOrder: 3,
          workspaceType: "Module",
          contextScope: "TenantOnly",
          effectiveHomeRoute: "/academy",
        },
      ],
      items: [
        {
          workspaceKey: "crm",
          workspaceNameEn: "CRM",
          workspaceNameAr: "إدارة علاقات العملاء",
          contextScope: "TenantOnly",
          slug: "crm-leads",
          nameEn: "Leads",
          nameAr: "العملاء المحتملون",
          route: "/crm/leads",
          breadcrumbEn: ["CRM Operations", "Leads"],
          breadcrumbAr: ["عمليات إدارة العملاء", "العملاء المحتملون"],
        },
        {
          workspaceKey: "venue",
          workspaceNameEn: "Venue",
          workspaceNameAr: "المرافق",
          contextScope: "TenantOnly",
          slug: "venue-calendar",
          nameEn: "Calendar",
          nameAr: "التقويم",
          route: "/venue/calendar",
          breadcrumbEn: ["Scheduling", "Calendar"],
          breadcrumbAr: ["الجدولة", "التقويم"],
        },
        {
          workspaceKey: "locked-academy",
          workspaceNameEn: "Academy",
          workspaceNameAr: "الأكاديمية",
          contextScope: "TenantOnly",
          slug: "academy-athletes",
          nameEn: "Athletes",
          nameAr: "الرياضيون",
          route: "/academy/athletes",
          breadcrumbEn: ["Athletes"],
          breadcrumbAr: ["الرياضيون"],
        },
      ],
    });

    const opts = buildStructuredLandingTargetOptions({
      language: "en",
      workspaceGroups,
      catalog,
      scopeMode: "current_context",
      labels: baseLabels,
    });

    expect(opts.map((o) => o.value)).toEqual([
      "default",
      "overview",
      "hub",
      "workspace:crm",
      "menu:crm-leads",
      "workspace:venue",
      "menu:venue-calendar",
    ]);

    const crmLead = opts.find((o) => o.value === "menu:crm-leads");
    expect(crmLead).toMatchObject({
      groupKey: "workspace:crm",
      groupLabel: "CRM",
      pathSegments: ["CRM", "CRM Operations", "Leads"],
      route: "/crm/leads",
      kind: "menu",
    });

    const venueCalendar = opts.find((o) => o.value === "menu:venue-calendar");
    expect(venueCalendar).toMatchObject({
      groupKey: "workspace:venue",
      groupLabel: "Venue",
      pathSegments: ["Venue", "Scheduling", "Calendar"],
      route: "/venue/calendar",
      kind: "menu",
    });
  });

  it("replaces raw menu:<slug> unhydrated/revoked tokens with localized Unavailable page label", () => {
    const arLabels = {
      ...baseLabels,
      menuPrefix: "صفحة:",
      unavailablePageLabel: "صفحة غير متاحة",
    };

    const opts = buildStructuredLandingTargetOptions({
      language: "en",
      workspaceGroups: [makeUnhydratedWorkspace("crm")],
      scopeMode: "current_context",
      currentTarget: "menu:retired-crm-slug",
      labels: baseLabels,
    });

    const fallbackOpt = opts.find((o) => o.value === "menu:retired-crm-slug");
    expect(fallbackOpt).toBeDefined();
    expect(fallbackOpt?.label).toBe("Unavailable page");
    expect(fallbackOpt?.isUnavailable).toBe(true);
    expect(fallbackOpt?.label).not.toContain("menu:retired-crm-slug");

    expect(
      formatLandingTargetLabel({
        target: "menu:retired-crm-slug",
        language: "ar",
        workspaceGroups: [],
        labels: arLabels,
      })
    ).toBe("صفحة غير متاحة");
  });

  it("omits overview when catalog marks overviewAuthorized=false and enforces platform_role scope", () => {
    const catalog = new LandingTargetCatalog({
      scopeMode: "platform_role",
      contextKey: "platform",
      overviewAuthorized: false,
      workspaces: [
        {
          workspaceKey: "admin",
          workspaceNameEn: "Admin",
          workspaceNameAr: "الإدارة",
          workspaceIcon: "Shield",
          workspaceSortOrder: 1,
          workspaceType: "Admin",
          contextScope: "Both",
          effectiveHomeRoute: "/tenants",
        },
        {
          workspaceKey: "crm",
          workspaceNameEn: "CRM",
          workspaceNameAr: "المبيعات",
          workspaceIcon: "LayoutGrid",
          workspaceSortOrder: 2,
          workspaceType: "Module",
          contextScope: "TenantOnly",
          effectiveHomeRoute: "/crm",
        },
      ],
      items: [
        {
          workspaceKey: "admin",
          workspaceNameEn: "Admin",
          workspaceNameAr: "الإدارة",
          contextScope: "PlatformOnly",
          slug: "tenants",
          nameEn: "Tenants",
          nameAr: "المستأجرون",
          route: "/tenants",
          breadcrumbEn: ["Control Plane", "Tenants"],
          breadcrumbAr: ["لوحة التحكم", "المستأجرون"],
        },
        {
          workspaceKey: "crm",
          workspaceNameEn: "CRM",
          workspaceNameAr: "المبيعات",
          contextScope: "TenantOnly",
          slug: "crm-leads",
          nameEn: "Leads",
          nameAr: "العملاء",
          route: "/crm/leads",
          breadcrumbEn: ["Leads"],
          breadcrumbAr: ["العملاء"],
        },
      ],
    });

    const opts = buildStructuredLandingTargetOptions({
      language: "en",
      workspaceGroups: [],
      catalog,
      scopeMode: "platform_role",
      labels: baseLabels,
    }).map((o) => o.value);

    expect(opts).toEqual(["default", "hub", "workspace:admin", "menu:tenants"]);
    expect(opts).not.toContain("overview");
    expect(opts).not.toContain("workspace:crm");
    expect(opts).not.toContain("menu:crm-leads");
  });

  it("appends leaf nameEn/nameAr when backend breadcrumbs contain ancestors only (EN & AR) without duplicating", () => {
    const arLabels = {
      ...baseLabels,
      workspacePrefix: "مساحة العمل:",
      menuPrefix: "صفحة:",
      unavailablePageLabel: "صفحة غير متاحة",
      systemGroupLabel: "الوجهات العامة",
    };

    const catalog = new LandingTargetCatalog({
      scopeMode: "current_context",
      contextKey: "tenant:ahly",
      overviewAuthorized: true,
      workspaces: [
        {
          workspaceKey: "crm",
          workspaceNameEn: "CRM",
          workspaceNameAr: "إدارة علاقات العملاء",
          workspaceIcon: "LayoutGrid",
          workspaceSortOrder: 1,
          workspaceType: "Module",
          contextScope: "TenantOnly",
          effectiveHomeRoute: "/crm",
        },
      ],
      items: [
        {
          workspaceKey: "crm",
          workspaceNameEn: "CRM",
          workspaceNameAr: "إدارة علاقات العملاء",
          contextScope: "TenantOnly",
          slug: "crm-leads",
          nameEn: "Leads",
          nameAr: "العملاء المحتملون",
          route: "/crm/leads",
          breadcrumbEn: ["CRM Operations"],
          breadcrumbAr: ["عمليات إدارة العملاء"],
        },
        {
          workspaceKey: "crm",
          workspaceNameEn: "CRM",
          workspaceNameAr: "إدارة علاقات العملاء",
          contextScope: "TenantOnly",
          slug: "crm-pipeline",
          nameEn: "Pipeline",
          nameAr: "مسار المبيعات",
          route: "/crm/pipeline",
          breadcrumbEn: ["CRM Operations"],
          breadcrumbAr: ["عمليات إدارة العملاء"],
        },
        {
          workspaceKey: "crm",
          workspaceNameEn: "CRM",
          workspaceNameAr: "إدارة علاقات العملاء",
          contextScope: "TenantOnly",
          slug: "crm-calendar",
          nameEn: "Calendar",
          nameAr: "التقويم",
          route: "/crm/calendar",
          breadcrumbEn: ["Scheduling", "Calendar"],
          breadcrumbAr: ["الجدولة", "التقويم"],
        },
      ],
    });

    const enOpts = buildStructuredLandingTargetOptions({
      language: "en",
      workspaceGroups: [],
      catalog,
      scopeMode: "current_context",
      labels: baseLabels,
    });

    expect(enOpts.find((o) => o.value === "menu:crm-leads")).toMatchObject({
      label: "Page: CRM / CRM Operations / Leads",
      pathSegments: ["CRM", "CRM Operations", "Leads"],
    });
    expect(enOpts.find((o) => o.value === "menu:crm-pipeline")).toMatchObject({
      label: "Page: CRM / CRM Operations / Pipeline",
      pathSegments: ["CRM", "CRM Operations", "Pipeline"],
    });
    expect(enOpts.find((o) => o.value === "menu:crm-calendar")).toMatchObject({
      label: "Page: CRM / Scheduling / Calendar",
      pathSegments: ["CRM", "Scheduling", "Calendar"],
    });

    const arOpts = buildStructuredLandingTargetOptions({
      language: "ar",
      workspaceGroups: [],
      catalog,
      scopeMode: "current_context",
      labels: arLabels,
    });

    expect(arOpts.find((o) => o.value === "menu:crm-leads")).toMatchObject({
      label: "صفحة: إدارة علاقات العملاء / عمليات إدارة العملاء / العملاء المحتملون",
      pathSegments: ["إدارة علاقات العملاء", "عمليات إدارة العملاء", "العملاء المحتملون"],
    });

    expect(
      formatLandingTargetLabel({
        target: "menu:crm-leads",
        language: "en",
        workspaceGroups: [],
        catalog,
        labels: baseLabels,
      })
    ).toBe("Page: CRM / CRM Operations / Leads");
  });

  it("never re-injects an incompatible Module/Both workspace via catalog.items fallback under platform_role", () => {
    const catalog = new LandingTargetCatalog({
      scopeMode: "platform_role",
      contextKey: "platform",
      overviewAuthorized: true,
      workspaces: [
        {
          workspaceKey: "admin",
          workspaceNameEn: "Admin",
          workspaceNameAr: "الإدارة",
          workspaceIcon: "Shield",
          workspaceSortOrder: 1,
          workspaceType: "Admin",
          contextScope: "Both",
          effectiveHomeRoute: "/tenants",
        },
        {
          workspaceKey: "crm",
          workspaceNameEn: "CRM",
          workspaceNameAr: "المبيعات",
          workspaceIcon: "LayoutGrid",
          workspaceSortOrder: 2,
          workspaceType: "Module",
          contextScope: "Both",
          effectiveHomeRoute: "/crm",
        },
      ],
      items: [
        {
          workspaceKey: "admin",
          workspaceNameEn: "Admin",
          workspaceNameAr: "الإدارة",
          contextScope: "Both",
          slug: "audit-logs",
          nameEn: "Audit Logs",
          nameAr: "سجلات التدقيق",
          route: "/audit-logs",
          breadcrumbEn: ["Security"],
          breadcrumbAr: ["الأمان"],
        },
        {
          workspaceKey: "crm",
          workspaceNameEn: "CRM",
          workspaceNameAr: "المبيعات",
          contextScope: "Both",
          slug: "crm-reports",
          nameEn: "Reports",
          nameAr: "التقارير",
          route: "/crm/reports",
          breadcrumbEn: ["Analytics"],
          breadcrumbAr: ["التحليلات"],
        },
      ],
    });

    const opts = buildStructuredLandingTargetOptions({
      language: "en",
      workspaceGroups: [
        makeUnhydratedWorkspace("crm", {
          workspaceType: "Module",
          contextScope: "Both",
        }),
      ],
      catalog,
      scopeMode: "platform_role",
      labels: baseLabels,
    }).map((o) => o.value);

    expect(opts).toEqual(["default", "overview", "hub", "workspace:admin", "menu:audit-logs"]);
    expect(opts).not.toContain("workspace:crm");
    expect(opts).not.toContain("menu:crm-reports");
  });

  it("buildWorkspaceScopedMenuOptions() returns only valid menu:<slug> options inside the requested workspace", () => {
    const catalog = new LandingTargetCatalog({
      scopeMode: "tenant_role",
      contextKey: "tenant:ahly",
      overviewAuthorized: true,
      workspaces: [
        {
          workspaceKey: "crm",
          workspaceNameEn: "CRM",
          workspaceNameAr: "المبيعات",
          workspaceIcon: "LayoutGrid",
          workspaceSortOrder: 1,
          workspaceType: "Module",
          contextScope: "TenantOnly",
          effectiveHomeRoute: "/crm/leads",
        },
        {
          workspaceKey: "venue",
          workspaceNameEn: "Venue",
          workspaceNameAr: "المرافق",
          workspaceIcon: "Building2",
          workspaceSortOrder: 2,
          workspaceType: "Module",
          contextScope: "TenantOnly",
          effectiveHomeRoute: "/venue/calendar",
        },
      ],
      items: [
        {
          workspaceKey: "crm",
          workspaceNameEn: "CRM",
          workspaceNameAr: "المبيعات",
          contextScope: "TenantOnly",
          slug: "crm-leads",
          nameEn: "Leads",
          nameAr: "العملاء",
          route: "/crm/leads",
          breadcrumbEn: ["Operations"],
          breadcrumbAr: ["العمليات"],
        },
        {
          workspaceKey: "venue",
          workspaceNameEn: "Venue",
          workspaceNameAr: "المرافق",
          contextScope: "TenantOnly",
          slug: "venue-calendar",
          nameEn: "Calendar",
          nameAr: "التقويم",
          route: "/venue/calendar",
          breadcrumbEn: ["Scheduling"],
          breadcrumbAr: ["الجدولة"],
        },
      ],
    });

    const crmScoped = buildWorkspaceScopedMenuOptions({
      workspaceKey: "crm",
      language: "en",
      workspaceGroups: [],
      catalog,
      scopeMode: "tenant_role",
      labels: baseLabels,
    });

    expect(crmScoped.map((o) => o.value)).toEqual(["menu:crm-leads"]);
    expect(crmScoped[0]?.displayPrefix).toBeUndefined();
    expect(crmScoped[0]?.pathSegments).toEqual(["Operations", "Leads"]);
    expect(crmScoped[0]?.label).toBe("Operations / Leads");
  });

  it("keeps menu:overview deduplicated in top-level options while including it cleanly in Administration workspace-scoped pickers", () => {
    const adminCatalog = new LandingTargetCatalog({
      scopeMode: "current_context",
      contextKey: "tenant:ahly",
      overviewAuthorized: true,
      workspaces: [
        {
          workspaceKey: "admin",
          workspaceNameEn: "Administration",
          workspaceNameAr: "الإدارة",
          workspaceIcon: "Shield",
          workspaceSortOrder: 0,
          workspaceType: "Admin",
          contextScope: "Both",
          effectiveHomeRoute: "/overview",
        },
      ],
      items: [
        {
          workspaceKey: "admin",
          workspaceNameEn: "Administration",
          workspaceNameAr: "الإدارة",
          contextScope: "Both",
          slug: "overview",
          nameEn: "Overview",
          nameAr: "نظرة عامة",
          route: "/overview",
          breadcrumbEn: [],
          breadcrumbAr: [],
        },
        {
          workspaceKey: "admin",
          workspaceNameEn: "Administration",
          workspaceNameAr: "الإدارة",
          contextScope: "Both",
          slug: "users",
          nameEn: "Users",
          nameAr: "المستخدمون",
          route: "/users",
          breadcrumbEn: ["Management"],
          breadcrumbAr: ["الإدارة"],
        },
      ],
    });

    const topLevel = buildStructuredLandingTargetOptions({
      language: "en",
      workspaceGroups: [],
      catalog: adminCatalog,
      scopeMode: "current_context",
      labels: baseLabels,
    });
    expect(topLevel.map((o) => o.value)).not.toContain("menu:overview");

    const adminScoped = buildWorkspaceScopedMenuOptions({
      workspaceKey: "admin",
      language: "en",
      workspaceGroups: [],
      catalog: adminCatalog,
      scopeMode: "current_context",
      currentTarget: "menu:overview",
      labels: baseLabels,
    });
    expect(adminScoped.map((o) => o.value)).toEqual(["menu:overview", "menu:users"]);
    expect(adminScoped.some((o) => o.isUnavailable)).toBe(false);
    expect(adminScoped[0]).toMatchObject({
      value: "menu:overview",
      label: "Overview",
      pathSegments: ["Overview"],
      route: "/overview",
    });
  });
});
