// FILE-EXCEPTION: file length
/**
 * Custom Fields — Reference Fields page (product documentation).
 *
 * The two value types that store a pointer at a record in another module
 * (EntityReference = 17, UserReference = 18) rather than storing text: which of
 * the two to use, the two pieces a reference value is made of, why a display
 * name is never stored beside the pointer, the optional definition-level target
 * pin, which record types can actually be referenced, the workspace rules, and
 * two worked examples.
 *
 * Every claim here is taken from the shipped implementation — the two value-type
 * handlers, the entity-lookup registry and controller, the lookup providers, and
 * the record-form control — not paraphrased from a plan. The lookup mechanics
 * themselves (three lookups, every answer, every failure state, delete
 * behaviour) live on the sibling Reference Lookups page so that this one can
 * stay about the concepts.
 */

import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const K = "modules.customFields.docs.references";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: `${K}.intro` },
  {
    type: "info",
    variant: "note",
    titleKey: `${K}.oneLineTitle`,
    contentKey: `${K}.oneLineContent`,
  },

  // ─── What you get ─────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.whatTitle`, id: "what-they-give-you" },
  { type: "paragraph", contentKey: `${K}.whatIntro` },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      { icon: "link", titleKey: `${K}.featPointsAt`, descriptionKey: `${K}.featPointsAtDesc` },
      { icon: "eye", titleKey: `${K}.featLiveName`, descriptionKey: `${K}.featLiveNameDesc` },
      { icon: "shield", titleKey: `${K}.featPermission`, descriptionKey: `${K}.featPermissionDesc` },
      { icon: "search", titleKey: `${K}.featSearch`, descriptionKey: `${K}.featSearchDesc` },
      { icon: "check", titleKey: `${K}.featPinned`, descriptionKey: `${K}.featPinnedDesc` },
      { icon: "refresh", titleKey: `${K}.featSelfHealing`, descriptionKey: `${K}.featSelfHealingDesc` },
    ],
  },

  // ─── Which of the two ─────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.whichTitle`, id: "which-one-to-use" },
  { type: "paragraph", contentKey: `${K}.whichIntro` },
  {
    type: "table",
    headers: [`${K}.thAspect`, `${K}.thEntityRef`, `${K}.thUserRef`],
    rows: [
      [`${K}.aspTargets`, `${K}.entTargets`, `${K}.usrTargets`],
      [`${K}.aspConfig`, `${K}.entConfig`, `${K}.usrConfig`],
      [`${K}.aspPicker`, `${K}.entPicker`, `${K}.usrPicker`],
      [`${K}.aspUse`, `${K}.entUse`, `${K}.usrUse`],
      [`${K}.aspStorage`, `${K}.entStorage`, `${K}.usrStorage`],
    ],
  },
  {
    type: "info",
    variant: "note",
    titleKey: `${K}.whichInfoTitle`,
    contentKey: `${K}.whichInfoContent`,
  },

  // ─── What is stored ───────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.storedTitle`, id: "what-is-stored" },
  { type: "paragraph", contentKey: `${K}.storedIntro` },
  {
    type: "table",
    headers: [`${K}.thPiece`, `${K}.thWhat`, `${K}.thRequired`],
    rows: [
      [`${K}.pieceTypeName`, `${K}.pieceTypeKey`, `${K}.pieceTypeKeyRequired`],
      [`${K}.pieceIdName`, `${K}.pieceId`, `${K}.pieceIdRequired`],
    ],
  },
  { type: "paragraph", contentKey: `${K}.storedNeither` },
  {
    type: "info",
    variant: "warning",
    titleKey: `${K}.storedIdsTitle`,
    contentKey: `${K}.storedIdsContent`,
  },
  {
    type: "info",
    variant: "note",
    titleKey: `${K}.storedSymmetryTitle`,
    contentKey: `${K}.storedSymmetryContent`,
  },

  // ─── Why no stored name ───────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.nameTitle`, id: "why-no-stored-name" },
  { type: "paragraph", contentKey: `${K}.nameIntro` },
  { type: "paragraph", contentKey: `${K}.nameWhy` },
  { type: "paragraph", contentKey: `${K}.nameCost` },
  {
    type: "info",
    variant: "note",
    titleKey: `${K}.nameInfoTitle`,
    contentKey: `${K}.nameInfoContent`,
  },

  // ─── Pinning a target type ────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.pinTitle`, id: "pinning-a-target-type" },
  { type: "paragraph", contentKey: `${K}.pinIntro` },
  {
    type: "table",
    headers: [`${K}.thState`, `${K}.thMeans`, `${K}.thPickerShows`],
    rows: [
      [`${K}.stateUnpinned`, `${K}.meansUnpinned`, `${K}.pickerUnpinned`],
      [`${K}.statePinned`, `${K}.meansPinned`, `${K}.pickerPinned`],
      [`${K}.stateUserRef`, `${K}.meansUserRef`, `${K}.pickerUserRef`],
    ],
  },
  { type: "paragraph", contentKey: `${K}.pinRepoint` },
  { type: "paragraph", contentKey: `${K}.pinRepointDetail` },
  {
    type: "info",
    variant: "caution",
    titleKey: `${K}.pinWarnTitle`,
    contentKey: `${K}.pinWarnContent`,
  },

  // ─── What can be referenced ───────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.targetsTitle`, id: "what-can-be-referenced" },
  { type: "paragraph", contentKey: `${K}.targetsIntro` },
  {
    type: "table",
    headers: [`${K}.thType`, `${K}.thKey`, `${K}.thOwner`, `${K}.thShows`],
    rows: [
      [`${K}.typeStaff`, `${K}.keyStaff`, `${K}.ownerStaff`, `${K}.showsStaff`],
      [`${K}.typeUser`, `${K}.keyUser`, `${K}.ownerUser`, `${K}.showsUser`],
      [`${K}.typePerson`, `${K}.keyPerson`, `${K}.ownerPerson`, `${K}.showsPerson`],
    ],
  },
  { type: "paragraph", contentKey: `${K}.targetsRefused` },
  { type: "paragraph", contentKey: `${K}.targetsEmpty` },
  { type: "paragraph", contentKey: `${K}.targetsWhyNot` },
  {
    type: "list",
    variant: "unordered",
    items: [
      `${K}.targetsWhyNotAdmin`,
      `${K}.targetsWhyNotGroup`,
      `${K}.targetsWhyNotTheme`,
    ],
  },
  {
    type: "info",
    variant: "note",
    titleKey: `${K}.targetsInfoTitle`,
    contentKey: `${K}.targetsInfoContent`,
  },

  // ─── Workspace and platform rules ─────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.tenantTitle`, id: "workspace-rules" },
  { type: "paragraph", contentKey: `${K}.tenantIntro` },
  {
    type: "list",
    variant: "ordered",
    items: [
      `${K}.tenant1`,
      `${K}.tenant2`,
      `${K}.tenant3`,
      `${K}.tenant4`,
      `${K}.tenant5`,
    ],
  },
  {
    type: "info",
    variant: "warning",
    titleKey: `${K}.tenantWarnTitle`,
    contentKey: `${K}.tenantWarnContent`,
  },

  // ─── Worked example: administrator → staff member ─────────
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
      { titleKey: `${K}.ex6Title`, contentKey: `${K}.ex6Content` },
    ],
  },

  // ─── Worked example: Reviewed by ──────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.userExampleTitle`, id: "user-reference-example" },
  { type: "paragraph", contentKey: `${K}.userExampleIntro` },
  {
    type: "step-guide",
    steps: [
      { titleKey: `${K}.ux1Title`, contentKey: `${K}.ux1Content` },
      { titleKey: `${K}.ux2Title`, contentKey: `${K}.ux2Content` },
      { titleKey: `${K}.ux3Title`, contentKey: `${K}.ux3Content` },
      { titleKey: `${K}.ux4Title`, contentKey: `${K}.ux4Content` },
    ],
  },

  // ─── What they are not ────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.notTitle`, id: "what-they-are-not" },
  { type: "paragraph", contentKey: `${K}.notIntro` },
  {
    type: "list",
    variant: "unordered",
    items: [
      `${K}.not1`,
      `${K}.not2`,
      `${K}.not3`,
      `${K}.not4`,
      `${K}.not5`,
      `${K}.not6`,
    ],
  },

  // ─── Where next ───────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.nextTitle`, id: "where-next" },
  { type: "paragraph", contentKey: `${K}.nextIntro` },
  {
    type: "table",
    headers: [`${K}.thPage`, `${K}.thCovers`],
    rows: [
      [`${K}.pageLookups`, `${K}.coversLookups`],
      [`${K}.pageValueTypes`, `${K}.coversValueTypes`],
      [`${K}.pageDefining`, `${K}.coversDefining`],
    ],
  },
];

registerPage({
  slug: "modules/custom-fields-references",
  titleKey: `${K}.title`,
  descriptionKey: `${K}.description`,
  category: "modules",
  // Fractional so the two reference pages slot between Value Types (2) and
  // Defining a Field (3) without renumbering every page after them.
  order: 2.1,
  sections,
  relatedSlugs: [
    "modules/custom-fields-value-types",
    "modules/custom-fields-reference-lookups",
    "modules/custom-fields-defining",
  ],
  lastUpdated: "2026-08-22",
});
