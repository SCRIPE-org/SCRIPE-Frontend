import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.entOverview.intro" },

      // ─── Why Entitlements Matter ─────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.entOverview.whyTitle", id: "why-entitlements" },
      { type: "paragraph", contentKey: "commercial.entOverview.whyContent" },
      {
            type: "feature-grid",
            columns: 3,
            items: [
                  { icon: "layers", titleKey: "commercial.entOverview.fgEditions", descriptionKey: "commercial.entOverview.fgEditionsDesc" },
                  { icon: "refresh-cw", titleKey: "commercial.entOverview.fgSubscriptions", descriptionKey: "commercial.entOverview.fgSubscriptionsDesc" },
                  { icon: "key", titleKey: "commercial.entOverview.fgFeatures", descriptionKey: "commercial.entOverview.fgFeaturesDesc" },
                  { icon: "sliders", titleKey: "commercial.entOverview.fgOverrides", descriptionKey: "commercial.entOverview.fgOverridesDesc" },
                  { icon: "bar-chart", titleKey: "commercial.entOverview.fgQuotas", descriptionKey: "commercial.entOverview.fgQuotasDesc" },
                  { icon: "git-branch", titleKey: "commercial.entOverview.fgVersioning", descriptionKey: "commercial.entOverview.fgVersioningDesc" },
            ],
      },

      // ─── How It Works ───────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.entOverview.howTitle", id: "how-it-works" },
      { type: "paragraph", contentKey: "commercial.entOverview.howContent" },
      {
            type: "flowchart",
            direction: "horizontal",
            title: "Entitlements Resolution Flow",
            nodes: [
                  { id: "req", label: "API Request", type: "default" },
                  { id: "pipe", label: "MediatR Pipeline", type: "info" },
                  { id: "check", label: "IRequireFeature Check", type: "primary" },
                  { id: "resolve", label: "Resolve Tenant Features", type: "warning" },
                  { id: "allow", label: "Execute ✓", type: "success" },
                  { id: "deny", label: "Feature Disabled ✗", type: "danger" },
            ],
            connections: [
                  { from: "req", to: "pipe" },
                  { from: "pipe", to: "check" },
                  { from: "check", to: "resolve" },
                  { from: "resolve", to: "allow", label: "Allowed" },
                  { from: "resolve", to: "deny", label: "Blocked" },
            ],
      },

      // ─── Resolution Priority ────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.entOverview.resolutionTitle", id: "resolution-priority" },
      { type: "paragraph", contentKey: "commercial.entOverview.resolutionContent" },
      {
            type: "table",
            headers: [
                  "commercial.entOverview.tblResH1",
                  "commercial.entOverview.tblResH2",
                  "commercial.entOverview.tblResH3",
            ],
            rows: [
                  ["commercial.entOverview.tblResR1C1", "commercial.entOverview.tblResR1C2", "commercial.entOverview.tblResR1C3"],
                  ["commercial.entOverview.tblResR2C1", "commercial.entOverview.tblResR2C2", "commercial.entOverview.tblResR2C3"],
                  ["commercial.entOverview.tblResR3C1", "commercial.entOverview.tblResR3C2", "commercial.entOverview.tblResR3C3"],
                  ["commercial.entOverview.tblResR4C1", "commercial.entOverview.tblResR4C2", "commercial.entOverview.tblResR4C3"],
            ],
      },

      // ─── Business Value ─────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.entOverview.valueTitle", id: "business-value" },
      {
            type: "table",
            headers: [
                  "commercial.entOverview.tblValH1",
                  "commercial.entOverview.tblValH2",
                  "commercial.entOverview.tblValH3",
            ],
            rows: [
                  ["commercial.entOverview.tblValR1C1", "commercial.entOverview.tblValR1C2", "commercial.entOverview.tblValR1C3"],
                  ["commercial.entOverview.tblValR2C1", "commercial.entOverview.tblValR2C2", "commercial.entOverview.tblValR2C3"],
                  ["commercial.entOverview.tblValR3C1", "commercial.entOverview.tblValR3C2", "commercial.entOverview.tblValR3C3"],
                  ["commercial.entOverview.tblValR4C1", "commercial.entOverview.tblValR4C2", "commercial.entOverview.tblValR4C3"],
                  ["commercial.entOverview.tblValR5C1", "commercial.entOverview.tblValR5C2", "commercial.entOverview.tblValR5C3"],
            ],
      },

      { type: "info", variant: "tip", contentKey: "commercial.entOverview.tip" },
];

registerPage({
      slug: "commercial/entitlements-overview",
      titleKey: "commercial.entOverview.title",
      descriptionKey: "commercial.entOverview.description",
      category: "commercial-modules",
      order: 1,
      sections,
      relatedSlugs: ["commercial/entitlements-editions", "commercial/entitlements-features", "commercial/licensing-model"],
      lastUpdated: "2026-03-02",
});
