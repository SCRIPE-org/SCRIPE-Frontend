"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { Label } from "@core/ui/label";
import { Alert, AlertDescription } from "@core/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import { AlertCircle, CalendarClock } from "lucide-react";
import type { CrmActivity } from "../../domain/entities/CrmActivityEntity";

const COMMERCIAL_ASSIGNEES: Array<{ id: string; labelKey: string }> = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    labelKey: "crmActivities.followup.assignees.rep1",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    labelKey: "crmActivities.followup.assignees.rep2",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    labelKey: "crmActivities.followup.assignees.rep3",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    labelKey: "crmActivities.followup.assignees.rep4",
  },
];

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
  const actorUserId = activity?.actorUserId ?? "";
  const actorDisplaySnapshot = activity?.actorDisplaySnapshot ?? "";

  const [title, setTitle] = useState(
    activity
      ? `${t("crmActivities.followup.defaultTitlePrefix")}: ${activity.summary}`
      : ""
  );
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [assigneeId, setAssigneeId] = useState(
    actorUserId || COMMERCIAL_ASSIGNEES[0].id
  );

  const assigneeOptions = useMemo(() => {
    const base = COMMERCIAL_ASSIGNEES.map((a) => ({
      id: a.id,
      label: t(a.labelKey),
    }));
    if (actorUserId && !base.some((b) => b.id === actorUserId)) {
      base.unshift({
        id: actorUserId,
        label: actorDisplaySnapshot || t("crmActivities.followup.currentActorLabel"),
      });
    }
    return base;
  }, [actorDisplaySnapshot, actorUserId, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity || !title.trim()) return;

    const success = await onSubmit(activity.activityId, {
      title: title.trim(),
      description: description.trim() || undefined,
      assigneeUserId: assigneeId.trim() || COMMERCIAL_ASSIGNEES[0].id,
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
              <CalendarClock className="size-4 text-nx-warning-strong" />
              {t("crmActivities.followup.title")}
            </DialogTitle>
            <DialogDescription className="text-xs text-nx-ink-2">
              {t("crmActivities.followup.description")}
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
                <span className={`text-[10px] text-nx-ink-3 font-medium block ${!isRtl ? "uppercase" : ""}`}>
                  {t("crmActivities.followup.sourceActivity")}
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
                {t("crmActivities.followup.taskTitle")} *
              </Label>
              <Input
                id="followup-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("crmActivities.followup.taskTitlePlaceholder")}
                required
                className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="followup-desc" className="text-nx-ink font-semibold">
                {t("crmActivities.followup.taskDesc")}
              </Label>
              <Textarea
                id="followup-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("crmActivities.followup.taskDescPlaceholder")}
                rows={3}
                className="text-xs bg-nx-ground border-nx-line text-nx-ink resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="followup-due" className="text-nx-ink font-semibold">
                  {t("crmActivities.followup.dueDate")}
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
                  {t("crmActivities.followup.assignee")}
                </Label>
                <Select value={assigneeId} onValueChange={setAssigneeId}>
                  <SelectTrigger
                    id="followup-assignee"
                    className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assigneeOptions.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              {t("crmActivities.actions.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !title.trim()}
              className="h-8 text-xs font-bold"
            >
              {isSubmitting
                ? t("crmActivities.actions.saving")
                : t("crmActivities.followup.scheduleBtn")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
