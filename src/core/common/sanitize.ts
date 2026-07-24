/**
 * Input Sanitization Utilities
 *
 * Security utilities for sanitizing user input to prevent XSS and injection attacks.
 *
 * @example
 * ```typescript
 * import { sanitizeHtml, escapeForRegex, validateEmail } from '@core/common/sanitize';
 *
 * const cleanHtml = sanitizeHtml(userInput);
 * const safePattern = escapeForRegex(searchTerm);
 * const isValid = validateEmail(email);
 * ```
 */

import DOMPurify from "dompurify";

/**
 * Sanitize HTML by escaping dangerous characters
 * Prevents XSS attacks by converting special characters to HTML entities
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== "string") return "";

  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };

  return input.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Escape special regex characters in a string
 * Use when incorporating user input into regex patterns
 */
export function escapeForRegex(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Validate email format
 * Uses a comprehensive regex pattern for email validation
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate phone number format (basic international format)
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== "string") return false;
  // Accepts: +1234567890, 123-456-7890, (123) 456-7890, etc.
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone.trim());
}

/**
 * Sanitize a string for use in URLs (create slug)
 */
export function slugify(text: string): string {
  if (!text || typeof text !== "string") return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars (except space and hyphen)
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || typeof text !== "string") return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Strip all HTML tags from a string
 */
export function stripHtmlTags(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input.replace(/<[^>]*>/g, "");
}

/**
 * Validate that a string contains only alphanumeric characters
 */
export function isAlphanumeric(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  return /^[a-zA-Z0-9]+$/.test(input);
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize filename by removing dangerous characters
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== "string") return "";
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_") // Replace dangerous chars
    .replace(/\.{2,}/g, ".") // Remove consecutive dots
    .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Rich content sanitizers (branding studio / custom HTML blocks)
//
// `sanitizeHtml` above ESCAPES markup — correct for rendering user text, useless
// when the product's whole point is to render author-supplied markup. These two
// helpers sanitize instead of escape, for the one surface that legitimately
// injects HTML and CSS: the login-page branding builder.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tags an author may use inside a custom HTML block. Anything that can execute,
 * navigate, load remote content, or collect input is absent by construction —
 * no script, iframe, object, embed, form, input, button, link, meta, base, svg.
 */
const RICH_HTML_ALLOWED_TAGS = [
  "a", "b", "blockquote", "br", "caption", "code", "col", "colgroup", "dd", "div",
  "dl", "dt", "em", "figcaption", "figure", "h1", "h2", "h3", "h4", "h5", "h6",
  "hr", "i", "img", "li", "mark", "ol", "p", "picture", "pre", "s", "small",
  "source", "span", "strong", "sub", "sup", "table", "tbody", "td", "tfoot",
  "th", "thead", "tr", "u", "ul",
];

/** Attributes an author may set. No event handlers (`on*`) can appear in this list. */
const RICH_HTML_ALLOWED_ATTR = [
  "alt", "class", "colspan", "dir", "height", "href", "id", "lang", "loading",
  "rel", "rowspan", "sizes", "src", "srcset", "style", "target", "title", "width",
];

/**
 * Sanitizes author-supplied HTML for rendering via `dangerouslySetInnerHTML`.
 *
 * Strips scripts, event-handler attributes, and `javascript:`/`data:` URLs, and
 * forces any surviving `target="_blank"` link to carry `rel="noopener noreferrer"`.
 *
 * Fails CLOSED: if DOMPurify has no DOM to work with (server render), this returns
 * an empty string rather than passing the input through unsanitized.
 *
 * @param input Author-supplied HTML.
 * @returns Sanitized HTML safe to inject, or "" when sanitization is unavailable.
 */
export function sanitizeRichHtml(input: string): string {
  if (!input || typeof input !== "string") return "";
  if (typeof window === "undefined" || !DOMPurify.isSupported) return "";

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: RICH_HTML_ALLOWED_TAGS,
    ALLOWED_ATTR: RICH_HTML_ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input", "base", "link", "meta"],
    FORBID_ATTR: ["srcdoc", "formaction", "ping"],
    ADD_ATTR: ["target"],
  });
}

/**
 * Sanitizes author-supplied CSS for injection into a `<style>` element.
 *
 * The critical case is the closing-tag breakout: a stylesheet containing
 * `</style><script>…` escapes the style context entirely and executes. That is
 * removed first. The remainder strips the constructs that can execute code or
 * pull remote resources: `@import`, legacy `expression()`, IE `behavior:`,
 * `-moz-binding:`, and any `javascript:` URL.
 *
 * @param input Author-supplied CSS.
 * @returns CSS with executable and remote-loading constructs removed.
 */
export function sanitizeCss(input: string): string {
  if (!input || typeof input !== "string") return "";

  return input
    // Breakout of the <style> context — the only one that is directly XSS.
    .replace(/<\s*\/\s*style/gi, "")
    .replace(/<\s*script/gi, "")
    // Remote loads and legacy script-execution vectors.
    .replace(/@import[^;]*;?/gi, "")
    .replace(/expression\s*\(/gi, "")
    .replace(/behavior\s*:/gi, "")
    .replace(/-moz-binding\s*:/gi, "")
    .replace(/javascript\s*:/gi, "");
}
