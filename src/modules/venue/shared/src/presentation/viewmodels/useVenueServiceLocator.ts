import { getVenueContainer, venueContainer } from "@modules/venue/di";

/**
 * useVenueServiceLocator
 */
export function useVenueServiceLocator() {
  return getVenueContainer();
}

/**
 * useVenueServiceLocatorStatic
 */
export const useVenueServiceLocatorStatic = venueContainer;
