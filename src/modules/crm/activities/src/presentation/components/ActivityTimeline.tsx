"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { Label } from "@core/ui/label";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import {
  FileText,
  Phone,
  Users,
  CalendarClock,
  Plus,
  ShieldAlert,
  Clock,
  User,
  CheckCircle2,
  ListTodo,
  Send,
  Mail,
  Sparkles,
} from "lucide-react";
import { CRM_PERMISSIONS } from "@modules/crm";
import type { SalesActivityKind } from "../../domain/entities/CrmActivityEntity";
import { useCrmActivitiesViewModel } from "../viewmodels/useCrmActivitiesViewModel";
import { CreateActivityModal } from "./CreateActivityModal";
import { CreateFollowUpModal } from "./CreateFollowUpModal";

interface ActivityTimelineProps {
  readonly leadId?: string;
  readonly accountId?: string;
  readonly opportunityId?: string;
  readonly targetLabel?: string;
  readonly defaultRecipientEmail?: string;
  readonly className?: string;
}

export function ActivityTimeline({
  leadId,
  accountId,
  opportunityId,
  targetLabel,
  defaultRecipientEmail = "",
  className = "",
}: ActivityTimelineProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const canCreateActivity = usePermission(
    CRM_PERMISSIONS.ACTIVITIES_CREATE ?? "crm.activities.create"
  );
  const canSendComm = usePermission(
    CRM_PERMISSIONS.COMMUNICATIONS_SEND ?? "crm.communications.send"
  );
  const canFollowUp = usePermission(
    CRM_PERMISSIONS.ACTIVITIES_FOLLOWUP ?? "crm.activities.followup"
  );

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
    setSubmitError,
    handleCreateActivity,
    handleCreateFollowUp,
  } = viewModel;

  // Outbound Communication Composer Modal state (SCRIPE-740)
  const [isCommOpen, setIsCommOpen] = useState(false);
  const [commRecipient, setCommRecipient] = useState(defaultRecipientEmail);
  const [commChannel, setCommChannel] = useState<"Email" | "Proposal" | "WhatsApp">("Email");
  const [commSubject, setCommSubject] = useState("");
  const [commBody, setCommBody] = useState("");

  const handleSendCommunication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commSubject.trim()) return;
    const recipientTag = commRecipient.trim() ? `[To: ${commRecipient.trim()}] ` : "";
    const ok = await handleCreateActivity({
      activityKind: "CommunicationSent",
      summary: `${commChannel}: ${recipientTag}${commSubject.trim()}`,
      bodyText: commBody.trim() || undefined,
      containsPii: false,
    });
    if (ok) {
      setCommSubject("");
      setCommBody("");
      setIsCommOpen(false);
    }
  };

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
        return <Sparkles className="size-3.5 text-success" />;
      default:
        return <Clock className="size-3.5 text-nx-ink-3" />;
    }
  };

  const getActivityKindBadge = (kind: SalesActivityKind) => {
    switch (kind) {
      case "Note":
        return (
          <Badge
            variant="outline"
            className="border-info/20 bg-info/10 text-info text-[10px] py-0 px-1.5 font-medium"
          >
            {t("crmActivities.kinds.note") || "Note"}
          </Badge>
        );
      case "CallLog":
        return (
          <Badge
            variant="outline"
            className="border-success/20 bg-success/10 text-success text-[10px] py-0 px-1.5 font-medium"
          >
            {t("crmActivities.kinds.call") || "Call"}
          </Badge>
        );
      case "MeetingLog":
        return (
          <Badge
            variant="outline"
            className="border-nx-accent/30 bg-nx-accent-wash text-nx-accent text-[10px] py-0 px-1.5 font-medium"
          >
            {t("crmActivities.kinds.meeting") || "Meeting"}
          </Badge>
        );
      case "FollowUpLinked":
        return (
          <Badge
            variant="outline"
            className="border-warning/20 bg-warning/10 text-warning text-[10px] py-0 px-1.5 font-medium"
          >
            {t("crmActivities.kinds.followup") || "Follow-up Task"}
          </Badge>
        );
      case "CommunicationSent":
        return (
          <Badge
            variant="outline"
            className="border-nx-accent/30 bg-nx-accent-wash text-nx-accent text-[10px] py-0 px-1.5 font-medium"
          >
            Outbound Communication
          </Badge>
        );
      case "FulfillmentRequested":
        return (
          <Badge
            variant="outline"
            className="border-success/30 bg-success/10 text-success text-[10px] py-0 px-1.5 font-medium"
          >
            HQ Fulfillment Handoff
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="border-nx-line bg-nx-raised text-nx-ink-3 text-[10px] py-0 px-1.5"
          >
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
          <h3
            className={`text-xs font-bold text-nx-ink flex items-center gap-1.5 ${
              !isRtl ? "uppercase tracking-wider font-mono" : ""
            }`}
          >
            <Clock className="size-3.5 text-nx-accent" />
            {t("crmActivities.timeline.title") || "Activity & Interaction Timeline"}
          </h3>
          <Badge
            variant="secondary"
            className="bg-nx-surface border-nx-line text-[10px] font-mono px-1.5 py-0 text-nx-ink-2"
          >
            {state.totalCount}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Pills */}
          <div className="hidden sm:flex items-center gap-1 bg-nx-ground p-0.5 rounded-md border border-nx-line text-[11px]">
            <Button
              type="button"
              variant={activityKindFilter === "ALL" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActivityKindFilter("ALL")}
              className={`h-6 text-[10px] px-2 ${
                activityKindFilter === "ALL"
                  ? "bg-nx-surface text-nx-ink font-bold shadow-none"
                  : "text-nx-ink-3 hover:text-nx-ink"
              }`}
            >
              {t("common.all") || "All"}
            </Button>
            <Button
              type="button"
              variant={activityKindFilter === "Note" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActivityKindFilter("Note")}
              className={`h-6 text-[10px] px-2 ${
                activityKindFilter === "Note"
                  ? "bg-nx-surface text-nx-ink font-bold shadow-none"
                  : "text-nx-ink-3 hover:text-nx-ink"
              }`}
            >
              {t("crmActivities.kinds.notes") || "Notes"}
            </Button>
            <Button
              type="button"
              variant={activityKindFilter === "CallLog" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActivityKindFilter("CallLog")}
              className={`h-6 text-[10px] px-2 ${
                activityKindFilter === "CallLog"
                  ? "bg-nx-surface text-nx-ink font-bold shadow-none"
                  : "text-nx-ink-3 hover:text-nx-ink"
              }`}
            >
              {t("crmActivities.kinds.calls") || "Calls"}
            </Button>
            <Button
              type="button"
              variant={activityKindFilter === "MeetingLog" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActivityKindFilter("MeetingLog")}
              className={`h-6 text-[10px] px-2 ${
                activityKindFilter === "MeetingLog"
                  ? "bg-nx-surface text-nx-ink font-bold shadow-none"
                  : "text-nx-ink-3 hover:text-nx-ink"
              }`}
            >
              {t("crmActivities.kinds.meetings") || "Meetings"}
            </Button>
          </div>

          {(canSendComm || canCreateActivity) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="send-communication-btn"
              onClick={() => {
                setSubmitError(null);
                setCommRecipient(defaultRecipientEmail || "");
                setIsCommOpen(true);
              }}
              className="h-7 text-xs gap-1 px-2.5 border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised"
            >
              <Send className="size-3 text-nx-accent" />
              <span>Send Communication</span>
            </Button>
          )}

          {canCreateActivity && (
            <Button
              type="button"
              size="sm"
              data-testid="log-activity-btn"
              onClick={() => setIsCreateOpen(true)}
              className="h-7 text-xs font-bold gap-1 px-2.5"
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
              "Record notes, phone calls, meeting summaries, or outbound communications to maintain a complete history."}
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
        <div
          className={`relative space-y-4 before:absolute before:top-2 before:bottom-2 before:w-px before:bg-nx-line ${
            isRtl ? "pr-6 before:right-2.5" : "pl-6 before:left-2.5"
          }`}
        >
          {state.items.map((activity) => {
            const isMasked = activity.maskedFieldKeys?.includes("bodyText");
            const isComm =
              activity.activityKind === "CommunicationSent" ||
              Boolean(activity.communicationRefId);
            return (
              <div key={activity.activityId} className="relative group">
                {/* Timeline node icon */}
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
                      {/* Outbound Communication Delivery Status Badge (SCRIPE-740) */}
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

                      {/* Linked WorkItem status badge */}
                      {activity.workItemRefId && (
                        <Badge
                          variant="outline"
                          className="border-warning/30 bg-warning/10 text-warning text-[10px] py-0.5 px-2 flex items-center gap-1 font-medium"
                        >
                          <ListTodo className="size-2.5" />
                          <span>
                            {t("crmActivities.timeline.taskPrefix") || "Task"}:{" "}
                            {activity.workItemStatus || "Active"}
                          </span>
                        </Badge>
                      )}

                      {/* Quick Follow-up button */}
                      {canFollowUp && activity.activityKind !== "FollowUpLinked" && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSubmitError(null);
                            setSelectedActivityForFollowUp(activity);
                          }}
                          className="h-6 text-[10px] px-2 text-nx-ink-3 hover:text-nx-ink hover:bg-nx-raised gap-1 opacity-80 group-hover:opacity-100"
                        >
                          <CalendarClock className="size-2.5 text-warning" />
                          <span>{t("crmActivities.timeline.addFollowUp") || "Follow-up"}</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Body text or masked notice */}
                  {isMasked ? (
                    <div className="flex items-center gap-1.5 p-2 rounded bg-nx-raised border border-nx-line text-[11px] text-nx-ink-3 italic">
                      <ShieldAlert className="size-3 text-warning" />
                      <span>
                        {t("crmActivities.timeline.piiMasked") ||
                          "Activity details contain restricted PII and are masked per authorization policy."}
                      </span>
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

      {/* Log Activity Modal */}
      <CreateActivityModal
        isOpen={isCreateOpen}
        onOpenChange={(open) => {
          setSubmitError(null);
          setIsCreateOpen(open);
        }}
        onSubmit={handleCreateActivity}
        isSubmitting={isSubmitting}
        error={submitError}
        targetLabel={targetLabel}
      />

      {/* Send Outbound Communication Modal (SCRIPE-740) */}
      <Dialog open={isCommOpen} onOpenChange={setIsCommOpen}>
        <DialogContent
          data-testid="send-communication-dialog"
          className="sm:max-w-lg bg-nx-surface border-nx-line text-nx-ink"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <form onSubmit={handleSendCommunication}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-nx-ink font-heading flex items-center gap-2">
                <Send className="size-4 text-nx-accent" />
                <span>Send Outbound Commercial Communication</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-nx-ink-2">
                Dispatch a manual email or commercial proposal message and record a canonical
                delivery receipt on the timeline.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-4 text-xs">
              <div className="grid grid-cols-3 gap-2">
                {(["Email", "Proposal", "WhatsApp"] as const).map((ch) => (
                  <Button
                    key={ch}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCommChannel(ch)}
                    className={`h-8 text-xs ${
                      commChannel === ch
                        ? "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-bold"
                        : "border-nx-line bg-nx-raised text-nx-ink-2"
                    }`}
                  >
                    {ch}
                  </Button>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="comm-recipient" className="text-nx-ink font-semibold">
                  Recipient Email / Contact
                </Label>
                <Input
                  id="comm-recipient"
                  data-testid="comm-recipient-input"
                  value={commRecipient}
                  onChange={(e) => setCommRecipient(e.target.value)}
                  placeholder="executive@organization.sa"
                  className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="comm-subject" className="text-nx-ink font-semibold">
                  Subject / Headline *
                </Label>
                <Input
                  id="comm-subject"
                  data-testid="comm-subject-input"
                  value={commSubject}
                  onChange={(e) => setCommSubject(e.target.value)}
                  placeholder="Commercial Proposal & Multi-Venue Licensing Terms..."
                  required
                  className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="comm-body" className="text-nx-ink font-semibold">
                  Message Content
                </Label>
                <Textarea
                  id="comm-body"
                  data-testid="comm-body-textarea"
                  value={commBody}
                  onChange={(e) => setCommBody(e.target.value)}
                  rows={4}
                  placeholder="Write your commercial message or proposal cover note..."
                  className="text-xs bg-nx-ground border-nx-line text-nx-ink resize-none"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-nx-line">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCommOpen(false)}
                disabled={isSubmitting}
                className="h-8 text-xs border-nx-line text-nx-ink-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                data-testid="submit-send-communication-btn"
                disabled={isSubmitting || !commSubject.trim()}
                className="h-8 text-xs font-bold gap-1.5"
              >
                <Send className="size-3.5" />
                <span>{isSubmitting ? "Dispatching..." : "Send & Log Receipt"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <CreateFollowUpModal
        key={selectedActivityForFollowUp?.activityId ?? "closed"}
        activity={selectedActivityForFollowUp}
        onClose={() => {
          setSubmitError(null);
          setSelectedActivityForFollowUp(null);
        }}
        onSubmit={handleCreateFollowUp}
        isSubmitting={isSubmitting}
        error={submitError}
      />
    </div>
  );
}
