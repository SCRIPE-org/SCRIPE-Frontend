/**
 * buildA11yCss — Orchestrator for all 23 accessibility CSS generators.
 *
 * Pure function — returns CSS string, no DOM side-effects.
 *
 * Delegates to focused sub-modules:
 *  - buildA11yFocusCss     → focus ring, skip link, cursor, large targets
 *  - buildA11yTypographyCss → contrast, typography, reading aids, media
 *  - Inline (#5 Motion, #20 Pause) — small enough to remain here
 */
import { buildA11yFocusCss } from "./buildA11yFocusCss";
import { buildA11yTypographyCss } from "./buildA11yTypographyCss";

export function buildA11yCss(tokens: Record<string, string | undefined>): string {
  const focusColor = tokens["a11y.focusRing.color"] || tokens["color.primary"] || "hsl(var(--primary))";
  const focusWidth = tokens["a11y.focusRing.width"] || "3px";
  const focusStyle = tokens["a11y.focusRing.style"] || "solid";
  const animDuration = tokens["a11y.animationDuration"] || "200";
  const reducedMotion = tokens["a11y.reducedMotion"] || "system";

  const css: string[] = [
    ...buildA11yFocusCss(tokens, focusColor, focusWidth, focusStyle),
    ...buildA11yTypographyCss(tokens, focusColor),
  ];

  // 5. Reduced Motion
  if (reducedMotion === "always") {
    css.push(`/* ═══ Accessibility: Reduced Motion (forced) ═══ */
.login-page, .login-page * { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; scroll-behavior: auto !important; }`);
  } else if (reducedMotion === "system") {
    css.push(`/* ═══ Accessibility: Reduced Motion (system preference) ═══ */
@media (prefers-reduced-motion: reduce) {
  .login-page, .login-page * { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; scroll-behavior: auto !important; }
}`);
  } else if (reducedMotion === "never") {
    css.push(`/* ═══ Accessibility: Custom Animation Duration ═══ */
.login-page .login-button, .login-page a, .login-page input { transition-duration: ${animDuration}ms !important; }`);
  }

  // 20. Pause Animations
  if (tokens["a11y.pauseAnimations"] === "true") {
    css.push(`.login-page, .login-page * { animation-play-state: paused !important; animation-duration: 0s !important; transition-duration: 0s !important; transition-delay: 0s !important; }`);
  }

  return css.filter(Boolean).join("\n\n");
}
