import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "tutorials.ujWorkforceCrm.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "tutorials.ujWorkforceCrm.infoTitle",
    contentKey: "tutorials.ujWorkforceCrm.infoContent",
  },

  // ─── Step 1: Modeling Multi-Branch Organization Core ─────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujWorkforceCrm.step1Title",
    id: "step-1-org-core",
  },
  { type: "paragraph", contentKey: "tutorials.ujWorkforceCrm.step1Desc" },

  // ─── Step 2: Staff Onboarding, Competencies & Certifications ──────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujWorkforceCrm.step2Title",
    id: "step-2-staff-onboarding",
  },
  { type: "paragraph", contentKey: "tutorials.ujWorkforceCrm.step2Desc" },

  // ─── Step 3: Shift Rostering & Availability Windows ───────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujWorkforceCrm.step3Title",
    id: "step-3-shift-rostering",
  },
  { type: "paragraph", contentKey: "tutorials.ujWorkforceCrm.step3Desc" },

  // ─── Step 4: Polymorphic Party Modeling & Customer 360 ────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujWorkforceCrm.step4Title",
    id: "step-4-customer-360",
  },
  { type: "paragraph", contentKey: "tutorials.ujWorkforceCrm.step4Desc" },
  {
    type: "code",
    language: "json",
    filename: "Party Creation (POST /api/v1/parties)",
    code: `{
  "type": "Person",
  "displayName": "Alexander Hamilton",
  "contactPoints": [
    { "type": "Email", "value": "alex@treasury.gov", "isPrimary": true },
    { "type": "Phone", "value": "+1-212-555-0199", "isPrimary": true }
  ],
  "roles": ["Customer", "Member"],
  "relationships": [
    {
      "relatedPartyId": "org_7721a",
      "type": "EmployeeOf",
      "validFrom": "2024-01-01"
    }
  ]
}`,
  },

  // ─── Step 5: Duplicate Resolution & Merging Workflows ─────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujWorkforceCrm.step5Title",
    id: "step-5-deduplication",
  },
  { type: "paragraph", contentKey: "tutorials.ujWorkforceCrm.step5Desc" },
];

registerPage({
  slug: "tutorials/user-journey-workforce-crm",
  titleKey: "tutorials.ujWorkforceCrm.title",
  descriptionKey: "tutorials.ujWorkforceCrm.description",
  category: "tutorials",
  order: 4,
  sections,
  relatedSlugs: [
    "modules/hrms-overview",
    "modules/party-kernel-overview",
    "modules/organization-core-overview",
  ],
  lastUpdated: "2026-10-03",
});
