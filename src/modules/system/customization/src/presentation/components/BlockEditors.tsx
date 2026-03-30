"use client";
import { Input } from "@core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Switch } from "@core/ui/switch";
import { Plus, X, Eye, EyeOff } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { ContentBlock } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import { isValidCtaUrl, isValidVideoUrl } from "@modules/auth/core/domain/entities/LoginBrandingTypes";

type CB = ContentBlock;
type P = { block: CB; onChange: (b: CB) => void };

// ─── Helpers ──────────────────────────────────────────
function Lbl({ k }: { k: string }) { const { t } = useI18n(); return <label className="text-[10px] text-muted-foreground">{t(k)}</label>; }
function Field({ k, children }: { k: string; children: React.ReactNode }) { return <div className="space-y-0.5"><Lbl k={k} />{children}</div>; }
function Sel({ value, onValueChange, items }: { value: string; onValueChange: (v: string) => void; items: { v: string; l: string }[] }) {
  return <Select value={value} onValueChange={onValueChange}><SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent>{items.map(i => <SelectItem key={i.v} value={i.v}>{i.l}</SelectItem>)}</SelectContent></Select>;
}

// ─── Base Props Editor (every block) ──────────────────
export function BasePropsEditor({ block, onChange }: P) {
  const { t } = useI18n();
  const p = block.props;
  const upd = (patch: Record<string, unknown>) => onChange({ ...block, props: { ...p, ...patch } } as CB);
  return (
    <div className="border-t border-dashed border-border/50 pt-2 mt-2 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{t("studio.block.visibility")}</span>
        <button onClick={() => upd({ visible: p.visible === false ? true : false })} className="p-0.5">{p.visible === false ? <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> : <Eye className="h-3.5 w-3.5 text-primary" />}</button>
      </div>
      <Field k="studio.block.animationType">
        <Sel value={p.animation || "none"} onValueChange={v => upd({ animation: v })} items={[
          { v: "none", l: t("studio.block.animNone") }, { v: "fade-in", l: t("studio.block.animFade") },
          { v: "slide-up", l: t("studio.block.animSlideUp") }, { v: "slide-left", l: t("studio.block.animSlideLeft") },
          { v: "slide-right", l: t("studio.block.animSlideRight") }, { v: "scale-in", l: t("studio.block.animScale") },
          { v: "bounce", l: t("studio.block.animBounce") },
        ]} />
      </Field>
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.blockPadding">
          <Sel value={p.padding || "none"} onValueChange={v => upd({ padding: v })} items={[{ v: "none", l: "—" }, { v: "sm", l: "S" }, { v: "md", l: "M" }, { v: "lg", l: "L" }]} />
        </Field>
        <Field k="studio.block.blockMargin">
          <Sel value={p.marginBottom || "none"} onValueChange={v => upd({ marginBottom: v })} items={[{ v: "none", l: "—" }, { v: "sm", l: "S" }, { v: "md", l: "M" }, { v: "lg", l: "L" }]} />
        </Field>
      </div>
    </div>
  );
}

// ─── Text Editor ──────────────────────────────────────
export function TextEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "text") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) => onChange({ type: "text", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      <textarea value={p.content} onChange={e => upd({ content: e.target.value.slice(0, 500) })} rows={3} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs resize-y focus:border-primary focus:outline-none" placeholder={t("studio.block.textPlaceholder")} />
      <p className={`text-[10px] ${p.content.length > 500 ? "text-destructive" : "text-muted-foreground"}`}>{p.content.length}/500</p>
      <div className="grid grid-cols-3 gap-1">
        <Field k="studio.block.alignment"><Sel value={p.alignment || "left"} onValueChange={v => upd({ alignment: v })} items={[{ v: "left", l: "←" }, { v: "center", l: "↔" }, { v: "right", l: "→" }]} /></Field>
        <Field k="studio.block.fontSize"><Sel value={p.fontSize || "base"} onValueChange={v => upd({ fontSize: v })} items={[{ v: "sm", l: "S" }, { v: "base", l: "M" }, { v: "lg", l: "L" }, { v: "xl", l: "XL" }, { v: "2xl", l: "2XL" }]} /></Field>
        <Field k="studio.block.fontWeight"><Sel value={p.fontWeight || "normal"} onValueChange={v => upd({ fontWeight: v })} items={[{ v: "normal", l: "Normal" }, { v: "medium", l: "Medium" }, { v: "semibold", l: "Semi" }, { v: "bold", l: "Bold" }]} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.textColor"><Input type="color" value={p.color && !["auto","primary","muted"].includes(p.color) ? p.color : "#666666"} onChange={e => upd({ color: e.target.value })} className="h-7 w-full px-1" /></Field>
        <Field k="studio.block.textTransform"><Sel value={p.textTransform || "none"} onValueChange={v => upd({ textTransform: v })} items={[{ v: "none", l: "—" }, { v: "uppercase", l: "ABC" }, { v: "capitalize", l: "Abc" }]} /></Field>
      </div>
      <div className="flex items-center gap-2"><Switch checked={!!p.highlight} onCheckedChange={v => upd({ highlight: v })} /><span className="text-[10px] text-muted-foreground">{t("studio.block.highlight")}</span></div>
    </div>
  );
}

