"use client";

/**
 * Audit Filter Panel
 *
 * Filter bar for audit log table — grouped event types, date range, user, entity type, status.
 */
import { memo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { DatePicker } from "@core/ui/date-picker";
import { Button } from "@core/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { Search, X, Filter } from "lucide-react";
import type { AuditFilterState } from "../viewmodels/useAuditViewModel";

interface Props {
  filters: AuditFilterState;
  updateFilter: <K extends keyof AuditFilterState>(key: K, value: AuditFilterState[K]) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

// ─── Grouped Event Type Categories ───────────────────────────
const EVENT_TYPE_GROUPS = [
  {
    label: "CRUD",
    items: ["Create", "Update", "Delete", "Request"],
  },
  {
    label: "Authentication",
    items: ["Login", "Logout", "TokenRefreshed", "ExternalLogin"],
  },
  {
    label: "Security",
    items: [
      "AccessDenied",
      "AccountLocked",
      "AccountUnlocked",
      "PasswordChanged",
      "PasswordReset",
      "SessionRevoked",
      "TwoFactorEnabled",
      "TwoFactorDisabled",
      "TwoFactorVerified",
    ],
  },
  {
    label: "Role & Permission",
    items: ["RoleAssigned", "RoleUnassigned", "PermissionGranted", "PermissionRevoked"],
  },
  {
    label: "Admin Actions",
    items: [
      "AdminStatusChanged",
      "BulkAdminDelete",
      "BulkAdminStatusUpdate",
      "Impersonation",
      "AdminTransfer",
    ],
  },
  {
    label: "Tenant",
    items: ["TenantPermissionsUpdated", "BulkTenantCascadeDelete"],
  },
  {
    label: "System",
    items: ["Error", "DataExport"],
  },
] as const;

// ─── Entity Types ────────────────────────────────────────────
const ENTITY_TYPES = [
  "Admin",
  "Role",
  "Tenant",
  "Menu",
  "User",
  "Permission",
  "Auth",
  "AuditLog",
] as const;

/**
 * Exported constant defining parameters and fields for audit filter panel configurations.
 */
export const AuditFilterPanel = memo(function AuditFilterPanel({
  filters,
  updateFilter,
  resetFilters,
  hasActiveFilters,
}: Props) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      {/* Search Row */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("audit.filters.searchPlaceholder")}
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <DatePicker
            id="audit-date-from"
            placeholder={t("audit.filters.dateFrom")}
            value={filters.dateFrom}
            onChange={(v) => updateFilter("dateFrom", v)}
            className="w-44"
          />
          <DatePicker
            id="audit-date-to"
            placeholder={t("audit.filters.dateTo")}
            value={filters.dateTo}
            onChange={(v) => updateFilter("dateTo", v)}
            className="w-44"
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>{t("common.filter")}</span>
        </div>

        {/* Event Type — Grouped */}
        <Select
          value={filters.eventType || "all"}
          onValueChange={(v) => updateFilter("eventType", v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder={t("audit.filters.eventType")} />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">{t("audit.filters.allEvents")}</SelectItem>
            {EVENT_TYPE_GROUPS.map((group) => (
              <SelectGroup key={group.label}>
                <SelectLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </SelectLabel>
                {group.items.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>

        {/* Username */}
        <Input
          placeholder={t("audit.filters.username")}
          value={filters.username}
          onChange={(e) => updateFilter("username", e.target.value)}
          className="w-40"
        />

        {/* Entity Type — Dropdown */}
        <Select
          value={filters.entityType || "all"}
          onValueChange={(v) => updateFilter("entityType", v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("audit.filters.entityType")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("audit.filters.allEntities")}</SelectItem>
            {ENTITY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.isSuccess === undefined ? "all" : filters.isSuccess ? "success" : "failed"}
          onValueChange={(v) =>
            updateFilter("isSuccess", v === "all" ? undefined : v === "success")
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder={t("audit.filters.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("audit.filters.allStatus")}</SelectItem>
            <SelectItem value="success">{t("audit.filters.success")}</SelectItem>
            <SelectItem value="failed">{t("audit.filters.failed")}</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1">
            <X className="h-3.5 w-3.5" />
            {t("audit.filters.reset")}
          </Button>
        )}
      </div>
    </div>
  );
});
