// FILE-EXCEPTION: file length
/**
 * AccessibilityPanel v2 — Full accessibility settings + WCAG audit
 *
 * Two sections:
 * 1. Settings — Actionable controls persisted to the draft
 * 2. Audit — Real-time WCAG checker with auto-fix buttons
 *
 * @module customization/presentation/components
 */
"use client";
// UI-EXCEPTION: compact studio layout — native <button> used for pixel-precise
// compact controls (toggle switches, gradient pickers, layout thumbnails, etc.)
// where @core/ui/button's padding/sizing would break the layout.

import { useI18n } from "@core/providers/i18n-provider";

import { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Eye,
  Target,
  Layers,
  Zap,
  Focus,
  MonitorSpeaker,
  ScanEye,
  Paintbrush,
  Type,
  MousePointer2,
  ImageOff,
  Hand,
  ChevronDown,
  ChevronRight,
  Wand2,
} from "lucide-react";
import { cn } from "@/core/common/utils";
import { Switch } from "@core/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { ColorInput } from "./ColorInput";
import { SliderInput } from "./SliderInput";
import type { StudioDraftProps as StudioDraft } from "../../domain/entities/StudioDraft";
import {
  useAccessibilityChecker,
  type AccessibilityCheck,
  type CheckSeverity,
  type CheckCategory,
} from "../hooks/useAccessibilityChecker";

interface AccessibilityPanelProps {
  draft: StudioDraft;
  updateDraft: <K extends keyof StudioDraft>(field: K, value: StudioDraft[K]) => void;
  batchUpdateDraft: (updates: Partial<StudioDraft>) => void;
}

// ── Collapsible Section ───────────────────────────────

function Section({
  icon: Icon,
  title,
  subtitle,
  color,
  defaultOpen = true,
  children,
}: {
  icon: typeof Focus;
  title: string;
  subtitle?: string;
  color: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(defaultOpen);
  const Arrow = open ? ChevronDown : ChevronRight;

  return (
    <div className="rounded-xl border border-border bg-card/50">
      <button
        type="button"
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-muted/50"
        onClick={() => setOpen(!open)}
      >
        <Icon className={cn("h-4 w-4 shrink-0", color)} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground">{title}</p>
          {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
        </div>
        <Arrow className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      {open && <div className="space-y-3 border-t border-border px-3.5 py-3">{children}</div>}
    </div>
  );
}

// ── Setting Row ───────────────────────────────────────

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-[10px] leading-tight text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ── Severity Visuals ──────────────────────────────────

const SEVERITY_CONFIG: Record<
  CheckSeverity,
  { icon: typeof CheckCircle2; className: string; bgClass: string }
> = {
  pass: { icon: CheckCircle2, className: "text-emerald-500", bgClass: "bg-emerald-500/10" },
  warn: { icon: AlertTriangle, className: "text-amber-500", bgClass: "bg-amber-500/10" },
  fail: { icon: XCircle, className: "text-red-500", bgClass: "bg-red-500/10" },
  info: { icon: Info, className: "text-blue-500", bgClass: "bg-blue-500/10" },
};

const CATEGORY_CONFIG: Record<
  CheckCategory,
  { icon: typeof Eye; labelKey: string; color: string }
> = {
  contrast: { icon: Eye, labelKey: "studio.a11y.category.contrast", color: "text-violet-500" },
  target: { icon: Target, labelKey: "studio.a11y.category.target", color: "text-cyan-500" },
  overlay: { icon: Layers, labelKey: "studio.a11y.category.overlay", color: "text-amber-500" },
  motion: { icon: Zap, labelKey: "studio.a11y.category.motion", color: "text-blue-500" },
};

// ── Color Swatch ──────────────────────────────────────

function ColorSwatch({ color }: { color: string }) {
  const { t } = useI18n();
  return (
    <span
      className="inline-block h-4 w-4 shrink-0 rounded border border-border shadow-sm"
      style={{ backgroundColor: color }}
      title={color}
    />
  );
}

// ── Audit Check Item ──────────────────────────────────

function CheckItem({ check, onFix }: { check: AccessibilityCheck; onFix?: () => void }) {
  const { t } = useI18n();
  const severity = SEVERITY_CONFIG[check.severity];
  const Icon = severity.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-border/50 px-3 py-2.5 transition-colors",
        severity.bgClass
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", severity.className)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">{t(check.labelKey)}</span>
        </div>
        {check.details && (
          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{check.details}</p>
        )}
        {check.colorA && check.colorB && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <ColorSwatch color={check.colorA} />
            <span className="text-[10px] text-muted-foreground">on</span>
            <ColorSwatch color={check.colorB} />
          </div>
        )}
      </div>
      {check.autoFix && onFix && (
        <button
          type="button"
          className="mt-0.5 flex shrink-0 items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] font-medium text-foreground transition-colors hover:bg-muted"
          onClick={onFix}
          title={t("studio.a11y.autoFix")}
        >
          <Wand2 className="h-3 w-3" />
          {t("studio.a11y.fix")}
        </button>
      )}
    </div>
  );
}

