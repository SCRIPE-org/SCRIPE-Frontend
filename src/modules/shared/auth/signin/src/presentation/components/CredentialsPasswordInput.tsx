"use client";

import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface CredentialsPasswordInputProps {
  value: string;
  onChange: (val: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  disabled: boolean;
  hasError: boolean;
  t: (key: string) => string;
}

/**
 * Presentation UI component rendering the credentials password input.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function CredentialsPasswordInput({
  value,
  onChange,
  showPassword,
  onToggleShowPassword,
  disabled,
  hasError,
  t,
}: CredentialsPasswordInputProps) {
  return (
    <div className="flex flex-col gap-[7px]">
      <Label
        htmlFor="password"
        className="block text-[11px] font-medium uppercase tracking-[0.15em]"
        style={{
          color: "var(--sx-text-mute, hsl(var(--muted-foreground)))",
          fontFamily: "var(--font-mono, ui-monospace, monospace)",
        }}
      >
        {t("auth.password")}
      </Label>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          dir="ltr"
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? "login-error" : undefined}
          className="h-[var(--login-input-height,48px)] w-full rounded-xl border px-4 text-[15px] shadow-none transition-all duration-150 focus-visible:ring-0 [&::-ms-reveal]:hidden"
          style={{
            paddingRight: "4rem",
            textAlign: "left",
            background: "var(--sx-field-bg, transparent)",
            borderColor: "var(--sx-field-border, hsl(var(--border)))",
            boxShadow: "var(--sx-field-inner-hi, none)",
          }}
          placeholder="••••••••••••"
          disabled={disabled}
          autoComplete="current-password"
        />
        <Button
          type="button"
          variant="ghost"
          className="absolute top-0 flex items-center justify-center px-3 transition-colors hover:bg-transparent"
          style={{
            right: "4px",
            left: "auto",
            height: "var(--login-input-height,48px)",
          }}
          onClick={onToggleShowPassword}
          disabled={disabled}
          // Reachable by keyboard: a sighted keyboard user and a screen-reader
          // user both need to verify what they typed before submitting, and
          // this is the only control that lets them (WCAG 2.1.1, Level A).
          aria-pressed={showPassword}
          aria-controls="password"
          aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          )}
        </Button>
      </div>
    </div>
  );
}
