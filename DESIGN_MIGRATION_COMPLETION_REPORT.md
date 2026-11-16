# DESIGN_MIGRATION_COMPLETION_REPORT.md — SCRIPE Relay vNext Design System & Floating Overlay Transformation

**Repository:** `SCRIPE-Frontend` (Next.js `16.4.2`, React `19`, Tailwind CSS `3.4.17`)  
**Reference Specification:** `SCRIPE-Frontend/DESIGN.md` (`§0`–`§26`), `AGENTS.md`, `.agents/rules/ui-components.md`  
**Base HEAD Commit Inspected:** `a65306410baa1d13a03b62bca7aa158b5da27e4e` + Post-`a65306410` Floating Overlay & Contrast Remediation (`#203`, `#208`/`#213`, `#219`)  
**Verification Date:** `2026-11-15`  

---

## 1. Executive Summary & Definition of Done (`DESIGN.md §25`)

The SCRIPE Frontend UI/UX & Design System Transformation unified the application under the **SCRIPE Relay vNext (`--scripe-*`)** visual identity while preserving clean 5-layer SOLID MVVM boundaries, zero unintended product behavior changes, strict Light/Dark parity, English/Arabic LTR/RTL parity, and WCAG 2.2 AA contrast.

After the Phase A–G migration and subsequent live QA sweeps (`#179` Round 1, `#199` Round 2, `#225` Round 3), three systemic UI defects were also resolved and verified post-`a65306410`:
1. **`DEF-03` Disabled Primary CTA Contrast (`globals.css`):** Excluded `:disabled` and `[aria-disabled="true"]` from descendant `.bg-nx-accent-fill span/svg` color overrides so disabled primary buttons inherit accessible disabled ink (`8.20:1` Dark label / `6.33:1` arrow; `7.17:1` / `4.95:1` Light).
2. **Instant Avatar Fallback & Matte Toast Action Pill (`user-profile-dropdown.tsx`, `AccountPreferencesView.tsx`):** Removed `delayMs={600}` so initials render on Frame 0 inside menu triggers/popovers, and locked matte `bg-nx-accent-fill text-nx-on-fill` styling without ambient shadows.
3. **Systemic Floating Overlay Origin-Snap & Animation Scaling (`globals.css`, `src/core/ui/{tooltip,dropdown-menu,select,popover,context-menu,hover-card,menubar,creatable-combobox,date-picker}.tsx`, `NotificationBell.tsx`):** Eliminated viewport-wide slide-in glitches caused by legacy `:root[data-animation="*"] *` global duration overrides and unguarded CSS `transition-property: all` easing `transform-origin` from `50% 50%` over `140ms`. Overlays now scale (`zoom-in-95` / `fade-in-0`) directly from `var(--radix-*-content-transform-origin)` locked at Frame 0 (`coordDriftPx: 0`).

### `DESIGN.md §25` Definition of Done Checklist

