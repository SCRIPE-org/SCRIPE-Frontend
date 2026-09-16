/**
 * Custom Fields — Field Groups (product documentation).
 */

import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const K = "modules.customFields.docs.groups";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: `${K}.intro` },
  {
    type: "info",
    variant: "note",
    titleKey: `${K}.permInfoTitle`,
    contentKey: `${K}.permInfoContent`,
  },

  // ─── What a group is ──────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.whatTitle`, id: "what-a-group-is" },
  { type: "paragraph", contentKey: `${K}.whatIntro` },
  {
    type: "table",
    headers: [`${K}.thPart`, `${K}.thWhat`, `${K}.thChange`],
    rows: [
      ["Entity Type", `${K}.partEntityType`, `${K}.changeNever`],
      ["Stable Key", `${K}.partStableKey`, `${K}.changeNever`],
      ["Label (English)", `${K}.partLabelEn`, `${K}.changeAnytime`],
      ["Label (Arabic)", `${K}.partLabelAr`, `${K}.changeAnytime`],
      ["Sort Order", `${K}.partSortOrder`, `${K}.changeAnytime`],
      ["Scope", `${K}.partScope`, `${K}.changeNever`],
    ],
  },

  // ─── Creating a group ─────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.createTitle`, id: "creating-a-group" },
  { type: "paragraph", contentKey: `${K}.createIntro` },
  {
    type: "step-guide",
    steps: [
      { titleKey: `${K}.c1Title`, contentKey: `${K}.c1Content` },
      { titleKey: `${K}.c2Title`, contentKey: `${K}.c2Content` },
      { titleKey: `${K}.c3Title`, contentKey: `${K}.c3Content` },
      { titleKey: `${K}.c4Title`, contentKey: `${K}.c4Content` },
    ],
  },

  // ─── The stable key ───────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.stableKeyTitle`, id: "the-stable-key" },
  { type: "paragraph", contentKey: `${K}.stableKeyIntro` },
  {
    type: "table",
    headers: [`${K}.thKeyExample`, `${K}.thOutcome`],
    rows: [
      ["contact_details", `${K}.skOk`],
      ["Contact_Details", `${K}.skLowercased`],
      ["contact-details", `${K}.skHyphen`],
      ["1st_section", `${K}.skLeadingDigit`],
      [`${K}.exSkDuplicate`, `${K}.skDuplicate`],
    ],
  },
  { type: "paragraph", contentKey: `${K}.stableKeyWhy` },
  {
    type: "info",
    variant: "caution",
    titleKey: `${K}.stableKeyWarnTitle`,
    contentKey: `${K}.stableKeyWarnContent`,
  },

  // ─── Assigning a field ────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.assignTitle`, id: "assigning-a-field" },
  { type: "paragraph", contentKey: `${K}.assignIntro` },
  {
    type: "list",
    variant: "unordered",
    items: [`${K}.assign1`, `${K}.assign2`, `${K}.assign3`, `${K}.assign4`],
  },

  // ─── Ordering ─────────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.orderTitle`, id: "ordering-groups" },
  { type: "paragraph", contentKey: `${K}.orderIntro` },
  { type: "paragraph", contentKey: `${K}.orderKeyboard` },
  {
    type: "info",
    variant: "caution",
    titleKey: `${K}.orderLimitTitle`,
    contentKey: `${K}.orderLimitContent`,
  },
  {
    type: "info",
    variant: "caution",
    titleKey: `${K}.orderGlobalTitle`,
    contentKey: `${K}.orderGlobalContent`,
  },

  // ─── Deleting a group ─────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.deleteTitle`, id: "deleting-a-group" },
  { type: "paragraph", contentKey: `${K}.deleteIntro` },
  { type: "paragraph", contentKey: `${K}.deleteEditing` },

  // ─── Global groups ────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.globalTitle`, id: "global-groups" },
  { type: "paragraph", contentKey: `${K}.globalIntro` },
  { type: "paragraph", contentKey: `${K}.globalTenantView` },

  // ─── What a group does and does not do ────────────────────
  { type: "heading", level: 2, titleKey: `${K}.effectTitle`, id: "what-a-group-affects" },
  {
    type: "comparison",
    columns: [
      {
        titleKey: `${K}.doesTitle`,
        variant: "positive",
        items: [`${K}.does1`, `${K}.does2`, `${K}.does3`, `${K}.does4`],
      },
      {
        titleKey: `${K}.doesNotTitle`,
        variant: "negative",
        items: [`${K}.doesNot1`, `${K}.doesNot2`, `${K}.doesNot3`, `${K}.doesNot4`],
      },
    ],
  },

  // ─── Errors ───────────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.errorsTitle`, id: "group-errors" },
  {
    type: "table",
    headers: [`${K}.thSituation`, `${K}.thWhatYouSee`],
    rows: [
      [`${K}.errDuplicateKey`, `${K}.errDuplicateKeyMsg`],
      [`${K}.errWrongEntityType`, `${K}.errWrongEntityTypeMsg`],
      [`${K}.errTooManyReorder`, `${K}.errTooManyReorderMsg`],
      [`${K}.errDuplicateReorder`, `${K}.errDuplicateReorderMsg`],
      [`${K}.errMixedReorder`, `${K}.errMixedReorderMsg`],
      [`${K}.errGlobalNotSuperAdmin`, `${K}.errGlobalNotSuperAdminMsg`],
      [`${K}.errNoDefinition`, `${K}.errNoDefinitionMsg`],
    ],
  },
];

registerPage({
  slug: "modules/custom-fields-field-groups",
  titleKey: `${K}.title`,
  descriptionKey: `${K}.description`,
  category: "modules",
  order: 4,
  sections,
  relatedSlugs: ["modules/custom-fields-defining", "modules/custom-fields-limits"],
  lastUpdated: "2026-08-21",
});
