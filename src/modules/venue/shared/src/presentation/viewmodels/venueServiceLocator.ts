
import { getVenueContainer, venueContainer } from "@modules/venue/di";

export function getVenueLocator() {
  return getVenueContainer();
}

export const venueLocator = venueContainer;

