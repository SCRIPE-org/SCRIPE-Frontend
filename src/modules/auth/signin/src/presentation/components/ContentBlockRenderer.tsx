/**
 * ContentBlockRenderer — Renders structured content blocks
 *
 * Each block type is pure data → React component (§12).
 * No dangerouslySetInnerHTML. All text is escaped. CTA URLs validated (§19).
 * Every block wrapped in error boundary (§16).
 */
"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@core/ui/button";
import {
  type ContentBlock,
  type TextBlock,
  type ImageBlock,
  type FeatureListBlock,
  type TestimonialBlock,
  type CtaButtonBlock,
  type DividerBlock,
  isValidCtaUrl,
} from "../../types/login-branding-types";

// ─── Error Boundary (§16 — every block gets one) ──────
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

// ─── Block Renderers ──────────────────────────────────

function TextBlockView({ block }: { block: TextBlock }) {
  const content = (block.props.content || "").slice(0, 500); // Max 500 chars (§12)
  return (
    <p className="text-base leading-relaxed text-[var(--login-text-muted,hsl(var(--muted-foreground)))] font-light">
      {content}
    </p>
  );
}

function ImageBlockView({ block }: { block: ImageBlock }) {
  const { src, alt, maxWidth } = block.props;
  return (
    <div className="overflow-hidden rounded-xl" style={{ maxWidth: maxWidth || "100%" }}>
      <img
        src={src}
        alt={alt || ""}
        className="h-auto w-full object-cover"
        loading="lazy"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
    </div>
  );
}

function FeatureListBlockView({ block }: { block: FeatureListBlock }) {
  const items = (block.props.items || []).slice(0, 6); // Max 6 items (§12)
  return (
    <div className="grid gap-6">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-4 group">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--login-accent,hsl(var(--border)))] bg-[var(--login-surface,hsl(var(--background)))] shadow-sm transition-colors group-hover:bg-[var(--login-primary,hsl(var(--muted)))]/10">
            <span className="text-lg">{item.icon}</span>
          </div>
          <div className="pt-0.5">
            <h3 className="text-sm font-semibold text-[var(--login-text,hsl(var(--foreground)))]">
              {item.title}
            </h3>
            <p className="mt-1 text-sm text-[var(--login-text-muted,hsl(var(--muted-foreground)))] font-light">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TestimonialBlockView({ block }: { block: TestimonialBlock }) {
  const { quote, author, role, avatar } = block.props;
  return (
    <blockquote className="rounded-2xl border border-[var(--login-accent,hsl(var(--border)))] bg-[var(--login-surface,hsl(var(--background)))]/50 p-6 backdrop-blur-sm">
      <p className="text-sm italic leading-relaxed text-[var(--login-text,hsl(var(--foreground)))]">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="mt-4 flex items-center gap-3">
        {avatar && (
          <img
            src={avatar}
            alt={author}
            className="h-8 w-8 rounded-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <div>
          <p className="text-sm font-semibold text-[var(--login-text,hsl(var(--foreground)))]">{author}</p>
          {role && (
            <p className="text-xs text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">{role}</p>
          )}
        </div>
      </div>
    </blockquote>
  );
}

function CtaButtonBlockView({ block }: { block: CtaButtonBlock }) {
  const { label, url, variant = "default" } = block.props;
  // Security: validate URL (§19 — Threat #4)
  if (!isValidCtaUrl(url)) return null;

  return (
    <Button
      variant={variant === "outline" ? "outline" : variant === "ghost" ? "ghost" : "default"}
      className="min-h-[44px] min-w-[44px]" // §27 — 44×44px touch target
      asChild
    >
      <a href={url} target="_blank" rel="noopener noreferrer">{label}</a>
    </Button>
  );
}

function DividerBlockView({ block }: { block: DividerBlock }) {
  const style = block.props.style || "line";
  if (style === "space") return <div className="h-6" />;
  if (style === "dots") {
    return (
      <div className="flex items-center justify-center gap-1.5 py-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-1 w-1 rounded-full bg-[var(--login-text-muted,hsl(var(--muted-foreground)))]/40" />
        ))}
      </div>
    );
  }
  return <hr className="border-[var(--login-accent,hsl(var(--border)))]" />;
}

// ─── Main Renderer ────────────────────────────────────

interface ContentBlockRendererProps {
  block: ContentBlock;
}

export function ContentBlockRenderer({ block }: ContentBlockRendererProps) {
  return (
    <BlockErrorBoundary>
      {renderBlock(block)}
    </BlockErrorBoundary>
  );
}

function renderBlock(block: ContentBlock): ReactNode {
  switch (block.type) {
    case "text":        return <TextBlockView block={block} />;
    case "image":       return <ImageBlockView block={block} />;
    case "featureList": return <FeatureListBlockView block={block} />;
    case "testimonial": return <TestimonialBlockView block={block} />;
    case "ctaButton":   return <CtaButtonBlockView block={block} />;
    case "divider":     return <DividerBlockView block={block} />;
    default:            return null; // Unknown block type → skip (§16)
  }
}
