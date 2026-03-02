import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.entOverrides.intro" },

      // ─── Resolution Priority Chain ──────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.entOverrides.priorityTitle", id: "priority-chain" },
      { type: "paragraph", contentKey: "commercial.entOverrides.priorityContent" },
      {
            type: "flowchart",
            direction: "vertical",
            title: "Feature Resolution Priority",
            nodes: [
                  { id: "override", label: "1. Tenant Override (Highest)", type: "danger" },
                  { id: "sub", label: "2. Active Subscription → Edition Features", type: "warning" },
                  { id: "addon", label: "3. Add-on Subscriptions", type: "info" },
                  { id: "default", label: "4. Feature Default Value (Lowest)", type: "default" },
            ],
            connections: [
                  { from: "override", to: "sub", label: "Not set? →" },
                  { from: "sub", to: "addon", label: "Not set? →" },
                  { from: "addon", to: "default", label: "Not set? →" },
            ],
      },

      // ─── Use Cases ──────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.entOverrides.useCasesTitle", id: "use-cases" },
      {
            type: "feature-grid",
            columns: 2,
            items: [
                  { icon: "briefcase", titleKey: "commercial.entOverrides.ucEnterprise", descriptionKey: "commercial.entOverrides.ucEnterpriseDesc" },
                  { icon: "gift", titleKey: "commercial.entOverrides.ucPromo", descriptionKey: "commercial.entOverrides.ucPromoDesc" },
                  { icon: "code", titleKey: "commercial.entOverrides.ucBeta", descriptionKey: "commercial.entOverrides.ucBetaDesc" },
                  { icon: "clock", titleKey: "commercial.entOverrides.ucExpiring", descriptionKey: "commercial.entOverrides.ucExpiringDesc" },
            ],
      },

      // ─── Setting an Override ────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.entOverrides.settingTitle", id: "setting-overrides" },
      { type: "paragraph", contentKey: "commercial.entOverrides.settingContent" },
      {
            type: "code",
            language: "json",
            filename: "Override Request Example",
            code: `POST /api/tenant-features/{tenantId}/override
{
  "featureId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "value": "500",
  "expiresAt": "2026-12-31T23:59:59Z",
  "reason": "Enterprise deal: Extended storage"
}`,
      },

      // ─── Audit Trail ────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.entOverrides.auditTitle", id: "audit-trail" },
      { type: "paragraph", contentKey: "commercial.entOverrides.auditContent" },
      {
            type: "table",
            headers: [
                  "commercial.entOverrides.tblAuditH1",
                  "commercial.entOverrides.tblAuditH2",
                  "commercial.entOverrides.tblAuditH3",
            ],
            rows: [
                  ["commercial.entOverrides.tblAuditR1C1", "commercial.entOverrides.tblAuditR1C2", "commercial.entOverrides.tblAuditR1C3"],
                  ["commercial.entOverrides.tblAuditR2C1", "commercial.entOverrides.tblAuditR2C2", "commercial.entOverrides.tblAuditR2C3"],
                  ["commercial.entOverrides.tblAuditR3C1", "commercial.entOverrides.tblAuditR3C2", "commercial.entOverrides.tblAuditR3C3"],
            ],
      },

      // ─── API Endpoints ──────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.entOverrides.apiTitle", id: "api" },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/tenant-features/{tenantId}/resolved", descriptionKey: "Get resolved features for tenant", auth: "Required", permission: "Features.View" },
                  { method: "POST", path: "/api/tenant-features/{tenantId}/override", descriptionKey: "Set feature override", auth: "Required", permission: "Features.Update" },
                  { method: "DELETE", path: "/api/tenant-features/{tenantId}/override/{featureId}", descriptionKey: "Remove override", auth: "Required", permission: "Features.Update" },
                  { method: "GET", path: "/api/tenant-features/{tenantId}/overrides", descriptionKey: "List all overrides for tenant", auth: "Required", permission: "Features.View" },
            ],
      },

      { type: "info", variant: "tip", contentKey: "commercial.entOverrides.tip" },
];

registerPage({
      slug: "commercial/entitlements-overrides",
      titleKey: "commercial.entOverrides.title",
      descriptionKey: "commercial.entOverrides.description",
      category: "commercial-modules",
      order: 5,
      sections,
      relatedSlugs: ["commercial/entitlements-features", "commercial/entitlements-subscriptions", "commercial/entitlements-overview"],
      lastUpdated: "2026-03-02",
});
