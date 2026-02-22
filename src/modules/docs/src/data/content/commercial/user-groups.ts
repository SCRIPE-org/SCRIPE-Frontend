import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.userGroups.intro" },

      { type: "heading", level: 2, titleKey: "commercial.userGroups.batchAssignTitle", id: "batch-assign" },
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

      { type: "heading", level: 2, titleKey: "commercial.userGroups.additiveRestrictionsTitle", id: "additive-restrictions" },
      { type: "paragraph", contentKey: "commercial.userGroups.additiveRestrictionsContent" },
      {
            type: "table",
            headers: ["Scenario", "Restriction A", "Restriction B", "Result"],
            rows: [
                  ["Single Group", "Hide [Salary]", "None", "Salary hidden"],
                  ["Multiple Groups", "Group 1: Hide [Salary]", "Group 2: Hide [SSN]", "Salary AND SSN hidden"],
                  ["Direct Role + Group", "Role: Hide [Email]", "Group: Hide [Phone]", "Email AND Phone hidden"],
            ],
      },

      { type: "heading", level: 2, titleKey: "commercial.userGroups.cascadeTitle", id: "cascade-operations" },
      { type: "paragraph", contentKey: "commercial.userGroups.cascadeContent" },
      {
            type: "feature-grid",
            columns: 2,
            items: [
                  { icon: "trash", titleKey: "commercial.userGroups.cascadeDelete", descriptionKey: "commercial.userGroups.cascadeDeleteDesc" },
                  { icon: "power", titleKey: "commercial.userGroups.cascadeStatus", descriptionKey: "commercial.userGroups.cascadeStatusDesc" },
                  { icon: "shield", titleKey: "commercial.userGroups.rootProtection", descriptionKey: "commercial.userGroups.rootProtectionDesc" },
                  { icon: "users", titleKey: "commercial.userGroups.fallbackSafety", descriptionKey: "commercial.userGroups.fallbackSafetyDesc" },
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
