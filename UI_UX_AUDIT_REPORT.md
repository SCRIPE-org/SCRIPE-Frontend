# UI_UX_AUDIT_REPORT.md — Non-Implemented Findings & Deferred Backlog (`DESIGN.md §24`)

Per `SCRIPE-Frontend/DESIGN.md §24` (*"Non-implemented findings discovered during the migration are recorded in `UI_UX_AUDIT_REPORT.md`. Do not implement those suggestions without explicit approval."*), this report documents all architectural, UI/UX, asset, and runtime observations identified across the Phase A–G audits (`#7`–`#11`), Swarm reviews (`#115`, `#121`, `#168`–`#221`), and live Playwright QA (`#179`, `#199`, `#225`, `#226`) that were **intentionally left unimplemented** or held outside this Swarm's approved scope.

---

## 1. Live Runtime & Overlay Telemetry Findings (Round 3 Playwright `#225` / `#226`)

| ID | Area & Evidence | Observed Behavior | Severity | Why Deferred / Recommended Action |
|---|---|---|---|---|
| **AUD-01** | Standalone `AccountLayout` Animation Sync (`src/app/(account)/layout.tsx`, `src/app/(account)/account/layout.tsx`, `round3_results.json` `dossier_high_dark_ltr`) | `AccountLayout` does not invoke `useAdminSettingsSync()`. On standalone `/account/*` routes (e.g., `/account/dossier`), `<html data-animation>` stays at `"moderate"` (`--nx-t-micro: .14s`) even when user customization settings specify `"high"` (`0.22s`) or `"none"` (`0s`). In operational dashboard routes (`Overview`, `CRM`, `Data Exchange`), `data-animation` updates properly. | Low / Non-blocking | Out of scope for overlay motion fix (`#218`/`#219`); requires product approval to mount read-only/cached customization sync in `AccountLayout` without introducing extra unauthenticated calls. |
| **AUD-02** | First-Frame Intrinsic Size Settle on Custom Overlays (`src/core/ui/date-picker.tsx`, `src/core/ui/notification/NotificationBell.tsx`, `round3_results.json`) | While screen coordinates are locked (`coordDriftPx: 0`) and overlays do not slide across the viewport, `DatePicker` (`dp_moderate_dark_ltr`) recorded `frame0TransformOrigin: "160px 0px"` settling to `"169px 0px"` (`~9px` intrinsic width settle on calendar mount), and `NotificationBell` performs one `useIsomorphicLayoutEffect` `recalcPosition()` height settle while pinned to top. | Very Low / Cosmetic | Non-visible in user perception (`coordDriftPx: 0`); fixing intrinsic calendar width completely would require static fixed popover dimensions rather than content-driven sizing. |
| **AUD-03** | Account Preferences Inline Save vs Toast Feedback (`src/modules/shared/profile/.../AccountPreferencesView.tsx`, `#179`, `#225`) | Clicking `Save Changes` displays an inline `"Saved"` status indicator instead of triggering a floating `sileo-toast`, whereas test-toast triggers on Preferences verify matte Signal Lime pill actions cleanly (`rgb(11,13,16)` on `rgb(198,255,0)`). | Informational | Intentional/existing module UX in `shared/profile`; left untouched (and `shared/profile/**` is currently undergoing concurrent external work). |

---

## 2. Manifest & Token Metadata Consistency Observations

| ID | Area & Evidence | Observed Behavior | Severity | Recommended Follow-Up |
|---|---|---|---|---|
| **AUD-04** | PWA `manifest.json` Background/Theme Hex (`SCRIPE-Frontend/public/manifest.json:6-7`) | `public/manifest.json` specifies `"background_color": "#0D0D0E"` and `"theme_color": "#0D0D0E"`, whereas the evolved `--scripe-bg` / `--nx-ground` dark canvas token in `src/app/globals.css:341,4533` uses `#0B0D10` and `description` shows `"SCRIPE — Sports Operations OS"` (check UTF-8 dash encoding). | Low | Left untouched under conservative public/manifest asset handling; update to `#0B0D10` only on explicit sign-off. |
| **AUD-05** | External V3 Handoff CSV (`DESIGN.md §26`) | `DESIGN.md §26` references `SCRIPE_RELAY_VNEXT_CLAUDE_HANDOFF_SOURCE_FIDELITY/02_BRAND_ASSETS/SOURCE_ORIGINALS_MANIFEST.csv`, which is not stored inside this workspace on disk. | Informational | Keep external reference pack archived outside git or import a read-only checksum manifest if automated CI byte-verification is desired. |
| **AUD-06** | Light Theme `brand.ts` Accent Contrast Constant (`src/core/ui/tokens/brand.ts`) | `LIGHT_THEME.accentContrast` remains `#0B0D10` intentionally because `13` `signup/` consumers pair it with Signal Lime `gradientCta` (`#C6FF00`), while light-mode text accents consume `--nx-accent` / `--scripe-accent-text` (`#4C6200`) via CSS tokens. | Low | Documented as intentional dual-duty pairing (`#17`); avoid switching `LIGHT_THEME.accentContrast` without updating `signup/` CTA styles together. |

