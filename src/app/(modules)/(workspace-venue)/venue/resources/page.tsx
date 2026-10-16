import { Metadata } from "next";
import { ResourcesWorkspaceView } from "@modules/venue/resources/src/presentation/views/ResourcesWorkspaceView";

export const metadata: Metadata = {
  title: "Courts & Fields | SCRIPE Venue",
  description: "Manage venue courts, fields, working hours, booking slots, and pricing.",
};

export default function VenueResourcesPage() {
  return <ResourcesWorkspaceView />;
}
