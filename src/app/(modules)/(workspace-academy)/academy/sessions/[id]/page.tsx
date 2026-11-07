import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { SessionDetailView } from "@modules/academy/sessions";

export const metadata: Metadata = { title: "Academy Session Details" };

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ModuleErrorBoundary moduleName="academy.sessions.detail"><SessionDetailView id={id} /></ModuleErrorBoundary>;
}
