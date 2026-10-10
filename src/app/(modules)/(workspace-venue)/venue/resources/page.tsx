import { Metadata } from "next";
import { ResourcesWorkspaceView } from "@modules/venue/resources/src/presentation/views/ResourcesWorkspaceView";

export const metadata: Metadata = {
  title: "Courts & Spaces | SCRIPE Venue",
  description: "Manage venue courts, spaces, working hours, booking slots, and pricing.",
};

export default function VenueResourcesPage() {
  return <ResourcesWorkspaceView />;
}
