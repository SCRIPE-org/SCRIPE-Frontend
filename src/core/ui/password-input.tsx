"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/core/ui/input";
import { Button } from "@/core/ui/button";
import { cn } from "@/core/common/utils";
import { useI18n } from "@/core/providers/i18n-provider"; // Correct import path for i18n
// Assuming we have a Progress component, if not removed

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrengthIndicator?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrengthIndicator = false, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [strength, setStrength] = React.useState(0);
    const { direction } = useI18n(); // Global direction preference

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

    // Determine icon position based on global direction OR input content (optional advanced feature)
    // For now, we stick to the global direction for consistency with the form
    const isRtl = direction === "rtl";

    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          className={cn(
            // Add padding for the icon
            isRtl ? "pl-10" : "pr-10",
            className
          )}
          ref={ref}
          onChange={handleChange}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "absolute top-0 h-full px-3 py-2 hover:bg-transparent",
            isRtl ? "left-0" : "right-0"
          )}
          onClick={() => setShowPassword((prev) => !prev)}
          tabIndex={-1} // Skip tab focus
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          )}
          <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
        </Button>

        {showStrengthIndicator && props.value && (
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full transition-all duration-300 ease-in-out",
                strength < 50 ? "bg-red-500" : strength < 75 ? "bg-yellow-500" : "bg-green-500"
              )}
              style={{ width: `${strength}%` }}
            />
          </div>
        )}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
