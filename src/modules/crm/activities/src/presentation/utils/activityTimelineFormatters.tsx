"use client";

import { Badge } from "@core/ui/badge";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  GitCommit,
  Mail,
  Phone,
  Users,
} from "lucide-react";
import type { SalesActivityKind } from "../../domain/entities/CrmActivityEntity";

/** Renders the Lucide icon matching a CRM sales activity kind. */
export function renderActivityKindIcon(kind: SalesActivityKind) {
  switch (kind) {
    case "Note":
      return <FileText className="size-3.5 text-info" />;
    case "CallLog":
      return <Phone className="size-3.5 text-success" />;
    case "MeetingLog":
      return <Users className="size-3.5 text-nx-ink" />;
    case "FollowUpLinked":
      return <CalendarClock className="size-3.5 text-nx-warning-strong" />;
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
}

/** Renders a semantic outline badge with localized label for a sales activity kind. */
export function renderActivityKindBadge(kind: SalesActivityKind, t: (k: string) => string) {
  const kindMap: Record<string, { cls: string; key?: string }> = {
    Note: { cls: "border-info/30 bg-info/10 text-info", key: "crmActivities.kinds.note" },
    CallLog: { cls: "border-success/30 bg-success/10 text-success", key: "crmActivities.kinds.call" },
    MeetingLog: { cls: "border-nx-line bg-nx-raised text-nx-ink", key: "crmActivities.kinds.meeting" },
    FollowUpLinked: { cls: "border-warning-strong/30 bg-warning/10 text-nx-warning-strong", key: "crmActivities.kinds.followup" },
    CommunicationSent: { cls: "border-info/30 bg-info/10 text-info", key: "crmActivities.kinds.communication" },
    FulfillmentRequested: { cls: "border-success/30 bg-success/10 text-success", key: "crmActivities.kinds.fulfillment" },
    StatusChange: { cls: "border-info/30 bg-info/10 text-info", key: "crmActivities.kinds.statusChange" },
    StageTransition: { cls: "border-info/30 bg-info/10 text-info", key: "crmActivities.kinds.stageTransition" },
    DocumentGenerated: { cls: "border-nx-line bg-nx-raised text-nx-ink", key: "crmActivities.kinds.documentGenerated" },
  };
  const cfg = kindMap[kind] ?? { cls: "border-nx-line bg-nx-raised text-nx-ink-3" };
  return (
    <Badge variant="outline" className={`${cfg.cls} text-[10px] py-0 px-1.5 font-medium`}>
      {cfg.key ? t(cfg.key) : kind}
    </Badge>
  );
}

/** Formats an ISO timestamp into a locale-aware date/time string for activity timelines. */
export function formatActivityTimestamp(timestamp: string, language: string): string {
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
}

/** Resolves the localized label for a communication dispatch delivery status. */
export function getActivityDeliveryStatusLabel(status: string | null | undefined, t: (k: string) => string): string {
  if (!status) return t("crmActivities.timeline.deliveryStatuses.sent");
  const normalized = status.toLowerCase();
  if (normalized === "sent") return t("crmActivities.timeline.deliveryStatuses.sent");
  if (normalized === "delivered") return t("crmActivities.timeline.deliveryStatuses.delivered");
  if (normalized === "failed") return t("crmActivities.timeline.deliveryStatuses.failed");
  if (normalized === "pending") return t("crmActivities.timeline.deliveryStatuses.pending");
  return status;
}

/** Resolves the localized label for a linked follow-up work item status. */
export function getActivityWorkItemStatusLabel(status: string | null | undefined, t: (k: string) => string): string {
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
}
