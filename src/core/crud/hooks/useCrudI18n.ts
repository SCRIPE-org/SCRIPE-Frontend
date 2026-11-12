"use client";

import { useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { en } from "@core/locales/en";

/**
 * Enhanced I18n hook for @core/crud views and components.
 * Delegates seamlessly to the global I18nProvider, with safe fallbacks
 * to defaultValue and the core English dictionary when rendered in isolated
 * test harnesses or SSR environments where I18nContext is not mounted.
 */
export function useCrudI18n() {
  const i18n = useI18n();

  const t = useCallback(
    (key: string, params?: Record<string, any>): string => {
      const res = i18n.t(key, params);

      // If i18n returned a resolved string (not equal to the raw lookup key), return it directly.
      if (res && res !== key) {
        return res;
      }

      // If outside provider or key missed in current dictionary:
      // 1. Check if an explicit defaultValue parameter was provided
      if (params && typeof params.defaultValue === "string") {
        let def = params.defaultValue;
        def = def.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
          return params[paramKey] !== undefined ? String(params[paramKey]) : match;
        });
        def = def.replace(/\{(\w+)\}/g, (match, paramKey) => {
          return params[paramKey] !== undefined ? String(params[paramKey]) : match;
        });
        return def;
      }

      // 2. Look up the key in the core English dictionary
      const parts = key.split(".");
      let current: any = en;
      for (const part of parts) {
        if (current && typeof current === "object" && part in current) {
          current = current[part];
        } else {
          current = undefined;
          break;
        }
      }

      if (typeof current === "string") {
        if (params) {
          let interpolated = current.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
            return params[paramKey] !== undefined ? String(params[paramKey]) : match;
          });
          interpolated = interpolated.replace(/\{(\w+)\}/g, (match, paramKey) => {
            return params[paramKey] !== undefined ? String(params[paramKey]) : match;
          });
          return interpolated;
        }
        return current;
      }

      return res || key;
    },
    [i18n]
  );

  return {
    ...i18n,
    t,
  };
}
