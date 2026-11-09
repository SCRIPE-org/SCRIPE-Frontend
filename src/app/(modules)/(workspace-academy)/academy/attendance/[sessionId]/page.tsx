import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { AttendanceRegisterView } from "@modules/academy/attendance/src/presentation/views/AttendanceRegisterView";

export const metadata: Metadata = { title: "Academy Attendance Register" };

export default async function AttendanceRegisterPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return <ModuleErrorBoundary moduleName="academy.attendance.register"><AttendanceRegisterView sessionId={sessionId} /></ModuleErrorBoundary>;
}
