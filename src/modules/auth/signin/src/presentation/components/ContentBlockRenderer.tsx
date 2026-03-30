/**
 * ContentBlockRenderer — 21 block types with animations + visibility
 *
 * SECURITY: Zero dangerouslySetInnerHTML. All text escaped. URLs validated.
 * Every block wrapped in BlockErrorBoundary + BlockWrapper (animation/visibility).
 */
"use client";

import { Component, type ReactNode, useState, useEffect, useMemo } from "react";
import { Button } from "@core/ui/button";
import {
  type ContentBlock,
  type TextBlock,
  type ImageBlock,
  type FeatureListBlock,
  type TestimonialBlock,
  type CtaButtonBlock,
  type DividerBlock,
  type HeadingBlock,
  type BadgeBlock,
  type SpacerBlock,
  type AlertBlock,
  type StatsRowBlock,
  type SocialLinksBlock,
  type LogoCloudBlock,
  type RatingBlock,
  type IconRowBlock,
  type VideoBlock,
  type CountdownBlock,
  type AccordionBlock,
  type ProgressStepsBlock,
  type AvatarStackBlock,
  type GradientTextBlock,
  type BaseBlockProps,
  isValidCtaUrl,
  isValidVideoUrl,
} from "@modules/auth/core/domain/entities/LoginBrandingTypes";

// ─── Error Boundary ───────────────────────────────────
class BlockErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}

// ─── Animation + Wrapper ──────────────────────────────
const ANIMATION_STYLES: Record<string, React.CSSProperties> = {
  "none": {},
  "fade-in": { animation: "fadeIn 0.6s ease-out both" },
  "slide-up": { animation: "slideUp 0.5s ease-out both" },
  "slide-left": { animation: "slideLeft 0.5s ease-out both" },
  "slide-right": { animation: "slideRight 0.5s ease-out both" },
  "scale-in": { animation: "scaleIn 0.4s ease-out both" },
  "bounce": { animation: "bounceIn 0.6s ease-out both" },
};

const PADDING_PX: Record<string, string> = { none: "0", sm: "6px", md: "12px", lg: "20px" };
const MARGIN_PX: Record<string, string> = { none: "0", sm: "8px", md: "16px", lg: "28px" };

