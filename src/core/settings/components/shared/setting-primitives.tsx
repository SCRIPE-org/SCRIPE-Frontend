"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { Separator } from "@core/ui/separator";
import { cn } from "@core/common/utils";
import { Check, Lock } from "lucide-react";
import type { ReactNode } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
//  SHARED SETTING PRIMITIVES
//  Reusable across: SettingsView tabs, DashboardBuilderTab, Customizer Studio
//  All components are decoupled from settings-provider — they accept props only
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Types ───────────────────────────────────────────────────────────────────

/** A single style option for the StyleCardPicker */
export interface StyleOption<T extends string = string> {
  /** Unique value identifier */
  value: T;
  /** Display name (translated) */
  name: string;
  /** Optional description (translated) */
  description?: string;
  /** Optional CSS class for visual preview */
  class?: string;
  /** Optional JSX preview element */
  preview?: ReactNode;
}

/** A single color swatch option */
export interface ColorSwatchOption<T extends string = string> {
  /** Unique value identifier */
  value: T;
  /** Tailwind background class for the swatch circle */
  color: string;
  /** Tailwind accent class (lighter ring) */
  accent: string;
  /** Display label (translated) */
  label?: string;
}

/** A single mode option for the ModePicker */
export interface ModeOption<T extends string = string> {
  /** Unique value identifier */
  value: T;
  /** Emoji or icon string */
  icon: string;
  /** Display label (translated) */
  label: string;
  /** Display description (translated) */
  description: string;
}

// ─── SettingToggle ───────────────────────────────────────────────────────────
// A labeled on/off switch with description. Used for boolean settings.
// Replaces the repeating pattern in behavior-tab.tsx (11 instances).

export interface SettingToggleProps {
  /** Setting label (translated) */
  label: string;
  /** Setting description (translated) */
  description: string;
  /** Current value */
  checked: boolean;
  /** Change handler */
  onCheckedChange: (value: boolean) => void;
  /** Text direction for RTL support */
  direction?: "ltr" | "rtl";
  /** Whether this setting is locked by tenant admin */
  isLocked?: boolean;
  /** Locked tooltip message */
  lockedMessage?: string;
  /** Optional className */
  className?: string;
  /** Whether to show a separator below */
  showSeparator?: boolean;
}

