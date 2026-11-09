import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { SessionsListView } from "@modules/academy/sessions";

export const metadata: Metadata = { title: "Academy Training Sessions" };

export default function SessionsPage() {
  return <ModuleErrorBoundary moduleName="academy.sessions"><SessionsListView /></ModuleErrorBoundary>;
}
