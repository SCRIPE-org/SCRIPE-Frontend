import { ViewBox, clamp, EnrichedCountryData } from "./types";

export function calculateZoomViewBox(
  current: ViewBox,
  rect: DOMRect,
  factor: number,
  clientX?: number,
  clientY?: number
): ViewBox {
  const cx =
    clientX !== undefined ? current.x + ((clientX - rect.left) / rect.width) * current.w : current.x + current.w / 2;
  const cy =
    clientY !== undefined ? current.y + ((clientY - rect.top) / rect.height) * current.h : current.y + current.h / 2;

  const nw = clamp(current.w * factor, 180, 950);
  const nh = nw / (rect.width / rect.height);
  return {
    x: cx - ((cx - current.x) / current.w) * nw,
    y: cy - ((cy - current.y) / current.h) * nh,
    w: nw,
    h: nh,
  };
}

export function calculateCountryViewBox(country: EnrichedCountryData, rect: DOMRect): ViewBox {
  const [bx, by, bw, bh] = country.bbox.split(",").map(Number);
  const pad = 36;
  const ar = rect.width / rect.height;
  let w = Math.max(220, bw + pad * 2);
  let h = Math.max(110, bh + pad * 2);
  if (w / h > ar) {
    h = w / ar;
  } else {
    w = h * ar;
  }
  return {
    x: bx + bw / 2 - w / 2,
    y: by + bh / 2 - h / 2,
    w,
    h,
  };
}

export function safeReleaseCapture(el: SVGSVGElement | null, pointerId: number): void {
  try {
    if (el?.hasPointerCapture(pointerId)) {
      el.releasePointerCapture(pointerId);
    }
  } catch {
    // ignore
  }
}
