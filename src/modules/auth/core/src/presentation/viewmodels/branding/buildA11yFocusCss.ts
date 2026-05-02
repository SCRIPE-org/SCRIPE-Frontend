/**
 * buildA11yFocusCss — Focus, skip-link, cursor, and target-size generators.
 * Extracted from buildA11yCss (#1, #2, #10, #17, #23).
 */
export function buildA11yFocusCss(
  tokens: Record<string, string | undefined>,
  focusColor: string,
  focusWidth: string,
  focusStyle: string
): string[] {
  const css: string[] = [];

  // 1. Focus Ring
  if (tokens["a11y.focusRing.enabled"] !== "false") {
    css.push(`/* ═══ Accessibility: Focus Ring ═══ */
.login-page :focus-visible {
  outline: ${focusWidth} ${focusStyle} ${focusColor} !important;
  outline-offset: 2px !important;
  box-shadow: 0 0 0 1px rgba(255,255,255,0.4) !important;
}
.login-page input:focus-visible,
.login-page button:focus-visible,
.login-page a:focus-visible,
.login-page select:focus-visible,
.login-page [tabindex]:focus-visible {
  outline: ${focusWidth} ${focusStyle} ${focusColor} !important;
  outline-offset: 2px !important;
}`);
  } else {
    css.push(`.login-page :focus-visible { outline: none !important; }`);
  }

  // 2. Skip Link
  if (tokens["a11y.skipLink.enabled"] !== "false") {
    css.push(`/* ═══ Accessibility: Skip Link ═══ */
.login-skip-link {
  position: absolute; top: -100px; left: 16px; z-index: 9999;
  padding: 12px 24px; background: ${focusColor}; color: #fff;
  font-size: 14px; font-weight: 600; border-radius: 0 0 8px 8px;
  text-decoration: none; transition: top 0.15s ease-in-out;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.login-skip-link:focus { top: 0 !important; outline: 2px solid #fff; outline-offset: 2px; }
[dir="rtl"] .login-skip-link { left: auto; right: 16px; }`);
  }

  // 10. Highlight Focus/Hover
  if (tokens["a11y.highlightFocus"] === "true") {
    css.push(`/* ═══ Accessibility: Highlight Focus/Hover ═══ */
.login-page *:hover { outline: 2px dashed ${focusColor} !important; outline-offset: 2px !important; }
.login-page *:focus-within { background-color: color-mix(in srgb, ${focusColor} 8%, transparent) !important; }`);
  }

  // 17. Big Cursor
  const cursorSize = tokens["a11y.cursorSize"] || "default";
  if (cursorSize !== "default") {
    const cursorScale = cursorSize === "xlarge" ? 3 : 2;
    css.push(`/* ═══ Accessibility: Big Cursor (${cursorSize}) ═══ */
.login-page { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${cursorScale * 16}' height='${cursorScale * 16}' viewBox='0 0 32 32'%3E%3Cpath d='M4 4l20 8-8 4-4 8z' fill='%23000' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E") 0 0, auto !important; }
.login-page a, .login-page button, .login-page [role="button"], .login-page input[type="submit"] { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${cursorScale * 16}' height='${cursorScale * 16}' viewBox='0 0 32 32'%3E%3Cpath d='M10 2v20l5-5h10z' fill='%23000' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E") ${cursorScale * 5} 0, pointer !important; }`);
  }

  // 23. Large Click Targets
  if (tokens["a11y.largeTargets"] === "true") {
    css.push(`.login-page input, .login-page button, .login-page select, .login-page a, .login-page [role="button"] { min-height: 44px !important; min-width: 44px !important; padding-top: 8px !important; padding-bottom: 8px !important; }`);
  }

  return css;
}
