/**
 * Strict Structural Inline SVG Icon Validator
 *
 * Allows only static, entity-free geometric icon SVGs (`<svg>`, `<g>`, `<path>`,
 * `<circle>`, `<rect>`, `<polygon>`, `<line>`, `<polyline>`) for transactional
 * email glyph embeds, rejecting `<script>`, `<use>`, `<a>`, `<image>`, `<animate>`,
 * `<set>`, `<style>`, `<foreignObject>`, `href`/`xlink:href`, XML entities, and `on*`.
 */

const XML_ENTITY_RE = /&(?:#\d+|#x[0-9a-fA-F]+|[A-Za-z]+);/;
const ALLOWED_SVG_ICON_TAGS = new Set([
  "svg",
  "g",
  "path",
  "circle",
  "rect",
  "polygon",
  "line",
  "polyline",
]);
const ALLOWED_SVG_ICON_ATTRS = new Set([
  "xmlns",
  "viewbox",
  "fill",
  "stroke",
  "stroke-width",
  "width",
  "height",
  "d",
  "cx",
  "cy",
  "r",
  "x",
  "y",
  "rx",
  "ry",
  "points",
  "x1",
  "y1",
  "x2",
  "y2",
]);

/**
 * Validate a `data:image/svg+xml,...` URI using strict DOM parsing and structural allowlisting.
 */
export function isSafeInlineIconSvg(dataUri: string): boolean {
  if (typeof DOMParser === "undefined") return false;
  try {
    const decoded = decodeURIComponent(dataUri.slice("data:image/svg+xml,".length));
    if (!decoded || XML_ENTITY_RE.test(decoded)) return false;

    const svgDoc = new DOMParser().parseFromString(decoded, "image/svg+xml");
    if (svgDoc.querySelector("parsererror") || !svgDoc.documentElement) return false;
    if (svgDoc.documentElement.tagName.toLowerCase() !== "svg") return false;

    const elements = [
      svgDoc.documentElement,
      ...Array.from(svgDoc.documentElement.querySelectorAll("*")),
    ];
    for (const el of elements) {
      if (!ALLOWED_SVG_ICON_TAGS.has(el.tagName.toLowerCase())) return false;
      for (const attr of Array.from(el.attributes)) {
        const attrName = attr.name.toLowerCase();
        if (!ALLOWED_SVG_ICON_ATTRS.has(attrName)) return false;
        if (/javascript:|vbscript:|data\s*:\s*text\/html|expression\s*\(|url\s*\(/i.test(attr.value)) {
          return false;
        }
      }
    }
    return true;
  } catch {
    return false;
  }
}
