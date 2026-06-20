"use client";

import { Sun, Moon } from "lucide-react";
import { useSignupTheme } from "@core/providers/signup-theme";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";

interface ThemeSwitcherProps {
  buttonClassName?: string;
  contentClassName?: string;
  variant?: "solid" | "ghost";
  transparent?: boolean;
}

export function ThemeSwitcher({ buttonClassName, variant = "ghost", transparent }: ThemeSwitcherProps) {
  const { tokens, theme, toggleTheme } = useSignupTheme();
  const { t } = useI18n();
  const isDark = theme === "dark";

  const themeLabel = isDark
    ? t("signup.shell.themeToLight") || "Switch to Light Mode"
    : t("signup.shell.themeToDark") || "Switch to Dark Mode";

  const isGhost = transparent !== undefined ? transparent : variant === "ghost";

  if (isGhost) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label={themeLabel}
        title={themeLabel}
        className={cn("rounded-full", buttonClassName)}
      >
        {isDark ? (
          <Sun className="h-5 w-5 transition-all" aria-hidden="true" />
        ) : (
          <Moon className="h-5 w-5 transition-all" aria-hidden="true" />
        )}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={themeLabel}
      title={themeLabel}
      className={cn(
        "rounded-full p-2 transition-all duration-200 hover:opacity-80",
        buttonClassName
      )}
      style={{
        background: tokens.surfaceRaised,
        border: tokens.borderCard,
        color: tokens.inkMuted,
      }}
    >
      {isDark ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
    </button>
  );
}