// ─── Image Editor ─────────────────────────────────────
export function ImageEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "image") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) => onChange({ type: "image", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      <Field k="studio.block.imageUrl"><Input value={p.src} onChange={e => upd({ src: e.target.value })} className="h-7 text-xs" placeholder="https://..." /></Field>
      <Field k="studio.block.imageAlt"><Input value={p.alt} onChange={e => upd({ alt: e.target.value })} className="h-7 text-xs" /></Field>
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.borderRadius"><Input type="number" min={0} max={32} value={p.borderRadius ?? 12} onChange={e => upd({ borderRadius: +e.target.value })} className="h-7 text-xs" /></Field>
        <Field k="studio.block.maxHeight"><Input type="number" min={50} max={800} value={p.maxHeight ?? ""} onChange={e => upd({ maxHeight: e.target.value ? +e.target.value : undefined })} className="h-7 text-xs" placeholder="px" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.objectFit"><Sel value={p.objectFit || "cover"} onValueChange={v => upd({ objectFit: v })} items={[{ v: "cover", l: "Cover" }, { v: "contain", l: "Contain" }, { v: "fill", l: "Fill" }, { v: "none", l: "None" }]} /></Field>
        <Field k="studio.block.shadow"><Sel value={p.shadow || "none"} onValueChange={v => upd({ shadow: v })} items={[{ v: "none", l: "—" }, { v: "sm", l: "S" }, { v: "md", l: "M" }, { v: "lg", l: "L" }, { v: "xl", l: "XL" }]} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.hoverEffect"><Sel value={p.hoverEffect || "none"} onValueChange={v => upd({ hoverEffect: v })} items={[{ v: "none", l: "—" }, { v: "zoom", l: "Zoom" }, { v: "brightness", l: "Bright" }, { v: "grayscale", l: "Gray" }]} /></Field>
        <Field k="studio.block.aspectRatio"><Sel value={p.aspectRatio || "auto"} onValueChange={v => upd({ aspectRatio: v })} items={[{ v: "auto", l: "Auto" }, { v: "1:1", l: "1:1" }, { v: "16:9", l: "16:9" }, { v: "4:3", l: "4:3" }]} /></Field>
      </div>
      <Field k="studio.block.linkUrl"><Input value={p.linkUrl || ""} onChange={e => upd({ linkUrl: e.target.value })} className="h-7 text-xs" placeholder="https://..." /></Field>
      <Field k="studio.block.caption"><Input value={p.caption || ""} onChange={e => upd({ caption: e.target.value })} className="h-7 text-xs" /></Field>
    </div>
  );
}

// ─── Feature List Editor ──────────────────────────────
export function FeatureListEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "featureList") return null;
  const p = block.props; const items = p.items;
  const upd = (patch: Record<string, unknown>) => onChange({ type: "featureList", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-1">
          <Input value={item.icon} onChange={e => { const u = [...items]; u[i] = { ...u[i], icon: e.target.value }; upd({ items: u }); }} className="h-7 w-10 text-xs text-center px-0" placeholder="🔒" />
          <div className="flex-1 space-y-0.5">
            <Input value={item.title} onChange={e => { const u = [...items]; u[i] = { ...u[i], title: e.target.value }; upd({ items: u }); }} className="h-7 text-xs" placeholder={t("studio.block.featureTitle")} />
            <Input value={item.description} onChange={e => { const u = [...items]; u[i] = { ...u[i], description: e.target.value }; upd({ items: u }); }} className="h-7 text-xs" placeholder={t("studio.block.featureDesc")} />
          </div>
          <button onClick={() => upd({ items: items.filter((_, j) => j !== i) })} className="mt-1 p-0.5 text-destructive/60 hover:text-destructive"><X className="h-3 w-3" /></button>
        </div>
      ))}
      {items.length < 6 && <button onClick={() => upd({ items: [...items, { icon: "✨", title: "", description: "" }] })} className="flex items-center gap-1 text-[10px] text-primary hover:underline"><Plus className="h-3 w-3" />{t("studio.block.addFeature")}</button>}
      <div className="grid grid-cols-3 gap-1">
        <Field k="studio.block.columns"><Sel value={String(p.columns || 1)} onValueChange={v => upd({ columns: +v })} items={[{ v: "1", l: "1" }, { v: "2", l: "2" }, { v: "3", l: "3" }]} /></Field>
        <Field k="studio.block.iconSize"><Sel value={p.iconSize || "md"} onValueChange={v => upd({ iconSize: v })} items={[{ v: "sm", l: "S" }, { v: "md", l: "M" }, { v: "lg", l: "L" }]} /></Field>
        <Field k="studio.block.iconColor"><Input type="color" value={p.iconColor || "#6366f1"} onChange={e => upd({ iconColor: e.target.value })} className="h-7 w-full px-1" /></Field>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1"><Switch checked={!!p.compactMode} onCheckedChange={v => upd({ compactMode: v })} /><span className="text-[10px] text-muted-foreground">{t("studio.block.compact")}</span></div>
        <div className="flex items-center gap-1"><Switch checked={!!p.numberedMode} onCheckedChange={v => upd({ numberedMode: v })} /><span className="text-[10px] text-muted-foreground">{t("studio.block.numbered")}</span></div>
      </div>
    </div>
  );
}

