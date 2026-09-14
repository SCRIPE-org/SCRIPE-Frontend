/**
 * @file templatePreviewHelpers.ts
 * @description Device presets, canvas skin themes, DOM sanitization options,
 * and HTML document rendering helpers for the email template live preview component.
 */

import DOMPurify from "dompurify";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import type { DesignVariables } from "./DesignVariablesPanel";

/**
 * Responsive viewport device preset options for previewing email rendering.
 */
export const PREVIEW_DEVICES = [
  { id: "desktop" as const, icon: Monitor, width: "100%", labelKey: "messaging.email.desktop" },
  { id: "tablet" as const, icon: Tablet, width: "768px", labelKey: "messaging.email.tablet" },
  { id: "mobile" as const, icon: Smartphone, width: "375px", labelKey: "messaging.email.mobile" },
] as const;

/**
 * Supported preview device identifiers.
 */
export type PreviewDeviceId = (typeof PREVIEW_DEVICES)[number]["id"];

/**
 * Email canvas theme color tokens matching backend mail theme definitions.
 */
export const EMAIL_CANVAS_SKIN = {
  dark: { surface: "#0D0D0E", text: "#F7F8F5", link: "#C6FF00" },
  light: { surface: "#F7F8F5", text: "#0D0D0E", link: "#4C6200" },
} as const;

/**
 * Canvas background theme options.
 */
export type CanvasTheme = keyof typeof EMAIL_CANVAS_SKIN;

const RTL_LANGS = new Set(["ar", "he", "fa", "ur"]);
const ARABIC_SCRIPT_RE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

/**
 * Determines language code and text directionality based on explicit configuration
 * or heuristic script pattern matching.
 *
 * @param explicitLanguage Configured BCP-47 language tag if specified.
 * @param text Content text analyzed for script orientation.
 * @returns An object specifying resolved language and direction ('rtl' or 'ltr').
 */
export function resolvePreviewLangDir(
  explicitLanguage: string | undefined,
  text: string
): { lang: string; dir: "rtl" | "ltr" } {
  if (explicitLanguage) {
    return { lang: explicitLanguage, dir: RTL_LANGS.has(explicitLanguage) ? "rtl" : "ltr" };
  }
  const dir = ARABIC_SCRIPT_RE.test(text) ? "rtl" : "ltr";
  return { lang: dir === "rtl" ? "ar" : "en", dir };
}

/**
 * HTML sanitization rules enforced via DOMPurify to prevent XSS in iframe previews.
 */
export const SANITIZE_OPTIONS = {
  ALLOWED_TAGS: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "br",
    "hr",
    "span",
    "div",
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
    "tr",
    "th",
    "td",
    "a",
    "img",
    "blockquote",
    "pre",
    "code",
  ],
  ALLOWED_ATTR: ["href", "src", "alt", "class", "style", "target", "rel", "width", "height"],
  ALLOW_DATA_ATTR: false,
};

/**
 * Parameters supplied to compose the sandboxed HTML document string.
 */
export interface ComposePreviewDocumentParams {
  /** Raw or debounced template body HTML. */
  debouncedBody: string;
  /** Text directionality attribute value. */
  previewDir: "rtl" | "ltr";
  /** Language identifier tag. */
  previewLang: string;
  /** Current canvas skin selection. */
  skin: (typeof EMAIL_CANVAS_SKIN)[CanvasTheme];
  /** Optional custom design variable overrides. */
  designVariables?: DesignVariables;
}

/**
 * Assembles a complete, sanitized, self-contained HTML document for the preview iframe.
 *
 * @param params Composition options including body content, layout direction, and styles.
 * @returns Fully formatted HTML document string with inline scoped styling.
 */
export function composePreviewDocument({
  debouncedBody,
  previewDir,
  previewLang,
  skin,
  designVariables,
}: ComposePreviewDocumentParams): string {
  const sanitized = DOMPurify.sanitize(debouncedBody, SANITIZE_OPTIONS);

  const bodyBackground = designVariables?.backgroundColor || skin.surface;
  const bodyColor = designVariables?.textColor || skin.text;
  const bodyFontFamily =
    designVariables?.fontFamily ||
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const bodyFontSize = designVariables?.bodyFontSize ? `${designVariables.bodyFontSize}px` : "14px";
  const linkColor = designVariables?.primaryColor || skin.link;

  return `<!DOCTYPE html>
<html dir="${previewDir}" lang="${previewLang}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: ${bodyFontFamily};
    font-size: ${bodyFontSize};
    line-height: 1.6;
    color: ${bodyColor};
    background: ${bodyBackground};
    padding: 16px;
    word-wrap: break-word;
  }
  img { max-width: 100%; height: auto; }
  a { color: ${linkColor}; }
  table { border-collapse: collapse; }
</style>
</head>
<body>${sanitized}</body>
</html>`;
}
