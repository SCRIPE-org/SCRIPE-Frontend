import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { PartyProfileView } from "@modules/party-kernel/party/src/presentation/views/PartyProfileView";

export const metadata: Metadata = {
  title: "Party Profile | SCRIPE",
  description: "Comprehensive party identity, contacts, roles, and relationships.",
};

interface PartyProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function PartyProfilePage({ params }: PartyProfilePageProps) {
  const { id } = await params;

  return (
    <ModuleErrorBoundary moduleName="party.profile.title">
      <PartyProfileView partyId={id} />
    </ModuleErrorBoundary>
  );
}
