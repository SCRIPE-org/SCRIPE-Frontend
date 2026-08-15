"use client";

/**
 * The settings control kit.
 *
 * Five primitives carry every one of the ~54 settings, so the page reads as one
 * rhythm instead of thirty hand-built cards:
 *
 *   GroupPanel   the group's heading and its hairline-ruled column of rows
 *   Row          one thing you can change: title, supporting line, controls
 *   Choice       a single-choice picker rendered as a real WAI-ARIA radiogroup
 *   ToggleRow    a boolean, with the switch pinned to the row's end edge
 *   Preview      the "render this option for real" wrapper (see below)
 *
 * `Preview` is the piece that makes the option strip honest. It nests a
 * SettingsContext whose value is `{ ...settings, ...patch }`, so an option chip
 * can render the ACTUAL primitive — a real Button, a real Input, a real
 * Checkbox — already wearing the style that chip offers. Nothing is redrawn by
 * hand, so a chip can never drift from what the setting really does.
 *
 * Hovering or focusing anything also aims the Stage (the persistent preview),
 * which shows the same thing full size. Choosing commits.
 */

import { useCallback, useMemo, useRef, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import {
  SettingsContext,
  useSettings,
  type Settings,
  type SettingsContextType,
} from "@core/settings";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { rowAnchorId, type SettingRowMeta } from "./settings-map";
import { useStage } from "./stage-context";

// ── Preview: render children as if `patch` were committed ─────────────────

export function Preview({
  patch,
  children,
  className,
}: {
  patch: Partial<Settings>;
  children: ReactNode;
  className?: string;
}) {
  const settings = useSettings();
  const value = useMemo(
    () => ({ ...settings, ...patch }) as SettingsContextType,
    [settings, patch]
  );
  return (
    <SettingsContext.Provider value={value}>
      {/* inert keeps the sample out of the tab order and off the a11y tree;
          pointer-events-none makes the chip itself the hit target, so a click
          anywhere on the sample still selects the option. */}
      <div inert className={cn("pointer-events-none select-none", className)}>
        {children}
      </div>
    </SettingsContext.Provider>
  );
}

// ── GroupPanel ────────────────────────────────────────────────────────────

export function GroupPanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0">
      <header className="pb-2">
        <h2 className="text-xl font-semibold tracking-tight text-nx-ink">{title}</h2>
        {description && <p className="mt-1.5 text-sm text-nx-ink-3">{description}</p>}
      </header>
      <div className="divide-y divide-nx-line">{children}</div>
    </section>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────

export function Row({
  row,
  children,
  aside,
}: {
  row: SettingRowMeta;
  children: ReactNode;
  /** Optional trailing control for rows whose whole answer is one input. */
  aside?: ReactNode;
}) {
  const { t } = useI18n();
  const { aimAt, release } = useStage();

  const title = row.titleKey ? t(row.titleKey) : (row.title ?? row.id);
  const description = row.descKey ? t(row.descKey) : row.description;

  return (
    <section
      id={rowAnchorId(row.id)}
      aria-labelledby={`${rowAnchorId(row.id)}-title`}
      className="scroll-mt-24 py-7 first:pt-1"
      onPointerEnter={() => aimAt(row.subject)}
      onPointerLeave={release}
      onFocus={() => aimAt(row.subject)}
      onBlur={release}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0 max-w-prose">
          <h3
            id={`${rowAnchorId(row.id)}-title`}
            className="text-[0.9375rem] font-medium leading-6 text-nx-ink"
          >
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-nx-ink-3">{description}</p>
          )}
        </div>
        {aside}
      </div>
      {children && <div className="mt-5">{children}</div>}
    </section>
  );
}

// ── Choice ────────────────────────────────────────────────────────────────

export interface ChoiceOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  /** The live sample shown inside the chip. */
  sample?: ReactNode;
  /**
   * What the Stage should render while this option is peeked. Defaults to
   * `{ [settingKey]: value }`; compound options (a palette applies four
   * fields at once) pass the whole slice.
   */
  patch?: Partial<Settings>;
}

type ChoiceDensity = "chip" | "tile" | "swatch";

const DENSITY_GRID: Record<ChoiceDensity, string> = {
  // Name (and line) only — for components too heavy or too contextual to
  // mount once per option. The Stage renders those for real instead.
  chip: "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4",
  // A live sample above its name — the default for component styles.
  tile: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
  // Dense colour/background grids.
  swatch: "grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8",
};

