/**
 * Custom Fields — Field-level security (product documentation).
 */

import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const K = "modules.customFields.docs.security";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: `${K}.intro` },
  {
    type: "info",
    variant: "warning",
    titleKey: `${K}.notSensitivityTitle`,
    contentKey: `${K}.notSensitivityContent`,
  },

  // ─── Where it is configured ───────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.whereTitle`, id: "where-it-is-configured" },
  { type: "paragraph", contentKey: `${K}.whereIntro` },
  {
    type: "list",
    variant: "unordered",
    items: [`${K}.where1`, `${K}.where2`],
  },
  { type: "paragraph", contentKey: `${K}.whereKeyed` },
  {
    type: "table",
    headers: [`${K}.thAspect`, `${K}.thBehaviour`],
    rows: [
      [`${K}.aspSources`, `${K}.behSources`],
      [`${K}.aspCase`, `${K}.behCase`],
      [`${K}.aspResource`, `${K}.behResource`],
      [`${K}.aspBuiltIn`, `${K}.behBuiltIn`],
      [`${K}.aspExempt`, `${K}.behExempt`],
    ],
  },

  // ─── What a restricted person sees ────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.seesTitle`, id: "what-a-restricted-person-sees" },
  { type: "paragraph", contentKey: `${K}.seesIntro` },
  { type: "paragraph", contentKey: `${K}.seesIndistinguishable` },

  // ─── Saving around a hidden field ─────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.savingTitle`, id: "saving-around-a-hidden-field" },
  { type: "paragraph", contentKey: `${K}.savingIntro` },
  { type: "paragraph", contentKey: `${K}.savingWhy` },
  {
    type: "info",
    variant: "success",
    titleKey: `${K}.savingInfoTitle`,
    contentKey: `${K}.savingInfoContent`,
  },

  // ─── Writing a restricted field on purpose ────────────────
  { type: "heading", level: 2, titleKey: `${K}.writingTitle`, id: "writing-a-restricted-field" },
  { type: "paragraph", contentKey: `${K}.writingIntro` },
  { type: "paragraph", contentKey: `${K}.writingProbe` },
  {
    type: "table",
    headers: [`${K}.thAttempt`, `${K}.thResult`],
    rows: [
      [`${K}.attSaveOthers`, `${K}.resSaveOthers`],
      [`${K}.attWriteRestricted`, `${K}.resWriteRestricted`],
      [`${K}.attWriteSameValue`, `${K}.resWriteSameValue`],
      [`${K}.attReadApi`, `${K}.resReadApi`],
    ],
  },

  // ─── Required and restricted ──────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.requiredTitle`, id: "required-and-restricted" },
  { type: "paragraph", contentKey: `${K}.requiredIntro` },
  {
    type: "table",
    headers: [`${K}.thSituation`, `${K}.thWhatYouSee`],
    rows: [
      [`${K}.reqRestrictRequired`, `${K}.reqRestrictRequiredMsg`],
      [`${K}.reqRequireRestricted`, `${K}.reqRequireRestrictedMsg`],
    ],
  },
  {
    type: "info",
    variant: "note",
    titleKey: `${K}.requiredInfoTitle`,
    contentKey: `${K}.requiredInfoContent`,
  },

  // ─── Interaction with export and history ──────────────────
  { type: "heading", level: 2, titleKey: `${K}.reachTitle`, id: "export-history-and-lists" },
  { type: "paragraph", contentKey: `${K}.reachIntro` },
  {
    type: "list",
    variant: "unordered",
    items: [`${K}.reach1`, `${K}.reach2`, `${K}.reach3`, `${K}.reach4`],
  },

  // ─── A worked example ─────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.exampleTitle`, id: "worked-example" },
  { type: "paragraph", contentKey: `${K}.exampleIntro` },
  {
    type: "step-guide",
    steps: [
      { titleKey: `${K}.e1Title`, contentKey: `${K}.e1Content` },
      { titleKey: `${K}.e2Title`, contentKey: `${K}.e2Content` },
      { titleKey: `${K}.e3Title`, contentKey: `${K}.e3Content` },
      { titleKey: `${K}.e4Title`, contentKey: `${K}.e4Content` },
      { titleKey: `${K}.e5Title`, contentKey: `${K}.e5Content` },
    ],
  },
  {
    type: "info",
    variant: "caution",
    titleKey: `${K}.proofTitle`,
    contentKey: `${K}.proofContent`,
  },
];

registerPage({
  slug: "modules/custom-fields-security",
  titleKey: `${K}.title`,
  descriptionKey: `${K}.description`,
  category: "modules",
  order: 7,
  sections,
  relatedSlugs: [
    "modules/custom-fields-encryption",
    "features/role-permissions",
    "modules/custom-fields-managing",
  ],
  lastUpdated: "2026-08-21",
});