// ─── Testimonial Editor ───────────────────────────────
export function TestimonialEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "testimonial") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) => onChange({ type: "testimonial", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      <Field k="studio.block.quote"><textarea value={p.quote} onChange={e => upd({ quote: e.target.value })} rows={2} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs resize-y focus:border-primary focus:outline-none" /></Field>
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.author"><Input value={p.author} onChange={e => upd({ author: e.target.value })} className="h-7 text-xs" /></Field>
        <Field k="studio.block.role"><Input value={p.role || ""} onChange={e => upd({ role: e.target.value })} className="h-7 text-xs" /></Field>
      </div>
      <Field k="studio.block.avatarUrl"><Input value={p.avatar || ""} onChange={e => upd({ avatar: e.target.value })} className="h-7 text-xs" placeholder="https://..." /></Field>
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.displayStyle"><Sel value={p.displayStyle || "card"} onValueChange={v => upd({ displayStyle: v })} items={[{ v: "card", l: "Card" }, { v: "bubble", l: "Bubble" }, { v: "minimal", l: "Minimal" }, { v: "large-quote", l: "Large" }]} /></Field>
        <Field k="studio.block.ratingStars"><Sel value={String(p.rating ?? 0)} onValueChange={v => upd({ rating: +v })} items={[{ v: "0", l: "—" }, { v: "1", l: "★" }, { v: "2", l: "★★" }, { v: "3", l: "★★★" }, { v: "4", l: "★★★★" }, { v: "5", l: "★★★★★" }]} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.companyName"><Input value={p.companyName || ""} onChange={e => upd({ companyName: e.target.value })} className="h-7 text-xs" /></Field>
        <Field k="studio.block.borderColor"><Input type="color" value={p.borderColor || "#e5e7eb"} onChange={e => upd({ borderColor: e.target.value })} className="h-7 w-full px-1" /></Field>
      </div>
    </div>
  );
}

// ─── CTA Button Editor ────────────────────────────────
export function CtaEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "ctaButton") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) => onChange({ type: "ctaButton", props: { ...p, ...patch } });
  const isUrlValid = !p.url || isValidCtaUrl(p.url);
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.ctaLabel"><Input value={p.label} onChange={e => upd({ label: e.target.value })} className="h-7 text-xs" /></Field>
        <Field k="studio.block.icon"><Input value={p.icon || ""} onChange={e => upd({ icon: e.target.value })} className="h-7 text-xs" placeholder="🚀" /></Field>
      </div>
      <Field k="studio.block.ctaUrl"><Input value={p.url} onChange={e => upd({ url: e.target.value })} className={`h-7 text-xs ${!isUrlValid ? "border-destructive" : ""}`} placeholder="https://..." /></Field>
      {!isUrlValid && <p className="text-[9px] text-destructive">{t("studio.block.ctaUrlInvalid")}</p>}
      <div className="grid grid-cols-3 gap-1">
        <Field k="studio.block.ctaVariant"><Sel value={p.variant || "default"} onValueChange={v => upd({ variant: v })} items={[{ v: "default", l: t("studio.block.variantDefault") }, { v: "outline", l: t("studio.block.variantOutline") }, { v: "ghost", l: t("studio.block.variantGhost") }]} /></Field>
        <Field k="studio.block.size"><Sel value={p.size || "md"} onValueChange={v => upd({ size: v })} items={[{ v: "sm", l: "S" }, { v: "md", l: "M" }, { v: "lg", l: "L" }, { v: "xl", l: "XL" }]} /></Field>
        <Field k="studio.block.btnColor"><Input type="color" value={p.color || "#6366f1"} onChange={e => upd({ color: e.target.value })} className="h-7 w-full px-1" /></Field>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1"><Switch checked={!!p.fullWidth} onCheckedChange={v => upd({ fullWidth: v })} /><span className="text-[10px] text-muted-foreground">{t("studio.block.fullWidth")}</span></div>
        <div className="flex items-center gap-1"><Switch checked={!!p.shadow} onCheckedChange={v => upd({ shadow: v })} /><span className="text-[10px] text-muted-foreground">{t("studio.block.shadow")}</span></div>
      </div>
      <Field k="studio.block.secondaryText"><Input value={p.secondaryText || ""} onChange={e => upd({ secondaryText: e.target.value })} className="h-7 text-xs" /></Field>
    </div>
  );
}

