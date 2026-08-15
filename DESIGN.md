# DESIGN.md — SCRIPE Relay Design System vNext

> **Status:** committed target design system for the entire SCRIPE product.
> This document retires the visual identity previously named **Aurora Refined**
> and the visual skin previously named **EDGE**. Their useful UX, accessibility,
> responsive and shell constraints are preserved where explicitly restated here.
>
> **Canonical brand mark:** `SCRIPE Relay Grid`.
> **Canonical palette:** Signal Lime + Ink + Carbon + Graphite + Mineral Silver + White.
> **Rule:** never redesign, reinterpret, simplify, trace, or regenerate the Relay Grid geometry.
>
> **Token architecture note:** this document's canonical namespace is `--scripe-*`
> (defined in `src/app/globals.css`, top of file). The product shell continues to
> consume `--nx-*` and the auth vault continues to consume `--sx-*` — both are
> re-based to read `--scripe-*` values for their colour/identity duties, so this
> document's colour law applies to them unchanged. Renaming 580+ `--nx-*`
> consumer files was out of scope for the migration; `--scripe-*` is the source
> of truth, `--nx-*`/`--sx-*` are its live-consumed aliases.

---

## 0. Migration mode

This redesign is a **visual-system migration, not a general UX redesign**.

There is one deliberate exception:

> **Auth Presentation Redesign Exception:** Login, Register/Signup, verification, password-recovery and onboarding may receive a targeted visual/compositional/interaction redesign when the existing presentation is materially tied to the retired identity or cannot express Relay vNext cleanly. This exception changes presentation, not authentication product logic.

During this pass:

- Preserve information architecture, feature behavior, data behavior, permissions, route semantics and component contracts.
- Preserve authentication business logic: providers, fields, validation, step order, branching rules, state machine, API behavior and completion rules.
- Preserve shell geometry unless an existing implementation is objectively broken.
- Outside Auth, do not change layout simply because another layout might look nicer.
- Inside Auth, layout/composition/motion may change only after the required Auth Visual Audit documents why a reskin is insufficient.
- Do not adopt unrelated component refactors.
- Do not rewrite product copy except where a legacy brand name/visual label is incorrect.
- Any non-Auth UI/UX issue discovered while migrating is written to `UI_UX_AUDIT_REPORT.md`.
- Auth findings that require product-logic changes are also report-only; visual presentation findings may be implemented under the exception above.
- The migration is complete only when active product UI contains no accidental legacy visual identity.

---

# 1. Brand identity

## 1.1 The mark

The SCRIPE mark is the **Relay Grid**: three interlocking directional solids that communicate
handoff, coordination, motion, control, systems intelligence and operational continuity.

The vector source is the source of truth. 3D is a treatment of that geometry, never a replacement.

### Approved use classes

1. **Flat canonical mark** — app shell, navigation, favicon, dense product UI, documents.
2. **Monochrome mark** — constrained single-color contexts.
3. **Canonical 3D mark** — login, cinematic auth stage, launch/marketing/presentation surfaces.
4. **3D app icon** — app-store/presentation/mockup contexts; not a substitute for the small UI icon.

### Forbidden

- Redrawing the mark.
- AI-generating a "similar" symbol.
- Auto-tracing a raster and calling it canonical.
- Stretching, skewing, changing piece proportions, moving the three pieces independently.
- Applying arbitrary outline, glow or color effects that obscure the three canonical materials.
- Restoring purple legacy marks, old S marks, or any "Scribe" typo asset.

---

# 2. Palette

## 2.1 Canonical brand colors

| Token | Value | Duty |
|---|---:|---|
| Signal Lime | `#C6FF00` | primary brand signal, live/active/CTA fill |
| Ink | `#0D0D0E` | primary dark identity and accent foreground |
| Void | `#050506` | deepest background |
| Carbon | `#151719` | raised dark surface |
| Graphite | `#3F4347` | structural neutral |
| Mineral Silver | `#D7D8D6` | premium neutral / metallic reference |
| White | `#FFFFFF` | light surface and high-contrast ink |
| Light Canvas | `#F7F8F5` | default light background |
| Light Subtle | `#EEF0EB` | light nested surface |
| Accent Text Light | `#4C6200` | accessible brand-text duty on light surfaces |

