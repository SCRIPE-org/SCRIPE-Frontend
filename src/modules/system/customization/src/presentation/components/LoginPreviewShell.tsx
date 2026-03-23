/**
 * LoginPreviewShell â€” Isolated login page preview for Customizer Studio
 *
 * KEY ARCHITECTURE: This is a completely separate page from /login.
 * It has ZERO auth logic â€” no useLoginViewModel, no checkAndRedirect,
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

import { useEffect, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { BookOpen, Eye, EyeOff, Lock, User } from "lucide-react";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import { BRAND } from "@core/config/branding";
import { useLoginBrandingTokens } from "@modules/auth/signin/src/hooks/useLoginBrandingTokens";
import { LoginBranding } from "@modules/auth/signin/src/presentation/components/LoginBranding";
import { SlotRenderer } from "@modules/auth/signin/src/presentation/components/SlotRenderer";

import { useTheme } from "next-themes";

export function LoginPreviewShell() {
  const { t, language, direction } = useI18n();
  const { setTheme } = useTheme();

  // Listen for theme commands from studio parent
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "NEXORA_STUDIO_SET_THEME") {
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
  } | null>(null);

  // Listen for postMessage from studio parent
  useEffect(() => {
    // Signal to studio that preview is ready
    window.parent?.postMessage({ type: "NEXORA_PREVIEW_READY" }, window.location.origin);

    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "NEXORA_STUDIO_DRAFT_UPDATE") {
        setDraftOverrides(e.data.payload);
      }
      if (e.data?.type === "NEXORA_STUDIO_RESET") {
        setDraftOverrides(null);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Inject CSS tokens from draft
  const { layout, config, slotConfig } = useLoginBrandingTokens({
    loginBrandingJson: draftOverrides?.loginBrandingJson ?? null,
    slotConfigJson: draftOverrides?.slotConfigJson ?? null,
    isSafeMode: false,
  });

  // Derive branding from raw JSON (LoginBrandingConfig only has layout/tokens)
  const rawJson = draftOverrides?.loginBrandingJson;
  const rawParsed = (() => {
    if (!rawJson) return {} as Record<string, unknown>;
    try { return JSON.parse(rawJson) as Record<string, unknown>; } catch { return {} as Record<string, unknown>; }
  })();

  const logoUrl = (rawParsed.logoUrl as string) || "/app-logo.png";
  const companyName = (rawParsed.companyName as string) || BRAND.name;
  const headline = (rawParsed.headline as string) || t("auth.branding.headline");
  const subtitle = (rawParsed.subtitle as string) || t("auth.branding.subtitle");
  const copyrightText = (rawParsed.copyrightText as string) || "";

  // Build "branding" object for LoginBranding component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // â”€â”€ Mock Form (cannot submit) â”€â”€
  const [showPassword, setShowPassword] = useState(false);

  const formContent = (
    <div className="login-form-wrapper w-full" data-hook="form-wrapper" style={{ maxWidth: "var(--login-form-width, 380px)" }}>
      {/* Slot: form.above */}
      <SlotRenderer slotId="login.form.above" slotConfig={slotConfig} className="mb-4" />
      <form onSubmit={(e) => e.preventDefault()} className="login-form flex flex-col" style={{ gap: "var(--login-element-gap, 16px)" }}>
        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="preview-username" className="login-label text-sm font-medium text-[var(--login-text,hsl(var(--foreground)))]">
            {t("auth.username")}
          </Label>
          <div className="relative">
            <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" />
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
          <Label htmlFor="preview-password" className="login-label text-sm font-medium text-[var(--login-text,hsl(var(--foreground)))]">
            {t("auth.password")}
          </Label>
          <div className="relative">
            <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" />
            <Input
              id="preview-password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              className="login-input ps-9 pe-9"
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
        <div className="login-divider relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--login-border,hsl(var(--border)))]" />
        </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[var(--login-surface,hsl(var(--background)))] px-2 text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
              {t("auth.orContinueWith")}
            </span>
          </div>
        </div>
        <div className="login-sso grid grid-cols-2 gap-2">
          <Button variant="outline" type="button" className="h-10 text-xs" style={{ borderRadius: "var(--login-radius-button, 8px)" }}>
            Google
          </Button>
          <Button variant="outline" type="button" className="h-10 text-xs" style={{ borderRadius: "var(--login-radius-button, 8px)" }}>
            Microsoft
          </Button>
        </div>
      </div>

      {/* Slot: form.below */}
      <SlotRenderer slotId="login.form.below" slotConfig={slotConfig} className="mt-6" />
    </div>
  );

  // â”€â”€ Top Actions (visual only) â”€â”€
  const topActions = (
    <div className="absolute left-8 right-8 top-8 flex items-center justify-end gap-5 z-20">
      <div className="flex gap-1">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
    </div>
  );

  // â”€â”€ Footer (copyright â€” shown in ALL layouts) â”€â”€
  const footer = (
    <div className="login-footer text-center mt-8">
      <p className="text-[11px] font-medium text-[var(--login-text-muted,hsl(var(--muted-foreground))/50)]">
        {copyrightText || `© ${new Date().getFullYear()} ${companyName}`}
      </p>
    </div>
  );

  const footerSlot = <SlotRenderer slotId="login.footer" slotConfig={slotConfig} className="mt-6" />;

  // â”€â”€ Common styles â”€â”€
  // NOTE: We use a SINGLE layered `background` (CSS multiple backgrounds) so that:
  //   - `--login-bg-image` (image) renders ON TOP
  //   - `--login-bg` (solid or gradient) renders UNDERNEATH
  // Previously, separate `backgroundImage: none` was OVERRIDING the gradient.
  const bgStyle = "selection:bg-primary/20";
  const wrapperStyle: React.CSSProperties = {
    backgroundImage: "var(--login-bg-image, none)",
    backgroundSize: "var(--login-bg-image-fit, cover)",
    backgroundPosition: "var(--login-bg-image-position, center)",
    backgroundRepeat: "no-repeat",
    backgroundColor: "var(--login-bg, hsl(var(--background)))",
    // fontFamily handled by .login-page CSS class (with RTL combined font stack)
    lineHeight: "var(--login-line-height, 1.5)",
    letterSpacing: "var(--login-letter-spacing, 0px)",
  };

  // For split layouts: depends on unified vs separated mode.
  // UNIFIED: wrapper gets the full bg image spanning both sections; branding panel is transparent.
  // SEPARATED: wrapper has NO bg image; each section div gets its own bg independently.
  const splitWrapperStyle: React.CSSProperties = isUnifiedBg
    ? { ...wrapperStyle }  // unified — full bg on wrapper
    : {
      // separated — no bg image on wrapper, just spacing (font handled by .login-page CSS class)
      lineHeight: wrapperStyle.lineHeight,
      letterSpacing: wrapperStyle.letterSpacing,
      backgroundColor: "hsl(var(--background))",
    };

  // Form-side style: in separated mode, applies the page bg controls to JUST the form section.
  // In unified mode, form side is transparent (wrapper bg shows through).
  const formSideStyle: React.CSSProperties = isUnifiedBg
    ? {}  // transparent — wrapper bg shows through
    : {
      backgroundImage: "var(--login-bg-image, none)",
      backgroundSize: "var(--login-bg-image-fit, cover)",
      backgroundPosition: "var(--login-bg-image-position, center)",
      backgroundRepeat: "no-repeat",
      backgroundColor: "var(--login-bg, hsl(var(--background)))",
    };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 22 LAYOUT VARIANTS (same as LoginView)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  switch (layout) {
    case "split-left":
      return (
        <div className={`login-page flex min-h-screen w-full ${bgStyle} selection:bg-primary/20`} dir={direction} style={splitWrapperStyle}>
          <div className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 xl:w-[45%]" style={formSideStyle}>
            {topActions}
            <MobileLogo logoSrc={logoUrl} logoAlt={companyName} companyName={companyName} />
            <DesktopHeading companyName={companyName} t={t} />
            {formContent}
            {footer}
            {footerSlot}
          </div>
          <LoginBranding t={t} branding={brandingForPanel} slotConfig={slotConfig} position="right" transparent={isUnifiedBg} />
        </div>
      );

    case "centered":
      return (
        <div className={`login-page flex min-h-screen w-full flex-col items-center ${bgStyle} selection:bg-primary/20`} dir={direction} style={wrapperStyle}>
          {topActions}
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 w-full max-w-lg">
            <div className="mb-10 flex flex-col items-center gap-4 text-center">
              <LogoBox logoSrc={logoUrl} logoAlt={companyName} />
              <h1 className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]" style={{ fontFamily: "var(--login-font-heading, inherit)", fontSize: "var(--login-size-headline, 1.875rem)", fontWeight: "var(--login-weight-heading, 600)" }}>{companyName}</h1>
              <p className="login-subtitle text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" style={{ fontSize: "var(--login-size-subtitle, 0.875rem)" }}>{t("auth.pleaseLogin")}</p>
            </div>
            <SlotRenderer slotId="login.sidebar.content" slotConfig={slotConfig} className="mb-8 w-full" />
            {formContent}
            {footer}
            {footerSlot}
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
          <div className="login-overlay absolute inset-0" style={{ backgroundColor: "var(--login-overlay-color, #000000)", opacity: "var(--login-overlay-opacity, 0.5)", backdropFilter: "blur(var(--login-overlay-blur, 0px))" }} />
          {topActions}
          <div className="login-card relative z-10 w-full max-w-[480px] border border-[var(--login-border,hsl(var(--border)))]/50 backdrop-blur-xl mx-4" style={{ borderRadius: "var(--login-radius-card, 16px)", padding: "var(--login-card-padding, 32px)", boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25))", backgroundColor: "color-mix(in srgb, var(--login-surface, hsl(var(--background))) 95%, transparent)" }}>
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
              <LogoBox logoSrc={logoUrl} logoAlt={companyName} />
              <h1 className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]" style={{ fontFamily: "var(--login-font-heading, inherit)", fontSize: "var(--login-size-headline, 1.5rem)", fontWeight: "var(--login-weight-heading, 600)" }}>{companyName}</h1>
            </div>
            {formContent}
            {footer}
            {footerSlot}
          </div>
        </div>
      );

    case "minimal":
      return (
        <div className={`login-page flex min-h-screen w-full flex-col items-center justify-center ${bgStyle} selection:bg-primary/20`} dir={direction} style={wrapperStyle}>
          {topActions}
          <div className="w-full max-w-[380px] px-6">
            <div className="mb-10 flex flex-col items-center gap-3 text-center">
              <LogoBox logoSrc={logoUrl} logoAlt={companyName} />
              <h1 className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]" style={{ fontFamily: "var(--login-font-heading, inherit)", fontSize: "var(--login-size-headline, 1.5rem)", fontWeight: "var(--login-weight-heading, 600)" }}>{companyName}</h1>
              <p className="login-subtitle text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" style={{ fontSize: "var(--login-size-subtitle, 0.875rem)" }}>{t("auth.pleaseLogin")}</p>
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
          <div className="login-overlay absolute inset-0" style={{ backgroundColor: "var(--login-overlay-color, hsl(var(--background)))", opacity: "var(--login-overlay-opacity, 0.7)", backdropFilter: "blur(var(--login-overlay-blur, 6px))" }} />
          {topActions}
          <div className="login-card relative z-10 w-full border border-[var(--login-accent,hsl(var(--border)))]/30 backdrop-blur-2xl mx-4" style={{ maxWidth: "var(--login-form-width, 420px)", borderRadius: "var(--login-radius-card, 24px)", padding: "var(--login-card-padding, 32px)", boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25))", backgroundColor: "color-mix(in srgb, var(--login-surface, hsl(var(--background))) 85%, transparent)" }}>
            <div className="pointer-events-none absolute -inset-px bg-gradient-to-b from-[var(--login-primary,hsl(var(--primary)))]/20 via-transparent to-[var(--login-primary,hsl(var(--primary)))]/10" style={{ borderRadius: "var(--login-radius-card, 24px)" }} />
            <div className="relative z-10">
              <div className="mb-8 flex flex-col items-center gap-3 text-center">
                <LogoBox logoSrc={logoUrl} logoAlt={companyName} />
                <h1 className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]" style={{ fontFamily: "var(--login-font-heading, inherit)", fontSize: "var(--login-size-headline, 1.5rem)", fontWeight: "var(--login-weight-heading, 600)" }}>{companyName}</h1>
                <p className="login-subtitle text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" style={{ fontSize: "var(--login-size-subtitle, 0.875rem)" }}>{t("auth.pleaseLogin")}</p>
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
        <div className={`login-page flex min-h-screen w-full ${bgStyle} selection:bg-primary/20`} dir={direction} style={wrapperStyle}>
          <div className="relative hidden lg:flex lg:w-3/5 flex-col justify-end p-16 overflow-hidden"
            style={{ backgroundImage: "var(--login-bg-image, none)", backgroundSize: "cover", backgroundPosition: "center" }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="relative z-10 max-w-2xl">
              <h1 className="login-heading text-6xl tracking-tight text-[var(--login-text,white)] leading-[1.1]"
                style={{ fontFamily: "var(--login-font-heading, inherit)", fontWeight: "var(--login-weight-heading, 700)" }}
              >
                {headline}
              </h1>
              <p className="login-subtitle mt-4 text-lg text-[var(--login-text-muted,rgba(255,255,255,0.8))]">{subtitle}</p>
            </div>
            <SlotRenderer slotId="login.sidebar.content" slotConfig={slotConfig} className="relative z-10 mt-8" />
          </div>
          <div className="relative flex w-full lg:w-2/5 flex-col items-center justify-center px-6 py-12" style={formSideStyle}>
            {topActions}
            <MobileLogo logoSrc={logoUrl} logoAlt={companyName} companyName={companyName} />
            <DesktopHeading companyName={companyName} t={t} />
            {formContent}
            {footer}
            {footerSlot}
          </div>
        </div>
      );

    case "stacked":
      return (
        <div className={`login-page flex min-h-screen w-full flex-col ${bgStyle} selection:bg-primary/20`} dir={direction} style={wrapperStyle}>
          {topActions}
          <div className="relative w-full py-12 px-8 text-center overflow-hidden"
            style={{ backgroundImage: "var(--login-bg-image, none)", backgroundSize: "cover", backgroundPosition: "center" }}
          >
            <div className="absolute inset-0" style={{ backgroundColor: "var(--login-surface, hsl(var(--muted)/0.4))" }} />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <LogoBox logoSrc={logoUrl} logoAlt={companyName} />
              <h1 className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]" style={{ fontFamily: "var(--login-font-heading, inherit)", fontSize: "var(--login-size-headline, 1.875rem)", fontWeight: "var(--login-weight-heading, 600)" }}>{companyName}</h1>
              <p className="login-subtitle text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" style={{ fontSize: "var(--login-size-subtitle, 0.875rem)" }}>{t("auth.pleaseLogin")}</p>
            </div>
            <SlotRenderer slotId="login.sidebar.content" slotConfig={slotConfig} className="relative z-10 mt-6" />
          </div>
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12" style={formSideStyle}>
            {formContent}
            {footer}
            {footerSlot}
          </div>
        </div>
      );

    case "sidebar-compact":
      return (
        <div className={`login-page flex min-h-screen w-full ${bgStyle} selection:bg-primary/20`} dir={direction} style={splitWrapperStyle}>
          <div className="hidden lg:flex w-20 flex-col items-center justify-between py-8 bg-[var(--login-surface,hsl(var(--muted)/0.4))] border-e border-border">
            <LogoBox logoSrc={logoUrl} logoAlt={companyName} size="sm" />
            <p className="text-[9px] text-muted-foreground/40 [writing-mode:vertical-lr] rotate-180">{copyrightText || `© ${new Date().getFullYear()} ${companyName}`}</p>
          </div>
          <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12" style={formSideStyle}>
            {topActions}
            <MobileLogo logoSrc={logoUrl} logoAlt={companyName} companyName={companyName} />
            <DesktopHeading companyName={companyName} t={t} />
            {formContent}
            {footer}
            {footerSlot}
          </div>
        </div>
      );

    case "asymmetric":
      return (
        <div className={`login-page flex min-h-screen w-full ${bgStyle} selection:bg-primary/20`} dir={direction} style={splitWrapperStyle}>
          <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden">
            <LoginBranding t={t} branding={brandingForPanel} slotConfig={slotConfig} position="left" transparent={isUnifiedBg} />
            <div className="absolute inset-y-0 end-0 w-1 bg-gradient-to-b from-transparent via-[var(--login-primary,hsl(var(--primary)))] to-transparent" />
          </div>
          <div className="relative flex w-full lg:w-[40%] flex-col items-center justify-center px-6 py-12" style={formSideStyle}>
            {topActions}
            <MobileLogo logoSrc={logoUrl} logoAlt={companyName} companyName={companyName} />
            <DesktopHeading companyName={companyName} t={t} />
            {formContent}
            {footer}
            {footerSlot}
          </div>
        </div>
      );

    case "floating":
      return (
        <div className={`login-page relative flex min-h-screen w-full items-center justify-center ${bgStyle} selection:bg-primary/20`} dir={direction} style={wrapperStyle}>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
          {topActions}
          <div className="login-card relative z-10 w-full border border-[var(--login-border,hsl(var(--border)))] mx-4" style={{ maxWidth: "var(--login-form-width, 440px)", borderRadius: "var(--login-radius-card, 16px)", padding: "var(--login-card-padding, 32px)", boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25))", backgroundColor: "var(--login-surface, hsl(var(--background)))" }}>
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
              <LogoBox logoSrc={logoUrl} logoAlt={companyName} />
              <h1 className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]" style={{ fontFamily: "var(--login-font-heading, inherit)", fontSize: "var(--login-size-headline, 1.5rem)", fontWeight: "var(--login-weight-heading, 600)" }}>{companyName}</h1>
              <p className="login-subtitle text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" style={{ fontSize: "var(--login-size-subtitle, 0.875rem)" }}>{t("auth.pleaseLogin")}</p>
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
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom right, var(--login-overlay-color, hsl(var(--background)))/0.8, transparent/0.4, var(--login-overlay-color, hsl(var(--background)))/0.8)", opacity: "var(--login-overlay-opacity, 0.7)", backdropFilter: "blur(var(--login-overlay-blur, 0px))" }} />
          {topActions}
          <div className="relative z-10 hidden lg:flex lg:w-3/5 flex-col justify-center px-16 xl:px-24">
            <h1 className="login-heading text-7xl tracking-tighter leading-[0.95] text-[var(--login-text,hsl(var(--foreground)))]" style={{ fontFamily: "var(--login-font-heading, inherit)", fontWeight: "var(--login-weight-heading, 900)" }}>
              {headline}
            </h1>
            <p className="login-subtitle mt-6 max-w-lg text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" style={{ fontSize: "var(--login-size-subtitle, 1.25rem)" }}>{subtitle}</p>
            <SlotRenderer slotId="login.sidebar.content" slotConfig={slotConfig} className="mt-10" />
          </div>
          <div className="relative z-10 flex w-full lg:w-2/5 flex-col items-center justify-center px-8 py-12">
            <MobileLogo logoSrc={logoUrl} logoAlt={companyName} companyName={companyName} />
            <DesktopHeading companyName={companyName} t={t} />
            {formContent}
            {footer}
            {footerSlot}
          </div>
        </div>
      );

    case "split-diagonal":
      return (
        <div className={`login-page relative flex min-h-screen w-full ${bgStyle} selection:bg-primary/20`} dir={direction} style={splitWrapperStyle}>
          <div className="hidden lg:block absolute inset-0 w-[55%]" style={{ clipPath: "polygon(0 0, 100% 0, 75% 100%, 0 100%)", backgroundColor: "var(--login-surface, hsl(var(--muted)/0.4))" }}>
            <LoginBranding t={t} branding={brandingForPanel} slotConfig={slotConfig} position="left" />
          </div>
          <div className="relative z-10 flex w-full lg:ms-auto lg:w-[50%] flex-col items-center justify-center px-6 py-12" style={formSideStyle}>
            {topActions}
            <MobileLogo logoSrc={logoUrl} logoAlt={companyName} companyName={companyName} />
            <DesktopHeading companyName={companyName} t={t} />
            {formContent}
            {footer}
            {footerSlot}
          </div>
        </div>
      );

    case "carousel":
      return (
        <div className={`login-page flex min-h-screen w-full ${bgStyle} selection:bg-primary/20`} dir={direction} style={splitWrapperStyle}>
          <div className="relative hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-center overflow-hidden bg-[var(--login-surface,hsl(var(--muted)/0.4))] border-e border-border p-16">
            <div className="mb-8"><LogoBox logoSrc={logoUrl} logoAlt={companyName} /></div>
            <h2 className="login-heading text-4xl tracking-tight text-[var(--login-text,hsl(var(--foreground)))]" style={{ fontFamily: "var(--login-font-heading, inherit)", fontWeight: "var(--login-weight-heading, 700)" }}>{headline}</h2>
            <p className="login-subtitle mt-4 text-lg text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">{subtitle}</p>
            <SlotRenderer slotId="login.sidebar.content" slotConfig={slotConfig} className="mt-10" />
            <SlotRenderer slotId="login.sidebar.bottom" slotConfig={slotConfig} className="mt-auto pt-10" />
          </div>
          <div className="relative flex w-full lg:w-1/2 xl:w-[45%] flex-col items-center justify-center px-6 py-12" style={formSideStyle}>
            {topActions}
            <MobileLogo logoSrc={logoUrl} logoAlt={companyName} companyName={companyName} />
            <DesktopHeading companyName={companyName} t={t} />
            {formContent}
            {footer}
            {footerSlot}
          </div>
        </div>
      );

    case "glass-morphism":
      return (
        <div className={`login-page relative flex min-h-screen w-full items-center justify-center ${bgStyle} selection:bg-primary/20`} dir={direction} style={wrapperStyle}>
          <div className="login-overlay absolute inset-0" style={{ backgroundColor: "var(--login-overlay-color, hsl(var(--background)))", opacity: "var(--login-overlay-opacity, 0.5)", backdropFilter: "blur(var(--login-overlay-blur, 2px))" }} />
          <div className="pointer-events-none absolute top-1/4 start-1/4 h-64 w-64 rounded-full bg-[var(--login-primary,hsl(var(--primary)))]/20 blur-[100px]" />
          <div className="pointer-events-none absolute bottom-1/4 end-1/4 h-48 w-48 rounded-full bg-[var(--login-primary,hsl(var(--primary)))]/15 blur-[80px]" />
          {topActions}
          <div className="relative z-10 w-full mx-4" style={{ maxWidth: "var(--login-form-width, 440px)" }}>
            <div className="login-card border border-[var(--login-accent,hsl(var(--border)))]/20 backdrop-blur-3xl" style={{ maxWidth: "var(--login-form-width, 440px)", borderRadius: "var(--login-radius-card, 24px)", padding: "var(--login-card-padding, 40px)", boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25))", backgroundColor: "color-mix(in srgb, var(--login-surface, hsl(var(--background))) 70%, transparent)" }}>
              <div className="pointer-events-none absolute -inset-px bg-gradient-to-br from-[var(--login-primary,hsl(var(--primary)))]/30 via-transparent to-[var(--login-primary,hsl(var(--primary)))]/15" style={{ borderRadius: "var(--login-radius-card, 24px)" }} />
              <div className="relative z-10">
                <div className="mb-8 flex flex-col items-center gap-3 text-center">
                  <LogoBox logoSrc={logoUrl} logoAlt={companyName} />
                  <h1 className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]" style={{ fontFamily: "var(--login-font-heading, inherit)", fontSize: "var(--login-size-headline, 1.5rem)", fontWeight: "var(--login-weight-heading, 700)" }}>{companyName}</h1>
                  <p className="login-subtitle text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" style={{ fontSize: "var(--login-size-subtitle, 0.875rem)" }}>{t("auth.pleaseLogin")}</p>
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
        <div className={`login-page flex min-h-screen w-full flex-col ${bgStyle} selection:bg-primary/20`} dir={direction} style={wrapperStyle}>
          {topActions}
          <div className="relative flex flex-col items-center justify-center px-8 pt-20 pb-24 text-center" style={{ backgroundColor: "var(--login-surface, hsl(var(--muted)/0.4))" }}>
            <LogoBox logoSrc={logoUrl} logoAlt={companyName} />
            <h1 className="login-heading mt-6 tracking-tight text-[var(--login-text,hsl(var(--foreground)))]" style={{ fontFamily: "var(--login-font-heading, inherit)", fontSize: "var(--login-size-headline, 2.25rem)", fontWeight: "var(--login-weight-heading, 700)" }}>{companyName}</h1>
            <p className="login-subtitle mt-3 text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" style={{ fontSize: "var(--login-size-subtitle, 1rem)" }}>{subtitle}</p>
            <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 1440 100" preserveAspectRatio="none" style={{ height: "60px" }}>
              <path d="M0,40 C360,100 720,0 1080,60 C1260,80 1380,50 1440,40 L1440,100 L0,100 Z" fill="var(--login-bg, hsl(var(--background)))" />
            </svg>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12" style={formSideStyle}>
            {formContent}
            {footer}
            {footerSlot}
          </div>
        </div>
      );

    case "spotlight":
      return (
        <div className={`login-page relative flex min-h-screen w-full items-center justify-center ${bgStyle} selection:bg-primary/20`} dir={direction} style={wrapperStyle}>
          <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse 50% 60% at 50% 50%, var(--login-primary, hsl(var(--primary)))/0.12 0%, transparent 70%)` }} />
          {topActions}
          <div className="login-card relative z-10 w-full border border-[var(--login-accent,hsl(var(--border)))] mx-4" style={{ maxWidth: "var(--login-form-width, 420px)", borderRadius: "var(--login-radius-card, 16px)", padding: "var(--login-card-padding, 32px)", boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25))", backgroundColor: "var(--login-surface, hsl(var(--background)))" }}>
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
              <LogoBox logoSrc={logoUrl} logoAlt={companyName} />
              <h1 className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]" style={{ fontFamily: "var(--login-font-heading, inherit)", fontSize: "var(--login-size-headline, 1.5rem)", fontWeight: "var(--login-weight-heading, 600)" }}>{companyName}</h1>
              <p className="login-subtitle text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" style={{ fontSize: "var(--login-size-subtitle, 0.875rem)" }}>{t("auth.pleaseLogin")}</p>
            </div>
            {formContent}
            {footer}
            {footerSlot}
          </div>
        </div>
      );

    case "dual-panel":
      return (
        <div className={`login-page flex min-h-screen w-full flex-col ${bgStyle} selection:bg-primary/20`} dir={direction} style={splitWrapperStyle}>
          <div className="flex items-center justify-between border-b border-border px-8 py-4" style={{ backgroundColor: "var(--login-surface, hsl(var(--muted)/0.4))" }}>
            <div className="flex items-center gap-3">
              <LogoBox logoSrc={logoUrl} logoAlt={companyName} size="sm" />
              <span className="text-sm font-semibold text-[var(--login-text,hsl(var(--foreground)))]">{companyName}</span>
            </div>
            <div className="flex gap-1"><LanguageSwitcher /><ThemeSwitcher /></div>
          </div>
          <div className="flex flex-1">
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-center border-e border-border px-12 xl:px-16" style={{ backgroundColor: "var(--login-surface, hsl(var(--muted)/0.2))" }}>
              <h2 className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]" style={{ fontFamily: "var(--login-font-heading, inherit)", fontSize: "var(--login-size-headline, 1.875rem)", fontWeight: "var(--login-weight-heading, 700)" }}>{headline}</h2>
              <p className="login-subtitle mt-3 text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" style={{ fontSize: "var(--login-size-subtitle, 1rem)" }}>{subtitle}</p>
              <SlotRenderer slotId="login.sidebar.content" slotConfig={slotConfig} className="mt-10" />
            </div>
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12" style={formSideStyle}>
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
        <div className={`login-page relative flex min-h-screen w-full ${bgStyle} selection:bg-primary/20`} dir={direction} style={wrapperStyle}>
          <div className="login-overlay absolute inset-0" style={{ backgroundColor: "var(--login-overlay-color, hsl(var(--background)))", opacity: "var(--login-overlay-opacity, 0.6)", backdropFilter: "blur(var(--login-overlay-blur, 0px))" }} />
          {topActions}
          <div className="relative z-10 hidden lg:flex flex-1 flex-col justify-center px-16 xl:px-24">
            <h1 className="login-heading text-6xl tracking-tighter text-[var(--login-text,hsl(var(--foreground)))]" style={{ fontFamily: "var(--login-font-heading, inherit)", fontWeight: "var(--login-weight-heading, 900)" }}>{headline}</h1>
            <p className="login-subtitle mt-4 max-w-lg text-lg text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">{subtitle}</p>
            <SlotRenderer slotId="login.sidebar.content" slotConfig={slotConfig} className="mt-8" />
          </div>
          <div className="relative z-10 flex w-full lg:w-auto items-end justify-center lg:justify-end p-6 lg:p-10">
            <div className="login-card w-full border border-[var(--login-accent,hsl(var(--border)))]" style={{ maxWidth: "var(--login-form-width, 400px)", borderRadius: "var(--login-radius-card, 16px)", padding: "var(--login-card-padding, 32px)", boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25))", backgroundColor: "var(--login-surface, hsl(var(--background)))" }}>
              <div className="mb-6 flex items-center gap-3">
                <LogoBox logoSrc={logoUrl} logoAlt={companyName} size="sm" />
                <span className="text-sm font-semibold text-[var(--login-text,hsl(var(--foreground)))]">{companyName}</span>
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
        <div className={`login-page flex min-h-screen w-full flex-col ${bgStyle} selection:bg-primary/20`} dir={direction} style={wrapperStyle}>
          {topActions}
          <div className="relative flex flex-1 flex-col items-center justify-center px-8 py-16 text-center" style={{ backgroundImage: "var(--login-bg-image, none)", backgroundSize: "cover", backgroundPosition: "center" }}>
            <div className="absolute inset-0" style={{ backgroundColor: "var(--login-surface, hsl(var(--muted)/0.6))" }} />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <LogoBox logoSrc={logoUrl} logoAlt={companyName} size="lg" />
              <h1 className="login-heading text-4xl tracking-tight text-[var(--login-text,hsl(var(--foreground)))]" style={{ fontFamily: "var(--login-font-heading, inherit)", fontWeight: "var(--login-weight-heading, 700)" }}>{headline}</h1>
              <p className="login-subtitle text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" style={{ fontSize: "var(--login-size-subtitle, 1rem)" }}>{subtitle}</p>
            </div>
            <div className="absolute -bottom-px left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--login-primary,hsl(var(--primary)))] to-transparent" />
          </div>
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12" style={formSideStyle}>
            {formContent}
            {footer}
            {footerSlot}
          </div>
        </div>
      );

    case "fullscreen-form":
      return (
        <div className={`login-page relative flex min-h-screen w-full items-center justify-center ${bgStyle} selection:bg-primary/20`} dir={direction} style={wrapperStyle}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,var(--login-accent,hsl(var(--border)))_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.07]" />
          {topActions}
          <div className="relative z-10 w-full px-6" style={{ maxWidth: "var(--login-form-width, 400px)" }}>
            <div className="mb-12 flex flex-col items-center gap-3 text-center">
              <LogoBox logoSrc={logoUrl} logoAlt={companyName} />
              <h1 className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]" style={{ fontFamily: "var(--login-font-heading, inherit)", fontSize: "var(--login-size-headline, 1.5rem)", fontWeight: "var(--login-weight-heading, 600)" }}>{companyName}</h1>
            </div>
            {formContent}
            {footer}
            {footerSlot}
          </div>
        </div>
      );

    case "mosaic":
      return (
        <div className={`login-page relative flex min-h-screen w-full items-center justify-center ${bgStyle} selection:bg-primary/20`} dir={direction} style={wrapperStyle}>
          <div className="pointer-events-none absolute inset-0 grid grid-cols-6 grid-rows-4 gap-1 p-2 opacity-[0.06]">
            {Array.from({ length: 24 }).map((_, i) => (<div key={i} className="rounded-lg bg-[var(--login-primary,hsl(var(--primary)))]" style={{ opacity: 0.3 + (i % 5) * 0.15 }} />))}
          </div>
          {topActions}
          <div className="login-card relative z-10 w-full border border-[var(--login-accent,hsl(var(--border)))] mx-4" style={{ maxWidth: "var(--login-form-width, 440px)", borderRadius: "var(--login-radius-card, 16px)", padding: "var(--login-card-padding, 32px)", boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25))", backgroundColor: "var(--login-surface, hsl(var(--background)))" }}>
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
              <LogoBox logoSrc={logoUrl} logoAlt={companyName} />
              <h1 className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]" style={{ fontFamily: "var(--login-font-heading, inherit)", fontSize: "var(--login-size-headline, 1.5rem)", fontWeight: "var(--login-weight-heading, 600)" }}>{companyName}</h1>
              <p className="login-subtitle text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" style={{ fontSize: "var(--login-size-subtitle, 0.875rem)" }}>{t("auth.pleaseLogin")}</p>
            </div>
            {formContent}
            {footer}
            {footerSlot}
          </div>
        </div>
      );

    // SPLIT-RIGHT (default)
    case "split-right":
    default:
      return (
        <div className={`login-page flex min-h-screen w-full ${bgStyle} selection:bg-primary/20`} dir={direction} style={splitWrapperStyle}>
          <LoginBranding t={t} branding={brandingForPanel} slotConfig={slotConfig} position="left" transparent={isUnifiedBg} />
          <div className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 xl:w-[45%]" style={formSideStyle}>
            {topActions}
            <MobileLogo logoSrc={logoUrl} logoAlt={companyName} companyName={companyName} />
            <DesktopHeading companyName={companyName} t={t} />
            {formContent}
            {footer}
            {footerSlot}
          </div>
        </div>
      );
  }
}

// â”€â”€ Shared sub-components â”€â”€

function MobileLogo({ logoSrc, logoAlt, companyName }: { logoSrc: string; logoAlt: string; companyName: string }) {
  return (
    <div className="mb-12 flex lg:hidden flex-col items-center gap-4">
      <LogoBox logoSrc={logoSrc} logoAlt={logoAlt} size="lg" />
      <h1
        className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
        style={{
          fontFamily: "var(--login-font-heading, inherit)",
          fontSize: "var(--login-size-headline, 1.5rem)",
          fontWeight: "var(--login-weight-heading, 700)",
        }}
      >{companyName}</h1>
    </div>
  );
}

function DesktopHeading({ companyName, t }: { companyName: string; t: (key: string) => string }) {
  return (
    <div className="mb-10 text-center lg:text-start hidden lg:block w-full" style={{ maxWidth: "var(--login-form-width, 380px)" }}>
      <h2
        className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
        style={{
          fontFamily: "var(--login-font-heading, inherit)",
          fontSize: "var(--login-size-headline, 1.875rem)",
          fontWeight: "var(--login-weight-heading, 600)",
        }}
      >{companyName}</h2>
      <p className="login-subtitle mt-2 text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" style={{ fontSize: "var(--login-size-subtitle, 0.9375rem)" }}>{t("auth.pleaseLogin")}</p>
    </div>
  );
}

function LogoBox({ logoSrc, logoAlt, size = "md" }: { logoSrc: string; logoAlt: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = size === "lg" ? "h-24 w-24" : size === "sm" ? "h-12 w-12" : "h-16 w-16";
  return (
    <div
      className={`login-logo flex items-center justify-center overflow-hidden bg-background border border-border shadow-sm ${sizeClasses}`}
      style={{ borderRadius: "var(--login-radius-card, 0.75rem)" }}
    >
      <img src={logoSrc} alt={`${logoAlt} Logo`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
    </div>
  );
}
