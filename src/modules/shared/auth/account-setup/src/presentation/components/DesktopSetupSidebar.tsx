"use client";

import React from "react";
import { cn } from "@core/common/utils";
import { Badge } from "@core/ui/badge";
import {
  Building2,
  KeyRound,
  User,
  ShieldCheck,
  Sparkles,
  Check,
  Lock,
} from "lucide-react";
import { BRAND } from "@core/config/branding";
import { useI18n } from "@core/providers/i18n-provider";
import type { SetupStep } from "../viewmodels/useAccountSetupViewModel";

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
    <div className="hidden lg:flex flex-col justify-between h-full p-8 rounded-3xl border border-border/60 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
      {/* Ambient Tenant Glow Accent */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" aria-hidden="true" />

      <div className="relative space-y-6">
        {/* Brand & Workspace Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-xs">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-foreground truncate">{tenantName || BRAND.name}</span>
                {tenantCode && (
                  <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 border-primary/30 text-primary">
                    {tenantCode}
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                Sports Operations OS
              </p>
            </div>
          </div>

          <div className="pt-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Account Activation</h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Complete your administrative onboarding to take command of venue scheduling, academy rosters, and coach intelligence.
            </p>
          </div>
        </div>

        {/* Administrator Context Pill */}
        {(adminEmail || adminUsername) && (
          <div className="rounded-2xl border border-border/50 bg-muted/20 p-3.5 space-y-1.5 min-w-0">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Setup Operator</span>
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-medium">Admin</Badge>
            </div>
            <div className="text-xs font-semibold text-foreground truncate">{adminEmail}</div>
            {adminUsername && <div className="text-[11px] font-mono text-muted-foreground truncate">@{adminUsername}</div>}
          </div>
        )}

        {/* Vertical Timeline Stepper */}
        <div className="space-y-2 pt-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Onboarding Stages</span>
          <nav aria-label="Desktop setup steps" className="relative pl-1">
            <div className="space-y-4">
              {steps.map((step) => {
                const isDone = currentStep > step.id || currentStep === 4;
                const isCurrent = currentStep === step.id;
                const Icon = step.icon;

                return (
                  <div key={step.id} className="relative flex items-start gap-3.5 group">
                    <button
                      type="button"
                      onClick={() => onStepClick?.(step.id)}
                      disabled={step.id > currentStep}
                      aria-current={isCurrent ? "step" : undefined}
                      aria-label={`Step ${step.id}: ${step.title}`}
                      className={cn(
                        "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        isDone && !isCurrent
                          ? "border-primary bg-primary text-primary-foreground"
                          : isCurrent
                          ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/25"
                          : "border-border/60 bg-card/60 text-muted-foreground cursor-not-allowed opacity-50"
                      )}
                    >
                      {isDone && !isCurrent ? <Check className="h-4 w-4 stroke-[2.5]" /> : <Icon className="h-4 w-4" />}
                    </button>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-xs font-semibold transition-colors", isCurrent ? "text-foreground" : isDone ? "text-foreground/80" : "text-muted-foreground/60")}>
                          {step.title}
                        </span>
                        {isCurrent && <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground/70 leading-snug mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Enterprise Security Footnote */}
      <div className="relative pt-6 border-t border-border/40 mt-6 space-y-2">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>AES-256-GCM Encrypted & Multi-Tenant Isolated</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Lock className="h-3.5 w-3.5 text-sky-500 shrink-0" />
          <span>Zero-Knowledge Server Authorization</span>
        </div>
      </div>
    </div>
  );
}
