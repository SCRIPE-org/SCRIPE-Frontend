"use client";

/**
 * PasswordChangeForm — Password change with optional 2FA code
 */
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@core/ui/input";
import { PasswordInput } from "@core/ui/password-input";
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
import { cn } from "@core/common/utils";
import type { ChangePasswordRequest } from "../../../src/domain/interfaces/IProfileRepository";

interface PasswordChangeFormProps {
  isTwoFactorEnabled: boolean;
  onSubmit: (data: ChangePasswordRequest) => Promise<unknown>;
  isSubmitting: boolean;
  submitError: string | null;
  success: boolean;
}

// react-hook-form owns every field as a plain string; confirmPassword only
// ever lives here (it never reaches ChangePasswordRequest) and twoFactorCode
// maps to `undefined` when 2FA isn't enabled — same shape the hand-rolled
// version submitted.
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

const UPPERCASE = /[A-Z]/;
const NUMBER = /[0-9]/;
const SPECIAL = /[!@#$%^&*(),.?":{}|<>]/;

// Built once per render with the live t() so every message re-localizes on a
// language switch, same shape as the CreateLeadDialog / CommissionRateConfig
// schemas already do. Validity rules are identical to the previous
// hand-rolled checks: currentPassword only has to be present (the server
// judges correctness), newPassword must clear all four strength rules, and
// confirmPassword must match it. twoFactorCode was never part of the
// original validity gate even when 2FA is enabled — that stays unchanged.
function buildSchema(t: (key: string) => string) {
  return z
    .object({
      currentPassword: z.string().min(1, t("profile.security.currentPasswordRequired")),
      newPassword: z
        .string()
        .min(8, t("profile.security.strength.minLength"))
        .regex(UPPERCASE, t("profile.security.strength.uppercase"))
        .regex(NUMBER, t("profile.security.strength.number"))
        .regex(SPECIAL, t("profile.security.strength.special")),
      confirmPassword: z.string(),
      twoFactorCode: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("profile.security.passwordMismatch"),
      path: ["confirmPassword"],
    });
}

/**
 * Presentation UI component rendering the password change form.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function PasswordChangeForm({
  isTwoFactorEnabled,
  onSubmit,
  isSubmitting,
  submitError,
  success,
}: PasswordChangeFormProps) {
  const { t } = useI18n();
  const schema = useMemo(() => buildSchema(t), [t]);

  const form = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
    mode: "onChange",
  });

  // Read once per render so the strength checklist and the schema check the
  // same rules against the same value.
  const newPassword = form.watch("newPassword");
  const strengthItems = [
    { met: newPassword.length >= 8, label: t("profile.security.strength.minLength") },
    { met: UPPERCASE.test(newPassword), label: t("profile.security.strength.uppercase") },
    { met: NUMBER.test(newPassword), label: t("profile.security.strength.number") },
    { met: SPECIAL.test(newPassword), label: t("profile.security.strength.special") },
  ];

  const handleValid = async (values: PasswordChangeFormValues) => {
    await onSubmit({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      twoFactorCode: isTwoFactorEnabled ? values.twoFactorCode : undefined,
    });
    form.reset(EMPTY_VALUES);
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
                <PasswordInput disabled={isSubmitting} {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.security.newPassword")}</FormLabel>
              <FormControl>
                <PasswordInput disabled={isSubmitting} {...field} />
              </FormControl>
              {newPassword.length > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-0.5">
                  {strengthItems.map((item) => (
                    <span
                      key={item.label}
                      className={cn(
                        "flex items-center gap-1 text-xs transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                        item.met ? "text-success" : "text-nx-ink-3"
                      )}
                    >
                      <span aria-hidden="true">{item.met ? "✓" : "○"}</span>
                      {item.label}
                    </span>
                  ))}
                </div>
              )}
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
                <PasswordInput disabled={isSubmitting} {...field} />
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
                    maxLength={6}
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
          <div className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {t("profile.security.passwordChanged")}
          </div>
        )}

        <Button type="submit" loading={isSubmitting} disabled={isSubmitting} className="w-full sm:w-auto">
          {t("profile.security.updatePassword")}
        </Button>
      </form>
    </Form>
  );
}
