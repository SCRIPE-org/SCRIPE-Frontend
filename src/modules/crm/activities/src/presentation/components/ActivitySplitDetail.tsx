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
  Clock,
  ArrowUpRight,
  CalendarClock,
  User,
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

interface ActivitySplitDetailProps {
  readonly activity: CrmActivity;
  readonly actions: React.ReactNode;
  readonly language: string;
  readonly accountsMap: Map<string, ExecutionDeskAccountSummary>;
  readonly onSelectAccount: (accountId: string) => void;
  readonly onScheduleFollowUp: (activity: CrmActivity) => void;
  readonly t: (key: string) => string;
}

/** Split-pane detail inspector rendering full sales activity metadata and actions. */
export function ActivitySplitDetail({
  activity,
  actions,
  language,
  accountsMap,
  onSelectAccount,
  onScheduleFollowUp,
  t,
}: ActivitySplitDetailProps) {
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
    <Card className="rounded-nx-lg border border-nx-line bg-nx-surface p-5 space-y-4">
      <div className="flex items-start justify-between border-b border-nx-line pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-nx-md bg-nx-raised border border-nx-line flex items-center justify-center shrink-0">
            <Icon className="size-5 text-nx-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-nx-ink">{activity.summary}</h3>
              <Badge
                variant="outline"
                className="border-nx-line bg-nx-raised text-[10px] py-0 px-1.5 font-mono text-nx-ink-2"
              >
                {kindLabel}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-nx-ink-3 mt-0.5">
              <User className="size-3 text-nx-accent" />
              <span>{activity.actorDisplaySnapshot}</span>
            </div>
          </div>
        </div>
        {actions}
      </div>

      {activity.accountId && (
        <div
          className="p-3 rounded-nx-md border border-nx-line bg-nx-raised/40 hover:border-nx-accent transition-all cursor-pointer flex items-center justify-between"
          onClick={() => {
            if (activity.accountId) onSelectAccount(activity.accountId);
          }}
        >
          <div className="flex items-center gap-2.5">
            <Building2 className="size-4 text-nx-accent" />
            <div>
              <span className="text-xs font-semibold text-nx-ink block hover:text-nx-accent">
                {accountName}
              </span>
              <span className="text-[10px] text-nx-ink-3">{t("crmActivities.actions.viewAccount360")}</span>
            </div>
          </div>
          <ArrowUpRight className="size-3.5 text-nx-ink-3" />
        </div>
      )}

      {activity.bodyText && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-nx-ink uppercase font-mono block">
            {t("crmActivities.detail.notes")}
          </span>
          <div className="p-3.5 rounded-nx-md border border-nx-line bg-nx-raised/30 text-xs text-nx-ink-2 whitespace-pre-wrap leading-relaxed">
            {activity.bodyText}
          </div>
        </div>
      )}

      <div className="rounded-nx-md border border-nx-line bg-nx-raised/40 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-nx-ink flex items-center gap-1.5">
            <Clock className="size-3.5 text-nx-accent" />
            {t("crmActivities.table.followUp")}
          </span>
          {activity.workItemStatus ? (
            <Badge variant="outline" className="border-nx-line bg-nx-surface text-[10px] font-mono">
              {activity.workItemStatus}
            </Badge>
          ) : (
            <span className="text-nx-ink-3 text-[11px]">
              {t("crmActivities.table.noFollowUp")}
            </span>
          )}
        </div>

        {!activity.workItemStatus && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onScheduleFollowUp(activity)}
            className="w-full h-7 text-xs border-nx-line bg-nx-surface text-nx-accent hover:bg-nx-raised gap-1.5"
          >
            <CalendarClock className="size-3.5" />
            <span>{t("crmActivities.actions.scheduleFollowUp")}</span>
          </Button>
        )}
      </div>

      <div className="pt-2 border-t border-nx-line flex items-center justify-between text-[11px] text-nx-ink-3 font-mono">
        <div className="flex items-center gap-1">
          <Calendar className="size-3" />
          <span>{formattedDate}</span>
        </div>
      </div>
    </Card>
  );
}
