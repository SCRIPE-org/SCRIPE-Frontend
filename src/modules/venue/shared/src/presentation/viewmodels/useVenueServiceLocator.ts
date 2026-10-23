import { getVenueContainer, type VenueContainer } from "@modules/venue/di";

/**
 * useVenueServiceLocator
 */
export function useVenueServiceLocator(): VenueContainer {
  return getVenueContainer();
}

/**
 * useVenueServiceLocatorStatic
 */
export const useVenueServiceLocatorStatic: VenueContainer = new Proxy({} as VenueContainer, {
  get(_target, prop) {
    const container = getVenueContainer();
    return container ? (container as any)[prop] : undefined;
  },
});
