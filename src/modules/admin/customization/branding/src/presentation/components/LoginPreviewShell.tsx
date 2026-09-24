// FILE-EXCEPTION: file length
/**
 * LoginPreviewShell -- Isolated login page preview for Customizer Studio
 *
 * KEY ARCHITECTURE: This is a completely separate page from /login.
 * It has ZERO auth logic -- no useLoginViewModel, no checkAndRedirect,
 * no token checks, no SSO, no 2FA flow.
 *
 * It renders the same visual UI as LoginView (all 22 layouts) but with
 * mock form elements that cannot submit. Design tokens are injected via
 * postMessage from the studio iframe parent.
 *
 * Security:
 * - Cannot authenticate (no auth repository access)
 * - Form submission disabled via preventDefault
 * - postMessage is origin-validated (same-origin)
 * - No access to secure token service
 */
"use client";
// UI-EXCEPTION: compact studio layout — native <button> used for pixel-precise
// compact controls (toggle switches, gradient pickers, layout thumbnails, etc.)
// where @core/ui/button's padding/sizing would break the layout.

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { Eye, EyeOff, Lock, User, Mail, ArrowLeft, KeyRound, Accessibility } from "lucide-react";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import { BRAND } from "@core/config/branding";
import { sanitizeCss } from "@core/common/sanitize";
import {
  useCoreLoginBrandingTokens as useLoginBrandingTokens,
  CoreLoginBranding as LoginBranding,
  CoreSlotRenderer as SlotRenderer,
} from "@core/components/auth-surfaces";
import { CanvasRenderer } from "./builder/CanvasRenderer";

// The branding surfaces come from the core auth bridge (core -> module is allowed; module -> module
// is not). They used to be resolved from the runtime component registry, which is only populated by
// importing the `@modules/auth` barrel — something no route does. The fallbacks below the lookup
// returned `null` and an empty token object, so this preview rendered blank chrome and default
// tokens no matter what the studio published.

import { useTheme } from "next-themes";
import Image from "next/image";

