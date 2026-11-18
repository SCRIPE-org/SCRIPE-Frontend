"use client";

import { Building2, Search, X } from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { cn } from "@core/common/utils";
import type { SalesActivityKind } from "../../domain/entities/CrmActivityEntity";
import type { ExecutionDeskAccountSummary } from "../utils/activitiesExecutionDeskHelpers";
import type { ActivityDueBucket } from "../utils/activitiesFilteringHelpers";

const ACTIVITY_KIND_OPTIONS: Array<{ key: SalesActivityKind | "ALL"; labelKey: string }> = [
  { key: "ALL", labelKey: "crmActivities.filters.allKinds" },
  { key: "Note", labelKey: "crmActivities.kinds.Note" },
  { key: "CallLog", labelKey: "crmActivities.kinds.CallLog" },
  { key: "MeetingLog", labelKey: "crmActivities.kinds.MeetingLog" },
  { key: "FollowUpLinked", labelKey: "crmActivities.kinds.FollowUpLinked" },
  { key: "CommunicationSent", labelKey: "crmActivities.kinds.CommunicationSent" },
];

const DUE_BUCKET_OPTIONS: Array<{ key: ActivityDueBucket; labelKey: string }> = [
  { key: "all", labelKey: "crmActivities.filters.dueAll" },
  { key: "overdue", labelKey: "crmActivities.filters.dueOverdue" },
  { key: "today", labelKey: "crmActivities.filters.dueToday" },
  { key: "upcoming", labelKey: "crmActivities.filters.dueUpcoming" },
];

interface ActivitiesToolbarProps {
  isRtl: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  accounts: readonly ExecutionDeskAccountSummary[];
  selectedAccountId: string;
  onSelectAccountId: (id: string) => void;
  activityKindFilter: SalesActivityKind | "ALL";
  onActivityKindFilterChange: (kind: SalesActivityKind | "ALL") => void;
  dueFilter: ActivityDueBucket;
  onDueFilterChange: (bucket: ActivityDueBucket) => void;
  contactFilterId: string | null;
  contactDisplayName: string | null;
  onClearContactFilter: () => void;
  t: (key: string) => string;
}

/** Toolbar filters for Activities Execution Desk (search, account, contact chip, due bucket, kind). */
export function ActivitiesToolbar({
  isRtl,
  search,
  onSearchChange,
  accounts,
  selectedAccountId,
  onSelectAccountId,
  activityKindFilter,
  onActivityKindFilterChange,
  dueFilter,
  onDueFilterChange,
  contactFilterId,
  contactDisplayName,
  onClearContactFilter,
  t,
}: ActivitiesToolbarProps) {
  return (
    <div className="flex flex-col gap-2.5 flex-1" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex flex-col lg:flex-row lg:items-center gap-2.5">
        <div className="flex items-center gap-2 flex-1 flex-wrap sm:flex-nowrap">
          <div className="relative w-full sm:w-64">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-3.5 text-nx-ink-3 pointer-events-none" />
            <Input
              type="text"
              placeholder={t("crmActivities.executionDesk.searchPlaceholder")}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 ps-8 pe-3 text-xs bg-nx-surface border-nx-line text-nx-ink"
            />
          </div>

          <div className="w-full sm:w-60">
            <Select value={selectedAccountId} onValueChange={onSelectAccountId}>
              <SelectTrigger className="h-8 text-xs bg-nx-surface border-nx-line text-nx-ink">
                <Building2 className="size-3.5 text-nx-accent shrink-0 me-1.5" />
                <SelectValue placeholder={t("crmActivities.executionDesk.selectAccount")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("crmActivities.filters.allAccounts")}</SelectItem>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {isRtl && acc.nameAr ? acc.nameAr : acc.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {contactFilterId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClearContactFilter}
              aria-label={t("crmActivities.filters.clearContactFilter")}
              className="h-8 px-2.5 text-xs border-nx-accent/40 bg-nx-accent-wash text-nx-accent gap-1.5"
            >
              <span className="truncate max-w-40">
                {contactDisplayName || t("crmActivities.filters.contactFilterActive")}
              </span>
              <X className="size-3" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {DUE_BUCKET_OPTIONS.map((opt) => {
            const isSelected = dueFilter === opt.key;
            return (
              <Button
                key={opt.key}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onDueFilterChange(opt.key)}
                className={cn(
                  "h-7 px-2.5 text-xs rounded-nx-md shrink-0 transition-all",
                  isSelected
                    ? opt.key === "overdue"
                      ? "border-destructive/40 bg-destructive/10 text-destructive font-semibold"
                      : "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-semibold"
                    : "border-nx-line bg-nx-surface text-nx-ink-2 hover:bg-nx-raised hover:text-nx-ink"
                )}
              >
                {t(opt.labelKey)}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {ACTIVITY_KIND_OPTIONS.map((opt) => {
          const isSelected = activityKindFilter === opt.key;
          return (
            <Button
              key={opt.key}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onActivityKindFilterChange(opt.key)}
              className={cn(
                "h-7 px-2.5 text-xs rounded-nx-md shrink-0 transition-all",
                isSelected
                  ? "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-semibold"
                  : "border-nx-line bg-nx-surface text-nx-ink-2 hover:bg-nx-raised hover:text-nx-ink"
              )}
            >
              {t(opt.labelKey)}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