### The Signal Lime rule

Signal Lime is intentionally bright. On a Lime **fill**, the foreground is always Ink, never white.
On a dark surface, Lime may be used as text for a live/active signal.
On a light surface, Lime is not body text; use `Accent Text Light` for readable brand-accent text.

## 2.2 Color strategy

**Restrained base + committed signal moments.**

Signal Lime appears for:

- primary action,
- current navigation / current step,
- selected item,
- live operational state,
- focus when appropriate,
- one deliberate visual signal in a cinematic auth scene.

It does not appear as ambient decoration on every component.

Graphite, Carbon, Mineral and Ink carry the product. Lime communicates state.

---

# 3. Theme system

Both dark and light themes ship.

## Dark

- canvas: `#050506`
- surface: `#0D0D0E`
- raised: `#151719`
- subtle: `#1D2022`
- edge: `#2C3033`
- strong edge: `#3F4347`
- text: `#F7F8F5`
- muted: `#B9BDB8`
- faint: `#8C918D`
- accent: `#C6FF00`
- accent foreground: `#0D0D0E`

## Light

- canvas: `#F7F8F5`
- surface: `#FFFFFF`
- raised: `#FFFFFF`
- subtle: `#EEF0EB`
- edge: `#D5D9D3`
- strong edge: `#AEB4AD`
- text: `#0D0D0E`
- muted: `#4B504C`
- faint: `#6F756F`
- accent fill: `#C6FF00`
- accent foreground: `#0D0D0E`
- accent-as-text: `#4C6200`

Do not implement theme differences with scattered `isDark ? "#hex" : "#hex"` ternaries.
Theme is resolved through tokens.

---

# 4. Token namespace

Canonical identity source of truth:

`--scripe-*`

Defined at the top of `src/app/globals.css`. The product shell (`--nx-*`, ~580 consumer
files) and the auth vault (`--sx-*`, ~45 consumer files) are **live, active namespaces** —
not deprecated — re-based to read `--scripe-*` values for every colour/identity duty.
`--edge-*` is the one namespace that is fully retired (Wave I1); it must never be revived.

No new component may hardcode brand hex; consume `--scripe-*` directly, or the
`--nx-*`/`--sx-*` alias appropriate to the surface it renders in.

Backend workspace variables remain:

- `--workspace-hue`
- `--workspace-chroma`

But they no longer re-tint SCRIPE globally — see §5.

---

# 5. Workspace color

`Workspace.ColorHue` and `Workspace.ColorChroma` remain a real product feature.

Their duty is **tenant context**, not global SCRIPE identity.

Allowed:

- workspace avatar/ring,
- tenant chip,
- small chart series when the data belongs to that workspace,
- optional module-context indicator.

Forbidden:

- global CTA color,
- global focus color,
- entire navigation skin,
- global active state,
- login/signup brand identity.

SCRIPE remains Lime/Ink/Silver regardless of workspace. `--nx-accent-fill` is the
constant Signal Lime; `--nx-accent` (the "as text/edge" duty) is Lime on dark / Accent
Text Light on light — neither reads `--workspace-hue` any longer.

---

# 6. Material language

The Relay Grid establishes the product material model:

1. **Ink/Carbon = structure.**
2. **Graphite = secondary structure.**
3. **Mineral = premium edge/reference.**
4. **Signal Lime = energy/live state.**
5. **3D depth = authored, not fake glow.**

## Product surfaces

- Mostly matte.
- Flat fills at rest.
- Hairline edges.
- Neutral depth shadows.
- No colored glow around resting UI.
- Selected/focused state may light an edge or use a Lime fill, not both everywhere.

## Cinematic surfaces

Login and brand moments may use controlled specular light, polished metal, 3D extrusion and
environmental Lime reflection because the asset itself is a designed 3D treatment.

The application UI must not imitate the 3D logo by turning every card into glossy chrome.

---

# 7. Typography

