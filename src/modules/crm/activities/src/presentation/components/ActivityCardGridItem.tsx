"use client";

import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  FileText,
  Phone,
  Users,
  CheckCircle2,
  Mail,
  Building2,
  Calendar,
  CalendarClock,
} from "lucide-react";
import type { CrmActivity, SalesActivityKind } from "../../domain/entities/CrmActivityEntity";
import type { ExecutionDeskAccountSummary } from "../utils/activitiesExecutionDeskHelpers";

function getActivityKindIcon(kind: SalesActivityKind) {
  switch (kind) {
    case "CallLog":
      return Phone;
    case "MeetingLog":
      return Users;
    case "FollowUpLinked":
      return CheckCircle2;
    case "CommunicationSent":
      return Mail;
    case "Note":
    default:
      return FileText;
  }
}

interface ActivityCardGridItemProps {
  readonly activity: CrmActivity;
  readonly actions: React.ReactNode;
  readonly language: string;
  readonly accountsMap: Map<string, ExecutionDeskAccountSummary>;
  readonly onSelectAccount: (accountId: string) => void;
  readonly onScheduleFollowUp: (activity: CrmActivity) => void;
  readonly t: (key: string) => string;
}

export function ActivityCardGridItem({
  activity,
  actions,
  language,
  accountsMap,
  onSelectAccount,
  onScheduleFollowUp,
  t,
}: ActivityCardGridItemProps) {
  const isAr = language === "ar";
  const Icon = getActivityKindIcon(activity.activityKind);
  const kindLabel = t(`crmActivities.kinds.${activity.activityKind}`);
  const account = activity.accountId ? accountsMap.get(activity.accountId) : undefined;
  const accountName = account
    ? isAr && account.nameAr
      ? account.nameAr
      : account.nameEn
    : activity.accountId
    ? t("crmActivities.table.accountRef")
    : t("crmActivities.table.noAccount");

  const dateStr = activity.occurredAtUtc;
  const formattedDate = dateStr
    ? new Date(dateStr).toLocaleDateString(isAr ? "ar-SA" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <Card className="flex flex-col justify-between gap-3 rounded-nx-lg border border-nx-line bg-nx-surface p-4 hover:border-nx-line-hi transition-all">
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-nx-md bg-nx-raised border border-nx-line flex items-center justify-center shrink-0">
              <Icon className="size-3.5 text-nx-accent" />
            </div>
            <div>
              <span className="font-bold text-xs text-nx-ink block line-clamp-1">
                {activity.summary}
              </span>
              <span className="text-[10px] text-nx-ink-3 block">
                {activity.actorDisplaySnapshot}
              </span>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-nx-line bg-nx-raised text-[9px] py-0 px-1 font-mono text-nx-ink-2"
          >
            {kindLabel}
          </Badge>
        </div>

        {activity.accountId && (
          <div
            className="flex items-center gap-1.5 text-xs text-nx-ink-2 hover:text-nx-accent cursor-pointer transition-colors"
            onClick={() => {
              if (activity.accountId) onSelectAccount(activity.accountId);
            }}
          >
            <Building2 className="size-3 text-nx-accent shrink-0" />
            <span className="truncate max-w-[200px] font-medium">{accountName}</span>
          </div>
        )}

        {activity.bodyText && (
          <p className="text-xs text-nx-ink-3 line-clamp-2 leading-relaxed">
            {activity.bodyText}
          </p>
        )}

        {activity.workItemStatus ? (
          <div className="flex items-center gap-1.5 text-[10px] text-nx-ink-3 pt-1">
            <Badge variant="outline" className="border-nx-line bg-nx-raised/60 py-0 px-1 font-mono">
              {activity.workItemStatus}
            </Badge>
          </div>
        ) : (
          <div className="pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onScheduleFollowUp(activity)}
              className="h-6 px-2 text-[10px] gap-1 text-nx-accent hover:bg-nx-accent-wash"
            >
              <CalendarClock className="size-3" />
              <span>{t("crmActivities.actions.scheduleFollowUp")}</span>
            </Button>
          </div>
        )}
      </div>

      <div className="border-t border-nx-line pt-2.5 flex items-center justify-between text-[11px] text-nx-ink-3 font-mono">
        <div className="flex items-center gap-1">
          <Calendar className="size-3" />
          <span>{formattedDate}</span>
        </div>
        {actions}
      </div>
    </Card>
  );
}
