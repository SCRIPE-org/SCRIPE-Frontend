"use client";
import { useI18n } from "@core/providers/i18n-provider";

import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import type { LoginFormData } from "../viewmodels/use-login-viewmodel";

interface CredentialsFormProps {
  formData: LoginFormData;
  showPassword: boolean;
  isLoading: boolean;
  isFormValid: boolean;
  error: string;
  isRTL: boolean;
  updateField: (field: keyof LoginFormData, value: string) => void;
  togglePasswordVisibility: () => void;
  handleLogin: () => void;
  errorAnnounce?: boolean;
}

export function CredentialsForm({
  formData,
  showPassword,
  isLoading,
  isFormValid,
  error,
  isRTL,
  updateField,
  togglePasswordVisibility,
  handleLogin,
  errorAnnounce = true,
}: CredentialsFormProps) {
  const { t } = useI18n();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!isLoading && isFormValid) handleLogin();
      }}
      className="flex flex-col"
      style={{ gap: "var(--login-element-gap, 24px)" }}
      role="form"
      aria-label={t("auth.loginFormAriaLabel")}
    >
      {/* Error Alert */}
      {error && (
        <div
          id="login-error"
          className="rounded-xl border border-destructive/20 bg-destructive/10 p-4"
          role="alert"
          {...(errorAnnounce ? { "aria-live": "assertive" as const, "aria-atomic": "true" } : {})}
        >
          <p className="text-sm font-medium text-destructive">{error}</p>
        </div>
      )}

      {/* Username Input */}
      <div className="space-y-2.5">
        <Label htmlFor="identifier" className="text-sm font-medium text-foreground">
          {t("auth.username")}
        </Label>
        <Input
          id="identifier"
          type="text"
          value={formData.identifier}
          onChange={(e) => updateField("identifier", e.target.value)}
          required
          aria-invalid={!!error || undefined}
          aria-describedby={error ? "login-error" : undefined}
          className="w-full border-border bg-background px-4 text-base text-foreground shadow-sm transition-all placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
          style={{
            height: "var(--login-input-height, 48px)",
            borderRadius: "var(--login-radius-button, 12px)",
          }}
          placeholder={t("auth.usernamePlaceholder")}
          disabled={isLoading}
          autoComplete="username email"
        />
      </div>

      {/* Password Input */}
      <div className="space-y-2.5">
        <Label htmlFor="password" className="text-sm font-medium text-foreground">
          {t("auth.password")}
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => updateField("password", e.target.value)}
            required
            aria-invalid={!!error || undefined}
            aria-describedby={error ? "login-error" : undefined}
            className="w-full border-border bg-background px-4 pr-12 text-base text-foreground shadow-sm transition-all placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary [&::-ms-reveal]:hidden"
            style={{
              height: "var(--login-input-height, 48px)",
              borderRadius: "var(--login-radius-button, 12px)",
            }}
            placeholder="••••••••"
            disabled={isLoading}
            autoComplete="current-password"
          />
          <button
            type="button"
            className={`absolute ${isRTL ? "left-0" : "right-0"} top-0 flex w-12 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus:outline-none`}
            style={{ height: "var(--login-input-height, 48px)" }}
            onClick={togglePasswordVisibility}
            disabled={isLoading}
            tabIndex={-1}
            aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Forgot Password Link */}
      <div className="-mt-2 flex justify-end">
        <Link
          href="/forgot-password"
          className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
          tabIndex={0}
        >
          {t("auth.forgotPassword") || "Forgot password?"}
        </Link>
      </div>

      {/* Semantic CTA Button */}
      <div className="pt-2">
        <Button
          type="submit"
          loading={isLoading}
          disabled={!isFormValid}
          className="flex w-full items-center justify-center bg-primary text-[15px] font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          style={{
            height: "var(--login-input-height, 48px)",
            borderRadius: "var(--login-radius-button, 12px)",
          }}
        >
          {t("auth.loginButton")}
        </Button>
      </div>
    </form>
  );
}
