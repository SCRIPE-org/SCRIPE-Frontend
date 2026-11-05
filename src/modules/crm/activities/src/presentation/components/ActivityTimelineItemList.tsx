"use client";

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
} from "lucide-react";
import type { CrmActivity, SalesActivityKind } from "../../domain/entities/CrmActivityEntity";

interface ActivityTimelineItemListProps {
  items: CrmActivity[];
  canFollowUp: boolean;
  onSelectForFollowUp: (activity: CrmActivity) => void;
}

export function ActivityTimelineItemList({
  items,
  canFollowUp,
  onSelectForFollowUp,
}: ActivityTimelineItemListProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const getActivityIcon = (kind: SalesActivityKind) => {
    switch (kind) {
      case "Note":
        return <FileText className="size-3.5 text-info" />;
      case "CallLog":
        return <Phone className="size-3.5 text-success" />;
      case "MeetingLog":
        return <Users className="size-3.5 text-nx-accent" />;
      case "FollowUpLinked":
        return <CalendarClock className="size-3.5 text-warning" />;
      case "CommunicationSent":
        return <Mail className="size-3.5 text-nx-accent" />;
      case "FulfillmentRequested":
        return <CheckCircle2 className="size-3.5 text-success" />;
      default:
        return <Clock className="size-3.5 text-nx-ink-3" />;
    }
  };

  const getActivityKindBadge = (kind: SalesActivityKind) => {
    switch (kind) {
      case "Note":
        return (
          <Badge variant="outline" className="border-info/20 bg-info/10 text-info text-[10px] py-0 px-1.5 font-medium">
            {t("crmActivities.kinds.note") || "Note"}
          </Badge>
        );
      case "CallLog":
        return (
          <Badge variant="outline" className="border-success/20 bg-success/10 text-success text-[10px] py-0 px-1.5 font-medium">
            {t("crmActivities.kinds.call") || "Call"}
          </Badge>
        );
      case "MeetingLog":
        return (
          <Badge variant="outline" className="border-nx-accent/30 bg-nx-accent-wash text-nx-accent text-[10px] py-0 px-1.5 font-medium">
            {t("crmActivities.kinds.meeting") || "Meeting"}
          </Badge>
        );
      case "FollowUpLinked":
        return (
          <Badge variant="outline" className="border-warning/20 bg-warning/10 text-warning text-[10px] py-0 px-1.5 font-medium">
            {t("crmActivities.kinds.followup") || "Follow-up Task"}
          </Badge>
        );
      case "CommunicationSent":
        return (
          <Badge variant="outline" className="border-nx-accent/30 bg-nx-accent-wash text-nx-accent text-[10px] py-0 px-1.5 font-medium">
            Outbound Communication
          </Badge>
        );
      case "FulfillmentRequested":
        return (
          <Badge variant="outline" className="border-success/30 bg-success/10 text-success text-[10px] py-0 px-1.5 font-medium">
            HQ Fulfillment Handoff
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-nx-line bg-nx-raised text-nx-ink-3 text-[10px] py-0 px-1.5">
            {kind}
          </Badge>
        );
    }
  };

  return (
    <div
      className={`relative space-y-4 before:absolute before:top-2 before:bottom-2 before:w-px before:bg-nx-line ${
        isRtl ? "pr-6 before:right-2.5" : "pl-6 before:left-2.5"
      }`}
    >
      {items.map((activity) => {
        const isMasked = activity.maskedFieldKeys?.includes("bodyText");
        const isComm = activity.activityKind === "CommunicationSent" || Boolean(activity.communicationRefId);
        return (
          <div key={activity.activityId} className="relative group">
            <div
              className={`absolute top-1 flex size-5 items-center justify-center rounded-full bg-nx-surface border border-nx-line ${
                isRtl ? "-right-6" : "-left-6"
              }`}
            >
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
                    <span className="font-mono">
                      {new Date(activity.occurredAtUtc).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
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
                      <span>Delivery: {activity.communicationDeliveryStatus || "Sent"}</span>
                    </Badge>
                  )}

                  {activity.workItemRefId && (
                    <Badge
                      variant="outline"
                      className="border-warning/30 bg-warning/10 text-warning text-[10px] py-0.5 px-2 flex items-center gap-1 font-medium"
                    >
                      <ListTodo className="size-2.5" />
                      <span>
                        {t("crmActivities.timeline.taskPrefix") || "Task"}: {activity.workItemStatus || "Active"}
                      </span>
                    </Badge>
                  )}

                  {canFollowUp && activity.activityKind !== "FollowUpLinked" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectForFollowUp(activity)}
                      className="h-6 text-[10px] px-2 text-nx-ink-3 hover:text-nx-ink hover:bg-nx-raised gap-1 opacity-80 group-hover:opacity-100"
                    >
                      <CalendarClock className="size-2.5 text-warning" />
                      <span>{t("crmActivities.timeline.addFollowUp") || "Follow-up"}</span>
                    </Button>
                  )}
                </div>
              </div>

              {isMasked ? (
                <div className="flex items-center gap-1.5 p-2 rounded bg-nx-raised border border-nx-line text-[11px] text-nx-ink-3 italic">
                  <ShieldAlert className="size-3 text-warning" />
                  <span>
                    {t("crmActivities.timeline.piiMasked") ||
                      "Activity details contain restricted PII and are masked per authorization policy."}
                  </span>
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
