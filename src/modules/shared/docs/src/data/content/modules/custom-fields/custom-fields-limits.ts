/**
 * Custom Fields — Limits and behaviours (product documentation).
 *
 * Every limit a user can reasonably hit, each with the reason it is that way.
 * Stated plainly so nobody spends an afternoon looking for a setting that does
 * not exist.
 */

import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const K = "modules.customFields.docs.limits";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: `${K}.intro` },

  // ─── Hard numbers ─────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.numbersTitle`, id: "hard-numbers" },
  { type: "paragraph", contentKey: `${K}.numbersIntro` },
  {
    type: "table",
    headers: [`${K}.thLimit`, `${K}.thValue`, `${K}.thConfigurable`],
    rows: [
      [`${K}.limTextLength`, "4,000", `${K}.cfgNo`],
      [`${K}.limLongTextLength`, "10,000", `${K}.cfgNo`],
      [`${K}.limMultiSelect`, "19", `${K}.cfgNo`],
      [`${K}.limRating`, "1 – 5", `${K}.cfgNo`],
      [`${K}.limPercent`, "0 – 100", `${K}.cfgNo`],
      [`${K}.limPhoneDigits`, "8 – 15", `${K}.cfgNo`],
      [`${K}.limCurrencyCode`, "3", `${K}.cfgNo`],
      [`${K}.limDuration`, `${K}.valNoUpperBound`, `${K}.cfgNo`],
      [`${K}.limReferencePage`, "20", `${K}.cfgNo`],
      [`${K}.limReferencePageMax`, "100", `${K}.cfgNo`],
      [`${K}.limGroupReorder`, "100", `${K}.cfgNo`],
      [`${K}.limExportRows`, "10,000", `${K}.cfgNo`],
      [`${K}.limFieldsPerWorkspace`, `${K}.valPlanQuota`, `${K}.cfgPlan`],
    ],
  },

  // ─── Validators ───────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.validatorsTitle`, id: "validator-limits" },
  {
    type: "table",
    headers: [`${K}.thBehaviour`, `${K}.thWhy`],
    rows: [
      [`${K}.vTextOnly`, `${K}.vTextOnlyWhy`],
      [`${K}.vNoRetro`, `${K}.vNoRetroWhy`],
      [`${K}.vWhitespace`, `${K}.vWhitespaceWhy`],
      [`${K}.vNoRegex`, `${K}.vNoRegexWhy`],
      [`${K}.vNoFilter`, `${K}.vNoFilterWhy`],
      [`${K}.vNoReference`, `${K}.vNoReferenceWhy`],
      [`${K}.vNoChecksumEgUae`, `${K}.vNoChecksumEgUaeWhy`],
      [`${K}.vNoAe`, `${K}.vNoAeWhy`],
    ],
  },

  // ─── Value types ──────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.typesTitle`, id: "value-type-behaviours" },
  {
    type: "table",
    headers: [`${K}.thBehaviour`, `${K}.thWhy`],
    rows: [
      [`${K}.tValueTypeFixed`, `${K}.tValueTypeFixedWhy`],
      [`${K}.tMultiOrder`, `${K}.tMultiOrderWhy`],
      [`${K}.tLongTextNoBlock`, `${K}.tLongTextNoBlockWhy`],
      [`${K}.tCurrencyShape`, `${K}.tCurrencyShapeWhy`],
      [`${K}.tCurrencyPlain`, `${K}.tCurrencyPlainWhy`],
      [`${K}.tDurationMinutes`, `${K}.tDurationMinutesWhy`],
      [`${K}.tRatingSlider`, `${K}.tRatingSliderWhy`],
      [`${K}.tRatingZero`, `${K}.tRatingZeroWhy`],
      [`${K}.tPhoneShape`, `${K}.tPhoneShapeWhy`],
      [`${K}.tPhoneFlag`, `${K}.tPhoneFlagWhy`],
      [`${K}.tColorShorthand`, `${K}.tColorShorthandWhy`],
      [`${K}.tTimeText`, `${K}.tTimeTextWhy`],
      [`${K}.tPercentStorage`, `${K}.tPercentStorageWhy`],
      [`${K}.tTextNotTrimmed`, `${K}.tTextNotTrimmedWhy`],
      [`${K}.tOracleBytes`, `${K}.tOracleBytesWhy`],
    ],
  },

  // ─── References ───────────────────────────────────────────
  // Wave 4's two reference types. Their own group rather than rows in the
  // value-type table above, because most of what is worth stating about them is
  // not about what they accept -- it is about what they deliberately never do
  // (store a name, list backlinks, reach an administrator record).
  { type: "heading", level: 2, titleKey: `${K}.referencesTitle`, id: "reference-behaviours" },
  {
    type: "table",
    headers: [`${K}.thBehaviour`, `${K}.thWhy`],
    rows: [
      [`${K}.fNoStoredName`, `${K}.fNoStoredNameWhy`],
      [`${K}.fIdOpaque`, `${K}.fIdOpaqueWhy`],
      [`${K}.fSameNames`, `${K}.fSameNamesWhy`],
      [`${K}.fFiveFailures`, `${K}.fFiveFailuresWhy`],
      [`${K}.fMergedAnswers`, `${K}.fMergedAnswersWhy`],
      [`${K}.fDeleteClears`, `${K}.fDeleteClearsWhy`],
      [`${K}.fNoBacklinks`, `${K}.fNoBacklinksWhy`],
      [`${K}.fLimitedTargets`, `${K}.fLimitedTargetsWhy`],
      [`${K}.fNoAdminTarget`, `${K}.fNoAdminTargetWhy`],
      [`${K}.fUnpinnedIsLegal`, `${K}.fUnpinnedIsLegalWhy`],
      [`${K}.fPopulatedUnpinned`, `${K}.fPopulatedUnpinnedWhy`],
      [`${K}.fNotExported`, `${K}.fNotExportedWhy`],
      [`${K}.fSingleValue`, `${K}.fSingleValueWhy`],
    ],
  },

  // ─── Options ──────────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.optionsTitle`, id: "option-behaviours" },
  {
    type: "table",
    headers: [`${K}.thBehaviour`, `${K}.thWhy`],
    rows: [
      [`${K}.oTextIsValue`, `${K}.oTextIsValueWhy`],
      [`${K}.oCaseSensitive`, `${K}.oCaseSensitiveWhy`],
      [`${K}.oEnglishStored`, `${K}.oEnglishStoredWhy`],
      [`${K}.oNoSharedSets`, `${K}.oNoSharedSetsWhy`],
    ],
  },

  // ─── Groups ───────────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.groupsTitle`, id: "group-behaviours" },
  {
    type: "table",
    headers: [`${K}.thBehaviour`, `${K}.thWhy`],
    rows: [
      [`${K}.gStableKeyFixed`, `${K}.gStableKeyFixedWhy`],
      [`${K}.gReorderCeiling`, `${K}.gReorderCeilingWhy`],
      [`${K}.gGlobalOrdering`, `${K}.gGlobalOrderingWhy`],
      [`${K}.gSeparatePerms`, `${K}.gSeparatePermsWhy`],
      [`${K}.gOneEntityType`, `${K}.gOneEntityTypeWhy`],
      [`${K}.gUniquenessIndex`, `${K}.gUniquenessIndexWhy`],
    ],
  },

  // ─── Security and classification ──────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.securityTitle`, id: "security-behaviours" },
  {
    type: "table",
    headers: [`${K}.thBehaviour`, `${K}.thWhy`],
    rows: [
      [`${K}.sSensitivityLabel`, `${K}.sSensitivityLabelWhy`],
      [`${K}.sRestrictedByResource`, `${K}.sRestrictedByResourceWhy`],
      [`${K}.sRestrictedInvisible`, `${K}.sRestrictedInvisibleWhy`],
      [`${K}.sRejectWholeSave`, `${K}.sRejectWholeSaveWhy`],
      [`${K}.sRequiredExclusive`, `${K}.sRequiredExclusiveWhy`],
      [`${K}.sHistoryNoValues`, `${K}.sHistoryNoValuesWhy`],
    ],
  },

  // ─── Export and portability ───────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.exportTitle`, id: "export-behaviours" },
  {
    type: "table",
    headers: [`${K}.thBehaviour`, `${K}.thWhy`],
    rows: [
      [`${K}.eDefinitionsOnly`, `${K}.eDefinitionsOnlyWhy`],
      [`${K}.eRefusesPastLimit`, `${K}.eRefusesPastLimitWhy`],
      [`${K}.eRestrictedAbsent`, `${K}.eRestrictedAbsentWhy`],
      [`${K}.eNoImport`, `${K}.eNoImportWhy`],
      [`${K}.eTextCells`, `${K}.eTextCellsWhy`],
    ],
  },

  // ─── Screens and reach ────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.reachTitle`, id: "screens-and-reach" },
  {
    type: "table",
    headers: [`${K}.thBehaviour`, `${K}.thWhy`],
    rows: [
      [`${K}.rApiOnlyTypes`, `${K}.rApiOnlyTypesWhy`],
      [`${K}.rHandRolledForms`, `${K}.rHandRolledFormsWhy`],
      [`${K}.rDsrCreateOnly`, `${K}.rDsrCreateOnlyWhy`],
      [`${K}.rDialogForms`, `${K}.rDialogFormsWhy`],
      [`${K}.rNoSidebarEntry`, `${K}.rNoSidebarEntryWhy`],
    ],
  },

  // ─── Not in the product ───────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.absentTitle`, id: "not-in-the-product" },
  { type: "paragraph", contentKey: `${K}.absentIntro` },
  {
    type: "list",
    variant: "unordered",
    items: [
      `${K}.absent1`,
      `${K}.absent2`,
      `${K}.absent3`,
      `${K}.absent4`,
      `${K}.absent5`,
      `${K}.absent6`,
    ],
  },
  {
    type: "info",
    variant: "note",
    titleKey: `${K}.absentInfoTitle`,
    contentKey: `${K}.absentInfoContent`,
  },
];

registerPage({
  slug: "modules/custom-fields-limits",
  titleKey: `${K}.title`,
  descriptionKey: `${K}.description`,
  category: "modules",
  order: 9,
  sections,
  relatedSlugs: ["modules/custom-fields", "modules/custom-fields-value-types"],
  lastUpdated: "2026-08-21",
});
