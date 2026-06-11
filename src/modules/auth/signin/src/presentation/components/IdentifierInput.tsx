"use client";

import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";

interface IdentifierInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
  hasError: boolean;
  t: (key: string) => string;
}

export function IdentifierInput({ value, onChange, disabled, hasError, t }: IdentifierInputProps) {
  return (
    <div className="flex flex-col gap-[7px]">
      <Label
        htmlFor="identifier"
        className="block text-[11px] font-medium uppercase tracking-[0.15em]"
        style={{
          color: "var(--sx-text-mute, hsl(var(--muted-foreground)))",
          fontFamily: "var(--font-mono, ui-monospace, monospace)",
        }}
      >
        {t("auth.username")}
      </Label>
      <Input
        id="identifier"
        type="text"
        inputMode="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        dir="ltr"
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? "login-error" : undefined}
        className="h-[var(--login-input-height,48px)] w-full rounded-xl border px-4 text-[15px] shadow-none transition-all duration-150 focus-visible:ring-0"
        style={{
          background: "var(--sx-field-bg, transparent)",
          borderColor: "var(--sx-field-border, hsl(var(--border)))",
          boxShadow: "var(--sx-field-inner-hi, none)",
        }}
        placeholder={t("auth.usernamePlaceholder")}
        disabled={disabled}
        autoComplete="username email"
        autoFocus
      />
    </div>
  );
}
