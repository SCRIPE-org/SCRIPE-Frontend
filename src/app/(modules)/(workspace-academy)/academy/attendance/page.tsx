import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { AttendanceQueueView } from "@modules/academy/attendance/src/presentation/views/AttendanceQueueView";

export const metadata: Metadata = { title: "Academy Attendance" };

export default function AttendancePage() {
  return <ModuleErrorBoundary moduleName="academy.attendance"><AttendanceQueueView /></ModuleErrorBoundary>;
}
