import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.entSubscriptions.intro" },

      // ─── Subscription Lifecycle ─────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.entSubscriptions.lifecycleTitle", id: "lifecycle" },
      { type: "paragraph", contentKey: "commercial.entSubscriptions.lifecycleContent" },
      {
            type: "flowchart",
            direction: "horizontal",
            title: "Subscription Status Lifecycle",
            nodes: [
                  { id: "pending", label: "Pending", type: "default" },
                  { id: "active", label: "Active", type: "success" },
                  { id: "trial", label: "Trial", type: "info" },
                  { id: "suspended", label: "Suspended", type: "warning" },
                  { id: "expired", label: "Expired", type: "danger" },
                  { id: "cancelled", label: "Cancelled", type: "danger" },
            ],
            connections: [
                  { from: "pending", to: "active", label: "Activate" },
                  { from: "pending", to: "trial", label: "Start trial" },
                  { from: "trial", to: "active", label: "Convert" },
                  { from: "trial", to: "expired", label: "Trial ends" },
                  { from: "active", to: "suspended", label: "Suspend" },
                  { from: "suspended", to: "active", label: "Reactivate" },
                  { from: "active", to: "expired", label: "Expiry date" },
                  { from: "active", to: "cancelled", label: "Cancel" },
            ],
      },

      // ─── Subscription Types ─────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.entSubscriptions.typesTitle", id: "types" },
      {
            type: "table",
            headers: [
                  "commercial.entSubscriptions.tblTypeH1",
                  "commercial.entSubscriptions.tblTypeH2",
                  "commercial.entSubscriptions.tblTypeH3",
            ],
            rows: [
                  ["commercial.entSubscriptions.tblTypeR1C1", "commercial.entSubscriptions.tblTypeR1C2", "commercial.entSubscriptions.tblTypeR1C3"],
                  ["commercial.entSubscriptions.tblTypeR2C1", "commercial.entSubscriptions.tblTypeR2C2", "commercial.entSubscriptions.tblTypeR2C3"],
                  ["commercial.entSubscriptions.tblTypeR3C1", "commercial.entSubscriptions.tblTypeR3C2", "commercial.entSubscriptions.tblTypeR3C3"],
            ],
      },

      // ─── Operations ─────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.entSubscriptions.opsTitle", id: "operations" },
      {
            type: "feature-grid",
            columns: 2,
            items: [
                  { icon: "plus-circle", titleKey: "commercial.entSubscriptions.opsAssign", descriptionKey: "commercial.entSubscriptions.opsAssignDesc" },
                  { icon: "arrow-up", titleKey: "commercial.entSubscriptions.opsUpgrade", descriptionKey: "commercial.entSubscriptions.opsUpgradeDesc" },
                  { icon: "arrow-down", titleKey: "commercial.entSubscriptions.opsDowngrade", descriptionKey: "commercial.entSubscriptions.opsDowngradeDesc" },
                  { icon: "alert-triangle", titleKey: "commercial.entSubscriptions.opsImpact", descriptionKey: "commercial.entSubscriptions.opsImpactDesc" },
            ],
      },

      // ─── Expiry Behavior ────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.entSubscriptions.expiryTitle", id: "expiry" },
      {
            type: "table",
            headers: [
                  "commercial.entSubscriptions.tblExpH1",
                  "commercial.entSubscriptions.tblExpH2",
                  "commercial.entSubscriptions.tblExpH3",
            ],
            rows: [
                  ["commercial.entSubscriptions.tblExpR1C1", "commercial.entSubscriptions.tblExpR1C2", "commercial.entSubscriptions.tblExpR1C3"],
                  ["commercial.entSubscriptions.tblExpR2C1", "commercial.entSubscriptions.tblExpR2C2", "commercial.entSubscriptions.tblExpR2C3"],
                  ["commercial.entSubscriptions.tblExpR3C1", "commercial.entSubscriptions.tblExpR3C2", "commercial.entSubscriptions.tblExpR3C3"],
            ],
      },

      // ─── API Endpoints ──────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.entSubscriptions.apiTitle", id: "api" },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/subscriptions", descriptionKey: "List all subscriptions", auth: "Required", permission: "Subscriptions.View" },
                  { method: "POST", path: "/api/subscriptions/assign", descriptionKey: "Assign subscription to tenant", auth: "Required", permission: "Subscriptions.Create" },
                  { method: "PUT", path: "/api/subscriptions/{id}/upgrade", descriptionKey: "Upgrade subscription edition", auth: "Required", permission: "Subscriptions.Update" },
                  { method: "PUT", path: "/api/subscriptions/{id}/downgrade", descriptionKey: "Downgrade subscription edition", auth: "Required", permission: "Subscriptions.Update" },
                  { method: "GET", path: "/api/subscriptions/{id}/downgrade-impact", descriptionKey: "Analyze downgrade impact", auth: "Required", permission: "Subscriptions.View" },
                  { method: "PUT", path: "/api/subscriptions/{id}/suspend", descriptionKey: "Suspend subscription", auth: "Required", permission: "Subscriptions.Update" },
                  { method: "PUT", path: "/api/subscriptions/{id}/reactivate", descriptionKey: "Reactivate subscription", auth: "Required", permission: "Subscriptions.Update" },
                  { method: "PUT", path: "/api/subscriptions/{id}/cancel", descriptionKey: "Cancel subscription", auth: "Required", permission: "Subscriptions.Update" },
            ],
      },

      { type: "info", variant: "tip", contentKey: "commercial.entSubscriptions.tip" },
];

registerPage({
      slug: "commercial/entitlements-subscriptions",
      titleKey: "commercial.entSubscriptions.title",
      descriptionKey: "commercial.entSubscriptions.description",
      category: "commercial-modules",
      order: 3,
      sections,
      relatedSlugs: ["commercial/entitlements-editions", "commercial/entitlements-overview", "commercial/multi-tenancy"],
      lastUpdated: "2026-03-02",
});
