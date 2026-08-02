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

// ─── Event & entity types — the single source of truth ───────────────
// These mirror the backend's own AuditEventType / EntityType enums (the
// `eventType` / `entityType` filter values are the literal API payload keys,
// never re-labelled). Every SelectItem the panel renders is derived from
// these enum values — nothing is hand-listed a second time — so a new member
// added here always reaches the dropdown and goes through t(), instead of a
// hand-maintained array silently drifting from the real value set.
enum AuditEventType {
  Create = "Create",
  Update = "Update",
  Delete = "Delete",
  Request = "Request",
  Login = "Login",
  Logout = "Logout",
  TokenRefreshed = "TokenRefreshed",
  ExternalLogin = "ExternalLogin",
  AccessDenied = "AccessDenied",
  AccountLocked = "AccountLocked",
  AccountUnlocked = "AccountUnlocked",
  PasswordChanged = "PasswordChanged",
  PasswordReset = "PasswordReset",
  SessionRevoked = "SessionRevoked",
  TwoFactorEnabled = "TwoFactorEnabled",
  TwoFactorDisabled = "TwoFactorDisabled",
  TwoFactorVerified = "TwoFactorVerified",
  RoleAssigned = "RoleAssigned",
  RoleUnassigned = "RoleUnassigned",
  PermissionGranted = "PermissionGranted",
  PermissionRevoked = "PermissionRevoked",
  AdminStatusChanged = "AdminStatusChanged",
  BulkAdminDelete = "BulkAdminDelete",
  BulkAdminStatusUpdate = "BulkAdminStatusUpdate",
  Impersonation = "Impersonation",
  AdminTransfer = "AdminTransfer",
  TenantPermissionsUpdated = "TenantPermissionsUpdated",
  BulkTenantCascadeDelete = "BulkTenantCascadeDelete",
  Error = "Error",
  DataExport = "DataExport",
}

enum EntityType {
  Admin = "Admin",
  Role = "Role",
  Tenant = "Tenant",
  Menu = "Menu",
  User = "User",
  Permission = "Permission",
  Auth = "Auth",
  AuditLog = "AuditLog",
}

// Grouping is presentation metadata only — it re-uses the enum members above
// rather than re-typing the string values, so it can never fall out of sync
// with the type. A member with no group still renders, under "Other" (below).
const EVENT_TYPE_GROUPS: { key: string; members: AuditEventType[] }[] = [
  {
    key: "crud",
    members: [
      AuditEventType.Create,
      AuditEventType.Update,
      AuditEventType.Delete,
      AuditEventType.Request,
    ],
  },
  {
    key: "authentication",
    members: [
      AuditEventType.Login,
      AuditEventType.Logout,
      AuditEventType.TokenRefreshed,
      AuditEventType.ExternalLogin,
    ],
  },
  {
    key: "security",
    members: [
      AuditEventType.AccessDenied,
      AuditEventType.AccountLocked,
      AuditEventType.AccountUnlocked,
      AuditEventType.PasswordChanged,
      AuditEventType.PasswordReset,
      AuditEventType.SessionRevoked,
      AuditEventType.TwoFactorEnabled,
      AuditEventType.TwoFactorDisabled,
      AuditEventType.TwoFactorVerified,
    ],
  },
  {
    key: "rolePermission",
    members: [
      AuditEventType.RoleAssigned,
      AuditEventType.RoleUnassigned,
      AuditEventType.PermissionGranted,
      AuditEventType.PermissionRevoked,
    ],
  },
  {
    key: "adminActions",
    members: [
      AuditEventType.AdminStatusChanged,
      AuditEventType.BulkAdminDelete,
      AuditEventType.BulkAdminStatusUpdate,
      AuditEventType.Impersonation,
      AuditEventType.AdminTransfer,
    ],
  },
  {
    key: "tenant",
    members: [AuditEventType.TenantPermissionsUpdated, AuditEventType.BulkTenantCascadeDelete],
  },
  {
    key: "system",
    members: [AuditEventType.Error, AuditEventType.DataExport],
  },
];

// Anything in the enum that no group above claims yet — derived at runtime,
// so a future enum addition lands here automatically instead of vanishing.
const GROUPED_EVENT_TYPES = new Set<AuditEventType>(EVENT_TYPE_GROUPS.flatMap((g) => g.members));
const UNGROUPED_EVENT_TYPES = Object.values(AuditEventType).filter(
  (type) => !GROUPED_EVENT_TYPES.has(type)
);

const ENTITY_TYPES = Object.values(EntityType);

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
          <Search
            className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-3"
            aria-hidden="true"
          />
          <Input
            placeholder={t("audit.filters.searchPlaceholder")}
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="ps-9"
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
        <div className="flex items-center gap-1 text-sm text-nx-ink-2">
          <Filter className="h-4 w-4" aria-hidden="true" />
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
              <SelectGroup key={group.key}>
                <SelectLabel>{t(`audit.filters.groups.${group.key}`)}</SelectLabel>
                {group.members.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`audit.eventTypes.${type}`)}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
            {UNGROUPED_EVENT_TYPES.length > 0 && (
              <SelectGroup>
                <SelectLabel>{t("audit.filters.groups.other")}</SelectLabel>
                {UNGROUPED_EVENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`audit.eventTypes.${type}`)}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
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
                {t(`audit.entityTypes.${type}`)}
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
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            {t("audit.filters.reset")}
          </Button>
        )}
      </div>
    </div>
  );
});