/**
 * Presentation UI component rendering the login preview shell.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function LoginPreviewShell() {
  const { t } = useI18n();
  const { direction } = useI18n();
  const { setTheme } = useTheme();
  const searchParams = useSearchParams();

  // Determine active page from URL query param or postMessage
  const urlPage = searchParams?.get("page") || "login";

  // Listen for theme commands from studio parent
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "SCRIPE_STUDIO_SET_THEME") {
        setTheme(e.data.theme);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [setTheme]);

  // Draft overrides from studio via postMessage
  const [draftOverrides, setDraftOverrides] = useState<{
    loginBrandingJson?: string;
    slotConfigJson?: string;
    activeAuthPage?: string;
  } | null>(null);

  // Listen for postMessage from studio parent
  useEffect(() => {
    // Signal to studio that preview is ready
    window.parent?.postMessage({ type: "SCRIPE_PREVIEW_READY" }, window.location.origin);

    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "SCRIPE_STUDIO_DRAFT_UPDATE") {
        setDraftOverrides(e.data.payload);
      }
      if (e.data?.type === "SCRIPE_STUDIO_RESET") {
        setDraftOverrides(null);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Inject CSS tokens from draft
  const { layout, config, slotConfig, a11y } = useLoginBrandingTokens({
    loginBrandingJson: draftOverrides?.loginBrandingJson ?? null,
    slotConfigJson: draftOverrides?.slotConfigJson ?? null,
    isSafeMode: false,
  });

  // ── A11y: Reading Guide & Reading Mask (mouse tracking) ──
  const mouseYRef = useRef(0);
  const readingGuideRef = useRef<HTMLDivElement | null>(null);
  const readingMaskTopRef = useRef<HTMLDivElement | null>(null);
  const readingMaskBottomRef = useRef<HTMLDivElement | null>(null);

  const onMouseMove = useCallback((e: MouseEvent) => {
    mouseYRef.current = e.clientY;
    if (readingGuideRef.current) {
      readingGuideRef.current.style.top = `${e.clientY - 6}px`;
    }
    if (readingMaskTopRef.current && readingMaskBottomRef.current) {
      readingMaskTopRef.current.style.height = `${Math.max(0, e.clientY - 40)}px`;
      readingMaskBottomRef.current.style.top = `${e.clientY + 40}px`;
      readingMaskBottomRef.current.style.height = `${Math.max(0, window.innerHeight - e.clientY - 40)}px`;
    }
  }, []);

  const readingGuide = a11y.readingGuide;
  const readingMask = a11y.readingMask;
  useEffect(() => {
    if (readingGuide || readingMask) {
      document.addEventListener("mousemove", onMouseMove);
      return () => document.removeEventListener("mousemove", onMouseMove);
    }
  }, [readingGuide, readingMask, onMouseMove]);

  // Count active accessibility features for badge
  const activeA11yCount = [
    a11y.focusRingEnabled,
    a11y.skipLinkEnabled,
    a11y.highlightFocus,
    a11y.ariaLandmarks,
    a11y.formLabelsVisible,
    a11y.errorAnnounce,
    a11y.highContrastMode,
    a11y.contrastPreset !== "normal",
    a11y.saturation !== 100,
    a11y.highlightLinks,
    a11y.minFontSize > 14,
    a11y.contentScaling !== 100,
    a11y.lineHeight > 0,
    a11y.letterSpacing > 0,
    a11y.wordSpacing > 0,
    a11y.dyslexicFont,
    a11y.textAlign !== "inherit",
    a11y.cursorSize !== "default",
    a11y.readingGuide,
    a11y.readingMask,
    a11y.reducedMotion === "always",
    a11y.pauseAnimations,
    a11y.autoplayDisabled,
    a11y.hideImages,
    a11y.tooltips,
    a11y.largeTargets,
  ].filter(Boolean).length;

  // Derive branding from raw JSON (LoginBrandingConfig only has layout/tokens)
  const rawJson = draftOverrides?.loginBrandingJson;
  const rawParsed = (() => {
    if (!rawJson) return {} as Record<string, unknown>;
    try {
      return JSON.parse(rawJson) as Record<string, unknown>;
    } catch {
      return {} as Record<string, unknown>;
    }
  })();

  const logoUrl = (rawParsed.logoUrl as string) || "/brand/app-logo-1024.png";
  const companyName = (rawParsed.companyName as string) || BRAND.name;
  const copyrightText = (rawParsed.copyrightText as string) || "";

  // Resolve page-specific overrides (M8) — per-page layout/headline/subtitle
  const activePageId = draftOverrides?.activeAuthPage || urlPage || "login";
  const pagesObj = (rawParsed.pages as Record<string, Record<string, string>>) || {};
  const pageOverride = pagesObj[activePageId] || {};
  const headline =
    pageOverride.headline || (rawParsed.headline as string) || t("auth.branding.headline");
  const subtitle =
    pageOverride.subtitle || (rawParsed.subtitle as string) || t("auth.branding.subtitle");

  // Per-page layout override: each auth page can have its own layout
  // Falls back to the global layout from useLoginBrandingTokens
  const effectiveLayout = (pageOverride.layout as string) || layout;

  // Per-page background CSS override (M9) — when inheritBackground is false,
  // the page has its own background instead of the global login background.
  const perPageBgCss = (() => {
    // Login page always uses global bg; skip if no override
    if (activePageId === "login") return "";
    const po = pageOverride as Record<string, unknown>;
    // Default: inherit from login page
    if (po.inheritBackground !== false) return "";

    const rules: string[] = [];
    const bgType = (po.bgType as string) || "solid";

    if (bgType === "solid" && po.bgColor) {
      rules.push(`--login-bg: ${po.bgColor};`);
      rules.push(`background: ${po.bgColor} !important;`);
    } else if (bgType === "gradient") {
      const dir = (po.bgGradientDirection as string) || "135deg";
      const from = (po.bgGradientFrom as string) || "#3b82f6";
      const to = (po.bgGradientTo as string) || "#8b5cf6";
      const grad = `linear-gradient(${dir}, ${from}, ${to})`;
      rules.push(`--login-bg: ${from};`);
      rules.push(`background: ${grad} !important;`);
    } else if (bgType === "image" && po.bgImageUrl) {
      const fit = (po.bgImageFit as string) || "cover";
      const pos = (po.bgImagePosition as string) || "center";
      rules.push(`background-image: url(${po.bgImageUrl}) !important;`);
      rules.push(`background-size: ${fit === "fill" ? "100% 100%" : fit} !important;`);
      rules.push(`background-position: ${pos} !important;`);
      rules.push(`background-repeat: no-repeat !important;`);
      // Overlay
      if (po.bgOverlayEnabled) {
        const overlayColor = (po.bgOverlayColor as string) || "#000000";
        const overlayOpacity = (po.bgOverlayOpacity as number) ?? 30;
        const hex = overlayColor.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        rules.push(`--login-overlay: rgba(${r},${g},${b},${overlayOpacity / 100});`);
      }
    }

    if (rules.length === 0) return "";
    return `.login-page { ${rules.join(" ")} }`;
  })();

  // Per-page custom CSS
  const perPageCustomCss = ((pageOverride as Record<string, unknown>).customCss as string) || "";

  // Build "branding" object for LoginBranding component

  const brandingForPanel = {
    logoUrl,
    companyName,
    name: companyName,
    loginHeadline: headline,
    loginSubtitle: subtitle,
    copyrightText,
    primaryColor: null,
    secondaryColor: null,
  } as any;

  // Determine if branding panel should be transparent (unified bg mode)
  const isUnifiedBg = config?.tokens?.["split.bg.mode"] === "unified";

  // ”--€ Mock Form (cannot submit) ”--€
  const [showPassword, setShowPassword] = useState(false);
  // Form selection is driven by postMessage (draftOverrides.activeAuthPage)
  // which is updated by the studio bridge on tab switch. The URL param is only
  // used as a fallback for the initial load before the first postMessage arrives.
  const currentPage = draftOverrides?.activeAuthPage || urlPage || "login";

  // Shared input styles
  const inputStyle: React.CSSProperties = {
    height: "var(--login-input-height, 44px)",
    borderRadius: "var(--login-radius-button, 8px)",
    borderColor: "var(--login-border, hsl(var(--border)))",
  };
  const buttonStyle: React.CSSProperties = {
    height: "var(--login-input-height, 44px)",
    backgroundColor: "var(--login-primary, hsl(var(--primary)))",
    borderRadius: "var(--login-radius-button, 8px)",
  };

  // Forgot Password Form
  const forgotPasswordForm = (
    <div
      className="login-form-wrapper w-full"
      data-hook="form-wrapper"
      style={{ maxWidth: "var(--login-form-width, 380px)" }}
    >
      <SlotRenderer slotId="login.form.above" slotConfig={slotConfig} className="mb-4" />
      <form
        onSubmit={(e) => e.preventDefault()}
        className="login-form flex flex-col"
        style={{ gap: "var(--login-element-gap, 16px)" }}
      >
        <div className="mb-2 text-center">
          <p className="login-subtitle text-sm text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
            {t("auth.forgotPasswordDesc")}
          </p>
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="preview-email"
            className="login-label text-sm font-medium text-[var(--login-text,hsl(var(--foreground)))]"
          >
            {t("auth.email")}
          </Label>
          <div className="relative">
            <Mail className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" />
            <Input
              id="preview-email"
              placeholder={t("auth.emailPlaceholder")}
              className="login-input ps-9"
              readOnly
              style={inputStyle}
            />
          </div>
        </div>
        <Button
          type="submit"
          className="login-button w-full text-sm font-semibold"
          style={buttonStyle}
        >
          {t("auth.sendResetLink")}
        </Button>
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 text-sm text-[var(--login-primary,hsl(var(--primary)))] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("auth.backToLogin")}
        </button>
      </form>
      <SlotRenderer slotId="login.form.below" slotConfig={slotConfig} className="mt-6" />
    </div>
  );

  // Reset Password Form
  const resetPasswordForm = (
    <div
      className="login-form-wrapper w-full"
      data-hook="form-wrapper"
      style={{ maxWidth: "var(--login-form-width, 380px)" }}
    >
      <SlotRenderer slotId="login.form.above" slotConfig={slotConfig} className="mb-4" />
      <form
        onSubmit={(e) => e.preventDefault()}
        className="login-form flex flex-col"
        style={{ gap: "var(--login-element-gap, 16px)" }}
      >
        <div className="mb-2 text-center">
          <p className="login-subtitle text-sm text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
            {t("auth.resetPasswordDesc")}
          </p>
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="preview-new-pw"
            className="login-label text-sm font-medium text-[var(--login-text,hsl(var(--foreground)))]"
          >
            {t("auth.newPassword")}
          </Label>
          <div className="relative">
            <KeyRound className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" />
            <Input
              id="preview-new-pw"
              type="password"
              placeholder="********"
              className="login-input ps-9"
              readOnly
              style={inputStyle}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="preview-confirm-pw"
            className="login-label text-sm font-medium text-[var(--login-text,hsl(var(--foreground)))]"
          >
            {t("auth.confirmPassword")}
          </Label>
          <div className="relative">
            <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" />
            <Input
              id="preview-confirm-pw"
              type="password"
              placeholder="********"
              className="login-input ps-9"
              readOnly
              style={inputStyle}
            />
          </div>
        </div>
        <Button
          type="submit"
          className="login-button w-full text-sm font-semibold"
          style={buttonStyle}
        >
          {t("auth.resetPassword")}
        </Button>
      </form>
      <SlotRenderer slotId="login.form.below" slotConfig={slotConfig} className="mt-6" />
    </div>
  );

  const loginFormContent = (
    <div
      className="login-form-wrapper w-full"
      data-hook="form-wrapper"
      style={{ maxWidth: "var(--login-form-width, 380px)" }}
    >
      {/* Slot: form.above */}
      <SlotRenderer slotId="login.form.above" slotConfig={slotConfig} className="mb-4" />
      <form
        onSubmit={(e) => e.preventDefault()}
        className="login-form flex flex-col"
        style={{ gap: "var(--login-element-gap, 16px)" }}
      >
        {/* Username */}
        <div className="space-y-2">
          <Label
            htmlFor="preview-username"
            className="login-label text-sm font-medium text-[var(--login-text,hsl(var(--foreground)))]"
          >
            {t("auth.username")}
          </Label>
          <div className="relative">
            <User className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" />
            <Input
              id="preview-username"
              placeholder={t("auth.usernamePlaceholder")}
              className="login-input ps-9"
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
          <Label
            htmlFor="preview-password"
            className="login-label text-sm font-medium text-[var(--login-text,hsl(var(--foreground)))]"
          >
            {t("auth.password")}
          </Label>
          <div className="relative">
            <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" />
            <Input
              id="preview-password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              className="login-input pe-9 ps-9"
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
              className="absolute end-3 top-1/2 -translate-y-1/2 text-[var(--login-text-muted,hsl(var(--muted-foreground)))] hover:text-[var(--login-text,hsl(var(--foreground)))]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          className="login-button w-full text-sm font-semibold"
          style={{
            height: "var(--login-input-height, 44px)",
            backgroundColor: "var(--login-primary, hsl(var(--primary)))",
            borderRadius: "var(--login-radius-button, 8px)",
          }}
        >
          {t("auth.login")}
        </Button>
      </form>

      {/* Mock SSO buttons */}
      <div className="mt-6 space-y-3">
        <div className="login-divider relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--login-border,hsl(var(--border)))]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[var(--login-surface,hsl(var(--background)))] px-2 text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
              {t("auth.orContinueWith")}
            </span>
          </div>
        </div>
        <div className="login-sso grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            type="button"
            className="h-10 text-xs"
            style={{ borderRadius: "var(--login-radius-button, 8px)" }}
          >
            Google
          </Button>
          <Button
            variant="outline"
            type="button"
            className="h-10 text-xs"
            style={{ borderRadius: "var(--login-radius-button, 8px)" }}
          >
            Microsoft
          </Button>
        </div>
      </div>

      {/* Slot: form.below */}
      <SlotRenderer slotId="login.form.below" slotConfig={slotConfig} className="mt-6" />
    </div>
  );

  // ── Select form based on active page ──
  // Key wrapper forces React to unmount/remount the form when switching pages.
  // Without this, React reconciles the children since all 3 forms share the same
  // outer div structure, causing visual staleness despite state being correct.
  const rawForm =
    currentPage === "forgot-password"
      ? forgotPasswordForm
      : currentPage === "reset-password"
        ? resetPasswordForm
        : loginFormContent;
  const formContent = <div key={currentPage}>{rawForm}</div>;

  // ”--€ Top Actions (visual only) ”--€
  const topActions = (
    <div className="absolute start-8 end-8 top-8 z-20 flex items-center justify-end gap-5">
      <div className="flex gap-1">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
    </div>
  );

  // ”--€ Footer (copyright -- shown in ALL layouts) ”--€
  const footer = (
    <div className="login-footer mt-8 text-center">
      <p className="text-[11px] font-medium text-[var(--login-text-muted,hsl(var(--muted-foreground))/50)]">
        {copyrightText || `© ${new Date().getFullYear()} ${companyName}`}
      </p>
    </div>
  );

  const footerSlot = (
    <SlotRenderer slotId="login.footer" slotConfig={slotConfig} className="mt-6" />
  );

  // ”--€ Common styles ”--€
  // NOTE: We use a SINGLE layered `background` (CSS multiple backgrounds) so that:
  //   - `--login-bg-image` (image) renders ON TOP
  //   - `--login-bg` (solid or gradient) renders UNDERNEATH
  // Previously, separate `backgroundImage: none` was OVERRIDING the gradient.
  const bgStyle = "selection:bg-primary/20";
  // NOTE: CSS `background` shorthand RESETS all sub-properties (backgroundImage, backgroundSize, etc.)
  // So we MUST use a single `background` shorthand with CSS multiple backgrounds:
  //   Layer 1 (on top): image
  //   Layer 2 (behind): solid color or gradient
  // This matches LoginView.tsx's approach.
  const wrapperStyle: React.CSSProperties = {
    background: `var(--login-bg-image, none) var(--login-bg-image-position, center) / var(--login-bg-image-fit, cover) no-repeat, var(--login-bg, hsl(var(--background)))`,
    lineHeight: "var(--login-line-height, 1.5)",
    letterSpacing: "var(--login-letter-spacing, 0px)",
  };

  // For split layouts: depends on unified vs separated mode.
  const splitWrapperStyle: React.CSSProperties = isUnifiedBg
    ? { ...wrapperStyle }
    : {
        lineHeight: wrapperStyle.lineHeight,
        letterSpacing: wrapperStyle.letterSpacing,
        background: "hsl(var(--background))",
      };

  // Form-side style: in separated mode, applies the page bg controls to JUST the form section.
  const formSideStyle: React.CSSProperties = isUnifiedBg
    ? {}
    : {
        background: `var(--login-bg-image, none) var(--login-bg-image-position, center) / var(--login-bg-image-fit, cover) no-repeat, var(--login-bg, hsl(var(--background)))`,
      };

  // •••••••••••••••••••••••••••••••••••••••••••••••••••
  // 22 LAYOUT VARIANTS (same as LoginView)
  // •••••••••••••••••••••••••••••••••••••••••••••••••••
  // Reusable overlay div — sits on top of background, under content.
  // Uses CSS vars set by the token system; opacity=0 when overlay is disabled.
  const overlayDiv = (
    <div
      className="login-overlay"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        backgroundColor: "var(--login-overlay-color, rgba(0,0,0,0.5))",
        opacity: "var(--login-overlay-opacity, 0)",
        backdropFilter: "blur(var(--login-overlay-blur, 0px))",
      }}
    />
  );

  // ── A11y: Floating badge reporting how many accessibility features are
  // active. Rendered as real JSX (below, alongside the resolved layout) so it
  // participates in the same tree as everything else — no DOM injection. It
  // is composed once here and rendered unconditionally at the bottom of this
  // component, so it appears no matter which of the 22 layout variants (or
  // the canvas-builder mode) is the active render path.
  const a11yActiveBadge =
    activeA11yCount > 0 ? (
      <div className="pointer-events-none fixed bottom-4 end-4 z-toast" dir={direction}>
        <Badge variant="info" className="gap-1.5 px-3 py-1">
          <Accessibility className="h-3.5 w-3.5" aria-hidden="true" />
          {t("studio.builder.preview.a11yActiveCount", { count: activeA11yCount })}
        </Badge>
      </div>
    ) : null;

  // ── A11y: Reading guide + mask containers (position:fixed, rendered once) ──
  const a11yFixedElements = (
    <>
      {a11y.readingGuide && (
        <div
          ref={readingGuideRef}
          className="login-a11y-reading-guide"
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            top: -20,
            height: 12,
            pointerEvents: "none",
            zIndex: 99999,
          }}
        />
      )}
      {a11y.readingMask && (
        <>
          <div
            ref={readingMaskTopRef}
            className="login-a11y-reading-mask-top"
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              top: 0,
              height: 0,
              pointerEvents: "none",
              zIndex: 99998,
            }}
          />
          <div
            ref={readingMaskBottomRef}
            className="login-a11y-reading-mask-bottom"
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              height: "100vh",
              pointerEvents: "none",
              zIndex: 99998,
            }}
          />
        </>
      )}
    </>
  );

  // Render a11y fixed overlays via a portal-like pattern (outside layouts)
  const wrapWithA11y = (layoutContent: React.ReactNode) => (
    <>
      {a11yFixedElements}
      {/* Per-page background CSS override (M9) — sanitized: author CSS arrives over postMessage,
          and a `</style>` sequence inside it would break out of the style context and execute. */}
      {perPageBgCss && <style dangerouslySetInnerHTML={{ __html: sanitizeCss(perPageBgCss) }} />}
      {perPageCustomCss && (
        <style dangerouslySetInnerHTML={{ __html: sanitizeCss(perPageCustomCss) }} />
      )}
      {layoutContent}
    </>
  );

  // ── Builder Mode: render canvas components instead of fixed layouts ──
  // ISOLATED: Each page checks its OWN canvas data. Non-login pages NEVER
  // fall back to login's builder — they fall through to the layout renderer.
  const pageCanvasMode = (pageOverride as any).canvasMode as string | undefined;
  const pageCanvasComponents = (pageOverride as any).canvasComponents as any[] | undefined;
  const globalCanvasMode = rawParsed.canvasMode as string | undefined;

  // Only use global canvas for LOGIN page; non-login pages must have their OWN builder data
  const effectiveCanvasMode =
    activePageId === "login" ? pageCanvasMode || globalCanvasMode : pageCanvasMode; // Non-login: ONLY their own override, no fallback
  const effectiveCanvasComponents =
    activePageId === "login"
      ? pageCanvasComponents && pageCanvasComponents.length > 0
        ? pageCanvasComponents
        : (rawParsed.components as any[] | undefined)
      : pageCanvasComponents && pageCanvasComponents.length > 0
        ? pageCanvasComponents
        : undefined; // Non-login: no fallback to login's components
  const effectiveCanvasGridRows =
    ((pageOverride as any).canvasGridRows as number) ||
    (activePageId === "login" ? (rawParsed.canvasGridRows as number) : undefined) ||
    8;
  const effectiveCanvasBackground =
    (pageOverride as any).canvasBackground ||
    (activePageId === "login" ? rawParsed.canvasBackground : undefined);
  const effectiveCanvasPositionMode =
    ((pageOverride as any).canvasPositionMode as "grid" | "absolute") ||
    (activePageId === "login"
      ? (rawParsed.canvasPositionMode as "grid" | "absolute")
      : undefined) ||
    "grid";

  // The layout (or canvas-builder) render is resolved into a value rather than
  // returned directly, so a single trailing return can pair it with the a11y
  // badge above — every case below is unchanged, just captured instead of
  // exited from.
  const content = (() => {
    if (effectiveCanvasMode === "builder" && Array.isArray(effectiveCanvasComponents)) {
      return wrapWithA11y(
        <CanvasRenderer
          components={effectiveCanvasComponents as any}
          gridRows={effectiveCanvasGridRows}
          canvasBackground={effectiveCanvasBackground as any}
          positionMode={effectiveCanvasPositionMode}
        />
      );
    }

    switch (effectiveLayout) {
      case "split-left":
        return wrapWithA11y(
          <div
            className={`login-page flex min-h-screen w-full ${bgStyle} selection:bg-primary/20`}
            dir={direction}
            style={splitWrapperStyle}
          >
            <div
              className="relative z-10 flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 xl:w-[45%]"
              style={formSideStyle}
            >
              {overlayDiv}
              {topActions}
              <MobileLogo logoSrc={logoUrl} logoAlt={companyName} companyName={companyName} />
              <DesktopHeading companyName={companyName} />
              {formContent}
              {footer}
              {footerSlot}
            </div>
            <LoginBranding
              branding={brandingForPanel}
              slotConfig={slotConfig}
              position="right"
              transparent={isUnifiedBg}
            />
          </div>
        );

      case "centered":
        return (
          <div
            className={`login-page relative flex min-h-screen w-full flex-col items-center ${bgStyle} selection:bg-primary/20`}
            dir={direction}
            style={wrapperStyle}
          >
            {overlayDiv}
            <div className="relative z-10 flex w-full flex-1 flex-col items-center">
              {topActions}
              <div className="flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 py-24">
                <div className="mb-10 flex flex-col items-center gap-4 text-center">
                  <LogoBox logoSrc={logoUrl} logoAlt={companyName} />
                  <h1
                    className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
                    style={{
                      fontFamily: "var(--login-font-heading, inherit)",
                      fontSize: "var(--login-size-headline, 1.875rem)",
                      fontWeight: "var(--login-weight-heading, 600)",
                    }}
                  >
                    {companyName}
                  </h1>
                  <p
                    className="login-subtitle text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"
                    style={{ fontSize: "var(--login-size-subtitle, 0.875rem)" }}
                  >
                    {t("auth.pleaseLogin")}
                  </p>
                </div>
                <SlotRenderer
                  slotId="login.sidebar.content"
                  slotConfig={slotConfig}
                  className="mb-8 w-full"
                />
                {formContent}
                {footer}
                {footerSlot}
              </div>
            </div>
          </div>
        );

      case "branded-full":
        return (
          <div
            className={`login-page relative flex min-h-screen w-full items-center justify-center ${bgStyle} selection:bg-primary/20`}
            dir={direction}
            style={wrapperStyle}
          >
            {overlayDiv}
            {topActions}
            <div
              className="login-card border-[var(--login-border,hsl(var(--border)))]/50 relative z-10 mx-4 w-full max-w-[480px] border backdrop-blur-xl"
              style={{
                borderRadius: "var(--login-radius-card, 16px)",
                padding: "var(--login-card-padding, 32px)",
                boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25))",
                backgroundColor:
                  "color-mix(in srgb, var(--login-surface, hsl(var(--background))) 95%, transparent)",
              }}
            >
              <div className="mb-8 flex flex-col items-center gap-3 text-center">
                <LogoBox logoSrc={logoUrl} logoAlt={companyName} />
                <h1
                  className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
                  style={{
                    fontFamily: "var(--login-font-heading, inherit)",
                    fontSize: "var(--login-size-headline, 1.5rem)",
                    fontWeight: "var(--login-weight-heading, 600)",
                  }}
                >
                  {companyName}
                </h1>
              </div>
              {formContent}
              {footer}
              {footerSlot}
            </div>
          </div>
        );

      case "minimal":
        return (
          <div
            className={`login-page flex min-h-screen w-full flex-col items-center justify-center ${bgStyle} selection:bg-primary/20`}
            dir={direction}
            style={wrapperStyle}
          >
            {topActions}
            <div className="w-full max-w-[380px] px-6">
              <div className="mb-10 flex flex-col items-center gap-3 text-center">
                <LogoBox logoSrc={logoUrl} logoAlt={companyName} />
                <h1
                  className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
                  style={{
                    fontFamily: "var(--login-font-heading, inherit)",
                    fontSize: "var(--login-size-headline, 1.5rem)",
                    fontWeight: "var(--login-weight-heading, 600)",
                  }}
                >
                  {companyName}
                </h1>
                <p
                  className="login-subtitle text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"
                  style={{ fontSize: "var(--login-size-subtitle, 0.875rem)" }}
                >
                  {t("auth.pleaseLogin")}
                </p>
              </div>
              {formContent}
              {footer}
              {footerSlot}
            </div>
          </div>
        );

      case "overlay":
        return (
          <div
            className={`login-page relative flex min-h-screen w-full items-center justify-center ${bgStyle} selection:bg-primary/20`}
            dir={direction}
            style={wrapperStyle}
          >
            <div
              className="login-overlay absolute inset-0"
              style={{
                backgroundColor: "var(--login-overlay-color, hsl(var(--background)))",
                opacity: "var(--login-overlay-opacity, 0.7)",
                backdropFilter: "blur(var(--login-overlay-blur, 6px))",
              }}
            />
            {topActions}
            <div
              className="login-card border-[var(--login-accent,hsl(var(--border)))]/30 relative z-10 mx-4 w-full border backdrop-blur-2xl"
              style={{
                maxWidth: "var(--login-form-width, 420px)",
                borderRadius: "var(--login-radius-card, 24px)",
                padding: "var(--login-card-padding, 32px)",
                boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25))",
                backgroundColor:
                  "color-mix(in srgb, var(--login-surface, hsl(var(--background))) 85%, transparent)",
              }}
            >
              <div
                className="from-[var(--login-primary,hsl(var(--primary)))]/20 to-[var(--login-primary,hsl(var(--primary)))]/10 pointer-events-none absolute -inset-px bg-gradient-to-b via-transparent"
                style={{ borderRadius: "var(--login-radius-card, 24px)" }}
              />
              <div className="relative z-10">
                <div className="mb-8 flex flex-col items-center gap-3 text-center">
                  <LogoBox logoSrc={logoUrl} logoAlt={companyName} />
                  <h1
                    className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
                    style={{
                      fontFamily: "var(--login-font-heading, inherit)",
                      fontSize: "var(--login-size-headline, 1.5rem)",
                      fontWeight: "var(--login-weight-heading, 600)",
                    }}
                  >
                    {companyName}
                  </h1>
                  <p
                    className="login-subtitle text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"
                    style={{ fontSize: "var(--login-size-subtitle, 0.875rem)" }}
                  >
                    {t("auth.pleaseLogin")}
                  </p>
                </div>
                {formContent}
                {footer}
                {footerSlot}
              </div>
            </div>
          </div>
        );

      case "magazine":
        return (
          <div
            className={`login-page flex min-h-screen w-full ${bgStyle} selection:bg-primary/20`}
            dir={direction}
            style={wrapperStyle}
          >
            <div
              className="relative hidden flex-col justify-end overflow-hidden p-16 lg:flex lg:w-3/5"
              style={{
                backgroundImage: "var(--login-bg-image, none)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 max-w-2xl">
                <h1
                  className="login-heading text-6xl leading-[1.1] tracking-tight text-[var(--login-text,white)]"
                  style={{
                    fontFamily: "var(--login-font-heading, inherit)",
                    fontWeight: "var(--login-weight-heading, 700)",
                  }}
                >
                  {headline}
                </h1>
                <p className="login-subtitle mt-4 text-lg text-[var(--login-text-muted,rgba(255,255,255,0.8))]">
                  {subtitle}
                </p>
              </div>
              <SlotRenderer
                slotId="login.sidebar.content"
                slotConfig={slotConfig}
                className="relative z-10 mt-8"
              />
            </div>
            <div
              className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-2/5"
              style={formSideStyle}
            >
              {topActions}
              <MobileLogo logoSrc={logoUrl} logoAlt={companyName} companyName={companyName} />
              <DesktopHeading companyName={companyName} />
              {formContent}
              {footer}
              {footerSlot}
            </div>
          </div>
        );

      case "stacked":
        return (
          <div
            className={`login-page flex min-h-screen w-full flex-col ${bgStyle} selection:bg-primary/20`}
            dir={direction}
            style={wrapperStyle}
          >
            {topActions}
            <div
              className="relative w-full overflow-hidden px-8 py-12 text-center"
              style={{
                backgroundImage: "var(--login-bg-image, none)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                className="absolute inset-0"
                style={{ backgroundColor: "var(--login-surface, hsl(var(--muted)/0.4))" }}
              />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <LogoBox logoSrc={logoUrl} logoAlt={companyName} />
                <h1
                  className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
                  style={{
                    fontFamily: "var(--login-font-heading, inherit)",
                    fontSize: "var(--login-size-headline, 1.875rem)",
                    fontWeight: "var(--login-weight-heading, 600)",
                  }}
                >
                  {companyName}
                </h1>
                <p
                  className="login-subtitle text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"
                  style={{ fontSize: "var(--login-size-subtitle, 0.875rem)" }}
                >
                  {t("auth.pleaseLogin")}
                </p>
              </div>
              <SlotRenderer
                slotId="login.sidebar.content"
                slotConfig={slotConfig}
                className="relative z-10 mt-6"
              />
            </div>
            <div
              className="flex flex-1 flex-col items-center justify-center px-6 py-12"
              style={formSideStyle}
            >
              {formContent}
              {footer}
              {footerSlot}
            </div>
          </div>
        );

      case "sidebar-compact":
        return (
          <div
            className={`login-page flex min-h-screen w-full ${bgStyle} selection:bg-primary/20`}
            dir={direction}
            style={splitWrapperStyle}
          >
            <div className="hidden w-20 flex-col items-center justify-between border-e border-border bg-[var(--login-surface,hsl(var(--muted)/0.4))] py-8 lg:flex">
              <LogoBox logoSrc={logoUrl} logoAlt={companyName} size="sm" />
              <p className="rotate-180 text-[9px] text-muted-foreground/40 [writing-mode:vertical-lr]">
                {copyrightText || `© ${new Date().getFullYear()} ${companyName}`}
              </p>
            </div>
            <div
              className="relative flex flex-1 flex-col items-center justify-center px-6 py-12"
              style={formSideStyle}
            >
              {topActions}
              <MobileLogo logoSrc={logoUrl} logoAlt={companyName} companyName={companyName} />
              <DesktopHeading companyName={companyName} />
              {formContent}
              {footer}
              {footerSlot}
            </div>
          </div>
        );

      case "asymmetric":
        return (
          <div
            className={`login-page flex min-h-screen w-full ${bgStyle} selection:bg-primary/20`}
            dir={direction}
            style={splitWrapperStyle}
          >
            <div className="relative hidden overflow-hidden lg:flex lg:w-[60%]">
              <LoginBranding
                branding={brandingForPanel}
                slotConfig={slotConfig}
                position="left"
                transparent={isUnifiedBg}
              />
              <div className="absolute inset-y-0 end-0 w-1 bg-gradient-to-b from-transparent via-[var(--login-primary,hsl(var(--primary)))] to-transparent" />
            </div>
            <div
              className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-[40%]"
              style={formSideStyle}
            >
              {topActions}
              <MobileLogo logoSrc={logoUrl} logoAlt={companyName} companyName={companyName} />
              <DesktopHeading companyName={companyName} />
              {formContent}
              {footer}
              {footerSlot}
            </div>
          </div>
        );

      case "floating":
        return (
          <div
            className={`login-page relative flex min-h-screen w-full items-center justify-center ${bgStyle} selection:bg-primary/20`}
            dir={direction}
            style={wrapperStyle}
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            {topActions}
            <div
              className="login-card relative z-10 mx-4 w-full border border-[var(--login-border,hsl(var(--border)))]"
              style={{
                maxWidth: "var(--login-form-width, 440px)",
                borderRadius: "var(--login-radius-card, 16px)",
                padding: "var(--login-card-padding, 32px)",
                boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25))",
                backgroundColor: "var(--login-surface, hsl(var(--background)))",
              }}
            >
              <div className="mb-8 flex flex-col items-center gap-3 text-center">
                <LogoBox logoSrc={logoUrl} logoAlt={companyName} />
                <h1
                  className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
                  style={{
                    fontFamily: "var(--login-font-heading, inherit)",
                    fontSize: "var(--login-size-headline, 1.5rem)",
                    fontWeight: "var(--login-weight-heading, 600)",
                  }}
                >
                  {companyName}
                </h1>
                <p
                  className="login-subtitle text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"
                  style={{ fontSize: "var(--login-size-subtitle, 0.875rem)" }}
                >
                  {t("auth.pleaseLogin")}
                </p>
              </div>
              {formContent}
              {footer}
              {footerSlot}
            </div>
          </div>
        );

      case "immersive":
        return (
          <div
            className={`login-page relative flex min-h-screen w-full ${bgStyle} selection:bg-primary/20`}
            dir={direction}
            style={wrapperStyle}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom right, var(--login-overlay-color, hsl(var(--background)))/0.8, transparent/0.4, var(--login-overlay-color, hsl(var(--background)))/0.8)",
                opacity: "var(--login-overlay-opacity, 0.7)",
                backdropFilter: "blur(var(--login-overlay-blur, 0px))",
              }}
            />
            {topActions}
            <div className="relative z-10 hidden flex-col justify-center px-16 lg:flex lg:w-3/5 xl:px-24">
              <h1
                className="login-heading text-7xl leading-[0.95] tracking-tighter text-[var(--login-text,hsl(var(--foreground)))]"
                style={{
                  fontFamily: "var(--login-font-heading, inherit)",
                  fontWeight: "var(--login-weight-heading, 900)",
                }}
              >
                {headline}
              </h1>
              <p
                className="login-subtitle mt-6 max-w-lg text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"
                style={{ fontSize: "var(--login-size-subtitle, 1.25rem)" }}
              >
                {subtitle}
              </p>
              <SlotRenderer
                slotId="login.sidebar.content"
                slotConfig={slotConfig}
                className="mt-10"
              />
            </div>
            <div className="relative z-10 flex w-full flex-col items-center justify-center px-8 py-12 lg:w-2/5">
              <MobileLogo logoSrc={logoUrl} logoAlt={companyName} companyName={companyName} />
              <DesktopHeading companyName={companyName} />
              {formContent}
              {footer}
              {footerSlot}
            </div>
          </div>
        );

      case "split-diagonal":
        return (
          <div
            className={`login-page relative flex min-h-screen w-full ${bgStyle} selection:bg-primary/20`}
            dir={direction}
            style={splitWrapperStyle}
          >
            <div
              className="absolute inset-0 hidden w-[55%] lg:block"
              style={{
                clipPath: "polygon(0 0, 100% 0, 75% 100%, 0 100%)",
                backgroundColor: "var(--login-surface, hsl(var(--muted)/0.4))",
              }}
            >
              <LoginBranding branding={brandingForPanel} slotConfig={slotConfig} position="left" />
            </div>
            <div
              className="relative z-10 flex w-full flex-col items-center justify-center px-6 py-12 lg:ms-auto lg:w-[50%]"
              style={formSideStyle}
            >
              {topActions}
              <MobileLogo logoSrc={logoUrl} logoAlt={companyName} companyName={companyName} />
              <DesktopHeading companyName={companyName} />
              {formContent}
              {footer}
              {footerSlot}
            </div>
          </div>
        );

      case "carousel":
        return (
          <div
            className={`login-page flex min-h-screen w-full ${bgStyle} selection:bg-primary/20`}
            dir={direction}
            style={splitWrapperStyle}
          >
            <div className="relative hidden flex-col justify-center overflow-hidden border-e border-border bg-[var(--login-surface,hsl(var(--muted)/0.4))] p-16 lg:flex lg:w-1/2 xl:w-[55%]">
              <div className="mb-8">
                <LogoBox logoSrc={logoUrl} logoAlt={companyName} />
              </div>
              <h2
                className="login-heading text-4xl tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
                style={{
                  fontFamily: "var(--login-font-heading, inherit)",
                  fontWeight: "var(--login-weight-heading, 700)",
                }}
              >
                {headline}
              </h2>
              <p className="login-subtitle mt-4 text-lg text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
                {subtitle}
              </p>
              <SlotRenderer
                slotId="login.sidebar.content"
                slotConfig={slotConfig}
                className="mt-10"
              />
              <SlotRenderer
                slotId="login.sidebar.bottom"
                slotConfig={slotConfig}
                className="mt-auto pt-10"
              />
            </div>
            <div
              className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 xl:w-[45%]"
              style={formSideStyle}
            >
              {topActions}
              <MobileLogo logoSrc={logoUrl} logoAlt={companyName} companyName={companyName} />
              <DesktopHeading companyName={companyName} />
              {formContent}
              {footer}
              {footerSlot}
            </div>
          </div>
        );

      case "glass-morphism":
        return (
          <div
            className={`login-page relative flex min-h-screen w-full items-center justify-center ${bgStyle} selection:bg-primary/20`}
            dir={direction}
            style={wrapperStyle}
          >
            <div
              className="login-overlay absolute inset-0"
              style={{
                backgroundColor: "var(--login-overlay-color, hsl(var(--background)))",
                opacity: "var(--login-overlay-opacity, 0.5)",
                backdropFilter: "blur(var(--login-overlay-blur, 2px))",
              }}
            />
            <div className="bg-[var(--login-primary,hsl(var(--primary)))]/20 pointer-events-none absolute start-1/4 top-1/4 h-64 w-64 rounded-full blur-[100px]" />
            <div className="bg-[var(--login-primary,hsl(var(--primary)))]/15 pointer-events-none absolute bottom-1/4 end-1/4 h-48 w-48 rounded-full blur-[80px]" />
            {topActions}
            <div
              className="relative z-10 mx-4 w-full"
              style={{ maxWidth: "var(--login-form-width, 440px)" }}
            >
              <div
                className="login-card border-[var(--login-accent,hsl(var(--border)))]/20 border backdrop-blur-3xl"
                style={{
                  maxWidth: "var(--login-form-width, 440px)",
                  borderRadius: "var(--login-radius-card, 24px)",
                  padding: "var(--login-card-padding, 40px)",
                  boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25))",
                  backgroundColor:
                    "color-mix(in srgb, var(--login-surface, hsl(var(--background))) 70%, transparent)",
                }}
              >
                <div
                  className="from-[var(--login-primary,hsl(var(--primary)))]/30 to-[var(--login-primary,hsl(var(--primary)))]/15 pointer-events-none absolute -inset-px bg-gradient-to-br via-transparent"
                  style={{ borderRadius: "var(--login-radius-card, 24px)" }}
                />
                <div className="relative z-10">
                  <div className="mb-8 flex flex-col items-center gap-3 text-center">
                    <LogoBox logoSrc={logoUrl} logoAlt={companyName} />
                    <h1
                      className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
                      style={{
                        fontFamily: "var(--login-font-heading, inherit)",
                        fontSize: "var(--login-size-headline, 1.5rem)",
                        fontWeight: "var(--login-weight-heading, 700)",
                      }}
                    >
                      {companyName}
                    </h1>
                    <p
                      className="login-subtitle text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"
                      style={{ fontSize: "var(--login-size-subtitle, 0.875rem)" }}
                    >
                      {t("auth.pleaseLogin")}
                    </p>
                  </div>
                  {formContent}
                  {footer}
                  {footerSlot}
                </div>
              </div>
            </div>
          </div>
        );

      case "gradient-wave":
        return (
          <div
            className={`login-page flex min-h-screen w-full flex-col ${bgStyle} selection:bg-primary/20`}
            dir={direction}
            style={wrapperStyle}
          >
            {topActions}
            <div
              className="relative flex flex-col items-center justify-center px-8 pb-24 pt-20 text-center"
              style={{ backgroundColor: "var(--login-surface, hsl(var(--muted)/0.4))" }}
            >
              <LogoBox logoSrc={logoUrl} logoAlt={companyName} />
              <h1
                className="login-heading mt-6 tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
                style={{
                  fontFamily: "var(--login-font-heading, inherit)",
                  fontSize: "var(--login-size-headline, 2.25rem)",
                  fontWeight: "var(--login-weight-heading, 700)",
                }}
              >
                {companyName}
              </h1>
              <p
                className="login-subtitle mt-3 text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"
                style={{ fontSize: "var(--login-size-subtitle, 1rem)" }}
              >
                {subtitle}
              </p>
              <svg
                className="absolute -bottom-1 start-0 w-full"
                viewBox="0 0 1440 100"
                preserveAspectRatio="none"
                style={{ height: "60px" }}
              >
                <path
                  d="M0,40 C360,100 720,0 1080,60 C1260,80 1380,50 1440,40 L1440,100 L0,100 Z"
                  fill="var(--login-bg, hsl(var(--background)))"
                />
              </svg>
            </div>
            <div
              className="flex flex-1 flex-col items-center justify-center px-6 py-12"
              style={formSideStyle}
            >
              {formContent}
              {footer}
              {footerSlot}
            </div>
          </div>
        );

      case "spotlight":
        return (
          <div
            className={`login-page relative flex min-h-screen w-full items-center justify-center ${bgStyle} selection:bg-primary/20`}
            dir={direction}
            style={wrapperStyle}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 50% 60% at 50% 50%, var(--login-primary, hsl(var(--primary)))/0.12 0%, transparent 70%)`,
              }}
            />
            {topActions}
            <div
              className="login-card relative z-10 mx-4 w-full border border-[var(--login-accent,hsl(var(--border)))]"
              style={{
                maxWidth: "var(--login-form-width, 420px)",
                borderRadius: "var(--login-radius-card, 16px)",
                padding: "var(--login-card-padding, 32px)",
                boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25))",
                backgroundColor: "var(--login-surface, hsl(var(--background)))",
              }}
            >
              <div className="mb-8 flex flex-col items-center gap-3 text-center">
                <LogoBox logoSrc={logoUrl} logoAlt={companyName} />
                <h1
                  className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
                  style={{
                    fontFamily: "var(--login-font-heading, inherit)",
                    fontSize: "var(--login-size-headline, 1.5rem)",
                    fontWeight: "var(--login-weight-heading, 600)",
                  }}
                >
                  {companyName}
                </h1>
                <p
                  className="login-subtitle text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"
                  style={{ fontSize: "var(--login-size-subtitle, 0.875rem)" }}
                >
                  {t("auth.pleaseLogin")}
                </p>
              </div>
              {formContent}
              {footer}
              {footerSlot}
            </div>
          </div>
        );

      case "dual-panel":
        return (
          <div
            className={`login-page flex min-h-screen w-full flex-col ${bgStyle} selection:bg-primary/20`}
            dir={direction}
            style={splitWrapperStyle}
          >
            <div
              className="flex items-center justify-between border-b border-border px-8 py-4"
              style={{ backgroundColor: "var(--login-surface, hsl(var(--muted)/0.4))" }}
            >
              <div className="flex items-center gap-3">
                <LogoBox logoSrc={logoUrl} logoAlt={companyName} size="sm" />
                <span className="text-sm font-semibold text-[var(--login-text,hsl(var(--foreground)))]">
                  {companyName}
                </span>
              </div>
              <div className="flex gap-1">
                <LanguageSwitcher />
                <ThemeSwitcher />
              </div>
            </div>
            <div className="flex flex-1">
              <div
                className="hidden flex-col justify-center border-e border-border px-12 lg:flex lg:w-1/2 xl:px-16"
                style={{ backgroundColor: "var(--login-surface, hsl(var(--muted)/0.2))" }}
              >
                <h2
                  className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
                  style={{
                    fontFamily: "var(--login-font-heading, inherit)",
                    fontSize: "var(--login-size-headline, 1.875rem)",
                    fontWeight: "var(--login-weight-heading, 700)",
                  }}
                >
                  {headline}
                </h2>
                <p
                  className="login-subtitle mt-3 text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"
                  style={{ fontSize: "var(--login-size-subtitle, 1rem)" }}
                >
                  {subtitle}
                </p>
                <SlotRenderer
                  slotId="login.sidebar.content"
                  slotConfig={slotConfig}
                  className="mt-10"
                />
              </div>
              <div
                className="flex flex-1 flex-col items-center justify-center px-6 py-12"
                style={formSideStyle}
              >
                <MobileLogo logoSrc={logoUrl} logoAlt={companyName} companyName={companyName} />
                {formContent}
                {footer}
                {footerSlot}
              </div>
            </div>
          </div>
        );

      case "corner-card":
        return (
          <div
            className={`login-page relative flex min-h-screen w-full ${bgStyle} selection:bg-primary/20`}
            dir={direction}
            style={wrapperStyle}
          >
            {overlayDiv}
            {topActions}
            <div className="relative z-10 hidden flex-1 flex-col justify-center px-16 lg:flex xl:px-24">
              <h1
                className="login-heading text-6xl tracking-tighter text-[var(--login-text,hsl(var(--foreground)))]"
                style={{
                  fontFamily: "var(--login-font-heading, inherit)",
                  fontWeight: "var(--login-weight-heading, 900)",
                }}
              >
                {headline}
              </h1>
              <p className="login-subtitle mt-4 max-w-lg text-lg text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
                {subtitle}
              </p>
              <SlotRenderer
                slotId="login.sidebar.content"
                slotConfig={slotConfig}
                className="mt-8"
              />
            </div>
            <div className="relative z-10 flex w-full items-end justify-center p-6 lg:w-auto lg:justify-end lg:p-10">
              <div
                className="login-card w-full border border-[var(--login-accent,hsl(var(--border)))]"
                style={{
                  maxWidth: "var(--login-form-width, 400px)",
                  borderRadius: "var(--login-radius-card, 16px)",
                  padding: "var(--login-card-padding, 32px)",
                  boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25))",
                  backgroundColor: "var(--login-surface, hsl(var(--background)))",
                }}
              >
                <div className="mb-6 flex items-center gap-3">
                  <LogoBox logoSrc={logoUrl} logoAlt={companyName} size="sm" />
                  <span className="text-sm font-semibold text-[var(--login-text,hsl(var(--foreground)))]">
                    {companyName}
                  </span>
                </div>
                {formContent}
                {footer}
                {footerSlot}
              </div>
            </div>
          </div>
        );

      case "vertical-split":
        return (
          <div
            className={`login-page flex min-h-screen w-full flex-col ${bgStyle} selection:bg-primary/20`}
            dir={direction}
            style={wrapperStyle}
          >
            {topActions}
            <div
              className="relative flex flex-1 flex-col items-center justify-center px-8 py-16 text-center"
              style={{
                backgroundImage: "var(--login-bg-image, none)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                className="absolute inset-0"
                style={{ backgroundColor: "var(--login-surface, hsl(var(--muted)/0.6))" }}
              />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <LogoBox logoSrc={logoUrl} logoAlt={companyName} size="lg" />
                <h1
                  className="login-heading text-4xl tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
                  style={{
                    fontFamily: "var(--login-font-heading, inherit)",
                    fontWeight: "var(--login-weight-heading, 700)",
                  }}
                >
                  {headline}
                </h1>
                <p
                  className="login-subtitle text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"
                  style={{ fontSize: "var(--login-size-subtitle, 1rem)" }}
                >
                  {subtitle}
                </p>
              </div>
              <div className="absolute -bottom-px start-0 end-0 h-1 bg-gradient-to-r from-transparent via-[var(--login-primary,hsl(var(--primary)))] to-transparent" />
            </div>
            <div
              className="flex flex-1 flex-col items-center justify-center px-6 py-12"
              style={formSideStyle}
            >
              {formContent}
              {footer}
              {footerSlot}
            </div>
          </div>
        );

      case "fullscreen-form":
        return (
          <div
            className={`login-page relative flex min-h-screen w-full items-center justify-center ${bgStyle} selection:bg-primary/20`}
            dir={direction}
            style={wrapperStyle}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,var(--login-accent,hsl(var(--border)))_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.07]" />
            {topActions}
            <div
              className="relative z-10 w-full px-6"
              style={{ maxWidth: "var(--login-form-width, 400px)" }}
            >
              <div className="mb-12 flex flex-col items-center gap-3 text-center">
                <LogoBox logoSrc={logoUrl} logoAlt={companyName} />
                <h1
                  className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
                  style={{
                    fontFamily: "var(--login-font-heading, inherit)",
                    fontSize: "var(--login-size-headline, 1.5rem)",
                    fontWeight: "var(--login-weight-heading, 600)",
                  }}
                >
                  {companyName}
                </h1>
              </div>
              {formContent}
              {footer}
              {footerSlot}
            </div>
          </div>
        );

      case "mosaic":
        return (
          <div
            className={`login-page relative flex min-h-screen w-full items-center justify-center ${bgStyle} selection:bg-primary/20`}
            dir={direction}
            style={wrapperStyle}
          >
            <div className="pointer-events-none absolute inset-0 grid grid-cols-6 grid-rows-4 gap-1 p-2 opacity-[0.06]">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-[var(--login-primary,hsl(var(--primary)))]"
                  style={{ opacity: 0.3 + (i % 5) * 0.15 }}
                />
              ))}
            </div>
            {topActions}
            <div
              className="login-card relative z-10 mx-4 w-full border border-[var(--login-accent,hsl(var(--border)))]"
              style={{
                maxWidth: "var(--login-form-width, 440px)",
                borderRadius: "var(--login-radius-card, 16px)",
                padding: "var(--login-card-padding, 32px)",
                boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25))",
                backgroundColor: "var(--login-surface, hsl(var(--background)))",
              }}
            >
              <div className="mb-8 flex flex-col items-center gap-3 text-center">
                <LogoBox logoSrc={logoUrl} logoAlt={companyName} />
                <h1
                  className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
                  style={{
                    fontFamily: "var(--login-font-heading, inherit)",
                    fontSize: "var(--login-size-headline, 1.5rem)",
                    fontWeight: "var(--login-weight-heading, 600)",
                  }}
                >
                  {companyName}
                </h1>
                <p
                  className="login-subtitle text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"
                  style={{ fontSize: "var(--login-size-subtitle, 0.875rem)" }}
                >
                  {t("auth.pleaseLogin")}
                </p>
              </div>
              {formContent}
              {footer}
              {footerSlot}
            </div>
          </div>
        );

      // VAULT — Scripe's cinematic dark-surface split layout
      case "vault":
        return (
          <div
            className="login-page relative flex min-h-screen w-full overflow-hidden"
            dir={direction}
            style={{
              background:
                "var(--sx-bg-grad, radial-gradient(140% 90% at 25% 25%, #151719 0%, #0d0d0e 40%, #050506 80%, #030304 100%))",
              // --sx-* is the frozen vault palette (globals.css) — this route always
              // loads the shared global stylesheet, so the token is guaranteed present;
              // an inline hex fallback here would just be a second hardcoded copy of it.
              color: "var(--sx-text)",
              fontFamily: "inherit",
            }}
          >
            {/* Hero column (left, hidden on mobile) — mirrors VaultLayout's
                "Program Cover": masthead, quiet crest, editorial headline,
                product-family footer. No glow, no badge, no decoration. */}
            <div className="relative hidden flex-col justify-between px-10 py-10 lg:flex lg:w-[55%]">
              {/* Masthead */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg">
                  <Image src={logoUrl} alt={companyName} width={32} height={32} unoptimized className="h-full w-full object-contain" />
                </div>
                <span className="text-base font-semibold" style={{ color: "var(--sx-text)" }}>
                  {companyName}
                </span>
              </div>
              {/* Cover — crest, headline, standfirst */}
              <div className="flex flex-col gap-5 py-6">
                <div className="flex w-fit flex-col items-center">
                  {/* Canonical 3D mark — no colour filter (V3 fidelity policy: never
                      alter the approved material colours with CSS filters). */}
                  <Image
                    src="/brand/auth/login-relay-grid-3d.png"
                    alt="Scripe"
                    width={112}
                    height={112}
                    className="h-28 w-28 object-contain"
                  />
                  <div
                    aria-hidden="true"
                    style={{
                      width: 64,
                      height: 9,
                      marginTop: -4,
                      background:
                        "radial-gradient(ellipse, rgba(0, 0, 0, 0.42) 0%, transparent 70%)",
                      filter: "blur(4px)",
                    }}
                  />
                </div>
                <h1
                  className="font-bold"
                  style={{
                    fontSize: "clamp(28px, 3.2vw, 40px)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.06,
                    // Solid ink — DESIGN.md bans gradient heading text.
                    color: "var(--sx-text-heading, #f7f8f5)",
                  }}
                >
                  {brandingForPanel?.loginHeadline || t("auth.branding.headline")}
                </h1>
                <p
                  className="text-sm"
                  style={{ color: "var(--sx-text-mute, rgba(247,248,245,.62))" }}
                >
                  {brandingForPanel?.loginSubtitle || t("auth.branding.subtitle")}
                </p>
              </div>
              {/* Cover footer — product family above compliance, one hairline */}
              <div
                className="flex flex-col gap-2 pt-4"
                style={{ borderTop: "1px solid var(--sx-divider, rgba(255,255,255,.08))" }}
              >
                <div
                  className="flex gap-2.5 text-[10px] font-medium uppercase tracking-[0.16em]"
                  style={{ color: "var(--sx-text-mute, rgba(247,248,245,.62))" }}
                >
                  {["Venue", "Academy", "Football Intelligence"].map((c, i) => (
                    <span key={c} className="flex items-center gap-2.5">
                      {i > 0 && <span style={{ color: "var(--sx-accent-text)" }}>·</span>}
                      {c}
                    </span>
                  ))}
                </div>
                <div
                  className="flex gap-2.5 text-[9px] uppercase tracking-widest"
                  style={{ color: "var(--sx-text-faint, rgba(247,248,245,.4))" }}
                >
                  {["SOC 2 II", "HIPAA", "ISO 27001", "GDPR"].map((c, i) => (
                    <span key={c} className="flex items-center gap-2.5">
                      {i > 0 && <span style={{ opacity: 0.4 }}>·</span>}
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Form column (right) */}
            <div className="flex flex-1 items-center justify-center px-5 py-12 lg:pe-10 lg:ps-0">
              <div
                className="w-full max-w-[420px] rounded-[20px] p-8"
                style={{
                  background:
                    "var(--sx-card-bg, linear-gradient(180deg, rgba(21,23,25,.86), rgba(13,13,14,.92)))",
                  border: "1px solid var(--sx-card-border, rgba(198,255,0,.16))",
                  boxShadow: "var(--sx-card-shadow, 0 30px 80px rgba(0,0,0,.6))",
                  backdropFilter: "blur(24px)",
                }}
              >
                {topActions}
                {formContent}
                {footer}
                {footerSlot}
              </div>
            </div>
          </div>
        );

      // SPLIT-RIGHT (default)
      case "split-right":
      default:
        return (
          <div
            className={`login-page flex min-h-screen w-full ${bgStyle} selection:bg-primary/20`}
            dir={direction}
            style={splitWrapperStyle}
          >
            <LoginBranding
              branding={brandingForPanel}
              slotConfig={slotConfig}
              position="left"
              transparent={isUnifiedBg}
            />
            <div
              className="relative z-10 flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 xl:w-[45%]"
              style={formSideStyle}
            >
              {overlayDiv}
              {topActions}
              <MobileLogo logoSrc={logoUrl} logoAlt={companyName} companyName={companyName} />
              <DesktopHeading companyName={companyName} />
              {formContent}
              {footer}
              {footerSlot}
            </div>
          </div>
        );
    }
  })();

  return (
    <>
      {content}
      {a11yActiveBadge}
    </>
  );
}

// ”--€ Shared sub-components ”--€

function MobileLogo({
  logoSrc,
  logoAlt,
  companyName,
}: {
  logoSrc: string;
  logoAlt: string;
  companyName: string;
}) {
  const { t } = useI18n();
  return (
    <div className="mb-12 flex flex-col items-center gap-4 lg:hidden">
      <LogoBox logoSrc={logoSrc} logoAlt={logoAlt} size="lg" />
      <h1
        className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
        style={{
          fontFamily: "var(--login-font-heading, inherit)",
          fontSize: "var(--login-size-headline, 1.5rem)",
          fontWeight: "var(--login-weight-heading, 700)",
        }}
      >
        {companyName}
      </h1>
    </div>
  );
}

function DesktopHeading({ companyName }: { companyName: string }) {
  const { t } = useI18n();
  return (
    <div
      className="mb-10 hidden w-full text-center lg:block lg:text-start"
      style={{ maxWidth: "var(--login-form-width, 380px)" }}
    >
      <h2
        className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
        style={{
          fontFamily: "var(--login-font-heading, inherit)",
          fontSize: "var(--login-size-headline, 1.875rem)",
          fontWeight: "var(--login-weight-heading, 600)",
        }}
      >
        {companyName}
      </h2>
      <p
        className="login-subtitle mt-2 text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"
        style={{ fontSize: "var(--login-size-subtitle, 0.9375rem)" }}
      >
        {t("auth.pleaseLogin")}
      </p>
    </div>
  );
}

function LogoBox({
  logoSrc,
  logoAlt,
  size = "md",
}: {
  logoSrc: string;
  logoAlt: string;
  size?: "sm" | "md" | "lg";
}) {
  const { t } = useI18n();
  const sizeClasses = size === "lg" ? "h-24 w-24" : size === "sm" ? "h-12 w-12" : "h-16 w-16";
  return (
    <div
      className={`login-logo flex items-center justify-center overflow-hidden border border-border bg-background shadow-sm ${sizeClasses}`}
      style={{ borderRadius: "var(--login-radius-card, 0.75rem)" }}
    >
      <Image
        src={logoSrc}
        alt={`${logoAlt} Logo`}
        width={96}
        height={96}
        unoptimized
        className="h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}
