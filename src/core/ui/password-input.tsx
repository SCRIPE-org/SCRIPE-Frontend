"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/core/ui/input";
import { Button } from "@/core/ui/button";
import { Progress } from "@/core/ui/progress";
import { cn } from "@/core/common/utils";
import { useI18n } from "@/core/providers/i18n-provider";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrengthIndicator?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrengthIndicator = false, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [strength, setStrength] = React.useState(0);
    const { t } = useI18n();

    // Simple strength calculator
    const calculateStrength = (val: string) => {
      let score = 0;
      if (val.length > 8) score += 25;
      if (val.match(/[A-Z]/)) score += 25;
      if (val.match(/[0-9]/)) score += 25;
      if (val.match(/[^A-Za-z0-9]/)) score += 25;
      return score;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setStrength(calculateStrength(e.target.value));
      onChange?.(e);
    };

    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          // Logical end padding clears the toggle in both directions.
          className={cn("pe-10", className)}
          ref={ref}
          onChange={handleChange}
          {...props}
        />
        {/* The reveal toggle is a real tab stop with a pressed state — the
            old negative tabindex locked keyboard users out entirely. Focus
            rides Button's own --nx-focus lit-edge treatment. */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute end-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-pressed={showPassword}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
          )}
          <span className="sr-only">
            {showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
          </span>
        </Button>

        {showStrengthIndicator && props.value && (
          // Rides the shared Progress primitive; the child selector re-hues
          // its indicator through the measured status tokens per tier.
          <Progress
            value={strength}
            className={cn(
              "mt-2 h-1",
              strength < 50
                ? "[&>div]:bg-destructive"
                : strength < 75
                  ? "[&>div]:bg-warning"
                  : "[&>div]:bg-success"
            )}
          />
        )}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
