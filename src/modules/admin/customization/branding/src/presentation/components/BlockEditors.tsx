// FILE-EXCEPTION: file length
"use client";
// UI-EXCEPTION: compact studio layout — native <button> used for pixel-precise
// compact controls (toggle switches, gradient pickers, layout thumbnails, etc.)
// where @core/ui/button's padding/sizing would break the layout. The bare
// <input type="color"> swatch reuses ColorInput's own token recipe (see that
// file's UI-EXCEPTION note) but drops its paired hex field to fit these dense
// multi-field grids; the Field label above still names the control via aria-label.
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Switch } from "@core/ui/switch";
import { SliderInput } from "./SliderInput";
import {
  Plus,
  X,
  Eye,
  EyeOff,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  ArrowDownRight,
  Star,
  Heart,
  Hash,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { ContentBlock } from "@core/domain/entities/LoginBrandingTypes";
import { isValidCtaUrl, isValidVideoUrl } from "@core/domain/entities/LoginBrandingTypes";

type CB = ContentBlock;
type P = { block: CB; onChange: (b: CB) => void };

// ─── Helpers ──────────────────────────────────────────
function Lbl({ k }: { k: string }) {
  const { t } = useI18n();
  return <label className="text-[10px] text-nx-ink-3">{t(k)}</label>;
}
function Field({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <Lbl k={k} />
      {children}
    </div>
  );
}
function Sel({
  value,
  onValueChange,
  items,
}: {
  value: string;
  onValueChange: (v: string) => void;
  items: { v: string; l: React.ReactNode }[];
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-7 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((i) => (
          <SelectItem key={i.v} value={i.v}>
            {i.l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
// Compact colour swatch — same token recipe as ColorInput, no paired hex field
// (the Field wrapper's label above already names the control visually; this
// carries the accessible name since a bare colour swatch has no text content).
function Swatch({
  ariaLabel,
  value,
  onChange,
}: {
  ariaLabel: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="color"
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-7 w-full cursor-pointer rounded-nx-control border border-nx-line bg-transparent p-0.5 transition-colors duration-nx-micro ease-nx-enter hover:border-nx-line-hi focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-nx-sm [&::-webkit-color-swatch]:border-0"
    />
  );
}
// Icon + localized text combo for select items that used to be a bare direction glyph.
function OptIcon({ icon: Icon, children }: { icon: typeof AlignLeft; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="h-3 w-3" aria-hidden="true" />
      {children}
    </span>
  );
}

// ─── Base Props Editor (every block) ──────────────────
/**
 * Presentation UI component rendering the base props editor.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function BasePropsEditor({ block, onChange }: P) {
  const { t } = useI18n();
  const p = block.props;
  const upd = (patch: Record<string, unknown>) =>
    onChange({ ...block, props: { ...p, ...patch } } as CB);
  const isHidden = p.visible === false;
  return (
    <div className="mt-2 space-y-1.5 border-t border-dashed border-nx-line pt-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-nx-ink-3">{t("studio.block.visibility")}</span>
        <button
          type="button"
          onClick={() => upd({ visible: isHidden ? true : false })}
          aria-label={t(isHidden ? "studio.block.opt.showBlock" : "studio.block.opt.hideBlock")}
          className="rounded-nx-sm p-0.5 transition-colors duration-nx-micro ease-nx-enter focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
        >
          {isHidden ? (
            <EyeOff className="h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
          ) : (
            <Eye className="h-3.5 w-3.5 text-nx-accent" aria-hidden="true" />
          )}
        </button>
      </div>
      <Field k="studio.block.animationType">
        <Sel
          value={p.animation || "none"}
          onValueChange={(v) => upd({ animation: v })}
          items={[
            { v: "none", l: t("studio.block.animNone") },
            { v: "fade-in", l: t("studio.block.animFade") },
            { v: "slide-up", l: t("studio.block.animSlideUp") },
            { v: "slide-left", l: t("studio.block.animSlideLeft") },
            { v: "slide-right", l: t("studio.block.animSlideRight") },
            { v: "scale-in", l: t("studio.block.animScale") },
            { v: "bounce", l: t("studio.block.animBounce") },
          ]}
        />
      </Field>
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.blockPadding">
          <Sel
            value={p.padding || "none"}
            onValueChange={(v) => upd({ padding: v })}
            items={[
              { v: "none", l: t("studio.block.opt.dash") },
              { v: "sm", l: t("studio.block.opt.sizeS") },
              { v: "md", l: t("studio.block.opt.sizeM") },
              { v: "lg", l: t("studio.block.opt.sizeL") },
            ]}
          />
        </Field>
        <Field k="studio.block.blockMargin">
          <Sel
            value={p.marginBottom || "none"}
            onValueChange={(v) => upd({ marginBottom: v })}
            items={[
              { v: "none", l: t("studio.block.opt.dash") },
              { v: "sm", l: t("studio.block.opt.sizeS") },
              { v: "md", l: t("studio.block.opt.sizeM") },
              { v: "lg", l: t("studio.block.opt.sizeL") },
            ]}
          />
        </Field>
      </div>
    </div>
  );
}

// ─── Text Editor ──────────────────────────────────────
/**
 * Presentation UI component rendering the text editor.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TextEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "text") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) =>
    onChange({ type: "text", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      <Textarea
        value={p.content}
        onChange={(e) => upd({ content: e.target.value.slice(0, 500) })}
        rows={3}
        className="resize-y text-xs"
        placeholder={t("studio.block.textPlaceholder")}
      />
      <p className={`text-[10px] ${p.content.length > 500 ? "text-destructive" : "text-nx-ink-3"}`}>
        {p.content.length}/500
      </p>
      <div className="grid grid-cols-3 gap-1">
        <Field k="studio.block.alignment">
          <Sel
            value={p.alignment || "left"}
            onValueChange={(v) => upd({ alignment: v })}
            items={[
              {
                v: "left",
                l: <OptIcon icon={AlignLeft}>{t("studio.block.opt.alignLeft")}</OptIcon>,
              },
              {
                v: "center",
                l: <OptIcon icon={AlignCenter}>{t("studio.block.opt.alignCenter")}</OptIcon>,
              },
              {
                v: "right",
                l: <OptIcon icon={AlignRight}>{t("studio.block.opt.alignRight")}</OptIcon>,
              },
            ]}
          />
        </Field>
        <Field k="studio.block.fontSize">
          <Sel
            value={p.fontSize || "base"}
            onValueChange={(v) => upd({ fontSize: v })}
            items={[
              { v: "sm", l: t("studio.block.opt.sizeS") },
              { v: "base", l: t("studio.block.opt.sizeM") },
              { v: "lg", l: t("studio.block.opt.sizeL") },
              { v: "xl", l: t("studio.block.opt.sizeXl") },
              { v: "2xl", l: t("studio.block.opt.size2xl") },
            ]}
          />
        </Field>
        <Field k="studio.block.fontWeight">
          <Sel
            value={p.fontWeight || "normal"}
            onValueChange={(v) => upd({ fontWeight: v })}
            items={[
              { v: "normal", l: t("studio.block.opt.weightNormal") },
              { v: "medium", l: t("studio.block.opt.weightMedium") },
              { v: "semibold", l: t("studio.block.opt.weightSemibold") },
              { v: "bold", l: t("studio.block.opt.weightBold") },
            ]}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.textColor">
          <Swatch
            ariaLabel={t("studio.block.textColor")}
            value={p.color && !["auto", "primary", "muted"].includes(p.color) ? p.color : "#666666"}
            onChange={(v) => upd({ color: v })}
          />
        </Field>
        <Field k="studio.block.textTransform">
          <Sel
            value={p.textTransform || "none"}
            onValueChange={(v) => upd({ textTransform: v })}
            items={[
              { v: "none", l: t("studio.block.opt.dash") },
              { v: "uppercase", l: t("studio.block.opt.transformUppercase") },
              { v: "capitalize", l: t("studio.block.opt.transformCapitalize") },
            ]}
          />
        </Field>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={!!p.highlight} onCheckedChange={(v) => upd({ highlight: v })} />
        <span className="text-[10px] text-nx-ink-3">{t("studio.block.highlight")}</span>
      </div>
    </div>
  );
}

// ─── Image Editor ─────────────────────────────────────
/**
 * Presentation UI component rendering the image editor.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function ImageEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "image") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) =>
    onChange({ type: "image", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      <Field k="studio.block.imageUrl">
        <Input
          value={p.src}
          onChange={(e) => upd({ src: e.target.value })}
          className="h-7 text-xs"
          placeholder="https://..."
        />
      </Field>
      <Field k="studio.block.imageAlt">
        <Input
          value={p.alt}
          onChange={(e) => upd({ alt: e.target.value })}
          className="h-7 text-xs"
        />
      </Field>
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.borderRadius">
          <Input
            type="number"
            min={0}
            max={32}
            value={p.borderRadius ?? 12}
            onChange={(e) => upd({ borderRadius: +e.target.value })}
            className="h-7 text-xs"
          />
        </Field>
        <Field k="studio.block.maxHeight">
          <Input
            type="number"
            min={50}
            max={800}
            value={p.maxHeight ?? ""}
            onChange={(e) => upd({ maxHeight: e.target.value ? +e.target.value : undefined })}
            className="h-7 text-xs"
            placeholder="px"
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.objectFit">
          <Sel
            value={p.objectFit || "cover"}
            onValueChange={(v) => upd({ objectFit: v })}
            items={[
              { v: "cover", l: t("studio.background.fitCover") },
              { v: "contain", l: t("studio.background.fitContain") },
              { v: "fill", l: t("studio.background.fitFill") },
              { v: "none", l: t("studio.background.fitNone") },
            ]}
          />
        </Field>
        <Field k="studio.block.shadow">
          <Sel
            value={p.shadow || "none"}
            onValueChange={(v) => upd({ shadow: v })}
            items={[
              { v: "none", l: t("studio.block.opt.dash") },
              { v: "sm", l: t("studio.block.opt.sizeS") },
              { v: "md", l: t("studio.block.opt.sizeM") },
              { v: "lg", l: t("studio.block.opt.sizeL") },
              { v: "xl", l: t("studio.block.opt.sizeXl") },
            ]}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.hoverEffect">
          <Sel
            value={p.hoverEffect || "none"}
            onValueChange={(v) => upd({ hoverEffect: v })}
            items={[
              { v: "none", l: t("studio.block.opt.dash") },
              { v: "zoom", l: t("studio.block.opt.hoverZoom") },
              { v: "brightness", l: t("studio.block.opt.hoverBrightness") },
              { v: "grayscale", l: t("studio.block.opt.hoverGrayscale") },
            ]}
          />
        </Field>
        <Field k="studio.block.aspectRatio">
          <Sel
            value={p.aspectRatio || "auto"}
            onValueChange={(v) => upd({ aspectRatio: v })}
            items={[
              { v: "auto", l: t("studio.block.opt.aspectAuto") },
              { v: "1:1", l: "1:1" },
              { v: "16:9", l: "16:9" },
              { v: "4:3", l: "4:3" },
            ]}
          />
        </Field>
      </div>
      <Field k="studio.block.linkUrl">
        <Input
          value={p.linkUrl || ""}
          onChange={(e) => upd({ linkUrl: e.target.value })}
          className="h-7 text-xs"
          placeholder="https://..."
        />
      </Field>
      <Field k="studio.block.caption">
        <Input
          value={p.caption || ""}
          onChange={(e) => upd({ caption: e.target.value })}
          className="h-7 text-xs"
        />
      </Field>
    </div>
  );
}

// ─── Feature List Editor ──────────────────────────────
/**
 * Presentation UI component rendering the feature list editor.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function FeatureListEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "featureList") return null;
  const p = block.props;
  const items = p.items;
  const upd = (patch: Record<string, unknown>) =>
    onChange({ type: "featureList", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-1">
          <Input
            value={item.icon}
            onChange={(e) => {
              const u = [...items];
              u[i] = { ...u[i], icon: e.target.value };
              upd({ items: u });
            }}
            className="h-7 w-10 px-0 text-center text-xs"
            placeholder={t("studio.block.opt.iconPlaceholderSecurity")}
          />
          <div className="flex-1 space-y-0.5">
            <Input
              value={item.title}
              onChange={(e) => {
                const u = [...items];
                u[i] = { ...u[i], title: e.target.value };
                upd({ items: u });
              }}
              className="h-7 text-xs"
              placeholder={t("studio.block.featureTitle")}
            />
            <Input
              value={item.description}
              onChange={(e) => {
                const u = [...items];
                u[i] = { ...u[i], description: e.target.value };
                upd({ items: u });
              }}
              className="h-7 text-xs"
              placeholder={t("studio.block.featureDesc")}
            />
          </div>
          <button
            type="button"
            onClick={() => upd({ items: items.filter((_, j) => j !== i) })}
            aria-label={t("studio.blocks.remove")}
            className="mt-1 rounded-nx-sm p-0.5 text-destructive/70 transition-colors duration-nx-micro ease-nx-enter hover:text-destructive focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      ))}
      {items.length < 6 && (
        <button
          type="button"
          onClick={() =>
            upd({
              items: [
                ...items,
                { icon: t("studio.block.opt.iconPlaceholderSparkle"), title: "", description: "" },
              ],
            })
          }
          className="flex items-center gap-1 text-[10px] text-nx-accent transition-colors duration-nx-micro ease-nx-enter hover:underline focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
          {t("studio.block.addFeature")}
        </button>
      )}
      <div className="grid grid-cols-3 gap-1">
        <Field k="studio.block.columns">
          <Sel
            value={String(p.columns || 1)}
            onValueChange={(v) => upd({ columns: +v })}
            items={[
              { v: "1", l: "1" },
              { v: "2", l: "2" },
              { v: "3", l: "3" },
            ]}
          />
        </Field>
        <Field k="studio.block.iconSize">
          <Sel
            value={p.iconSize || "md"}
            onValueChange={(v) => upd({ iconSize: v })}
            items={[
              { v: "sm", l: t("studio.block.opt.sizeS") },
              { v: "md", l: t("studio.block.opt.sizeM") },
              { v: "lg", l: t("studio.block.opt.sizeL") },
            ]}
          />
        </Field>
        <Field k="studio.block.iconColor">
          <Swatch
            ariaLabel={t("studio.block.iconColor")}
            value={p.iconColor || "#6366f1"}
            onChange={(v) => upd({ iconColor: v })}
          />
        </Field>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Switch checked={!!p.compactMode} onCheckedChange={(v) => upd({ compactMode: v })} />
          <span className="text-[10px] text-nx-ink-3">{t("studio.block.compact")}</span>
        </div>
        <div className="flex items-center gap-1">
          <Switch checked={!!p.numberedMode} onCheckedChange={(v) => upd({ numberedMode: v })} />
          <span className="text-[10px] text-nx-ink-3">{t("studio.block.numbered")}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Testimonial Editor ───────────────────────────────
/**
 * Presentation UI component rendering the testimonial editor.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TestimonialEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "testimonial") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) =>
    onChange({ type: "testimonial", props: { ...p, ...patch } });
  const starItems = [0, 1, 2, 3, 4, 5].map((n) => ({
    v: String(n),
    l:
      n === 0 ? (
        t("studio.block.opt.dash")
      ) : (
        <span className="inline-flex items-center gap-1">
          {Array.from({ length: n }).map((_, idx) => (
            <Star key={idx} className="h-3 w-3 fill-current" aria-hidden="true" />
          ))}
          <span className="sr-only">{t("studio.block.opt.starsAria", { count: n })}</span>
        </span>
      ),
  }));
  return (
    <div className="space-y-1.5">
      <Field k="studio.block.quote">
        <Textarea
          value={p.quote}
          onChange={(e) => upd({ quote: e.target.value })}
          rows={2}
          className="resize-y text-xs"
        />
      </Field>
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.author">
          <Input
            value={p.author}
            onChange={(e) => upd({ author: e.target.value })}
            className="h-7 text-xs"
          />
        </Field>
        <Field k="studio.block.role">
          <Input
            value={p.role || ""}
            onChange={(e) => upd({ role: e.target.value })}
            className="h-7 text-xs"
          />
        </Field>
      </div>
      <Field k="studio.block.avatarUrl">
        <Input
          value={p.avatar || ""}
          onChange={(e) => upd({ avatar: e.target.value })}
          className="h-7 text-xs"
          placeholder="https://..."
        />
      </Field>
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.displayStyle">
          <Sel
            value={p.displayStyle || "card"}
            onValueChange={(v) => upd({ displayStyle: v })}
            items={[
              { v: "card", l: t("studio.block.opt.styleCard") },
              { v: "bubble", l: t("studio.block.opt.styleBubble") },
              { v: "minimal", l: t("studio.block.opt.styleMinimal") },
              { v: "large-quote", l: t("studio.block.opt.styleLarge") },
            ]}
          />
        </Field>
        <Field k="studio.block.ratingStars">
          <Sel
            value={String(p.rating ?? 0)}
            onValueChange={(v) => upd({ rating: +v })}
            items={starItems}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.companyName">
          <Input
            value={p.companyName || ""}
            onChange={(e) => upd({ companyName: e.target.value })}
            className="h-7 text-xs"
          />
        </Field>
        <Field k="studio.block.borderColor">
          <Swatch
            ariaLabel={t("studio.block.borderColor")}
            value={p.borderColor || "#e5e7eb"}
            onChange={(v) => upd({ borderColor: v })}
          />
        </Field>
      </div>
    </div>
  );
}

// ─── CTA Button Editor ────────────────────────────────
/**
 * Presentation UI component rendering the cta editor.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function CtaEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "ctaButton") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) =>
    onChange({ type: "ctaButton", props: { ...p, ...patch } });
  const isUrlValid = !p.url || isValidCtaUrl(p.url);
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.ctaLabel">
          <Input
            value={p.label}
            onChange={(e) => upd({ label: e.target.value })}
            className="h-7 text-xs"
          />
        </Field>
        <Field k="studio.block.icon">
          <Input
            value={p.icon || ""}
            onChange={(e) => upd({ icon: e.target.value })}
            className="h-7 text-xs"
            placeholder={t("studio.block.opt.iconPlaceholderRocket")}
          />
        </Field>
      </div>
      <Field k="studio.block.ctaUrl">
        <Input
          value={p.url}
          onChange={(e) => upd({ url: e.target.value })}
          className={`h-7 text-xs ${!isUrlValid ? "border-destructive" : ""}`}
          placeholder="https://..."
        />
      </Field>
      {!isUrlValid && (
        <p className="text-[9px] text-destructive">{t("studio.block.ctaUrlInvalid")}</p>
      )}
      <div className="grid grid-cols-3 gap-1">
        <Field k="studio.block.ctaVariant">
          <Sel
            value={p.variant || "default"}
            onValueChange={(v) => upd({ variant: v })}
            items={[
              { v: "default", l: t("studio.block.variantDefault") },
              { v: "outline", l: t("studio.block.variantOutline") },
              { v: "ghost", l: t("studio.block.variantGhost") },
            ]}
          />
        </Field>
        <Field k="studio.block.size">
          <Sel
            value={p.size || "md"}
            onValueChange={(v) => upd({ size: v })}
            items={[
              { v: "sm", l: t("studio.block.opt.sizeS") },
              { v: "md", l: t("studio.block.opt.sizeM") },
              { v: "lg", l: t("studio.block.opt.sizeL") },
              { v: "xl", l: t("studio.block.opt.sizeXl") },
            ]}
          />
        </Field>
        <Field k="studio.block.btnColor">
          <Swatch
            ariaLabel={t("studio.block.btnColor")}
            value={p.color || "#6366f1"}
            onChange={(v) => upd({ color: v })}
          />
        </Field>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Switch checked={!!p.fullWidth} onCheckedChange={(v) => upd({ fullWidth: v })} />
          <span className="text-[10px] text-nx-ink-3">{t("studio.block.fullWidth")}</span>
        </div>
        <div className="flex items-center gap-1">
          <Switch checked={!!p.shadow} onCheckedChange={(v) => upd({ shadow: v })} />
          <span className="text-[10px] text-nx-ink-3">{t("studio.block.shadow")}</span>
        </div>
      </div>
      <Field k="studio.block.secondaryText">
        <Input
          value={p.secondaryText || ""}
          onChange={(e) => upd({ secondaryText: e.target.value })}
          className="h-7 text-xs"
        />
      </Field>
    </div>
  );
}

// ─── Divider Editor ───────────────────────────────────
/**
 * Presentation UI component rendering the divider editor.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function DividerEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "divider") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) =>
    onChange({ type: "divider", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.dividerStyle">
          <Sel
            value={p.style || "line"}
            onValueChange={(v) => upd({ style: v })}
            items={[
              { v: "line", l: t("studio.block.styleLine") },
              { v: "space", l: t("studio.block.styleSpace") },
              { v: "dots", l: t("studio.block.styleDots") },
            ]}
          />
        </Field>
        <Field k="studio.block.lineStyle">
          <Sel
            value={p.lineStyle || "solid"}
            onValueChange={(v) => upd({ lineStyle: v })}
            items={[
              { v: "solid", l: t("studio.block.opt.dividerSolid") },
              { v: "dashed", l: t("studio.block.opt.dividerDashed") },
              { v: "dotted", l: t("studio.block.opt.dividerDotted") },
              { v: "double", l: t("studio.block.opt.dividerDouble") },
            ]}
          />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-1">
        <Field k="studio.block.thickness">
          <Input
            type="number"
            min={1}
            max={5}
            value={p.thickness ?? 1}
            onChange={(e) => upd({ thickness: +e.target.value })}
            className="h-7 text-xs"
          />
        </Field>
        <Field k="studio.block.widthPct">
          <Input
            type="number"
            min={25}
            max={100}
            value={p.width ?? 100}
            onChange={(e) => upd({ width: +e.target.value })}
            className="h-7 text-xs"
          />
        </Field>
        <Field k="studio.block.divColor">
          <Swatch
            ariaLabel={t("studio.block.divColor")}
            value={p.color || "#e5e7eb"}
            onChange={(v) => upd({ color: v })}
          />
        </Field>
      </div>
      <Field k="studio.block.divLabel">
        <Input
          value={p.label || ""}
          onChange={(e) => upd({ label: e.target.value })}
          className="h-7 text-xs"
          placeholder={t("studio.block.divLabelPlaceholder")}
        />
      </Field>
    </div>
  );
}

// ─── Heading Editor ───────────────────────────────────
/**
 * Presentation UI component rendering the heading editor.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function HeadingEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "heading") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) =>
    onChange({ type: "heading", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      <Field k="studio.block.headingText">
        <Input
          value={p.text}
          onChange={(e) => upd({ text: e.target.value.slice(0, 200) })}
          className="h-7 text-xs"
        />
      </Field>
      <div className="grid grid-cols-3 gap-1">
        <Field k="studio.block.level">
          <Sel
            value={p.level}
            onValueChange={(v) => upd({ level: v })}
            items={[
              { v: "h2", l: t("studio.block.opt.levelH2") },
              { v: "h3", l: t("studio.block.opt.levelH3") },
              { v: "h4", l: t("studio.block.opt.levelH4") },
            ]}
          />
        </Field>
        <Field k="studio.block.alignment">
          <Sel
            value={p.alignment || "left"}
            onValueChange={(v) => upd({ alignment: v })}
            items={[
              {
                v: "left",
                l: <OptIcon icon={AlignLeft}>{t("studio.block.opt.alignLeft")}</OptIcon>,
              },
              {
                v: "center",
                l: <OptIcon icon={AlignCenter}>{t("studio.block.opt.alignCenter")}</OptIcon>,
              },
              {
                v: "right",
                l: <OptIcon icon={AlignRight}>{t("studio.block.opt.alignRight")}</OptIcon>,
              },
            ]}
          />
        </Field>
        <Field k="studio.block.textColor">
          <Swatch
            ariaLabel={t("studio.block.textColor")}
            value={p.color || "#111111"}
            onChange={(v) => upd({ color: v })}
          />
        </Field>
      </div>
      <Field k="studio.block.underline">
        <Sel
          value={p.underlineAccent || "none"}
          onValueChange={(v) => upd({ underlineAccent: v })}
          items={[
            { v: "none", l: t("studio.block.opt.dash") },
            { v: "primary", l: t("studio.block.opt.underlinePrimary") },
            { v: "gradient", l: t("studio.block.opt.underlineGradient") },
          ]}
        />
      </Field>
    </div>
  );
}

// ─── Badge Editor ─────────────────────────────────────
/**
 * Presentation UI component rendering the badge editor.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function BadgeEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "badge") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) =>
    onChange({ type: "badge", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.badgeLabel">
          <Input
            value={p.label}
            onChange={(e) => upd({ label: e.target.value.slice(0, 50) })}
            className="h-7 text-xs"
          />
        </Field>
        <Field k="studio.block.icon">
          <Input
            value={p.icon || ""}
            onChange={(e) => upd({ icon: e.target.value })}
            className="h-7 text-xs"
            placeholder={t("studio.block.opt.iconPlaceholderTrophy")}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.variant">
          <Sel
            value={p.variant}
            onValueChange={(v) => upd({ variant: v })}
            items={[
              { v: "success", l: t("studio.block.opt.variantSuccess") },
              { v: "warning", l: t("studio.block.opt.variantWarning") },
              { v: "info", l: t("studio.block.opt.variantInfo") },
              { v: "neutral", l: t("studio.block.opt.variantNeutral") },
              { v: "premium", l: t("studio.block.opt.variantPremium") },
            ]}
          />
        </Field>
        <Field k="studio.block.size">
          <Sel
            value={p.size || "md"}
            onValueChange={(v) => upd({ size: v })}
            items={[
              { v: "sm", l: t("studio.block.opt.sizeS") },
              { v: "md", l: t("studio.block.opt.sizeM") },
            ]}
          />
        </Field>
      </div>
      <div className="flex items-center gap-1">
        <Switch checked={p.pill !== false} onCheckedChange={(v) => upd({ pill: v })} />
        <span className="text-[10px] text-nx-ink-3">{t("studio.block.pill")}</span>
      </div>
    </div>
  );
}

// ─── Spacer Editor ────────────────────────────────────
/**
 * Presentation UI component rendering the spacer editor.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function SpacerEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "spacer") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) =>
    onChange({ type: "spacer", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      <SliderInput
        label={t("studio.block.height")}
        value={p.height}
        min={8}
        max={80}
        onChange={(v) => upd({ height: v })}
      />
      <div className="flex items-center gap-1">
        <Switch
          checked={!!p.responsiveHalve}
          onCheckedChange={(v) => upd({ responsiveHalve: v })}
        />
        <span className="text-[10px] text-nx-ink-3">{t("studio.block.responsiveHalve")}</span>
      </div>
    </div>
  );
}

// ─── Alert Editor ─────────────────────────────────────
const ALERT_ICONS: Record<string, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  error: XCircle,
};

/**
 * Presentation UI component rendering the alert editor.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function AlertEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "alert") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) =>
    onChange({ type: "alert", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      <Field k="studio.block.alertTitle">
        <Input
          value={p.title || ""}
          onChange={(e) => upd({ title: e.target.value })}
          className="h-7 text-xs"
        />
      </Field>
      <Field k="studio.block.alertMessage">
        <Textarea
          value={p.message}
          onChange={(e) => upd({ message: e.target.value.slice(0, 300) })}
          rows={2}
          className="resize-y text-xs"
        />
      </Field>
      <Field k="studio.block.variant">
        <Sel
          value={p.variant}
          onValueChange={(v) => upd({ variant: v })}
          items={[
            {
              v: "info",
              l: <OptIcon icon={ALERT_ICONS.info}>{t("studio.block.opt.variantInfo")}</OptIcon>,
            },
            {
              v: "warning",
              l: (
                <OptIcon icon={ALERT_ICONS.warning}>{t("studio.block.opt.variantWarning")}</OptIcon>
              ),
            },
            {
              v: "success",
              l: (
                <OptIcon icon={ALERT_ICONS.success}>{t("studio.block.opt.variantSuccess")}</OptIcon>
              ),
            },
            {
              v: "error",
              l: <OptIcon icon={ALERT_ICONS.error}>{t("studio.block.opt.alertError")}</OptIcon>,
            },
          ]}
        />
      </Field>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Switch checked={p.showIcon !== false} onCheckedChange={(v) => upd({ showIcon: v })} />
          <span className="text-[10px] text-nx-ink-3">{t("studio.block.showIcon")}</span>
        </div>
        <div className="flex items-center gap-1">
          <Switch checked={!!p.compact} onCheckedChange={(v) => upd({ compact: v })} />
          <span className="text-[10px] text-nx-ink-3">{t("studio.block.compact")}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Stats Row Editor ─────────────────────────────────
/**
 * Presentation UI component rendering the stats row editor.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function StatsRowEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "statsRow") return null;
  const p = block.props;
  const items = p.items;
  const upd = (patch: Record<string, unknown>) =>
    onChange({ type: "statsRow", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <Input
            value={item.icon || ""}
            onChange={(e) => {
              const u = [...items];
              u[i] = { ...u[i], icon: e.target.value };
              upd({ items: u });
            }}
            className="h-7 w-10 px-0 text-center text-xs"
            placeholder={t("studio.block.opt.iconPlaceholderChart")}
          />
          <Input
            value={item.value}
            onChange={(e) => {
              const u = [...items];
              u[i] = { ...u[i], value: e.target.value };
              upd({ items: u });
            }}
            className="h-7 w-20 text-xs"
            placeholder="10K+"
          />
          <Input
            value={item.label}
            onChange={(e) => {
              const u = [...items];
              u[i] = { ...u[i], label: e.target.value };
              upd({ items: u });
            }}
            className="h-7 flex-1 text-xs"
            placeholder={t("studio.block.statLabel")}
          />
          <button
            type="button"
            onClick={() => upd({ items: items.filter((_, j) => j !== i) })}
            aria-label={t("studio.blocks.remove")}
            className="rounded-nx-sm p-0.5 text-destructive/70 transition-colors duration-nx-micro ease-nx-enter hover:text-destructive focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      ))}
      {items.length < 4 && (
        <button
          type="button"
          onClick={() =>
            upd({
              items: [
                ...items,
                { value: "0", label: "", icon: t("studio.block.opt.iconPlaceholderChart") },
              ],
            })
          }
          className="flex items-center gap-1 text-[10px] text-nx-accent transition-colors duration-nx-micro ease-nx-enter hover:underline focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
          {t("studio.block.addStat")}
        </button>
      )}
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.layout">
          <Sel
            value={p.layout || "row"}
            onValueChange={(v) => upd({ layout: v })}
            items={[
              { v: "row", l: t("studio.block.opt.layoutRow") },
              { v: "grid", l: t("studio.block.opt.layoutGrid") },
            ]}
          />
        </Field>
        <Field k="studio.block.size">
          <Sel
            value={p.size || "md"}
            onValueChange={(v) => upd({ size: v })}
            items={[
              { v: "sm", l: t("studio.block.opt.sizeS") },
              { v: "md", l: t("studio.block.opt.sizeM") },
              { v: "lg", l: t("studio.block.opt.sizeL") },
            ]}
          />
        </Field>
      </div>
    </div>
  );
}

// ─── Social Links Editor ──────────────────────────────
/**
 * Presentation UI component rendering the social links editor.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function SocialLinksEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "socialLinks") return null;
  const p = block.props;
  const items = p.items;
  const upd = (patch: Record<string, unknown>) =>
    onChange({ type: "socialLinks", props: { ...p, ...patch } });
  const platforms = [
    "Twitter",
    "Facebook",
    "Instagram",
    "LinkedIn",
    "GitHub",
    "YouTube",
    "TikTok",
    "Discord",
  ];
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <Sel
            value={item.platform}
            onValueChange={(v) => {
              const u = [...items];
              u[i] = { ...u[i], platform: v };
              upd({ items: u });
            }}
            items={platforms.map((p2) => ({ v: p2, l: p2 }))}
          />
          <Input
            value={item.url}
            onChange={(e) => {
              const u = [...items];
              u[i] = { ...u[i], url: e.target.value };
              upd({ items: u });
            }}
            className="h-7 flex-1 text-xs"
            placeholder="https://..."
          />
          <button
            type="button"
            onClick={() => upd({ items: items.filter((_, j) => j !== i) })}
            aria-label={t("studio.blocks.remove")}
            className="rounded-nx-sm p-0.5 text-destructive/70 transition-colors duration-nx-micro ease-nx-enter hover:text-destructive focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      ))}
      {items.length < 8 && (
        <button
          type="button"
          onClick={() => upd({ items: [...items, { platform: "Twitter", url: "https://" }] })}
          className="flex items-center gap-1 text-[10px] text-nx-accent transition-colors duration-nx-micro ease-nx-enter hover:underline focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
          {t("studio.block.addSocial")}
        </button>
      )}
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.displayStyle">
          <Sel
            value={p.style || "icons-only"}
            onValueChange={(v) => upd({ style: v })}
            items={[
              { v: "icons-only", l: t("studio.block.opt.socialIconsOnly") },
              { v: "with-labels", l: t("studio.block.opt.socialWithLabels") },
              { v: "colored-bg", l: t("studio.block.opt.socialColoredBg") },
            ]}
          />
        </Field>
        <Field k="studio.block.size">
          <Sel
            value={p.size || "md"}
            onValueChange={(v) => upd({ size: v })}
            items={[
              { v: "sm", l: t("studio.block.opt.sizeS") },
              { v: "md", l: t("studio.block.opt.sizeM") },
              { v: "lg", l: t("studio.block.opt.sizeL") },
            ]}
          />
        </Field>
      </div>
    </div>
  );
}

// ─── Logo Cloud Editor ────────────────────────────────
/**
 * Presentation UI component rendering the logo cloud editor.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function LogoCloudEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "logoCloud") return null;
  const p = block.props;
  const items = p.items;
  const upd = (patch: Record<string, unknown>) =>
    onChange({ type: "logoCloud", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <Input
            value={item.src}
            onChange={(e) => {
              const u = [...items];
              u[i] = { ...u[i], src: e.target.value };
              upd({ items: u });
            }}
            className="h-7 flex-1 text-xs"
            placeholder={t("studio.block.imageUrl")}
          />
          <Input
            value={item.alt}
            onChange={(e) => {
              const u = [...items];
              u[i] = { ...u[i], alt: e.target.value };
              upd({ items: u });
            }}
            className="h-7 w-20 text-xs"
            placeholder={t("studio.block.imageAlt")}
          />
          <button
            type="button"
            onClick={() => upd({ items: items.filter((_, j) => j !== i) })}
            aria-label={t("studio.blocks.remove")}
            className="rounded-nx-sm p-0.5 text-destructive/70 transition-colors duration-nx-micro ease-nx-enter hover:text-destructive focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      ))}
      {items.length < 8 && (
        <button
          type="button"
          onClick={() => upd({ items: [...items, { src: "", alt: "" }] })}
          className="flex items-center gap-1 text-[10px] text-nx-accent transition-colors duration-nx-micro ease-nx-enter hover:underline focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
          {t("studio.block.addLogo")}
        </button>
      )}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Switch checked={!!p.grayscale} onCheckedChange={(v) => upd({ grayscale: v })} />
          <span className="text-[10px] text-nx-ink-3">{t("studio.block.grayscale")}</span>
        </div>
        <Field k="studio.block.size">
          <Sel
            value={p.size || "md"}
            onValueChange={(v) => upd({ size: v })}
            items={[
              { v: "sm", l: t("studio.block.opt.sizeS") },
              { v: "md", l: t("studio.block.opt.sizeM") },
              { v: "lg", l: t("studio.block.opt.sizeL") },
            ]}
          />
        </Field>
      </div>
    </div>
  );
}

// ─── Rating Editor ────────────────────────────────────
/**
 * Presentation UI component rendering the rating editor.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function RatingEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "rating") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) =>
    onChange({ type: "rating", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      <Field k="studio.block.ratingValue">
        <Input
          type="number"
          min={0}
          max={5}
          step={0.5}
          value={p.value}
          onChange={(e) => upd({ value: +e.target.value })}
          className="h-7 text-xs"
        />
      </Field>
      <Field k="studio.block.ratingLabel">
        <Input
          value={p.label || ""}
          onChange={(e) => upd({ label: e.target.value.slice(0, 100) })}
          className="h-7 text-xs"
        />
      </Field>
      <div className="grid grid-cols-3 gap-1">
        <Field k="studio.block.displayStyle">
          <Sel
            value={p.style || "stars"}
            onValueChange={(v) => upd({ style: v })}
            items={[
              {
                v: "stars",
                l: <OptIcon icon={Star}>{t("studio.block.opt.styleStars")}</OptIcon>,
              },
              {
                v: "hearts",
                l: <OptIcon icon={Heart}>{t("studio.block.opt.styleHearts")}</OptIcon>,
              },
              {
                v: "number-badge",
                l: <OptIcon icon={Hash}>{t("studio.block.opt.styleNumber")}</OptIcon>,
              },
            ]}
          />
        </Field>
        <Field k="studio.block.size">
          <Sel
            value={p.size || "md"}
            onValueChange={(v) => upd({ size: v })}
            items={[
              { v: "sm", l: t("studio.block.opt.sizeS") },
              { v: "md", l: t("studio.block.opt.sizeM") },
              { v: "lg", l: t("studio.block.opt.sizeL") },
            ]}
          />
        </Field>
        <Field k="studio.block.ratingColor">
          <Swatch
            ariaLabel={t("studio.block.ratingColor")}
            value={p.color || "#eab308"}
            onChange={(v) => upd({ color: v })}
          />
        </Field>
      </div>
    </div>
  );
}

// ─── Icon Row Editor ──────────────────────────────────
/**
 * Presentation UI component rendering the icon row editor.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function IconRowEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "iconRow") return null;
  const p = block.props;
  const items = p.items;
  const upd = (patch: Record<string, unknown>) =>
    onChange({ type: "iconRow", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <Input
            value={item.icon}
            onChange={(e) => {
              const u = [...items];
              u[i] = { ...u[i], icon: e.target.value };
              upd({ items: u });
            }}
            className="h-7 w-10 px-0 text-center text-xs"
            placeholder={t("studio.block.opt.iconPlaceholderLink")}
          />
          <Input
            value={item.label || ""}
            onChange={(e) => {
              const u = [...items];
              u[i] = { ...u[i], label: e.target.value };
              upd({ items: u });
            }}
            className="h-7 flex-1 text-xs"
            placeholder={t("studio.block.statLabel")}
          />
          <button
            type="button"
            onClick={() => upd({ items: items.filter((_, j) => j !== i) })}
            aria-label={t("studio.blocks.remove")}
            className="rounded-nx-sm p-0.5 text-destructive/70 transition-colors duration-nx-micro ease-nx-enter hover:text-destructive focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      ))}
      {items.length < 6 && (
        <button
          type="button"
          onClick={() =>
            upd({
              items: [...items, { icon: t("studio.block.opt.iconPlaceholderLink"), label: "" }],
            })
          }
          className="flex items-center gap-1 text-[10px] text-nx-accent transition-colors duration-nx-micro ease-nx-enter hover:underline focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
          {t("studio.block.addIcon")}
        </button>
      )}
      <div className="flex items-center gap-1">
        <Switch checked={p.showLabels !== false} onCheckedChange={(v) => upd({ showLabels: v })} />
        <span className="text-[10px] text-nx-ink-3">{t("studio.block.showLabels")}</span>
      </div>
    </div>
  );
}

// ─── Video Editor ─────────────────────────────────────
/**
 * Presentation UI component rendering the video editor.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function VideoEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "video") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) =>
    onChange({ type: "video", props: { ...p, ...patch } });
  const valid = !p.url || isValidVideoUrl(p.url);
  return (
    <div className="space-y-1.5">
      <Field k="studio.block.videoUrl">
        <Input
          value={p.url}
          onChange={(e) => upd({ url: e.target.value })}
          className={`h-7 text-xs ${!valid ? "border-destructive" : ""}`}
          placeholder="https://youtube.com/..."
        />
      </Field>
      {!valid && <p className="text-[9px] text-destructive">{t("studio.block.videoUrlInvalid")}</p>}
      <Field k="studio.block.thumbnailUrl">
        <Input
          value={p.thumbnailUrl || ""}
          onChange={(e) => upd({ thumbnailUrl: e.target.value })}
          className="h-7 text-xs"
          placeholder={t("studio.block.opt.aspectAuto")}
        />
      </Field>
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.aspectRatio">
          <Sel
            value={p.aspectRatio || "16:9"}
            onValueChange={(v) => upd({ aspectRatio: v })}
            items={[
              { v: "16:9", l: "16:9" },
              { v: "4:3", l: "4:3" },
            ]}
          />
        </Field>
        <Field k="studio.block.playBtn">
          <Sel
            value={p.playButtonStyle || "centered"}
            onValueChange={(v) => upd({ playButtonStyle: v })}
            items={[
              { v: "centered", l: t("studio.block.opt.playCentered") },
              { v: "corner", l: t("studio.block.opt.playCorner") },
            ]}
          />
        </Field>
      </div>
      <Field k="studio.block.overlayText">
        <Input
          value={p.overlayText || ""}
          onChange={(e) => upd({ overlayText: e.target.value })}
          className="h-7 text-xs"
        />
      </Field>
    </div>
  );
}

// ─── Countdown Editor ─────────────────────────────────
/**
 * Presentation UI component rendering the countdown editor.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function CountdownEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "countdown") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) =>
    onChange({ type: "countdown", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      <Field k="studio.block.targetDate">
        <Input
          type="datetime-local"
          value={p.targetDate?.slice(0, 16) || ""}
          onChange={(e) => upd({ targetDate: new Date(e.target.value).toISOString() })}
          className="h-7 text-xs"
        />
      </Field>
      <Field k="studio.block.countdownLabel">
        <Input
          value={p.label || ""}
          onChange={(e) => upd({ label: e.target.value })}
          className="h-7 text-xs"
        />
      </Field>
      <Field k="studio.block.expiredText">
        <Input
          value={p.expiredText || ""}
          onChange={(e) => upd({ expiredText: e.target.value })}
          className="h-7 text-xs"
        />
      </Field>
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.displayStyle">
          <Sel
            value={p.style || "simple"}
            onValueChange={(v) => upd({ style: v })}
            items={[
              { v: "simple", l: t("studio.block.opt.countdownSimple") },
              { v: "flip", l: t("studio.block.opt.countdownFlip") },
              { v: "minimal", l: t("studio.block.opt.styleMinimal") },
            ]}
          />
        </Field>
      </div>
      <div className="flex items-center gap-1">
        <Switch checked={p.showLabels !== false} onCheckedChange={(v) => upd({ showLabels: v })} />
        <span className="text-[10px] text-nx-ink-3">{t("studio.block.showLabels")}</span>
      </div>
    </div>
  );
}

// ─── Accordion Editor ─────────────────────────────────
/**
 * Presentation UI component rendering the accordion editor.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function AccordionEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "accordion") return null;
  const p = block.props;
  const items = p.items;
  const upd = (patch: Record<string, unknown>) =>
    onChange({ type: "accordion", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="space-y-0.5 rounded-nx-sm border border-nx-line p-1.5">
          <div className="flex items-center gap-1">
            <Input
              value={item.title}
              onChange={(e) => {
                const u = [...items];
                u[i] = { ...u[i], title: e.target.value };
                upd({ items: u });
              }}
              className="h-7 flex-1 text-xs"
              placeholder={t("studio.block.accordionTitle")}
            />
            <button
              type="button"
              onClick={() => upd({ items: items.filter((_, j) => j !== i) })}
              aria-label={t("studio.blocks.remove")}
              className="rounded-nx-sm p-0.5 text-destructive/70 transition-colors duration-nx-micro ease-nx-enter hover:text-destructive focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>
          <Textarea
            value={item.content}
            onChange={(e) => {
              const u = [...items];
              u[i] = { ...u[i], content: e.target.value };
              upd({ items: u });
            }}
            rows={2}
            className="resize-y text-xs"
            placeholder={t("studio.block.accordionContent")}
          />
        </div>
      ))}
      {items.length < 5 && (
        <button
          type="button"
          onClick={() => upd({ items: [...items, { title: "", content: "" }] })}
          className="flex items-center gap-1 text-[10px] text-nx-accent transition-colors duration-nx-micro ease-nx-enter hover:underline focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
          {t("studio.block.addItem")}
        </button>
      )}
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.displayStyle">
          <Sel
            value={p.style || "bordered"}
            onValueChange={(v) => upd({ style: v })}
            items={[
              { v: "bordered", l: t("studio.block.opt.accordionBordered") },
              { v: "ghost", l: t("studio.block.opt.accordionGhost") },
              { v: "card", l: t("studio.block.opt.styleCard") },
            ]}
          />
        </Field>
        <Field k="studio.block.iconPosition">
          <Sel
            value={p.iconPosition || "right"}
            onValueChange={(v) => upd({ iconPosition: v })}
            items={[
              {
                v: "left",
                l: <OptIcon icon={ArrowLeft}>{t("studio.block.opt.alignLeft")}</OptIcon>,
              },
              {
                v: "right",
                l: <OptIcon icon={ArrowRight}>{t("studio.block.opt.alignRight")}</OptIcon>,
              },
            ]}
          />
        </Field>
      </div>
      <div className="flex items-center gap-1">
        <Switch checked={!!p.allowMultiple} onCheckedChange={(v) => upd({ allowMultiple: v })} />
        <span className="text-[10px] text-nx-ink-3">{t("studio.block.allowMultiple")}</span>
      </div>
    </div>
  );
}

// ─── Progress Steps Editor ────────────────────────────
/**
 * Presentation UI component rendering the progress steps editor.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function ProgressStepsEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "progressSteps") return null;
  const p = block.props;
  const items = p.items;
  const upd = (patch: Record<string, unknown>) =>
    onChange({ type: "progressSteps", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <span className="w-4 text-[10px] text-nx-ink-3">{i + 1}</span>
          <Input
            value={item.label}
            onChange={(e) => {
              const u = [...items];
              u[i] = { ...u[i], label: e.target.value };
              upd({ items: u });
            }}
            className="h-7 flex-1 text-xs"
            placeholder={t("studio.block.seed.stepSignUp")}
          />
          <button
            type="button"
            onClick={() => upd({ items: items.filter((_, j) => j !== i) })}
            aria-label={t("studio.blocks.remove")}
            className="rounded-nx-sm p-0.5 text-destructive/70 transition-colors duration-nx-micro ease-nx-enter hover:text-destructive focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      ))}
      {items.length < 5 && (
        <button
          type="button"
          onClick={() => upd({ items: [...items, { label: "" }] })}
          className="flex items-center gap-1 text-[10px] text-nx-accent transition-colors duration-nx-micro ease-nx-enter hover:underline focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
          {t("studio.block.addStep")}
        </button>
      )}
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.activeStep">
          <Input
            type="number"
            min={0}
            max={items.length - 1}
            value={p.activeStep ?? 0}
            onChange={(e) => upd({ activeStep: +e.target.value })}
            className="h-7 text-xs"
          />
        </Field>
        <Field k="studio.block.displayStyle">
          <Sel
            value={p.style || "horizontal"}
            onValueChange={(v) => upd({ style: v })}
            items={[
              { v: "horizontal", l: t("studio.block.opt.progressHorizontal") },
              { v: "vertical", l: t("studio.block.opt.progressVertical") },
            ]}
          />
        </Field>
      </div>
    </div>
  );
}

// ─── Avatar Stack Editor ──────────────────────────────
/**
 * Presentation UI component rendering the avatar stack editor.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function AvatarStackEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "avatarStack") return null;
  const p = block.props;
  const urls = p.avatarUrls;
  const upd = (patch: Record<string, unknown>) =>
    onChange({ type: "avatarStack", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      {urls.map((url, i) => (
        <div key={i} className="flex items-center gap-1">
          <Input
            value={url}
            onChange={(e) => {
              const u = [...urls];
              u[i] = e.target.value;
              upd({ avatarUrls: u });
            }}
            className="h-7 flex-1 text-xs"
            placeholder={t("studio.block.avatarUrl")}
          />
          <button
            type="button"
            onClick={() => upd({ avatarUrls: urls.filter((_, j) => j !== i) })}
            aria-label={t("studio.blocks.remove")}
            className="rounded-nx-sm p-0.5 text-destructive/70 transition-colors duration-nx-micro ease-nx-enter hover:text-destructive focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      ))}
      {urls.length < 5 && (
        <button
          type="button"
          onClick={() => upd({ avatarUrls: [...urls, ""] })}
          className="flex items-center gap-1 text-[10px] text-nx-accent transition-colors duration-nx-micro ease-nx-enter hover:underline focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
          {t("studio.block.addAvatar")}
        </button>
      )}
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.totalCount">
          <Input
            value={p.totalCount || ""}
            onChange={(e) => upd({ totalCount: e.target.value })}
            className="h-7 text-xs"
            placeholder="1,200+"
          />
        </Field>
        <Field k="studio.block.size">
          <Sel
            value={p.size || "md"}
            onValueChange={(v) => upd({ size: v })}
            items={[
              { v: "sm", l: t("studio.block.opt.sizeS") },
              { v: "md", l: t("studio.block.opt.sizeM") },
              { v: "lg", l: t("studio.block.opt.sizeL") },
            ]}
          />
        </Field>
      </div>
      <Field k="studio.block.stackLabel">
        <Input
          value={p.label || ""}
          onChange={(e) => upd({ label: e.target.value })}
          className="h-7 text-xs"
        />
      </Field>
    </div>
  );
}

// ─── Gradient Text Editor ─────────────────────────────
/**
 * Presentation UI component rendering the gradient text editor.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function GradientTextEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "gradientText") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) =>
    onChange({ type: "gradientText", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      <Field k="studio.block.gradientTextContent">
        <Input
          value={p.text}
          onChange={(e) => upd({ text: e.target.value.slice(0, 200) })}
          className="h-7 text-xs"
        />
      </Field>
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.fromColor">
          <Swatch
            ariaLabel={t("studio.block.fromColor")}
            value={p.fromColor || "#6366f1"}
            onChange={(v) => upd({ fromColor: v })}
          />
        </Field>
        <Field k="studio.block.toColor">
          <Swatch
            ariaLabel={t("studio.block.toColor")}
            value={p.toColor || "#ec4899"}
            onChange={(v) => upd({ toColor: v })}
          />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-1">
        <Field k="studio.block.direction">
          <Sel
            value={p.direction || "left-right"}
            onValueChange={(v) => upd({ direction: v })}
            items={[
              {
                v: "left-right",
                l: <OptIcon icon={ArrowRight}>{t("studio.direction.leftToRight")}</OptIcon>,
              },
              {
                v: "top-bottom",
                l: <OptIcon icon={ArrowDown}>{t("studio.direction.topToBottom")}</OptIcon>,
              },
              {
                v: "diagonal",
                l: <OptIcon icon={ArrowDownRight}>{t("studio.direction.diagonal")}</OptIcon>,
              },
            ]}
          />
        </Field>
        <Field k="studio.block.fontSize">
          <Sel
            value={p.fontSize || "2xl"}
            onValueChange={(v) => upd({ fontSize: v })}
            items={[
              { v: "lg", l: t("studio.block.opt.sizeL") },
              { v: "xl", l: t("studio.block.opt.sizeXl") },
              { v: "2xl", l: t("studio.block.opt.size2xl") },
              { v: "3xl", l: t("studio.block.opt.size3xl") },
              { v: "4xl", l: t("studio.block.opt.size4xl") },
            ]}
          />
        </Field>
        <Field k="studio.block.alignment">
          <Sel
            value={p.alignment || "center"}
            onValueChange={(v) => upd({ alignment: v })}
            items={[
              {
                v: "left",
                l: <OptIcon icon={AlignLeft}>{t("studio.block.opt.alignLeft")}</OptIcon>,
              },
              {
                v: "center",
                l: <OptIcon icon={AlignCenter}>{t("studio.block.opt.alignCenter")}</OptIcon>,
              },
              {
                v: "right",
                l: <OptIcon icon={AlignRight}>{t("studio.block.opt.alignRight")}</OptIcon>,
              },
            ]}
          />
        </Field>
      </div>
    </div>
  );
}

// ─── Master Switch ────────────────────────────────────
/**
 * Presentation UI component rendering the inline editor.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function InlineEditor(props: P) {
  const { block } = props;
  let editor: React.ReactNode = null;
  switch (block.type) {
    case "text":
      editor = <TextEditor {...props} />;
      break;
    case "image":
      editor = <ImageEditor {...props} />;
      break;
    case "featureList":
      editor = <FeatureListEditor {...props} />;
      break;
    case "testimonial":
      editor = <TestimonialEditor {...props} />;
      break;
    case "ctaButton":
      editor = <CtaEditor {...props} />;
      break;
    case "divider":
      editor = <DividerEditor {...props} />;
      break;
    case "heading":
      editor = <HeadingEditor {...props} />;
      break;
    case "badge":
      editor = <BadgeEditor {...props} />;
      break;
    case "spacer":
      editor = <SpacerEditor {...props} />;
      break;
    case "alert":
      editor = <AlertEditor {...props} />;
      break;
    case "statsRow":
      editor = <StatsRowEditor {...props} />;
      break;
    case "socialLinks":
      editor = <SocialLinksEditor {...props} />;
      break;
    case "logoCloud":
      editor = <LogoCloudEditor {...props} />;
      break;
    case "rating":
      editor = <RatingEditor {...props} />;
      break;
    case "iconRow":
      editor = <IconRowEditor {...props} />;
      break;
    case "video":
      editor = <VideoEditor {...props} />;
      break;
    case "countdown":
      editor = <CountdownEditor {...props} />;
      break;
    case "accordion":
      editor = <AccordionEditor {...props} />;
      break;
    case "progressSteps":
      editor = <ProgressStepsEditor {...props} />;
      break;
    case "avatarStack":
      editor = <AvatarStackEditor {...props} />;
      break;
    case "gradientText":
      editor = <GradientTextEditor {...props} />;
      break;
  }
  return (
    <>
      {editor}
      <BasePropsEditor {...props} />
    </>
  );
}
