import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const OAuthAppsView = dynamic(() =>
  import("@modules/identity/oauth-apps").then((m) => ({
    default: m.OAuthAppsView,
  }))
);

export const metadata: Metadata = {
  title: "OAuth Applications | SCRIPE",
  description: "Manage third-party applications that authenticate via SCRIPE (OIDC Server)",
};

export default function OAuthAppsPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="OAuth Applications">
        <OAuthAppsView />
      </ModuleErrorBoundary>
    </main>
  );
}