// ── Category Section (Audit) ──────────────────────────

function CategorySection({
  category,
  checks,
  onFixCheck,
}: {
  category: CheckCategory;
  checks: AccessibilityCheck[];
  onFixCheck: (fix: Partial<StudioDraft>) => void;
}) {
  const { t } = useI18n();
  if (checks.length === 0) return null;

  const config = CATEGORY_CONFIG[category];
  const CatIcon = config.icon;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <CatIcon className={cn("h-4 w-4", config.color)} />
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t(config.labelKey)}
        </h3>
      </div>
      <div className="space-y-1.5">
        {checks.map((check) => (
          <CheckItem
            key={check.id}
            check={check}
            onFix={check.autoFix ? () => onFixCheck(check.autoFix!) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

// ── Summary Badge ─────────────────────────────────────

function SummaryBadge({
  count,
  severity,
  label,
}: {
  count: number;
  severity: CheckSeverity;
  label: string;
}) {
  const { t } = useI18n();
  const config = SEVERITY_CONFIG[severity];
  const Icon = config.icon;
  if (count === 0) return null;

  return (
    <div className={cn("flex items-center gap-1.5 rounded-full px-3 py-1", config.bgClass)}>
      <Icon className={cn("h-3.5 w-3.5", config.className)} />
      <span className={cn("text-xs font-semibold", config.className)}>
        {count} {label}
      </span>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────

/**
 * React presentation component representing the accessibility panel UI element.
 */
export function AccessibilityPanel({
  draft,
  updateDraft,
  batchUpdateDraft,
}: AccessibilityPanelProps) {
  const { t } = useI18n();
  const { summary, byCategory } = useAccessibilityChecker(draft);

  const scorePercent =
    summary.total > 0 ? Math.round(((summary.pass + summary.info) / summary.total) * 100) : 100;

  const scoreColor =
    summary.fail > 0 ? "text-red-500" : summary.warn > 0 ? "text-amber-500" : "text-emerald-500";

  const handleAutoFix = (fix: Partial<StudioDraft>) => {
    batchUpdateDraft(fix);
  };

  return (
    <div className="space-y-4">
      {/* ── Score Header ── */}
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-border"
            />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - scorePercent / 100)}`}
              strokeLinecap="round"
              className={scoreColor}
            />
          </svg>
          <span className={cn("absolute text-lg font-bold", scoreColor)}>{scorePercent}%</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <SummaryBadge
            count={summary.pass}
            severity="pass"
            label={t("studio.a11y.severity.pass")}
          />
          <SummaryBadge
            count={summary.warn}
            severity="warn"
            label={t("studio.a11y.severity.warn")}
          />
          <SummaryBadge
            count={summary.fail}
            severity="fail"
            label={t("studio.a11y.severity.fail")}
          />
          <SummaryBadge
            count={summary.info}
            severity="info"
            label={t("studio.a11y.severity.info")}
          />
        </div>
        <p className="text-center text-[10px] text-muted-foreground">
          {t("studio.a11y.summary.description")}
        </p>
      </div>

      {/* ── Accessibility Profiles (One-Click Presets) ── */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("studio.a11y.profiles.title")}
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            {
              key: "motor",
              emoji: "♿",
              labelKey: "studio.a11y.profiles.motor",
              updates: {
                a11yLargeTargets: true,
                a11yCursorSize: "large" as const,
                a11yFocusRingEnabled: true,
                a11yFocusRingWidth: 4,
                a11ySkipLinkEnabled: true,
              },
            },
            {
              key: "vision",
              emoji: "👁",
              labelKey: "studio.a11y.profiles.vision",
              updates: {
                a11yHighContrastMode: true,
                a11yMinFontSize: 20,
                a11yContentScaling: 150,
                a11yHighlightLinks: true,
              },
            },
            {
              key: "cognitive",
              emoji: "🧠",
              labelKey: "studio.a11y.profiles.cognitive",
              updates: {
                a11yReadingGuide: true,
                a11yPauseAnimations: true,
                a11yMinFontSize: 18,
                a11yLineHeight: 2,
                a11yReducedMotion: "always" as const,
              },
            },
            {
              key: "dyslexia",
              emoji: "📖",
              labelKey: "studio.a11y.profiles.dyslexia",
              updates: {
                a11yDyslexicFont: true,
                a11yLineHeight: 2,
                a11yLetterSpacing: 2,
                a11yWordSpacing: 4,
                a11yReadingGuide: true,
              },
            },
            {
              key: "seizure",
              emoji: "⚡",
              labelKey: "studio.a11y.profiles.seizure",
              updates: {
                a11yPauseAnimations: true,
                a11ySaturation: 0,
                a11yAutoplayDisabled: true,
                a11yReducedMotion: "always" as const,
              },
            },
            {
              key: "screenReader",
              emoji: "🔊",
              labelKey: "studio.a11y.profiles.screenReader",
              updates: {
                a11yAriaLandmarks: true,
                a11yFormLabelsVisible: true,
                a11yErrorAnnounce: true,
                a11ySkipLinkEnabled: true,
                a11yPageTitle: draft.companyName || "Login",
              },
            },
          ].map((profile) => (
            <button
              key={profile.key}
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-2 text-left transition-all hover:border-primary/40 hover:bg-muted active:scale-[0.97]"
              onClick={() => batchUpdateDraft(profile.updates)}
            >
              <span className="text-sm">{profile.emoji}</span>
              <span className="text-[10px] font-medium leading-tight text-foreground">
                {t(profile.labelKey)}
              </span>
            </button>
          ))}
          {/* Reset All */}
          <button
            key="reset"
            type="button"
            className="col-span-2 flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/5 px-2.5 py-2 text-left transition-all hover:border-red-500/50 hover:bg-red-500/10 active:scale-[0.97]"
            onClick={() =>
              batchUpdateDraft({
                a11yFocusRingEnabled: true,
                a11yFocusRingColor: "",
                a11yFocusRingWidth: 3,
                a11yFocusRingStyle: "solid",
                a11ySkipLinkEnabled: true,
                a11yHighlightFocus: false,
                a11yAriaLandmarks: true,
                a11yFormLabelsVisible: true,
                a11yErrorAnnounce: true,
                a11yPageTitle: "",
                a11yHighContrastMode: false,
                a11yContrastPreset: "normal" as const,
                a11ySaturation: 100,
                a11yHighlightLinks: false,
                a11yMinFontSize: 14,
                a11yContentScaling: 100,
                a11yLineHeight: 0,
                a11yLetterSpacing: 0,
                a11yWordSpacing: 0,
                a11yDyslexicFont: false,
                a11yTextAlign: "inherit" as const,
                a11yCursorSize: "default" as const,
                a11yReadingGuide: false,
                a11yReadingMask: false,
                a11yReducedMotion: "auto" as const,
                a11yAnimationDuration: 300,
                a11yAutoplayDisabled: false,
                a11yPauseAnimations: false,
                a11yHideImages: false,
                a11yTooltips: false,
                a11yLargeTargets: false,
                a11yForcedColorsSupport: true,
              })
            }
          >
            <span className="text-sm">↩</span>
            <span className="text-[10px] font-medium leading-tight text-red-500">
              {t("studio.a11y.profiles.resetAll")}
            </span>
          </button>
        </div>
      </div>

      {/* ── Settings Sections ── */}

      {/* 1. Focus & Keyboard */}
      <Section
        icon={Focus}
        title={t("studio.a11y.settings.focusKeyboard")}
        subtitle={t("studio.a11y.settings.focusKeyboardDesc")}
        color="text-cyan-500"
      >
        <SettingRow
          label={t("studio.a11y.settings.focusRing")}
          description={t("studio.a11y.settings.focusRingDesc")}
        >
          <Switch
            checked={draft.a11yFocusRingEnabled}
            onCheckedChange={(v) => updateDraft("a11yFocusRingEnabled", v)}
          />
        </SettingRow>
        {draft.a11yFocusRingEnabled && (
          <>
            <ColorInput
              label={t("studio.a11y.settings.focusRingColor")}
              value={draft.a11yFocusRingColor || draft.primaryColor}
              onChange={(v) => updateDraft("a11yFocusRingColor", v)}
            />
            <SliderInput
              label={t("studio.a11y.settings.focusRingWidth")}
              value={draft.a11yFocusRingWidth}
              min={1}
              max={5}
              step={1}
              onChange={(v) => updateDraft("a11yFocusRingWidth", v)}
            />
            <SettingRow label={t("studio.a11y.settings.focusRingStyle")}>
              <Select
                value={draft.a11yFocusRingStyle}
                onValueChange={(v) =>
                  updateDraft("a11yFocusRingStyle", v as "solid" | "dashed" | "double")
                }
              >
                <SelectTrigger className="h-7 w-24 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">{t("studio.a11y.settings.focusRingSolid")}</SelectItem>
                  <SelectItem value="dashed">
                    {t("studio.a11y.settings.focusRingDashed")}
                  </SelectItem>
                  <SelectItem value="double">
                    {t("studio.a11y.settings.focusRingDouble")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
          </>
        )}
        <SettingRow
          label={t("studio.a11y.settings.skipLink")}
          description={t("studio.a11y.settings.skipLinkDesc")}
        >
          <Switch
            checked={draft.a11ySkipLinkEnabled}
            onCheckedChange={(v) => updateDraft("a11ySkipLinkEnabled", v)}
          />
        </SettingRow>
        <SettingRow
          label={t("studio.a11y.settings.highlightFocus")}
          description={t("studio.a11y.settings.highlightFocusDesc")}
        >
          <Switch
            checked={draft.a11yHighlightFocus}
            onCheckedChange={(v) => updateDraft("a11yHighlightFocus", v)}
          />
        </SettingRow>
      </Section>

      {/* 2. Screen Reader */}
      <Section
        icon={MonitorSpeaker}
        title={t("studio.a11y.settings.screenReader")}
        subtitle={t("studio.a11y.settings.screenReaderDesc")}
        color="text-violet-500"
      >
        <SettingRow
          label={t("studio.a11y.settings.ariaLandmarks")}
          description={t("studio.a11y.settings.ariaLandmarksDesc")}
        >
          <Switch
            checked={draft.a11yAriaLandmarks}
            onCheckedChange={(v) => updateDraft("a11yAriaLandmarks", v)}
          />
        </SettingRow>
        <SettingRow
          label={t("studio.a11y.settings.formLabels")}
          description={t("studio.a11y.settings.formLabelsDesc")}
        >
          <Switch
            checked={draft.a11yFormLabelsVisible}
            onCheckedChange={(v) => updateDraft("a11yFormLabelsVisible", v)}
          />
        </SettingRow>
        <SettingRow
          label={t("studio.a11y.settings.errorAnnounce")}
          description={t("studio.a11y.settings.errorAnnounceDesc")}
        >
          <Switch
            checked={draft.a11yErrorAnnounce}
            onCheckedChange={(v) => updateDraft("a11yErrorAnnounce", v)}
          />
        </SettingRow>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("studio.a11y.settings.pageTitle")}
          </label>
          <input
            type="text"
            value={draft.a11yPageTitle}
            onChange={(e) => updateDraft("a11yPageTitle", e.target.value)}
            className="h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground outline-none transition-colors focus:border-primary"
            placeholder={t("studio.a11y.settings.pageTitlePlaceholder")}
          />
          <p className="text-[10px] text-muted-foreground">
            {t("studio.a11y.settings.pageTitleDesc")}
          </p>
        </div>
      </Section>

      {/* 3. Contrast & Colors */}
      <Section
        icon={Paintbrush}
        title={t("studio.a11y.settings.contrastColors")}
        subtitle={t("studio.a11y.settings.contrastColorsDesc")}
        color="text-amber-500"
      >
        <SettingRow
          label={t("studio.a11y.settings.highContrast")}
          description={t("studio.a11y.settings.highContrastDesc")}
        >
          <Switch
            checked={draft.a11yHighContrastMode}
            onCheckedChange={(v) => updateDraft("a11yHighContrastMode", v)}
          />
        </SettingRow>
        <SettingRow
          label={t("studio.a11y.settings.contrastPreset")}
          description={t("studio.a11y.settings.contrastPresetDesc")}
        >
          <Select
            value={draft.a11yContrastPreset}
            onValueChange={(v) => updateDraft("a11yContrastPreset", v as any)}
          >
            <SelectTrigger className="h-7 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">{t("studio.a11y.settings.presetNormal")}</SelectItem>
              <SelectItem value="dark">{t("studio.a11y.settings.presetDark")}</SelectItem>
              <SelectItem value="light">{t("studio.a11y.settings.presetLight")}</SelectItem>
              <SelectItem value="inverted">{t("studio.a11y.settings.presetInverted")}</SelectItem>
              <SelectItem value="monochrome">
                {t("studio.a11y.settings.presetMonochrome")}
              </SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SliderInput
          label={t("studio.a11y.settings.saturation")}
          value={draft.a11ySaturation}
          min={0}
          max={200}
          step={10}
          unit="%"
          onChange={(v) => updateDraft("a11ySaturation", v)}
        />
        <SettingRow
          label={t("studio.a11y.settings.highlightLinks")}
          description={t("studio.a11y.settings.highlightLinksDesc")}
        >
          <Switch
            checked={draft.a11yHighlightLinks}
            onCheckedChange={(v) => updateDraft("a11yHighlightLinks", v)}
          />
        </SettingRow>
      </Section>

      {/* 4. Typography & Readability */}
      <Section
        icon={Type}
        title={t("studio.a11y.settings.typography")}
        subtitle={t("studio.a11y.settings.typographyDesc")}
        color="text-pink-500"
      >
        <SliderInput
          label={t("studio.a11y.settings.minFontSize")}
          value={draft.a11yMinFontSize}
          min={12}
          max={24}
          step={1}
          unit="px"
          onChange={(v) => updateDraft("a11yMinFontSize", v)}
        />
        <SliderInput
          label={t("studio.a11y.settings.contentScaling")}
          value={draft.a11yContentScaling}
          min={100}
          max={200}
          step={10}
          unit="%"
          onChange={(v) => updateDraft("a11yContentScaling", v)}
        />
        <SliderInput
          label={t("studio.a11y.settings.lineHeight")}
          value={draft.a11yLineHeight}
          min={0}
          max={3}
          step={0.25}
          unit="×"
          onChange={(v) => updateDraft("a11yLineHeight", v)}
        />
        <SliderInput
          label={t("studio.a11y.settings.letterSpacing")}
          value={draft.a11yLetterSpacing}
          min={0}
          max={5}
          step={0.5}
          unit="px"
          onChange={(v) => updateDraft("a11yLetterSpacing", v)}
        />
        <SliderInput
          label={t("studio.a11y.settings.wordSpacing")}
          value={draft.a11yWordSpacing}
          min={0}
          max={10}
          step={1}
          unit="px"
          onChange={(v) => updateDraft("a11yWordSpacing", v)}
        />
        <SettingRow
          label={t("studio.a11y.settings.dyslexicFont")}
          description={t("studio.a11y.settings.dyslexicFontDesc")}
        >
          <Switch
            checked={draft.a11yDyslexicFont}
            onCheckedChange={(v) => updateDraft("a11yDyslexicFont", v)}
          />
        </SettingRow>
        <SettingRow
          label={t("studio.a11y.settings.textAlign")}
          description={t("studio.a11y.settings.textAlignDesc")}
        >
          <Select
            value={draft.a11yTextAlign}
            onValueChange={(v) => updateDraft("a11yTextAlign", v as any)}
          >
            <SelectTrigger className="h-7 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inherit">{t("studio.a11y.settings.alignInherit")}</SelectItem>
              <SelectItem value="left">{t("studio.a11y.settings.alignLeft")}</SelectItem>
              <SelectItem value="center">{t("studio.a11y.settings.alignCenter")}</SelectItem>
              <SelectItem value="right">{t("studio.a11y.settings.alignRight")}</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
      </Section>

      {/* 5. Cursor & Reading Aids */}
      <Section
        icon={MousePointer2}
        title={t("studio.a11y.settings.cursorReading")}
        subtitle={t("studio.a11y.settings.cursorReadingDesc")}
        color="text-teal-500"
        defaultOpen={false}
      >
        <SettingRow
          label={t("studio.a11y.settings.cursorSize")}
          description={t("studio.a11y.settings.cursorSizeDesc")}
        >
          <Select
            value={draft.a11yCursorSize}
            onValueChange={(v) => updateDraft("a11yCursorSize", v as any)}
          >
            <SelectTrigger className="h-7 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">{t("studio.a11y.settings.cursorDefault")}</SelectItem>
              <SelectItem value="large">{t("studio.a11y.settings.cursorLarge")}</SelectItem>
              <SelectItem value="xlarge">{t("studio.a11y.settings.cursorXLarge")}</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow
          label={t("studio.a11y.settings.readingGuide")}
          description={t("studio.a11y.settings.readingGuideDesc")}
        >
          <Switch
            checked={draft.a11yReadingGuide}
            onCheckedChange={(v) => updateDraft("a11yReadingGuide", v)}
          />
        </SettingRow>
        <SettingRow
          label={t("studio.a11y.settings.readingMask")}
          description={t("studio.a11y.settings.readingMaskDesc")}
        >
          <Switch
            checked={draft.a11yReadingMask}
            onCheckedChange={(v) => updateDraft("a11yReadingMask", v)}
          />
        </SettingRow>
      </Section>

      {/* 6. Motion & Animation */}
      <Section
        icon={Zap}
        title={t("studio.a11y.settings.motion")}
        subtitle={t("studio.a11y.settings.motionDesc")}
        color="text-blue-500"
        defaultOpen={false}
      >
        <SettingRow label={t("studio.a11y.settings.reducedMotion")}>
          <Select
            value={draft.a11yReducedMotion}
            onValueChange={(v) =>
              updateDraft("a11yReducedMotion", v as "auto" | "always" | "never")
            }
          >
            <SelectTrigger className="h-7 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">{t("studio.a11y.settings.motionAuto")}</SelectItem>
              <SelectItem value="always">{t("studio.a11y.settings.motionAlways")}</SelectItem>
              <SelectItem value="never">{t("studio.a11y.settings.motionNever")}</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SliderInput
          label={t("studio.a11y.settings.animationDuration")}
          value={draft.a11yAnimationDuration}
          min={0}
          max={1000}
          step={50}
          unit="ms"
          onChange={(v) => updateDraft("a11yAnimationDuration", v)}
        />
        <SettingRow
          label={t("studio.a11y.settings.autoplay")}
          description={t("studio.a11y.settings.autoplayDesc")}
        >
          <Switch
            checked={draft.a11yAutoplayDisabled}
            onCheckedChange={(v) => updateDraft("a11yAutoplayDisabled", v)}
          />
        </SettingRow>
        <SettingRow
          label={t("studio.a11y.settings.pauseAnimations")}
          description={t("studio.a11y.settings.pauseAnimationsDesc")}
        >
          <Switch
            checked={draft.a11yPauseAnimations}
            onCheckedChange={(v) => updateDraft("a11yPauseAnimations", v)}
          />
        </SettingRow>
      </Section>

      {/* 7. Content & Media */}
      <Section
        icon={ImageOff}
        title={t("studio.a11y.settings.contentMedia")}
        subtitle={t("studio.a11y.settings.contentMediaDesc")}
        color="text-orange-500"
        defaultOpen={false}
      >
        <SettingRow
          label={t("studio.a11y.settings.hideImages")}
          description={t("studio.a11y.settings.hideImagesDesc")}
        >
          <Switch
            checked={draft.a11yHideImages}
            onCheckedChange={(v) => updateDraft("a11yHideImages", v)}
          />
        </SettingRow>
        <SettingRow
          label={t("studio.a11y.settings.tooltips")}
          description={t("studio.a11y.settings.tooltipsDesc")}
        >
          <Switch
            checked={draft.a11yTooltips}
            onCheckedChange={(v) => updateDraft("a11yTooltips", v)}
          />
        </SettingRow>
      </Section>

      {/* 8. Touch & Target Size */}
      <Section
        icon={Hand}
        title={t("studio.a11y.settings.touchTargets")}
        subtitle={t("studio.a11y.settings.touchTargetsDesc")}
        color="text-rose-500"
        defaultOpen={false}
      >
        <SettingRow
          label={t("studio.a11y.settings.largeTargets")}
          description={t("studio.a11y.settings.largeTargetsDesc")}
        >
          <Switch
            checked={draft.a11yLargeTargets}
            onCheckedChange={(v) => updateDraft("a11yLargeTargets", v)}
          />
        </SettingRow>
        <SettingRow
          label={t("studio.a11y.settings.forcedColors")}
          description={t("studio.a11y.settings.forcedColorsDesc")}
        >
          <Switch
            checked={draft.a11yForcedColorsSupport}
            onCheckedChange={(v) => updateDraft("a11yForcedColorsSupport", v)}
          />
        </SettingRow>
      </Section>

      {/* ── WCAG Audit Section ── */}
      <Section
        icon={ScanEye}
        title={t("studio.a11y.audit.title")}
        subtitle={t("studio.a11y.audit.subtitle")}
        color="text-emerald-500"
      >
        {(["contrast", "target", "overlay", "motion"] as CheckCategory[]).map((category) => (
          <CategorySection
            key={category}
            category={category}
            checks={byCategory[category]}
            onFixCheck={handleAutoFix}
          />
        ))}
      </Section>
    </div>
  );
}
