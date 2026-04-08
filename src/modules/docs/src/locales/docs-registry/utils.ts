/**
 * Deep-merge utility for docs locale registry.
 * Docs locales use nested namespaces (e.g., getStarted.overview, getStarted.prerequisites)
 * so we need deep merge unlike the core system's flat Object.assign.
 */
export function deepMerge(
  target: Record<string, any>,
  source: Record<string, any>,
): Record<string, any> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      result[key] &&
      typeof result[key] === "object" &&
      typeof source[key] === "object" &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(result[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export function mergeAll(...sources: Record<string, any>[]): Record<string, any> {
  let result: Record<string, any> = {};
  for (const source of sources) {
    result = deepMerge(result, source);
  }
  return result;
}
