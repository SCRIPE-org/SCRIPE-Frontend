// FILE-EXCEPTION: file length
/**
 * Custom Fields — Reference Lookups page (product documentation).
 *
 * The mechanics behind a reference field: the three lookups that draw one, what
 * every answer and every refusal means, the five failure states an operator can
 * actually see and whose problem each one is, what happens when the referenced
 * record is deleted, how the picker paginates, and the deliberate gaps.
 *
 * The three lookups and their status codes are taken from EntityLookupController
 * and the lookup registry it delegates to; the five failure states are the ones
 * the record-form control genuinely renders as five different sentences, which
 * is the whole reason they are documented as five rather than as "the field is
 * blank". The concepts these lookups serve are on the sibling Reference Fields
 * page.
 */

import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const K = "modules.customFields.docs.referenceLookups";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: `${K}.intro` },
  {
    type: "info",
    variant: "note",
    titleKey: `${K}.whyThreeTitle`,
    contentKey: `${K}.whyThreeContent`,
  },

  // ─── The three lookups ────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.endpointsTitle`, id: "the-three-lookups" },
  { type: "paragraph", contentKey: `${K}.endpointsIntro` },
  // `auth` is not printed by ApiTable -- it renders a lock badge and carries the
  // string only as a data attribute -- so the real permission story is stated in
  // `endpointsPermission` below rather than left to a column nobody reads. The
  // value is kept honest anyway: it is the TARGET type's own view permission,
  // which varies with the entityTypeKey in the path and is therefore not
  // expressible as one literal.
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/entity-lookup/types",
        descriptionKey: `${K}.endpointsTypes`,
        auth: "{target type}.view",
      },
      {
        method: "GET",
        path: "/api/v1/entity-lookup/{entityTypeKey}",
        descriptionKey: `${K}.endpointsSearch`,
        auth: "{target type}.view",
      },
      {
        method: "GET",
        path: "/api/v1/entity-lookup/{entityTypeKey}/{entityId}",
        descriptionKey: `${K}.endpointsResolve`,
        auth: "{target type}.view",
      },
    ],
  },
  { type: "paragraph", contentKey: `${K}.endpointsPermission` },

  { type: "heading", level: 3, titleKey: `${K}.typesTitle`, id: "listing-available-types" },
  { type: "paragraph", contentKey: `${K}.typesWhat` },
  { type: "paragraph", contentKey: `${K}.typesEmpty` },
  { type: "paragraph", contentKey: `${K}.typesShape` },

  { type: "heading", level: 3, titleKey: `${K}.searchTitle`, id: "searching-one-type" },
  { type: "paragraph", contentKey: `${K}.searchWhat` },
  { type: "paragraph", contentKey: `${K}.searchPaging` },
  { type: "paragraph", contentKey: `${K}.searchRows` },
  { type: "paragraph", contentKey: `${K}.searchTyping` },

  { type: "heading", level: 3, titleKey: `${K}.resolveTitle`, id: "resolving-a-reference" },
  { type: "paragraph", contentKey: `${K}.resolveWhat` },
  { type: "paragraph", contentKey: `${K}.resolveGates` },
  { type: "paragraph", contentKey: `${K}.resolveNoName` },

  // ─── What each answer means ───────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.statusesTitle`, id: "what-each-answer-means" },
  { type: "paragraph", contentKey: `${K}.statusesIntro` },
  {
    type: "table",
    headers: [`${K}.thAnswer`, `${K}.thWhatItMeans`, `${K}.thWhoFixes`],
    rows: [
      [`${K}.ansOk`, `${K}.ansOkMeans`, `${K}.ansOkFixes`],
      [`${K}.ansForbidden`, `${K}.ansForbiddenMeans`, `${K}.ansForbiddenFixes`],
      [`${K}.ansNotFound`, `${K}.ansNotFoundMeans`, `${K}.ansNotFoundFixes`],
      [`${K}.ansUnknownType`, `${K}.ansUnknownTypeMeans`, `${K}.ansUnknownTypeFixes`],
      [`${K}.ansUnavailable`, `${K}.ansUnavailableMeans`, `${K}.ansUnavailableFixes`],
      [`${K}.ansInvalidId`, `${K}.ansInvalidIdMeans`, `${K}.ansInvalidIdFixes`],
    ],
  },
  {
    type: "info",
    variant: "note",
    titleKey: `${K}.statusesInfoTitle`,
    contentKey: `${K}.statusesInfoContent`,
  },

  // ─── The five failure states ──────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.failuresTitle`, id: "the-five-failure-states" },
  { type: "paragraph", contentKey: `${K}.failuresIntro` },
  {
    type: "table",
    headers: [`${K}.thState`, `${K}.thOnScreen`, `${K}.thYouDo`],
    rows: [
      [`${K}.stNoPermission`, `${K}.scrNoPermission`, `${K}.doNoPermission`],
      [`${K}.stGone`, `${K}.scrGone`, `${K}.doGone`],
      [`${K}.stMalformed`, `${K}.scrMalformed`, `${K}.doMalformed`],
      [`${K}.stTransient`, `${K}.scrTransient`, `${K}.doTransient`],
      [`${K}.stTypeUnavailable`, `${K}.scrTypeUnavailable`, `${K}.doTypeUnavailable`],
    ],
  },
  {
    type: "info",
    variant: "danger",
    titleKey: `${K}.greyDashTitle`,
    contentKey: `${K}.greyDashContent`,
  },
  {
    type: "info",
    variant: "note",
    titleKey: `${K}.emptyVsFailedTitle`,
    contentKey: `${K}.emptyVsFailedContent`,
  },

  // ─── What is checked on save ───────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.saveTitle`, id: "saving-a-reference" },
  { type: "paragraph", contentKey: `${K}.saveIntro` },
  {
    type: "list",
    variant: "ordered",
    items: [
      `${K}.save1`,
      `${K}.save2`,
      `${K}.save3`,
      `${K}.save4`,
      `${K}.save5`,
      `${K}.save6`,
    ],
  },
  { type: "paragraph", contentKey: `${K}.saveGate` },
  {
    type: "info",
    variant: "note",
    titleKey: `${K}.saveGateInfoTitle`,
    contentKey: `${K}.saveGateInfoContent`,
  },
  { type: "paragraph", contentKey: `${K}.saveWhatStored` },

  // ─── Delete behaviour ─────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.deleteTitle`, id: "when-the-target-is-deleted" },
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
  { type: "paragraph", contentKey: `${K}.deleteScope` },
  { type: "paragraph", contentKey: `${K}.deleteIdempotent` },
  {
    type: "info",
    variant: "note",
    titleKey: `${K}.deleteInfoTitle`,
    contentKey: `${K}.deleteInfoContent`,
  },
  {
    type: "info",
    variant: "note",
    titleKey: `${K}.deleteSoftTitle`,
    contentKey: `${K}.deleteSoftContent`,
  },

  // ─── Picker behaviour ─────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.pickerTitle`, id: "how-the-picker-behaves" },
  { type: "paragraph", contentKey: `${K}.pickerIntro` },
  {
    type: "table",
    headers: [`${K}.thBehaviour`, `${K}.thWhy`],
    rows: [
      [`${K}.pkLazy`, `${K}.pkLazyWhy`],
      [`${K}.pkTwoControls`, `${K}.pkTwoControlsWhy`],
      [`${K}.pkAccumulate`, `${K}.pkAccumulateWhy`],
      [`${K}.pkDormant`, `${K}.pkDormantWhy`],
      [`${K}.pkNoResults`, `${K}.pkNoResultsWhy`],
      [`${K}.pkNoRetry`, `${K}.pkNoRetryWhy`],
      [`${K}.pkViewMode`, `${K}.pkViewModeWhy`],
      [`${K}.pkNoLabelTrick`, `${K}.pkNoLabelTrickWhy`],
    ],
  },

  // ─── Diagnosing a blank reference ─────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.diagnoseTitle`, id: "diagnosing-a-reference" },
  { type: "paragraph", contentKey: `${K}.diagnoseIntro` },
  {
    type: "step-guide",
    steps: [
      { titleKey: `${K}.dg1Title`, contentKey: `${K}.dg1Content` },
      { titleKey: `${K}.dg2Title`, contentKey: `${K}.dg2Content` },
      { titleKey: `${K}.dg3Title`, contentKey: `${K}.dg3Content` },
      { titleKey: `${K}.dg4Title`, contentKey: `${K}.dg4Content` },
      { titleKey: `${K}.dg5Title`, contentKey: `${K}.dg5Content` },
    ],
  },

  // ─── Limits ───────────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.limitsTitle`, id: "limits" },
  { type: "paragraph", contentKey: `${K}.limitsIntro` },
  {
    type: "table",
    headers: [`${K}.thLimit`, `${K}.thDetail`],
    rows: [
      [`${K}.limPageSize`, `${K}.limPageSizeDetail`],
      [`${K}.limDebounce`, `${K}.limDebounceDetail`],
      [`${K}.limNoName`, `${K}.limNoNameDetail`],
      [`${K}.limNoBacklinks`, `${K}.limNoBacklinksDetail`],
      [`${K}.limNoExport`, `${K}.limNoExportDetail`],
      [`${K}.limNoMulti`, `${K}.limNoMultiDetail`],
      [`${K}.limNoTypeFilter`, `${K}.limNoTypeFilterDetail`],
      [`${K}.limNoAdminTarget`, `${K}.limNoAdminTargetDetail`],
    ],
  },

  // ─── Where next ───────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.nextTitle`, id: "where-next" },
  { type: "paragraph", contentKey: `${K}.nextIntro` },
  {
    type: "table",
    headers: [`${K}.thPage`, `${K}.thCovers`],
    rows: [
      [`${K}.pageReferences`, `${K}.coversReferences`],
      [`${K}.pageSecurity`, `${K}.coversSecurity`],
      [`${K}.pageLimits`, `${K}.coversLimits`],
    ],
  },
];

registerPage({
  slug: "modules/custom-fields-reference-lookups",
  titleKey: `${K}.title`,
  descriptionKey: `${K}.description`,
  category: "modules",
  // Fractional, immediately after the Reference Fields page it continues.
  order: 2.2,
  sections,
  relatedSlugs: [
    "modules/custom-fields-references",
    "modules/custom-fields-security",
    "modules/custom-fields-limits",
  ],
  lastUpdated: "2026-08-22",
});
