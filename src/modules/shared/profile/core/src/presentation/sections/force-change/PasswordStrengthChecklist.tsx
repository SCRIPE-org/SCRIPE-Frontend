"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@core/common/utils";

/**
 * Rule evaluation flags for the live password strength checklist.
 */
export interface PasswordStrengthRulesState {
  minLength: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

/**
 * Props for PasswordStrengthChecklist.
 */
export interface PasswordStrengthChecklistProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  rules: PasswordStrengthRulesState;
}

/**
 * Live 5-rule password complexity checklist rendered during forced password rotation.
 */
export function PasswordStrengthChecklist({ t, rules }: PasswordStrengthChecklistProps) {
  const strengthChecklist = [
    { key: "minLength", label: t("profile.security.strength.minLength"), met: rules.minLength },
    { key: "uppercase", label: t("profile.security.strength.uppercase"), met: rules.uppercase },
    { key: "lowercase", label: t("profile.security.strength.lowercase"), met: rules.lowercase },
    { key: "number", label: t("profile.security.strength.number"), met: rules.number },
    { key: "special", label: t("profile.security.strength.special"), met: rules.special },
  ];

  return (
    <div className="rounded-nx-lg border border-nx-line bg-nx-raised p-3.5 space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
        {t("profile.security.requirementsTitle")}
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
        {strengthChecklist.map((rule) => (
          <li
            key={rule.key}
            data-testid={`pwd-rule-${rule.key}`}
            data-met={rule.met ? "true" : "false"}
            className={cn(
              "flex items-center gap-1.5 transition-colors",
              rule.met ? "text-success font-medium" : "text-nx-ink-3"
            )}
          >
            {rule.met ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
            ) : (
              <Circle className="h-3.5 w-3.5 shrink-0 text-nx-ink-3" aria-hidden="true" />
            )}
            <span>{rule.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
