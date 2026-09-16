import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { VenueAttentionView } from "@modules/venue/attention-center/src/presentation/views/VenueAttentionView";

export const metadata: Metadata = { title: "Venue Attention Center", description: "Truthful operational signals for Venue resources." };

export default function VenueAttentionPage() {
  return <ModuleErrorBoundary moduleName="attention.title"><VenueAttentionView /></ModuleErrorBoundary>;
}
