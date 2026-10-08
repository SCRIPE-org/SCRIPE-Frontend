/**
 * Custom Fields — section landing page (product documentation).
 *
 * Written for the administrator who defines fields in the product, not for the
 * developer who maintains the module. `custom-fields-overview.ts` is the
 * developer-facing companion page.
 */

import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const K = "modules.customFields.docs.home";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: `${K}.intro` },
  {
    type: "info",
    variant: "tip",
    titleKey: `${K}.valueInfoTitle`,
    contentKey: `${K}.valueInfoContent`,
  },

  // ─── What they do ─────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.whatTitle`, id: "what-they-do" },
  { type: "paragraph", contentKey: `${K}.whatIntro` },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "settings",
        titleKey: `${K}.featDefineOnce`,
        descriptionKey: `${K}.featDefineOnceDesc`,
      },
      { icon: "check", titleKey: `${K}.featTyped`, descriptionKey: `${K}.featTypedDesc` },
      {
        icon: "layers",
        titleKey: `${K}.featValueTypes`,
        descriptionKey: `${K}.featValueTypesDesc`,
      },
      { icon: "building", titleKey: `${K}.featScoped`, descriptionKey: `${K}.featScopedDesc` },
      { icon: "shield", titleKey: `${K}.featSecured`, descriptionKey: `${K}.featSecuredDesc` },
      {
        icon: "chart",
        titleKey: `${K}.featAccountable`,
        descriptionKey: `${K}.featAccountableDesc`,
      },
    ],
  },

  // ─── Anatomy of a field ───────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.anatomyTitle`, id: "anatomy" },
  { type: "paragraph", contentKey: `${K}.anatomyIntro` },
  {
    type: "table",
    headers: [`${K}.thPart`, `${K}.thWhat`, `${K}.thChange`],
    rows: [
      ["Entity Type", `${K}.partEntityType`, `${K}.changeNever`],
      ["Key", `${K}.partKey`, `${K}.changeNever`],
      ["Value Type", `${K}.partValueType`, `${K}.changeNever`],
      ["Label (English)", `${K}.partLabelEn`, `${K}.changeAnytime`],
      ["Label (Arabic)", `${K}.partLabelAr`, `${K}.changeAnytime`],
      ["Placeholder (English / Arabic)", `${K}.partPlaceholder`, `${K}.changeAnytime`],
      ["Required", `${K}.partRequired`, `${K}.changeAnytimeConditions`],
      ["Sort Order", `${K}.partSortOrder`, `${K}.changeAnytime`],
      ["Field Group", `${K}.partFieldGroup`, `${K}.changeAnytime`],
      ["Options", `${K}.partOptions`, `${K}.changeAnytimeCare`],
      ["Validator / Validator Parameter", `${K}.partValidator`, `${K}.changeAnytimeCare`],
      ["Target Entity Type", `${K}.partReferenceTarget`, `${K}.changeAnytimeCare`],
      ["Sensitivity", `${K}.partSensitivity`, `${K}.changeAnytime`],
      ["Include in exports", `${K}.partExportable`, `${K}.changeAnytime`],
      ["Active", `${K}.partActive`, `${K}.changeAnytime`],
      ["Scope", `${K}.partScope`, `${K}.changeNever`],
    ],
  },

  // ─── Worked example ───────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.exampleTitle`, id: "worked-example" },
  { type: "paragraph", contentKey: `${K}.exampleIntro` },
  {
    type: "step-guide",
    steps: [
      { titleKey: `${K}.ex1Title`, contentKey: `${K}.ex1Content` },
      { titleKey: `${K}.ex2Title`, contentKey: `${K}.ex2Content` },
      { titleKey: `${K}.ex3Title`, contentKey: `${K}.ex3Content` },
      { titleKey: `${K}.ex4Title`, contentKey: `${K}.ex4Content` },
      { titleKey: `${K}.ex5Title`, contentKey: `${K}.ex5Content` },
    ],
  },

  // ─── Scope ────────────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.scopeTitle`, id: "scope" },
  { type: "paragraph", contentKey: `${K}.scopeIntro` },
  { type: "paragraph", contentKey: `${K}.scopeGlobal` },
  {
    type: "info",
    variant: "note",
    titleKey: `${K}.scopeInfoTitle`,
    contentKey: `${K}.scopeInfoContent`,
  },

  // ─── What they are not ────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.notTitle`, id: "what-they-are-not" },
  { type: "paragraph", contentKey: `${K}.notIntro` },
  {
    type: "list",
    variant: "unordered",
    items: [`${K}.not1`, `${K}.not2`, `${K}.not3`, `${K}.not4`, `${K}.not5`],
  },

  // ─── Where to go next ─────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.nextTitle`, id: "where-next" },
  { type: "paragraph", contentKey: `${K}.nextIntro` },
  {
    type: "table",
    headers: [`${K}.thPage`, `${K}.thCovers`],
    rows: [
      [`${K}.pageValueTypes`, `${K}.coversValueTypes`],
      [`${K}.pageReferences`, `${K}.coversReferences`],
      [`${K}.pageReferenceLookups`, `${K}.coversReferenceLookups`],
      [`${K}.pageDefining`, `${K}.coversDefining`],
      [`${K}.pageGroups`, `${K}.coversGroups`],
      [`${K}.pageOptions`, `${K}.coversOptions`],
      [`${K}.pageValidators`, `${K}.coversValidators`],
      [`${K}.pageSecurity`, `${K}.coversSecurity`],
      [`${K}.pageManaging`, `${K}.coversManaging`],
      [`${K}.pageLimits`, `${K}.coversLimits`],
    ],
  },

  // ─── Access ───────────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.accessTitle`, id: "access" },
  { type: "paragraph", contentKey: `${K}.accessIntro` },
  {
    type: "table",
    headers: [`${K}.thNeed`, `${K}.thWhoNeedsIt`],
    rows: [
      ["custom-fields.view", `${K}.permView`],
      ["custom-fields.create", `${K}.permCreate`],
      ["custom-fields.update", `${K}.permUpdate`],
      ["custom-fields.delete", `${K}.permDelete`],
      ["custom-field-groups.view / .create / .update / .delete / .reorder", `${K}.permGroups`],
    ],
  },
  {
    type: "info",
    variant: "note",
    titleKey: `${K}.planInfoTitle`,
    contentKey: `${K}.planInfoContent`,
  },
];

registerPage({
  slug: "modules/custom-fields",
  titleKey: `${K}.title`,
  descriptionKey: `${K}.description`,
  category: "modules",
  order: 1,
  sections,
  relatedSlugs: [
    "modules/custom-fields-value-types",
    "modules/custom-fields-references",
    "modules/custom-fields-defining",
  ],
  lastUpdated: "2026-08-21",
});
