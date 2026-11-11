"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@core/ui/badge";
import {
  FileText,
  Phone,
  Users,
  CheckCircle2,
  Mail,
  Building2,
  Calendar,
  Clock,
} from "lucide-react";
import type { CrudColumn } from "@core/crud/components/generic-crud-view";
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

export function useActivitiesCrudColumns(
  language: string,
  t: (key: string) => string,
  accountsMap: Map<string, ExecutionDeskAccountSummary>
): CrudColumn<CrmActivity>[] {
  const router = useRouter();
  const isAr = language === "ar";

  return useMemo<CrudColumn<CrmActivity>[]>(
    () => [
      {
        key: "summary",
        label: t("crmActivities.table.activity"),
        sortable: true,
        render: (_val, activity: CrmActivity) => {
          const Icon = getActivityKindIcon(activity.activityKind);
          const kindLabel = t(`crmActivities.kinds.${activity.activityKind}`);

          return (
            <div className="flex items-start gap-2.5">
              <div className="size-7 rounded-nx-md bg-nx-raised border border-nx-line flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="size-3.5 text-nx-accent" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-xs text-nx-ink block line-clamp-1">
                    {activity.summary}
                  </span>
                  <Badge
                    variant="outline"
                    className="border-nx-line bg-nx-raised text-[9px] py-0 px-1 font-mono text-nx-ink-2"
                  >
                    {kindLabel}
                  </Badge>
                </div>
                {activity.bodyText && (
                  <p className="text-[11px] text-nx-ink-3 line-clamp-1 max-w-sm">
                    {activity.bodyText}
                  </p>
                )}
              </div>
            </div>
          );
        },
      },
      {
        key: "accountId",
        label: t("crmActivities.table.account"),
        render: (_val, activity: CrmActivity) => {
          const account = accountsMap.get(activity.accountId);
          const accountName = account
            ? isAr && account.nameAr
              ? account.nameAr
              : account.nameEn
            : activity.accountId
            ? t("crmActivities.table.accountRef")
            : t("crmActivities.table.noAccount");

          if (!activity.accountId) {
            return <span className="text-nx-ink-3 text-xs">—</span>;
          }

          return (
            <div
              className="flex items-center gap-1.5 cursor-pointer hover:text-nx-accent transition-colors"
              onClick={() => router.push(`/crm/accounts/${activity.accountId}`)}
            >
              <Building2 className="size-3 text-nx-accent shrink-0" />
              <span className="text-xs font-medium text-nx-ink hover:text-nx-accent truncate max-w-[170px]">
                {accountName}
              </span>
            </div>
          );
        },
      },
      {
        key: "actorDisplaySnapshot",
        label: t("crmActivities.table.actor"),
        render: (_val, activity: CrmActivity) => (
          <span className="text-xs text-nx-ink font-medium">
            {activity.actorDisplaySnapshot}
          </span>
        ),
      },
      {
        key: "workItemStatus",
        label: t("crmActivities.table.followUp"),
        render: (_val, activity: CrmActivity) => {
          if (!activity.workItemStatus) {
            return (
              <span className="text-[11px] text-nx-ink-3">
                {t("crmActivities.table.noFollowUp")}
              </span>
            );
          }

          return (
            <div className="flex items-center gap-1.5">
              <Badge
                variant="outline"
                className="border-nx-line bg-nx-raised text-[10px] font-mono text-nx-ink-2"
              >
                {activity.workItemStatus}
              </Badge>
              {activity.workItemDueAtUtc && (
                <span className="text-[10px] text-nx-ink-3 font-mono flex items-center gap-0.5">
                  <Clock className="size-2.5" />
                  {new Date(activity.workItemDueAtUtc).toLocaleDateString(
                    isAr ? "ar-SA" : "en-US",
                    { month: "short", day: "numeric" }
                  )}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "occurredAtUtc",
        label: t("crmActivities.table.occurredAt"),
        sortable: true,
        render: (_val, activity: CrmActivity) => {
          const dateStr = activity.occurredAtUtc || activity.createdAt;
          const formatted = dateStr
            ? new Date(dateStr).toLocaleDateString(isAr ? "ar-SA" : "en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "—";

          return (
            <div className="flex items-center gap-1 text-[11px] text-nx-ink-3 font-mono">
              <Calendar className="size-3" />
              <span>{formatted}</span>
            </div>
          );
        },
      },
    ],
    [language, t, accountsMap, router, isAr]
  );
}
