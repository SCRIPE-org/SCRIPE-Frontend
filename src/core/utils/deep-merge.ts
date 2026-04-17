/**
 * Deep Merge Utility
 *
 * Recursively merges source objects into a target object. Unlike Object.assign
 * (which is shallow), this preserves nested sibling keys when multiple sources
 * share the same top-level namespace.
 *
 * WHY THIS EXISTS:
 * Module locale files follow a hierarchical namespace pattern:
 *   featuresEn  → { entitlements: { features: { ... } } }
 *   editionsEn  → { entitlements: { editions: { ... } } }
 *
 * Object.assign({}, featuresEn, editionsEn) would CLOBBER features with editions
 * because it only operates on the first level. deepMerge preserves both.
 *
 * RULES:
 * - Plain objects are merged recursively
 * - Arrays are REPLACED (not concatenated)
 * - Primitives (string, number, boolean) are overwritten
 * - null/undefined values overwrite the target
 *
 * @example
 * ```ts
 * const a = { entitlements: { features: { title: "Features" } } };
 * const b = { entitlements: { editions: { title: "Editions" } } };
 * deepMerge({}, a, b);
 * // → { entitlements: { features: { title: "Features" }, editions: { title: "Editions" } } }
 * ```
 */

type DeepRecord = Record<string, unknown>;

function isPlainObject(value: unknown): value is DeepRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function deepMerge<T extends DeepRecord>(target: T, ...sources: DeepRecord[]): T {
  for (const source of sources) {
    for (const key of Object.keys(source)) {
      const targetVal = (target as DeepRecord)[key];
      const sourceVal = source[key];

      if (isPlainObject(sourceVal) && isPlainObject(targetVal)) {
        // Both are plain objects → recurse
        deepMerge(targetVal, sourceVal);
      } else {
        // Primitive, array, null, or mismatched types → overwrite
        (target as DeepRecord)[key] = sourceVal;
      }
    }
  }
  return target;
}