| # | Requirement | Status | Evidence & Notes |
|---|---|---|---|
| 1 | One canonical SCRIPE visual system | **DONE** | `--scripe-*` defined in `src/app/globals.css:306-364`; `--nx-*` (`globals.css:4531-4610`) and `--sx-*` read `--scripe-*`; `--edge-*` retired. |
| 2 | Relay Grid is the only active brand mark | **DONE** | `public/brand/app-logo.svg`, `favicon.svg`, `favicon.ico`, PWA `android-chrome-*` / `maskable-icon-512x512.png`, `public/manifest.json` verified. |
| 3 | Login uses approved 3D asset without geometry drift | **DONE** | `/brand/auth/login-relay-grid-3d.png` verified `complete: true`, natural `519x519` (`461x461` rendered `1:1`) in Round 1/3 screenshots. |
| 4 | Signup/onboarding use same identity, quieter than login | **DONE** | Shared `.scripe-auth-stage` (`#15181C -> #0B0D10`) and flat matte Relay cards without ambient orbs/loops. |
| 5 | Dark/light both work | **DONE** | Light & Dark tokens and screens audited and verified (`01`–`02b`, `14`–`15`, `20`–`23`). |
| 6 | RTL is intact | **DONE** | Direct `dir={dir ?? direction}` on Radix `Root` components (`dropdown-menu`, `select`, `context-menu`, `menubar`), `rtl:rotate-180` icons, Cairo font metric overrides, and `0px` horizontal overflow in Arabic RTL screenshots (`03`, `16`, `17d`, `31b`, `43c`, `43d`, `44b`, `45c`, `45d`, `46b`). |
| 7 | Accessibility contract holds | **DONE** | `92/92` WCAG CSS pairs verified (`#17`), `DEF-03` disabled CTA contrast resolved (`#225`), checkbox/label semantics repaired (`DEF-06`), `--scripe-focus` / `shadow-nx-focus` rings, `[data-reduced-motion="true"]` / `[data-animation="none"]` honored. |
| 8 | Legacy visual tokens and assets removed from active UI | **DONE** | `--edge-*` retired; default purple/navy shadcn surface overrides unified; raw Tailwind palettes and invalid Tailwind v4 `!` syntax cleaned up across `@core/ui`, Data Exchange, CRM, Party Kernel, and Auth. |
| 9 | No product behavior changed unintentionally | **DONE** | Preserved 5-layer MVVM contracts, protected `venue/money` & `venue/operations-calendar`, protected `SCRIPE-Backend/**`; `3,311/3,311` Vitest tests passed on `#219`. |
| 10 | UI/UX observations captured in report rather than silently redesigned | **DONE** | All non-implemented observations recorded in `SCRIPE-Frontend/UI_UX_AUDIT_REPORT.md` (`DESIGN.md §24`). |

---

## 2. Token Evolution & Contrast Architecture (`src/app/globals.css`)

### Dark & Light Token Ladder (`globals.css:306-364`, `4531-4610`)

- **Dark Mode (`#0B0D10` / `#15181C` Evolution):** Evolved from `#050506 / #0D0D0E` to `--scripe-bg` / `--nx-ground: #0B0D10`, `--scripe-surface` / `--nx-surface: #15181C`, `--scripe-surface-raised` / `--nx-raised: #1F242B`, `--nx-raised-2: #272D36`, `--scripe-border` / `--nx-line: #30363D`, `--scripe-border-strong` / `--nx-line-hi: #6E7681`, `--nx-ink: #F7F8F5`, `--nx-ink-2: #B9BDB8`, `--nx-ink-3: #909691`.
- **Light Mode:** `--nx-ground: #F7F8F5`, `--nx-surface: #FFFFFF`, `--nx-raised: #EEF0EB`, `--nx-raised-2: #E6E8E3`, `--nx-line: #CFD4CD`, `--nx-line-hi: #767C75`, `--nx-ink: #0D0D0E`, `--nx-ink-2: #4B504C`, `--nx-ink-3: #5E635E`.
- **Signal Lime Rule:** `--nx-accent-fill` / `--scripe-signal: #C6FF00` ALWAYS pairs with dark ink `--nx-on-fill: #0B0D10` (`16.40:1`). Light-mode text/focus uses `--nx-accent` / `--scripe-accent-text: #4C6200` (`6.88:1` on `#FFFFFF`).
- **Semantic Status Tokens (`globals.css:330-360, 4438-4459`):** Unified across `--scripe-*`, global HSL (`--success`, `--warning`, `--warning-strong`, `--info`, `--destructive`), `--nx-*`, and `src/core/ui/tokens/brand.ts` (`92/92` WCAG AA pairs tested cleanly in Phase B `#17`).
- **Typography & Bilingual Vertical Parity (`src/app/fonts.css`):** Verified `20` `@font-face` rules (`Inter` 300–900, `Cairo` 300–900 with `ascent-override: 106%; descent-override: 34%; line-gap-override: 0%;`; `0` missing font URLs).

---

## 3. Systemic Floating Overlay Motion & Origin-Snap Architecture (`#208`/`#213`/`#219`)

### Root Cause Diagnosed
1. Bare wildcard rules `:root[data-animation="minimal|moderate|high"] * { transition-duration: ... !important; }` forced every floating element and Radix Popper child into CSS transitions even when no transition was intended (`transition-property: all`).
2. When Tailwind utilities lacked `transition-none` before `duration-nx-micro`, `transition-property: all` interpolated `transform-origin` from the default `50% 50%` toward `var(--radix-*-content-transform-origin)` over `140ms`, producing a visible slide/drift while scaling in.
3. Missing `[data-radix-popper-content-wrapper]` locks risked transitioning Radix Floating UI `transform: translate3d(...)` positioning coordinates.

