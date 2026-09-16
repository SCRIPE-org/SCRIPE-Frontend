/**
 * Custom Fields — Options for Select and MultiSelect (product documentation).
 */

import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const K = "modules.customFields.docs.options";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: `${K}.intro` },
  {
    type: "info",
    variant: "warning",
    titleKey: `${K}.storedInfoTitle`,
    contentKey: `${K}.storedInfoContent`,
  },

  // ─── The editor ───────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.editorTitle`, id: "the-options-editor" },
  { type: "paragraph", contentKey: `${K}.editorIntro` },
  {
    type: "list",
    variant: "unordered",
    items: [`${K}.editor1`, `${K}.editor2`, `${K}.editor3`, `${K}.editor4`, `${K}.editor5`],
  },
  { type: "paragraph", contentKey: `${K}.editorBilingual` },

  // ─── A worked example ─────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.exampleTitle`, id: "worked-example" },
  { type: "paragraph", contentKey: `${K}.exampleIntro` },
  {
    type: "table",
    headers: [`${K}.thEnglish`, `${K}.thArabic`, `${K}.thStored`],
    rows: [
      ["Small", "صغير", "Small"],
      ["Medium", "متوسط", "Medium"],
      ["Large", "كبير", "Large"],
    ],
  },
  { type: "paragraph", contentKey: `${K}.exampleOutro` },

  // ─── How a submitted value is matched ─────────────────────
  { type: "heading", level: 2, titleKey: `${K}.matchTitle`, id: "how-values-are-matched" },
  { type: "paragraph", contentKey: `${K}.matchIntro` },
  {
    type: "table",
    headers: [`${K}.thSubmitted`, `${K}.thOutcome`],
    rows: [
      ["Medium", `${K}.matchOk`],
      [`${K}.exPadded`, `${K}.matchTrimmed`],
      ["medium", `${K}.matchCase`],
      ["متوسط", `${K}.matchArabic`],
      ["Extra-Large", `${K}.matchUnknown`],
      [`${K}.exBlank`, `${K}.matchBlank`],
    ],
  },

  // ─── MultiSelect ──────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.multiTitle`, id: "multiselect" },
  { type: "paragraph", contentKey: `${K}.multiIntro` },
  {
    type: "table",
    headers: [`${K}.thSubmitted`, `${K}.thOutcome`],
    rows: [
      [`${K}.exMultiOrder`, `${K}.multiOrder`],
      [`${K}.exMultiRemove`, `${K}.multiRemove`],
      [`${K}.exMultiTwenty`, `${K}.multiTooMany`],
      [`${K}.exMultiRepeat`, `${K}.multiDuplicate`],
      [`${K}.exMultiEmptyList`, `${K}.multiEmpty`],
    ],
  },
  {
    type: "info",
    variant: "caution",
    titleKey: `${K}.multiOrderWarnTitle`,
    contentKey: `${K}.multiOrderWarnContent`,
  },

  // ─── Changing the list later ──────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.changingTitle`, id: "changing-the-list" },
  { type: "paragraph", contentKey: `${K}.changingIntro` },
  {
    type: "table",
    headers: [`${K}.thChange`, `${K}.thEffect`],
    rows: [
      [`${K}.chgAdd`, `${K}.chgAddEffect`],
      [`${K}.chgRename`, `${K}.chgRenameEffect`],
      [`${K}.chgRemove`, `${K}.chgRemoveEffect`],
      [`${K}.chgReorder`, `${K}.chgReorderEffect`],
      [`${K}.chgArabicOnly`, `${K}.chgArabicOnlyEffect`],
    ],
  },
  {
    type: "info",
    variant: "warning",
    titleKey: `${K}.renameWarnTitle`,
    contentKey: `${K}.renameWarnContent`,
  },

  // ─── Errors ───────────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.errorsTitle`, id: "option-errors" },
  {
    type: "table",
    headers: [`${K}.thSituation`, `${K}.thWhatYouSee`],
    rows: [
      [`${K}.errNoOptions`, `${K}.errNoOptionsMsg`],
      [`${K}.errOptionsOnOther`, `${K}.errOptionsOnOtherMsg`],
      [`${K}.errNotAllowed`, `${K}.errNotAllowedMsg`],
      [`${K}.errTooMany`, `${K}.errTooManyMsg`],
      [`${K}.errDuplicate`, `${K}.errDuplicateMsg`],
    ],
  },

  // ─── Not available ────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.notYetTitle`, id: "not-available" },
  { type: "paragraph", contentKey: `${K}.notYetIntro` },
  {
    type: "list",
    variant: "unordered",
    items: [`${K}.notYet1`, `${K}.notYet2`, `${K}.notYet3`],
  },
];

registerPage({
  slug: "modules/custom-fields-options",
  titleKey: `${K}.title`,
  descriptionKey: `${K}.description`,
  category: "modules",
  order: 5,
  sections,
  relatedSlugs: ["modules/custom-fields-value-types", "modules/custom-fields-defining"],
  lastUpdated: "2026-08-21",
});
