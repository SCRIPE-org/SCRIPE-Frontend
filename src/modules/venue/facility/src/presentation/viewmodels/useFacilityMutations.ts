import { venueContainer } from "@modules/venue/di";

/**
 * Documentation for useFacilityMutations
 */
export function useFacilityMutations() {
  return {
    getVenueProfiles: async () => {
      return venueContainer.venueProfileRepository.getAll({ page: 1, pageSize: 100 });
    },
    createFacility: async (payload: {
      venueProfileId: string;
      code: string;
      name: string;
      description?: string;
    }) => {
      return venueContainer.facilityRepository.create(payload);
    },
  };
}
