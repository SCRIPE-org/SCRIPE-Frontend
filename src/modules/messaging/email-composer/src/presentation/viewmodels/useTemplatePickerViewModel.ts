import { useQuery } from "@tanstack/react-query";
import type { IEmailRepository } from "../../domain/interfaces/IEmailRepository";

export interface UseTemplatePickerViewModelParams {
  repository: IEmailRepository;
}

export function useTemplatePickerViewModel({ repository }: UseTemplatePickerViewModelParams) {
  const { data, isLoading } = useQuery({
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
  };
}
