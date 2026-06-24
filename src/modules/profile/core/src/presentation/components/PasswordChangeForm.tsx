// UI-EXCEPTION: compact studio layout
"use client";

/**
 * PasswordChangeForm — Password change with optional 2FA code
 */
import { useState } from "react";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { cn } from "@core/common/utils";
import type { ChangePasswordRequest } from "../../../src/domain/interfaces/IProfileRepository";

interface PasswordChangeFormProps {
  isTwoFactorEnabled: boolean;
  onSubmit: (data: ChangePasswordRequest) => Promise<unknown>;
  isSubmitting: boolean;
  submitError: string | null;
  success: boolean;
}

/**
 * React presentation component representing the password change form UI element.
 */
export function PasswordChangeForm({
  isTwoFactorEnabled,
  onSubmit,
  isSubmitting,
  submitError,
  success,
}: PasswordChangeFormProps) {
  const { t } = useI18n();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Password strength indicators
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isValid =
    hasMinLength &&
    hasUppercase &&
    hasNumber &&
    hasSpecial &&
    passwordsMatch &&
    currentPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    await onSubmit({
      currentPassword,
      newPassword,
      twoFactorCode: isTwoFactorEnabled ? twoFactorCode : undefined,
    });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTwoFactorCode("");
  };

  const strengthItems = [
    { met: hasMinLength, label: t("profile.security.strength.minLength") },
    { met: hasUppercase, label: t("profile.security.strength.uppercase") },
    { met: hasNumber, label: t("profile.security.strength.number") },
    { met: hasSpecial, label: t("profile.security.strength.special") },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Current Password */}
      <div className="space-y-2">
        <Label htmlFor="currentPassword">{t("profile.security.currentPassword")}</Label>
        <div className="relative">
          <Input
            id="currentPassword"
            type={showCurrent ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="pe-10"
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div className="space-y-2">
        <Label htmlFor="newPassword">{t("profile.security.newPassword")}</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="pe-10"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {newPassword.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {strengthItems.map((item) => (
              <span
                key={item.label}
                className={cn(
                  "flex items-center gap-1 text-xs transition-colors",
                  item.met ? "text-emerald-600" : "text-muted-foreground"
                )}
              >
                {item.met ? "✓" : "○"} {item.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t("profile.security.confirmPassword")}</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {confirmPassword.length > 0 && !passwordsMatch && (
          <p className="text-xs text-destructive">{t("profile.security.passwordMismatch")}</p>
        )}
      </div>

      {/* 2FA Code */}
      {isTwoFactorEnabled && (
        <div className="space-y-2">
          <Label htmlFor="twoFactorCode">{t("profile.security.twoFactorCode")}</Label>
          <Input
            id="twoFactorCode"
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value)}
            placeholder={t("profile.security.twoFactorCodePlaceholder") || "Enter 6-digit code"}
            maxLength={6}
            className="font-mono tracking-widest"
          />
          <p className="text-xs text-muted-foreground">{t("profile.security.twoFactorCodeHint")}</p>
        </div>
      )}

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      {success && (
        <div className="flex items-center gap-2 text-sm text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          {t("profile.security.passwordChanged")}
        </div>
      )}

      <Button type="submit" loading={isSubmitting} disabled={!isValid} className="w-full sm:w-auto">
        {t("profile.security.updatePassword")}
      </Button>
    </form>
  );
}
