/* eslint-disable @typescript-eslint/no-explicit-any */
import { venueContainer } from "@modules/venue/di";

export function useSiteMutations() {
  const createSite = async (data: any) => {
    return await venueContainer.siteRepository.create(data);
  };
  
  const updateSite = async (id: string, data: any) => {
    return await venueContainer.siteRepository.update(id, data);
  };
  
  return { createSite, updateSite };
}
