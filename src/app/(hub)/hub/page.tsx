import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const HubTopBar = dynamic(() => import("@modules/home").then((m) => ({ default: m.HubTopBar })));

const WorkspaceHubView = dynamic(() =>
  import("@modules/home").then((m) => ({ default: m.WorkspaceHubView }))
);

/**
 * Hub page — standalone fullscreen workspace picker.
 * Shown to:
 * - Tenant admins with only module-workspace access (no admin workspace)
 * - Platform admins without admin workspace access
 *
 * Super admins and tenant admins with admin workspace access go directly
 * to the main dashboard "/" after login (backend-driven via AdminLoginCommandHandler).
 *
 * Metadata lives in this route group's layout.tsx — a single source, since this
 * page is the only real destination in the group besides activate-workspace.
 */
export default function HubPage() {
  return (
    <div className="flex min-h-screen flex-col bg-nx-ground">
      <HubTopBar />
      <div className="flex-1 overflow-y-auto">
        <ModuleErrorBoundary moduleName="workspaceHub.hubTitle">
          <WorkspaceHubView />
        </ModuleErrorBoundary>
      </div>
    </div>
  );
}
