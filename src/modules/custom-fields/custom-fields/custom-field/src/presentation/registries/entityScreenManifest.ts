/**
 * Entity-screen manifest — this repo's own machine-readable answer to
 * "which entity types does a frontend screen actually render custom fields
 * for?" (Wave 5 row 5.5, ruling R6).
 *
 * WHY THIS EXISTS
 * ---------------
 * `EntityTypeItem.HasFrontendScreen` is a hand-typed boolean at each backend
 * registration site (`registry.Register(..., hasFrontendScreen: false)` in
 * the twelve `*EntityTypeCatalog.cs` files). It is an assertion the BACKEND
 * makes about the FRONTEND, and until this file nothing on either side could
 * check it: the frontend's own truth was ~33 scattered string literals — a
 * `CrudConfig` field on 30 list screens plus eight `*_ENTITY_TYPE_KEY`
 * constants behind the eight hand-rolled custom-fields form sections — with
 * no manifest, sitemap or generated artifact anywhere. The backend flag could
 * (and silently would) go stale the day a screen shipped or was deleted.
 *
 * WHY A HAND-MAINTAINED LIST RATHER THAN A GENERATED ONE
 * ------------------------------------------------------
 * A generated artifact needs a build step, a committed output, and a CI job
 * that proves the committed output is fresh — i.e. it needs exactly the same
 * completeness gate this list needs, plus a generator to maintain. This
 * module already solved the identical problem twice without a generator:
 * `valueTypeRegistry.ts` and `validatorKindRegistry.ts` are hand-written
 * catalogs pinned by tests that resolve the REAL source and fail with the
 * *name* of whatever is missing. This file matches that spirit exactly:
 *
 *   - `entityScreenManifest.completeness.test.ts` scans this repo's own
 *     `src/` for both declaration shapes and fails, naming the key, when a
 *     screen declares an entity type this list does not carry (or when this
 *     list carries one no screen declares any more). "Someone added a screen
 *     and forgot the manifest" is a RED test that prints the key, never a
 *     silent pass.
 *   - `entityScreenManifest.backendContract.test.ts` diffs this list against
 *     the real `hasFrontendScreen` literals in the sibling SCRIPE-Backend
 *     checkout, in BOTH directions.
 *
 * This list is also consumed at runtime by `EntityTypeCatalogView.tsx`, which
 * renders the backend's claim and this repo's claim side by side and flags
 * the rows that disagree — so drift is visible to an operator, not only to
 * CI. That is deliberate: a manifest only tests can see is a manifest nobody
 * notices going stale.
 *
 * WHAT COUNTS AS "HAS A FRONTEND SCREEN"
 * --------------------------------------
 * The backend's own contract wording (`IEntityTypeRegistry.Register`) is
 * "whether a frontend screen actually renders this entity type's custom
 * fields today" — NOT merely "a screen for this entity exists". So a key
 * belongs here when, and only when, one of these is true in this repo:
 *
 *   1. a screen's `CrudConfig` carries `entityTypeKey`, which is what makes
 *      `GenericCrudView` fetch and render custom-field columns and
 *      create/edit/view form fields (see generic-crud-view.tsx); or
 *   2. a hand-rolled form section passes the key to
 *      `useCustomFieldsFormFields` / `saveValues` via an exported
 *      `*_ENTITY_TYPE_KEY` constant (the eight sites named in
 *      renderCustomFieldControl.tsx).
 *
 * A module that has a list screen but has NOT wired either of those does not
 * belong here, and the backend flagging it `false` is correct.
 *
 * HOW TO EDIT
 * -----------
 * Add the key when you wire a screen; remove it when you unwire one. Keep it
 * sorted. Then run the two test files above — the second one will tell you
 * whether the backend registration needs flipping to match, which is a change
 * in the OTHER repo.
 */

/**
 * Every entity-type key this repo renders custom fields for today, sorted.
 *
 * Sorted purely so diffs stay readable — no consumer depends on the order,
 * and the completeness test compares sorted sets, not sequences.
 */
export const ENTITY_TYPES_WITH_FRONTEND_SCREEN = [
  "communication.message-template",
  "compliance.data-inventory",
  "compliance.dsr",
  "entitlements.lead",
  "entitlements.onboarding-question",
  "entitlements.onboarding-rule",
  "entitlements.tenant-feature-definition",
  "entitlements.tenant-plan",
  "entitlements.user-subscription",
  "facilityoperations.facility",
  "facilityoperations.venue-profile",
  "hrms.certification",
  "hrms.employment-record",
  "hrms.qualification",
  "hrms.staff-assignment",
  "hrms.staff-availability",
  "hrms.staff-competency",
  "hrms.staff-member",
  "identity.admin",
  "identity.theme",
  "identity.user",
  "identity.user-group",
  "integrations.api-key",
  "integrations.webhook-subscription",
  "party.contact-point",
  "party.merge-candidate",
  "party.organization",
  "party.party",
  "party.person",
  "party.relationship",
  "party.role",
  "plugins.definition",
  "workmanagement.work-item",
] as const;

/** The union of keys declared above. */
export type EntityTypeKeyWithFrontendScreen = (typeof ENTITY_TYPES_WITH_FRONTEND_SCREEN)[number];

/**
 * Module-level Set so the per-row lookup in `EntityTypeCatalogView` is O(1)
 * rather than a linear scan of 33 strings per rendered row.
 */
const SCREEN_KEY_SET: ReadonlySet<string> = new Set(ENTITY_TYPES_WITH_FRONTEND_SCREEN);

/**
 * True when THIS repo renders custom fields for `entityTypeKey`.
 *
 * Deliberately takes a plain `string`, not the narrowed union: every caller
 * feeds it a key that arrived over the wire from the backend registry, which
 * is a strictly larger set than the screens this repo has built.
 */
export function hasFrontendScreenInThisRepo(entityTypeKey: string): boolean {
  return SCREEN_KEY_SET.has(entityTypeKey);
}
