"use client";

import { useState, useEffect, useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Alert, AlertDescription } from "@core/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { AlertCircle, UserCheck } from "lucide-react";
import type { CrmOpportunity, AssignOpportunityOwnerInput } from "../../domain/entities/OpportunityEntity";

const COMMERCIAL_REPRESENTATIVES: Array<{ id: string; key: string }> = [
  { id: "11111111-1111-1111-1111-111111111111", key: "rep1" },
  { id: "22222222-2222-2222-2222-222222222222", key: "rep2" },
  { id: "33333333-3333-3333-3333-333333333333", key: "rep3" },
  { id: "44444444-4444-4444-4444-444444444444", key: "rep4" },
];

const COMMERCIAL_TEAMS: Array<{ id: string; key: string }> = [
  { id: "aaaa1111-1111-1111-1111-111111111111", key: "team1" },
  { id: "bbbb2222-2222-2222-2222-222222222222", key: "team2" },
  { id: "cccc3333-3333-3333-3333-333333333333", key: "team3" },
  { id: "dddd4444-4444-4444-4444-444444444444", key: "team4" },
];

/**
 * Properties for AssignOwnerDialog.
 */
export interface AssignOwnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: CrmOpportunity | null;
  onSubmit: (input: AssignOpportunityOwnerInput) => Promise<boolean>;
  isSubmitting?: boolean;
  submitError?: string | null;
}

/**
 * Dialog to reassign an opportunity to a commercial representative and optional commercial team.
 */
export function AssignOwnerDialog({
  open,
  onOpenChange,
  opportunity,
  onSubmit,
  isSubmitting = false,
  submitError,
}: AssignOwnerDialogProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const [ownerUserId, setOwnerUserId] = useState<string>(COMMERCIAL_REPRESENTATIVES[0].id);
  const [ownerTeamId, setOwnerTeamId] = useState<string>("__none__");
  const [assignmentReason, setAssignmentReason] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const currentOwnerUserId = opportunity?.ownerUserId;
  const currentOwnerTeamId = opportunity?.ownerTeamId;

  useEffect(() => {
    if (opportunity) {
      setOwnerUserId(opportunity.ownerUserId || COMMERCIAL_REPRESENTATIVES[0].id);
      setOwnerTeamId(opportunity.ownerTeamId || "__none__");
      setAssignmentReason("");
      setValidationError(null);
    }
  }, [opportunity]);

  const repOptions = useMemo(() => {
    const base = COMMERCIAL_REPRESENTATIVES.map((r) => ({
      id: r.id,
      label: t(`crmOpportunities.dialogs.assign.reps.${r.key}`),
    }));
    if (currentOwnerUserId && !base.some((b) => b.id === currentOwnerUserId)) {
      base.unshift({
        id: currentOwnerUserId,
        label: t("crmOpportunities.dialogs.assign.currentOwnerOption"),
      });
    }
    return base;
  }, [currentOwnerUserId, t]);

  const teamOptions = useMemo(() => {
    const base = COMMERCIAL_TEAMS.map((tm) => ({
      id: tm.id,
      label: t(`crmOpportunities.dialogs.assign.teams.${tm.key}`),
    }));
    if (currentOwnerTeamId && !base.some((b) => b.id === currentOwnerTeamId)) {
      base.unshift({
        id: currentOwnerTeamId,
        label: t("crmOpportunities.dialogs.assign.currentTeamOption"),
      });
    }
    return base;
  }, [currentOwnerTeamId, t]);

  if (!opportunity) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!ownerUserId.trim()) {
      setValidationError(t("crmOpportunities.dialogs.assign.ownerRequiredError"));
      return;
    }

    const resolvedTeamId =
      ownerTeamId && ownerTeamId !== "__none__" ? ownerTeamId.trim() : undefined;

    const payload: AssignOpportunityOwnerInput = {
      opportunityId: opportunity.id,
      ownerUserId: ownerUserId.trim(),
      ownerTeamId: resolvedTeamId,
      assignmentReason: assignmentReason.trim() || undefined,
      expectedRowVersion: opportunity.rowVersion,
    };

    const success = await onSubmit(payload);
    if (success) {
      onOpenChange(false);
      setAssignmentReason("");
      setValidationError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir={isRtl ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="size-5 text-nx-accent" />
            {t("crmOpportunities.dialogs.assign.title")}
          </DialogTitle>
          <DialogDescription>
            {t("crmOpportunities.dialogs.assign.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(submitError || validationError) && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{submitError || validationError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="assign-owner-id">
              {t("crmOpportunities.dialogs.assign.ownerLabel")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Select value={ownerUserId} onValueChange={setOwnerUserId}>
              <SelectTrigger id="assign-owner-id">
                <SelectValue placeholder={t("crmOpportunities.dialogs.assign.ownerPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {repOptions.map((rep) => (
                  <SelectItem key={rep.id} value={rep.id}>
                    {rep.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="assign-team-id">{t("crmOpportunities.dialogs.assign.teamLabel")}</Label>
            <Select value={ownerTeamId} onValueChange={setOwnerTeamId}>
              <SelectTrigger id="assign-team-id">
                <SelectValue placeholder={t("crmOpportunities.dialogs.assign.teamPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">
                  {t("crmOpportunities.dialogs.assign.noTeamOption")}
                </SelectItem>
                {teamOptions.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="assign-reason">
              {t("crmOpportunities.dialogs.assign.reasonLabel")}
            </Label>
            <Textarea
              id="assign-reason"
              placeholder={t("crmOpportunities.dialogs.assign.reasonPlaceholder")}
              value={assignmentReason}
              onChange={(e) => setAssignmentReason(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("crmOpportunities.actions.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t("crmOpportunities.actions.saving")
                : t("crmOpportunities.dialogs.assign.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
