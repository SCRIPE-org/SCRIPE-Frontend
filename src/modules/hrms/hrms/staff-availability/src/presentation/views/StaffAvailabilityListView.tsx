/**
 * StaffAvailability List View
 *
 * Pure UI component for displaying StaffAvailability list with CRUD.
 * Uses GenericCrudView for standard CRUD table UI.
 */
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { Pencil, Trash2 } from "lucide-react";
import { useStaffAvailabilityViewModel } from "../viewmodels/useStaffAvailabilityViewModel";
import type { StaffAvailability } from "../../domain/entities/StaffAvailability";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { resolveIntlLocale } from "@core/common/utils";

// Formats a "HH:mm" / "HH:mm:ss" wall-clock string as a locale-aware short
// time (e.g. "9:00 AM" / "٩:٠٠ ص") without pulling in a date-fns dependency
// for what is just a time-of-day value with no calendar date attached.
function formatTimeOfDay(value: string, locale: string): string {
  if (!value) return "-";
  const [hours, minutes] = value.split(":");
  const parsed = new Date();
  parsed.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);
  return parsed.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
}

// P5.4: React.memo prevents unnecessary re-renders
export const StaffAvailabilityListView = React.memo(function StaffAvailabilityListView() {
  useModuleLocales(() => import("../../../locales"), "hrms");
  const { vm } = useStaffAvailabilityViewModel();
  const { t, language } = useI18n();
  const locale = resolveIntlLocale(language);

  const config: CrudConfig<StaffAvailability> = {
    titleKey: "staffAvailability.title",
    subtitleKey: "staffAvailability.description",
    resource: "staff-availabilities",
    columns: [
      {
        key: "staffMemberId",
        label: t("staffAvailability.fields.staffMemberId"),
        sortable: true,
      },
      {
        key: "dayOfWeek",
        label: t("staffAvailability.fields.dayOfWeek"),
        sortable: true,
        render: (value: number) => (
          <Badge variant="secondary">{t(`staffAvailability.days.${value}`)}</Badge>
        ),
      },
      {
        key: "startTime",
        label: t("staffAvailability.fields.startTime"),
        render: (value: string) => formatTimeOfDay(value, locale),
      },
      {
        key: "endTime",
        label: t("staffAvailability.fields.endTime"),
        render: (value: string) => formatTimeOfDay(value, locale),
      },
      {
        key: "isAvailable",
        label: t("staffAvailability.fields.isAvailable"),
        sortable: true,
        render: (value: boolean) => (
          <Badge variant={value ? "active" : "inactive"}>
            {value
              ? t("staffAvailability.status.available")
              : t("staffAvailability.status.unavailable")}
          </Badge>
        ),
      },
      {
        key: "createdAt",
        label: t("common.createdAt"),
        render: (value: string) => (value ? new Date(value).toLocaleDateString(locale) : "-"),
      },
    ],
    createFields: [
      {
        name: "staffMemberId",
        label: t("staffAvailability.fields.staffMemberId"),
        type: "text" as const,
        placeholder: t("staffAvailability.placeholders.staffMemberId"),
        required: true,
      },
      {
        name: "dayOfWeek",
        label: t("staffAvailability.fields.dayOfWeek"),
        type: "number" as const,
        placeholder: t("staffAvailability.placeholders.dayOfWeek"),
        min: 0,
        max: 6,
        required: true,
      },
      {
        name: "startTime",
        label: t("staffAvailability.fields.startTime"),
        type: "text" as const,
        placeholder: t("staffAvailability.placeholders.startTime"),
        required: true,
      },
      {
        name: "endTime",
        label: t("staffAvailability.fields.endTime"),
        type: "text" as const,
        placeholder: t("staffAvailability.placeholders.endTime"),
        required: true,
      },
      {
        name: "isAvailable",
        label: t("staffAvailability.fields.isAvailable"),
        type: "switch" as const,
        description: t("staffAvailability.descriptions.isAvailable"),
      },
    ],
    editFields: [
      { name: "id", type: "hidden" as const, required: true },
      {
        name: "staffMemberId",
        label: t("staffAvailability.fields.staffMemberId"),
        type: "text" as const,
        placeholder: t("staffAvailability.placeholders.staffMemberId"),
        required: true,
      },
      {
        name: "dayOfWeek",
        label: t("staffAvailability.fields.dayOfWeek"),
        type: "number" as const,
        placeholder: t("staffAvailability.placeholders.dayOfWeek"),
        min: 0,
        max: 6,
        required: true,
      },
      {
        name: "startTime",
        label: t("staffAvailability.fields.startTime"),
        type: "text" as const,
        placeholder: t("staffAvailability.placeholders.startTime"),
        required: true,
      },
      {
        name: "endTime",
        label: t("staffAvailability.fields.endTime"),
        type: "text" as const,
        placeholder: t("staffAvailability.placeholders.endTime"),
        required: true,
      },
      {
        name: "isAvailable",
        label: t("staffAvailability.fields.isAvailable"),
        type: "switch" as const,
        description: t("staffAvailability.descriptions.isAvailable"),
      },
    ],
    createInitialValues: {
      staffMemberId: "",
      dayOfWeek: 0,
      startTime: "",
      endTime: "",
      isAvailable: false,
    },
    editInitialValues: (item: StaffAvailability) => ({
      id: item.id,
      staffMemberId: item.staffMemberId,
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
      isAvailable: item.isAvailable,
    }),
    // StaffAvailability is a recurring schedule slot for a staff member — it
    // has no name-shaped field of its own, so the FK remains the most
    // identifying value available.
    getItemDisplayName: (item: StaffAvailability) => item.staffMemberId,
    deleteService: (id: string) => vm.deleteItem(id),
    getActions: (_vmInstance, tFn, handleDeleteFn): CrudAction<StaffAvailability>[] => [
      {
        label: tFn("common.edit"),
        onClick: (item: StaffAvailability) => vm.openEditModal(item),
        variant: "ghost" as const,
        icon: <Pencil className="h-4 w-4" />,
      },
      {
        label: tFn("common.delete"),
        onClick: (item: StaffAvailability) => handleDeleteFn?.(item),
        variant: "ghost" as const,
        className: "text-destructive hover:text-destructive/80",
        icon: <Trash2 className="h-4 w-4" />,
      },
    ],
  };

  return <GenericCrudView viewModel={vm} config={config} />;
});
