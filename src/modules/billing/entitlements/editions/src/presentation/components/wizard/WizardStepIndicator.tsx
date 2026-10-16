"use client";

import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Interface defining property specifications, keys types, and structural contract rules for wizard step config.
 */
export interface WizardStepConfig {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface WizardStepIndicatorProps {
  steps: readonly WizardStepConfig[];
  currentStep: number;
}

/**
 * Presentation UI component rendering the wizard step indicator.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
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
                className={`z-raised flex h-10 w-10 items-center justify-center rounded-full border-2 transition-[transform,border-color,background-color,color,box-shadow] duration-nx-panel ease-nx-enter motion-reduce:transition-none ${
                  active
                    ? "scale-110 border-nx-accent bg-nx-ground text-nx-accent ring-2 ring-[color:color-mix(in_srgb,var(--nx-accent)_20%,transparent)]"
                    : done
                      ? "border-nx-accent-fill bg-nx-accent-fill text-nx-on-fill shadow-nx-sm"
                      : "border-nx-line bg-nx-ground text-nx-ink-3"
                } `}
              >
                {done ? (
                  <Check className="h-5 w-5 animate-in zoom-in" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>

              <div
                className={`absolute start-1/2 top-14 w-max max-w-[120px] -translate-x-1/2 text-center text-[11px] font-bold uppercase tracking-wider transition-colors duration-nx-panel ease-nx-enter motion-reduce:transition-none sm:text-xs rtl:translate-x-1/2 ${active ? "text-nx-ink" : done ? "text-nx-ink-2" : "text-nx-ink-3"} `}
              >
                {s.label}
              </div>
            </div>

            {/* Connector */}
            {!isLast && (
              <div className="relative mx-2 h-[2px] flex-1 overflow-hidden rounded-full bg-nx-line sm:mx-4">
                <div
                  className={`absolute inset-0 h-full origin-left bg-nx-accent-fill transition-transform duration-nx-standard ease-nx-enter motion-reduce:transition-none rtl:origin-right ${done ? "scale-x-100" : "scale-x-0"} `}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
