import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.userGroups.intro" },

  {
    type: "heading",
    level: 2,
    titleKey: "commercial.userGroups.batchAssignTitle",
    id: "batch-assign",
  },
  { type: "paragraph", contentKey: "commercial.userGroups.batchAssignContent" },
  {
    type: "flowchart",
    direction: "vertical",
    title: "User Group Assignment Flow",
    nodes: [
      { id: "group", label: "User Group (e.g. Finance Team)", type: "info" },
      { id: "roles", label: "Assigned Roles (Auditor, Accountant)", type: "primary" },
      { id: "restrictions", label: "Restrictions (Hide Salary, SSN)", type: "warning" },
      { id: "admin1", label: "Admin A", type: "default" },
      { id: "admin2", label: "Admin B", type: "default" },
    ],
    connections: [
      { from: "roles", to: "group" },
      { from: "restrictions", to: "group" },
      { from: "group", to: "admin1", label: "Gains all roles & restrictions instantly" },
      { from: "group", to: "admin2", label: "Gains all roles & restrictions instantly" },
    ],
  },

  {
    type: "heading",
    level: 2,
    titleKey: "commercial.userGroups.additiveRestrictionsTitle",
    id: "additive-restrictions",
  },
  { type: "paragraph", contentKey: "commercial.userGroups.additiveRestrictionsContent" },
  {
    type: "table",
    headers: ["Scenario", "Restriction A", "Restriction B", "Result"],
    rows: [
      ["Single Group", "Hide [Salary]", "None", "Salary hidden"],
      ["Multiple Groups", "Group 1: Hide [Salary]", "Group 2: Hide [SSN]", "Salary AND SSN hidden"],
      [
        "Direct Role + Group",
        "Role: Hide [Email]",
        "Group: Hide [Phone]",
        "Email AND Phone hidden",
      ],
    ],
  },

  {
    type: "heading",
    level: 2,
    titleKey: "commercial.userGroups.cascadeTitle",
    id: "cascade-operations",
  },
  { type: "paragraph", contentKey: "commercial.userGroups.cascadeContent" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "trash",
        titleKey: "commercial.userGroups.cascadeDelete",
        descriptionKey: "commercial.userGroups.cascadeDeleteDesc",
      },
      {
        icon: "power",
        titleKey: "commercial.userGroups.cascadeStatus",
        descriptionKey: "commercial.userGroups.cascadeStatusDesc",
      },
      {
        icon: "shield",
        titleKey: "commercial.userGroups.rootProtection",
        descriptionKey: "commercial.userGroups.rootProtectionDesc",
      },
      {
        icon: "users",
        titleKey: "commercial.userGroups.fallbackSafety",
        descriptionKey: "commercial.userGroups.fallbackSafetyDesc",
      },
    ],
  },

  { type: "heading", level: 2, titleKey: "commercial.userGroups.roiTitle", id: "roi-scale" },
  { type: "paragraph", contentKey: "commercial.userGroups.roiContent" },
  {
    type: "comparison",
    columns: [
      {
        titleKey: "Legacy 1:1 Provisioning",
        variant: "negative",
        items: [
          "1:1 Role assignments (O(N) complexity)",
          "Manual audits of 500+ individual staff profiles",
          "No atomic way to instantly suspend a compromised department",
          "Custom scripts needed to determine effective overlapping permissions",
        ],
      },
      {
        titleKey: "SCRIPE Group Provisioning",
        variant: "positive",
        items: [
          "O(1) Role assignments via Group inheritance",
          "Audit a single group to secure 500+ staff members instantly",
          "One-click cascading suspension of entire organizational units",
          "Native zero-latency Additive Union calculation at login",
        ],
      },
    ],
  },

  {
    type: "heading",
    level: 2,
    titleKey: "commercial.userGroups.complianceGridTitle",
    id: "compliance-governance",
  },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "activity",
        titleKey: "commercial.userGroups.auditTrackingTitle",
        descriptionKey: "commercial.userGroups.auditTrackingDesc",
      },
      {
        icon: "zap",
        titleKey: "commercial.userGroups.zeroLatencyTitle",
        descriptionKey: "commercial.userGroups.zeroLatencyDesc",
      },
      {
        icon: "lock",
        titleKey: "commercial.userGroups.tenantIsolationTitle",
        descriptionKey: "commercial.userGroups.tenantIsolationDesc",
      },
      {
        icon: "refresh-cw",
        titleKey: "commercial.userGroups.nukePaveTitle",
        descriptionKey: "commercial.userGroups.nukePaveDesc",
      },
    ],
  },
];

registerPage({
  slug: "commercial/user-groups",
  titleKey: "commercial.userGroups.title",
  descriptionKey: "commercial.userGroups.description",
  category: "commercial-enterprise",
  order: 3,
  sections,
  relatedSlugs: ["commercial/roles-permissions", "commercial/multi-tenancy"],
  lastUpdated: "2026-02-22",
});
