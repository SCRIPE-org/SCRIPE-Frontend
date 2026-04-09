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

import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Eye, EyeOff, Lock, User, Quote as QuoteIcon, Star, Check } from "lucide-react";
import { useState } from "react";

// ── Logo ────────────────────────────────────────────────
export function BuilderLogo({ maxWidth = 200, src, shape = 'auto' }: { maxWidth?: number; src?: string; shape?: string; [k: string]: unknown }) {
  const borderRadius = shape === 'circle' ? '50%' : shape === 'square' ? '0' : shape === 'rounded' ? '8px' : undefined;
  return (
    <div className="flex items-center justify-center w-full">
      <img
        src={resolveFileUrl(src) || '/app-logo.png'}
        alt="Logo"
        className="object-contain"
        style={{ maxWidth: `${maxWidth}px`, maxHeight: '80px', borderRadius }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
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
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full" style={{ maxWidth: 'var(--login-form-width, 380px)' }}>
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col" style={{ gap: 'var(--login-element-gap, 16px)' }}>
        {/* Username */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[var(--login-text,hsl(var(--foreground)))]">
            Username
          </Label>
          <div className="relative">
            <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" />
            <Input
              placeholder="Enter your username"
              className="ps-9"
              readOnly
              style={{
                height: 'var(--login-input-height, 44px)',
                borderRadius: 'var(--login-radius-button, 8px)',
                borderColor: 'var(--login-border, hsl(var(--border)))',
              }}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[var(--login-text,hsl(var(--foreground)))]">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="********"
              className="ps-9 pe-9"
              readOnly
              style={{
                height: 'var(--login-input-height, 44px)',
                borderRadius: 'var(--login-radius-button, 8px)',
                borderColor: 'var(--login-border, hsl(var(--border)))',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Remember / Forgot */}
        {(showRemember || showForgot) && (
          <div className="flex items-center justify-between text-xs">
            {showRemember && (
              <label className="flex items-center gap-2 cursor-pointer text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
                <input type="checkbox" className="h-3.5 w-3.5 rounded" readOnly />
                Remember me
              </label>
            )}
            {showForgot && (
              <span className="text-[var(--login-primary,hsl(var(--primary)))] cursor-pointer hover:underline">
                Forgot password?
              </span>
            )}
          </div>
        )}

        {/* Login Button */}
        <Button
          type="submit"
          className="w-full text-sm font-semibold"
          style={{
            height: 'var(--login-input-height, 44px)',
            backgroundColor: 'var(--login-primary, hsl(var(--primary)))',
            borderRadius: 'var(--login-radius-button, 8px)',
          }}
        >
          Sign In
        </Button>

        {/* Register link */}
        {showRegister && (
          <p className="text-center text-xs text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
            Don&apos;t have an account?{' '}
            <span className="text-[var(--login-primary,hsl(var(--primary)))] cursor-pointer hover:underline">Register</span>
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
                or continue with
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" type="button" className="h-10 text-xs" style={{ borderRadius: 'var(--login-radius-button, 8px)' }}>
              Google
            </Button>
            <Button variant="outline" type="button" className="h-10 text-xs" style={{ borderRadius: 'var(--login-radius-button, 8px)' }}>
              Microsoft
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Heading ─────────────────────────────────────────────
export function BuilderHeading({
  text = 'Welcome Back',
  fontSize = 32,
  fontWeight = 700,
  color = 'inherit',
}: { text?: string; fontSize?: number; fontWeight?: number; color?: string; [k: string]: unknown }) {
  return (
    <h1
      className="tracking-tight"
      style={{
        fontSize: `${fontSize}px`,
        fontWeight,
        color: color === 'inherit' ? 'var(--login-text, hsl(var(--foreground)))' : color,
        fontFamily: 'var(--login-font-heading, inherit)',
      }}
    >
      {text || 'Welcome Back'}
    </h1>
  );
}

// ── Subtitle ────────────────────────────────────────────
export function BuilderSubtitle({
  text = 'Sign in to continue',
  fontSize = 16,
  color = 'inherit',
}: { text?: string; fontSize?: number; color?: string; [k: string]: unknown }) {
  return (
    <p
      style={{
        fontSize: `${fontSize}px`,
        color: color === 'inherit' ? 'var(--login-text-muted, hsl(var(--muted-foreground)))' : color,
      }}
    >
      {text || 'Sign in to continue'}
    </p>
  );
}

// ── Social Login ────────────────────────────────────────
export function BuilderSocialLogin({
  providers = ['google', 'microsoft'],
  layout = 'row',
}: { providers?: string[]; layout?: string; [k: string]: unknown }) {
  const providerLabels: Record<string, string> = {
    google: 'Google',
    microsoft: 'Microsoft',
    github: 'GitHub',
    apple: 'Apple',
  };

  return (
    <div className={`flex gap-2 w-full ${layout === 'column' ? 'flex-col' : layout === 'grid' ? 'flex-wrap' : 'flex-row'}`}>
      {(Array.isArray(providers) ? providers : ['google', 'microsoft']).map((p) => (
        <Button
          key={p}
          variant="outline"
          type="button"
          className="flex-1 h-10 text-xs"
          style={{ borderRadius: 'var(--login-radius-button, 8px)' }}
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
  variant = 'list',
}: { items?: Array<{ icon?: string; title: string; desc?: string }>; maxItems?: number; variant?: string; [k: string]: unknown }) {
  const displayItems = (Array.isArray(items) && items.length > 0) ? items.slice(0, maxItems) : [
    { title: 'Secure & Reliable', desc: 'Enterprise-grade security' },
    { title: 'Easy to Use', desc: 'Intuitive interface' },
    { title: 'Fast Performance', desc: 'Lightning-fast responses' },
  ];

  return (
    <div className="space-y-3 w-full">
      {displayItems.map((item, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--login-primary,hsl(var(--primary)))]/10 mt-0.5">
            <Check className="h-3.5 w-3.5 text-[var(--login-primary,hsl(var(--primary)))]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--login-text,hsl(var(--foreground)))]">{item.title}</p>
            {item.desc && (
              <p className="text-xs text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">{item.desc}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Testimonial ─────────────────────────────────────────
export function BuilderTestimonial({
  quote = 'This product has transformed how we work. Absolutely amazing experience.',
  author = 'Jane Smith',
  role = 'CEO, TechCorp',
}: { quote?: string; author?: string; role?: string; avatar?: string; [k: string]: unknown }) {
  return (
    <div className="w-full rounded-lg border border-[var(--login-border,hsl(var(--border)))]/50 p-4 bg-[var(--login-surface,hsl(var(--background)))]/50">
      <QuoteIcon className="h-5 w-5 text-[var(--login-primary,hsl(var(--primary)))]/40 mb-2" />
      <p className="text-sm italic text-[var(--login-text,hsl(var(--foreground)))] leading-relaxed">
        &ldquo;{quote || 'This product has transformed how we work.'}&rdquo;
      </p>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-[var(--login-primary,hsl(var(--primary)))]/20 flex items-center justify-center">
          <span className="text-xs font-bold text-[var(--login-primary,hsl(var(--primary)))]">
            {(author || 'JS')[0]}
          </span>
        </div>
        <div>
          <p className="text-xs font-medium text-[var(--login-text,hsl(var(--foreground)))]">{author || 'Jane Smith'}</p>
          <p className="text-[10px] text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">{role || 'CEO'}</p>
        </div>
      </div>
    </div>
  );
}

// ── Image ───────────────────────────────────────────────
export function BuilderImage({
  src = '',
  alt = '',
  objectFit = 'cover',
  maxWidth = '100%',
  borderRadius = 8,
}: { src?: string; alt?: string; objectFit?: string; maxWidth?: string | number; borderRadius?: number; [k: string]: unknown }) {
  if (!src) {
    return (
      <div
        className="w-full h-32 bg-muted/40 border border-dashed border-border rounded-lg flex items-center justify-center"
        style={{ borderRadius: `${borderRadius}px`, maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth }}
      >
        <span className="text-xs text-muted-foreground">Image Placeholder</span>
      </div>
    );
  }
  return (
    <img
      src={resolveFileUrl(src)}
      alt={alt}
      className="w-full h-auto"
      style={{
        objectFit: objectFit as React.CSSProperties['objectFit'],
        maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
        borderRadius: `${borderRadius}px`,
      }}
    />
  );
}

// ── CTA Button ──────────────────────────────────────────
export function BuilderCtaButton({
  label = 'Get Started',
  url = '',
  variant = 'default',
  size = 'md',
}: { label?: string; url?: string; variant?: string; size?: string; [k: string]: unknown }) {
  const h = size === 'sm' ? '36px' : size === 'lg' ? '48px' : '40px';
  return (
    <Button
      variant={variant as 'default' | 'outline' | 'ghost'}
      className="text-sm font-semibold"
      style={{
        height: h,
        borderRadius: 'var(--login-radius-button, 8px)',
        ...(variant === 'default' ? { backgroundColor: 'var(--login-primary, hsl(var(--primary)))' } : {}),
      }}
      onClick={(e) => e.preventDefault()}
    >
      {label || 'Get Started'}
    </Button>
  );
}

// ── Divider ─────────────────────────────────────────────
export function BuilderDivider({
  style = 'line',
  color = 'inherit',
}: { style?: string; color?: string; [k: string]: unknown }) {
  const borderColor = color === 'inherit' ? 'var(--login-border, hsl(var(--border)))' : color;
  if (style === 'space') return <div className="w-full h-8" />;
  if (style === 'dots') {
    return (
      <div className="w-full flex items-center justify-center gap-1 py-2">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: borderColor }} />
        ))}
      </div>
    );
  }
  return <div className="w-full border-t" style={{ borderColor }} />;
}

// ── Footer ──────────────────────────────────────────────
export function BuilderFooter({
  links = [],
}: { links?: Array<{ label: string; url: string }>; [k: string]: unknown }) {
  const displayLinks = (Array.isArray(links) && links.length > 0) ? links : [
    { label: 'Privacy', url: '#' },
    { label: 'Terms', url: '#' },
    { label: 'Support', url: '#' },
  ];

  return (
    <div className="w-full flex items-center justify-center gap-4">
      {displayLinks.map((link, i) => (
        <span
          key={i}
          className="text-xs text-[var(--login-text-muted,hsl(var(--muted-foreground)))] hover:text-[var(--login-primary,hsl(var(--primary)))] cursor-pointer transition-colors"
        >
          {link.label}
        </span>
      ))}
    </div>
  );
}

// ── Copyright ───────────────────────────────────────────
export function BuilderCopyright({
  text = '',
  year = 'auto',
  poweredBy = false,
}: { text?: string; year?: string; poweredBy?: boolean; [k: string]: unknown }) {
  const displayYear = year === 'auto' ? new Date().getFullYear() : year;
  return (
    <div className="w-full text-center">
      <p className="text-[11px] text-[var(--login-text-muted,hsl(var(--muted-foreground))/50)]">
        {text || `© ${displayYear} Company Name`}
      </p>
      {poweredBy && (
        <p className="text-[9px] text-[var(--login-text-muted,hsl(var(--muted-foreground))/30)] mt-1">
          Powered by NEXORA
        </p>
      )}
    </div>
  );
}

// ── Custom HTML (sanitized) ─────────────────────────────
const CUSTOM_HTML_RESET = `
.nexora-custom-html h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; }
.nexora-custom-html h2 { font-size: 1.5em; font-weight: bold; margin: 0.83em 0; }
.nexora-custom-html h3 { font-size: 1.17em; font-weight: bold; margin: 1em 0; }
.nexora-custom-html h4 { font-size: 1em; font-weight: bold; margin: 1.33em 0; }
.nexora-custom-html h5 { font-size: 0.83em; font-weight: bold; margin: 1.67em 0; }
.nexora-custom-html h6 { font-size: 0.67em; font-weight: bold; margin: 2.33em 0; }
.nexora-custom-html p { margin: 1em 0; }
.nexora-custom-html ul { list-style: disc; padding-left: 2em; margin: 1em 0; }
.nexora-custom-html ol { list-style: decimal; padding-left: 2em; margin: 1em 0; }
.nexora-custom-html li { display: list-item; }
.nexora-custom-html a { color: #3b82f6; text-decoration: underline; }
.nexora-custom-html a:hover { color: #2563eb; }
.nexora-custom-html strong, .nexora-custom-html b { font-weight: bold; }
.nexora-custom-html em, .nexora-custom-html i { font-style: italic; }
.nexora-custom-html blockquote { border-left: 4px solid #d1d5db; padding-left: 1em; margin: 1em 0; color: #6b7280; }
.nexora-custom-html pre { background: #1e1e1e; color: #d4d4d4; padding: 1em; border-radius: 0.5em; overflow-x: auto; font-family: monospace; }
.nexora-custom-html code { background: rgba(0,0,0,0.1); padding: 0.2em 0.4em; border-radius: 0.25em; font-family: monospace; font-size: 0.9em; }
.nexora-custom-html img { max-width: 100%; height: auto; border-radius: 0.25em; }
.nexora-custom-html table { border-collapse: collapse; width: 100%; }
.nexora-custom-html th, .nexora-custom-html td { border: 1px solid #d1d5db; padding: 0.5em 0.75em; text-align: left; }
.nexora-custom-html th { background: rgba(0,0,0,0.05); font-weight: bold; }
.nexora-custom-html hr { border: none; border-top: 1px solid #d1d5db; margin: 1.5em 0; }
`;

export function BuilderCustomHtml({ content = '', css = '' }: { content?: string; css?: string; [k: string]: unknown }) {
  if (!content && !css) {
    return (
      <div className="w-full p-4 border border-dashed border-amber-500/30 rounded-lg bg-amber-500/5">
        <p className="text-xs text-amber-600">Custom HTML Block</p>
        <p className="text-[10px] text-muted-foreground mt-1">Edit HTML &amp; CSS in the properties panel using the code editor.</p>
      </div>
    );
  }
  // NOTE: In production, sanitize via DOMPurify
  return (
    <div className="nexora-custom-html w-full">
      <style dangerouslySetInnerHTML={{ __html: CUSTOM_HTML_RESET + (css || '') }} />
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}

// ── Video Background ────────────────────────────────────
export function BuilderVideoBg({
  src = '',
  poster = '',
  autoplay = true,
  muted = true,
}: { src?: string; poster?: string; autoplay?: boolean; muted?: boolean; [k: string]: unknown }) {
  if (!src) {
    return (
      <div className="w-full h-full min-h-[200px] bg-gradient-to-br from-violet-500/10 to-blue-500/10 rounded-lg flex items-center justify-center border border-dashed border-violet-500/30">
        <p className="text-xs text-violet-500">Video Background — Set a URL to preview</p>
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
      className="w-full h-full object-cover rounded-lg"
    />
  );
}

// ── Forgot Password Form ────────────────────────────────
export function BuilderForgotForm({
  showBackToLogin = true,
}: { showBackToLogin?: boolean; [k: string]: unknown }) {
  return (
    <div className="w-full" style={{ maxWidth: 'var(--login-form-width, 380px)' }}>
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col" style={{ gap: 'var(--login-element-gap, 16px)' }}>
        <div className="text-center mb-2">
          <h3 className="text-lg font-semibold text-[var(--login-text,hsl(var(--foreground)))]">Forgot Password</h3>
          <p className="text-sm text-[var(--login-text-muted,hsl(var(--muted-foreground)))] mt-1">
            Enter your email to receive a reset link
          </p>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[var(--login-text,hsl(var(--foreground)))]">Email Address</Label>
          <Input
            type="email"
            placeholder="you@example.com"
            className="h-10 ps-3 text-sm"
            style={{
              borderRadius: 'var(--login-field-radius, 6px)',
              background: 'var(--login-input-bg, hsl(var(--background)))',
              borderColor: 'var(--login-input-border, hsl(var(--border)))',
              color: 'var(--login-text, hsl(var(--foreground)))',
            }}
          />
        </div>
        <Button
          type="submit"
          className="w-full h-10 font-medium"
          style={{
            borderRadius: 'var(--login-button-radius, var(--login-field-radius, 6px))',
            background: 'var(--login-button-bg, hsl(var(--primary)))',
            color: 'var(--login-button-text, hsl(var(--primary-foreground)))',
          }}
        >
          Send Reset Link
        </Button>
        {showBackToLogin && (
          <p className="text-center text-sm text-[var(--login-link,hsl(var(--primary)))]">
            ← Back to Login
          </p>
        )}
      </form>
    </div>
  );
}

// ── Reset Password Form ─────────────────────────────────
export function BuilderResetForm({
  showPasswordStrength = true,
}: { showPasswordStrength?: boolean; [k: string]: unknown }) {
  return (
    <div className="w-full" style={{ maxWidth: 'var(--login-form-width, 380px)' }}>
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col" style={{ gap: 'var(--login-element-gap, 16px)' }}>
        <div className="text-center mb-2">
          <h3 className="text-lg font-semibold text-[var(--login-text,hsl(var(--foreground)))]">Reset Password</h3>
          <p className="text-sm text-[var(--login-text-muted,hsl(var(--muted-foreground)))] mt-1">
            Create a new secure password
          </p>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[var(--login-text,hsl(var(--foreground)))]">New Password</Label>
          <Input
            type="password"
            placeholder="••••••••"
            className="h-10 ps-3 text-sm"
            style={{
              borderRadius: 'var(--login-field-radius, 6px)',
              background: 'var(--login-input-bg, hsl(var(--background)))',
              borderColor: 'var(--login-input-border, hsl(var(--border)))',
              color: 'var(--login-text, hsl(var(--foreground)))',
            }}
          />
        </div>
        {showPasswordStrength && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-1 flex-1 rounded-full bg-muted" />
              ))}
            </div>
            <p className="text-[10px] text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">Password strength indicator</p>
          </div>
        )}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[var(--login-text,hsl(var(--foreground)))]">Confirm Password</Label>
          <Input
            type="password"
            placeholder="••••••••"
            className="h-10 ps-3 text-sm"
            style={{
              borderRadius: 'var(--login-field-radius, 6px)',
              background: 'var(--login-input-bg, hsl(var(--background)))',
              borderColor: 'var(--login-input-border, hsl(var(--border)))',
              color: 'var(--login-text, hsl(var(--foreground)))',
            }}
          />
        </div>
        <Button
          type="submit"
          className="w-full h-10 font-medium"
          style={{
            borderRadius: 'var(--login-button-radius, var(--login-field-radius, 6px))',
            background: 'var(--login-button-bg, hsl(var(--primary)))',
            color: 'var(--login-button-text, hsl(var(--primary-foreground)))',
          }}
        >
          Reset Password
        </Button>
      </form>
    </div>
  );
}
