// UI-EXCEPTION: compact studio layout
/**
 * Builder Components Index — All 14 canvas component renderers
 *
 * These are preview-side renderers used by CanvasRenderer inside
 * the LoginPreviewShell iframe. They consume CSS design tokens
 * from the studio for consistent styling.
 *
 * NOTE: These render in the PREVIEW iframe, not the studio sidebar.
 * They produce the actual visual output the admin sees.
 */
"use client";

import { resolveFileUrl } from "@/core/common/utils";
import { sanitizeCss, sanitizeRichHtml } from "@core/common/sanitize";
import { useI18n } from "@core/providers/i18n-provider";

import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  Quote as QuoteIcon,
  Check,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";

// ── Logo ────────────────────────────────────────────────
export function BuilderLogo({
  maxWidth = 200,
  src,
  shape = "auto",
}: {
  maxWidth?: number;
  src?: string;
  shape?: string;
  [k: string]: unknown;
}) {
  const { t } = useI18n();
  const borderRadius =
    shape === "circle" ? "50%" : shape === "square" ? "0" : shape === "rounded" ? "8px" : undefined;
  return (
    <div className="flex w-full items-center justify-center">
      <img
        src={resolveFileUrl(src) || "/app-logo.png"}
        alt={t("studio.builder.preview.logoAlt")}
        className="object-contain"
        style={{ maxWidth: `${maxWidth}px`, maxHeight: "80px", borderRadius }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    </div>
  );
}

// ── Login Form ──────────────────────────────────────────
export function BuilderLoginForm({
  showSocial = true,
  showRemember = true,
  showForgot = true,
  showRegister = false,
}: {
  showSocial?: boolean;
  showRemember?: boolean;
  showForgot?: boolean;
  showRegister?: boolean;
  [k: string]: unknown;
}) {
  const { t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full" style={{ maxWidth: "var(--login-form-width, 380px)" }}>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col"
        style={{ gap: "var(--login-element-gap, 16px)" }}
      >
        {/* Username */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[var(--login-text,hsl(var(--foreground)))]">
            {t("studio.builder.preview.usernameLabel")}
          </Label>
          <div className="relative">
            <User
              className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"
              aria-hidden="true"
            />
            <Input
              placeholder={t("studio.builder.preview.usernamePlaceholder")}
              className="ps-9"
              readOnly
              style={{
                height: "var(--login-input-height, 44px)",
                borderRadius: "var(--login-radius-button, 8px)",
                borderColor: "var(--login-border, hsl(var(--border)))",
              }}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[var(--login-text,hsl(var(--foreground)))]">
            {t("studio.builder.preview.passwordLabel")}
          </Label>
          <div className="relative">
            <Lock
              className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"
              aria-hidden="true"
            />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="********"
              className="pe-9 ps-9"
              readOnly
              style={{
                height: "var(--login-input-height, 44px)",
                borderRadius: "var(--login-radius-button, 8px)",
                borderColor: "var(--login-border, hsl(var(--border)))",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"
              aria-label={t(showPassword ? "auth.hidePassword" : "auth.showPassword")}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Remember / Forgot */}
        {(showRemember || showForgot) && (
          <div className="flex items-center justify-between text-xs">
            {showRemember && (
              <label className="flex cursor-pointer items-center gap-2 text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
                <input type="checkbox" className="h-3.5 w-3.5 rounded-nx-sm" readOnly />
                {t("studio.builder.preview.rememberMe")}
              </label>
            )}
            {showForgot && (
              <span className="cursor-pointer text-[var(--login-primary,hsl(var(--primary)))] hover:underline">
                {t("studio.builder.preview.forgotPasswordLink")}
              </span>
            )}
          </div>
        )}

        {/* Login Button */}
        <Button
          type="submit"
          className="w-full text-sm font-semibold"
          style={{
            height: "var(--login-input-height, 44px)",
            backgroundColor: "var(--login-primary, hsl(var(--primary)))",
            borderRadius: "var(--login-radius-button, 8px)",
          }}
        >
          {t("studio.builder.preview.signIn")}
        </Button>

        {/* Register link */}
        {showRegister && (
          <p className="text-center text-xs text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
            {t("studio.builder.preview.noAccount")}{" "}
            <span className="cursor-pointer text-[var(--login-primary,hsl(var(--primary)))] hover:underline">
              {t("studio.builder.preview.register")}
            </span>
          </p>
        )}
      </form>

      {/* Social Login */}
      {showSocial && (
        <div className="mt-6 space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--login-border,hsl(var(--border)))]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[var(--login-surface,hsl(var(--background)))] px-2 text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
                {t("studio.builder.preview.orContinueWith")}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              type="button"
              className="h-10 text-xs"
              style={{ borderRadius: "var(--login-radius-button, 8px)" }}
            >
              {t("studio.builder.preview.providerGoogle")}
            </Button>
            <Button
              variant="outline"
              type="button"
              className="h-10 text-xs"
              style={{ borderRadius: "var(--login-radius-button, 8px)" }}
            >
              {t("studio.builder.preview.providerMicrosoft")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Heading ─────────────────────────────────────────────
export function BuilderHeading({
  text,
  fontSize = 32,
  fontWeight = 700,
  color = "inherit",
}: {
  text?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  [k: string]: unknown;
}) {
  const { t } = useI18n();
  return (
    <h1
      className="tracking-tight"
      style={{
        fontSize: `${fontSize}px`,
        fontWeight,
        color: color === "inherit" ? "var(--login-text, hsl(var(--foreground)))" : color,
        fontFamily: "var(--login-font-heading, inherit)",
      }}
    >
      {text || t("studio.builder.preview.headingDefault")}
    </h1>
  );
}

// ── Subtitle ────────────────────────────────────────────
export function BuilderSubtitle({
  text,
  fontSize = 16,
  color = "inherit",
}: {
  text?: string;
  fontSize?: number;
  color?: string;
  [k: string]: unknown;
}) {
  const { t } = useI18n();
  return (
    <p
      style={{
        fontSize: `${fontSize}px`,
        color:
          color === "inherit" ? "var(--login-text-muted, hsl(var(--muted-foreground)))" : color,
      }}
    >
      {text || t("studio.builder.preview.subtitleDefault")}
    </p>
  );
}

// ── Social Login ────────────────────────────────────────
export function BuilderSocialLogin({
  providers = ["google", "microsoft"],
  layout = "row",
}: {
  providers?: string[];
  layout?: string;
  [k: string]: unknown;
}) {
  const { t } = useI18n();
  const providerLabels: Record<string, string> = {
    google: t("studio.builder.preview.providerGoogle"),
    microsoft: t("studio.builder.preview.providerMicrosoft"),
    github: t("studio.builder.preview.providerGithub"),
    apple: t("studio.builder.preview.providerApple"),
  };

  return (
    <div
      className={`flex w-full gap-2 ${layout === "column" ? "flex-col" : layout === "grid" ? "flex-wrap" : "flex-row"}`}
    >
      {(Array.isArray(providers) ? providers : ["google", "microsoft"]).map((p) => (
        <Button
          key={p}
          variant="outline"
          type="button"
          className="h-10 flex-1 text-xs"
          style={{ borderRadius: "var(--login-radius-button, 8px)" }}
        >
          {providerLabels[p] || p}
        </Button>
      ))}
    </div>
  );
}

// ── Feature List ────────────────────────────────────────
export function BuilderFeatureList({
  items = [],
  maxItems = 6,
  variant = "list",
}: {
  items?: Array<{ icon?: string; title: string; desc?: string }>;
  maxItems?: number;
  variant?: string;
  [k: string]: unknown;
}) {
  const { t } = useI18n();
  const displayItems =
    Array.isArray(items) && items.length > 0
      ? items.slice(0, maxItems)
      : [
          {
            title: t("studio.builder.preview.featureSecureTitle"),
            desc: t("studio.builder.preview.featureSecureDesc"),
          },
          {
            title: t("studio.builder.preview.featureEasyTitle"),
            desc: t("studio.builder.preview.featureEasyDesc"),
          },
          {
            title: t("studio.builder.preview.featureFastTitle"),
            desc: t("studio.builder.preview.featureFastDesc"),
          },
        ];

  return (
    <div className="w-full space-y-3">
      {displayItems.map((item, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="bg-[var(--login-primary,hsl(var(--primary)))]/10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
            <Check
              className="h-3.5 w-3.5 text-[var(--login-primary,hsl(var(--primary)))]"
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--login-text,hsl(var(--foreground)))]">
              {item.title}
            </p>
            {item.desc && (
              <p className="text-xs text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
                {item.desc}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Testimonial ─────────────────────────────────────────
export function BuilderTestimonial({
  quote,
  author,
  role,
}: {
  quote?: string;
  author?: string;
  role?: string;
  avatar?: string;
  [k: string]: unknown;
}) {
  const { t } = useI18n();
  const displayQuote = quote || t("studio.builder.preview.testimonialQuote");
  const displayAuthor = author || t("studio.builder.preview.testimonialAuthor");
  const displayRole = role || t("studio.builder.preview.testimonialRole");
  return (
    <div className="border-[var(--login-border,hsl(var(--border)))]/50 bg-[var(--login-surface,hsl(var(--background)))]/50 w-full rounded-nx-lg border p-4">
      <QuoteIcon
        className="text-[var(--login-primary,hsl(var(--primary)))]/40 mb-2 h-5 w-5"
        aria-hidden="true"
      />
      <p className="text-sm italic leading-relaxed text-[var(--login-text,hsl(var(--foreground)))]">
        &ldquo;{displayQuote}&rdquo;
      </p>
      <div className="mt-3 flex items-center gap-2">
        <div className="bg-[var(--login-primary,hsl(var(--primary)))]/20 flex h-8 w-8 items-center justify-center rounded-full">
          <span className="text-xs font-bold text-[var(--login-primary,hsl(var(--primary)))]">
            {displayAuthor[0]}
          </span>
        </div>
        <div>
          <p className="text-xs font-medium text-[var(--login-text,hsl(var(--foreground)))]">
            {displayAuthor}
          </p>
          <p className="text-[10px] text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
            {displayRole}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Image ───────────────────────────────────────────────
export function BuilderImage({
  src = "",
  alt = "",
  objectFit = "cover",
  maxWidth = "100%",
  borderRadius = 8,
}: {
  src?: string;
  alt?: string;
  objectFit?: string;
  maxWidth?: string | number;
  borderRadius?: number;
  [k: string]: unknown;
}) {
  const { t } = useI18n();
  if (!src) {
    return (
      <div
        className="flex h-32 w-full items-center justify-center rounded-nx-md border border-dashed border-nx-line bg-nx-raised-2/40"
        style={{
          borderRadius: `${borderRadius}px`,
          maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
        }}
      >
        <span className="text-xs text-nx-ink-3">
          {t("studio.builder.preview.imagePlaceholder")}
        </span>
      </div>
    );
  }
  return (
    <img
      src={resolveFileUrl(src)}
      alt={alt}
      className="h-auto w-full"
      style={{
        objectFit: objectFit as React.CSSProperties["objectFit"],
        maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
        borderRadius: `${borderRadius}px`,
      }}
    />
  );
}

// ── CTA Button ──────────────────────────────────────────
export function BuilderCtaButton({
  label,
  url = "",
  variant = "default",
  size = "md",
}: {
  label?: string;
  url?: string;
  variant?: string;
  size?: string;
  [k: string]: unknown;
}) {
  const { t } = useI18n();
  const h = size === "sm" ? "36px" : size === "lg" ? "48px" : "40px";
  return (
    <Button
      variant={variant as "default" | "outline" | "ghost"}
      className="text-sm font-semibold"
      style={{
        height: h,
        borderRadius: "var(--login-radius-button, 8px)",
        ...(variant === "default"
          ? { backgroundColor: "var(--login-primary, hsl(var(--primary)))" }
          : {}),
      }}
      onClick={(e) => e.preventDefault()}
    >
      {label || t("studio.builder.preview.ctaGetStarted")}
    </Button>
  );
}

// ── Divider ─────────────────────────────────────────────
export function BuilderDivider({
  style = "line",
  color = "inherit",
}: {
  style?: string;
  color?: string;
  [k: string]: unknown;
}) {
  const borderColor = color === "inherit" ? "var(--login-border, hsl(var(--border)))" : color;
  if (style === "space") return <div className="h-8 w-full" />;
  if (style === "dots") {
    return (
      <div className="flex w-full items-center justify-center gap-1 py-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: borderColor }}
          />
        ))}
      </div>
    );
  }
  return <div className="w-full border-t" style={{ borderColor }} />;
}

// ── Footer ──────────────────────────────────────────────
export function BuilderFooter({
  links = [],
}: {
  links?: Array<{ label: string; url: string }>;
  [k: string]: unknown;
}) {
  const { t } = useI18n();
  const displayLinks =
    Array.isArray(links) && links.length > 0
      ? links
      : [
          { label: t("studio.builder.preview.footerLinkPrivacy"), url: "#" },
          { label: t("studio.builder.preview.footerLinkTerms"), url: "#" },
          { label: t("studio.builder.preview.footerLinkSupport"), url: "#" },
        ];

  return (
    <div className="flex w-full items-center justify-center gap-4">
      {displayLinks.map((link, i) => (
        <span
          key={i}
          className="cursor-pointer text-xs text-[var(--login-text-muted,hsl(var(--muted-foreground)))] transition-colors hover:text-[var(--login-primary,hsl(var(--primary)))]"
        >
          {link.label}
        </span>
      ))}
    </div>
  );
}

// ── Copyright ───────────────────────────────────────────
export function BuilderCopyright({
  text = "",
  year = "auto",
  poweredBy = false,
}: {
  text?: string;
  year?: string;
  poweredBy?: boolean;
  [k: string]: unknown;
}) {
  const { t } = useI18n();
  const displayYear = year === "auto" ? new Date().getFullYear() : year;
  return (
    <div className="w-full text-center">
      <p className="text-[11px] text-[var(--login-text-muted,hsl(var(--muted-foreground))/50)]">
        {text || t("studio.builder.preview.copyrightDefault", { year: displayYear })}
      </p>
      {poweredBy && (
        <p className="mt-1 text-[9px] text-[var(--login-text-muted,hsl(var(--muted-foreground))/30)]">
          {t("studio.builder.preview.poweredBy")}
        </p>
      )}
    </div>
  );
}

// ── Custom HTML (sanitized) ─────────────────────────────
const CUSTOM_HTML_RESET = `
.scripe-custom-html h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; }
.scripe-custom-html h2 { font-size: 1.5em; font-weight: bold; margin: 0.83em 0; }
.scripe-custom-html h3 { font-size: 1.17em; font-weight: bold; margin: 1em 0; }
.scripe-custom-html h4 { font-size: 1em; font-weight: bold; margin: 1.33em 0; }
.scripe-custom-html h5 { font-size: 0.83em; font-weight: bold; margin: 1.67em 0; }
.scripe-custom-html h6 { font-size: 0.67em; font-weight: bold; margin: 2.33em 0; }
.scripe-custom-html p { margin: 1em 0; }
.scripe-custom-html ul { list-style: disc; padding-left: 2em; margin: 1em 0; }
.scripe-custom-html ol { list-style: decimal; padding-left: 2em; margin: 1em 0; }
.scripe-custom-html li { display: list-item; }
.scripe-custom-html a { color: #3b82f6; text-decoration: underline; }
.scripe-custom-html a:hover { color: #2563eb; }
.scripe-custom-html strong, .scripe-custom-html b { font-weight: bold; }
.scripe-custom-html em, .scripe-custom-html i { font-style: italic; }
.scripe-custom-html blockquote { border-left: 4px solid #d1d5db; padding-left: 1em; margin: 1em 0; color: #6b7280; }
.scripe-custom-html pre { background: #1e1e1e; color: #d4d4d4; padding: 1em; border-radius: 0.5em; overflow-x: auto; font-family: monospace; }
.scripe-custom-html code { background: rgba(0,0,0,0.1); padding: 0.2em 0.4em; border-radius: 0.25em; font-family: monospace; font-size: 0.9em; }
.scripe-custom-html img { max-width: 100%; height: auto; border-radius: 0.25em; }
.scripe-custom-html table { border-collapse: collapse; width: 100%; }
.scripe-custom-html th, .scripe-custom-html td { border: 1px solid #d1d5db; padding: 0.5em 0.75em; text-align: left; }
.scripe-custom-html th { background: rgba(0,0,0,0.05); font-weight: bold; }
.scripe-custom-html hr { border: none; border-top: 1px solid #d1d5db; margin: 1.5em 0; }
`;

export function BuilderCustomHtml({
  content = "",
  css = "",
}: {
  content?: string;
  css?: string;
  [k: string]: unknown;
}) {
  const { t } = useI18n();
  if (!content && !css) {
    return (
      <div className="w-full rounded-nx-control border border-dashed border-warning/30 bg-warning/5 p-4">
        <p className="text-xs text-warning">{t("studio.builder.preview.customHtmlTitle")}</p>
        <p className="mt-1 text-[10px] text-nx-ink-3">
          {t("studio.builder.preview.customHtmlHint")}
        </p>
      </div>
    );
  }
  // Author-supplied markup is sanitized before injection. Without this, an admin with
  // customization rights could store a <script> in a custom HTML block and have it execute
  // same-origin for every other admin who opens the branding studio — stored XSS with access
  // to the viewing admin's session. The CSS pass additionally blocks the `</style>` breakout,
  // which escapes the style context and executes regardless of how safe the CSS itself is.
  return (
    <div className="scripe-custom-html w-full">
      <style
        dangerouslySetInnerHTML={{ __html: CUSTOM_HTML_RESET + sanitizeCss(css || "") }}
      />
      <div dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(content) }} />
    </div>
  );
}

// ── Video Background ────────────────────────────────────
export function BuilderVideoBg({
  src = "",
  poster = "",
  autoplay = true,
  muted = true,
}: {
  src?: string;
  poster?: string;
  autoplay?: boolean;
  muted?: boolean;
  [k: string]: unknown;
}) {
  const { t } = useI18n();
  if (!src) {
    return (
      <div className="flex h-full min-h-[200px] w-full items-center justify-center rounded-nx-md border border-dashed border-primary/30 bg-gradient-to-br from-primary/10 to-info/10">
        <p className="text-xs text-primary">{t("studio.builder.preview.videoBgPlaceholder")}</p>
      </div>
    );
  }
  return (
    <video
      src={resolveFileUrl(src)}
      poster={resolveFileUrl(poster) || undefined}
      autoPlay={autoplay}
      muted={muted}
      loop
      playsInline
      className="h-full w-full rounded-nx-md object-cover"
    />
  );
}

// ── Forgot Password Form ────────────────────────────────
export function BuilderForgotForm({
  showBackToLogin = true,
}: {
  showBackToLogin?: boolean;
  [k: string]: unknown;
}) {
  const { t, direction } = useI18n();
  const BackIcon = direction === "rtl" ? ArrowRight : ArrowLeft;
  return (
    <div className="w-full" style={{ maxWidth: "var(--login-form-width, 380px)" }}>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col"
        style={{ gap: "var(--login-element-gap, 16px)" }}
      >
        <div className="mb-2 text-center">
          <h3 className="text-lg font-semibold text-[var(--login-text,hsl(var(--foreground)))]">
            {t("studio.builder.preview.forgotFormTitle")}
          </h3>
          <p className="mt-1 text-sm text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
            {t("studio.builder.preview.forgotFormDesc")}
          </p>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[var(--login-text,hsl(var(--foreground)))]">
            {t("studio.builder.preview.emailAddressLabel")}
          </Label>
          <Input
            type="email"
            placeholder="you@example.com"
            className="h-10 ps-3 text-sm"
            style={{
              borderRadius: "var(--login-field-radius, 6px)",
              background: "var(--login-input-bg, hsl(var(--background)))",
              borderColor: "var(--login-input-border, hsl(var(--border)))",
              color: "var(--login-text, hsl(var(--foreground)))",
            }}
          />
        </div>
        <Button
          type="submit"
          className="h-10 w-full font-medium"
          style={{
            borderRadius: "var(--login-button-radius, var(--login-field-radius, 6px))",
            background: "var(--login-button-bg, hsl(var(--primary)))",
            color: "var(--login-button-text, hsl(var(--primary-foreground)))",
          }}
        >
          {t("studio.builder.preview.sendResetLink")}
        </Button>
        {showBackToLogin && (
          <p className="flex items-center justify-center gap-1.5 text-center text-sm text-[var(--login-link,hsl(var(--primary)))]">
            <BackIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {t("studio.builder.preview.backToLogin")}
          </p>
        )}
      </form>
    </div>
  );
}

// ── Reset Password Form ─────────────────────────────────
export function BuilderResetForm({
  showPasswordStrength = true,
}: {
  showPasswordStrength?: boolean;
  [k: string]: unknown;
}) {
  const { t } = useI18n();
  return (
    <div className="w-full" style={{ maxWidth: "var(--login-form-width, 380px)" }}>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col"
        style={{ gap: "var(--login-element-gap, 16px)" }}
      >
        <div className="mb-2 text-center">
          <h3 className="text-lg font-semibold text-[var(--login-text,hsl(var(--foreground)))]">
            {t("studio.builder.preview.resetFormTitle")}
          </h3>
          <p className="mt-1 text-sm text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
            {t("studio.builder.preview.resetFormDesc")}
          </p>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[var(--login-text,hsl(var(--foreground)))]">
            {t("studio.builder.preview.newPasswordLabel")}
          </Label>
          <Input
            type="password"
            placeholder="••••••••"
            className="h-10 ps-3 text-sm"
            style={{
              borderRadius: "var(--login-field-radius, 6px)",
              background: "var(--login-input-bg, hsl(var(--background)))",
              borderColor: "var(--login-input-border, hsl(var(--border)))",
              color: "var(--login-text, hsl(var(--foreground)))",
            }}
          />
        </div>
        {showPasswordStrength && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-1 flex-1 rounded-full bg-nx-raised-2" />
              ))}
            </div>
            <p className="text-[10px] text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
              {t("studio.builder.preview.passwordStrengthIndicator")}
            </p>
          </div>
        )}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[var(--login-text,hsl(var(--foreground)))]">
            {t("studio.builder.preview.confirmPasswordLabel")}
          </Label>
          <Input
            type="password"
            placeholder="••••••••"
            className="h-10 ps-3 text-sm"
            style={{
              borderRadius: "var(--login-field-radius, 6px)",
              background: "var(--login-input-bg, hsl(var(--background)))",
              borderColor: "var(--login-input-border, hsl(var(--border)))",
              color: "var(--login-text, hsl(var(--foreground)))",
            }}
          />
        </div>
        <Button
          type="submit"
          className="h-10 w-full font-medium"
          style={{
            borderRadius: "var(--login-button-radius, var(--login-field-radius, 6px))",
            background: "var(--login-button-bg, hsl(var(--primary)))",
            color: "var(--login-button-text, hsl(var(--primary-foreground)))",
          }}
        >
          {t("studio.builder.preview.resetPasswordButton")}
        </Button>
      </form>
    </div>
  );
}
