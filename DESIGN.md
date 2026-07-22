# DESIGN.md

> The committed design system for SCRIPE signup/onboarding: **"Aurora Refined."**
> Source of truth for tokens: `src/core/ui/tokens/brand.ts` (`BRAND_TOKENS`, `DARK_THEME`, `LIGHT_THEME`). Values below mirror that file — never invent colors; import the tokens.

## Identity (preserve)

The aurora violet/indigo identity stays. Both **dark** and **light** themes ship (`DARK_THEME` / `LIGHT_THEME`).

### Core palette (`BRAND_TOKENS.palette`)

- **violet** `#A855F7` — primary accent (dark theme `accent`)
- **violetDark** `#7C3AED` — accent in light theme (`accent`), CTA mid-stop
- **indigo** `#6366F1` — CTA end-stop
- **cyan** `#22D3EE` — secondary accent (dark); `#0891B2` in light
- emerald `#10b981`, amber `#eab308`, rose `#ef4444` — semantic only

### Gradients (`BRAND_TOKENS.gradient`)

- **page** — `radial-gradient(140% 90% at 25% 25%, #1A1140 0%, #0A0820 40%, #06060E 80%, #04040A 100%)` (dark `gradientPage`); light: `#EDE9FE → #F5F3FF → #F8F7FF → #FAFAFE`
- **cta** — `linear-gradient(135deg, #A855F7 0%, #7C3AED 50%, #6366F1 100%)` (dark `gradientCta`); light: `#7C3AED → #6D28D9 → #4F46E5`
- **step** — `linear-gradient(180deg, #A855F7 0%, #7C3AED 100%)` (active/completed step)
- **planCard** — `linear-gradient(135deg, rgba(168,85,247,0.25), rgba(124,58,237,0.18))`
- **heroText** — `linear-gradient(180deg, #F5F2FF 0%, #C7B8F0 100%)` — **exists in tokens but is BANNED on headings** (see bans)

### Surfaces

Dark: `surface #06060E`, `surfaceRaised rgba(20,12,46,0.78)`, `surfaceCard linear-gradient(180deg, rgba(20,12,46,.78), rgba(10,8,28,.85))`, `bg.glass rgba(6,6,14,0.85)`.
Light: `surface #F8F7FF`, `surfaceRaised #FFFFFF`, `surfaceCard linear-gradient(180deg, #FFFFFF, #F5F3FF)`.

### Inks (`text` / theme `ink*`)

Dark: `primary rgba(245,242,255,0.95)`, `secondary 0.62`, `tertiary 0.4`, `ghost 0.25`, brand highlight `#C4B5FD`.
Light: `ink #1A1133`, `inkMuted #4B4566`, `inkFaint #8B82A8`, `inkGhost #C8C2DC`.

### Borders (`BRAND_TOKENS.border` / theme)

`subtle 1px rgba(255,255,255,0.04)`, `card 1px rgba(168,85,247,.22)`, `active 1px rgba(168,85,247,0.5)`, `muted 1px rgba(255,255,255,0.07)`, `input rgba(255,255,255,0.08)`, `inputFocus rgba(168,85,247,0.5)`, `success`, `error`.

### Shadows (`BRAND_TOKENS.shadow`)

- **card** — `0 25px 50px -12px rgba(0,0,0,.5), 0 0 80px -20px rgba(168,85,247,.15)` (depth ✅)
- **cta** `0 4px 15px -3px rgba(124,58,237,0.4)` and **step** `0 0 12px rgba(168,85,247,0.4)` — these are **purple glows**; see "Elevate" rules — do NOT use them as the default CTA/glow treatment.

## "Elevate" execution rules (the bar for this redesign)

### Remove the AI-slop tells

- **No purple glow box-shadows on CTAs.** Use the `shadowCard` depth shadow or a neutral elevation; reserve colored glow for nothing by default.
- **No gradient text on headings.** Headings use a solid ink. `heroText` gradient is retired from heading use.
- **No glassmorphism as default.** `backdrop-blur` is reserved for the **sticky header only** — not cards, modals, or panels everywhere.

### Color strategy

- **Restrained base + Committed accent moments.** Accent (violet/indigo/cyan) appears only for: the **primary action**, the **current selection/step**, or the **recommended** option. Never as decoration.
- **Verify contrast:** body text ≥ **4.5:1**, large text ≥ **3:1**, in both themes. Muted inks must still pass against their actual surface.

### Typography

- **One family, multiple weights** — no second display face.
- **Forms:** fixed **rem** scale (predictable, dense, scannable).
- **Discovery prompts:** confident editorial scale, **cap ~3rem**.
- Letter-spacing **≥ -0.04em** on large headings; `text-wrap: balance` on prompt headings.

### Layout

- **Grid for 2D, flex for 1D.**
- **Equal-height plan cards** via a shared internal row template (CTA and footer align across cards regardless of body length).
- **`min-h-[100dvh]`** on full-bleed phases (handles mobile browser chrome).
- **Semantic z-index scale**, low → high: `header < sticky-progress < dropdown < modal-backdrop < modal < toast < tooltip`. No ad-hoc `z-[9999]`.

### Motion

- Duration **150–250ms**, easing **ease-out (quart / expo)**.
- **State-driven** transitions; **staggered option reveals** are OK.
- **No bounce / elastic.**
- Every animation has a **`prefers-reduced-motion`** fallback.
- **No orchestrated page-load animation** on product form steps (account / verify / workspace).

### Plan card badges

- **One badge slot per card**, single badge only.
- Precedence: **Recommended > Most popular > Best value**.
- Never two overlapping badges on one card.

## Absolute bans

