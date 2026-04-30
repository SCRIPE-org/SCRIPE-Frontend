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
    <div className="flex items-center gap-0">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={s.id} className="flex items-center">
            <div
              className={`
                flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider
                border transition-colors
                ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : done
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-muted/30 text-muted-foreground border-border"
                }
              `}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              {s.label}
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px w-6 ${done ? "bg-primary/40" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
