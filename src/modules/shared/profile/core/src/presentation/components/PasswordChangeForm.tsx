"use client";

/**
 * PasswordChangeForm — Policy-driven password change with optional 2FA verification.
 */
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  createPolicyPasswordSchema,
  DEFAULT_PASSWORD_MAX_LENGTH,
  type PasswordPolicyModel,
} from "@core/common/password-policy";
import { Input } from "@core/ui/input";
import { PasswordInput } from "@core/ui/password-input";
import { PasswordWithPolicyField } from "@core/ui/password-policy-field";
import { Button } from "@core/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@core/ui/form";
import { useI18n } from "@core/providers/i18n-provider";
import { CheckCircle2 } from "lucide-react";
import type { ChangePasswordRequest } from "../../../src/domain/interfaces/IProfileRepository";

interface PasswordChangeFormProps {
  policy: PasswordPolicyModel | null | undefined;
  policyLoading?: boolean;
  policyError?: string | null;
  onRetryPolicy?: () => void;
  isTwoFactorEnabled: boolean;
  onSubmit: (data: ChangePasswordRequest) => Promise<unknown>;
  isSubmitting: boolean;
  submitError: string | null;
  success: boolean;
}

interface PasswordChangeFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorCode: string;
}

const EMPTY_VALUES: PasswordChangeFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  twoFactorCode: "",
};

function buildSchema(
  t: (key: string, params?: Record<string, string | number>) => string,
  policy: PasswordPolicyModel | null | undefined
) {
  return z
    .object({
      currentPassword: z.string().min(1, t("profile.security.currentPasswordRequired")),
      newPassword: createPolicyPasswordSchema(policy, t),
      confirmPassword: z.string(),
      twoFactorCode: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("profile.security.passwordMismatch"),
      path: ["confirmPassword"],
    });
}

/**
 * Presentation UI component rendering the password change form driven by backend `PasswordPolicyDto`.
 */
export function PasswordChangeForm({
  policy,
  policyLoading = false,
  policyError = null,
  onRetryPolicy,
  isTwoFactorEnabled,
  onSubmit,
  isSubmitting,
  submitError,
  success,
}: PasswordChangeFormProps) {
  const { t } = useI18n();
  const schema = buildSchema(t, policy);

  const form = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
    mode: "onChange",
  });

  const newPassword = useWatch({
    control: form.control,
    name: "newPassword",
    defaultValue: "",
  });

  const handleValid = async (values: PasswordChangeFormValues) => {
    if (!policy) return;
    try {
      await onSubmit({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        twoFactorCode: isTwoFactorEnabled ? values.twoFactorCode : undefined,
      });
      form.reset(EMPTY_VALUES);
    } catch {
      // Error surfaced via parent submitError prop without clearing user input
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleValid)} className="space-y-5">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.security.currentPassword")}</FormLabel>
              <FormControl>
                <PasswordInput disabled={isSubmitting} autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <PasswordWithPolicyField
                id="account-security-new-password"
                data-testid="account-security-new-password"
                label={t("profile.security.newPassword")}
                policy={policy}
                policyLoading={policyLoading}
                policyError={policyError}
                onRetryPolicy={onRetryPolicy}
                alwaysShowChecklist={newPassword.length > 0 || !policy || Boolean(policyError)}
                disabled={isSubmitting}
                autoComplete="new-password"
                t={t}
                {...field}
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.security.confirmPassword")}</FormLabel>
              <FormControl>
                <PasswordInput
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  maxLength={policy?.maxLength ?? DEFAULT_PASSWORD_MAX_LENGTH}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isTwoFactorEnabled && (
          <FormField
            control={form.control}
            name="twoFactorCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.security.twoFactorCode")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("profile.security.twoFactorCodePlaceholder")}
                    maxLength={20}
                    className="font-mono tracking-widest"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("profile.security.twoFactorCodeHint")}</FormDescription>
              </FormItem>
            )}
          />
        )}

        {submitError && <p className="text-sm text-nx-danger">{submitError}</p>}

        {success && (
          <div
            role="status"
            data-testid="password-change-success"
            className="flex items-start gap-2 rounded-nx-md border border-success/30 bg-success/10 px-3 py-2 text-xs text-success"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{t("profile.security.passwordChangedSessionsRevoked")}</span>
          </div>
        )}

        <Button
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting || !policy}
          className="w-full sm:w-auto"
        >
          {t("profile.security.updatePassword")}
        </Button>
      </form>
    </Form>
  );
}
