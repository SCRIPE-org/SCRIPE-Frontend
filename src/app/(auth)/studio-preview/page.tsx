/**
 * Studio Preview Page — Isolated login page preview for the Customizer Studio
 *
 * This page has NO auth logic. It renders the login UI visuals
 * and receives design token updates via postMessage from the studio.
 */
import { LoginPreviewShell } from "@modules/system/customization/src/presentation/components/LoginPreviewShell";

export default function StudioPreviewPage() {
  return <LoginPreviewShell />;
}