- One primary sans family already present in the product.
- Do not introduce a second display family in this migration.
- Headings are solid color. No gradient text.
- Forms use a fixed rem scale, dense and scan-friendly.
- Editorial auth prompts may scale up to about `3rem`.
- Large heading tracking must not be tighter than `-0.04em`.
- Use balanced wrapping on large auth headings where supported.
- Body copy must remain readable and calm; do not uppercase whole paragraphs.

### Recommended scale

- small: `0.8125rem`
- body: `0.875rem`
- body-lg: `1rem`
- h4: `1rem–1.125rem`
- h3: `1.125rem–1.375rem`
- h2: `clamp(1.5rem, 3vw, 2.25rem)`
- h1/auth prompt: `clamp(2rem, 4vw, 3rem)`

---

# 8. Geometry

## Radius

- xs `6px`
- sm `8px`
- md `12px`
- lg `16px`
- xl `22px`
- pill only for chips/toggles

The existing `--nx-radius-*` ladder (sm 6 / control 8 / md 10 / lg 14) predates this
document and was left in place during migration — close enough to introduce no visible
regression, and reworking product-wide corner radii was out of the visual-identity scope.
New surfaces may use either ladder; do not run both inconsistently within one component.

Avoid excessively rounded "toy SaaS" styling.

## Borders

- resting: subtle neutral hairline
- hover: stronger neutral edge
- selected: Lime edge or Lime filled control depending component
- error/success/warning: semantic tokens, not brand Lime

No left-stripe/side-stripe decoration on cards.

---

# 9. Elevation

Elevation is neutral.

Dark:
`0 14px 38px rgba(0,0,0,.34), 0 2px 0 rgba(255,255,255,.025) inset`

Light:
`0 14px 36px rgba(13,13,14,.10), 0 1px 0 rgba(255,255,255,.9) inset`

For strong physical separation, a hard low-offset shadow is allowed.

Forbidden:

- purple glow,
- cyan glow as the product default,
- Lime halo around every CTA/card,
- giant diffuse shadows that make every panel float.

---

# 10. Focus and accessibility

One focus law:

`2px solid var(--scripe-focus)` at `2px` offset (product shell: the equivalent `--nx-focus`
inset-ring recipe, which resolves through the same re-based `--nx-accent`).

Requirements:

- body text ≥ `4.5:1`
- large text and non-text UI ≥ `3:1`
- do not communicate status with color alone
- keyboard order follows DOM meaning
- skip link remains first tab stop where already present
- focus must not be clipped by overflow containers
- motion has reduced-motion fallback
- icon-only controls require accessible names
- forms expose errors programmatically

Signal Lime on Ink has extremely strong contrast; Ink on Signal Lime is the standard CTA pairing.
Signal Lime itself is not used as text on white/light canvas.

---

# 11. Semantic status

Status colors remain separate from brand accent.

Dark references:

- success `#61D49A`
- warning `#F2C94C`
- warning-strong `#F59E0B`
- info `#7DD3FC`
- destructive `#FF6B6B`

Light references:

- success `#16784A`
- warning `#765700`
- warning-strong `#9A4F00`
- info `#0B5D85`
- destructive `#B4232A`

A semantic token resolves per theme. Do not add a parallel `dark:` color when using a semantic token.

`warning-strong` is only for a genuine fourth level in a severity ramp.

---

# 12. Motion

## Product UI

- fast `150ms`
- normal `200ms`
- slow `260ms`
- easing: `cubic-bezier(.16,1,.3,1)` or existing equivalent (`--nx-ease-enter`)
- state-driven
- transform/opacity over width/height when animating reveal/progress
- no bounce / elastic
- no perpetual ambient animation on ordinary product controls

## Login cinematic motion

Login is the one product entry surface allowed a richer brand motion layer.

Use the canonical 3D PNG asset as a single protected object.

Allowed:

- initial `opacity + translate + subtle scale` reveal, `650ms` (`.scripe-auth-reveal` in globals.css)
- pointer parallax on fine-pointer devices only, maximum `±2deg` (implemented in `VaultLayout.tsx`)
- tiny ambient light movement applied to the container/background, not geometry — a
  single **static** Signal Lime glow, not a drifting/looping ambience