// ─── Divider Editor ───────────────────────────────────
export function DividerEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "divider") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) => onChange({ type: "divider", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.dividerStyle"><Sel value={p.style || "line"} onValueChange={v => upd({ style: v })} items={[{ v: "line", l: t("studio.block.styleLine") }, { v: "space", l: t("studio.block.styleSpace") }, { v: "dots", l: t("studio.block.styleDots") }]} /></Field>
        <Field k="studio.block.lineStyle"><Sel value={p.lineStyle || "solid"} onValueChange={v => upd({ lineStyle: v })} items={[{ v: "solid", l: "Solid" }, { v: "dashed", l: "Dashed" }, { v: "dotted", l: "Dotted" }, { v: "double", l: "Double" }]} /></Field>
      </div>
      <div className="grid grid-cols-3 gap-1">
        <Field k="studio.block.thickness"><Input type="number" min={1} max={5} value={p.thickness ?? 1} onChange={e => upd({ thickness: +e.target.value })} className="h-7 text-xs" /></Field>
        <Field k="studio.block.widthPct"><Input type="number" min={25} max={100} value={p.width ?? 100} onChange={e => upd({ width: +e.target.value })} className="h-7 text-xs" /></Field>
        <Field k="studio.block.divColor"><Input type="color" value={p.color || "#e5e7eb"} onChange={e => upd({ color: e.target.value })} className="h-7 w-full px-1" /></Field>
      </div>
      <Field k="studio.block.divLabel"><Input value={p.label || ""} onChange={e => upd({ label: e.target.value })} className="h-7 text-xs" placeholder={t("studio.block.divLabelPlaceholder")} /></Field>
    </div>
  );
}

// ─── Heading Editor ───────────────────────────────────
export function HeadingEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "heading") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) => onChange({ type: "heading", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      <Field k="studio.block.headingText"><Input value={p.text} onChange={e => upd({ text: e.target.value.slice(0, 200) })} className="h-7 text-xs" /></Field>
      <div className="grid grid-cols-3 gap-1">
        <Field k="studio.block.level"><Sel value={p.level} onValueChange={v => upd({ level: v })} items={[{ v: "h2", l: "H2" }, { v: "h3", l: "H3" }, { v: "h4", l: "H4" }]} /></Field>
        <Field k="studio.block.alignment"><Sel value={p.alignment || "left"} onValueChange={v => upd({ alignment: v })} items={[{ v: "left", l: "←" }, { v: "center", l: "↔" }, { v: "right", l: "→" }]} /></Field>
        <Field k="studio.block.textColor"><Input type="color" value={p.color || "#111111"} onChange={e => upd({ color: e.target.value })} className="h-7 w-full px-1" /></Field>
      </div>
      <Field k="studio.block.underline"><Sel value={p.underlineAccent || "none"} onValueChange={v => upd({ underlineAccent: v })} items={[{ v: "none", l: "—" }, { v: "primary", l: "Primary" }, { v: "gradient", l: "Gradient" }]} /></Field>
    </div>
  );
}

// ─── Badge Editor ─────────────────────────────────────
export function BadgeEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "badge") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) => onChange({ type: "badge", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.badgeLabel"><Input value={p.label} onChange={e => upd({ label: e.target.value.slice(0, 50) })} className="h-7 text-xs" /></Field>
        <Field k="studio.block.icon"><Input value={p.icon || ""} onChange={e => upd({ icon: e.target.value })} className="h-7 text-xs" placeholder="🏆" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.variant"><Sel value={p.variant} onValueChange={v => upd({ variant: v })} items={[{ v: "success", l: "Success" }, { v: "warning", l: "Warning" }, { v: "info", l: "Info" }, { v: "neutral", l: "Neutral" }, { v: "premium", l: "Premium" }]} /></Field>
        <Field k="studio.block.size"><Sel value={p.size || "md"} onValueChange={v => upd({ size: v })} items={[{ v: "sm", l: "S" }, { v: "md", l: "M" }]} /></Field>
      </div>
      <div className="flex items-center gap-1"><Switch checked={p.pill !== false} onCheckedChange={v => upd({ pill: v })} /><span className="text-[10px] text-muted-foreground">{t("studio.block.pill")}</span></div>
    </div>
  );
}

// ─── Spacer Editor ────────────────────────────────────
export function SpacerEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "spacer") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) => onChange({ type: "spacer", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      <Field k="studio.block.height"><Input type="range" min={8} max={80} value={p.height} onChange={e => upd({ height: +e.target.value })} className="h-7 w-full" /><span className="text-[10px] text-muted-foreground">{p.height}px</span></Field>
      <div className="flex items-center gap-1"><Switch checked={!!p.responsiveHalve} onCheckedChange={v => upd({ responsiveHalve: v })} /><span className="text-[10px] text-muted-foreground">{t("studio.block.responsiveHalve")}</span></div>
    </div>
  );
}

// ─── Alert Editor ─────────────────────────────────────
export function AlertEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "alert") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) => onChange({ type: "alert", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      <Field k="studio.block.alertTitle"><Input value={p.title || ""} onChange={e => upd({ title: e.target.value })} className="h-7 text-xs" /></Field>
      <Field k="studio.block.alertMessage"><textarea value={p.message} onChange={e => upd({ message: e.target.value.slice(0, 300) })} rows={2} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs resize-y focus:border-primary focus:outline-none" /></Field>
      <Field k="studio.block.variant"><Sel value={p.variant} onValueChange={v => upd({ variant: v })} items={[{ v: "info", l: "ℹ️ Info" }, { v: "warning", l: "⚠️ Warning" }, { v: "success", l: "✅ Success" }, { v: "error", l: "❌ Error" }]} /></Field>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1"><Switch checked={p.showIcon !== false} onCheckedChange={v => upd({ showIcon: v })} /><span className="text-[10px] text-muted-foreground">{t("studio.block.showIcon")}</span></div>
        <div className="flex items-center gap-1"><Switch checked={!!p.compact} onCheckedChange={v => upd({ compact: v })} /><span className="text-[10px] text-muted-foreground">{t("studio.block.compact")}</span></div>
      </div>
    </div>
  );
}

