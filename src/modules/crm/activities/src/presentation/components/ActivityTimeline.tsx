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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@core/ui/dialog";
import { Plus, Clock, Send } from "lucide-react";
import { CRM_PERMISSIONS } from "@modules/crm";
import { useCrmActivitiesViewModel } from "../viewmodels/useCrmActivitiesViewModel";
import { CreateActivityModal } from "./CreateActivityModal";
import { CreateFollowUpModal } from "./CreateFollowUpModal";
import { ActivityTimelineItemList } from "./ActivityTimelineItemList";

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
  const canCreateActivity = usePermission(CRM_PERMISSIONS.ACTIVITIES_CREATE ?? "crm.activities.create");
  const canSendComm = usePermission(CRM_PERMISSIONS.COMMUNICATIONS_SEND ?? "crm.communications.send");
  const canFollowUp = usePermission(CRM_PERMISSIONS.ACTIVITIES_FOLLOWUP ?? "crm.activities.followup");

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
  } = useCrmActivitiesViewModel({ leadId, accountId, opportunityId });

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

  return (
    <div className={`space-y-4 ${className}`} dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-nx-line pb-3">
        <div className="flex items-center gap-2">
          <h3 className={`text-xs font-bold text-nx-ink flex items-center gap-1.5 ${!isRtl ? "uppercase tracking-wider font-mono" : ""}`}>
            <Clock className="size-3.5 text-nx-accent" />
            {t("crmActivities.timeline.title") || "Activity & Interaction Timeline"}
          </h3>
          <Badge variant="secondary" className="bg-nx-surface border-nx-line text-[10px] font-mono px-1.5 py-0 text-nx-ink-2">
            {state.totalCount}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-nx-ground p-0.5 rounded-md border border-nx-line text-[11px]">
            {(
              [
                { key: "ALL", label: t("common.all") || "All" },
                { key: "Note", label: t("crmActivities.kinds.notes") || "Notes" },
                { key: "CallLog", label: t("crmActivities.kinds.calls") || "Calls" },
                { key: "MeetingLog", label: t("crmActivities.kinds.meetings") || "Meetings" },
              ] as const
            ).map((f) => (
              <Button
                key={f.key}
                type="button"
                variant={activityKindFilter === f.key ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActivityKindFilter(f.key)}
                className={`h-6 text-[10px] px-2 ${
                  activityKindFilter === f.key ? "bg-nx-surface text-nx-ink font-bold shadow-none" : "text-nx-ink-3 hover:text-nx-ink"
                }`}
              >
                {f.label}
              </Button>
            ))}
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
              <span>{t("crmActivities.communication.sendBtn")}</span>
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
              <span>{t("crmActivities.timeline.logBtn")}</span>
            </Button>
          )}
        </div>
      </div>

      {state.stage === "loading" && state.items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="md" className="text-nx-accent" />
          <p className="mt-2 text-xs text-nx-ink-3">{t("crmActivities.timeline.loading")}</p>
        </div>
      )}

      {state.stage !== "loading" && state.items.length === 0 && (
        <Card className="p-8 text-center bg-nx-surface border-nx-line">
          <Clock className="size-8 mx-auto text-nx-ink-3 opacity-40 mb-2" />
          <h4 className="text-xs font-semibold text-nx-ink">{t("crmActivities.timeline.emptyTitle")}</h4>
          <p className="text-[11px] text-nx-ink-3 max-w-sm mx-auto mt-1 mb-3">
            {t("crmActivities.timeline.emptyDesc")}
          </p>
          {canCreateActivity && (
            <Button type="button" size="sm" variant="outline" onClick={() => setIsCreateOpen(true)} className="h-7 text-xs border-nx-line text-nx-ink-2 gap-1.5">
              <Plus className="size-3" />
              <span>{t("crmActivities.timeline.logFirst")}</span>
            </Button>
          )}
        </Card>
      )}

      {state.items.length > 0 && (
        <ActivityTimelineItemList
          items={state.items}
          canFollowUp={canFollowUp}
          onSelectForFollowUp={(activity) => {
            setSubmitError(null);
            setSelectedActivityForFollowUp(activity);
          }}
        />
      )}

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

      <Dialog open={isCommOpen} onOpenChange={setIsCommOpen}>
        <DialogContent data-testid="send-communication-dialog" className="sm:max-w-lg bg-nx-surface border-nx-line text-nx-ink" dir={isRtl ? "rtl" : "ltr"}>
          <form onSubmit={handleSendCommunication}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-nx-ink font-heading flex items-center gap-2">
                <Send className="size-4 text-nx-accent" />
                <span>{t("crmActivities.communication.dialogTitle")}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-nx-ink-2">
                {t("crmActivities.communication.dialogDesc")}
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
                      commChannel === ch ? "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-bold" : "border-nx-line bg-nx-raised text-nx-ink-2"
                    }`}
                  >
                    {t(`crmActivities.communication.channels.${ch}`)}
                  </Button>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="comm-recipient" className="text-nx-ink font-semibold">{t("crmActivities.communication.recipientLabel")}</Label>
                <Input id="comm-recipient" data-testid="comm-recipient-input" value={commRecipient} onChange={(e) => setCommRecipient(e.target.value)} placeholder={t("crmActivities.communication.recipientPlaceholder")} className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="comm-subject" className="text-nx-ink font-semibold">{t("crmActivities.communication.subjectLabel")} *</Label>
                <Input id="comm-subject" data-testid="comm-subject-input" value={commSubject} onChange={(e) => setCommSubject(e.target.value)} placeholder={t("crmActivities.communication.subjectPlaceholder")} required className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="comm-body" className="text-nx-ink font-semibold">{t("crmActivities.communication.bodyLabel")}</Label>
                <Textarea id="comm-body" data-testid="comm-body-textarea" value={commBody} onChange={(e) => setCommBody(e.target.value)} rows={4} placeholder={t("crmActivities.communication.bodyPlaceholder")} className="text-xs bg-nx-ground border-nx-line text-nx-ink resize-none" />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-nx-line">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCommOpen(false)} disabled={isSubmitting} className="h-8 text-xs border-nx-line text-nx-ink-2">{t("crmActivities.actions.cancel")}</Button>
              <Button type="submit" size="sm" data-testid="submit-send-communication-btn" disabled={isSubmitting || !commSubject.trim()} className="h-8 text-xs font-bold gap-1.5">
                <Send className="size-3.5" />
                <span>{isSubmitting ? t("crmActivities.communication.dispatchingBtn") : t("crmActivities.communication.sendAndLogBtn")}</span>
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
