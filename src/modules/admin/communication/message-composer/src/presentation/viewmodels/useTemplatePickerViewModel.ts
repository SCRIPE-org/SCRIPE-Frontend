import { useQuery } from "@tanstack/react-query";
import type { IEmailRepository } from "../../domain/interfaces/IEmailRepository";

/**
 * Interface defining property specifications, keys types, and structural contract rules for use template picker view model params.
 */
export interface UseTemplatePickerViewModelParams {
  repository: IEmailRepository;
}

/**
 * React hook/ViewModel orchestrating state and data flows for template picker view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useTemplatePickerViewModel({ repository }: UseTemplatePickerViewModelParams) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["email-templates-list"],
    queryFn: async () => {
      const result = await repository.getEmailTemplates({ page: 1, pageSize: 100 });
      return result.items.filter((tpl) => tpl.isActive);
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    templates: data ?? [],
    isLoading,
    isError,
    refetch,
  };
}
