"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSignupTheme } from "@core/providers/signup-theme";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";

/*
 * TWO switchers, on purpose.
 *
 * `ThemeSwitcher` below paints the sign-in / signup vault palette: its solid
 * skin reads `tokens` out of `useSignupTheme()`, and those are the Aurora
 * constants (a fixed violet edge, a fixed raised surface) that belong to the
 * frozen auth surface. Six auth views and the branding preview that mirrors
 * them render it, so it keeps its name, its palette and its behaviour.
 *
 * `NxThemeSwitcher` is the product-chrome twin. The product accent is
 * workspace-owned and is not a fixed hue, so the topbar must never inherit the
 * vault's violet — a shared component reaching into the signup token set is how
 * the product chrome silently starts following the signup palette. It reads the
 * theme straight from next-themes (which is what the signup adapter wraps) and
 * dresses itself entirely in nx tokens.
 */

interface ThemeSwitcherProps {
  buttonClassName?: string;
  contentClassName?: string;
  variant?: "solid" | "ghost";
  transparent?: boolean;
}

/**
 * Vault-surface theme toggle. Owned by the frozen sign-in / signup look.
 * Product chrome must use `NxThemeSwitcher`.
 */
export function ThemeSwitcher({
  buttonClassName,
  variant = "ghost",
  transparent,
}: ThemeSwitcherProps) {
  const { tokens, theme, toggleTheme } = useSignupTheme();
  const { t } = useI18n();
  const isDark = theme === "dark";

  const themeLabel = isDark
    ? t("signup.shell.themeToLight")
    : t("signup.shell.themeToDark");

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
          <Sun className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Moon className="h-5 w-5" aria-hidden="true" />
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
        "rounded-full p-2 transition-opacity duration-nx-standard ease-nx-enter hover:opacity-80 motion-reduce:transition-none",
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

interface NxThemeSwitcherProps {
  buttonClassName?: string;
  /** "ghost" is the toolbar rung; "solid" is the bordered pill. */
  variant?: "solid" | "ghost";
  /** Legacy alias kept so the two switchers stay prop-compatible. */
  transparent?: boolean;
}

/**
 * Product-chrome theme toggle. Same prop shape as `ThemeSwitcher`, nx tokens
 * throughout, so a chrome surface can swap one for the other in place.
 */
export function NxThemeSwitcher({
  buttonClassName,
  variant = "ghost",
  transparent,
}: NxThemeSwitcherProps) {
  // `resolvedTheme` is undefined until next-themes has read the stored
  // preference, and the app's default is dark — so anything that is not
  // explicitly "light" is treated as dark. This is exactly what the signup
  // adapter does, which is why the swap is behaviour-preserving.
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useI18n();
  const isDark = resolvedTheme !== "light";

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  // The name states the action the press performs, not the state it is in.
  const themeLabel = isDark ? t("chrome.theme.toLight") : t("chrome.theme.toDark");

  const isGhost = transparent !== undefined ? transparent : variant === "ghost";
  const Glyph = isDark ? Sun : Moon;

  if (isGhost) {
    // Button already carries the focus ring, the press inset and the micro
    // colour transition — this rung only pins the shape.
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label={themeLabel}
        className={cn("rounded-full", buttonClassName)}
      >
        <Glyph className="h-5 w-5" aria-hidden="true" />
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={themeLabel}
      className={cn(
        "rounded-full border border-nx-line bg-nx-raised p-2 text-nx-ink-2",
        "transition-[color,background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
        "hover:text-nx-ink",
        "focus-visible:shadow-nx-focus focus-visible:outline-none",
        buttonClassName
      )}
    >
      <Glyph className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