// ─── Stats Row Editor ─────────────────────────────────
export function StatsRowEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "statsRow") return null;
  const p = block.props; const items = p.items;
  const upd = (patch: Record<string, unknown>) => onChange({ type: "statsRow", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <Input value={item.icon || ""} onChange={e => { const u = [...items]; u[i] = { ...u[i], icon: e.target.value }; upd({ items: u }); }} className="h-7 w-10 text-xs text-center px-0" placeholder="📊" />
          <Input value={item.value} onChange={e => { const u = [...items]; u[i] = { ...u[i], value: e.target.value }; upd({ items: u }); }} className="h-7 w-20 text-xs" placeholder="10K+" />
          <Input value={item.label} onChange={e => { const u = [...items]; u[i] = { ...u[i], label: e.target.value }; upd({ items: u }); }} className="h-7 flex-1 text-xs" placeholder={t("studio.block.statLabel")} />
          <button onClick={() => upd({ items: items.filter((_, j) => j !== i) })} className="p-0.5 text-destructive/60 hover:text-destructive"><X className="h-3 w-3" /></button>
        </div>
      ))}
      {items.length < 4 && <button onClick={() => upd({ items: [...items, { value: "0", label: "", icon: "📊" }] })} className="flex items-center gap-1 text-[10px] text-primary hover:underline"><Plus className="h-3 w-3" />{t("studio.block.addStat")}</button>}
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.layout"><Sel value={p.layout || "row"} onValueChange={v => upd({ layout: v })} items={[{ v: "row", l: "Row" }, { v: "grid", l: "Grid" }]} /></Field>
        <Field k="studio.block.size"><Sel value={p.size || "md"} onValueChange={v => upd({ size: v })} items={[{ v: "sm", l: "S" }, { v: "md", l: "M" }, { v: "lg", l: "L" }]} /></Field>
      </div>
    </div>
  );
}

// ─── Social Links Editor ──────────────────────────────
export function SocialLinksEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "socialLinks") return null;
  const p = block.props; const items = p.items;
  const upd = (patch: Record<string, unknown>) => onChange({ type: "socialLinks", props: { ...p, ...patch } });
  const platforms = ["Twitter", "Facebook", "Instagram", "LinkedIn", "GitHub", "YouTube", "TikTok", "Discord"];
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <Sel value={item.platform} onValueChange={v => { const u = [...items]; u[i] = { ...u[i], platform: v }; upd({ items: u }); }} items={platforms.map(p => ({ v: p, l: p }))} />
          <Input value={item.url} onChange={e => { const u = [...items]; u[i] = { ...u[i], url: e.target.value }; upd({ items: u }); }} className="h-7 flex-1 text-xs" placeholder="https://..." />
          <button onClick={() => upd({ items: items.filter((_, j) => j !== i) })} className="p-0.5 text-destructive/60 hover:text-destructive"><X className="h-3 w-3" /></button>
        </div>
      ))}
      {items.length < 8 && <button onClick={() => upd({ items: [...items, { platform: "Twitter", url: "https://" }] })} className="flex items-center gap-1 text-[10px] text-primary hover:underline"><Plus className="h-3 w-3" />{t("studio.block.addSocial")}</button>}
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.displayStyle"><Sel value={p.style || "icons-only"} onValueChange={v => upd({ style: v })} items={[{ v: "icons-only", l: "Icons" }, { v: "with-labels", l: "Labels" }, { v: "colored-bg", l: "Colored" }]} /></Field>
        <Field k="studio.block.size"><Sel value={p.size || "md"} onValueChange={v => upd({ size: v })} items={[{ v: "sm", l: "S" }, { v: "md", l: "M" }, { v: "lg", l: "L" }]} /></Field>
      </div>
    </div>
  );
}

