"use client";

import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { ar, en } from "../../../locales";
import type { attendanceEn } from "../../../locales/attendance.en";

export type AttendanceCopyKey = keyof typeof attendanceEn;
type PluralKey = "sessionCount" | "rosterCount";

export function useAttendanceCopy() {
  const { language, direction, t } = useI18n();
  useModuleLocales(() => import("../../../locales"), "academy.attendanceUi");
  const dictionary: Record<string, string> = language === "ar"
    ? ar.academy.attendanceUi
    : en.academy.attendanceUi;
  const copy = (key: AttendanceCopyKey | PluralKey, params?: Record<string, string | number>) => {
    const fallbackKey = key === "sessionCount" || key === "rosterCount"
      ? `${key}_${params?.count === 1 ? "one" : "other"}` : key;
    return t("academy.attendanceUi." + key, { defaultValue: dictionary[fallbackKey], ...params });
  };
  return { language, direction, copy };
}

export type AttendanceCopy = ReturnType<typeof useAttendanceCopy>["copy"];
