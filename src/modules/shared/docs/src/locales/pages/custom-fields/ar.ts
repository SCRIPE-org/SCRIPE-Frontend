/**
 * Custom Fields documentation — Arabic (ar).
 *
 * AWAITING TRANSLATION. This re-exports the English strings verbatim, which is deliberate and is not
 * the same as having no file.
 *
 * The translation function in this codebase has no default-value support: a key it cannot resolve
 * renders as its raw dot-path, so `modules.customFields.docs.valueTypes.title` would appear on the
 * page instead of a heading. English prose in a Arabic page is a visible gap a reader understands;
 * a raw dot-path looks like the product is broken. Re-exporting therefore fails softer than either a
 * missing file or a partial one.
 *
 * A previous attempt left a partial file here keyed under `modules.customFields.guide`, which no
 * longer exists — the English source is namespaced `modules.customFields.docs`. Those strings could
 * not be merged without remapping every key, so they were dropped rather than left half-wired.
 *
 * TO TRANSLATE: copy the structure of ./en.ts and replace the string values. Keep every key, keep
 * the nesting identical, and leave any `{placeholder}` tokens exactly as they appear.
 */
export { en as ar } from "./en";