export function SettingToggle({
  label,
  description,
  checked,
  onCheckedChange,
  direction = "ltr",
  isLocked = false,
  lockedMessage,
  className,
  showSeparator = false,
}: SettingToggleProps) {
  return (
    <>
      <div
        className={cn(
          "flex items-center justify-between",
          direction === "rtl" ? "flex-row-reverse" : "",
          isLocked && "opacity-60",
          className
        )}
      >
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Label>{label}</Label>
            {isLocked && (
              <span title={lockedMessage} className="text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={isLocked} />
      </div>
      {showSeparator && <Separator />}
    </>
  );
}

// ─── SettingSection ──────────────────────────────────────────────────────────
// A wrapper card for a group of related settings.

export interface SettingSectionProps {
  /** Section title (translated) */
  title: string;
  /** Section description (translated) */
  description?: string;
  /** Child content */
  children: ReactNode;
  /** Optional className */
  className?: string;
}

export function SettingSection({ title, description, children, className }: SettingSectionProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// ─── ColorSwatchGrid ─────────────────────────────────────────────────────────
// A grid of circular color swatches with checkmark on selected.
// Used in colors-subtab.tsx for primary/secondary color selection.

export interface ColorSwatchGridProps<T extends string = string> {
  /** Title (translated) */
  title: string;
  /** Description (translated) */
  description?: string;
  /** Available color options */
  colors: ColorSwatchOption<T>[];
  /** Currently selected value */
  selected: T;
  /** Selection handler */
  onSelect: (value: T) => void;
  /** Translation function for color labels */
  getLabel?: (value: T) => string;
  /** Optional grid column classes override */
  gridClassName?: string;
  /** Whether this group is locked */
  isLocked?: boolean;
  /** Locked tooltip */
  lockedMessage?: string;
}

export function ColorSwatchGrid<T extends string = string>({
  title,
  description,
  colors,
  selected,
  onSelect,
  getLabel,
  gridClassName,
  isLocked = false,
  lockedMessage,
}: ColorSwatchGridProps<T>) {
  return (
    <Card className={cn(isLocked && "opacity-60")}>
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <CardTitle className="text-base">{title}</CardTitle>
          {isLocked && (
            <span title={lockedMessage} className="text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11",
            gridClassName
          )}
        >
          {colors.map((c) => (
            <button
              key={c.value}
              disabled={isLocked}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border-2 p-2 transition-all hover:scale-105",
                selected === c.value
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-transparent hover:border-muted-foreground/20",
                isLocked && "pointer-events-none"
              )}
              onClick={() => onSelect(c.value)}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full shadow-sm",
                  c.color
                )}
              >
                {selected === c.value && <Check className="h-4 w-4 text-white" />}
              </div>
              <span className="max-w-full truncate text-[10px] font-medium text-muted-foreground">
                {c.label ?? getLabel?.(c.value) ?? c.value}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── StyleCardPicker ─────────────────────────────────────────────────────────
// A card grid for selecting a visual style. Shows name, description, and
// optional preview. Used 15+ times in components-tab for table style,
// button style, input style, badge style, modal style, etc.

export interface StyleCardPickerProps<T extends string = string> {
  /** Section title (translated) */
  title: string;
  /** Section description (translated) */
  description?: string;
  /** Available style options */
  options: StyleOption<T>[];
  /** Currently selected value */
  selected: T;
  /** Selection handler */
  onSelect: (value: T) => void;
  /** Grid columns override */
  gridClassName?: string;
  /** Whether this group is locked */
  isLocked?: boolean;
  /** Locked tooltip */
  lockedMessage?: string;
  /** Render custom preview content per option. If provided, overrides preview/class. */
  renderPreview?: (option: StyleOption<T>, isSelected: boolean) => ReactNode;
}

export function StyleCardPicker<T extends string = string>({
  title,
  description,
  options,
  selected,
  onSelect,
  gridClassName,
  isLocked = false,
  lockedMessage,
  renderPreview,
}: StyleCardPickerProps<T>) {
  return (
    <Card className={cn(isLocked && "opacity-60")}>
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <CardTitle className="text-base">{title}</CardTitle>
          {isLocked && (
            <span title={lockedMessage} className="text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4", gridClassName)}>
          {options.map((option) => {
            const isSelected = selected === option.value;

            return (
              <button
                key={option.value}
                disabled={isLocked}
                className={cn(
                  "relative flex flex-col items-start gap-2 rounded-xl border-2 p-3 text-left transition-all hover:scale-[1.02]",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
                    : "border-muted hover:border-muted-foreground/30",
                  isLocked && "pointer-events-none"
                )}
                onClick={() => onSelect(option.value)}
              >
                {/* Preview area */}
                {renderPreview ? (
                  renderPreview(option, isSelected)
                ) : option.preview ? (
                  <div className="w-full">{option.preview}</div>
                ) : null}

                {/* Label */}
                <span className="text-sm font-semibold">{option.name}</span>
                {option.description && (
                  <span className="text-[11px] leading-tight text-muted-foreground">
                    {option.description}
                  </span>
                )}

                {/* Selection checkmark */}
                {isSelected && (
                  <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── ModePicker ──────────────────────────────────────────────────────────────
// A horizontal mode selector with icon + label + description.
// Used in appearance-tab for background mode selection.

export interface ModePickerProps<T extends string = string> {
  /** Section title (translated) */
  title: string;
  /** Section description (translated) */
  description?: string;
  /** Available mode options */
  modes: ModeOption<T>[];
  /** Currently selected value */
  selected: T;
  /** Selection handler */
  onSelect: (value: T) => void;
  /** Grid columns override */
  gridClassName?: string;
  /** Whether this group is locked */
  isLocked?: boolean;
  /** Locked tooltip */
  lockedMessage?: string;
}

export function ModePicker<T extends string = string>({
  title,
  description,
  modes,
  selected,
  onSelect,
  gridClassName,
  isLocked = false,
  lockedMessage,
}: ModePickerProps<T>) {
  return (
    <Card className={cn(isLocked && "opacity-60")}>
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <CardTitle>{title}</CardTitle>
          {isLocked && (
            <span title={lockedMessage} className="text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-3", gridClassName)}>
          {modes.map((mode) => (
            <button
              key={mode.value}
              disabled={isLocked}
              className={cn(
                "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:scale-[1.02]",
                selected === mode.value
                  ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
                  : "border-muted hover:border-muted-foreground/30",
                isLocked && "pointer-events-none"
              )}
              onClick={() => onSelect(mode.value)}
            >
              <span className="text-2xl">{mode.icon}</span>
              <span className="text-sm font-semibold">{mode.label}</span>
              <span className="text-center text-[11px] leading-tight text-muted-foreground">
                {mode.description}
              </span>
              {selected === mode.value && (
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── EditionGatedControl ─────────────────────────────────────────────────────
// Wraps any setting control with edition gating badge.
// When the feature is unavailable, shows upgrade prompt instead.

export interface EditionGatedControlProps {
  /** Whether the feature is available in the current edition */
  isAvailable: boolean;
  /** The minimum edition required (display name) */
  requiredEdition?: string;
  /** Upgrade prompt text (translated) */
  upgradePrompt?: string;
  /** Children to render when available */
  children: ReactNode;
  /** Optional className */
  className?: string;
}

export function EditionGatedControl({
  isAvailable,
  requiredEdition,
  upgradePrompt,
  children,
  className,
}: EditionGatedControlProps) {
  if (isAvailable) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("relative", className)}>
      {/* Blurred/disabled children as background */}
      <div className="pointer-events-none select-none opacity-30 blur-[1px]">{children}</div>
      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 px-6 py-4 shadow-lg backdrop-blur-sm">
          <Lock className="h-5 w-5 text-warning" />
          <span className="text-sm font-semibold text-warning">
            {requiredEdition ? `${requiredEdition} Edition Required` : "Upgrade Required"}
          </span>
          {upgradePrompt && (
            <span className="text-center text-xs text-warning">
              {upgradePrompt}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
