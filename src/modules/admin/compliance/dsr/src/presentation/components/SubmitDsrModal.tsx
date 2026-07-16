"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericSelect } from "@core/crud/components/generic-select";
import { useI18n } from "@core/providers/i18n-provider";

// ── Option constants ──────────────────────────────────────────────────────────

const DSR_TYPE_OPTIONS = [
  { value: "Export", labelKey: "compliance.requestTypes.export" },
  { value: "Erasure", labelKey: "compliance.requestTypes.erasure" },
  { value: "Rectification", labelKey: "compliance.requestTypes.rectification" },
  { value: "Restriction", labelKey: "compliance.requestTypes.restriction" },
];

const REGULATION_OPTIONS = [
  { value: "GDPR", labelKey: "compliance.regulations.gdpr" },
  { value: "CCPA", labelKey: "compliance.regulations.ccpa" },
  { value: "PDPA", labelKey: "compliance.regulations.pdpa" },
];

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Interface defining property specifications, keys types, and structural contract rules for submit dsr form data.
 */
export interface SubmitDsrFormData {
  requestType: string;
  regulationCode: string;
  subjectEmail: string;
  requesterNotes?: string;
}

interface SubmitDsrModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: SubmitDsrFormData) => Promise<void>;
  isSubmitting: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Presentation UI component rendering the submit dsr modal.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function SubmitDsrModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: SubmitDsrModalProps) {
  const { t } = useI18n();

  const [form, setForm] = useState<SubmitDsrFormData>({
    requestType: "Export",
    regulationCode: "GDPR",
    subjectEmail: "",
    requesterNotes: "",
  });

  const handleSubmit = async () => {
    if (!form.subjectEmail.trim()) return;
    await onSubmit(form);
    onOpenChange(false);
    setForm({
      requestType: "Export",
      regulationCode: "GDPR",
      subjectEmail: "",
      requesterNotes: "",
    });
  };

  return (
    <GenericModal
      open={open}
      onOpenChange={onOpenChange}
      title={t("compliance.submitDsr")}
      description={t("compliance.submitDsrDesc")}
      size="md"
      formKey={open ? "dsr-submit" : undefined}
    >
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label htmlFor="dsr-subject-email">{t("compliance.subjectEmail")}</Label>
          <Input
            id="dsr-subject-email"
            type="email"
            placeholder="subject@example.com"
            value={form.subjectEmail}
            onChange={(e) => setForm((f) => ({ ...f, subjectEmail: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>{t("compliance.requestType")}</Label>
            <GenericSelect
              options={DSR_TYPE_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
              value={form.requestType}
              onValueChange={(v: string | string[]) =>
                setForm((f) => ({ ...f, requestType: v as string }))
              }
              placeholder={t("compliance.requestType")}
              type="single"
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("compliance.regulation")}</Label>
            <GenericSelect
              options={REGULATION_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
              value={form.regulationCode}
              onValueChange={(v: string | string[]) =>
                setForm((f) => ({ ...f, regulationCode: v as string }))
              }
              placeholder={t("compliance.regulation")}
              type="single"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dsr-notes">{t("compliance.requesterNotes")}</Label>
          <Textarea
            id="dsr-notes"
            placeholder={t("compliance.notesPlaceholder")}
            rows={3}
            value={form.requesterNotes}
            onChange={(e) => setForm((f) => ({ ...f, requesterNotes: e.target.value }))}
          />
        </div>

        {form.requestType === "Erasure" && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
            <p className="text-xs text-red-600 dark:text-red-400">
              {t("compliance.erasureGateWarning")}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            id="dsr-submit-confirm"
            className="gradient-primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !form.subjectEmail.trim()}
          >
            {isSubmitting ? t("common.loading") : t("compliance.submitDsr")}
          </Button>
        </div>
      </div>
    </GenericModal>
  );
}
