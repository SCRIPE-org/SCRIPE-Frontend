import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

// P5.4: Dynamic import with loading skeleton for code splitting
const PartyKernelListView = dynamic(() =>
  import("@modules/party-kernel/core/src/presentation/views/PartyKernelListView").then((m) => ({
    default: m.PartyKernelListView,
  }))
);

export const metadata: Metadata = {
  title: "PartyKernel | SCRIPE",
  description: "Manage PartyKernel",
};

export default function PartyKernelPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="PartyKernel">
        <PartyKernelListView />
      </ModuleErrorBoundary>
    </main>
  );
}