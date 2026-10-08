"use client";

import React from "react";
import { cn } from "@core/common/utils";
import { Badge } from "@core/ui/badge";
import { ShieldCheck } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * Documentation for module export
 */
export interface PasswordStrengthMeterProps {
  score: number;
  entropyBits?: number;
}

/**
 * Live Password Strength Bar and Label with Shannon Entropy Bits.
 */
export function PasswordStrengthMeter({ score, entropyBits }: PasswordStrengthMeterProps) {
  const { t } = useI18n();

  const getTier = () => {
    if (score < 35) {
      return {
        level: 1,
        label: t("auth.accountSetup.weak") || "Weak",
        color: "bg-destructive",
        text: "text-destructive",
      };
    }
    if (score < 65) {
      return {
        level: 2,
        label: t("auth.accountSetup.medium") || "Fair",
        color: "bg-amber-500",
        text: "text-amber-600 dark:text-amber-400",
      };
    }
    if (score < 85) {
      return {
        level: 3,
        label: t("auth.accountSetup.strong") || "Strong",
        color: "bg-emerald-500",
        text: "text-emerald-600 dark:text-emerald-400",
      };
    }
    return {
      level: 4,
      label: "Enterprise-Grade",
      color: "bg-indigo-500 dark:bg-indigo-400",
      text: "text-indigo-600 dark:text-indigo-400",
    };
  };

  const tier = getTier();

  return (
    <div
      className="space-y-2 rounded-xl border border-border/40 bg-muted/20 p-3"
      role="region"
      aria-label="Password Security Meter"
    >
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className={cn("h-3.5 w-3.5", tier.text)} aria-hidden="true" />
          <span className="font-medium text-muted-foreground">
            {t("auth.accountSetup.passwordStrength") || "Password Security"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {entropyBits !== undefined && entropyBits > 0 && (
            <span className="font-mono text-[10px] text-muted-foreground/80">
              ~{Math.round(entropyBits)} bits
            </span>
          )}
          <Badge
            variant="outline"
            className={cn("border-current px-1.5 py-0 text-[10px] font-semibold", tier.text)}
          >
            {tier.label}
          </Badge>
        </div>
      </div>

      {/* 4-Segment Strength Bar */}
      <div
        className="grid h-1.5 w-full grid-cols-4 gap-1.5"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Password strength: ${tier.label}`}
      >
        {[1, 2, 3, 4].map((seg) => {
          const isActive = tier.level >= seg;
          return (
            <div
              key={seg}
              className={cn(
                "h-full rounded-full transition-all duration-300",
                isActive ? tier.color : "bg-muted"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
