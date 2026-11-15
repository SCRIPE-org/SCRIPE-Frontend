"use client";

import DOMPurify from "dompurify";

// ─── Sanitization utilities ─────────────────────────────────
// Allowlist-based HTML sanitizer carried over from the legacy execCommand
// editor. The TipTap editor constrains content through its schema, but HTML
// that bypasses the schema (stored values, source-mode input) can be cleaned
// with these helpers before rendering outside the editor.

// Allowed URL schemes for rich text links and embedded media
const SAFE_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

/**
 * Strips ASCII control characters (`\u0000-\u001F` and `\u007F`) so obfuscated
 * schemes like `java\tscript:` cannot bypass protocol checks.
 */
function stripAsciiControlChars(value: string): string {
  let cleaned = "";
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code > 31 && code !== 127) {
      cleaned += value[i];
    }
  }
  return cleaned;
}

/**
 * Normalizes and validates a URI against the safe allowlist (`http:`, `https:`,
 * `mailto:`, `tel:`, root-relative `/`, or same-page `#`).
 */
function sanitizeUri(rawUri: string): string | null {
  const cleaned = stripAsciiControlChars(rawUri).trim();
  if (!cleaned) return null;

  if (cleaned.startsWith("#")) {
    return cleaned;
  }

  // Allow root-relative paths (`/path`) while blocking protocol-relative (`//`) or backslash (`/\`) URLs.
  if (cleaned.startsWith("/")) {
    if (cleaned.startsWith("//") || cleaned.startsWith("/\\")) {
      return null;
    }
    return cleaned;
  }

  try {
    const parsed = new URL(cleaned);
    return SAFE_URL_PROTOCOLS.has(parsed.protocol) ? cleaned : null;
  } catch {
    return null;
  }
}

const RICH_EDITOR_ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "del",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "a",
  "img",
  "div",
  "span",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "hr",
];

const RICH_EDITOR_ALLOWED_ATTR = [
  "href",
  "title",
  "target",
  "rel",
  "src",
  "alt",
  "width",
  "height",
  "border",
  "cellpadding",
  "cellspacing",
  "colspan",
  "rowspan",
  "class",
  "dir",
  "lang",
];

const RICH_EDITOR_FORBID_TAGS = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "button",
  "template",
  "base",
  "link",
  "meta",
  "svg",
  "math",
];

const RICH_EDITOR_FORBID_ATTR = ["style", "srcdoc", "formaction", "ping"];

function enforceSafeUriAttribute(element: Element, attr: "href" | "src"): void {
  const raw = element.getAttribute(attr);
  if (raw === null) return;
  const safe = sanitizeUri(raw);
  if (safe === null) {
    element.removeAttribute(attr);
  } else if (safe !== raw) {
    element.setAttribute(attr, safe);
  }
}

function enforceBlankLinkRel(anchor: Element): void {
  const target = anchor.getAttribute("target");
  if (!target || target.trim().toLowerCase() !== "_blank") return;
  const existingTokens = (anchor.getAttribute("rel") || "")
    .split(/\s+/)
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  const merged = new Set([...existingTokens, "noopener", "noreferrer"]);
  anchor.setAttribute("rel", Array.from(merged).join(" "));
}

function isDomElement(node: Node): node is Element {
  return node.nodeType === 1;
}

/**
 * Sanitizes rich-text HTML using DOMPurify (blocking scripts, styles, templates,
 * inline style attributes, and event handlers), then validates link/image URIs
 * against the strict scheme allowlist and enforces `rel="noopener noreferrer"` on
 * `target="_blank"` anchors. Fails closed when DOMPurify has no DOM support.
 */
export const sanitizeHTML = (html: string): string => {
  if (!html || typeof html !== "string") return "";
  if (typeof window === "undefined" || !DOMPurify.isSupported) return "";

  const cleanedBody = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: RICH_EDITOR_ALLOWED_TAGS,
    ALLOWED_ATTR: RICH_EDITOR_ALLOWED_ATTR,
    FORBID_TAGS: RICH_EDITOR_FORBID_TAGS,
    FORBID_ATTR: RICH_EDITOR_FORBID_ATTR,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
    SANITIZE_NAMED_PROPS: true,
    RETURN_DOM: true,
  });

  if (!isDomElement(cleanedBody)) return "";

  cleanedBody.querySelectorAll("a").forEach((anchor) => {
    enforceSafeUriAttribute(anchor, "href");
    enforceBlankLinkRel(anchor);
  });
  cleanedBody.querySelectorAll("img").forEach((image) => {
    enforceSafeUriAttribute(image, "src");
  });

  return cleanedBody.innerHTML;
};

// URL validation utility
export const isValidURL = (url: string): boolean => {
  const trimmed = url.trim();
  if (!trimmed || stripAsciiControlChars(trimmed) !== trimmed) {
    return false;
  }
  try {
    const urlObj = new URL(trimmed);
    // Only allow http and https protocols
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
};