---

## 3. Shared Component Consolidation & Legacy Hygiene Backlog (Deferred per Scope)

| ID | Area & Evidence | Observed Behavior | Severity | Why Deferred |
|---|---|---|---|---|
| **AUD-07** | Parallel Image Upload Components (`src/core/ui/` `#10`) | `image-uploader.tsx` (`366L`) and `image-upload-field.tsx` (`332L`) coexist in `src/core/ui/` with overlapping responsibilities. | Low | Explicitly deferred to avoid breaking existing form schemas (`@core/ui/forms` consumers) without a dedicated refactor ticket. |
| **AUD-08** | View Modal in `GenericCrudView` (`src/core/crud/components/generic-crud-view.tsx`) | Read-only View Modal wraps content directly via `<Dialog><DialogContent>` without `<DialogDescription>` / `GenericModal`, unlike Create/Edit forms. | Low | Deferred; ensure `aria-describedby` / `<DialogDescription>` parity in a future CRUD polish pass. |
| **AUD-09** | Telemetry `Vercel` Script 404s When Offline/Self-Hosted (`#179 DEF-06`) | Routes referencing `/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js` return `404` when running locally outside Vercel Edge (`next start` on `:3000`). | Low | Expected outside Vercel deployment; gate via env flag (`NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS`) if desired for on-premise/Docker builds. |
| **AUD-10** | Repository Static Hygiene Warnings (`#217`, `#223`) | Full workspace static scans report `523` non-blocking `oxlint` warnings across `4,205` files, `134` `scripe arch-check` warnings across Backend/Frontend (`0` errors, `95/100`), and `8,699` unused locale "dead keys" (`scripe validate-locales`, `0` parity/undefined errors). | Low / Maintenance | Pre-existing across modules; bulk deletion of "dead keys" risks removing dynamically interpolated translation keys without manual audit. |

---

## 4. Protected Zones & Concurrent External Work Excluded from Swarm Edits

| Scope Path | Reason Excluded / Deferred | Known Observations Requiring Separate Owner Verification |
|---|---|---|
| `SCRIPE-Frontend/src/modules/venue/money/**` & `src/modules/venue/operations-calendar/**` | Protected active user WIP zone (`49` pre-existing git entries at Phase A–G; untouched by Swarm). | Phase A `#9` noted `ResourceTimeline.tsx:89,121` (`left-0`, `border-r`) and `ClickToBookModal.tsx:75-76` physical `"left"/"right"` Sheet sides; left for module owner. |
| `SCRIPE-Frontend/src/modules/shared/profile/**` | Active external edits began at `22:17:15` on `2026-11-15` (observed still modifying files at `22:44:55`) outside this Swarm. | Requires full post-settlement `tsc --noEmit`, `oxlint`, `scripe validate-locales`, `scripe arch-check`, Vitest, and `scripe build frontend` verification once the external author completes edits. |
| `SCRIPE-Backend/**` | Protected outside Frontend transformation scope (`0` backend files modified by Swarm). | Phase A `#11` noted backend `ListDataTransferJobsQuery` lacks `kind` filter, sorting parameters, and authoritative global KPI breakdown (`Queued`, `Running`, `Completed`, `CompletedWithErrors`, `Failed`, `Cancelled`). |
| Live `:5035` End-to-End API Integration | `:5035` backend service was offline during Round 1–3 Playwright QA (`#179`, `#199`, `#225`). | Public routes (`/login`, `/signup`, `/forgot-password`, `/not-authorized`) were verified 100% unmocked; authenticated shell screens used Playwright route fixtures (`**/api/**`) and require full live-API UAT when `:5035` is running. |
