"use client";

import { Separator } from "@core/ui/separator";
import { CheckCircle2 } from "lucide-react";
import type { EditionForConversion } from "../../../domain/interfaces/ILeadsRepository";
import type { PlatformLead } from "../../../domain/entities/PlatformLead";
import type { Step2State } from "../../viewmodels/useConvertWizardViewModel";

// ── Props ─────────────────────────────────────────────────────────────────────

interface WizardStep4Props {
  lead: PlatformLead | null;
  edition: EditionForConversion | null;
  setup: Step2State;
  overrideCount: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function WizardStep4Confirm({ lead, edition, setup, overrideCount }: WizardStep4Props) {
  const rows: { label: string; value: string }[] = [
    { label: "Company", value: lead?.companyName ?? "—" },
    { label: "Contact", value: lead?.contactName ?? "—" },
    { label: "Admin Email", value: setup.adminEmail || lead?.email || "—" },
    { label: "Edition", value: edition?.displayNameEn ?? "—" },
    { label: "Workspace Slug", value: setup.tenantCode || "Auto-generated" },
    {
      label: "Billing",
      value: setup.subscriptionType
        ? `${setup.subscriptionType} · ${setup.currency}`
        : `Edition default · ${setup.currency}`,
    },
    ...(setup.useCustomPrice
      ? [{ label: "Custom Price", value: `${Number(setup.negotiatedAmount).toLocaleString()} ${setup.negotiatedCurrency}` }]
      : []),
    ...(overrideCount > 0
      ? [{ label: "Feature Overrides", value: `${overrideCount} feature${overrideCount !== 1 ? "s" : ""} customized` }]
      : []),
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-900 dark:bg-emerald-950/30">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Ready to convert</p>
            <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">
              Review the details below. An account setup email will be sent to the admin.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        {rows.map((row, i) => (
          <div key={row.label}>
            {i > 0 && <Separator />}
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs text-muted-foreground">{row.label}</span>
              <span className="text-sm font-medium text-foreground">{row.value}</span>
            </div>
          </div>
        ))}
      </div>

      {setup.conversionNote && (
        <div className="rounded-xl border border-border px-4 py-3">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Internal Note</p>
          <p className="text-sm text-foreground">{setup.conversionNote}</p>
        </div>
      )}
    </div>
  );
}
