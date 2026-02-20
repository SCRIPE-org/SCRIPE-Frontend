import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.dashboardAnalytics.intro" },
      { type: "heading", level: 2, titleKey: "commercial.dashboardAnalytics.kpiTitle", id: "kpi-cards" },
      {
            type: "table", headers: ["KPI", "Source", "Real-Time?"], rows: [
                  ["Total Admins", "Admin table count", "Yes (via DashboardHub)"],
                  ["Total Users", "User table count", "Yes"],
                  ["Total Tenants", "Tenant table count", "Yes"],
                  ["Total Roles", "Role table count", "Yes"],
                  ["Active Sessions", "Redis session count", "Yes"],
                  ["Audit Events Today", "Audit log count (today)", "Yes"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.dashboardAnalytics.chartsTitle", id: "charts" },
      {
            type: "table", headers: ["Chart", "Type", "Data Source"], rows: [
                  ["User Growth", "Line chart", "User registrations over time"],
                  ["Activity by Type", "Bar chart", "Audit log grouped by action type"],
                  ["Module Usage", "Pie chart", "API calls per module"],
                  ["Logins by Day", "Area chart", "Authentication events per day"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.dashboardAnalytics.recentTitle", id: "recent-activity" },
      { type: "paragraph", contentKey: "commercial.dashboardAnalytics.recentIntro" },
      {
            type: "table", headers: ["Column", "Description"], rows: [
                  ["Admin", "Who performed the action"],
                  ["Action", "What was done (Created, Updated, Deleted)"],
                  ["Target", "Entity type and ID"],
                  ["Timestamp", "When (relative: \"5 minutes ago\")"],
                  ["Status", "Success or failure"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.dashboardAnalytics.apiTitle", id: "api-endpoints" },
      {
            type: "table", headers: ["Method", "Endpoint", "Description"], rows: [
                  ["GET", "/api/dashboard/statistics", "All KPI values"],
                  ["GET", "/api/dashboard/charts", "Chart data with date range filter"],
                  ["GET", "/api/dashboard/recent-activity", "Latest 20 audit entries"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.dashboardAnalytics.scopingTitle", id: "tenant-scoping" },
      { type: "paragraph", contentKey: "commercial.dashboardAnalytics.scopingIntro" },
      { type: "info", variant: "note", contentKey: "commercial.dashboardAnalytics.scopingNote" },
];

registerPage({
      slug: "commercial/dashboard-analytics",
      titleKey: "commercial.dashboardAnalytics.title",
      descriptionKey: "commercial.dashboardAnalytics.description",
      category: "commercial-enterprise",
      order: 5,
      sections,
      relatedSlugs: ["commercial/real-time", "commercial/audit-compliance"],
      lastUpdated: "2026-02-19",
});
