/**
 * buildBaseStylesheet — Returns the .login-* CSS class definitions.
 *
 * These classes use CSS vars so custom CSS can override naturally.
 * Pure function — returns CSS string, no DOM side-effects.
 */
export function buildBaseStylesheet(): string {
  return `/* ═══ Login Base Stylesheet ═══ */
.login-page {
  font-family: var(--login-font-body, inherit) !important;
  line-height: var(--login-line-height, 1.5) !important;
  letter-spacing: var(--login-letter-spacing, 0px) !important;
}
[dir="rtl"] .login-page {
  font-family: var(--login-font-body-ar, var(--login-font-body, inherit)) !important;
}
.login-page * {
  line-height: inherit;
  letter-spacing: inherit;
}
.login-form-wrapper {
  max-width: var(--login-form-width, 380px) !important;
  width: 100%;
}
.login-page .login-form {
  display: flex;
  flex-direction: column;
  gap: var(--login-element-gap, 16px) !important;
}
.login-page .login-input {
  height: var(--login-input-height, 44px) !important;
  border-radius: var(--login-radius-button, 8px) !important;
  border-color: var(--login-border, hsl(var(--border)));
}
.login-page .login-button {
  height: var(--login-input-height, 44px) !important;
  background-color: var(--login-primary, hsl(var(--primary)));
  border-radius: var(--login-radius-button, 8px) !important;
  color: white;
  width: 100%;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}
.login-page .login-button:hover {
  opacity: 0.9;
  filter: brightness(1.05);
}
.login-page .login-card {
  border-radius: var(--login-radius-card, 16px) !important;
  padding: var(--login-card-padding, 32px) !important;
  box-shadow: var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25)) !important;
  background-color: var(--login-surface, hsl(var(--background)));
}
.login-page .login-heading {
  font-family: var(--login-font-heading, inherit);
  font-size: var(--login-size-headline, 1.875rem) !important;
  font-weight: var(--login-weight-heading, 600) !important;
  color: var(--login-text, hsl(var(--foreground)));
}
[dir="rtl"] .login-page .login-heading {
  font-family: var(--login-font-body-ar, var(--login-font-heading, inherit)) !important;
}
.login-page .login-subtitle {
  font-size: var(--login-size-subtitle, 0.875rem) !important;
  color: var(--login-text-muted, hsl(var(--muted-foreground)));
}
.login-logo {
  overflow: hidden;
  border-radius: var(--login-radius-card, 0.75rem);
}
.login-footer {
  text-align: center;
  margin-top: 2rem;
  color: var(--login-text-muted, hsl(var(--muted-foreground)));
  font-size: 11px;
  opacity: 0.6;
}
.login-page .login-sso button {
  border-radius: var(--login-radius-button, 8px) !important;
}
.login-overlay {
  position: absolute;
  inset: 0;
  background-color: var(--login-overlay-color, #000000);
  opacity: var(--login-overlay-opacity, 0.5);
  backdrop-filter: blur(var(--login-overlay-blur, 0px));
}
.login-divider { border-color: var(--login-border, hsl(var(--border))); }
.login-label { color: var(--login-text, hsl(var(--foreground))); }`;
}
