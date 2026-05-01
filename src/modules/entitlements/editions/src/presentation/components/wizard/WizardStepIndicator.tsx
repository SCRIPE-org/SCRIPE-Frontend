"use client";

import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface WizardStepConfig {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface WizardStepIndicatorProps {
  steps: readonly WizardStepConfig[];
  currentStep: number;
}

export function WizardStepIndicator({ steps, currentStep }: WizardStepIndicatorProps) {
  return (
    <div className="flex w-full items-center px-2 pb-10 pt-2 sm:px-6">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const done = i < currentStep;
        const active = i === currentStep;
        const isLast = i === steps.length - 1;

        return (
          <div key={s.id} className={`flex items-center ${isLast ? "flex-initial" : "flex-1"}`}>
            {/* Node */}
            <div className="group relative flex flex-col items-center">
              <div
                className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  active
                    ? "scale-110 border-primary bg-background text-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.15)] ring-2 ring-primary/20"
                    : done
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : "border-muted bg-background text-muted-foreground"
                } `}
              >
                {done ? (
                  <Check className="h-5 w-5 animate-in zoom-in" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>

              <div
                className={`absolute left-1/2 top-14 w-max max-w-[120px] -translate-x-1/2 text-center text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 sm:text-xs ${active ? "text-foreground" : done ? "text-foreground/80" : "text-muted-foreground/60"} `}
              >
                {s.label}
              </div>
            </div>

            {/* Connector */}
            {!isLast && (
              <div className="relative mx-2 h-[2px] flex-1 overflow-hidden rounded-full bg-muted sm:mx-4">
                <div
                  className={`absolute inset-0 h-full origin-left bg-primary transition-transform duration-500 rtl:origin-right ${done ? "scale-x-100" : "scale-x-0"} `}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
