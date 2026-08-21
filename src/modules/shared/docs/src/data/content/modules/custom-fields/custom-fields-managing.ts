/**
 * Custom Fields — Managing fields (product documentation).
 *
 * Editing, deactivating, definition history, usage and impact, safe delete,
 * the spreadsheet export, and the two read-only reference screens.
 */

import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const K = "modules.customFields.docs.managing";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: `${K}.intro` },

  // ─── The row menu ─────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.rowMenuTitle`, id: "the-row-menu" },
  { type: "paragraph", contentKey: `${K}.rowMenuIntro` },
  {
    type: "table",
    headers: [`${K}.thAction`, `${K}.thDoes`, `${K}.thNeeds`],
    rows: [
      ["Edit", `${K}.actEdit`, "custom-fields.update"],
      ["History", `${K}.actHistory`, "custom-fields.view"],
      ["Usage & impact", `${K}.actUsage`, "custom-fields.view"],
      ["Delete", `${K}.actDelete`, "custom-fields.delete"],
    ],
  },

  // ─── Editing ──────────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.editTitle`, id: "editing-a-definition" },
  { type: "paragraph", contentKey: `${K}.editIntro` },
  { type: "paragraph", contentKey: `${K}.editLoadFailure` },
  {
    type: "info",
    variant: "caution",
    titleKey: `${K}.editWarnTitle`,
    contentKey: `${K}.editWarnContent`,
  },

  // ─── Deactivate vs delete ─────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.retireTitle`, id: "deactivate-or-delete" },
  { type: "paragraph", contentKey: `${K}.retireIntro` },
  {
    type: "comparison",
    columns: [
      {
        titleKey: `${K}.deactivateTitle`,
        variant: "positive",
        items: [
          `${K}.deactivate1`,
          `${K}.deactivate2`,
          `${K}.deactivate3`,
          `${K}.deactivate4`,
        ],
      },
      {
        titleKey: `${K}.deleteColTitle`,
        variant: "warning",
        items: [`${K}.deleteCol1`, `${K}.deleteCol2`, `${K}.deleteCol3`, `${K}.deleteCol4`],
      },
    ],
  },

  // ─── History ──────────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.historyTitle`, id: "definition-history" },
  { type: "paragraph", contentKey: `${K}.historyIntro` },
  {
    type: "table",
    headers: [`${K}.thEvent`, `${K}.thMeans`],
    rows: [
      ["Created", `${K}.evCreated`],
      ["Updated", `${K}.evUpdated`],
      ["Deactivated", `${K}.evDeactivated`],
      ["Reactivated", `${K}.evReactivated`],
      ["Deleted", `${K}.evDeleted`],
      ["Restored", `${K}.evRestored`],
      ["Purged", `${K}.evPurged`],
    ],
  },
  { type: "paragraph", contentKey: `${K}.historyParts` },
  {
    type: "table",
    headers: [`${K}.thPart`, `${K}.thMeans`],
    rows: [
      ["Field", `${K}.partField`],
      ["Definition", `${K}.partDefinition`],
      ["Version", `${K}.partVersion`],
      ["Option", `${K}.partOption`],
      ["Visibility rule", `${K}.partVisibilityRule`],
    ],
  },
  {
    type: "info",
    variant: "warning",
    titleKey: `${K}.historyScopeTitle`,
    contentKey: `${K}.historyScopeContent`,
  },
  {
    type: "info",
    variant: "note",
    titleKey: `${K}.historyUnavailableTitle`,
    contentKey: `${K}.historyUnavailableContent`,
  },

  // ─── Usage & impact ───────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.usageTitle`, id: "usage-and-impact" },
  { type: "paragraph", contentKey: `${K}.usageIntro` },
  {
    type: "table",
    headers: [`${K}.thReading`, `${K}.thMeans`],
    rows: [
      [`${K}.readStoredValues`, `${K}.readStoredValuesMeans`],
      [`${K}.readLegacyValues`, `${K}.readLegacyValuesMeans`],
      [`${K}.readOptions`, `${K}.readOptionsMeans`],
      [`${K}.readByRecordType`, `${K}.readByRecordTypeMeans`],
      [`${K}.readAffectedOrgs`, `${K}.readAffectedOrgsMeans`],
      [`${K}.readScopeNotice`, `${K}.readScopeNoticeMeans`],
    ],
  },
  {
    type: "info",
    variant: "warning",
    titleKey: `${K}.usageWarnTitle`,
    contentKey: `${K}.usageWarnContent`,
  },

  // ─── Deleting safely ──────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.deleteTitle`, id: "deleting-safely" },
  { type: "paragraph", contentKey: `${K}.deleteIntro` },
  {
    type: "step-guide",
    steps: [
      { titleKey: `${K}.d1Title`, contentKey: `${K}.d1Content` },
      { titleKey: `${K}.d2Title`, contentKey: `${K}.d2Content` },
      { titleKey: `${K}.d3Title`, contentKey: `${K}.d3Content` },
      { titleKey: `${K}.d4Title`, contentKey: `${K}.d4Content` },
    ],
  },
  { type: "paragraph", contentKey: `${K}.deleteRetention` },

  // ─── Export ───────────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.exportTitle`, id: "spreadsheet-export" },
  { type: "paragraph", contentKey: `${K}.exportIntro` },
  {
    type: "table",
    headers: [`${K}.thColumn`, `${K}.thContains`],
    rows: [
      ["Entity type", `${K}.colEntityType`],
      ["Key", `${K}.colKey`],
      ["Label (EN)", `${K}.colLabelEn`],
      ["Label (AR)", `${K}.colLabelAr`],
      ["Value type", `${K}.colValueType`],
      ["Required", `${K}.colRequired`],
      ["Active", `${K}.colActive`],
      ["Sort order", `${K}.colSortOrder`],
      ["Options (EN)", `${K}.colOptionsEn`],
      ["Options (AR)", `${K}.colOptionsAr`],
      ["Sensitivity", `${K}.colSensitivity`],
      ["Included in exports", `${K}.colExportable`],
      ["Validator", `${K}.colValidator`],
      ["Validator parameter", `${K}.colValidatorParam`],
      ["Placeholder (EN)", `${K}.colPlaceholderEn`],
      ["Placeholder (AR)", `${K}.colPlaceholderAr`],
      ["Scope", `${K}.colScope`],
      ["Created (UTC)", `${K}.colCreated`],
    ],
  },
  { type: "paragraph", contentKey: `${K}.exportBooleans` },
  {
    type: "info",
    variant: "success",
    titleKey: `${K}.exportSafetyTitle`,
    contentKey: `${K}.exportSafetyContent`,
  },
  {
    type: "info",
    variant: "caution",
    titleKey: `${K}.exportLimitTitle`,
    contentKey: `${K}.exportLimitContent`,
  },

  // ─── Reference screens ────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.referenceTitle`, id: "reference-screens" },
  { type: "paragraph", contentKey: `${K}.referenceIntro` },
  { type: "heading", level: 3, titleKey: `${K}.valueTypesScreenTitle`, id: "value-types-screen" },
  { type: "paragraph", contentKey: `${K}.valueTypesScreenIntro` },
  { type: "heading", level: 3, titleKey: `${K}.entityTypesScreenTitle`, id: "entity-types-screen" },
  { type: "paragraph", contentKey: `${K}.entityTypesScreenIntro` },
  { type: "paragraph", contentKey: `${K}.entityTypesScreenDrift` },
  {
    type: "info",
    variant: "caution",
    titleKey: `${K}.apiOnlyTitle`,
    contentKey: `${K}.apiOnlyContent`,
  },
];

registerPage({
  slug: "modules/custom-fields-managing",
  titleKey: `${K}.title`,
  descriptionKey: `${K}.description`,
  category: "modules",
  order: 8,
  sections,
  relatedSlugs: ["modules/custom-fields-security", "modules/custom-fields-limits"],
  lastUpdated: "2026-08-21",
});
