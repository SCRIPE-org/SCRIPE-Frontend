"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { Label } from "@core/ui/label";
import { Checkbox } from "@core/ui/checkbox";
import { Alert, AlertDescription } from "@core/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import { AlertCircle, FileText, Phone, Users, ShieldAlert } from "lucide-react";
import { CrmEntitySearchSelect } from "@modules/crm";
import type { SalesActivityKind } from "../../domain/entities/CrmActivityEntity";

interface CreateActivityModalProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSubmit: (data: {
    activityKind: SalesActivityKind;
    summary: string;
    bodyText?: string;
    containsPii?: boolean;
    accountId?: string;
  }) => Promise<boolean>;
  readonly isSubmitting: boolean;
  readonly error: string | null;
  readonly targetLabel?: string;
  readonly allowAccountSelect?: boolean;
  readonly initialAccountId?: string;
}

export function CreateActivityModal({
  isOpen,
  onOpenChange,
  onSubmit,
  isSubmitting,
  error,
  targetLabel,
  allowAccountSelect = false,
  initialAccountId = "",
}: CreateActivityModalProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const [kind, setKind] = useState<SalesActivityKind>("Note");
  const [accountId, setAccountId] = useState(initialAccountId);
  const [summary, setSummary] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [containsPii, setContainsPii] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;

    const success = await onSubmit({
      activityKind: kind,
      summary: summary.trim(),
      bodyText: bodyText.trim() || undefined,
      containsPii,
      accountId: accountId || undefined,
    });

    if (success) {
      setSummary("");
      setBodyText("");
      setContainsPii(false);
      setKind("Note");
      setAccountId(initialAccountId);
    }
  };

  const activityOptions: { kind: SalesActivityKind; label: string; icon: React.ReactNode }[] = [
    {
      kind: "Note",
      label: t("crmActivities.kinds.note"),
      icon: <FileText className="size-3.5" />,
    },
    {
      kind: "CallLog",
      label: t("crmActivities.kinds.call"),
      icon: <Phone className="size-3.5" />,
    },
    {
      kind: "MeetingLog",
      label: t("crmActivities.kinds.meeting"),
      icon: <Users className="size-3.5" />,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg bg-nx-surface border-nx-line text-nx-ink"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-nx-ink font-heading">
              {t("crmActivities.modal.title")}
            </DialogTitle>
            <DialogDescription className="text-xs text-nx-ink-2">
              {targetLabel
                ? `${t("crmActivities.modal.targetDesc")} ${targetLabel}.`
                : t("crmActivities.modal.description")}
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

          <div className="space-y-4 py-4 text-xs">
            {allowAccountSelect && (
              <div className="space-y-1.5">
                <Label className="text-nx-ink font-semibold">
                  {t("crmActivities.form.accountLabel")}
                </Label>
                <CrmEntitySearchSelect
                  entityKind="account"
                  valueMode="id"
                  value={accountId}
                  initialLabel={targetLabel || undefined}
                  onChange={(val) => setAccountId(val)}
                  placeholder={t("crmActivities.form.accountPlaceholder")}
                  enableQuickCreate
                  quickCreateDefaultKind="account"
                  allowClear
                />
              </div>
            )}
            {/* Kind Selector */}
            <div className="space-y-1.5">
              <Label className="text-nx-ink font-semibold">
                {t("crmActivities.form.activityType")}
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {activityOptions.map((opt) => (
                  <Button
                    key={opt.kind}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setKind(opt.kind)}
                    className={`h-8 text-xs font-medium justify-center gap-1.5 border-nx-line ${
                      kind === opt.kind
                        ? "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-semibold"
                        : "text-nx-ink-2 hover:text-nx-ink bg-nx-raised"
                    }`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <Label htmlFor="activity-summary" className="text-nx-ink font-semibold">
                {t("crmActivities.form.summary")} *
              </Label>
              <Input
                id="activity-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder={
                  kind === "CallLog"
                    ? t("crmActivities.executionDesk.callSummaryPlaceholder")
                    : kind === "MeetingLog"
                    ? t("crmActivities.executionDesk.meetingSummaryPlaceholder")
                    : t("crmActivities.executionDesk.noteSummaryPlaceholder")
                }
                required
                className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink"
              />
            </div>

            {/* Detailed Body Text */}
            <div className="space-y-1.5">
              <Label htmlFor="activity-body" className="text-nx-ink font-semibold">
                {t("crmActivities.form.details")}
              </Label>
              <Textarea
                id="activity-body"
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder={t("crmActivities.form.detailsPlaceholder")}
                rows={4}
                className="text-xs bg-nx-ground border-nx-line text-nx-ink resize-none"
              />
            </div>

            {/* PII / Confidentiality Toggle */}
            <div className="flex items-center gap-2 pt-1 p-2 rounded-md bg-nx-raised border border-nx-line">
              <Checkbox
                id="activity-pii"
                checked={containsPii}
                onCheckedChange={(checked) => setContainsPii(checked === true)}
              />
              <Label htmlFor="activity-pii" className="flex-1 cursor-pointer block space-y-0.5">
                <span className="text-xs font-semibold text-nx-ink flex items-center gap-1">
                  <ShieldAlert className="size-3 text-nx-warning-strong" />
                  {t("crmActivities.form.containsPii")}
                </span>
                <span className="block text-[10px] font-normal text-nx-ink-3">
                  {t("crmActivities.form.piiDesc")}
                </span>
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-nx-line">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-8 text-xs border-nx-line text-nx-ink-2"
            >
              {t("crmActivities.actions.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !summary.trim()}
              className="h-8 text-xs font-bold"
            >
              {isSubmitting
                ? t("crmActivities.actions.saving")
                : t("crmActivities.modal.saveBtn")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
