/**
 * Custom Fields — Option Sets (product documentation).
 *
 * An option set is a named, versioned list of choices that multiple Select and MultiSelect
 * custom fields share. Instead of every field owning its own inline option list, each field
 * points to one set, so changing the set's published version updates every field simultaneously.
 *
 * This page is for the ADMINISTRATOR who manages sets in the product. The page at
 * custom-fields-options.ts covers the inline option list on a single field, which is the simpler
 * case for when sharing is not needed.
 */

import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const K = "modules.customFields.docs.optionSets";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: `${K}.intro` },
  {
    type: "info",
    variant: "tip",
    titleKey: `${K}.whenToUseTitle`,
    contentKey: `${K}.whenToUseContent`,
  },

  // ─── Three kinds of option set ─────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.kindsTitle`, id: "kinds-of-option-set" },
  { type: "paragraph", contentKey: `${K}.kindsIntro` },
  {
    type: "table",
    headers: [`${K}.thKind`, `${K}.thOwner`, `${K}.thWhoCanEdit`, `${K}.thScope`],
    rows: [
      [
        `${K}.kindSeeded`,
        `${K}.ownerPlatform`,
        `${K}.editNobody`,
        `${K}.scopeGlobal`,
      ],
      [
        `${K}.kindPlatform`,
        `${K}.ownerPlatform`,
        `${K}.editPlatformAdmin`,
        `${K}.scopeGlobalOrTenant`,
      ],
      [
        `${K}.kindTenant`,
        `${K}.ownerTenant`,
        `${K}.editTenantAdmin`,
        `${K}.scopeTenantOnly`,
      ],
    ],
  },
  {
    type: "info",
    variant: "info",
    titleKey: `${K}.seededReadOnlyTitle`,
    contentKey: `${K}.seededReadOnlyContent`,
  },

  // ─── Version lifecycle ─────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.lifecycleTitle`, id: "version-lifecycle" },
  { type: "paragraph", contentKey: `${K}.lifecycleIntro` },
  {
    type: "table",
    headers: [`${K}.thStatus`, `${K}.thMeaning`, `${K}.thNextState`],
    rows: [
      [`${K}.statusDraft`, `${K}.meaningDraft`, `${K}.nextDraft`],
      [`${K}.statusPublished`, `${K}.meaningPublished`, `${K}.nextPublished`],
      [`${K}.statusDeprecated`, `${K}.meaningDeprecated`, `${K}.nextDeprecated`],
      [`${K}.statusArchived`, `${K}.meaningArchived`, `${K}.nextArchived`],
    ],
  },
  { type: "paragraph", contentKey: `${K}.lifecycleOnlyOnePublished` },
  {
    type: "info",
    variant: "warning",
    titleKey: `${K}.publishSwapTitle`,
    contentKey: `${K}.publishSwapContent`,
  },

  // ─── Creating and editing a draft ─────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.draftTitle`, id: "creating-a-draft" },
  { type: "paragraph", contentKey: `${K}.draftIntro` },
  {
    type: "list",
    variant: "ordered",
    items: [
      `${K}.draft1`,
      `${K}.draft2`,
      `${K}.draft3`,
      `${K}.draft4`,
    ],
  },
  {
    type: "info",
    variant: "info",
    titleKey: `${K}.draftSaveHintTitle`,
    contentKey: `${K}.draftSaveHintContent`,
  },

  // ─── Binding a field to an option set ─────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.bindingTitle`, id: "binding-a-field" },
  { type: "paragraph", contentKey: `${K}.bindingIntro` },
  {
    type: "table",
    headers: [`${K}.thAction`, `${K}.thWhatItDoes`, `${K}.thEffect`],
    rows: [
      [`${K}.actionBind`, `${K}.doingBind`, `${K}.effectBind`],
      [`${K}.actionSwitch`, `${K}.doingSwitch`, `${K}.effectSwitch`],
      [`${K}.actionDetach`, `${K}.doingDetach`, `${K}.effectDetach`],
    ],
  },
  {
    type: "info",
    variant: "caution",
    titleKey: `${K}.switchCautionTitle`,
    contentKey: `${K}.switchCautionContent`,
  },

  // ─── Platform admin capabilities ──────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.platformAdminTitle`, id: "platform-admin" },
  { type: "paragraph", contentKey: `${K}.platformAdminIntro` },
  {
    type: "list",
    variant: "unordered",
    items: [
      `${K}.platformAdmin1`,
      `${K}.platformAdmin2`,
      `${K}.platformAdmin3`,
      `${K}.platformAdmin4`,
      `${K}.platformAdmin5`,
    ],
  },
  {
    type: "info",
    variant: "info",
    titleKey: `${K}.platformContextTitle`,
    contentKey: `${K}.platformContextContent`,
  },

  // ─── Key rules to remember ────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.rulesTitle`, id: "rules-to-remember" },
  {
    type: "list",
    variant: "unordered",
    items: [
      `${K}.rule1`,
      `${K}.rule2`,
      `${K}.rule3`,
      `${K}.rule4`,
      `${K}.rule5`,
    ],
  },
];

registerPage({
  slug: "modules/custom-fields-option-sets",
  titleKey: `${K}.title`,
  descriptionKey: `${K}.description`,
  category: "modules",
  order: 5.5,
  sections,
  relatedSlugs: [
    "modules/custom-fields-options",
    "modules/custom-fields-value-types",
    "modules/custom-fields-defining",
  ],
  lastUpdated: "2026-08-27",
});
