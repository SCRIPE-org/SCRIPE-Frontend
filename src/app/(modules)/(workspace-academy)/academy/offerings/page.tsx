import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { ProgramOfferingsView } from "@modules/academy/offerings";

export const metadata: Metadata = {
  title: "Academy Program Offerings",
  description: "Schedule seasonal program delivery across operational branches.",
};

export default function OfferingsPage() {
  return (
    <ModuleErrorBoundary moduleName="academy.offerings">
      <ProgramOfferingsView />
    </ModuleErrorBoundary>
  );
}
