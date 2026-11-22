# SCRIPE Academy — Reusable Background & Photo Assets

These assets are prepared from the owner's seven annotated UI reference images, newly generated lime-wave illustrations, and the supplied official SCRIPE logo reference. They are ready to copy under `SCRIPE-Frontend/public/images/academy/backgrounds/` (preserve folders or adapt paths).

## 1. Where to use the files

| UI area / marked example | Recommended asset | Fit / behavior |
| --- | --- | --- |
| Athlete Directory top-right / Groups header | `brand-decor/header-wave-right-transparent.webp` | Background image `contain`, anchored to `right center`, behind text; decorative only |
| Athlete Directory sidebar bottom-left | `brand-decor/sidebar-wave-vertical-transparent.png` | `contain`, `bottom left`, `pointer-events:none` |
| Trials KPI accent / small header accents | `brand-decor/kpi-corner-wave-transparent.webp` | `contain`, subtle opacity |
| Enrollments / Fees logo watermark | `brand-decor/scripe-lime-mark-watermark.png` | `contain`, low opacity, preserve aspect ratio |
| Larger background that already includes a wave and brand-like logo | `brand-decor/hero-wave-logo-dark.webp` | Background `cover`, behind dark UI |
| Larger background without a logo | `brand-decor/hero-wave-minimal-dark.webp` | Background `cover`, behind dark UI |
| Programs sport photography | `sport-cards/*-card-reference.webp` | Real screenshot reference crops, `object-fit:cover` |
| Groups roster & Locations night-field hero | `venue-photography/football-pitch-night-hero.webp` | `object-fit:cover`, overlay dark gradient |
| Location list thumbnails | `venue-photography/*-thumb-reference.webp` | `object-fit:cover`; only when the photo is explicitly associated with the record |

## 2. Important production notes

- **Decorative wave assets** are generated approximations to the screenshot design, NOT pixel-exact extraction. Transparent versions are real RGBA/WebP alpha files; they contain NO blue annotations.
- **Sport-card and location-thumbnails ending `-reference`** are crops of the user's supplied screenshots, so resolution/detail is limited. They are suitable for UAT/mock previews at roughly the shown size, not as high-resolution licensed originals or authoritative images for a specific facility.
- **Do not use sample venue photos to assert that a real tenant-owned location exists**. Bind actual venue data/photography or use a neutral placeholder.
- **Logo watermark** was derived from the supplied `logo.jpg`, not invented. Some original background glow from the JPEG may remain. For exact brand vector production, use the approved master SVG if available.
- Keep decoration out of the accessibility tree: `aria-hidden="true"`, `alt=""`, `pointer-events-none`.
- Avoid the wave obscuring controls, text, contrast and focus; background should be BELOW the content layers.
- Avoid using dark-background hero images blindly in light theme: adjust contrast or use the transparent overlay on theme surface.
- The primary accent is Signal Lime `#C6FF00`. Follow current SCRIPE design tokens; avoid embedding a screenshot or entire page UI as a background.

## 3. Minimal Next.js / Tailwind example

```tsx
<div className="relative isolate overflow-hidden rounded-2xl bg-nx-surface">
  <img
    src="/images/academy/backgrounds/brand-decor/header-wave-right-transparent.webp"
    alt=""
    aria-hidden="true"
    className="pointer-events-none absolute inset-y-0 right-0 z-0 h-full w-[55%] object-cover object-left opacity-50"
  />
  <div className="relative z-10">{children}</div>
</div>
```

For sport-card photography, prefer Next.js `<Image>` with `fill`, `sizes`, `className="object-cover"`, and optional `object-position` tuning.

## 4. Verification checklist

Check at 360px, 768px, 1280px, 1600px; Arabic RTL, English LTR; light and dark; text contrast, CTA clickability, image cropping, and no forced page overflow. If the screenshot uses a right-anchored shape, RTL does not always imply mirroring (the design choice is intentional).
