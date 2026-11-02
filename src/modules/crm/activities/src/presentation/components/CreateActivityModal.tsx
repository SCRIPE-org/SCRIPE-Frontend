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
import type { SalesActivityKind } from "../../domain/entities/CrmActivityEntity";

interface CreateActivityModalProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSubmit: (data: {
    activityKind: SalesActivityKind;
    summary: string;
    bodyText?: string;
    containsPii?: boolean;
  }) => Promise<boolean>;
  readonly isSubmitting: boolean;
  readonly error: string | null;
  readonly targetLabel?: string;
}

export function CreateActivityModal({
  isOpen,
  onOpenChange,
  onSubmit,
  isSubmitting,
  error,
  targetLabel,
}: CreateActivityModalProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const [kind, setKind] = useState<SalesActivityKind>("Note");
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
    });

    if (success) {
      setSummary("");
      setBodyText("");
      setContainsPii(false);
      setKind("Note");
    }
  };

  const activityOptions: { kind: SalesActivityKind; label: string; icon: React.ReactNode }[] = [
    {
      kind: "Note",
      label: t("crmActivities.kinds.note") || "Quick Note",
      icon: <FileText className="size-3.5" />,
    },
    {
      kind: "CallLog",
      label: t("crmActivities.kinds.call") || "Phone Call",
      icon: <Phone className="size-3.5" />,
    },
    {
      kind: "MeetingLog",
      label: t("crmActivities.kinds.meeting") || "Meeting Log",
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
              {t("crmActivities.modal.title") || "Log Sales Activity"}
            </DialogTitle>
            <DialogDescription className="text-xs text-nx-ink-2">
              {targetLabel
                ? `${t("crmActivities.modal.targetDesc") || "Record a commercial interaction for"} ${targetLabel}.`
                : t("crmActivities.modal.description") ||
                  "Record a commercial note, phone call summary, or meeting outcome."}
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
            {/* Kind Selector */}
            <div className="space-y-1.5">
              <Label className="text-nx-ink font-semibold">
                {t("crmActivities.form.activityType") || "Activity Type"}
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
                {t("crmActivities.form.summary") || "Summary / Headline"} *
              </Label>
              <Input
                id="activity-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder={
                  kind === "CallLog"
                    ? "Inbound qualification call with director..."
                    : kind === "MeetingLog"
                    ? "Contract review and pricing negotiation..."
                    : "Key takeaways from commercial alignment..."
                }
                required
                className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink"
              />
            </div>

            {/* Detailed Body Text */}
            <div className="space-y-1.5">
              <Label htmlFor="activity-body" className="text-nx-ink font-semibold">
                {t("crmActivities.form.details") || "Discussion Details & Notes"}
              </Label>
              <Textarea
                id="activity-body"
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder={
                  t("crmActivities.form.detailsPlaceholder") ||
                  "Record key talking points, agreed action items, or customer objections..."
                }
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
              <div className="flex-1 cursor-pointer" onClick={() => setContainsPii(!containsPii)}>
                <Label htmlFor="activity-pii" className="text-xs font-semibold text-nx-ink cursor-pointer flex items-center gap-1">
                  <ShieldAlert className="size-3 text-warning" />
                  {t("crmActivities.form.containsPii") || "Contains Confidential / Sensitive Details"}
                </Label>
                <p className="text-[10px] text-nx-ink-3">
                  {t("crmActivities.form.piiDesc") ||
                    "Limits note details to team members with sensitive-data viewing access."}
                </p>
              </div>
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
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !summary.trim()}
              className="h-8 text-xs font-bold"
            >
              {isSubmitting
                ? t("common.saving") || "Saving..."
                : t("crmActivities.modal.saveBtn") || "Log Activity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