// ─── Logo Cloud Editor ────────────────────────────────
export function LogoCloudEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "logoCloud") return null;
  const p = block.props; const items = p.items;
  const upd = (patch: Record<string, unknown>) => onChange({ type: "logoCloud", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <Input value={item.src} onChange={e => { const u = [...items]; u[i] = { ...u[i], src: e.target.value }; upd({ items: u }); }} className="h-7 flex-1 text-xs" placeholder="Logo URL" />
          <Input value={item.alt} onChange={e => { const u = [...items]; u[i] = { ...u[i], alt: e.target.value }; upd({ items: u }); }} className="h-7 w-20 text-xs" placeholder="Alt" />
          <button onClick={() => upd({ items: items.filter((_, j) => j !== i) })} className="p-0.5 text-destructive/60 hover:text-destructive"><X className="h-3 w-3" /></button>
        </div>
      ))}
      {items.length < 8 && <button onClick={() => upd({ items: [...items, { src: "", alt: "" }] })} className="flex items-center gap-1 text-[10px] text-primary hover:underline"><Plus className="h-3 w-3" />{t("studio.block.addLogo")}</button>}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1"><Switch checked={!!p.grayscale} onCheckedChange={v => upd({ grayscale: v })} /><span className="text-[10px] text-muted-foreground">{t("studio.block.grayscale")}</span></div>
        <Field k="studio.block.size"><Sel value={p.size || "md"} onValueChange={v => upd({ size: v })} items={[{ v: "sm", l: "S" }, { v: "md", l: "M" }, { v: "lg", l: "L" }]} /></Field>
      </div>
    </div>
  );
}

// ─── Rating Editor ────────────────────────────────────
export function RatingEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "rating") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) => onChange({ type: "rating", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      <Field k="studio.block.ratingValue"><Input type="number" min={0} max={5} step={0.5} value={p.value} onChange={e => upd({ value: +e.target.value })} className="h-7 text-xs" /></Field>
      <Field k="studio.block.ratingLabel"><Input value={p.label || ""} onChange={e => upd({ label: e.target.value.slice(0, 100) })} className="h-7 text-xs" /></Field>
      <div className="grid grid-cols-3 gap-1">
        <Field k="studio.block.displayStyle"><Sel value={p.style || "stars"} onValueChange={v => upd({ style: v })} items={[{ v: "stars", l: "★" }, { v: "hearts", l: "♥" }, { v: "number-badge", l: "#" }]} /></Field>
        <Field k="studio.block.size"><Sel value={p.size || "md"} onValueChange={v => upd({ size: v })} items={[{ v: "sm", l: "S" }, { v: "md", l: "M" }, { v: "lg", l: "L" }]} /></Field>
        <Field k="studio.block.ratingColor"><Input type="color" value={p.color || "#eab308"} onChange={e => upd({ color: e.target.value })} className="h-7 w-full px-1" /></Field>
      </div>
    </div>
  );
}

// ─── Icon Row Editor ──────────────────────────────────
export function IconRowEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "iconRow") return null;
  const p = block.props; const items = p.items;
  const upd = (patch: Record<string, unknown>) => onChange({ type: "iconRow", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <Input value={item.icon} onChange={e => { const u = [...items]; u[i] = { ...u[i], icon: e.target.value }; upd({ items: u }); }} className="h-7 w-10 text-xs text-center px-0" placeholder="🔗" />
          <Input value={item.label || ""} onChange={e => { const u = [...items]; u[i] = { ...u[i], label: e.target.value }; upd({ items: u }); }} className="h-7 flex-1 text-xs" placeholder="Label" />
          <button onClick={() => upd({ items: items.filter((_, j) => j !== i) })} className="p-0.5 text-destructive/60 hover:text-destructive"><X className="h-3 w-3" /></button>
        </div>
      ))}
      {items.length < 6 && <button onClick={() => upd({ items: [...items, { icon: "🔗", label: "" }] })} className="flex items-center gap-1 text-[10px] text-primary hover:underline"><Plus className="h-3 w-3" />{t("studio.block.addIcon")}</button>}
      <div className="flex items-center gap-1"><Switch checked={p.showLabels !== false} onCheckedChange={v => upd({ showLabels: v })} /><span className="text-[10px] text-muted-foreground">{t("studio.block.showLabels")}</span></div>
    </div>
  );
}

// ─── Video Editor ─────────────────────────────────────
export function VideoEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "video") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) => onChange({ type: "video", props: { ...p, ...patch } });
  const valid = !p.url || isValidVideoUrl(p.url);
  return (
    <div className="space-y-1.5">
      <Field k="studio.block.videoUrl"><Input value={p.url} onChange={e => upd({ url: e.target.value })} className={`h-7 text-xs ${!valid ? "border-destructive" : ""}`} placeholder="https://youtube.com/..." /></Field>
      {!valid && <p className="text-[9px] text-destructive">{t("studio.block.videoUrlInvalid")}</p>}
      <Field k="studio.block.thumbnailUrl"><Input value={p.thumbnailUrl || ""} onChange={e => upd({ thumbnailUrl: e.target.value })} className="h-7 text-xs" placeholder="Auto-detected" /></Field>
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.aspectRatio"><Sel value={p.aspectRatio || "16:9"} onValueChange={v => upd({ aspectRatio: v })} items={[{ v: "16:9", l: "16:9" }, { v: "4:3", l: "4:3" }]} /></Field>
        <Field k="studio.block.playBtn"><Sel value={p.playButtonStyle || "centered"} onValueChange={v => upd({ playButtonStyle: v })} items={[{ v: "centered", l: "Center" }, { v: "corner", l: "Corner" }]} /></Field>
      </div>
      <Field k="studio.block.overlayText"><Input value={p.overlayText || ""} onChange={e => upd({ overlayText: e.target.value })} className="h-7 text-xs" /></Field>
    </div>
  );
}