export function Choice<T extends string>({
  row,
  value,
  onSelect,
  options,
  settingKey,
  density = "tile",
  gridClassName,
}: {
  row: SettingRowMeta;
  value: T;
  onSelect: (value: T) => void;
  options: ChoiceOption<T>[];
  /** The field a bare option patches. Omit only when every option carries one. */
  settingKey?: keyof Settings;
  density?: ChoiceDensity;
  gridClassName?: string;
}) {
  const { t, direction } = useI18n();
  const { peek, release } = useStage();
  const groupRef = useRef<HTMLDivElement>(null);

  const patchFor = useCallback(
    (option: ChoiceOption<T>): Partial<Settings> => {
      if (option.patch) return option.patch;
      if (!settingKey) return {};
      // A computed key cannot be narrowed to a Settings field by inference;
      // the caller supplies both key and matching value type, so one localised
      // assertion here keeps every call site honest instead of each casting.
      return { [settingKey]: option.value } as unknown as Partial<Settings>;
    },
    [settingKey]
  );

  // Roving focus: one tab stop for the whole picker, arrows move inside it.
  // Arrow direction follows the writing direction so RTL reads correctly.
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    const forward = direction === "rtl" ? "ArrowLeft" : "ArrowRight";
    const backward = direction === "rtl" ? "ArrowRight" : "ArrowLeft";
    let next: number | null = null;

    if (event.key === forward || event.key === "ArrowDown") next = (index + 1) % options.length;
    else if (event.key === backward || event.key === "ArrowUp")
      next = (index - 1 + options.length) % options.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = options.length - 1;
    else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(options[index].value);
      return;
    }

    if (next === null) return;
    event.preventDefault();
    onSelect(options[next].value);
    const nodes = groupRef.current?.querySelectorAll<HTMLElement>('[role="radio"]');
    nodes?.[next]?.focus();
  };

  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={row.titleKey ? t(row.titleKey) : (row.title ?? row.id)}
      className={cn(DENSITY_GRID[density], gridClassName)}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <div
            key={option.value}
            role="radio"
            aria-checked={selected}
            aria-label={option.label}
            tabIndex={index === activeIndex ? 0 : -1}
            onClick={() => onSelect(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            onPointerEnter={() => peek(row.subject, patchFor(option))}
            onPointerLeave={release}
            // Focus bubbles, and the Row above also listens for it. Stopping
            // here keeps the option's peek from being overwritten by the row's
            // broader "just show this subject" aim a moment later.
            onFocus={(event) => {
              event.stopPropagation();
              peek(row.subject, patchFor(option));
            }}
            onBlur={(event) => {
              event.stopPropagation();
              release();
            }}
            className={cn(
              "group relative cursor-pointer overflow-hidden rounded-nx-md border p-3 text-start outline-none",
              "transition-[background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
              "focus-visible:shadow-nx-focus",
              selected
                ? "border-nx-line-hi bg-nx-accent-wash shadow-[inset_0_0_0_1px_var(--nx-accent)]"
                : "border-nx-line bg-nx-surface hover:border-nx-line-hi hover:bg-nx-hover"
            )}
          >
            {option.sample && (
              <div
                className={cn(
                  "flex min-h-9 items-center",
                  density === "swatch" ? "justify-center" : "justify-start"
                )}
              >
                {option.sample}
              </div>
            )}
            <div className={cn(option.sample && "mt-2.5", density === "swatch" && "text-center")}>
              <span
                className={cn(
                  "block truncate text-[0.8125rem] font-medium",
                  selected ? "text-nx-ink" : "text-nx-ink-2"
                )}
              >
                {option.label}
              </span>
              {option.description && density !== "swatch" && (
                <span className="mt-0.5 block text-[0.6875rem] leading-snug text-nx-ink-3">
                  {option.description}
                </span>
              )}
            </div>
            {selected && (
              <Check
                aria-hidden
                className="absolute top-2 h-3.5 w-3.5 text-nx-accent [inset-inline-end:0.5rem]"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── ToggleRow ─────────────────────────────────────────────────────────────

export function ToggleRow({
  row,
  checked,
  onCheckedChange,
}: {
  row: SettingRowMeta;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  const { t } = useI18n();
  const { aimAt, release } = useStage();
  const anchor = rowAnchorId(row.id);
  const title = row.titleKey ? t(row.titleKey) : (row.title ?? row.id);
  const description = row.descKey ? t(row.descKey) : row.description;

  return (
    <div
      id={anchor}
      className="flex scroll-mt-24 items-start justify-between gap-6 py-5 first:pt-1"
      onPointerEnter={() => aimAt(row.subject)}
      onPointerLeave={release}
      onFocus={() => aimAt(row.subject)}
      onBlur={release}
    >
      <div className="min-w-0 max-w-prose">
        <Label htmlFor={`${anchor}-switch`} className="text-[0.9375rem] font-medium text-nx-ink">
          {title}
        </Label>
        {description && <p className="mt-1 text-sm leading-relaxed text-nx-ink-3">{description}</p>}
      </div>
      <Switch id={`${anchor}-switch`} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

// ── Shared sample helpers ─────────────────────────────────────────────────

/** A tiny, quiet caption used inside Stage compositions. */
export function StageCaption({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-nx-ink-3">{children}</p>
  );
}
