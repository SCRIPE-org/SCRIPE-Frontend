import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.entFeatures.intro" },

  // ─── Feature Value Types ────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.entFeatures.typesTitle", id: "value-types" },
  { type: "paragraph", contentKey: "commercial.entFeatures.typesContent" },
  {
    type: "table",
    headers: [
      "commercial.entFeatures.tblTypeH1",
      "commercial.entFeatures.tblTypeH2",
      "commercial.entFeatures.tblTypeH3",
      "commercial.entFeatures.tblTypeH4",
    ],
    rows: [
      [
        "commercial.entFeatures.tblTypeR1C1",
        "commercial.entFeatures.tblTypeR1C2",
        "commercial.entFeatures.tblTypeR1C3",
        "commercial.entFeatures.tblTypeR1C4",
      ],
      [
        "commercial.entFeatures.tblTypeR2C1",
        "commercial.entFeatures.tblTypeR2C2",
        "commercial.entFeatures.tblTypeR2C3",
        "commercial.entFeatures.tblTypeR2C4",
      ],
      [
        "commercial.entFeatures.tblTypeR3C1",
        "commercial.entFeatures.tblTypeR3C2",
        "commercial.entFeatures.tblTypeR3C3",
        "commercial.entFeatures.tblTypeR3C4",
      ],
    ],
  },

  // ─── System vs Custom Features ──────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.entFeatures.systemTitle",
    id: "system-vs-custom",
  },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "lock",
        titleKey: "commercial.entFeatures.fgSystem",
        descriptionKey: "commercial.entFeatures.fgSystemDesc",
      },
      {
        icon: "edit",
        titleKey: "commercial.entFeatures.fgCustom",
        descriptionKey: "commercial.entFeatures.fgCustomDesc",
      },
    ],
  },

  // ─── Quota Enforcement ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.entFeatures.quotaTitle",
    id: "quota-enforcement",
  },
  { type: "paragraph", contentKey: "commercial.entFeatures.quotaContent" },
  {
    type: "flowchart",
    direction: "horizontal",
    title: "Quota Enforcement Flow",
    nodes: [
      { id: "cmd", label: "Create Entity Command", type: "default" },
      { id: "pipe", label: "FeatureCheckBehavior", type: "info" },
      { id: "quota", label: "Check QuotaCounter", type: "primary" },
      { id: "pass", label: "Execute ✓", type: "success" },
      { id: "fail", label: "Quota Exceeded ✗", type: "danger" },
    ],
    connections: [
      { from: "cmd", to: "pipe" },
      { from: "pipe", to: "quota" },
      { from: "quota", to: "pass", label: "Under limit" },
      { from: "quota", to: "fail", label: "At limit" },
    ],
  },

  // ─── Feature Caching ────────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.entFeatures.cacheTitle", id: "caching" },
  { type: "paragraph", contentKey: "commercial.entFeatures.cacheContent" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "zap",
        titleKey: "commercial.entFeatures.cachePerf",
        descriptionKey: "commercial.entFeatures.cachePerfDesc",
      },
      {
        icon: "refresh-cw",
        titleKey: "commercial.entFeatures.cacheInv",
        descriptionKey: "commercial.entFeatures.cacheInvDesc",
      },
    ],
  },

  // ─── API Endpoints ──────────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.entFeatures.apiTitle", id: "api" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/features",
        descriptionKey: "List all features",
        auth: "Required",
        permission: "Features.View",
      },
      {
        method: "POST",
        path: "/api/features",
        descriptionKey: "Create custom feature",
        auth: "Required",
        permission: "Features.Create",
      },
      {
        method: "PUT",
        path: "/api/features/{id}",
        descriptionKey: "Update feature",
        auth: "Required",
        permission: "Features.Update",
      },
      {
        method: "DELETE",
        path: "/api/features/{id}",
        descriptionKey: "Delete custom feature",
        auth: "Required",
        permission: "Features.Delete",
      },
      {
        method: "GET",
        path: "/api/features/resolved",
        descriptionKey: "Get resolved features for current tenant",
        auth: "Required",
        permission: "Features.View",
      },
    ],
  },

  { type: "info", variant: "tip", contentKey: "commercial.entFeatures.tip" },
];

registerPage({
  slug: "commercial/entitlements-features",
  titleKey: "commercial.entFeatures.title",
  descriptionKey: "commercial.entFeatures.description",
  category: "commercial-modules",
  order: 4,
  sections,
  relatedSlugs: [
    "commercial/entitlements-editions",
    "commercial/entitlements-overrides",
    "commercial/entitlements-overview",
  ],
  lastUpdated: "2026-03-02",
});
