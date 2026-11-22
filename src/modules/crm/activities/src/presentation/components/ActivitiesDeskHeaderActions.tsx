"use client";

import { Button } from "@core/ui/button";
import { DataExchangeToolbarActions } from "@core/data-exchange";
import { CalendarClock, Plus, RefreshCw } from "lucide-react";

/** Props for `ActivitiesDeskHeaderActions`. */
export interface ActivitiesDeskHeaderActionsProps {
  t: (key: string) => string;
  search: string;
  onRefresh: () => void;
  canFollowUp: boolean;
  onScheduleFollowUp: () => void;
  canCreateActivity: boolean;
  onOpenCreate: () => void;
}

/** Header action buttons for CRM Activities Execution Desk. */
export function ActivitiesDeskHeaderActions({
  t,
  search,
  onRefresh,
  canFollowUp,
  onScheduleFollowUp,
  canCreateActivity,
  onOpenCreate,
}: ActivitiesDeskHeaderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <DataExchangeToolbarActions
        entityKey="crm.activity"
        activeSearch={search}
        onImportComplete={onRefresh}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onRefresh}
        className="h-8 px-2.5 text-xs border border-nx-line bg-nx-surface hover:bg-nx-raised text-nx-ink gap-1.5"
      >
        <RefreshCw className="size-3.5 text-nx-ink-3" />
        <span>{t("crmActivities.actions.refresh")}</span>
      </Button>
      {canFollowUp && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onScheduleFollowUp}
          className="h-8 px-3 text-xs border border-nx-line bg-nx-surface hover:bg-nx-raised text-nx-ink gap-1.5"
        >
          <CalendarClock className="size-3.5 text-nx-accent" />
          <span>{t("crmActivities.actions.scheduleFollowUp")}</span>
        </Button>
      )}
      {canCreateActivity && (
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={onOpenCreate}
          className="h-8 px-3 text-xs font-semibold gap-1.5"
        >
          <Plus className="size-3.5" />
          <span>{t("crmActivities.actions.logActivity")}</span>
        </Button>
      )}
    </div>
  );
}