// ─── Countdown Editor ─────────────────────────────────
export function CountdownEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "countdown") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) => onChange({ type: "countdown", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      <Field k="studio.block.targetDate"><Input type="datetime-local" value={p.targetDate?.slice(0, 16) || ""} onChange={e => upd({ targetDate: new Date(e.target.value).toISOString() })} className="h-7 text-xs" /></Field>
      <Field k="studio.block.countdownLabel"><Input value={p.label || ""} onChange={e => upd({ label: e.target.value })} className="h-7 text-xs" /></Field>
      <Field k="studio.block.expiredText"><Input value={p.expiredText || ""} onChange={e => upd({ expiredText: e.target.value })} className="h-7 text-xs" /></Field>
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.displayStyle"><Sel value={p.style || "simple"} onValueChange={v => upd({ style: v })} items={[{ v: "simple", l: "Simple" }, { v: "flip", l: "Flip" }, { v: "minimal", l: "Minimal" }]} /></Field>
      </div>
      <div className="flex items-center gap-1"><Switch checked={p.showLabels !== false} onCheckedChange={v => upd({ showLabels: v })} /><span className="text-[10px] text-muted-foreground">{t("studio.block.showLabels")}</span></div>
    </div>
  );
}

// ─── Accordion Editor ─────────────────────────────────
export function AccordionEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "accordion") return null;
  const p = block.props; const items = p.items;
  const upd = (patch: Record<string, unknown>) => onChange({ type: "accordion", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="space-y-0.5 rounded border border-border/50 p-1.5">
          <div className="flex items-center gap-1">
            <Input value={item.title} onChange={e => { const u = [...items]; u[i] = { ...u[i], title: e.target.value }; upd({ items: u }); }} className="h-7 flex-1 text-xs" placeholder={t("studio.block.accordionTitle")} />
            <button onClick={() => upd({ items: items.filter((_, j) => j !== i) })} className="p-0.5 text-destructive/60 hover:text-destructive"><X className="h-3 w-3" /></button>
          </div>
          <textarea value={item.content} onChange={e => { const u = [...items]; u[i] = { ...u[i], content: e.target.value }; upd({ items: u }); }} rows={2} className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs resize-y focus:border-primary focus:outline-none" placeholder={t("studio.block.accordionContent")} />
        </div>
      ))}
      {items.length < 5 && <button onClick={() => upd({ items: [...items, { title: "", content: "" }] })} className="flex items-center gap-1 text-[10px] text-primary hover:underline"><Plus className="h-3 w-3" />{t("studio.block.addItem")}</button>}
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.displayStyle"><Sel value={p.style || "bordered"} onValueChange={v => upd({ style: v })} items={[{ v: "bordered", l: "Bordered" }, { v: "ghost", l: "Ghost" }, { v: "card", l: "Card" }]} /></Field>
        <Field k="studio.block.iconPosition"><Sel value={p.iconPosition || "right"} onValueChange={v => upd({ iconPosition: v })} items={[{ v: "left", l: "←" }, { v: "right", l: "→" }]} /></Field>
      </div>
      <div className="flex items-center gap-1"><Switch checked={!!p.allowMultiple} onCheckedChange={v => upd({ allowMultiple: v })} /><span className="text-[10px] text-muted-foreground">{t("studio.block.allowMultiple")}</span></div>
    </div>
  );
}

// ─── Progress Steps Editor ────────────────────────────
export function ProgressStepsEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "progressSteps") return null;
  const p = block.props; const items = p.items;
  const upd = (patch: Record<string, unknown>) => onChange({ type: "progressSteps", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground w-4">{i + 1}</span>
          <Input value={item.label} onChange={e => { const u = [...items]; u[i] = { ...u[i], label: e.target.value }; upd({ items: u }); }} className="h-7 flex-1 text-xs" placeholder="Step label" />
          <button onClick={() => upd({ items: items.filter((_, j) => j !== i) })} className="p-0.5 text-destructive/60 hover:text-destructive"><X className="h-3 w-3" /></button>
        </div>
      ))}
      {items.length < 5 && <button onClick={() => upd({ items: [...items, { label: "" }] })} className="flex items-center gap-1 text-[10px] text-primary hover:underline"><Plus className="h-3 w-3" />{t("studio.block.addStep")}</button>}
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.activeStep"><Input type="number" min={0} max={items.length - 1} value={p.activeStep ?? 0} onChange={e => upd({ activeStep: +e.target.value })} className="h-7 text-xs" /></Field>
        <Field k="studio.block.displayStyle"><Sel value={p.style || "horizontal"} onValueChange={v => upd({ style: v })} items={[{ v: "horizontal", l: "Horizontal" }, { v: "vertical", l: "Vertical" }]} /></Field>
      </div>
    </div>
  );
}

