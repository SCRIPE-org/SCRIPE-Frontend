import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { OperationsCalendarView } from "@modules/venue/operations-calendar/src/presentation/views/OperationsCalendarView";

export const metadata: Metadata = {
  title: "Venue Operations Calendar",
  description: "Review resource occupancy and booking state across a venue day.",
};

export default function OperationsCalendarPage() {
  return (
    <ModuleErrorBoundary moduleName="operationsCalendar.title">
      <OperationsCalendarView />
    </ModuleErrorBoundary>
  );
}
