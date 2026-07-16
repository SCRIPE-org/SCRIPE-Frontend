import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const OAuthAppDetailView = dynamic(() =>
  import("@modules/identity/oauth-apps").then((m) => ({ default: m.OAuthAppDetailView }))
);

export const metadata: Metadata = {
  title: "Create OAuth Application | SCRIPE",
  description: "Register a new third-party OAuth application",
};

export default function OAuthAppCreatePage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="OAuth App Create">
        <OAuthAppDetailView />
      </ModuleErrorBoundary>
    </main>
  );
}
