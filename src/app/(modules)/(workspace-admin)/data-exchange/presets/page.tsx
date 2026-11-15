import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const PresetsView = dynamic(() =>
  import("@modules/data-transfer").then((m) => ({ default: m.PresetsView }))
);

export const metadata: Metadata = {
  title: "SCRIPE Saved Mapping Presets",
  description:
    "Persisted column mapping templates for repeatable automated data intake",
};

/**
 * Route handler for /data-exchange/presets rendering the Presets View.
 */
export default function DataExchangePresetsPage() {
  return (
    <ModuleErrorBoundary moduleName="adminDataTransferPresets.title">
      <PresetsView />
    </ModuleErrorBoundary>
  );
}
