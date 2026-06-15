"use client";

import { useMemo } from "react";
import { Check, Loader2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSignupTheme } from "@core/providers/signup-theme";
import type { SignupWizardViewModel } from "../../viewmodels/useSignupWizard";

// ═══════════════════════════════════════════════════════════════════════════
// ProvisioningStep — the in-page provisioning phase (F9, free flow only). Shows
// clear STAGED progress (a labeled checklist + a determinate bar), not a lone
// spinner — each stage flips to a check as the reused provisioning hook advances
// `provisioningStep` (0 → 4). It transitions to `complete` from the wizard.
//
// Product-register calm: solid-ink heading, restrained surfaces, accent reserved
// for the active node + the progress fill. Reduced-motion safe (the only motion
// is the active-node spinner, gated by motion-reduce). RTL-aware (the bar fills
// from the leading edge via logical width).
// ═══════════════════════════════════════════════════════════════════════════

interface ProvisioningStepProps {
  wizard: SignupWizardViewModel;
}

export function ProvisioningStep({ wizard }: ProvisioningStepProps) {
  const { t, direction } = useI18n();
  const { tokens } = useSignupTheme();

  const stages = useMemo(
    () => [
      t("signup.provisioning.creatingWorkspace"),
      t("signup.provisioning.settingDefaults"),
      t("signup.provisioning.registeringAccount"),
      t("signup.provisioning.configuringPermissions"),
      t("signup.provisioning.almostReady"),
    ],
    [t],
  );

  const current = Math.min(Math.max(wizard.provisioningStep, 0), stages.length - 1);
  const progressPct = ((current + 1) / stages.length) * 100;

  return (
    <div
      className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-14 sm:px-8"
      dir={direction}
      role="status"
      aria-live="polite"
    >
      <header className="mb-7 flex flex-col gap-2">
        <h1
          className="font-semibold"
          style={{ color: tokens.ink, fontSize: "clamp(1.5rem, 1.3rem + 0.9vw, 1.875rem)", lineHeight: 1.15, letterSpacing: "-0.02em" }}
        >
          {stages[current]}
        </h1>
        <p className="text-[0.9375rem] leading-relaxed" style={{ color: tokens.inkMuted }}>
          {t("signup.provisioning.usuallyTakes")}
        </p>
      </header>

      {/* ── Determinate progress bar ── */}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: tokens.border }}
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={stages.length}
        aria-valuenow={current + 1}
        aria-valuetext={stages[current]}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${progressPct}%`, background: tokens.accent }}
        />
      </div>

      {/* ── Stage checklist ── */}
      <ol className="mt-6 flex flex-col gap-3">
        {stages.map((stage, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={stage} className="flex items-center gap-3" style={{ opacity: i <= current ? 1 : 0.4 }}>
              <span
                aria-hidden
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors duration-300"
                style={{
                  background: done || active ? tokens.accent : tokens.surfaceRaised,
                  border: done || active ? `1px solid ${tokens.accent}` : tokens.borderCard,
                }}
              >
                {done ? (
                  <Check className="h-3 w-3" strokeWidth={3} style={{ color: tokens.accentContrast }} />
                ) : active ? (
                  <Loader2 className="h-3 w-3 animate-spin motion-reduce:animate-none" style={{ color: tokens.accentContrast }} />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: tokens.inkGhost }} />
                )}
              </span>
              <span
                className="text-[0.8125rem] font-medium transition-colors duration-300"
                style={{ color: done ? tokens.inkMuted : active ? tokens.ink : tokens.inkFaint }}
              >
                {stage}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default ProvisioningStep;