// ─── Avatar Stack Editor ──────────────────────────────
export function AvatarStackEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "avatarStack") return null;
  const p = block.props; const urls = p.avatarUrls;
  const upd = (patch: Record<string, unknown>) => onChange({ type: "avatarStack", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      {urls.map((url, i) => (
        <div key={i} className="flex items-center gap-1">
          <Input value={url} onChange={e => { const u = [...urls]; u[i] = e.target.value; upd({ avatarUrls: u }); }} className="h-7 flex-1 text-xs" placeholder="Avatar URL" />
          <button onClick={() => upd({ avatarUrls: urls.filter((_, j) => j !== i) })} className="p-0.5 text-destructive/60 hover:text-destructive"><X className="h-3 w-3" /></button>
        </div>
      ))}
      {urls.length < 5 && <button onClick={() => upd({ avatarUrls: [...urls, ""] })} className="flex items-center gap-1 text-[10px] text-primary hover:underline"><Plus className="h-3 w-3" />{t("studio.block.addAvatar")}</button>}
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.totalCount"><Input value={p.totalCount || ""} onChange={e => upd({ totalCount: e.target.value })} className="h-7 text-xs" placeholder="1,200+" /></Field>
        <Field k="studio.block.size"><Sel value={p.size || "md"} onValueChange={v => upd({ size: v })} items={[{ v: "sm", l: "S" }, { v: "md", l: "M" }, { v: "lg", l: "L" }]} /></Field>
      </div>
      <Field k="studio.block.stackLabel"><Input value={p.label || ""} onChange={e => upd({ label: e.target.value })} className="h-7 text-xs" placeholder="Trusted by developers" /></Field>
    </div>
  );
}

// ─── Gradient Text Editor ─────────────────────────────
export function GradientTextEditor({ block, onChange }: P) {
  const { t } = useI18n();
  if (block.type !== "gradientText") return null;
  const p = block.props;
  const upd = (patch: Record<string, unknown>) => onChange({ type: "gradientText", props: { ...p, ...patch } });
  return (
    <div className="space-y-1.5">
      <Field k="studio.block.gradientTextContent"><Input value={p.text} onChange={e => upd({ text: e.target.value.slice(0, 200) })} className="h-7 text-xs" /></Field>
      <div className="grid grid-cols-2 gap-1">
        <Field k="studio.block.fromColor"><Input type="color" value={p.fromColor || "#6366f1"} onChange={e => upd({ fromColor: e.target.value })} className="h-7 w-full px-1" /></Field>
        <Field k="studio.block.toColor"><Input type="color" value={p.toColor || "#ec4899"} onChange={e => upd({ toColor: e.target.value })} className="h-7 w-full px-1" /></Field>
      </div>
      <div className="grid grid-cols-3 gap-1">
        <Field k="studio.block.direction"><Sel value={p.direction || "left-right"} onValueChange={v => upd({ direction: v })} items={[{ v: "left-right", l: "→" }, { v: "top-bottom", l: "↓" }, { v: "diagonal", l: "↘" }]} /></Field>
        <Field k="studio.block.fontSize"><Sel value={p.fontSize || "2xl"} onValueChange={v => upd({ fontSize: v })} items={[{ v: "lg", l: "L" }, { v: "xl", l: "XL" }, { v: "2xl", l: "2XL" }, { v: "3xl", l: "3XL" }, { v: "4xl", l: "4XL" }]} /></Field>
        <Field k="studio.block.alignment"><Sel value={p.alignment || "center"} onValueChange={v => upd({ alignment: v })} items={[{ v: "left", l: "←" }, { v: "center", l: "↔" }, { v: "right", l: "→" }]} /></Field>
      </div>
    </div>
  );
}

// ─── Master Switch ────────────────────────────────────
export function InlineEditor(props: P) {
  const { block } = props;
  let editor: React.ReactNode = null;
  switch (block.type) {
    case "text": editor = <TextEditor {...props} />; break;
    case "image": editor = <ImageEditor {...props} />; break;
    case "featureList": editor = <FeatureListEditor {...props} />; break;
    case "testimonial": editor = <TestimonialEditor {...props} />; break;
    case "ctaButton": editor = <CtaEditor {...props} />; break;
    case "divider": editor = <DividerEditor {...props} />; break;
    case "heading": editor = <HeadingEditor {...props} />; break;
    case "badge": editor = <BadgeEditor {...props} />; break;
    case "spacer": editor = <SpacerEditor {...props} />; break;
    case "alert": editor = <AlertEditor {...props} />; break;
    case "statsRow": editor = <StatsRowEditor {...props} />; break;
    case "socialLinks": editor = <SocialLinksEditor {...props} />; break;
    case "logoCloud": editor = <LogoCloudEditor {...props} />; break;
    case "rating": editor = <RatingEditor {...props} />; break;
    case "iconRow": editor = <IconRowEditor {...props} />; break;
    case "video": editor = <VideoEditor {...props} />; break;
    case "countdown": editor = <CountdownEditor {...props} />; break;
    case "accordion": editor = <AccordionEditor {...props} />; break;
    case "progressSteps": editor = <ProgressStepsEditor {...props} />; break;
    case "avatarStack": editor = <AvatarStackEditor {...props} />; break;
    case "gradientText": editor = <GradientTextEditor {...props} />; break;
  }
  return <>{editor}<BasePropsEditor {...props} /></>;
}
