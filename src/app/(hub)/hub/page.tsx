import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

export const metadata: Metadata = {
  title: "Workspace Hub | SCRIPE",
  description: "Select your workspace to get started",
};

const HubTopBar = dynamic(
  () => import("@modules/home").then((m) => ({ default: m.HubTopBar }))
);

const WorkspaceHubView = dynamic(
  () => import("@modules/home").then((m) => ({ default: m.WorkspaceHubView }))
);

/**
 * Hub page — standalone fullscreen workspace picker.
 * Shown to:
 * - Tenant admins with only module-workspace access (no admin workspace)
 * - Platform admins without admin workspace access
 *
 * Super admins and tenant admins with admin workspace access go directly
 * to the main dashboard "/" after login (backend-driven via AdminLoginCommandHandler).
 */
export default function HubPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0A0E1A 0%, #0D1225 60%, #0A0E1A 100%)",
      }}
    >
      <HubTopBar />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <ModuleErrorBoundary moduleName="Workspace Hub">
          <WorkspaceHubView />
        </ModuleErrorBoundary>
      </div>
    </div>
  );
}
