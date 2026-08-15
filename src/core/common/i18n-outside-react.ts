/**
 * Minimal, non-hook translation lookup for code that cannot call useI18n()
 * because it isn't a React component or is used as a module-level singleton
 * outside render (api.service.ts, the toast helper's non-hook `toast` export,
 * etc.). Hooks can only be called from function components/other hooks, so
 * those call sites cannot reach the I18nProvider context directly.
 *
 * Mirrors i18n-provider.tsx's key-path lookup and {param}/{{param}}
 * interpolation against the SAME core locale dictionaries, so a key defined
 * once in core/locales/{en,ar}.ts works from both worlds. Deliberately reads
 * only the core dictionaries (not the per-module registry via
 * module-registry.ts) -- this exists for shared infrastructure error text,
 * which lives in the core `errors.*` / `common.*` namespaces.
 */
import { ar } from "@core/locales/ar";
import { en } from "@core/locales/en";
import { STORAGE_KEYS } from "@core/config/storage-keys";

type Language = "en" | "ar";

function currentLanguage(): Language {
  if (typeof window === "undefined") return "en";
  try {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) === "ar" ? "ar" : "en";
  } catch {
    // localStorage can throw in locked-down contexts (privacy mode, sandboxed iframes).
    return "en";
  }
}

/**
 * Looks up `key` (dot path, e.g. "errors.network.timeout") in the core locale
 * dictionary matching the user's currently saved language. Returns the bare
 * key on a miss, matching useI18n()'s production fallback behavior.
 */
export function translateCore(key: string, params?: Record<string, string | number>): string {
  const dict: unknown = currentLanguage() === "ar" ? ar : en;
  let value: unknown = dict;

  for (const part of key.split(".")) {
    if (value && typeof value === "object" && part in (value as Record<string, unknown>)) {
      value = (value as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }

  if (typeof value !== "string") return key;
  if (!params) return value;

  return value
    .replace(/\{\{(\w+)\}\}/g, (match, p) => (params[p] !== undefined ? String(params[p]) : match))
    .replace(/\{(\w+)\}/g, (match, p) => (params[p] !== undefined ? String(params[p]) : match));
}
