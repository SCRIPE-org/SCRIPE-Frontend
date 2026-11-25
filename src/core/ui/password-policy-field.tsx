"use client";

import * as React from "react";
import { cn } from "@core/common/utils";
import { Label } from "@core/ui/label";
import { PasswordInput } from "@core/ui/password-input";
import {
  DEFAULT_PASSWORD_MAX_LENGTH,
  type PasswordPolicyModel,
  type TranslatePasswordPolicyFn,
} from "@core/common/password-policy";
import {
  PasswordPolicyChecklist,
  type PasswordPolicySurface,
} from "@core/ui/password-policy-checklist";

/** Props for {@link PasswordWithPolicyField}. */
export interface PasswordWithPolicyFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  /** Input id linked to the field Label and error output. */
  id: string;
  /** Localized field label text. */
  label?: React.ReactNode;
  /** Current password value. */
  value: string;
  /** Change handler receiving the raw string value cleanly. */
  onValueChange?: (value: string) => void;
  /** Standard input change handler (supported alongside `onValueChange`). */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** Effective backend password policy. */
  policy: PasswordPolicyModel | null | undefined;
  /** True while backend password policy is loading. */
  policyLoading?: boolean;
  /** Error message shown when loading password policy failed. */
  policyError?: string | null;
  /** Callback to retry fetching password policy. */
  onRetryPolicy?: () => void;
  /** Optional inline validation error displayed below the field. */
  error?: string | null;
  /** Controls checklist visibility (default true when typing or when policy fails to load). */
  showChecklist?: boolean;
  /** Keeps the checklist expanded even before the user begins typing (default true). */
  alwaysShowChecklist?: boolean;
  /** Shows the live strength Progress meter inside the checklist (default true). */
  showStrengthBar?: boolean;
  /** Visual surface variant ("nexus" default). */
  surface?: PasswordPolicySurface;
  /** Optional translation function passed into PasswordPolicyChecklist. */
  t?: TranslatePasswordPolicyFn;
  /** Extra classes applied to the wrapping container. */
  containerClassName?: string;
  /** Extra classes applied to the label. */
  labelClassName?: string;
  /** Optional `data-testid` applied to the underlying input. */
  "data-testid"?: string;
}

/**
 * Standardized Password + Live Policy Checklist field backed strictly by `@core/ui/password-input`
 * and Nexus design tokens (`--nx-*`). Replaces all ad-hoc password inputs and strength meters.
 */
export const PasswordWithPolicyField = React.forwardRef<
  HTMLInputElement,
  PasswordWithPolicyFieldProps
>(
  (
    {
      id,
      label,
      value,
      onValueChange,
      onChange,
      policy,
      policyLoading = false,
      policyError = null,
      onRetryPolicy,
      error = null,
      showChecklist = true,
      alwaysShowChecklist = true,
      showStrengthBar = true,
      surface = "nexus",
      t,
      containerClassName,
      labelClassName,
      className,
      maxLength,
      autoComplete = "new-password",
      "aria-invalid": ariaInvalidProp,
      ...inputProps
    },
    ref
  ) => {
    const resolvedMaxLength = maxLength ?? policy?.maxLength ?? DEFAULT_PASSWORD_MAX_LENGTH;
    const isInvalid = Boolean(error) || ariaInvalidProp === true || ariaInvalidProp === "true";
    const errorId = error ? `${id}-error` : undefined;
    const checklistVisible =
      showChecklist &&
      (alwaysShowChecklist || value.length > 0 || policyLoading || Boolean(policyError) || !policy);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange?.(e.target.value);
      onChange?.(e);
    };

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label !== undefined && (
          <Label
            htmlFor={id}
            className={cn("text-xs font-semibold text-nx-ink", labelClassName)}
          >
            {label}
          </Label>
        )}

        <PasswordInput
          ref={ref}
          id={id}
          value={value}
          onChange={handleChange}
          autoComplete={autoComplete}
          maxLength={resolvedMaxLength}
          aria-invalid={isInvalid ? true : undefined}
          aria-describedby={errorId}
          className={cn(
            isInvalid && "border-destructive focus-visible:ring-destructive/40",
            className
          )}
          {...inputProps}
        />

        {error && (
          <output id={errorId} role="alert" className="block text-xs text-destructive">
            {error}
          </output>
        )}

        {checklistVisible && (
          <PasswordPolicyChecklist
            password={value}
            policy={policy}
            policyLoading={policyLoading}
            policyError={policyError}
            onRetryPolicy={onRetryPolicy}
            showStrengthBar={showStrengthBar}
            surface={surface}
            t={t}
          />
        )}
      </div>
    );
  }
);
PasswordWithPolicyField.displayName = "PasswordWithPolicyField";
