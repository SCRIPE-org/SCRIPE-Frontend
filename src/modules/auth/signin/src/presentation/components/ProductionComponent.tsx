/**
 * ProductionComponent — Individual canvas component type renderer.
 *
 * Extracted from ProductionCanvasRenderer to keep that file under 200 lines.
 * Handles the 12 render types: logo, loginForm, heading, subtitle, featureList,
 * testimonial, image, ctaButton, divider, footer, copyright, videoBg.
 *
 * @module auth/signin/components
 */
"use client";

import { resolveFileUrl } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { BookOpen } from "lucide-react";
import { Button } from "@core/ui/button";
import Link from "next/link";

export interface ProductionComponentProps {
  type: string;
  props: Record<string, unknown>;
  formContent: React.ReactNode;
  logoUrl: string;
  companyName: string;
  headline?: string;
  subtitle?: string;
  copyrightText?: string;
}

export function ProductionComponent({
  type, props, formContent, logoUrl, companyName, headline, subtitle, copyrightText,
}: ProductionComponentProps) {
  const { t } = useI18n();

  switch (type) {
    case "logo":
      return (
        <div
          className="login-logo flex items-center justify-center overflow-hidden border border-border bg-background shadow-sm"
          style={{ maxWidth: `${(props.maxWidth as number) || 200}px`, width: "100%", borderRadius: "var(--login-radius-card, 12px)" }}
        >
          <img src={logoUrl} alt={`${companyName} Logo`} className="h-full w-full object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
        </div>
      );

    case "loginForm":
      return <>{formContent}</>;

    case "heading":
      return (
        <h1
          className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
          style={{ fontFamily: "var(--login-font-heading, inherit)", fontSize: `${(props.fontSize as number) || 28}px`, fontWeight: (props.fontWeight as number) || 700, color: (props.color as string) !== "inherit" ? (props.color as string) : undefined, textAlign: "center" }}
        >
          {(props.text as string) || headline || companyName}
        </h1>
      );

    case "subtitle":
      return (
        <p
          className="login-subtitle text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"
          style={{ fontSize: `${(props.fontSize as number) || 16}px`, color: (props.color as string) !== "inherit" ? (props.color as string) : undefined, textAlign: "center" }}
        >
          {(props.text as string) || subtitle || t("auth.pleaseLogin")}
        </p>
      );

    case "socialLogin":
      return null;

    case "featureList": {
      const items = (props.items as string[]) || [];
      return (
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-[var(--login-text,hsl(var(--foreground)))]">
              <svg className="h-4 w-4 text-[var(--login-primary,hsl(var(--primary)))]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{item}</span>
            </li>
          ))}
        </ul>
      );
    }

    case "testimonial":
      return (
        <blockquote className="space-y-2 text-[var(--login-text,hsl(var(--foreground)))]">
          <p className="text-sm italic opacity-80">&ldquo;{(props.quote as string) || ""}&rdquo;</p>
          {(props.author as string) && (
            <footer className="text-xs font-medium">
              — {props.author as string}
              {(props.role as string) && <span className="ml-1 text-muted-foreground">({props.role as string})</span>}
            </footer>
          )}
        </blockquote>
      );

    case "image":
      return (props.src as string) ? (
        <img src={resolveFileUrl(props.src as string)} alt={(props.alt as string) || ""} style={{ objectFit: (props.objectFit as React.CSSProperties["objectFit"]) || "cover", maxWidth: (props.maxWidth as string) || "100%", borderRadius: `${(props.borderRadius as number) || 8}px`, width: "100%", height: "100%" }} />
      ) : null;

    case "ctaButton":
      return (
        <Button variant={(props.variant as "default" | "outline") || "default"} className="login-button" style={{ backgroundColor: "var(--login-primary, hsl(var(--primary)))", borderRadius: "var(--login-radius-button, 8px)" }} asChild={(props.url as string) ? true : undefined}>
          {(props.url as string) ? <Link href={props.url as string}>{(props.label as string) || "Get Started"}</Link> : <span>{(props.label as string) || "Get Started"}</span>}
        </Button>
      );

    case "divider":
      return (
        <div className="flex w-full items-center">
          <div className="w-full" style={{ height: "1px", backgroundColor: "var(--login-border, hsl(var(--border)))" }} />
        </div>
      );

    case "footer":
      return (
        <div className="flex items-center justify-center gap-4 text-xs text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
          <Button variant="ghost" size="sm" className="text-xs" asChild>
            <Link href="/docs"><BookOpen className="mr-1 h-3 w-3" />{t("auth.branding.docs")}</Link>
          </Button>
        </div>
      );

    case "copyright":
      return (
        <p className="text-[var(--login-text-muted,hsl(var(--muted-foreground)))]/50 text-center text-[11px] font-medium">
          © {new Date().getFullYear()} {companyName}{copyrightText ? ` — ${copyrightText}` : ""}
        </p>
      );

    case "customHtml":
      return null;

    case "videoBg":
      return (props.src as string) ? (
        <video src={props.src as string} poster={(props.poster as string) || undefined} autoPlay={(props.autoplay as boolean) ?? true} muted={(props.muted as boolean) ?? true} loop playsInline className="absolute inset-0 -z-10 h-full w-full object-cover" />
      ) : null;

    default:
      return null;
  }
}
