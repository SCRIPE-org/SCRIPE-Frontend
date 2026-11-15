"use client";

import React from "react";
import { cn } from "@core/common/utils";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Building2, KeyRound, User, ShieldCheck, Sparkles, Check, Lock } from "lucide-react";
import { BRAND } from "@core/config/branding";
import { useI18n } from "@core/providers/i18n-provider";
import type { SetupStep } from "../viewmodels/useAccountSetupViewModel";

/**
 * Documentation for module export
 */
export interface DesktopSetupSidebarProps {
  currentStep: SetupStep;
  hasCustomFields: boolean;
  tenantName?: string;
  tenantCode?: string;
  adminUsername?: string;
  adminEmail?: string;
  onStepClick?: (step: SetupStep) => void;
}

/**
 * Left Hero Sidebar for Kinetic Split-Screen Account Setup Layout.
 */
export function DesktopSetupSidebar({
  currentStep,
  hasCustomFields,
  tenantName,
  tenantCode,
  adminUsername,
  adminEmail,
  onStepClick,
}: DesktopSetupSidebarProps) {
  const { t } = useI18n();

  const steps = [
    {
      id: 1 as SetupStep,
      title: t("auth.accountSetup.step1Security") || "Security Credentials",
      desc: "Establish your protected authentication password",
      icon: KeyRound,
    },
    {
      id: 2 as SetupStep,
      title: t("auth.accountSetup.step2Profile") || "Administrator Profile",
      desc: "Personalize your operator identity and contact",
      icon: User,
    },
    ...(hasCustomFields
      ? [
          {
            id: 3 as SetupStep,
            title: t("auth.accountSetup.step3Attributes") || "Attributes & Compliance",
            desc: "Complete required organization data fields",
            icon: ShieldCheck,
          },
        ]
      : []),
    {
      id: 4 as SetupStep,
      title: t("auth.accountSetup.step4Celebration") || "Ready to Launch",
      desc: "Instant production access to your workspace",
      icon: Sparkles,
    },
  ];

  return (
    <div className="relative hidden h-full flex-col justify-between overflow-hidden rounded-3xl border border-nx-line bg-nx-surface p-8 lg:flex">
      <div className="relative space-y-6">
        {/* Brand & Workspace Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-nx-line-hi bg-nx-accent-wash text-nx-accent">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-bold text-nx-ink">
                  {tenantName || BRAND.name}
                </span>
                {tenantCode && (
                  <Badge
                    variant="outline"
                    className="border-nx-line-hi px-1.5 py-0 font-mono text-[10px] text-nx-accent"
                  >
                    {tenantCode}
                  </Badge>
                )}
              </div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-nx-ink-2">
                Sports Operations OS
              </p>
            </div>
          </div>

          <div className="pt-2">
            <h2 className="text-xl font-bold tracking-tight text-nx-ink">Account Activation</h2>
            <p className="mt-1 text-xs leading-relaxed text-nx-ink-2">
              Complete your administrative onboarding to take command of venue scheduling, academy
              rosters, and coach intelligence.
            </p>
          </div>
        </div>

        {/* Administrator Context Pill */}
        {(adminEmail || adminUsername) && (
          <div className="min-w-0 space-y-1.5 rounded-2xl border border-nx-line bg-nx-raised p-3.5">
            <div className="flex items-center justify-between text-[11px] text-nx-ink-2">
              <span>Setup Operator</span>
              <Badge variant="secondary" className="px-1.5 py-0 text-[9px] font-medium">
                Admin
              </Badge>
            </div>
            <div className="truncate text-xs font-semibold text-nx-ink">{adminEmail}</div>
            {adminUsername && (
              <div className="truncate font-mono text-[11px] text-nx-ink-3">
                @{adminUsername}
              </div>
            )}
          </div>
        )}

        {/* Vertical Timeline Stepper */}
        <div className="space-y-2 pt-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-nx-ink-2">
            Onboarding Stages
          </span>
          <nav aria-label="Desktop setup steps" className="relative ps-1">
            <div className="space-y-4">
              {steps.map((step) => {
                const isDone = currentStep > step.id || currentStep === 4;
                const isCurrent = currentStep === step.id;
                const Icon = step.icon;

                return (
                  <div key={step.id} className="group relative flex items-start gap-3.5">
                    <Button variant="ghost"
                      type="button"
                      onClick={() => onStepClick?.(step.id)}
                      disabled={step.id > currentStep}
                      aria-current={isCurrent ? "step" : undefined}
                      aria-label={`Step ${step.id}: ${step.title}`}
                      className={cn(
                        "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:shadow-nx-focus",
                        isDone && !isCurrent
                          ? "border-nx-accent-fill bg-nx-accent-fill text-nx-on-fill hover:bg-nx-accent-fill"
                          : isCurrent
                            ? "border-nx-accent bg-nx-accent-wash text-nx-accent hover:bg-nx-accent-wash"
                            : "cursor-not-allowed border-nx-line bg-nx-raised text-nx-ink-3 opacity-60"
                      )}
                    >
                      {isDone && !isCurrent ? (
                        <Check className="h-4 w-4 stroke-[2.5]" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "text-xs font-semibold transition-colors",
                            isCurrent
                              ? "text-nx-ink"
                              : isDone
                                ? "text-nx-ink-2"
                                : "text-nx-ink-3"
                          )}
                        >
                          {step.title}
                        </span>
                        {isCurrent && <span className="flex h-1.5 w-1.5 rounded-full bg-nx-accent" />}
                      </div>
                      <p className="mt-0.5 text-[11px] leading-snug text-nx-ink-2">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Enterprise Security Footnote */}
      <div className="relative mt-6 space-y-2 border-t border-nx-line pt-6">
        <div className="flex items-center gap-2 text-[11px] text-nx-ink-2">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-nx-success" />
          <span>AES-256-GCM Encrypted & Multi-Tenant Isolated</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-nx-ink-2">
          <Lock className="h-3.5 w-3.5 shrink-0 text-nx-info" />
          <span>Zero-Knowledge Server Authorization</span>
        </div>
      </div>
    </div>
  );
}
