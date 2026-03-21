import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const CustomizerStudioView = dynamic(
  () => import("@modules/system/customizer-studio/src/presentation/views/CustomizerStudioView").then((m) => ({ default: m.CustomizerStudioView }))
);

export const metadata: Metadata = {
  title: "Login Customizer Studio | NEXORA",
  description: "Customize your tenant's login page with live preview",
};

export default function CustomizerPage() {
  return (
    <ModuleErrorBoundary moduleName="Customizer Studio">
      <CustomizerStudioView />
    </ModuleErrorBoundary>
  );
}
