/**
 * Custom Fields — Defining a Field (product documentation).
 *
 * The full definition-form walkthrough: every control, what it does, what
 * reveals it, and what a rejection looks like. Control names are given as they
 * appear in the English interface.
 */

import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const K = "modules.customFields.docs.defining";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: `${K}.intro` },
  {
    type: "info",
    variant: "tip",
    titleKey: `${K}.beforeTitle`,
    contentKey: `${K}.beforeContent`,
  },

  // ─── Where the screen is ──────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.whereTitle`, id: "where-the-screen-is" },
  { type: "paragraph", contentKey: `${K}.whereIntro` },
  {
    type: "list",
    variant: "unordered",
    items: [`${K}.where1`, `${K}.where2`, `${K}.where3`, `${K}.where4`],
  },

  // ─── The form, control by control ─────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.controlsTitle`, id: "the-form-control-by-control" },
  { type: "paragraph", contentKey: `${K}.controlsIntro` },
  {
    type: "table",
    headers: [`${K}.thControl`, `${K}.thDoes`, `${K}.thWhenShown`],
    rows: [
      ["Entity Type", `${K}.ctlEntityTypeDoes`, `${K}.ctlEntityTypeWhen`],
      ["Key", `${K}.ctlKeyDoes`, `${K}.ctlKeyWhen`],
      ["Label (English)", `${K}.ctlLabelEnDoes`, `${K}.ctlAlways`],
      ["Label (Arabic)", `${K}.ctlLabelArDoes`, `${K}.ctlAlways`],
      ["Value Type", `${K}.ctlValueTypeDoes`, `${K}.ctlValueTypeWhen`],
      ["Placeholder (English)", `${K}.ctlPlaceholderEnDoes`, `${K}.ctlPlaceholderWhen`],
      ["Placeholder (Arabic)", `${K}.ctlPlaceholderArDoes`, `${K}.ctlPlaceholderWhen`],
      ["Options", `${K}.ctlOptionsDoes`, `${K}.ctlOptionsWhen`],
      ["Validator", `${K}.ctlValidatorDoes`, `${K}.ctlValidatorWhen`],
      ["Validator Parameter", `${K}.ctlValidatorParamDoes`, `${K}.ctlValidatorParamWhen`],
      ["Field Group", `${K}.ctlFieldGroupDoes`, `${K}.ctlFieldGroupWhen`],
      ["Required", `${K}.ctlRequiredDoes`, `${K}.ctlAlways`],
      ["Sort Order", `${K}.ctlSortOrderDoes`, `${K}.ctlAlways`],
      ["Sensitivity", `${K}.ctlSensitivityDoes`, `${K}.ctlAlways`],
      ["Include in exports", `${K}.ctlExportableDoes`, `${K}.ctlAlways`],
      ["Active", `${K}.ctlActiveDoes`, `${K}.ctlActiveWhen`],
      ["Global (all tenants)", `${K}.ctlGlobalDoes`, `${K}.ctlGlobalWhen`],
    ],
  },

  // ─── Step by step ─────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.stepsTitle`, id: "step-by-step" },
  { type: "paragraph", contentKey: `${K}.stepsIntro` },
  {
    type: "step-guide",
    steps: [
      { titleKey: `${K}.s1Title`, contentKey: `${K}.s1Content` },
      { titleKey: `${K}.s2Title`, contentKey: `${K}.s2Content` },
      { titleKey: `${K}.s3Title`, contentKey: `${K}.s3Content` },
      { titleKey: `${K}.s4Title`, contentKey: `${K}.s4Content` },
      { titleKey: `${K}.s5Title`, contentKey: `${K}.s5Content` },
      { titleKey: `${K}.s6Title`, contentKey: `${K}.s6Content` },
      { titleKey: `${K}.s7Title`, contentKey: `${K}.s7Content` },
      { titleKey: `${K}.s8Title`, contentKey: `${K}.s8Content` },
    ],
  },

  // ─── The key ──────────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.keyTitle`, id: "choosing-a-key" },
  { type: "paragraph", contentKey: `${K}.keyIntro` },
  {
    type: "table",
    headers: [`${K}.thKeyExample`, `${K}.thOutcome`],
    rows: [
      ["shirt_size", `${K}.keyOk`],
      ["preferred_foot_2", `${K}.keyOkDigits`],
      ["Shirt_Size", `${K}.keyUpper`],
      ["2nd_language", `${K}.keyLeadingDigit`],
      ["shirt-size", `${K}.keyHyphen`],
      ["shirt size", `${K}.keySpace`],
    ],
  },
  {
    type: "info",
    variant: "warning",
    titleKey: `${K}.keyWarnTitle`,
    contentKey: `${K}.keyWarnContent`,
  },

  // ─── Adding a field from inside a record ──────────────────
  { type: "heading", level: 2, titleKey: `${K}.inlineTitle`, id: "adding-from-a-record" },
  { type: "paragraph", contentKey: `${K}.inlineIntro` },
  {
    type: "step-guide",
    steps: [
      { titleKey: `${K}.i1Title`, contentKey: `${K}.i1Content` },
      { titleKey: `${K}.i2Title`, contentKey: `${K}.i2Content` },
      { titleKey: `${K}.i3Title`, contentKey: `${K}.i3Content` },
      { titleKey: `${K}.i4Title`, contentKey: `${K}.i4Content` },
    ],
  },
  {
    type: "info",
    variant: "note",
    titleKey: `${K}.inlineInfoTitle`,
    contentKey: `${K}.inlineInfoContent`,
  },

  // ─── Rejections ───────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.rejectTitle`, id: "what-gets-rejected" },
  { type: "paragraph", contentKey: `${K}.rejectIntro` },
  {
    type: "table",
    headers: [`${K}.thSituation`, `${K}.thWhatYouSee`],
    rows: [
      [`${K}.rejDuplicateKey`, `${K}.rejDuplicateKeyMsg`],
      [`${K}.rejUnknownEntityType`, `${K}.rejUnknownEntityTypeMsg`],
      [`${K}.rejNoOptions`, `${K}.rejNoOptionsMsg`],
      [`${K}.rejOptionsOnOther`, `${K}.rejOptionsOnOtherMsg`],
      [`${K}.rejValidatorNonText`, `${K}.rejValidatorNonTextMsg`],
      [`${K}.rejValidatorNoParam`, `${K}.rejValidatorNoParamMsg`],
      [`${K}.rejValidatorExtraParam`, `${K}.rejValidatorExtraParamMsg`],
      [`${K}.rejRequiredRestricted`, `${K}.rejRequiredRestrictedMsg`],
      [`${K}.rejGroupWrongType`, `${K}.rejGroupWrongTypeMsg`],
      [`${K}.rejGlobalNotSuperAdmin`, `${K}.rejGlobalNotSuperAdminMsg`],
      [`${K}.rejQuota`, `${K}.rejQuotaMsg`],
    ],
  },

  // ─── After saving ─────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.afterTitle`, id: "after-saving" },
  { type: "paragraph", contentKey: `${K}.afterIntro` },
  {
    type: "comparison",
    columns: [
      {
        titleKey: `${K}.editableTitle`,
        variant: "positive",
        items: [
          `${K}.editable1`,
          `${K}.editable2`,
          `${K}.editable3`,
          `${K}.editable4`,
          `${K}.editable5`,
          `${K}.editable6`,
          `${K}.editable7`,
        ],
      },
      {
        titleKey: `${K}.permanentTitle`,
        variant: "negative",
        items: [`${K}.permanent1`, `${K}.permanent2`, `${K}.permanent3`, `${K}.permanent4`],
      },
    ],
  },
  { type: "paragraph", contentKey: `${K}.afterOutro` },

  // ─── Verifying it worked ──────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.verifyTitle`, id: "verifying-it-worked" },
  { type: "paragraph", contentKey: `${K}.verifyIntro` },
  {
    type: "list",
    variant: "ordered",
    items: [`${K}.verify1`, `${K}.verify2`, `${K}.verify3`, `${K}.verify4`],
  },
  {
    type: "info",
    variant: "caution",
    titleKey: `${K}.verifyWarnTitle`,
    contentKey: `${K}.verifyWarnContent`,
  },
];

registerPage({
  slug: "modules/custom-fields-defining",
  titleKey: `${K}.title`,
  descriptionKey: `${K}.description`,
  category: "modules",
  order: 3,
  sections,
  relatedSlugs: ["modules/custom-fields-value-types", "modules/custom-fields-options"],
  lastUpdated: "2026-08-21",
});
