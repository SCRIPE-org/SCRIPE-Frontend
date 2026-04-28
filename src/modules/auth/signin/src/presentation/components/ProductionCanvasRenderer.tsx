/**
 * ProductionCanvasRenderer — Renders builder canvas layouts on the REAL login page
 *
 * This is the production counterpart to CanvasRenderer in the customization module.
 * Key difference: `loginForm` component type renders the REAL auth form (CredentialsForm,
 * TwoFactorForm, SSO buttons) instead of mock/preview forms.
 *
 * All design tokens (colors, fonts, spacing) are inherited from CSS variables
 * set by useLoginBrandingTokens.
 *
 * @module auth/signin/components
 */
"use client";

import { resolveFileUrl } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { BookOpen } from "lucide-react";
import { Button } from "@core/ui/button";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import Link from "next/link";

// ── Minimal type defs (avoid importing from customization module) ──
interface CanvasComponentData {
  id: string;
  type: string;
  gridColumn: string;
  gridRow: string;
  alignment: string;
  verticalAlignment: string;
  // Free-form (absolute) fields
  x: number;
  y: number;
  width: number;
  height: number;
  props: Record<string, unknown>;
  zIndex: number;
  visible: boolean;
}

interface CanvasBackgroundData {
  type: string;
  value: string;
}

interface ProductionCanvasRendererProps {
  components: CanvasComponentData[];
  gridRows: number;
  canvasBackground?: CanvasBackgroundData;
  /** Position mode: 'grid' = CSS Grid, 'absolute' = free-form x/y */
  positionMode?: 'grid' | 'absolute';
  /** The REAL form content (CredentialsForm + SSO + SlotRenderers) */
  formContent: React.ReactNode;
  /** Logo URL from tenant branding */
  logoUrl: string;
  /** Company name from tenant branding */
  companyName: string;
  /** Direction for RTL/LTR */
  direction: string;
  /** Headline text */
  headline?: string;
  /** Subtitle text */
  subtitle?: string;
  /** Copyright text */
  copyrightText?: string;
}

const GRID_COLUMNS = 12;