### Implemented Fixes (`12` Files)
- **`SCRIPE-Frontend/src/app/globals.css` (`L2009-2051`):**
  - Locked `[data-radix-popper-content-wrapper], .recharts-tooltip-wrapper { transition: none !important; animation: none !important; }`.
  - Replaced `*` wildcard `data-animation` overrides with CSS custom property token scaling (`--nx-t-micro`, `--nx-t-standard`, `--nx-t-panel`: `minimal` `80ms/120ms/180ms`, `moderate` `140ms/200ms/300ms`, `high` `220ms/320ms/450ms`), preserving `0ms`/`none` locks on `[data-animation="none"]` and `[data-reduced-motion="true"]`.
  - Removed legacy `@keyframes nxExpandIn` and unlayered menu/tooltip CSS overrides; guarded container staggers away from `[role="menu"]`, `[role="listbox"]`, `[role="tooltip"]`, `[data-radix-popper-content-wrapper]`, `[data-dropdown-portal]`.
- **Radix Primitives (`src/core/ui/{tooltip,dropdown-menu,select,popover,context-menu,hover-card,menubar}.tsx`):**
  - Added `transition-none` prior to `duration-nx-micro` and `className`, explicit `origin-[var(--radix-*-content-transform-origin)]`, symmetric `data-[state=open]:duration-nx-micro` & `data-[state=closed]:duration-nx-micro`, `ease-nx-enter` / `ease-nx-exit`, tight `zoom-in-95`/`fade-in-0` origin scaling, and RTL `dir={dir ?? direction}` directly on `Root`.
- **Custom Overlays & Combobox (`src/core/ui/creatable-combobox.tsx`, `src/core/ui/notification/NotificationBell.tsx`, `src/core/ui/date-picker.tsx`):**
  - Standardized `w-[var(--radix-popover-trigger-width)]` on `CreatableCombobox`.
  - Switched `NotificationBell` to `useIsomorphicLayoutEffect` pre-paint `recalcPosition()` + `data-dropdown-portal="true"` + `transition-none` + `duration-nx-micro ease-nx-enter animate-in fade-in-0 motion-safe:zoom-in-95`.
  - Scoped `DatePicker` to `transition-[transform,opacity] duration-nx-micro ease-nx-enter` with placement-aware `origin-bottom`/`origin-top` and `motion-reduce` guards.
- **Regression Suite (`src/core/ui/__tests__/floating-overlay-motion.test.tsx`):** Added `9` unit tests covering `transition-none`, origin variables, duration tokens, RTL `DropdownMenu` propagation, and `globals.css` locks.

---

## 4. QA Gate Execution Evidence (`DESIGN.md §23` + `#179` -> `#199` -> `#225`)

### A. Static, Architecture, Locale, Build & Unit Test Verification (Pre-`22:17` `#219` Clean Snapshot)
Verified by `@verifier` (`#217`, `#223`) against the exact `#219` build prior to external concurrent edits in `src/modules/shared/profile/**` (which began at `22:17:15`):

| Gate Command | Result | Exact Measured Output |
|---|---|---|
| `pnpm --dir SCRIPE-Frontend exec tsc --noEmit` | **PASS** | Exit `0` (`0` errors) |
| `pnpm --dir SCRIPE-Frontend exec oxlint -c .oxlintrc.json src` | **PASS** | Exit `0` (`0` errors, `523` warnings across `4,205` files) |
| `scripe validate-locales` | **PASS** | Exit `0` (`108` pairs, `18,677` keys, `0` missing EN/AR, `0` undefined) |
| `scripe arch-check --target all --depth deep` | **PASS** | Exit `0` (`0` errors, `134` warnings, Score `95/100`) |
| `scripe build frontend` | **PASS** | Exit `0` (`202/202` routes `[LIVE]`, `0` errors, `0` warnings) |
| `pnpm --dir SCRIPE-Frontend run test:shard:1` (`--maxWorkers=1`) | **PASS** | Exit `0` (`129/129` files, `1,155/1,155` tests) |
| `pnpm --dir SCRIPE-Frontend run test:shard:2` (`--maxWorkers=1`) | **PASS** | Exit `0` (`128/128` files, `951/951` tests) |
| `pnpm --dir SCRIPE-Frontend run test:shard:3` (`--maxWorkers=1`) | **PASS** | Exit `0` (`128/128` files, `1,205/1,205` tests) |
| **Total Sequential Vitest (`Shard 1 + 2 + 3`)** | **PASS** | **`385/385` files, `3,311/3,311` tests (`0` failed, `0` skipped)** |

