// FILE-EXCEPTION: rule bypass for existing large file
"use client";

import { memo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { DatePicker } from "@core/ui/date-picker";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { Search, X, Filter, Calendar, Hash, User } from "lucide-react";
import type { AuditFilterState, DatePreset } from "../viewmodels/useAuditViewModel";

interface Props {
  filters: AuditFilterState;
  updateFilter: <K extends keyof AuditFilterState>(key: K, value: AuditFilterState[K]) => void;
  setDatePreset: (preset: DatePreset) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

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

const GROUPED_EVENT_TYPES = new Set<AuditEventType>(EVENT_TYPE_GROUPS.flatMap((g) => g.members));
const UNGROUPED_EVENT_TYPES = Object.values(AuditEventType).filter(
  (type) => !GROUPED_EVENT_TYPES.has(type)
);

const ENTITY_TYPES = Object.values(EntityType);

const DATE_PRESETS: Array<{ key: DatePreset; label: string }> = [
  { key: "all", label: "All Time" },
  { key: "today", label: "Today" },
  { key: "24h", label: "24h" },
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
  { key: "custom", label: "Custom" },
];

/**
 * AuditFilterPanel
 */
export const AuditFilterPanel = memo(function AuditFilterPanel({
  filters,
  updateFilter,
  setDatePreset,
  resetFilters,
  hasActiveFilters,
  activeFilterCount,
}: Props) {
  const { t } = useI18n();

  return (
    <div className="space-y-3.5">
      {/* Row 1: Search & Date Presets */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Free-text Search */}
        <div className="relative min-w-[260px] flex-1">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            placeholder={
              t("audit.filters.searchPlaceholder") ||
              "Search by username, entity, endpoint, or IP..."
            }
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="h-9 pe-8 ps-9 text-xs"
          />
          {filters.search && (
            /* UI-EXCEPTION */ <button
              type="button"
              onClick={() => updateFilter("search", "")}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Date Presets Pill Group */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 p-1">
          <Calendar className="me-0.5 ms-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          {DATE_PRESETS.map((p) => {
            const isActive = filters.datePreset === p.key;
            return (
              <Button
                key={p.key}
                type="button"
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setDatePreset(p.key)}
                className={`h-7 cursor-pointer px-2.5 text-xs font-semibold ${
                  isActive
                    ? "shadow-2xs border border-border/80 bg-card font-bold text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t(`audit.filters.presets.${p.key}`) || p.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Optional Custom Date Range Row */}
      {filters.datePreset === "custom" && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 bg-accent/20 p-2.5">
          <span className="text-xs font-semibold text-muted-foreground">
            {t("audit.filters.customRange") || "Custom Range"}:
          </span>
          <DatePicker
            id="audit-date-from"
            placeholder={t("audit.filters.dateFrom") || "From (UTC)"}
            value={filters.dateFrom}
            onChange={(v) => updateFilter("dateFrom", v)}
            className="h-8 w-44 text-xs"
          />
          <span className="text-xs text-muted-foreground">→</span>
          <DatePicker
            id="audit-date-to"
            placeholder={t("audit.filters.dateTo") || "To (UTC)"}
            value={filters.dateTo}
            onChange={(v) => updateFilter("dateTo", v)}
            className="h-8 w-44 text-xs"
          />
        </div>
      )}

      {/* Row 2: Faceted Select Filters & Clear Button */}
      <div className="flex flex-wrap items-center gap-2.5 border-t border-border/40 pt-1">
        <div className="me-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Filter className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span>{t("common.filter") || "Filters"}</span>
        </div>

        {/* 1. Event Type Dropdown */}
        <Select
          value={filters.eventType || "all"}
          onValueChange={(v) => updateFilter("eventType", v === "all" ? "" : v)}
        >
          <SelectTrigger className="h-8 w-44 text-xs">
            <SelectValue placeholder={t("audit.filters.eventType") || "Event Type"} />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">{t("audit.filters.allEvents") || "All Events"}</SelectItem>
            {EVENT_TYPE_GROUPS.map((group) => (
              <SelectGroup key={group.key}>
                <SelectLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t(`audit.filters.groups.${group.key}`) || group.key}
                </SelectLabel>
                {group.members.map((type) => (
                  <SelectItem key={type} value={type} className="text-xs">
                    {t(`audit.eventTypes.${type}`) || type}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
            {UNGROUPED_EVENT_TYPES.length > 0 && (
              <SelectGroup>
                <SelectLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t("audit.filters.groups.other") || "Other"}
                </SelectLabel>
                {UNGROUPED_EVENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type} className="text-xs">
                    {t(`audit.eventTypes.${type}`) || type}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>

        {/* 2. Entity Type Dropdown */}
        <Select
          value={filters.entityType || "all"}
          onValueChange={(v) => updateFilter("entityType", v === "all" ? "" : v)}
        >
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue placeholder={t("audit.filters.entityType") || "Entity Type"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("audit.filters.allEntities") || "All Entities"}</SelectItem>
            {ENTITY_TYPES.map((type) => (
              <SelectItem key={type} value={type} className="text-xs">
                {t(`audit.entityTypes.${type}`) || type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 3. Execution Status */}
        <Select
          value={filters.isSuccess === undefined ? "all" : filters.isSuccess ? "success" : "failed"}
          onValueChange={(v) =>
            updateFilter("isSuccess", v === "all" ? undefined : v === "success")
          }
        >
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue placeholder={t("audit.filters.status") || "Status"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("audit.filters.allStatus") || "All Status"}</SelectItem>
            <SelectItem value="success" className="text-xs font-medium text-emerald-500">
              ✓ {t("audit.filters.success") || "Success"}
            </SelectItem>
            <SelectItem value="failed" className="text-xs font-medium text-rose-500">
              ✕ {t("audit.filters.failed") || "Failed"}
            </SelectItem>
          </SelectContent>
        </Select>

        {/* 4. Username Filter */}
        <div className="relative w-36">
          <User className="pointer-events-none absolute start-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("audit.filters.username") || "Username"}
            value={filters.username}
            onChange={(e) => updateFilter("username", e.target.value)}
            className="h-8 ps-7 text-xs"
          />
          {filters.username && (
            /* UI-EXCEPTION */ <button
              type="button"
              onClick={() => updateFilter("username", "")}
              className="absolute end-1.5 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* 5. Correlation ID Filter */}
        <div className="relative w-36">
          <Hash className="pointer-events-none absolute start-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("audit.filters.correlationId") || "Trace ID"}
            value={filters.correlationId}
            onChange={(e) => updateFilter("correlationId", e.target.value)}
            className="h-8 ps-7 font-mono text-xs"
          />
          {filters.correlationId && (
            /* UI-EXCEPTION */ <button
              type="button"
              onClick={() => updateFilter("correlationId", "")}
              className="absolute end-1.5 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Reset Active Filters Button */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="ms-auto h-8 cursor-pointer gap-1 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("audit.filters.reset") || "Reset"}</span>
            <Badge variant="secondary" className="ms-1 h-4 px-1 text-[10px] tabular-nums">
              {activeFilterCount}
            </Badge>
          </Button>
        )}
      </div>
    </div>
  );
});
