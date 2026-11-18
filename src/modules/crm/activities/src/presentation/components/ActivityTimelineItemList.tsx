"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { CalendarClock, CheckCircle2, ListTodo, ShieldAlert, User } from "lucide-react";
import type { CrmActivity } from "../../domain/entities/CrmActivityEntity";
import {
  formatActivityTimestamp,
  getActivityDeliveryStatusLabel,
  getActivityWorkItemStatusLabel,
  renderActivityKindBadge,
  renderActivityKindIcon,
} from "../utils/activityTimelineFormatters";

export interface ActivityTimelineItemListProps {
  readonly items: readonly CrmActivity[];
  readonly canFollowUp: boolean;
  readonly onSelectForFollowUp: (activity: CrmActivity) => void;
}

/**
 * ActivityTimelineItemList displays chronological sales interactions, commercial memos,
 * and dispatch receipts along a vertical timeline with complete bilingual RTL parity.
 */
export function ActivityTimelineItemList({
  items,
  canFollowUp,
  onSelectForFollowUp,
}: ActivityTimelineItemListProps) {
  const { t, language } = useI18n();
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});

  return (
    <div className="relative space-y-4 ps-6 before:absolute before:top-2 before:bottom-2 before:start-2.5 before:w-px before:bg-nx-line">
      {items.map((activity) => {
        const isMasked = activity.maskedFieldKeys?.includes("bodyText");
        const isComm = activity.activityKind === "CommunicationSent" || Boolean(activity.communicationRefId);
        const isCompleted = Boolean(completedIds[activity.activityId]) || activity.workItemStatus?.toLowerCase() === "completed";

        return (
          <div key={activity.activityId} className="relative group">
            <div className="absolute top-1 -start-6 flex size-5 items-center justify-center rounded-full bg-nx-surface border border-nx-line">
              {renderActivityKindIcon(activity.activityKind)}
            </div>

            <div className="p-3.5 rounded-lg bg-nx-surface border border-nx-line hover:border-nx-line-hi transition-colors space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {renderActivityKindBadge(activity.activityKind, t)}
                    <h4 className="text-xs font-bold text-nx-ink leading-snug">{activity.summary}</h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-nx-ink-3">
                    <span className="flex items-center gap-1 font-medium">
                      <User className="size-2.5 text-nx-ink-3" />
                      {activity.actorDisplaySnapshot}
                    </span>
                    <span>•</span>
                    <span className="font-mono">{formatActivityTimestamp(activity.occurredAtUtc, language)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {isComm && (
                    <Badge
                      variant="outline"
                      data-testid="communication-delivery-badge"
                      className="border-success/30 bg-success/10 text-success text-[10px] py-0.5 px-2 flex items-center gap-1 font-mono"
                    >
                      <CheckCircle2 className="size-2.5" />
                      <span>
                        {t("crmActivities.timeline.deliveryPrefix")}: {getActivityDeliveryStatusLabel(activity.communicationDeliveryStatus, t)}
                      </span>
                    </Badge>
                  )}

                  {(activity.workItemRefId || isCompleted) && (
                    <Badge
                      variant="outline"
                      className="border-warning-strong/30 bg-warning/10 text-nx-warning-strong text-[10px] py-0.5 px-2 flex items-center gap-1 font-medium"
                    >
                      <ListTodo className="size-2.5" />
                      <span>
                        {t("crmActivities.timeline.taskPrefix")}: {getActivityWorkItemStatusLabel(isCompleted ? "completed" : activity.workItemStatus, t)}
                      </span>
                    </Badge>
                  )}

                  {canFollowUp && !isCompleted && (activity.activityKind === "FollowUpLinked" || Boolean(activity.workItemRefId)) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-testid="mark-activity-done-btn"
                      onClick={() => {
                        setCompletedIds((prev) => ({ ...prev, [activity.activityId]: true }));
                        onSelectForFollowUp(activity);
                      }}
                      className="h-6 text-[10px] px-2 text-success border-success/30 hover:bg-success/10 gap-1"
                    >
                      <CheckCircle2 className="size-2.5 text-success" />
                      <span>{t("crmActivities.timeline.markDone")}</span>
                    </Button>
                  )}

                  {canFollowUp && activity.activityKind !== "FollowUpLinked" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      data-testid="follow-up-activity-btn"
                      onClick={() => onSelectForFollowUp(activity)}
                      className="h-6 text-[10px] px-2 text-nx-ink-3 hover:text-nx-ink hover:bg-nx-raised gap-1 opacity-80 group-hover:opacity-100"
                    >
                      <CalendarClock className="size-2.5 text-nx-warning-strong" />
                      <span>{t("crmActivities.timeline.addFollowUp")}</span>
                    </Button>
                  )}
                </div>
              </div>

              {isMasked ? (
                <div className="flex items-center gap-1.5 p-2 rounded bg-nx-raised border border-nx-line text-[11px] text-nx-ink-3 italic">
                  <ShieldAlert className="size-3 text-nx-warning-strong shrink-0" />
                  <span>{t("crmActivities.timeline.piiMasked")}</span>
                </div>
              ) : activity.bodyText ? (
                <p className="text-xs text-nx-ink-2 whitespace-pre-wrap leading-relaxed pt-1">{activity.bodyText}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
