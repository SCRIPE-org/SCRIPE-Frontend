"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card } from "@core/ui/card";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import {
  FileText,
  Phone,
  Users,
  CalendarClock,
  Plus,
  ShieldAlert,
  Clock,
  User,
  ArrowRight,
  CheckCircle2,
  ListTodo,
} from "lucide-react";
import { CRM_PERMISSIONS } from "@modules/crm";
import type { SalesActivityKind, CrmActivity } from "../../domain/entities/CrmActivityEntity";
import { useCrmActivitiesViewModel } from "../viewmodels/useCrmActivitiesViewModel";
import { CreateActivityModal } from "./CreateActivityModal";
import { CreateFollowUpModal } from "./CreateFollowUpModal";

interface ActivityTimelineProps {
  readonly leadId?: string;
  readonly accountId?: string;
  readonly opportunityId?: string;
  readonly targetLabel?: string;
  readonly className?: string;
}

export function ActivityTimeline({
  leadId,
  accountId,
  opportunityId,
  targetLabel,
  className = "",
}: ActivityTimelineProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const canCreateActivity = usePermission(CRM_PERMISSIONS.ACTIVITIES_CREATE ?? "crm.activities.create");
  const canFollowUp = usePermission(CRM_PERMISSIONS.ACTIVITIES_FOLLOWUP ?? "crm.activities.followup");

  const viewModel = useCrmActivitiesViewModel({
    leadId,
    accountId,
    opportunityId,
  });

  const {
    state,
    activityKindFilter,
    setActivityKindFilter,
    isCreateOpen,
    setIsCreateOpen,
    selectedActivityForFollowUp,
    setSelectedActivityForFollowUp,
    isSubmitting,
    submitError,
    handleCreateActivity,
    handleCreateFollowUp,
  } = viewModel;

  const getActivityIcon = (kind: SalesActivityKind) => {
    switch (kind) {
      case "Note":
        return <FileText className="size-3.5 text-blue-400" />;
      case "CallLog":
        return <Phone className="size-3.5 text-emerald-400" />;
      case "MeetingLog":
        return <Users className="size-3.5 text-purple-400" />;
      case "FollowUpLinked":
        return <CalendarClock className="size-3.5 text-amber-400" />;
      default:
        return <Clock className="size-3.5 text-nx-ink-3" />;
    }
  };

  const getActivityKindBadge = (kind: SalesActivityKind) => {
    switch (kind) {
      case "Note":
        return (
          <Badge variant="outline" className="border-blue-500/20 bg-blue-500/10 text-blue-400 text-[10px] py-0 px-1.5 font-medium">
            {t("crmActivities.kinds.note") || "Note"}
          </Badge>
        );
      case "CallLog":
        return (
          <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[10px] py-0 px-1.5 font-medium">
            {t("crmActivities.kinds.call") || "Call"}
          </Badge>
        );
      case "MeetingLog":
        return (
          <Badge variant="outline" className="border-purple-500/20 bg-purple-500/10 text-purple-400 text-[10px] py-0 px-1.5 font-medium">
            {t("crmActivities.kinds.meeting") || "Meeting"}
          </Badge>
        );
      case "FollowUpLinked":
        return (
          <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-400 text-[10px] py-0 px-1.5 font-medium">
            {t("crmActivities.kinds.followup") || "Follow-up Task"}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-nx-line bg-nx-surfaceSubtle text-nx-ink-3 text-[10px] py-0 px-1.5">
            {kind}
          </Badge>
        );
    }
  };

  return (
    <div className={`space-y-4 ${className}`} dir={isRtl ? "rtl" : "ltr"}>
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-nx-line pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-nx-ink font-mono flex items-center gap-1.5">
            <Clock className="size-3.5 text-nx-accent" />
            {t("crmActivities.timeline.title") || "Activity & Interaction Timeline"}
          </h3>
          <Badge variant="secondary" className="bg-nx-surface border-nx-line text-[10px] font-mono px-1.5 py-0 text-nx-ink-2">
            {state.totalCount}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="hidden sm:flex items-center gap-1 bg-nx-ground p-0.5 rounded-md border border-nx-line text-[11px]">
            <Button
              type="button"
              variant={activityKindFilter === "ALL" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActivityKindFilter("ALL")}
              className={`h-6 text-[10px] px-2 ${activityKindFilter === "ALL" ? "bg-nx-surface text-nx-ink font-bold shadow-none" : "text-nx-ink-3 hover:text-nx-ink"}`}
            >
              {t("common.all") || "All"}
            </Button>
            <Button
              type="button"
              variant={activityKindFilter === "Note" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActivityKindFilter("Note")}
              className={`h-6 text-[10px] px-2 ${activityKindFilter === "Note" ? "bg-nx-surface text-nx-ink font-bold shadow-none" : "text-nx-ink-3 hover:text-nx-ink"}`}
            >
              {t("crmActivities.kinds.notes") || "Notes"}
            </Button>
            <Button
              type="button"
              variant={activityKindFilter === "CallLog" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActivityKindFilter("CallLog")}
              className={`h-6 text-[10px] px-2 ${activityKindFilter === "CallLog" ? "bg-nx-surface text-nx-ink font-bold shadow-none" : "text-nx-ink-3 hover:text-nx-ink"}`}
            >
              {t("crmActivities.kinds.calls") || "Calls"}
            </Button>
            <Button
              type="button"
              variant={activityKindFilter === "MeetingLog" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActivityKindFilter("MeetingLog")}
              className={`h-6 text-[10px] px-2 ${activityKindFilter === "MeetingLog" ? "bg-nx-surface text-nx-ink font-bold shadow-none" : "text-nx-ink-3 hover:text-nx-ink"}`}
            >
              {t("crmActivities.kinds.meetings") || "Meetings"}
            </Button>
          </div>

          {canCreateActivity && (
            <Button
              type="button"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="h-7 text-xs bg-nx-accent-fill text-nx-on-fill font-bold gap-1 px-2.5 hover:brightness-105"
            >
              <Plus className="size-3" />
              <span>{t("crmActivities.timeline.logBtn") || "Log Activity"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {state.stage === "loading" && state.items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="md" className="text-nx-accent" />
          <p className="mt-2 text-xs text-nx-ink-3">
            {t("crmActivities.timeline.loading") || "Loading timeline events..."}
          </p>
        </div>
      )}

      {/* Empty State */}
      {state.stage !== "loading" && state.items.length === 0 && (
        <Card className="p-8 text-center bg-nx-surface border-nx-line">
          <Clock className="size-8 mx-auto text-nx-ink-3 opacity-40 mb-2" />
          <h4 className="text-xs font-semibold text-nx-ink">
            {t("crmActivities.timeline.emptyTitle") || "No activities recorded"}
          </h4>
          <p className="text-[11px] text-nx-ink-3 max-w-sm mx-auto mt-1 mb-3">
            {t("crmActivities.timeline.emptyDesc") ||
              "Record notes, phone calls, or meeting summaries to maintain an auditable timeline."}
          </p>
          {canCreateActivity && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsCreateOpen(true)}
              className="h-7 text-xs border-nx-line text-nx-ink-2 gap-1.5"
            >
              <Plus className="size-3" />
              <span>{t("crmActivities.timeline.logFirst") || "Log First Interaction"}</span>
            </Button>
          )}
        </Card>
      )}

      {/* Timeline List */}
      {state.items.length > 0 && (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-nx-line">
          {state.items.map((activity) => {
            const isMasked = activity.maskedFieldKeys?.includes("bodyText");

            return (
              <div key={activity.activityId} className="relative group">
                {/* Timeline node icon */}
                <div className="absolute -left-6 top-1 flex size-5 items-center justify-center rounded-full bg-nx-surface border border-nx-line shadow-xs">
                  {getActivityIcon(activity.activityKind)}
                </div>

                <div className="p-3.5 rounded-lg bg-nx-surface border border-nx-line hover:border-nx-line-hi transition-colors space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getActivityKindBadge(activity.activityKind)}
                        <h4 className="text-xs font-bold text-nx-ink leading-snug">
                          {activity.summary}
                        </h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-nx-ink-3">
                        <span className="flex items-center gap-1 font-medium">
                          <User className="size-2.5 text-nx-ink-3" />
                          {activity.actorDisplaySnapshot}
                        </span>
                        <span>•</span>
                        <span className="font-mono">
                          {new Date(activity.occurredAtUtc).toLocaleDateString(
                            language === "ar" ? "ar-SA" : "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Linked WorkItem status badge */}
                      {activity.workItemRefId && (
                        <Badge
                          variant="outline"
                          className="border-warning/30 bg-warning/10 text-warning text-[10px] py-0.5 px-2 flex items-center gap-1 font-mono font-medium"
                        >
                          <ListTodo className="size-2.5" />
                          <span>Task: {activity.workItemStatus || "Active"}</span>
                        </Badge>
                      )}

                      {/* Quick Follow-up button */}
                      {canFollowUp && activity.activityKind !== "FollowUpLinked" && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedActivityForFollowUp(activity)}
                          className="h-6 text-[10px] px-2 text-nx-ink-3 hover:text-nx-ink hover:bg-nx-surfaceSubtle gap-1 opacity-80 group-hover:opacity-100"
                        >
                          <CalendarClock className="size-2.5 text-warning" />
                          <span>{t("crmActivities.timeline.addFollowUp") || "Follow-up"}</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Body text or masked notice */}
                  {isMasked ? (
                    <div className="flex items-center gap-1.5 p-2 rounded bg-nx-surfaceSubtle border border-nx-line text-[11px] text-nx-ink-3 italic">
                      <ShieldAlert className="size-3 text-warning" />
                      <span>{t("crmActivities.timeline.piiMasked") || "Activity details contain restricted PII and are masked per authorization policy."}</span>
                    </div>
                  ) : activity.bodyText ? (
                    <p className="text-xs text-nx-ink-2 whitespace-pre-wrap leading-relaxed pt-1">
                      {activity.bodyText}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateActivityModal
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateActivity}
        isSubmitting={isSubmitting}
        error={submitError}
        targetLabel={targetLabel}
      />

      <CreateFollowUpModal
        activity={selectedActivityForFollowUp}
        onClose={() => setSelectedActivityForFollowUp(null)}
        onSubmit={handleCreateFollowUp}
        isSubmitting={isSubmitting}
        error={submitError}
      />
    </div>
  );
}
