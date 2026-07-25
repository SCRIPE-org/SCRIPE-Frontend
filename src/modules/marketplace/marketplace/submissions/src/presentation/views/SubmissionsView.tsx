"use client";

import { useState } from "react";
import { useSubmissionsViewModel } from "../viewmodels/useSubmissionsViewModel";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader } from "@core/ui/card";
import { EmptyState } from "@core/ui/empty-state";
import { Skeleton } from "@core/ui/skeleton";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { useI18n } from "@core/providers/i18n-provider";
import { CheckCircle, XCircle, RefreshCw, Inbox } from "lucide-react";
import type { AppSubmission } from "../../domain/entities/AppSubmission";

type SubmissionStatus = AppSubmission["status"];

const STATUS_KEY: Record<SubmissionStatus, string> = {
  Pending: "marketplace.submissionsStatusPending",
  UnderReview: "marketplace.submissionsStatusUnderReview",
  Approved: "marketplace.submissionsStatusApproved",
  Rejected: "marketplace.submissionsStatusRejected",
  RevisionsRequested: "marketplace.submissionsStatusRevisionsRequested",
};

const FILTER_STATUSES: Extract<
  SubmissionStatus,
  "Pending" | "UnderReview" | "Approved" | "Rejected"
>[] = ["Pending", "UnderReview", "Approved", "Rejected"];

/** Which reviewer-note action is pending confirmation, and on which row. */
type PendingAction = { type: "reject" | "revisions"; submission: AppSubmission } | null;

/**
 * Presentation UI component rendering the submissions view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 *
 * Rejecting a submission (and requesting revisions) is irreversible from the
 * developer's point of view — it fires a notification carrying a reviewer
 * note. Both actions are routed through a real confirmation step with a real
 * Textarea, so the admin always confirms the action and always writes their
 * own note; neither action fires on the first click, and neither ever
 * submits a note on the admin's behalf.
 */
export function SubmissionsView() {
  const vm = useSubmissionsViewModel();
  const { t } = useI18n();

  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [notes, setNotes] = useState("");
  const [notesTouched, setNotesTouched] = useState(false);

  const closeDialog = () => {
    setPendingAction(null);
    setNotes("");
    setNotesTouched(false);
  };

  const notesInvalid = notesTouched && notes.trim().length === 0;

  const handleConfirm = () => {
    if (!pendingAction || notes.trim().length === 0) {
      setNotesTouched(true);
      return;
    }
    if (pendingAction.type === "reject") {
      vm.reject({ id: pendingAction.submission.id, notes: notes.trim() });
    } else {
      vm.requestRevisions({ id: pendingAction.submission.id, notes: notes.trim() });
    }
    closeDialog();
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-nx-ink">{t("marketplace.submissionsTitle")}</h2>
          <p className="text-sm text-nx-ink-2">
            {t("marketplace.submissionsCountLabel", { count: vm.pagination.totalCount })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTER_STATUSES.map((s) => (
            <Button key={s} variant="outline" size="sm" onClick={() => vm.setStatusFilter(s)}>
              {t(STATUS_KEY[s])}
            </Button>
          ))}
          <Button variant="ghost" size="sm" onClick={() => vm.setStatusFilter(undefined)}>
            {t("common.all")}
          </Button>
        </div>
      </div>

      {vm.isLoading ? (
        <div
          className="flex flex-col gap-3"
          role="status"
          aria-busy="true"
          aria-label={t("common.loading")}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-nx-lg" />
          ))}
        </div>
      ) : vm.submissions.length === 0 ? (
        <EmptyState size="lg" icon={Inbox} title={t("marketplace.submissionsEmpty")} />
      ) : (
        <div className="flex flex-col gap-3">
          {vm.submissions.map((sub) => (
            <Card key={sub.id}>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-nx-ink">{sub.appName}</span>
                    <Badge variant="outline" className="text-xs">
                      v{sub.submittedVersion}
                    </Badge>
                  </div>
                  <p className="text-xs text-nx-ink-2">
                    {t("marketplace.submissionsByDeveloper", { name: sub.developerName })}
                  </p>
                </div>
                <Badge variant={sub.statusVariant}>{t(STATUS_KEY[sub.status])}</Badge>
              </CardHeader>
              {sub.isPending && (
                <CardContent className="flex gap-2 pt-0">
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => vm.approve(sub.id)}
                    disabled={vm.isApproving}
                  >
                    <CheckCircle className="size-3.5" aria-hidden="true" />{" "}
                    {t("marketplace.approveSubmission")}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-1.5"
                    onClick={() => setPendingAction({ type: "reject", submission: sub })}
                    disabled={vm.isRejecting}
                  >
                    <XCircle className="size-3.5" aria-hidden="true" />{" "}
                    {t("marketplace.rejectSubmission")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => setPendingAction({ type: "revisions", submission: sub })}
                  >
                    <RefreshCw className="size-3.5" aria-hidden="true" />{" "}
                    {t("marketplace.submissionsRevisionsAction")}
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <ConfirmationDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        variant="destructive"
        title={
          pendingAction?.type === "reject"
            ? t("marketplace.submissionsRejectDialogTitle")
            : t("marketplace.submissionsRevisionsDialogTitle")
        }
        description={
          pendingAction?.type === "reject"
            ? t("marketplace.submissionsRejectDialogDescription")
            : t("marketplace.submissionsRevisionsDialogDescription")
        }
        confirmText={
          pendingAction?.type === "reject"
            ? t("marketplace.rejectSubmission")
            : t("marketplace.submissionsRevisionsAction")
        }
        cancelText={t("common.cancel")}
        disableConfirm={notes.trim().length === 0}
        onConfirm={handleConfirm}
      >
        <div className="space-y-2">
          <Label htmlFor="submission-reviewer-notes">
            {t("marketplace.submissionsNotesLabel")}
          </Label>
          <Textarea
            id="submission-reviewer-notes"
            rows={3}
            placeholder={t("marketplace.submissionsNotesPlaceholder")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => setNotesTouched(true)}
            aria-invalid={notesInvalid || undefined}
          />
          {notesInvalid && (
            <p className="text-xs font-medium text-nx-danger">
              {t("marketplace.submissionsNotesRequired")}
            </p>
          )}
        </div>
      </ConfirmationDialog>
    </div>
  );
}