> **Workspace Concurrency Transparency Note:** Beginning at `22:17:15` (after the `#219` production build finished at `21:51:19`), an external process outside this Swarm actively modified files under `SCRIPE-Frontend/src/modules/shared/profile/**`. Per workspace safety protocol, this Swarm did **not** touch, revert, or overwrite those external WIP files. Refer to the Final Post-Report Verification addendum for live post-report checks outside `shared/profile/**`.

### B. Real Browser Playwright QA (`#225` Round 3 + `#179` Round 1 Defect Resolution)
Executed against the live `#219` production `next start` server on `http://localhost:3000` (with `:5035` backend offline; Tier 1 auth/public routes 100% unmocked, Tier 2 authenticated shell using Playwright `**/api/**` + `**/hubs/**` route fixtures; `0` page errors, `0` console errors, `0` unexpected `>= 400` responses):

1. **Defect Closure Summary (`DEF-01` .. `DEF-09`):**
   - `DEF-01` (`/custom-fields` endless spinner on API 400): Resolved with `<PageHeader>`, destructive `<Alert>` + Retry button, and clean recovery (Round 2 `39`, `39b`).
   - `DEF-02` (`beforeunload` `.../undefined/v1/customization/admins/settings` 404): Resolved in `useAdminSettingsSync.ts`.
   - `DEF-03` (`/login` Dark disabled CTA `1.09:1`): **Resolved in Round 3** (`round3_results.json`) — Dark LTR/RTL disabled button label `8.20:1`, arrow `6.33:1` (`AA PASS`); Light disabled label `7.17:1`, arrow `4.95:1` (`AA PASS`); enabled CTA `16.40:1` Dark / `11.52:1` min child.
   - `DEF-04` & `DEF-05` (`/account/dossier`, `/account/preferences`, `/hub` mobile `360..1440px` horizontal overflow): Resolved (`0px` overflow across viewports).
   - `DEF-06` (Unauthenticated `/crm/pipelines` calls & checkbox semantics): Resolved (`0` unauthenticated pipeline calls, semantic `<Checkbox>`/`<Label>`).
   - `DEF-07` & `DEF-08` (Data Exchange duplicate switcher & `pageSize: 20`; CRM `SAR (﷼)` pill overlap & blank filter `<Select>`): Resolved (`ViewModeToggle` deduplicated, `20 per page` option active, unclipped `SAR (﷼)`, localized Leads `<Select>`).
   - `DEF-09` (Mixed EN/AR `/login` tagline/BiDi placeholder & `/overview` breadcrumb/telemetry units): Resolved (`dir="rtl"`, `dir="ltr"` telemetry wrappers for `req/min` and `MB/s`).