- restrained one-time highlight sweep

Not allowed:

- deforming individual logo paths,
- morphing the Relay Grid,
- spinning continuously,
- bounce,
- heavy particle storms behind a form,
- animation that competes with typing.

`prefers-reduced-motion` removes intro translation, parallax and light sweep.

---

# 13. Shell

Preserve the existing spatial contract:

- rail: `64px`
- panel: `240px`
- topbar: `56px`
- panel overlay breakpoint: `1024px` (the shell's actual `lg:` breakpoint — not 900px)

Identity appears once.

- Rail identity area: avatar, notifications/preferences cluster as already architected.
- Topbar: context, breadcrumbs, search, page actions.
- Do not duplicate user identity merely to make a new visual composition.
- Rail navigation scrolls independently.
- Below the panel breakpoint the panel overlays with scrim rather than consuming mobile content width.
- Existing pin ordering remains backend-authoritative.

The shell receives the new skin, not a new IA.

---

# 14. Product components

## Buttons

Primary:
- Signal Lime fill
- Ink label/icon
- no colored glow
- neutral depth only when needed

Secondary:
- transparent/neutral surface
- structural border
- text follows theme

Destructive:
- semantic destructive token
- never brand Lime

## Inputs

Rest:
- neutral surface
- neutral hairline edge

Focus:
- `--scripe-focus`
- no huge outer glow

Error:
- semantic destructive
- include text message when needed

## Cards

- flat matte surface
- no default glass
- no decorative colored stripe
- no gratuitous gradient
- selected card gets one committed signal treatment
- equal-height product/plan cards keep CTA/footer alignment

## Navigation

- current item is obvious from Lime signal + weight/edge/fill as appropriate
- inactive items stay neutral
- no rainbow/workspace recoloring of global nav

## Tables

- dense, readable, neutral
- active sort/filter uses restrained signal
- status cells use semantic tokens
- hover must not become a glowing row

## Modals / dropdowns / toasts

- raised neutral surface
- clear edge
- correct z-order
- no full glassmorphism
- toast status uses semantic color, not brand accent

---

# 14.5 Auth presentation redesign authority

Auth is a protected exception to the general "skin, do not redesign" rule.

Screen-by-screen classification and decisions for every Auth route/state that exists in this
repository are recorded in `AUTH_VISUAL_REDESIGN_DECISION.md` at the repository root — read
that file before touching any auth surface again; do not re-derive the classification from
scratch.

## Allowed under the Auth exception

- brand-stage / form-panel composition,
- desktop split proportions,
- background treatment,
- card/surface architecture,
- spacing and visual hierarchy,
- typography scale within this design system,
- placement and size of supplied flat/3D logo assets,
- responsive stacking and mobile presentation,
- decorative/environmental layers,
- progress-step visual treatment,
- transition implementation and timings,
- existing purely-presentational animation,
- loading/entry visuals when they do not change authentication-state behavior.

## Not allowed

- route meaning,
- authentication providers,
- credential requirements,
- field set,
- field semantic order,
- validation rules or their meaning,
- submission logic,
- account-creation logic,
- verification rules,
- onboarding step sequence,
- skip/branch eligibility,
- workspace creation logic,
- plan/billing logic,
- API contracts,
- permissions,
- auth state machine.

If a better experience would require any item in the forbidden list, record it in
`UI_UX_AUDIT_REPORT.md` and leave behavior unchanged.

---

# 15. Login — Cinematic Auth

Login (`VaultLayout.tsx`) is visually distinct from the authenticated product while using the
same brand system.

## Desktop

Asymmetric split — `lg:grid-cols-[minmax(0,1fr)_min(500px,48%)]`:

- cinematic brand stage: the remainder column (~52–58% at common widths)
- form surface: `min(500px, 48%)` — inside the recommended 28–32rem readable width
- on RTL the spatial order mirrors, but the logo artwork itself is not geometrically mirrored

### Brand stage

Use:

`/brand/auth/login-relay-grid-3d.png`

This is the exact approved source image and is the primary 3D runtime asset — used directly,
never re-exported or upscaled beyond its native 1254×1254 resolution.

If a component strictly needs an SVG resource, use `/brand/auth/login-relay-grid-3d-EXACT-LOOK.svg`,
understanding that it is a lossless raster-in-SVG wrapper, not native vector.

Background: deep Ink/Void with a restrained, **static** Signal Lime environmental glow
(`.scripe-auth-stage` / `VaultBackground.tsx`) plus a low-opacity systems-intelligence grid. No purple.

### Form panel

- maximum readable form width `430px`
- solid surface (`--sx-card-bg`)
- high contrast
- logo appears once in compact flat form on mobile (`MobileLogo`, brand stage hidden below `lg:`)
- primary submit is Lime/Ink
- providers/secondary actions remain neutral
- error states semantic

## Mobile

- form first
- cinematic 3D stage collapses to a compact top brand moment
- no viewport-height trap
- use `min-height: 100dvh`
- never put the form over a busy 3D image

---

# 16. Signup and onboarding

Signup/onboarding share the Relay system, not the old Aurora identity.

They are quieter than login.

- Flat logo by default (`SignupShell` header lockup).
- Product form steps do not use orchestrated page-load animation.
- Current step uses Signal Lime (`SignupProgressBar`); completed step uses structural
  (ink-filled) confirmation, not the same signal — do not make every completed step glow.
- Plan cards follow one badge slot with precedence:
  `Recommended > Most popular > Best value` (`PlanCard.tsx` — structurally enforced).
- Flow, field order and plan logic are unchanged from before the visual migration.

---

# 17. Auth assets

Canonical, installed project paths (verified against `src/`):

```text
public/brand/app-logo.svg
public/brand/app-logo-1024.png
public/brand/favicon.ico              (mirrored at src/app/favicon.ico, the Next.js convention that wins)
public/brand/favicon.svg
public/brand/favicon-16x16.png
public/brand/favicon-32x32.png
public/brand/apple-touch-icon.png
public/brand/android-chrome-192x192.png
public/brand/android-chrome-512x512.png
public/brand/maskable-icon-512x512.png
public/brand/auth/login-relay-grid-3d.png
public/brand/auth/login-relay-grid-3d-EXACT-LOOK.svg
public/brand/auth/login-lockup-3d.png
public/brand/auth/login-hero-stage-dark.png
```

Every asset above has exactly one active copy; there is no legacy `/app-logo.png` or
`/scripe-icon-3d.png` remaining in `public/`. `public/manifest.json` and
`src/app/layout.tsx` metadata reference this set exclusively.

---

# 18. Responsive contract

- mobile `<640px`: single-column content, full-bleed phases stack
- tablet `640–1024px`: reduced split, plan cards up to 2 columns
- desktop `>1024px`: asymmetric split where appropriate, plan cards up to 4 columns
- shell panel overlay breakpoint is `1024px` (see §13 — not 900px)

Every layout must work in Arabic RTL:

- alignment mirrors
- chevrons/directional motion mirrors when semantically directional
- the SCRIPE logo itself does not mirror
- no clipped Arabic
- no fixed widths that assume English label length
- no text overflow at any breakpoint

---

# 19. Z-index

Low → high:

`header < sticky-progress < dropdown < modal-backdrop < modal < toast < tooltip`

Reference values (`--nx-z-*` / Tailwind `zIndex` scale — already matches this ladder):

- header `20` / `base`–`header` (100)
- sticky progress `30` / `sticky` (200)
- dropdown `40` / `1050`
- modal backdrop `50` / `overlay` (999)
- modal `60` / `1000`
- toast `70` / `1100`
- tooltip `80` / `1200`

No ad-hoc `z-[9999]`.

---

# 20. Absolute bans

- Legacy violet/purple/indigo as SCRIPE brand accents.
- Legacy cyan as the global app brand accent.
- Purple/cyan glow shadows.
- Gradient heading text.
- Default glassmorphism.
- Side-stripe card decoration.
- Hero-metric template as a repeated layout crutch.
- Tiny uppercase eyebrows on every section.
- Decorative numbered section scaffolding.
- Hard-coded brand hex values inside feature components.
- `isDark ? colorA : colorB` visual ternaries when a token exists.
- New `--edge-*` variables (retired). New `--sx-*`/`--nx-*` consumers should prefer
  `--scripe-*` directly where the surface allows it.
- String-concatenated alpha values.
- Animating width/height when transform works.
- More than one user-identity cluster in shell.
- Mirroring the logo in RTL.
- Recreating the 3D logo from CSS.
- UI/UX redesign during this migration without explicit approval.

---

# 21. Legacy migration map

Retired identity values — confirmed eradicated from active `src/` UI code as of the Relay
vNext migration (tenant-configurable color-picker defaults, theme-builder demo bundles, and
historical docs/comments may still reference them; that is expected and correct):

- old violet `#A855F7`
- old violet dark `#7C3AED`
- old indigo `#6366F1`
- old cyan `#22D3EE`
- old light cyan `#0891B2`
- old Aurora page gradients
- old CTA gradients
- old purple glow shadows
- old global workspace-driven accent behavior (workspace hue no longer drives `--nx-accent`)

---

# 22. Code migration requirements

Already executed for this migration; retained here as the standing rule for future changes.

Search active code for:

- old brand hex values
- Tailwind `violet-*`, `purple-*`, `indigo-*` used as brand
- legacy cyan classes used as brand
- `--edge-*`
- old logo paths/files
- old favicon references
- PWA icon references
- manifest metadata
- OpenGraph/Twitter image references
- login/signup/onboarding CSS
- hard-coded gradient headings
- `backdrop-blur`
- colored shadow utilities
- raw status colors
- dark/light ternary color logic

Then migrate systematically. Do not delete a legacy variable until its consumers are migrated.

---

# 23. QA gate

## Themes
- dark
- light

## Direction
- English LTR
- Arabic RTL

## Viewports
- 360px
- 390px
- 640px
- 768px
- 1024px
- 1280px
- 1440px+

## Screens
- login
- signup
- verification
- workspace creation/selection
- plan selection if present
- authenticated shell
- representative dashboard/list/detail/form
- modal
- dropdown
- toast
- empty state
- error state

## Accessibility
- keyboard
- focus visibility
- contrast
- reduced motion
- screen-reader labels for icon-only controls

## Brand integrity
- only canonical Relay Grid
- favicon updated
- app/PWA icons updated
- no purple legacy brand
- no old cyan global brand
- no legacy logo assets referenced
- no accidental mixed old/new visual systems

Full evidence for this gate as executed: `DESIGN_MIGRATION_COMPLETION_REPORT.md`.

---

# 24. UI/UX audit rule

Non-implemented findings discovered during the migration are recorded in
`UI_UX_AUDIT_REPORT.md`. Do not implement those suggestions without explicit approval.

---

# 25. Definition of done

1. One canonical SCRIPE visual system.
2. Relay Grid is the only active brand mark.
3. Login uses the approved 3D asset without geometry drift.
4. Signup/onboarding use the same identity, quieter than login.
5. Dark/light both work.
6. RTL is intact.
7. Accessibility contract holds.
8. Legacy visual tokens and assets are removed from active UI.
9. No product behavior changed unintentionally.
10. UI/UX observations are captured in a report rather than silently redesigned.

---

# 26. V3 source-fidelity override

For all approved 3D artwork, the exact source PNGs in the V3 handoff override any previously
generated 3D SVG treatment. Verified byte-identical against
`SCRIPE_RELAY_VNEXT_CLAUDE_HANDOFF_SOURCE_FIDELITY/02_BRAND_ASSETS/SOURCE_ORIGINALS_MANIFEST.csv`
at migration time.

- Do not upscale 3D raster assets.
- Do not redraw them.
- Do not trace them.
- Do not color-grade them.
- Do not replace them with older V1/V2 3D SVG variants.
- Native vector status applies only to the canonical flat Relay Grid SVG (`app-logo.svg`).
- Exact-look SVG wrappers around 3D PNGs are containers, not editable native vectors.
