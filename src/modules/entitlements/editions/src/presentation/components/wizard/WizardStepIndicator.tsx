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
    <div className="flex w-full items-center pt-2 pb-10 px-2 sm:px-6">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const done = i < currentStep;
        const active = i === currentStep;
        const isLast = i === steps.length - 1;

        return (
          <div key={s.id} className={`flex items-center ${isLast ? "flex-initial" : "flex-1"}`}>
            {/* Node */}
            <div className="relative flex flex-col items-center group">
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 z-10 transition-all duration-300
                  ${
                    active
                      ? "bg-background border-primary text-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.15)] ring-2 ring-primary/20 scale-110"
                      : done
                      ? "bg-primary border-primary text-primary-foreground shadow-md"
                      : "bg-background border-muted text-muted-foreground"
                  }
                `}
              >
                {done ? <Check className="h-5 w-5 animate-in zoom-in" /> : <Icon className="h-4 w-4" />}
              </div>
              
              <div className={`
                absolute top-14 text-center w-max max-w-[120px] left-1/2 -translate-x-1/2 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors duration-300
                ${active ? "text-foreground" : done ? "text-foreground/80" : "text-muted-foreground/60"}
              `}>
                {s.label}
              </div>
            </div>

            {/* Connector */}
            {!isLast && (
              <div className="flex-1 h-[2px] mx-2 sm:mx-4 relative overflow-hidden rounded-full bg-muted">
                <div 
                  className={`absolute inset-0 h-full bg-primary transition-transform duration-500 origin-left rtl:origin-right
                    ${done ? "scale-x-100" : "scale-x-0"}
                  `} 
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
