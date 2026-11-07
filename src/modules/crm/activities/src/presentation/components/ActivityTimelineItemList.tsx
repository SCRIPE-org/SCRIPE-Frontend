"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import {
  FileText,
  Phone,
  Users,
  CalendarClock,
  ShieldAlert,
  Clock,
  User,
  CheckCircle2,
  ListTodo,
  Mail,
  GitCommit,
  FileCheck,
} from "lucide-react";
import type { CrmActivity, SalesActivityKind } from "../../domain/entities/CrmActivityEntity";

/**
 * Properties for the ActivityTimelineItemList component.
 */
export interface ActivityTimelineItemListProps {
  /** The sequence of sales activities to display along the chronological rail. */
  readonly items: readonly CrmActivity[];
  /** Whether the user possesses permissions to schedule follow-up actions. */
  readonly canFollowUp: boolean;
  /** Callback fired when a user selects a specific interaction for follow-up scheduling. */
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

  const getActivityIcon = (kind: SalesActivityKind) => {
    switch (kind) {
      case "Note":
        return <FileText className="size-3.5 text-info" />;
      case "CallLog":
        return <Phone className="size-3.5 text-success" />;
      case "MeetingLog":
        return <Users className="size-3.5 text-nx-ink" />;
      case "FollowUpLinked":
        return <CalendarClock className="size-3.5 text-warning" />;
      case "CommunicationSent":
        return <Mail className="size-3.5 text-info" />;
      case "FulfillmentRequested":
        return <CheckCircle2 className="size-3.5 text-success" />;
      case "StatusChange":
      case "StageTransition":
        return <GitCommit className="size-3.5 text-info" />;
      case "DocumentGenerated":
        return <FileCheck className="size-3.5 text-nx-ink" />;
      default:
        return <Clock className="size-3.5 text-nx-ink-3" />;
    }
  };

  const getActivityKindBadge = (kind: SalesActivityKind) => {
    switch (kind) {
      case "Note":
        return (
          <Badge variant="outline" className="border-info/30 bg-info/10 text-info text-[10px] py-0 px-1.5 font-medium">
            {t("crmActivities.kinds.note")}
          </Badge>
        );
      case "CallLog":
        return (
          <Badge variant="outline" className="border-success/30 bg-success/10 text-success text-[10px] py-0 px-1.5 font-medium">
            {t("crmActivities.kinds.call")}
          </Badge>
        );
      case "MeetingLog":
        return (
          <Badge variant="outline" className="border-nx-line bg-nx-raised text-nx-ink text-[10px] py-0 px-1.5 font-medium">
            {t("crmActivities.kinds.meeting")}
          </Badge>
        );
      case "FollowUpLinked":
        return (
          <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning text-[10px] py-0 px-1.5 font-medium">
            {t("crmActivities.kinds.followup")}
          </Badge>
        );
      case "CommunicationSent":
        return (
          <Badge variant="outline" className="border-info/30 bg-info/10 text-info text-[10px] py-0 px-1.5 font-medium">
            {t("crmActivities.kinds.communication")}
          </Badge>
        );
      case "FulfillmentRequested":
        return (
          <Badge variant="outline" className="border-success/30 bg-success/10 text-success text-[10px] py-0 px-1.5 font-medium">
            {t("crmActivities.kinds.fulfillment")}
          </Badge>
        );
      case "StatusChange":
        return (
          <Badge variant="outline" className="border-info/30 bg-info/10 text-info text-[10px] py-0 px-1.5 font-medium">
            {t("crmActivities.kinds.statusChange")}
          </Badge>
        );
      case "StageTransition":
        return (
          <Badge variant="outline" className="border-info/30 bg-info/10 text-info text-[10px] py-0 px-1.5 font-medium">
            {t("crmActivities.kinds.stageTransition")}
          </Badge>
        );
      case "DocumentGenerated":
        return (
          <Badge variant="outline" className="border-nx-line bg-nx-raised text-nx-ink text-[10px] py-0 px-1.5 font-medium">
            {t("crmActivities.kinds.documentGenerated")}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-nx-line bg-nx-raised text-nx-ink-3 text-[10px] py-0 px-1.5 font-medium">
            {kind}
          </Badge>
        );
    }
  };