function BlockWrapper({ props, children }: { props: BaseBlockProps; children: ReactNode }) {
  if (props.visible === false) return null;
  const animStyle = ANIMATION_STYLES[props.animation || "none"] || {};
  const pad = PADDING_PX[props.padding || "none"] || "0";
  const mar = MARGIN_PX[props.marginBottom || "none"] || "0";
  const hasStyles = Object.keys(animStyle).length > 0 || pad !== "0" || mar !== "0";
  if (!hasStyles) return <>{children}</>;
  return (
    <div style={{ ...animStyle, padding: pad !== "0" ? pad : undefined, marginBottom: mar !== "0" ? mar : undefined }}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// EXISTING BLOCKS (Enhanced)
// ═══════════════════════════════════════════════════════

const FONT_SIZE_MAP: Record<string, string> = { sm: "text-sm", base: "text-base", lg: "text-lg", xl: "text-xl", "2xl": "text-2xl" };
const FONT_WEIGHT_MAP: Record<string, string> = { normal: "font-normal", medium: "font-medium", semibold: "font-semibold", bold: "font-bold", extrabold: "font-extrabold" };
const SHADOW_MAP: Record<string, string> = { none: "", sm: "shadow-sm", md: "shadow-md", lg: "shadow-lg", xl: "shadow-xl" };
const ALIGN_MAP: Record<string, string> = { left: "text-start", center: "text-center", right: "text-end" };

function TextBlockView({ block }: { block: TextBlock }) {
  const p = block.props;
  const content = (p.content || "").slice(0, 500);
  const sz = FONT_SIZE_MAP[p.fontSize || "base"] || "text-base";
  const wt = FONT_WEIGHT_MAP[p.fontWeight || "normal"] || "font-normal";
  const al = ALIGN_MAP[p.alignment || "left"] || "";
  const tt = p.textTransform === "uppercase" ? "uppercase" : p.textTransform === "capitalize" ? "capitalize" : "";
  const color = p.color && p.color !== "auto"
    ? p.color === "primary" ? "text-[var(--login-primary,hsl(var(--primary)))]"
      : p.color === "muted" ? "text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"
        : "" : "text-[var(--login-text-muted,hsl(var(--muted-foreground)))]";
  const customColor = p.color && !["auto","primary","muted"].includes(p.color) ? { color: p.color } : {};
  const lc = p.lineClamp && p.lineClamp > 0 ? { WebkitLineClamp: p.lineClamp, display: "-webkit-box", WebkitBoxOrient: "vertical" as const, overflow: "hidden" } : {};
  const mw = p.maxWidth ? { maxWidth: p.maxWidth } : {};
  return (
    <p
      className={`leading-relaxed ${sz} ${wt} ${al} ${tt} ${color} ${p.highlight ? "bg-[var(--login-primary,hsl(var(--primary)))]/10 rounded px-2 py-1 inline" : ""}`}
      style={{ ...customColor, ...lc, ...mw }}
    >
      {content}
    </p>
  );
}

const HOVER_MAP: Record<string, string> = { none: "", zoom: "hover:scale-105 transition-transform duration-300", brightness: "hover:brightness-110 transition-all duration-300", grayscale: "grayscale hover:grayscale-0 transition-all duration-500" };
const ASPECT_MAP: Record<string, string> = { auto: "", "1:1": "aspect-square", "16:9": "aspect-video", "4:3": "aspect-[4/3]" };

function ImageBlockView({ block }: { block: ImageBlock }) {
  const p = block.props;
  const shadow = SHADOW_MAP[p.shadow || "none"] || "";
  const hover = HOVER_MAP[p.hoverEffect || "none"] || "";
  const aspect = ASPECT_MAP[p.aspectRatio || "auto"] || "";
  const radius = p.borderRadius != null ? `${p.borderRadius}px` : "0.75rem";
  const fit = p.objectFit || "cover";
  const img = (
    <div className={`overflow-hidden ${shadow} ${aspect}`} style={{ maxWidth: p.maxWidth || "100%", maxHeight: p.maxHeight ? `${p.maxHeight}px` : undefined, borderRadius: radius }}>
      <img
        src={p.src} alt={p.alt || ""} loading="lazy"
        className={`h-full w-full ${hover}`}
        style={{ objectFit: fit }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
    </div>
  );
  const captioned = p.caption ? (
    <figure>
      {img}
      <figcaption className="mt-1.5 text-xs text-center text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">{p.caption}</figcaption>
    </figure>
  ) : img;
  if (p.linkUrl && isValidCtaUrl(p.linkUrl)) {
    return <a href={p.linkUrl} target="_blank" rel="noopener noreferrer">{captioned}</a>;
  }
  return captioned;
}

function FeatureListBlockView({ block }: { block: FeatureListBlock }) {
  const p = block.props;
  const items = (p.items || []).slice(0, 6);
  const cols = p.columns === 2 ? "grid-cols-2" : p.columns === 3 ? "grid-cols-3" : "grid-cols-1";
  const iconSz = p.iconSize === "sm" ? "h-8 w-8 text-sm" : p.iconSize === "lg" ? "h-14 w-14 text-xl" : "h-11 w-11 text-lg";
  const gapCls = p.compactMode ? "gap-3" : "gap-6";
  return (
    <div className={`grid ${gapCls} ${cols}`}>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3 group">
          <div
            className={`flex ${iconSz} shrink-0 items-center justify-center rounded-xl border border-[var(--login-accent,hsl(var(--border)))] bg-[var(--login-surface,hsl(var(--background)))] shadow-sm transition-colors group-hover:bg-[var(--login-primary,hsl(var(--muted)))]/10`}
            style={p.iconColor && p.iconColor !== "auto" && p.iconColor !== "primary" ? { color: p.iconColor } : undefined}
          >
            {p.numberedMode ? <span className="font-bold">{i + 1}</span> : <span>{item.icon}</span>}
          </div>
          <div className="pt-0.5">
            <h3 className="text-sm font-semibold" style={p.titleColor ? { color: p.titleColor } : { color: "var(--login-text, hsl(var(--foreground)))" }}>{item.title}</h3>
            {!p.compactMode && <p className="mt-1 text-sm text-[var(--login-text-muted,hsl(var(--muted-foreground)))] font-normal leading-relaxed">{item.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function TestimonialBlockView({ block }: { block: TestimonialBlock }) {
  const p = block.props;
  const ds = p.displayStyle || "card";
  const stars = p.rating ? Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < Math.round(p.rating!) ? "text-yellow-400" : "text-gray-300"}>★</span>
  )) : null;

  if (ds === "large-quote") {
    return (
      <div className="py-4">
        <div className="text-4xl font-serif text-[var(--login-primary,hsl(var(--primary)))] leading-none mb-2">&ldquo;</div>
        <p className="text-lg italic leading-relaxed text-[var(--login-text,hsl(var(--foreground)))]">{p.quote}</p>
        {stars && <div className="mt-2 flex gap-0.5 text-sm">{stars}</div>}
        <div className="mt-3 flex items-center gap-3">
          {p.avatar && <img src={p.avatar} alt={p.author} className="h-10 w-10 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
          <div>
            <p className="text-sm font-semibold text-[var(--login-text,hsl(var(--foreground)))]">{p.author}</p>
            {p.role && <p className="text-xs text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">{p.role}{p.companyName ? ` · ${p.companyName}` : ""}</p>}
          </div>
          {p.companyLogo && <img src={p.companyLogo} alt={p.companyName || ""} className="h-6 ms-auto" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
        </div>
      </div>
    );
  }
  if (ds === "minimal") {
    return (
      <div className="py-2">
        <p className="text-sm italic text-[var(--login-text,hsl(var(--foreground)))]">&ldquo;{p.quote}&rdquo;</p>
        {stars && <div className="mt-1 flex gap-0.5 text-xs">{stars}</div>}
        <p className="mt-1 text-xs text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">— {p.author}{p.role ? `, ${p.role}` : ""}</p>
      </div>
    );
  }
  if (ds === "bubble") {
    return (
      <div>
        <div className="relative rounded-2xl bg-[var(--login-surface,hsl(var(--background)))]/50 p-4 backdrop-blur-sm" style={p.borderColor ? { borderColor: p.borderColor, borderWidth: 1, borderStyle: "solid" } : { border: "1px solid var(--login-accent, hsl(var(--border)))" }}>
          <p className="text-sm italic text-[var(--login-text,hsl(var(--foreground)))]">{p.quote}</p>
          {stars && <div className="mt-2 flex gap-0.5 text-xs">{stars}</div>}
          <div className="absolute -bottom-2 start-6 h-4 w-4 rotate-45 bg-[var(--login-surface,hsl(var(--background)))]/50" style={p.borderColor ? { borderRight: `1px solid ${p.borderColor}`, borderBottom: `1px solid ${p.borderColor}` } : { borderRight: "1px solid var(--login-accent, hsl(var(--border)))", borderBottom: "1px solid var(--login-accent, hsl(var(--border)))" }} />
        </div>
        <div className="mt-4 flex items-center gap-3 ps-2">
          {p.avatar && <img src={p.avatar} alt={p.author} className="h-8 w-8 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
          <div>
            <p className="text-sm font-semibold text-[var(--login-text,hsl(var(--foreground)))]">{p.author}</p>
            {p.role && <p className="text-xs text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">{p.role}</p>}
          </div>
        </div>
      </div>
    );
  }
  // default "card"
  return (
    <blockquote className="rounded-2xl border bg-[var(--login-surface,hsl(var(--background)))]/50 p-6 backdrop-blur-sm" style={p.borderColor ? { borderColor: p.borderColor } : { borderColor: "var(--login-accent, hsl(var(--border)))" }}>
      <p className="text-sm italic leading-relaxed text-[var(--login-text,hsl(var(--foreground)))]">&ldquo;{p.quote}&rdquo;</p>
      {stars && <div className="mt-2 flex gap-0.5 text-sm">{stars}</div>}
      <div className="mt-4 flex items-center gap-3">
        {p.avatar && <img src={p.avatar} alt={p.author} className="h-8 w-8 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
        <div>
          <p className="text-sm font-semibold text-[var(--login-text,hsl(var(--foreground)))]">{p.author}</p>
          {p.role && <p className="text-xs text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">{p.role}{p.companyName ? ` · ${p.companyName}` : ""}</p>}
        </div>
        {p.companyLogo && <img src={p.companyLogo} alt={p.companyName || ""} className="h-6 ms-auto" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
      </div>
    </blockquote>
  );
}

function CtaButtonBlockView({ block }: { block: CtaButtonBlock }) {
  const p = block.props;
  if (!isValidCtaUrl(p.url)) return null;
  const sizeMap: Record<string, string> = { sm: "h-8 px-3 text-xs", md: "min-h-[44px] min-w-[44px] px-4", lg: "h-12 px-6 text-base", xl: "h-14 px-8 text-lg" };
  const sizeCls = sizeMap[p.size || "md"] || sizeMap.md;
  const fullCls = p.fullWidth ? "w-full" : "";
  const customStyle: React.CSSProperties = {};
  if (p.color && !["primary","secondary","success"].includes(p.color)) { customStyle.backgroundColor = p.color; customStyle.borderColor = p.color; customStyle.color = "#fff"; }
  if (p.borderRadius != null) customStyle.borderRadius = `${p.borderRadius}px`;
  return (
    <div>
      <Button
        variant={p.variant === "outline" ? "outline" : p.variant === "ghost" ? "ghost" : "default"}
        className={`${sizeCls} ${fullCls} ${p.shadow ? "shadow-lg" : ""}`}
        style={customStyle}
        asChild
      >
        <a href={p.url} target="_blank" rel="noopener noreferrer">
          {p.icon && <span className="me-1.5">{p.icon}</span>}
          {p.label}
        </a>
      </Button>
      {p.secondaryText && <p className="mt-1 text-xs text-center text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">{p.secondaryText}</p>}
    </div>
  );
}

function DividerBlockView({ block }: { block: DividerBlock }) {
  const p = block.props;
  const style = p.style || "line";
  if (style === "space") return <div style={{ height: `${(p.thickness || 1) * 6}px` }} />;
  if (style === "dots") {
    return (
      <div className="flex items-center justify-center gap-1.5 py-3" style={{ width: p.width ? `${p.width}%` : "100%", margin: "0 auto" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-1 w-1 rounded-full" style={{ backgroundColor: p.color && p.color !== "auto" ? p.color : "var(--login-text-muted, hsl(var(--muted-foreground)))", opacity: 0.4 }} />
        ))}
      </div>
    );
  }
  // Line with optional label
  const borderStyle = p.lineStyle || "solid";
  const thickness = `${p.thickness || 1}px`;
  const divColor = p.color && p.color !== "auto" ? p.color : "var(--login-accent, hsl(var(--border)))";
  if (p.label) {
    return (
      <div className="flex items-center gap-3" style={{ width: p.width ? `${p.width}%` : "100%", margin: "0 auto" }}>
        <div className="flex-1" style={{ borderTop: `${thickness} ${borderStyle} ${divColor}` }} />
        <span className="text-xs text-[var(--login-text-muted,hsl(var(--muted-foreground)))] px-2" style={p.labelBg ? { backgroundColor: p.labelBg, borderRadius: "4px", padding: "2px 8px" } : undefined}>{p.label}</span>
        <div className="flex-1" style={{ borderTop: `${thickness} ${borderStyle} ${divColor}` }} />
      </div>
    );
  }
  return <hr style={{ borderTop: `${thickness} ${borderStyle} ${divColor}`, width: p.width ? `${p.width}%` : "100%", margin: "0 auto", borderBottom: "none", borderLeft: "none", borderRight: "none" }} />;
}

// ═══════════════════════════════════════════════════════
// NEW BLOCKS (15 types)
// ═══════════════════════════════════════════════════════

function HeadingBlockView({ block }: { block: HeadingBlock }) {
  const p = block.props;
  const Tag = p.level || "h3";
  const sizeMap: Record<string, string> = { h2: "text-2xl font-bold", h3: "text-xl font-semibold", h4: "text-lg font-semibold" };
  const al = ALIGN_MAP[p.alignment || "left"] || "";
  const tt = p.textTransform === "uppercase" ? "uppercase" : p.textTransform === "capitalize" ? "capitalize" : "";
  const underline = p.underlineAccent === "primary"
    ? "border-b-2 border-[var(--login-primary,hsl(var(--primary)))] pb-2 inline-block"
    : p.underlineAccent === "gradient"
      ? "pb-2 inline-block" : "";
  return (
    <div className={al}>
      <Tag
        className={`${sizeMap[Tag]} ${tt} ${underline} text-[var(--login-text,hsl(var(--foreground)))]`}
        style={p.color ? { color: p.color } : undefined}
      >
        {(p.text || "").slice(0, 200)}
      </Tag>
      {p.underlineAccent === "gradient" && (
        <div className="mt-1 h-0.5 rounded-full bg-gradient-to-r from-[var(--login-primary,hsl(var(--primary)))] to-[var(--login-secondary,hsl(var(--secondary)))]" style={{ width: "60px" }} />
      )}
    </div>
  );
}

function BadgeBlockView({ block }: { block: BadgeBlock }) {
  const p = block.props;
  const variants: Record<string, string> = {
    success: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    info: "bg-blue-500/15 text-blue-600 border-blue-500/30",
    neutral: "bg-gray-500/15 text-gray-600 border-gray-500/30",
    premium: "bg-gradient-to-r from-amber-500/15 to-yellow-500/15 text-amber-600 border-amber-500/30",
  };
  const sz = p.size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-3 py-1";
  const rounded = p.pill !== false ? "rounded-full" : "rounded-md";
  return (
    <span className={`inline-flex items-center gap-1 border font-medium ${variants[p.variant] || variants.neutral} ${sz} ${rounded}`}>
      {p.icon && <span>{p.icon}</span>}
      {(p.label || "").slice(0, 50)}
    </span>
  );
}

function SpacerBlockView({ block }: { block: SpacerBlock }) {
  return <div style={{ height: `${Math.min(Math.max(block.props.height || 16, 8), 80)}px` }} />;
}

function AlertBlockView({ block }: { block: AlertBlock }) {
  const p = block.props;
  const variants: Record<string, { bg: string; border: string; icon: string }> = {
    info: { bg: "bg-blue-500/10", border: "border-blue-500/30", icon: "ℹ️" },
    warning: { bg: "bg-amber-500/10", border: "border-amber-500/30", icon: "⚠️" },
    success: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: "✅" },
    error: { bg: "bg-red-500/10", border: "border-red-500/30", icon: "❌" },
  };
  const v = variants[p.variant] || variants.info;
  return (
    <div className={`rounded-lg border ${v.border} ${v.bg} ${p.compact ? "px-3 py-2" : "px-4 py-3"}`}>
      <div className="flex items-start gap-2">
        {p.showIcon !== false && <span className="shrink-0">{v.icon}</span>}
        <div>
          {p.title && <p className="text-sm font-semibold text-[var(--login-text,hsl(var(--foreground)))]">{p.title}</p>}
          <p className={`text-sm text-[var(--login-text-muted,hsl(var(--muted-foreground)))] ${p.title ? "mt-0.5" : ""}`}>{(p.message || "").slice(0, 300)}</p>
        </div>
      </div>
    </div>
  );
}

function StatsRowBlockView({ block }: { block: StatsRowBlock }) {
  const p = block.props;
  const items = (p.items || []).slice(0, 4);
  const sz = p.size === "sm" ? "text-xl" : p.size === "lg" ? "text-4xl" : "text-2xl";
  const layout = p.layout === "grid" ? "grid grid-cols-2 gap-4" : "flex flex-wrap gap-6 justify-center";
  return (
    <div className={layout}>
      {items.map((item, i) => (
        <div key={i} className="text-center">
          {item.icon && <span className="text-lg mb-1 block">{item.icon}</span>}
          <div className={`${sz} font-bold text-[var(--login-primary,hsl(var(--primary)))]`}>{item.value}</div>
          <div className="text-xs text-[var(--login-text-muted,hsl(var(--muted-foreground)))] mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

const SOCIAL_ICONS: Record<string, string> = {
  twitter: "𝕏", x: "𝕏", facebook: "f", instagram: "📷", linkedin: "in",
  github: "🐙", youtube: "▶", tiktok: "♪", discord: "💬", reddit: "🔴",
  dribbble: "🏀", behance: "Bē", medium: "M", pinterest: "📌", whatsapp: "💬",
};

function SocialLinksBlockView({ block }: { block: SocialLinksBlock }) {
  const p = block.props;
  const items = (p.items || []).slice(0, 8);
  const sz = p.size === "sm" ? "h-8 w-8 text-xs" : p.size === "lg" ? "h-12 w-12 text-lg" : "h-10 w-10 text-sm";
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {items.map((item, i) => {
        if (!isValidCtaUrl(item.url)) return null;
        const icon = SOCIAL_ICONS[item.platform.toLowerCase()] || item.platform.charAt(0).toUpperCase();
        return (
          <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
            className={`flex items-center justify-center ${sz} rounded-full border border-[var(--login-accent,hsl(var(--border)))] bg-[var(--login-surface,hsl(var(--background)))]/50 text-[var(--login-text,hsl(var(--foreground)))] hover:bg-[var(--login-primary,hsl(var(--primary)))]/10 transition-colors ${p.style === "with-labels" ? "!w-auto px-3 gap-1.5" : ""} ${p.style === "colored-bg" ? "!bg-[var(--login-primary,hsl(var(--primary)))] !text-white !border-transparent" : ""}`}
          >
            <span>{icon}</span>
            {p.style === "with-labels" && <span className="text-xs">{item.platform}</span>}
          </a>
        );
      })}
    </div>
  );
}

function LogoCloudBlockView({ block }: { block: LogoCloudBlock }) {
  const p = block.props;
  const items = (p.items || []).slice(0, 8);
  const sz = p.size === "sm" ? "h-6" : p.size === "lg" ? "h-12" : "h-8";
  const cols = p.columns === 3 ? "grid-cols-3" : p.columns === 4 ? "grid-cols-4" : "grid-cols-4";
  return (
    <div className={`grid ${cols} gap-4 items-center justify-items-center`}>
      {items.map((item, i) => {
        const img = (
          <img key={i} src={item.src} alt={item.alt || ""} loading="lazy"
            className={`${sz} w-auto object-contain ${p.grayscale ? "grayscale hover:grayscale-0 transition-all duration-300" : ""} opacity-70 hover:opacity-100 transition-opacity`}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        );
        if (item.url && isValidCtaUrl(item.url)) {
          return <a key={i} href={item.url} target="_blank" rel="noopener noreferrer">{img}</a>;
        }
        return img;
      })}
    </div>
  );
}

function RatingBlockView({ block }: { block: RatingBlock }) {
  const p = block.props;
  const v = Math.min(Math.max(p.value || 0, 0), 5);
  const sz = p.size === "sm" ? "text-sm" : p.size === "lg" ? "text-2xl" : "text-lg";
  const color = p.color || "var(--login-primary, hsl(var(--primary)))";
  if (p.style === "number-badge") {
    return (
      <div className="flex items-center gap-2">
        <div className={`${sz} font-bold rounded-lg px-3 py-1`} style={{ backgroundColor: color, color: "#fff" }}>{v.toFixed(1)}</div>
        {p.label && <span className="text-sm text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">{(p.label || "").slice(0, 100)}</span>}
      </div>
    );
  }
  const char = p.style === "hearts" ? "♥" : "★";
  return (
    <div className="flex items-center gap-2">
      <div className={`flex gap-0.5 ${sz}`}>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} style={{ color: i < Math.round(v) ? color : "var(--login-text-muted, hsl(var(--muted-foreground)))", opacity: i < Math.round(v) ? 1 : 0.3 }}>{char}</span>
        ))}
      </div>
      {p.label && <span className="text-sm text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">{(p.label || "").slice(0, 100)}</span>}
    </div>
  );
}

function IconRowBlockView({ block }: { block: IconRowBlock }) {
  const p = block.props;
  const items = (p.items || []).slice(0, 6);
  const gapMap: Record<string, string> = { sm: "gap-2", md: "gap-4", lg: "gap-6" };
  const szMap: Record<string, string> = { sm: "text-lg", md: "text-2xl", lg: "text-3xl" };
  return (
    <div className={`flex flex-wrap items-center justify-center ${gapMap[p.gap || "md"]}`}>
      {items.map((item, i) => {
        const content = (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className={szMap[p.iconSize || "md"]}>{item.icon}</span>
            {p.showLabels !== false && item.label && <span className="text-[10px] text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">{item.label}</span>}
          </div>
        );
        if (item.url && isValidCtaUrl(item.url)) {
          return <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">{content}</a>;
        }
        return content;
      })}
    </div>
  );
}

function VideoBlockView({ block }: { block: VideoBlock }) {
  const p = block.props;
  if (!isValidVideoUrl(p.url)) return <div className="rounded-lg border border-dashed border-[var(--login-accent,hsl(var(--border)))] p-4 text-xs text-center text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">Invalid video URL</div>;
  const aspect = p.aspectRatio === "4:3" ? "aspect-[4/3]" : "aspect-video";
  // Extract YouTube thumbnail
  const ytMatch = p.url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  const thumbnail = p.thumbnailUrl || (ytMatch ? `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg` : undefined);
  return (
    <a href={p.url} target="_blank" rel="noopener noreferrer" className="group block">
      <div className={`relative overflow-hidden rounded-xl ${aspect} bg-black/10`}>
        {thumbnail && <img src={thumbnail} alt="Video thumbnail" className="h-full w-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
          <div className={`flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg group-hover:scale-110 transition-transform ${p.playButtonStyle === "corner" ? "!absolute bottom-3 end-3 !h-10 !w-10" : ""}`}>
            <div className="ms-1 border-y-[8px] border-y-transparent border-s-[14px] border-s-[var(--login-primary,hsl(var(--primary)))]" />
          </div>
        </div>
        {p.overlayText && <div className="absolute bottom-0 start-0 end-0 p-3 bg-gradient-to-t from-black/60 to-transparent"><p className="text-white text-sm font-medium">{p.overlayText}</p></div>}
      </div>
    </a>
  );
}

function CountdownBlockView({ block }: { block: CountdownBlock }) {
  const p = block.props;
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const target = new Date(p.targetDate || "").getTime();
  const diff = Math.max(0, target - now);
  if (diff <= 0 && p.expiredText) return <p className="text-sm text-center text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">{p.expiredText}</p>;
  const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
  const units = [
    { value: d, label: "Days" }, { value: h, label: "Hrs" },
    { value: m, label: "Min" }, { value: s, label: "Sec" },
  ];
  const st = p.style || "simple";
  return (
    <div className="text-center">
      {p.label && <p className="text-sm text-[var(--login-text-muted,hsl(var(--muted-foreground)))] mb-2">{p.label}</p>}
      <div className="flex justify-center gap-3">
        {units.map((u, i) => (
          <div key={i} className={st === "flip" ? "rounded-lg bg-[var(--login-surface,hsl(var(--background)))] border border-[var(--login-accent,hsl(var(--border)))] px-3 py-2 shadow-sm min-w-[52px]" : st === "minimal" ? "min-w-[40px]" : "min-w-[48px]"}>
            <div className={`font-bold tabular-nums text-[var(--login-text,hsl(var(--foreground)))] ${st === "flip" ? "text-2xl" : st === "minimal" ? "text-lg" : "text-xl"}`}>{String(u.value).padStart(2, "0")}</div>
            {p.showLabels !== false && <div className="text-[10px] text-[var(--login-text-muted,hsl(var(--muted-foreground)))] mt-0.5">{u.label}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function AccordionBlockView({ block }: { block: AccordionBlock }) {
  const p = block.props;
  const items = (p.items || []).slice(0, 5);
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const toggle = (i: number) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else { if (!p.allowMultiple) next.clear(); next.add(i); }
      return next;
    });
  };
  const st = p.style || "bordered";
  const iconEnd = p.iconPosition !== "left";
  return (
    <div className={`space-y-1 ${st === "card" ? "" : ""}`}>
      {items.map((item, i) => {
        const isOpen = openItems.has(i);
        return (
          <div key={i} className={`overflow-hidden rounded-lg ${st === "bordered" ? "border border-[var(--login-accent,hsl(var(--border)))]" : st === "card" ? "border border-[var(--login-accent,hsl(var(--border)))] bg-[var(--login-surface,hsl(var(--background)))]/50" : ""}`}>
            <button onClick={() => toggle(i)} className={`flex w-full items-center gap-2 px-4 py-3 text-start text-sm font-medium text-[var(--login-text,hsl(var(--foreground)))] hover:bg-[var(--login-surface,hsl(var(--background)))]/30 transition-colors ${iconEnd ? "justify-between" : ""}`}>
              {!iconEnd && <span className={`text-xs transition-transform ${isOpen ? "rotate-90" : ""}`}>▶</span>}
              <span className="flex-1">{item.title}</span>
              {iconEnd && <span className={`text-xs transition-transform ${isOpen ? "rotate-90" : ""}`}>▶</span>}
            </button>
            {isOpen && <div className="px-4 pb-3 text-sm text-[var(--login-text-muted,hsl(var(--muted-foreground)))] leading-relaxed">{item.content}</div>}
          </div>
        );
      })}
    </div>
  );
}

function ProgressStepsBlockView({ block }: { block: ProgressStepsBlock }) {
  const p = block.props;
  const items = (p.items || []).slice(0, 5);
  const active = p.activeStep ?? 0;
  const isVertical = p.style === "vertical";
  if (isVertical) {
    return (
      <div className="space-y-0">
        {items.map((item, i) => {
          const isDone = i < active, isCurrent = i === active;
          return (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${isDone ? "bg-[var(--login-primary,hsl(var(--primary)))] text-white" : isCurrent ? "border-2 border-[var(--login-primary,hsl(var(--primary)))] text-[var(--login-primary,hsl(var(--primary)))]" : "border-2 border-[var(--login-accent,hsl(var(--border)))] text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"}`}>
                  {isDone ? "✓" : i + 1}
                </div>
                {i < items.length - 1 && <div className={`w-0.5 flex-1 min-h-[24px] ${isDone ? "bg-[var(--login-primary,hsl(var(--primary)))]" : "bg-[var(--login-accent,hsl(var(--border)))]"}`} />}
              </div>
              <div className="pb-6 pt-1">
                <p className={`text-sm font-medium ${isCurrent ? "text-[var(--login-primary,hsl(var(--primary)))]" : "text-[var(--login-text,hsl(var(--foreground)))]"}`}>{item.label}</p>
                {item.description && <p className="text-xs text-[var(--login-text-muted,hsl(var(--muted-foreground)))] mt-0.5">{item.description}</p>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  // Horizontal
  return (
    <div className="flex items-start gap-0">
      {items.map((item, i) => {
        const isDone = i < active, isCurrent = i === active;
        return (
          <div key={i} className="flex flex-1 flex-col items-center text-center">
            <div className="flex items-center w-full">
              {i > 0 && <div className={`flex-1 h-0.5 ${isDone ? "bg-[var(--login-primary,hsl(var(--primary)))]" : "bg-[var(--login-accent,hsl(var(--border)))]"}`} />}
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isDone ? "bg-[var(--login-primary,hsl(var(--primary)))] text-white" : isCurrent ? "border-2 border-[var(--login-primary,hsl(var(--primary)))] text-[var(--login-primary,hsl(var(--primary)))]" : "border-2 border-[var(--login-accent,hsl(var(--border)))] text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"}`}>
                {isDone ? "✓" : i + 1}
              </div>
              {i < items.length - 1 && <div className={`flex-1 h-0.5 ${i < active - 1 || isDone ? "bg-[var(--login-primary,hsl(var(--primary)))]" : "bg-[var(--login-accent,hsl(var(--border)))]"}`} />}
            </div>
            <p className={`text-xs mt-1.5 ${isCurrent ? "font-semibold text-[var(--login-primary,hsl(var(--primary)))]" : "text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"}`}>{item.label}</p>
          </div>
        );
      })}
    </div>
  );
}

function AvatarStackBlockView({ block }: { block: AvatarStackBlock }) {
  const p = block.props;
  const urls = (p.avatarUrls || []).slice(0, 5);
  const sz = p.size === "sm" ? "h-8 w-8" : p.size === "lg" ? "h-12 w-12" : "h-10 w-10";
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {urls.map((url, i) => (
          <img key={i} src={url} alt="" className={`${sz} rounded-full border-2 border-[var(--login-surface,hsl(var(--background)))] object-cover`} loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        ))}
        {p.totalCount && (
          <div className={`${sz} rounded-full border-2 border-[var(--login-surface,hsl(var(--background)))] bg-[var(--login-primary,hsl(var(--primary)))]/10 flex items-center justify-center text-xs font-bold text-[var(--login-primary,hsl(var(--primary)))]`}>
            +{p.totalCount}
          </div>
        )}
      </div>
      {p.label && <span className="text-sm text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">{p.label}</span>}
    </div>
  );
}

function GradientTextBlockView({ block }: { block: GradientTextBlock }) {
  const p = block.props;
  const sz = FONT_SIZE_MAP[p.fontSize || "2xl"] || "text-2xl";
  const wt = FONT_WEIGHT_MAP[p.fontWeight || "bold"] || "font-bold";
  const al = ALIGN_MAP[p.alignment || "center"] || "text-center";
  const dirMap: Record<string, string> = { "left-right": "to right", "top-bottom": "to bottom", diagonal: "to bottom right" };
  const dir = dirMap[p.direction || "left-right"] || "to right";
  return (
    <div className={al}>
      <span
        className={`${sz} ${wt} bg-clip-text text-transparent inline-block`}
        style={{ backgroundImage: `linear-gradient(${dir}, ${p.fromColor || "hsl(var(--primary))"}, ${p.toColor || "hsl(var(--secondary))"})` }}
      >
        {(p.text || "").slice(0, 200)}
      </span>
    </div>
  );
}

// ─── Main Renderer ────────────────────────────────────

interface ContentBlockRendererProps {
  block: ContentBlock;
}

export function ContentBlockRenderer({ block }: ContentBlockRendererProps) {
  return (
    <BlockErrorBoundary>
      <BlockWrapper props={block.props}>
        {renderBlock(block)}
      </BlockWrapper>
    </BlockErrorBoundary>
  );
}

function renderBlock(block: ContentBlock): ReactNode {
  switch (block.type) {
    case "text":          return <TextBlockView block={block} />;
    case "image":         return <ImageBlockView block={block} />;
    case "featureList":   return <FeatureListBlockView block={block} />;
    case "testimonial":   return <TestimonialBlockView block={block} />;
    case "ctaButton":     return <CtaButtonBlockView block={block} />;
    case "divider":       return <DividerBlockView block={block} />;
    case "heading":       return <HeadingBlockView block={block} />;
    case "badge":         return <BadgeBlockView block={block} />;
    case "spacer":        return <SpacerBlockView block={block} />;
    case "alert":         return <AlertBlockView block={block} />;
    case "statsRow":      return <StatsRowBlockView block={block} />;
    case "socialLinks":   return <SocialLinksBlockView block={block} />;
    case "logoCloud":     return <LogoCloudBlockView block={block} />;
    case "rating":        return <RatingBlockView block={block} />;
    case "iconRow":       return <IconRowBlockView block={block} />;
    case "video":         return <VideoBlockView block={block} />;
    case "countdown":     return <CountdownBlockView block={block} />;
    case "accordion":     return <AccordionBlockView block={block} />;
    case "progressSteps": return <ProgressStepsBlockView block={block} />;
    case "avatarStack":   return <AvatarStackBlockView block={block} />;
    case "gradientText":  return <GradientTextBlockView block={block} />;
    default:              return null;
  }
}
