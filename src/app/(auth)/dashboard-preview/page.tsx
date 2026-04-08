/**
 * Dashboard Preview Page — Isolated dashboard layout preview for the Customizer Studio.
 *
 * This page sits under (auth) so it has NO DashboardLayout wrapper and NO auth guard.
 * The DashboardPreviewShell renders the real layout components directly with mock content,
 * receiving settings via postMessage from the Customizer Studio parent window.
 *
 * Pattern mirrors: /studio-preview → LoginPreviewShell (login page preview)
 */
import { DashboardPreviewShell } from "@/modules/identity/customization/src/presentation/components/DashboardPreviewShell";

export default function DashboardPreviewPage() {
  return <DashboardPreviewShell />;
}
