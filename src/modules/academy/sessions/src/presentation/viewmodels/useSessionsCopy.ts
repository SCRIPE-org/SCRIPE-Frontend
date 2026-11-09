"use client";

import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { ar, en } from "../../../locales";
import type { sessionsEn } from "../../../locales/sessions.en";

export type SessionCopyKey = keyof typeof sessionsEn;

export function useSessionsCopy() {
  const { language, direction, t } = useI18n();
  useModuleLocales(() => import("../../../locales"), "academy.sessionsUi");
  const dictionary = language === "ar" ? ar.academy.sessionsUi : en.academy.sessionsUi;
  const copy = (key: SessionCopyKey, params?: Record<string, string | number>) =>
    t("academy.sessionsUi." + key, { defaultValue: dictionary[key], ...params });
  return { language, direction, copy };
}
