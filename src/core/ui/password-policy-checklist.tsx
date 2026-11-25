"use client";

import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock,
  History,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Progress } from "@core/ui/progress";
import {
  evaluatePasswordPolicy,
  type PasswordPolicyModel,
  type PasswordPolicyRuleKey,
  type TranslatePasswordPolicyFn,
} from "@core/common/password-policy";

/** Visual surface alignment for password checklist panels across in-app Nexus vs Auth shell surfaces. */
export type PasswordPolicySurface = "nexus" | "vault" | "signup";

/** Props for {@link PasswordPolicyChecklist}. */
export interface PasswordPolicyChecklistProps {
  /** Candidate password string being typed by the user. */
  password: string;
  /** Backend-resolved password policy. When absent, never falls back to weak hardcoded defaults. */
  policy: PasswordPolicyModel | null | undefined;
  /** True while the policy request is currently in flight. */
  policyLoading?: boolean;
  /** Error message surfaced when loading the backend password policy failed. */
  policyError?: string | null;
  /** Retry handler rendered alongside fail-closed policy error state. */
  onRetryPolicy?: () => void;
  /** Optional custom translation callback (falls back to I18nProvider `t`). */
  t?: TranslatePasswordPolicyFn;
  /** Whether to show the dynamic strength progress bar (default true). */
  showStrengthBar?: boolean;
  /** Visual token surface alignment ("nexus" default). */
  surface?: PasswordPolicySurface;
  /** Optional extra container class names. */
  className?: string;
}

const RULE_LOCALE_KEYS: Record<PasswordPolicyRuleKey, string> = {
  minLength: "common.passwordPolicy.minLength",
  maxLength: "common.passwordPolicy.maxLengthExceeded",
  uppercase: "common.passwordPolicy.uppercase",
  lowercase: "common.passwordPolicy.lowercase",
  number: "common.passwordPolicy.number",
  special: "common.passwordPolicy.special",
};

/**
 * Policy-driven live password checklist and strength bar.
 * Strictly renders rules resolved from the backend `PasswordPolicyDto`, surfaces
 * explicit loading/error/retry states when policy is unavailable, and honors Nexus `--nx-*` tokens.
 */
export function PasswordPolicyChecklist({
  password,
  policy,
  policyLoading = false,
  policyError = null,
  onRetryPolicy,
  t: providedT,
  showStrengthBar = true,
  surface = "nexus",
  className,
}: PasswordPolicyChecklistProps) {
  const { t: contextT } = useI18n();
  const t = providedT ?? contextT;

  if (policyLoading && !policy) {
    return (
      <div
        role="status"
        aria-live="polite"
        data-testid="password-policy-loading"
        className={cn(
          "rounded-nx-lg border border-nx-line bg-nx-raised px-3.5 py-2.5 text-xs text-nx-ink-2",
          surface === "vault" && "bg-nx-surface/60",
          className
        )}
      >
        {t("common.passwordPolicy.loadingPolicy")}
      </div>
    );
  }

  if (!policy) {
    return (
      <Alert
        variant="destructive"
        data-testid="password-policy-error"
        className={cn("border-destructive/40 bg-destructive/10 text-destructive", className)}
      >
        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
        <AlertDescription className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span>{policyError || t("common.passwordPolicy.loadFailed")}</span>
          {onRetryPolicy && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="password-policy-retry"
              onClick={onRetryPolicy}
              className="h-7 gap-1 border-destructive/40 px-2.5 text-xs text-destructive hover:bg-destructive/15"
            >
              <RefreshCw className="h-3 w-3" aria-hidden="true" />
              <span>{t("common.passwordPolicy.retryPolicy")}</span>
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  const evaluation = evaluatePasswordPolicy(password, policy);
  const progressVariant =
    evaluation.strengthTier === "strong"
      ? "success"
      : evaluation.strengthTier === "fair"
        ? "warning"
        : evaluation.strengthTier === "weak"
          ? "danger"
          : "neutral";

  const tierLabel =
    evaluation.strengthTier === "strong"
      ? t("common.passwordPolicy.strong")
      : evaluation.strengthTier === "fair"
        ? t("common.passwordPolicy.fair")
        : evaluation.strengthTier === "weak"
          ? t("common.passwordPolicy.weak")
          : "";

  const hasGovernanceNotes =
    policy.historyCount > 0 ||
    policy.checkBreachedPasswords ||
    (policy.expiryDays !== null && policy.expiryDays > 0);

  return (
    <div
      data-testid="password-policy-checklist"
      className={cn(
        "rounded-nx-lg border border-nx-line bg-nx-raised p-3.5 space-y-2.5",
        surface === "vault" && "bg-nx-surface/60",
        className
      )}
    >
      {showStrengthBar && password.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-nx-ink-2">
              {t("common.passwordPolicy.strengthLabel")}
            </span>
            <span
              data-testid="password-policy-strength-label"
              className={cn(
                "font-semibold",
                evaluation.strengthTier === "strong"
                  ? "text-success"
                  : evaluation.strengthTier === "fair"
                    ? "text-nx-warning-strong"
                    : "text-destructive"
              )}
            >
              {tierLabel}
            </span>
          </div>
          <Progress
            value={evaluation.strengthPercent}
            variant={progressVariant}
            aria-hidden="true"
            className="h-1.5 bg-nx-surface"
          />
        </div>
      )}

      <p className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
        {t("common.passwordPolicy.requirementsTitle")}
      </p>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
        {evaluation.rules.map((rule) => {
          const isMaxLengthViolation = rule.key === "maxLength";
          return (
            <li
              key={rule.key}
              data-testid={`pwd-rule-${rule.key}`}
              data-met={rule.met ? "true" : "false"}
              className={cn(
                "flex items-center gap-1.5 transition-colors duration-nx-micro motion-reduce:transition-none",
                isMaxLengthViolation
                  ? "text-destructive font-medium sm:col-span-2"
                  : rule.met
                    ? "text-success font-medium"
                    : "text-nx-ink-3"
              )}
            >
              {isMaxLengthViolation ? (
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive" aria-hidden="true" />
              ) : rule.met ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
              ) : (
                <Circle className="h-3.5 w-3.5 shrink-0 text-nx-ink-3" aria-hidden="true" />
              )}
              <span>{t(RULE_LOCALE_KEYS[rule.key], rule.params)}</span>
            </li>
          );
        })}
      </ul>

      {hasGovernanceNotes && (
        <div className="border-t border-nx-line pt-2 space-y-1 text-[11px] text-nx-ink-2">
          {policy.historyCount > 0 && (
            <div className="flex items-center gap-1.5" data-testid="pwd-note-history">
              <History className="h-3.5 w-3.5 shrink-0 text-nx-ink-3" aria-hidden="true" />
              <span>
                {t("common.passwordPolicy.historyNotice", { count: policy.historyCount })}
              </span>
            </div>
          )}
          {policy.checkBreachedPasswords && (
            <div className="flex items-center gap-1.5" data-testid="pwd-note-breach">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-nx-ink-3" aria-hidden="true" />
              <span>{t("common.passwordPolicy.breachCheckNotice")}</span>
            </div>
          )}
          {policy.expiryDays !== null && policy.expiryDays > 0 && (
            <div className="flex items-center gap-1.5" data-testid="pwd-note-expiry">
              <Clock className="h-3.5 w-3.5 shrink-0 text-nx-ink-3" aria-hidden="true" />
              <span>
                {t("common.passwordPolicy.expiryNotice", { days: policy.expiryDays })}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
