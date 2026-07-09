import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const ApiKeysView = dynamic(() =>
  import("@modules/integrations/apikeys").then((m) => ({ default: m.ApiKeysView }))
);

export const metadata: Metadata = {
  title: "API Keys | SCRIPE",
  description: "Generate and manage API Keys for programmatic integration access",
};

export default function ApiKeysPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="API Keys">
        <ApiKeysView />
      </ModuleErrorBoundary>
    </main>
  );
}