  const formatActivityDate = (timestamp: string) => {
    try {
      const parsed = new Date(timestamp);
      if (Number.isNaN(parsed.getTime())) return timestamp;
      return new Intl.DateTimeFormat(language === "ar" ? "ar-SA" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(parsed);
    } catch {
      return timestamp;
    }
  };

  const getDeliveryStatusLabel = (status?: string | null) => {
    if (!status) return t("crmActivities.timeline.deliveryStatuses.sent");
    const normalized = status.toLowerCase();
    if (normalized === "sent") return t("crmActivities.timeline.deliveryStatuses.sent");
    if (normalized === "delivered") return t("crmActivities.timeline.deliveryStatuses.delivered");
    if (normalized === "failed") return t("crmActivities.timeline.deliveryStatuses.failed");
    if (normalized === "pending") return t("crmActivities.timeline.deliveryStatuses.pending");
    return status;
  };

  const getWorkItemStatusLabel = (status?: string | null) => {
    if (!status) return t("crmActivities.timeline.taskStatuses.active");
    const normalized = status.toLowerCase();
    if (normalized === "active") return t("crmActivities.timeline.taskStatuses.active");
    if (normalized === "completed") return t("crmActivities.timeline.taskStatuses.completed");
    if (normalized === "inprogress" || normalized === "in_progress") {
      return t("crmActivities.timeline.taskStatuses.inProgress");
    }
    if (normalized === "cancelled" || normalized === "canceled") {
      return t("crmActivities.timeline.taskStatuses.cancelled");
    }
    return status;
  };

  return (
    <div className="relative space-y-4 ps-6 before:absolute before:top-2 before:bottom-2 before:start-2.5 before:w-px before:bg-nx-line">
      {items.map((activity) => {
        const isMasked = activity.maskedFieldKeys?.includes("bodyText");
        const isComm = activity.activityKind === "CommunicationSent" || Boolean(activity.communicationRefId);
        const isCompleted = Boolean(completedIds[activity.activityId]) || activity.workItemStatus?.toLowerCase() === "completed";

        return (
          <div key={activity.activityId} className="relative group">
            <div className="absolute top-1 -start-6 flex size-5 items-center justify-center rounded-full bg-nx-surface border border-nx-line">
              {getActivityIcon(activity.activityKind)}
            </div>

            <div className="p-3.5 rounded-lg bg-nx-surface border border-nx-line hover:border-nx-line-hi transition-colors space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getActivityKindBadge(activity.activityKind)}
                    <h4 className="text-xs font-bold text-nx-ink leading-snug">{activity.summary}</h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-nx-ink-3">
                    <span className="flex items-center gap-1 font-medium">
                      <User className="size-2.5 text-nx-ink-3" />
                      {activity.actorDisplaySnapshot}
                    </span>
                    <span>•</span>
                    <span className="font-mono">{formatActivityDate(activity.occurredAtUtc)}</span>
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
                        {t("crmActivities.timeline.deliveryPrefix")}: {getDeliveryStatusLabel(activity.communicationDeliveryStatus)}
                      </span>
                    </Badge>
                  )}

                  {(activity.workItemRefId || isCompleted) && (
                    <Badge
                      variant="outline"
                      className="border-warning/30 bg-warning/10 text-warning text-[10px] py-0.5 px-2 flex items-center gap-1 font-medium"
                    >
                      <ListTodo className="size-2.5" />
                      <span>
                        {t("crmActivities.timeline.taskPrefix")}: {getWorkItemStatusLabel(isCompleted ? "completed" : activity.workItemStatus)}
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
                      <CalendarClock className="size-2.5 text-warning" />
                      <span>{t("crmActivities.timeline.addFollowUp")}</span>
                    </Button>
                  )}
                </div>
              </div>

              {isMasked ? (
                <div className="flex items-center gap-1.5 p-2 rounded bg-nx-raised border border-nx-line text-[11px] text-nx-ink-3 italic">
                  <ShieldAlert className="size-3 text-warning shrink-0" />
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
