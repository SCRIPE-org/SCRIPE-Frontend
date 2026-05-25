import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const HomeView = dynamic(
  () => import("@modules/home").then((m) => ({ default: m.HomeView }))
);

export const metadata: Metadata = {
  title: "Dashboard | NEXORA",
  description: "Your NEXORA administration dashboard",
};

export default function HomePage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Dashboard">
        <HomeView />
      </ModuleErrorBoundary>
    </main>
  );
}
