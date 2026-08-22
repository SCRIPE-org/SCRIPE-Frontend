"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericSelect } from "@core/crud/components/generic-select";
import { useI18n } from "@core/providers/i18n-provider";
import { getCustomFieldsExtension } from "@core/crud/customFieldsExtension";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import { renderCustomFieldControl } from "@modules/custom-fields/custom-field";
import { DSR_ENTITY_TYPE_KEY } from "../viewmodels/useDsrViewModel";

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
  customFieldConfigs: FieldConfig[];
  customFieldsLoading: boolean;
  customFieldValues: Record<string, unknown>;
  onCustomFieldChange: (name: string, value: unknown) => void;
  onCustomFieldsCreated: () => void;
}

/** Mirrors TemplateFormView.tsx's own private CustomFieldsAddTrigger wrapper. */
function DsrCustomFieldsAddTrigger({
  entityDisplayName,
  onCreated,
}: {
  entityDisplayName: string;
  onCreated: () => void;
}) {
  const api = getCustomFieldsExtension();
  if (!api) return null;
  const Trigger = api.InlineAddTrigger;
  return (
    <Trigger
      entityTypeKey={DSR_ENTITY_TYPE_KEY}
      entityDisplayName={entityDisplayName}
      onCreated={onCreated}
    />
  );
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
  customFieldConfigs,
  customFieldsLoading,
  customFieldValues,
  onCustomFieldChange,
  onCustomFieldsCreated,
}: SubmitDsrModalProps) {
  const { t } = useI18n();

  const [form, setForm] = useState<SubmitDsrFormData>({
    requestType: "Export",
    regulationCode: "GDPR",
    subjectEmail: "",
    requesterNotes: "",
  });

  // Spans the ENTIRE sequence (DSR create + custom-field save), unlike the
  // `isSubmitting` prop, which is only `submitMutation.isPending` — that
  // flips back to false the instant the create itself resolves, before the
  // custom-field save (still in flight inside onSubmit) has settled.
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.subjectEmail.trim()) return;
    setIsSaving(true);
    try {
      await onSubmit(form);
    } catch {
      // useDsrViewModel's handleSubmit already toasted the specific reason —
      // stay open with whatever the user typed rather than pretend it saved.
      return;
    } finally {
      setIsSaving(false);
    }
    onOpenChange(false);
    setForm({
      requestType: "Export",
      regulationCode: "GDPR",
      subjectEmail: "",
      requesterNotes: "",
    });
  };

  const busy = isSubmitting || isSaving;

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
            placeholder={t("compliance.subjectEmailPlaceholder")}
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
          <Alert variant="destructive">
            <AlertTriangle aria-hidden="true" />
            <AlertDescription>{t("compliance.erasureGateWarning")}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3 border-t border-nx-line pt-4">
          <p className="text-sm font-medium text-nx-ink">{t("compliance.customFieldsSection")}</p>

          {customFieldConfigs.map((fc) => {
            const value = customFieldValues[fc.name] ?? fc.defaultValue ?? "";
            return renderCustomFieldControl({
              fc,
              value,
              onChange: (v) => onCustomFieldChange(fc.name, v),
            });
          })}

          {customFieldConfigs.length === 0 && !customFieldsLoading && (
            <p className="text-sm text-nx-ink-2">{t("compliance.noCustomFields")}</p>
          )}

          <DsrCustomFieldsAddTrigger
            entityDisplayName={t("compliance.dsr")}
            onCreated={onCustomFieldsCreated}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-nx-line pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            id="dsr-submit-confirm"
            onClick={handleSubmit}
            disabled={busy || !form.subjectEmail.trim()}
            loading={busy}
          >
            {t("compliance.submitDsr")}
          </Button>
        </div>
      </div>
    </GenericModal>
  );
}
