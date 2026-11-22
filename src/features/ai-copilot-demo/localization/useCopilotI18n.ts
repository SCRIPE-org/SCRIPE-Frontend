"use client";

import { useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { copilotEn } from "./copilot.en";
import { copilotAr } from "./copilot.ar";

type CopilotDictionary = typeof copilotEn;

function resolveNestedKey(dict: CopilotDictionary, key: string): string | null {
  const parts = key.split(".");
  let current: unknown = dict;
  for (const part of parts) {
    if (
      current !== null &&
      typeof current === "object" &&
      Object.prototype.hasOwnProperty.call(current, part)
    ) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return null;
    }
  }
  return typeof current === "string" ? current : null;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match
  );
}

/**
 * Bridges SCRIPE's existing I18nProvider (`language` + `direction`) to the isolated
 * demo feature dictionaries without modifying core locale registries or creating
 * a second language manager.
 */
export function useCopilotI18n() {
  const { language, direction } = useI18n();
  const isRtl = direction === "rtl";

  const tc = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const primaryDict = (language === "ar" ? copilotAr : copilotEn) as unknown as CopilotDictionary;
      const resolved =
        resolveNestedKey(primaryDict, key) ?? resolveNestedKey(copilotEn, key) ?? key;
      return interpolate(resolved, params);
    },
    [language]
  );

  return {
    language,
    direction,
    isRtl,
    tc,
  };
}
