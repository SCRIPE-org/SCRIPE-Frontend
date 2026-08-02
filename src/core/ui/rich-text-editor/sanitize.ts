"use client";

// ─── Sanitization utilities ─────────────────────────────────
// Allowlist-based HTML sanitizer carried over from the legacy execCommand
// editor. The TipTap editor constrains content through its schema, but HTML
// that bypasses the schema (stored values, source-mode input) can be cleaned
// with these helpers before rendering outside the editor.

// Enhanced HTML Sanitization utility that preserves formatting
export const sanitizeHTML = (html: string): string => {
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  // Remove dangerous elements
  const dangerousElements = tempDiv.querySelectorAll(
    "script, iframe, object, embed, form, input, button"
  );
  dangerousElements.forEach((element) => element.remove());

  // Define allowed tags and attributes for rich text formatting
  const allowedTags = [
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
    "hr", // Add horizontal rule
  ];

  const allowedAttributes: Record<string, string[]> = {
    a: ["href", "title", "target"],
    img: ["src", "alt", "title", "width", "height"],
    table: ["border", "cellpadding", "cellspacing"],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan"],
    "*": ["style", "class", "id"], // Allow styling attributes
  };

  // Process all elements
  const allElements = tempDiv.querySelectorAll("*");
  allElements.forEach((element) => {
    const tagName = element.tagName.toLowerCase();

    // Remove disallowed tags
    if (!allowedTags.includes(tagName)) {
      element.outerHTML = element.innerHTML;
      return;
    }

    // Remove dangerous event handlers
    const eventHandlers = [
      "onclick",
      "onload",
      "onerror",
      "onmouseover",
      "onmouseout",
      "onfocus",
      "onblur",
      "onchange",
      "onsubmit",
    ];
    eventHandlers.forEach((handler) => {
      element.removeAttribute(handler);
    });

    // Clean attributes based on tag
    const allowedAttrs = allowedAttributes[tagName] || allowedAttributes["*"] || [];
    const attributesToRemove: string[] = [];

    Array.from(element.attributes).forEach((attr) => {
      if (!allowedAttrs.includes(attr.name)) {
        attributesToRemove.push(attr.name);
      }
    });

    attributesToRemove.forEach((attrName) => {
      element.removeAttribute(attrName);
    });

    // Special handling for links and images
    if (tagName === "a") {
      const href = element.getAttribute("href");
      if (
        href &&
        (href.toLowerCase().startsWith("javascript:") || href.toLowerCase().startsWith("data:"))
      ) {
        element.removeAttribute("href");
      }
    }

    if (tagName === "img") {
      const src = element.getAttribute("src");
      if (
        src &&
        (src.toLowerCase().startsWith("javascript:") || src.toLowerCase().startsWith("data:"))
      ) {
        element.removeAttribute("src");
      }
    }

    // Clean style attributes to remove dangerous CSS
    if (element.hasAttribute("style")) {
      const style = element.getAttribute("style");
      if (style) {
        // Remove dangerous CSS properties
        const dangerousStyles = ["expression", "javascript:", "vbscript:", "onload", "onerror"];
        let cleanStyle = style;

        dangerousStyles.forEach((dangerous) => {
          cleanStyle = cleanStyle.replace(new RegExp(dangerous, "gi"), "");
        });

        element.setAttribute("style", cleanStyle);
      }
    }
  });

  return tempDiv.innerHTML;
};

// URL validation utility
export const isValidURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
};