2. **Round 3 Floating Overlay Telemetry (`round3_results.json`):**
   - `25/25` Radix Popper traces (`DropdownMenu`, `Tooltip`, `Select`, `Popover`) across `moderate` (`0.14s`), `high` (`0.22s`), `none`/`prefers-reduced-motion` (`0s`), Dark/Light, and LTR/RTL: **`coordDriftPx: 0`**, **`originConstantFromFrame0: true`**, `wrapperTransitionProperty: "none"`, `contentTransitionProperty: "none"`.
   - `DatePicker` (`4/4` runs on `/audit`): `coordDriftPx: 0` across `moderate`, `high`, `none`, and RTL.
   - `NotificationBell`: `transitionProperty: "none"`, scales cleanly across `0.14s -> 0.22s -> 0s`.
   - `30` high-resolution Round 3 screenshots captured in `C:\Users\seifmoustafa\.gemini\antigravity\brain\f783822d-6f29-49db-a4f6-278f466c568a\screenshots\` (`01`, `01b`, `02`, `02b`, `03`, `14`–`17d`, `22`, `24`, `31`, `31b`, `42`–`46b`).

### C. Brand Integrity (`DESIGN.md §23` & `§26`)
- `public/brand/` verified intact: `app-logo.svg`, `favicon.svg`, `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `maskable-icon-512x512.png`, `app-logo-1024.png`, and V3 auth assets under `public/brand/auth/` (`login-hero-stage-dark.png`, `login-lockup-3d.png`, `login-relay-grid-3d.png`, `login-relay-grid-3d-EXACT-LOOK.svg`). `0` PNGs modified by this swarm. *(Note re `§26`: the external handoff directory `SCRIPE_RELAY_VNEXT_CLAUDE_HANDOFF_SOURCE_FIDELITY` is not present inside this workspace on disk; asset presence and rendered dimensions were verified directly against `public/brand/` and live HTTP responses.)*

### D. Archify Single Source of Truth Registration (`.agents/rules/archify-docs-portal-ssot.md`)
- Published validated Archify explainer to `SCRIPE-Docs-Portal/public/archify-hub/frontend-design-system-transformation.html` (`1,181,642` bytes, `sha256: a909cce722187b54fa41daa28fe89021b29c2645abc6d6d92ad3b979ae6a4861`, source spec `SCRIPE-Docs-Portal/public/archify-hub/specs/frontend-design-system-transformation.archify.md`), verified with `check-render-output.mjs` (`"ok": true`, `"profile": "showcase"`, `"status": "pass"`, `0` errors, `0` warnings; native diagrams `relay-token-flow: pass` & `overlay-snap-seq: pass`).
- Registered under the `frontend` pillar in `SCRIPE-Docs-Portal/src/data/archify-catalog.ts` (`ARCHIFY_PILLAR_META.frontend.count` updated to `13`).
- `pnpm --dir SCRIPE-Docs-Portal exec tsc --noEmit` (`0`), `oxlint src/data/archify-catalog.ts` (`0`), and `scripe build docs` (`0` errors, `0` warnings, `/archify [LIVE]`) all passed.

---

## 5. Post-Report Closeout Gate (`#228`) & Concurrent External WIP Isolation

Re-verified by `@verifier` (`#228`, `22:53:59`) after all Phase G deliverables and Archify artifacts were written:

- **Overlay & Control Sequential Vitest (`--maxWorkers=1 --no-file-parallelism --reporter=dot`):** `floating-overlay-motion.test.tsx`, `controls-and-fields.test.tsx`, `date-picker.keyboard.test.tsx`, `creatable-combobox.test.tsx`, `NotificationBell.test.tsx` -> **`5/5` files passed, `36/36` tests passed (`0` failed, `0` skipped, `19.54s`)**.
- **Protected Zones:** `src/modules/venue/money/` = `0`, `src/modules/venue/operations-calendar/` = `0`, `public/` = `0`.
- **Concurrent External WIP Isolation (`SCRIPE-Frontend/src/modules/shared/profile/**` & `SCRIPE-Backend/**`):**
  - External edits outside this Swarm were observed actively mutating `shared/profile/**` between `22:17:15` and `22:52:36` (`44` modified/added/deleted entries including `profile.en.ts` at `22:52:10` and `profile.ar.ts` at `22:52:36`), plus `152` modified entries in `SCRIPE-Backend/`.
  - Global full-repo runs after `22:17` reflect that concurrent external WIP exclusively:
    - `tsc --noEmit`: `12/12` errors are inside `src/modules/shared/profile/core/**` (`0` errors in Phase G scope).
    - `scripe validate-locales`: `90` missing AR keys + `10` undefined keys are inside `shared/profile/core` (`0` missing/undefined in all other `107` pairs).
    - `scripe arch-check --target frontend --depth deep`: `2/2` criticals (`FE-V001`, `FE-V002`) are inside `shared/profile/core/.../SudoVerificationModal.tsx:19,20` (`0` criticals in Phase G scope).
  - Whole-repo final rebuild (`scripe build frontend`) should be re-run once the external `shared/profile` & backend session completes and stabilizes.

