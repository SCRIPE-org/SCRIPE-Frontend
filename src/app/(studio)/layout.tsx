/**
 * Studio Layout — Minimal wrapper for full-screen studio pages.
 * Does NOT use DashboardLayout — the studio IS the full viewport.
 *
 * IMPORTANT: Do NOT wrap in AppProvider here — the root layout (app/layout.tsx)
 * already provides it. Double-wrapping causes two SettingsProviders to race on
 * the same DOM, duplicate auto-save effects, and duplicate data-attribute writes.
 *
 * We DO mount TenantBrandingProvider so Layer 3 (tenant defaults) is populated
 * when the studio loads directly (e.g. via bookmark to /customizer).
 */
import { TenantBrandingProvider } from "@core/providers/tenant-branding-provider";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <TenantBrandingProvider>{children}</TenantBrandingProvider>;
}
