import { useQuery } from "@tanstack/react-query";
import { venueContainer } from "@modules/venue/di";

/**
 * Documentation for useSiteFormViewModel
 */
export function useSiteFormViewModel(enabled: boolean) {
  const { data: sites } = useQuery({
    queryKey: ["sites", "list"],
    queryFn: async () => {
      const response = await venueContainer.siteRepository.getAll({ page: 1, pageSize: 100 });
      return response.items;
    },
    enabled,
  });

  return {
    sites
  };
}
