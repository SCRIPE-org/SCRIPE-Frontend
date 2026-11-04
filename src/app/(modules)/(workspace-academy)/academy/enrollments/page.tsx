import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { AcademyEnrollmentsView } from "@modules/academy/enrollments/src/presentation/views/AcademyEnrollmentsView";

export const metadata: Metadata = {
  title: "Academy Governed Enrollments",
  description: "Manage athlete enrollments, atomic capacity reservation, and finance handoff.",
};

export default function EnrollmentsPage() {
  return (
    <ModuleErrorBoundary moduleName="academy.enrollments">
      <AcademyEnrollmentsView />
    </ModuleErrorBoundary>
  );
}
