"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import type { AdminCustomFieldItem } from "../../domain/entities/AdminProfile";

/**
 * Props for {@link ProfileInfoReadonlyGrid}.
 */
export interface ProfileInfoReadonlyGridProps {
  /** First name string to display. */
  firstName: string;
  /** Last name string to display. */
  lastName: string;
  /** Phone number string to display. */
  phoneNumber: string;
  /** Administrator type / role display name. */
  adminTypeName?: string | null;
  /** Biography text to display. */
  bio: string;
  /** Enterprise custom dossier field definitions. */
  customFields: AdminCustomFieldItem[];
  /** Current custom dossier field values keyed by field key. */
  customFieldValues: Record<string, string>;
}

/**
 * Read-only dossier grid displaying core identity fields, enterprise custom
 * profile attributes, and operator biography.
 */
export function ProfileInfoReadonlyGrid({
  firstName,
  lastName,
  phoneNumber,
  adminTypeName,
  bio,
  customFields,
  customFieldValues,
}: ProfileInfoReadonlyGridProps) {
  const { t, language } = useI18n();
  const isAr = language === "ar";

  const items = [
    { label: t("profile.firstName"), value: firstName || "—", required: true, mono: false, badge: false },
    { label: t("profile.lastName"), value: lastName || "—", required: true, mono: false, badge: false },
    { label: t("profile.phone"), value: phoneNumber || "—", mono: true, required: false, badge: false },
    { label: t("profile.role"), value: adminTypeName || "SuperAdmin", badge: true, required: false, mono: false },
    ...customFields.map((field) => ({
      label: isAr && field.labelAr ? field.labelAr : field.labelEn,
      value:
        (customFieldValues[field.key] ??
          (field.currentValue !== null && field.currentValue !== undefined
            ? String(field.currentValue)
            : "")) || "—",
      required: field.isRequired,
      mono: field.key === "employee_badge_number",
      badge: false,
    })),
  ];

  return (
    <div
      data-testid="personal-info-readonly-grid"
      className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-nx-line bg-nx-ground p-3.5 flex flex-col justify-between gap-1"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-nx-ink-3">
              {item.label}
              {item.required && <span className="text-destructive ms-1">*</span>}
            </span>
            {item.required && (
              <span className="text-[10px] font-medium text-nx-ink-3">
                {t("profile.requiredFieldIndicator")}
              </span>
            )}
          </div>
          {item.badge ? (
            <div>
              <Badge variant="secondary" className="text-xs font-semibold">
                {item.value}
              </Badge>
            </div>
          ) : (
            <p className={`text-sm font-semibold text-nx-ink ${item.mono ? "font-mono" : ""}`}>
              {item.mono ? <bdi dir="ltr">{item.value}</bdi> : item.value}
            </p>
          )}
        </div>
      ))}

      <div className="sm:col-span-2 rounded-xl border border-nx-line bg-nx-ground p-3.5 space-y-1">
        <span className="text-xs font-medium text-nx-ink-3">{t("profile.bioLabel")}</span>
        <p className="text-sm text-nx-ink leading-relaxed">
          {bio || t("profile.bioEmptyFallback")}
        </p>
      </div>
    </div>
  );
}