- Side-stripe / left-accent borders on cards.
- Gradient text (incl. `heroText` on headings).
- Default glassmorphism (`backdrop-blur` anywhere but the sticky header).
- The "hero metric" template (giant number + label hero block).
- Identical card grids as the only layout motif across phases.
- Tiny uppercase letter-tracked eyebrows on every section.
- Numbered section markers used as decorative scaffolding.
- Text overflow / clipping at **any** breakpoint or in RTL.

## Responsive contract

- **Mobile (< 640px):** single column; full-bleed phases stack vertically.
- **Tablet (640–1024px):** reduced split layout; plan cards in **2 columns**.
- **Desktop (> 1024px):** full **asymmetric split** layout; plan cards in up to **4 columns**.

Every layout must hold in **RTL** (Arabic): mirrored alignment, mirrored motion direction, no clipped or overflowing text.

---

# EDGE — the application design system

> **Scope:** the authenticated application (the `scripe` layout). The Aurora
> Refined section above continues to govern signup/onboarding.
> **Source of truth for tokens:** the `SCRIPE / EDGE DESIGN SYSTEM` block at the
> foot of `src/app/globals.css`. Never invent a colour; read a token.

## Where it comes from

The mark is a matte extruded solid. Its faces are dark, all of its light
collects on the bevels, and it discharges cyan at exactly one place — the
terminal edge. That is a complete interface specification, and these are its
four laws:

1. **Surfaces are matte.** No gradient fills, no glass, no glow on a resting
   element. A card at rest is a flat slab with a hairline edge.
2. **Edges carry the light.** Focus, selection and active navigation are all
   expressed by an edge lighting up — the same physical event, everywhere.
3. **Cyan discharges once.** One emitting element per screen: the thing that is
   live right now. If two things glow, neither reads.
4. **Depth is extrusion.** A lit top edge plus a hard offset drop — never a soft
   blur halo pretending to be elevation.

## Accent: the workspace owns it

`Workspace.ColorHue` (OKLCH hue, 0–360) and `ColorChroma` (0–0.4) already exist
on the backend. `WorkspaceProvider` publishes them to `<html>` as
`--workspace-hue` / `--workspace-chroma`, and every accent shade derives from
them in CSS:

```css
--sx-accent:      oklch(0.68 var(--workspace-chroma) var(--workspace-hue));
--sx-accent-fill: oklch(0.52 var(--workspace-chroma) var(--workspace-hue));
--sx-emit:        oklch(0.82 0.13 calc(var(--workspace-hue) + 78));
```

Switching workspace therefore re-tints the entire interface with no
per-component colour logic anywhere.

**`--sx-accent` and `--sx-accent-fill` are deliberately two tokens.**
Accent-as-text must beat the dark ground; accent-as-fill must beat the white
label sitting on top of it. Those are opposite requirements and cannot be one
value.

**Never build alpha by string concatenation.** `` `${accent}22` `` is invalid CSS
for an `oklch()` value and browsers drop the whole declaration silently. Use
`oklch(... / 0.14)` or `color-mix()`.

## Semantic status tokens

`--success`, `--warning`, `--info` (with `-foreground` pairs) sit alongside
`--destructive` in `globals.css` and are exposed through Tailwind as
`bg-success`, `text-warning`, `border-info`, etc.

They exist because their absence was the root cause of roughly 340 raw palette
colours across 60 view files: `destructive` was the only tokenised status, so
every view invented its own green.

**A semantic token already resolves per theme.** When replacing a
`text-emerald-600 dark:text-emerald-400` pair, delete the `dark:` variant — do
not carry it over.

`--warning-strong` is the fourth step of the severity ramp
(`success → warning → warning-strong → destructive`). It exists because some
scales genuinely need four steps — an SLA gauge, a quota meter — and without it
amber and orange both collapse into `warning`, silently turning a four-step
ramp into three. Reach for it only when a scale really has four levels; do not
use it as "a slightly different amber".

## Contrast

Every token pair is measured, not asserted. Body text ≥ 4.5:1, large text and
non-text UI ≥ 3:1, in both themes. Notable values:

| Pair | Dark | Light |
|---|---|---|
| ink / void | 17.8:1 | 17.3:1 |
| ink-3 / slab (muted) | 5.63:1 | 6.36:1 |
| success / slab | 9.77:1 | 5.40:1 |
| warning / slab | 11.25:1 | 5.93:1 |
| white / accent-fill | 5.28:1 | 5.70:1 |

## Shell

Geometry is inherited from nexus on purpose — 64px rail, 240px panel, 56px
topbar — so a tenant switching layouts keeps their spatial muscle memory. What
changes is the skin.

- **Identity appears once.** Avatar and notifications live at the foot of the
  rail; the topbar carries only context (breadcrumbs, search, page actions).
  Theme and language switchers belong in the account menu.
- **The pin zone.** Inside a module workspace the admin workspace auto-pins at
  the top of the pin zone as the way back, shown only when the user can reach
  it and not user-removable. User pins follow in the backend's `pinSortOrder` —
  the pin endpoint is authoritative and the client never computes order.
- **One focus law.** `2px solid var(--sx-emit)` at `2px` offset, everywhere.

## Components

`stat-card`, `page-header` and `empty-state` are in `@core/ui`. Reach for them
before writing a KPI, a page heading or a "nothing here" state — each of those
had been re-implemented up to ten times with incompatible props.

`EmptyState` takes an action slot because an empty state that only says "no
data" wastes the moment the user is most willing to act.

## Bans

- Building colour alpha through string concatenation (see above).
- `dark:` variants on a semantic token.
- Animating `width`/`height` for progress or reveal — use `transform`.
- A second place for user identity in the shell.
- Any new `isDark ? "#hex" : "#hex"` ternary. The token layer already knows.
