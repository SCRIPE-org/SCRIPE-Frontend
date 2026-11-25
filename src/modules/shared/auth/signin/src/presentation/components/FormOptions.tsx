"use client";

import Link from "next/link";
import { Checkbox } from "@core/ui/checkbox";
import { Label } from "@core/ui/label";

interface FormOptionsProps {
  staySignedIn: boolean;
  onStaySignedInChange: (val: boolean) => void;
  disabled: boolean;
  forgotPasswordHref?: string;
  t: (key: string) => string;
}

/**
 * Presentation UI component rendering the form options.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function FormOptions({
  staySignedIn,
  onStaySignedInChange,
  disabled,
  forgotPasswordHref,
  t,
}: FormOptionsProps) {
  const staySignedInId = "stay-signed-in";

  return (
    <div
      className="flex items-center justify-between text-[12px]"
      style={{ color: "var(--sx-text-mute, hsl(var(--muted-foreground)))" }}
    >
      <div className="flex items-center gap-2">
        <Checkbox
          id={staySignedInId}
          checked={staySignedIn}
          onCheckedChange={(checked) => {
            if (!disabled) onStaySignedInChange(checked === true);
          }}
          disabled={disabled}
          aria-label={t("auth.staySignedIn")}
          className="h-5 w-5 border-nx-line-hi data-[state=checked]:border-nx-accent-fill data-[state=checked]:bg-nx-accent-fill data-[state=checked]:text-nx-on-fill"
        />
        <Label
          htmlFor={staySignedInId}
          className="cursor-pointer select-none text-[12px] font-normal text-inherit"
        >
          {t("auth.staySignedIn")}
        </Label>
      </div>
      <Link
        href={forgotPasswordHref || "/forgot-password"}
        className="text-[12px] font-medium transition-colors hover:opacity-80"
        style={{ color: "var(--sx-accent-text, hsl(var(--primary)))" }}
        tabIndex={0}
      >
        {t("auth.forgotPassword")}
      </Link>
    </div>
  );
}