export function ProductionCanvasRenderer({
  components,
  gridRows,
  canvasBackground,
  positionMode = 'grid',
  formContent,
  logoUrl,
  companyName,
  direction,
  headline,
  subtitle,
  copyrightText,
}: ProductionCanvasRendererProps) {
  const { t } = useI18n();

  // Resolve background
  let bg = "var(--login-bg, hsl(var(--background)))";
  if (canvasBackground && canvasBackground.type !== "inherit" && canvasBackground.value) {
    bg = canvasBackground.value;
  }

  const alignMap: Record<string, string> = { start: 'flex-start', center: 'center', end: 'flex-end' };

  const visibleComponents = components
    .filter((c) => c.visible)
    .sort((a, b) => a.zIndex - b.zIndex);

  // Top actions bar (always visible, floating)
  const topActions = (
    <div
      style={{
        position: 'fixed',
        left: 32,
        right: 32,
        top: 32,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 8,
      }}
    >
      <div className="flex gap-1">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
    </div>
  );

  const commonStyle: React.CSSProperties = {
    fontFamily: 'var(--login-font-body, inherit)',
    lineHeight: 'var(--login-line-height, 1.5)',
    letterSpacing: 'var(--login-letter-spacing, 0px)',
  };

  // ── Free-Form (Absolute) Mode ──
  if (positionMode === 'absolute') {
    return (
      <div
        className="login-page w-full min-h-screen selection:bg-primary/20"
        dir={direction}
        style={{
          position: 'relative',
          minHeight: '100vh',
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto',
          background: bg,
          overflow: 'hidden',
          ...commonStyle,
        }}
      >
        {topActions}
        {visibleComponents.map((comp) => (
          <div
            key={comp.id}
            style={{
              position: 'absolute',
              insetInlineStart: `${comp.x || 0}px`,
              top: `${comp.y || 0}px`,
              width: comp.width ? `${comp.width}px` : 'auto',
              height: comp.height ? `${comp.height}px` : 'auto',
              zIndex: comp.zIndex,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ProductionComponent
              type={comp.type}
              props={comp.props}
              formContent={formContent}
              logoUrl={logoUrl}
              companyName={companyName}
              headline={headline}
              subtitle={subtitle}
              copyrightText={copyrightText}
            />
          </div>
        ))}
      </div>
    );
  }

  // ── Grid Mode ──
  return (
    <div
      className="login-page w-full min-h-screen selection:bg-primary/20"
      dir={direction}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)`,
        gridTemplateRows: `repeat(${gridRows}, minmax(60px, auto))`,
        minHeight: '100vh',
        gap: '0px',
        background: bg,
        ...commonStyle,
      }}
    >
      {topActions}

      {visibleComponents.map((comp) => (
          <div
            key={comp.id}
            style={{
              gridColumn: comp.gridColumn,
              gridRow: comp.gridRow,
              display: 'flex',
              alignItems: alignMap[comp.verticalAlignment] || 'center',
              justifyContent: alignMap[comp.alignment] || 'center',
              padding: '8px',
              zIndex: comp.zIndex,
            }}
          >
            <ProductionComponent
              type={comp.type}
              props={comp.props}
              formContent={formContent}
              logoUrl={logoUrl}
              companyName={companyName}
              headline={headline}
              subtitle={subtitle}
              copyrightText={copyrightText}
            />
          </div>
        ))}
    </div>
  );
}

// ── Individual component renderer ────────────────────────

interface ProductionComponentProps {
  type: string;
  props: Record<string, unknown>;
  formContent: React.ReactNode;
  logoUrl: string;
  companyName: string;
  headline?: string;
  subtitle?: string;
  copyrightText?: string;
}

function ProductionComponent({
  type,
  props,
  formContent,
  logoUrl,
  companyName,
  headline,
  subtitle,
  copyrightText,
}: ProductionComponentProps) {
  const { t } = useI18n();

  switch (type) {
    case "logo":
      return (
        <div
          className="login-logo flex items-center justify-center overflow-hidden bg-background border border-border shadow-sm"
          style={{
            maxWidth: `${(props.maxWidth as number) || 200}px`,
            width: "100%",
            borderRadius: "var(--login-radius-card, 12px)",
          }}
        >
          <img
            src={logoUrl}
            alt={`${companyName} Logo`}
            className="h-full w-full object-contain"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>
      );

    case "loginForm":
      // THE KEY: render the REAL auth form (not a mock)
      return <>{formContent}</>;

    case "heading":
      return (
        <h1
          className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
          style={{
            fontFamily: "var(--login-font-heading, inherit)",
            fontSize: `${(props.fontSize as number) || 28}px`,
            fontWeight: (props.fontWeight as number) || 700,
            color: (props.color as string) !== "inherit" ? (props.color as string) : undefined,
            textAlign: "center",
          }}
        >
          {(props.text as string) || headline || companyName}
        </h1>
      );

    case "subtitle":
      return (
        <p
          className="login-subtitle text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"
          style={{
            fontSize: `${(props.fontSize as number) || 16}px`,
            color: (props.color as string) !== "inherit" ? (props.color as string) : undefined,
            textAlign: "center",
          }}
        >
          {(props.text as string) || subtitle || t("auth.pleaseLogin")}
        </p>
      );

    case "socialLogin":
      // SSO buttons are already included in formContent
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
              {(props.role as string) && <span className="text-muted-foreground ml-1">({props.role as string})</span>}
            </footer>
          )}
        </blockquote>
      );

    case "image":
      return (props.src as string) ? (
        <img
          src={resolveFileUrl(props.src as string)}
          alt={(props.alt as string) || ""}
          style={{
            objectFit: (props.objectFit as React.CSSProperties["objectFit"]) || "cover",
            maxWidth: (props.maxWidth as string) || "100%",
            borderRadius: `${(props.borderRadius as number) || 8}px`,
            width: "100%",
            height: "100%",
          }}
        />
      ) : null;

    case "ctaButton":
      return (
        <Button
          variant={(props.variant as "default" | "outline") || "default"}
          className="login-button"
          style={{
            backgroundColor: "var(--login-primary, hsl(var(--primary)))",
            borderRadius: "var(--login-radius-button, 8px)",
          }}
          asChild={(props.url as string) ? true : undefined}
        >
          {(props.url as string) ? (
            <Link href={props.url as string}>{(props.label as string) || "Get Started"}</Link>
          ) : (
            <span>{(props.label as string) || "Get Started"}</span>
          )}
        </Button>
      );

    case "divider":
      return (
        <div className="w-full flex items-center">
          <div
            className="w-full"
            style={{
              height: "1px",
              backgroundColor: "var(--login-border, hsl(var(--border)))",
            }}
          />
        </div>
      );

    case "footer":
      return (
        <div className="flex items-center justify-center gap-4 text-xs text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
          <Button variant="ghost" size="sm" className="text-xs" asChild>
            <Link href="/docs"><BookOpen className="h-3 w-3 mr-1" />{t("auth.branding.docs")}</Link>
          </Button>
        </div>
      );

    case "copyright":
      return (
        <p className="text-center text-[11px] font-medium text-[var(--login-text-muted,hsl(var(--muted-foreground)))]/50">
          © {new Date().getFullYear()} {companyName}
          {copyrightText ? ` — ${copyrightText}` : ""}
        </p>
      );

    case "customHtml":
      // Security: no dangerouslySetInnerHTML in production
      return null;

    case "videoBg":
      return (props.src as string) ? (
        <video
          src={props.src as string}
          poster={(props.poster as string) || undefined}
          autoPlay={(props.autoplay as boolean) ?? true}
          muted={(props.muted as boolean) ?? true}
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover -z-10"
        />
      ) : null;

    default:
      return null;
  }
}
