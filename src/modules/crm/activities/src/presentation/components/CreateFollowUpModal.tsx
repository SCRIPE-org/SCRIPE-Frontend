"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { Label } from "@core/ui/label";
import { Alert, AlertDescription } from "@core/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import { AlertCircle, CalendarClock, UserCheck } from "lucide-react";
import type { CrmActivity } from "../../domain/entities/CrmActivityEntity";

interface CreateFollowUpModalProps {
  readonly activity: CrmActivity | null;
  readonly onClose: () => void;
  readonly onSubmit: (
    activityId: string,
    data: {
      title: string;
      description?: string;
      assigneeUserId: string;
      dueAtUtc?: string;
    }
  ) => Promise<boolean>;
  readonly isSubmitting: boolean;
  readonly error: string | null;
}

export function CreateFollowUpModal({
  activity,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}: CreateFollowUpModalProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const [title, setTitle] = useState(
    activity ? `Follow-up on: ${activity.summary}` : ""
  );
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [assigneeId, setAssigneeId] = useState(activity?.actorUserId || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity || !title.trim()) return;

    const success = await onSubmit(activity.activityId, {
      title: title.trim(),
      description: description.trim() || undefined,
      assigneeUserId: assigneeId.trim() || "00000000-0000-0000-0000-000000000001",
      dueAtUtc: dueDate ? new Date(dueDate).toISOString() : undefined,
    });

    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={Boolean(activity)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-md bg-nx-surface border-nx-line text-nx-ink"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-nx-ink font-heading flex items-center gap-2">
              <CalendarClock className="size-4 text-warning" />
              {t("crmActivities.followup.title") || "Schedule Follow-up Task"}
            </DialogTitle>
            <DialogDescription className="text-xs text-nx-ink-2">
              {t("crmActivities.followup.description") ||
                "Creates an actionable WorkManagement task linked to this commercial interaction."}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert
              variant="destructive"
              className="my-3 border-destructive/20 bg-destructive/10 text-destructive text-xs py-2"
            >
              <AlertCircle className="size-3.5" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3.5 py-4 text-xs">
            {activity && (
              <div className="p-2.5 rounded-md bg-nx-raised border border-nx-line">
                <span className="text-[10px] text-nx-ink-3 uppercase font-medium block">
                  {t("crmActivities.followup.sourceActivity") || "Source Interaction"}
                </span>
                <p className="text-xs font-semibold text-nx-ink mt-0.5 line-clamp-1">
                  {activity.summary}
                </p>
                <span className="text-[10px] text-nx-ink-3 font-mono mt-0.5 block">
                  {activity.actorDisplaySnapshot} •{" "}
                  {new Date(activity.occurredAtUtc).toLocaleDateString(
                    language === "ar" ? "ar-SA" : "en-US",
                    { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                  )}
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="followup-title" className="text-nx-ink font-semibold">
                {t("crmActivities.followup.taskTitle") || "Action Item / Task Title"} *
              </Label>
              <Input
                id="followup-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Send revised pricing schedule, confirm pitch slot..."
                required
                className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="followup-desc" className="text-nx-ink font-semibold">
                {t("crmActivities.followup.taskDesc") || "Deliverable Details"}
              </Label>
              <Textarea
                id="followup-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Requirements, next milestone, or context for the assignee..."
                rows={3}
                className="text-xs bg-nx-ground border-nx-line text-nx-ink resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="followup-due" className="text-nx-ink font-semibold">
                  {t("crmActivities.followup.dueDate") || "Due Date"}
                </Label>
                <Input
                  id="followup-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="followup-assignee" className="text-nx-ink font-semibold">
                  {t("crmActivities.followup.assignee") || "Assignee"}
                </Label>
                <div className="flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-nx-ground border border-nx-line text-nx-ink-2">
                  <UserCheck className="size-3 text-nx-ink-3" />
                  <span className="text-[11px] truncate">
                    {activity?.actorDisplaySnapshot || "Account Executive"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-nx-line">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-8 text-xs border-nx-line text-nx-ink-2"
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !title.trim()}
              className="h-8 text-xs font-bold"
            >
              {isSubmitting
                ? t("common.saving") || "Saving..."
                : t("crmActivities.followup.scheduleBtn") || "Schedule Follow-up"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
