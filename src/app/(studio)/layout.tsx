/**
 * Studio Layout — Minimal wrapper for full-screen studio pages.
 * Does NOT use DashboardLayout — the studio IS the full viewport.
 * Only wraps with essential providers (auth, i18n, theme).
 */
import { AppProvider } from "@core/providers/app-provider";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}
