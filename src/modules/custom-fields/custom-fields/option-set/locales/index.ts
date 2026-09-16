/**
 * Option-set locale barrel.
 *
 * Pure re-exports — BOTH languages in one chunk, deliberately. Views load this module lazily via
 * `useModuleLocales(() => import("../../../locales"), "customFieldOptionSets")`, and the language can
 * change at runtime without a reload; shipping en and ar together means the switch costs no second
 * network round-trip, at the price of one small chunk instead of two.
 *
 * The dedup key passed alongside the import is what keeps several option-set views mounted at once
 * from re-registering the same dictionary, so it must stay "customFieldOptionSets" everywhere.
 */
export { en } from "./option-set.en";
export { ar } from "./option-set.ar";
