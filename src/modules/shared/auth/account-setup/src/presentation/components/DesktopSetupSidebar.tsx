"use client";

import React from "react";
import { cn } from "@core/common/utils";
import { Badge } from "@core/ui/badge";
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
    <div className="relative hidden h-full flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-8 shadow-sm backdrop-blur-md lg:flex">
      {/* Ambient Tenant Glow Accent */}
      <div
        className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative space-y-6">
        {/* Brand & Workspace Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="shadow-xs flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-bold text-foreground">
                  {tenantName || BRAND.name}
                </span>
                {tenantCode && (
                  <Badge
                    variant="outline"
                    className="border-primary/30 px-1.5 py-0 font-mono text-[10px] text-primary"
                  >
                    {tenantCode}
                  </Badge>
                )}
              </div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Sports Operations OS
              </p>
            </div>
          </div>

          <div className="pt-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Account Activation</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Complete your administrative onboarding to take command of venue scheduling, academy
              rosters, and coach intelligence.
            </p>
          </div>
        </div>

        {/* Administrator Context Pill */}
        {(adminEmail || adminUsername) && (
          <div className="min-w-0 space-y-1.5 rounded-2xl border border-border/50 bg-muted/20 p-3.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Setup Operator</span>
              <Badge variant="secondary" className="px-1.5 py-0 text-[9px] font-medium">
                Admin
              </Badge>
            </div>
            <div className="truncate text-xs font-semibold text-foreground">{adminEmail}</div>
            {adminUsername && (
              <div className="truncate font-mono text-[11px] text-muted-foreground">
                @{adminUsername}
              </div>
            )}
          </div>
        )}

        {/* Vertical Timeline Stepper */}
        <div className="space-y-2 pt-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Onboarding Stages
          </span>
          <nav aria-label="Desktop setup steps" className="relative pl-1">
            <div className="space-y-4">
              {steps.map((step) => {
                const isDone = currentStep > step.id || currentStep === 4;
                const isCurrent = currentStep === step.id;
                const Icon = step.icon;

                return (
                  <div key={step.id} className="group relative flex items-start gap-3.5">
                    <button
                      type="button"
                      onClick={() => onStepClick?.(step.id)}
                      disabled={step.id > currentStep}
                      aria-current={isCurrent ? "step" : undefined}
                      aria-label={`Step ${step.id}: ${step.title}`}
                      className={cn(
                        "shadow-xs relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        isDone && !isCurrent
                          ? "border-primary bg-primary text-primary-foreground"
                          : isCurrent
                            ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/25"
                            : "cursor-not-allowed border-border/60 bg-card/60 text-muted-foreground opacity-50"
                      )}
                    >
                      {isDone && !isCurrent ? (
                        <Check className="h-4 w-4 stroke-[2.5]" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "text-xs font-semibold transition-colors",
                            isCurrent
                              ? "text-foreground"
                              : isDone
                                ? "text-foreground/80"
                                : "text-muted-foreground/60"
                          )}
                        >
                          {step.title}
                        </span>
                        {isCurrent && <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />}
                      </div>
                      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground/70">
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
      <div className="relative mt-6 space-y-2 border-t border-border/40 pt-6">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
          <span>AES-256-GCM Encrypted & Multi-Tenant Isolated</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Lock className="h-3.5 w-3.5 shrink-0 text-sky-500" />
          <span>Zero-Knowledge Server Authorization</span>
        </div>
      </div>
    </div>
  );
}
