/**
 * Rich HTML & Email HTML DOMPurify Sanitizers
 *
 * Fail-closed HTML allowlist sanitization (`sanitizeRichHtml`, `sanitizeEmailHtml`)
 * and inert TipTap HTML block unwrapping (`unwrapSanitizedEmailHtmlBlocks`) with strict
 * URI checks, inline style neutralization, and mandatory `rel="noopener noreferrer"`.
 */

import DOMPurify from "dompurify";
import {
  sanitizeCss,
  sanitizeEmailHref,
  sanitizeHttpUrl,
  stripAsciiControlChars,
} from "./sanitize-css";

const SAFE_RASTER_DATA_IMAGE_RE =
  /^data:image\/(png|jpeg|jpg|webp|gif|avif);base64,[A-Za-z0-9+/=]+$/i;
const SAFE_INLINE_SVG_ICON_RE = /^data:image\/svg\+xml,/i;
const UNSAFE_SVG_TOKEN_RE = /<script|foreignobject|\bon[a-z]+\s*=|javascript:|vbscript:|xlink:href/i;

const RICH_HTML_ALLOWED_TAGS = [
  "a",
  "b",
  "blockquote",
  "br",
  "caption",
  "code",
  "col",
  "colgroup",
  "dd",
  "div",
  "dl",
  "dt",
  "em",
  "figcaption",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "img",
  "li",
  "mark",
  "ol",
  "p",
  "picture",
  "pre",
  "s",
  "small",
  "source",
  "span",
  "strong",
  "sub",
  "sup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
];

const RICH_HTML_ALLOWED_ATTR = [
  "alt",
  "class",
  "colspan",
  "dir",
  "height",
  "href",
  "id",
  "lang",
  "loading",
  "rel",
  "rowspan",
  "sizes",
  "src",
  "srcset",
  "style",
  "target",
  "title",
  "width",
];

const EMAIL_HTML_ALLOWED_TAGS = [
  "div",
  "span",
  "p",
  "br",
  "hr",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "a",
  "img",
  "blockquote",
  "pre",
  "code",
];

const EMAIL_HTML_ALLOWED_ATTR = [
  "align",
  "alt",
  "border",
  "cellpadding",
  "cellspacing",
  "class",
  "colspan",
  "dir",
  "height",
  "href",
  "lang",
  "rel",
  "role",
  "rowspan",
  "src",
  "style",
  "target",
  "title",
  "valign",
  "width",
];

const FORBID_ACTIVE_TAGS = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "base",
  "link",
  "meta",
  "svg",
  "math",
  "template",
];

function sanitizeImageSrc(rawSrc: string, allowInlineIconSvg: boolean): string | null {
  const cleaned = stripAsciiControlChars(rawSrc).trim();
  if (!cleaned) return null;
  if (SAFE_RASTER_DATA_IMAGE_RE.test(cleaned)) return cleaned;

  if (allowInlineIconSvg && SAFE_INLINE_SVG_ICON_RE.test(cleaned)) {
    try {
      const decoded = decodeURIComponent(cleaned.slice("data:image/svg+xml,".length));
      if (!UNSAFE_SVG_TOKEN_RE.test(decoded)) {
        return cleaned;
      }
    } catch {
      return null;
    }
    return null;
  }

  return sanitizeHttpUrl(cleaned, { allowRelative: true });
}

function hardenSanitizedDomTree(root: Element, allowInlineIconSvg: boolean): void {
  root.querySelectorAll("a").forEach((anchor) => {
    const safeHref = sanitizeEmailHref(anchor.getAttribute("href"));
    if (safeHref === null) anchor.removeAttribute("href");
    else anchor.setAttribute("href", safeHref);

    if (anchor.getAttribute("target")?.trim().toLowerCase() === "_blank") {
      anchor.setAttribute("rel", "noopener noreferrer");
    }
  });

  root.querySelectorAll("img, source").forEach((el) => {
    const rawSrc = el.getAttribute("src");
    if (rawSrc !== null) {
      const safeSrc = sanitizeImageSrc(rawSrc, allowInlineIconSvg);
      if (safeSrc === null) el.removeAttribute("src");
      else el.setAttribute("src", safeSrc);
    }

    if (el.hasAttribute("srcset")) {
      const filtered = (el.getAttribute("srcset") || "")
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
          const [urlPart, descriptor] = part.split(/\s+/, 2);
          const safeUrl = sanitizeImageSrc(urlPart || "", false);
          return safeUrl ? (descriptor ? `${safeUrl} ${descriptor}` : safeUrl) : null;
        })
        .filter((entry): entry is string => entry !== null);

      if (filtered.length === 0) el.removeAttribute("srcset");
      else el.setAttribute("srcset", filtered.join(", "));
    }
  });

  root.querySelectorAll("[style]").forEach((el) => {
    const cleanedStyle = sanitizeCss(el.getAttribute("style") || "").trim();
    if (!cleanedStyle) el.removeAttribute("style");
    else el.setAttribute("style", cleanedStyle);
  });
}

function sanitizeDomWithPurify(
  input: string,
  allowedTags: string[],
  allowedAttr: string[],
  allowInlineIconSvg: boolean
): string {
  if (!input || typeof input !== "string") return "";
  if (typeof window === "undefined" || !DOMPurify.isSupported) return "";

  const cleanedBody = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttr,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    FORBID_TAGS: FORBID_ACTIVE_TAGS,
    FORBID_ATTR: ["srcdoc", "formaction", "ping"],
    ADD_ATTR: ["target"],
    SANITIZE_DOM: true,
    SANITIZE_NAMED_PROPS: true,
    RETURN_DOM: true,
  });

  if (cleanedBody.nodeType !== 1) return "";
  hardenSanitizedDomTree(cleanedBody as Element, allowInlineIconSvg);
  return (cleanedBody as Element).innerHTML;
}

/** Sanitize author-supplied HTML blocks for `dangerouslySetInnerHTML`. */
export function sanitizeRichHtml(input: string): string {
  return sanitizeDomWithPurify(input, RICH_HTML_ALLOWED_TAGS, RICH_HTML_ALLOWED_ATTR, false);
}

/** Sanitize email template/composer HTML for preview iframes and stored markup. */
export function sanitizeEmailHtml(input: string): string {
  return sanitizeDomWithPurify(input, EMAIL_HTML_ALLOWED_TAGS, EMAIL_HTML_ALLOWED_ATTR, true);
}

/** Replace TipTap `div[data-email-html-block="true"]` nodes via isolated inert DOMParser. */
export function unwrapSanitizedEmailHtmlBlocks(editorHtml: string): string {
  if (!editorHtml || typeof editorHtml !== "string") return "";
  if (typeof window === "undefined" || typeof DOMParser === "undefined") return "";
  const doc = new DOMParser().parseFromString(editorHtml, "text/html");
  doc.body.querySelectorAll('div[data-email-html-block="true"]').forEach((block) => {
    const safeHtml = sanitizeEmailHtml(block.getAttribute("data-email-html") || "");
    if (!safeHtml) {
      block.remove();
      return;
    }
    const fragmentDoc = new DOMParser().parseFromString(safeHtml, "text/html");
    const fragment = doc.createDocumentFragment();
    Array.from(fragmentDoc.body.childNodes).forEach((child) => {
      fragment.appendChild(doc.importNode(child, true));
    });
    block.replaceWith(fragment);
  });
  return doc.body.innerHTML;
}
