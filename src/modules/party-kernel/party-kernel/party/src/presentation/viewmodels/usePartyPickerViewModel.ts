"use client";

import { useQuery } from "@tanstack/react-query";
import { getPartyKernelContainer } from "../../../../di";
import type {
  CreatePersonParams,
  CreateOrganizationParams,
} from "../../domain/interfaces/IPartyRepository";

/**
 * Parameters for initializing the PartyPicker viewmodel hook.
 */
export interface UsePartyPickerViewModelParams {
  debouncedSearch: string;
  typeFilter: "all" | "Person" | "Organization";
  isOpen: boolean;
}

/**
 * ViewModel hook for the PartyPicker lookup combobox.
 * Encapsulates repository lookup queries and quick-creation mutations.
 */
export function usePartyPickerViewModel({
  debouncedSearch,
  typeFilter,
  isOpen,
}: UsePartyPickerViewModelParams) {
  const { partyRepository } = getPartyKernelContainer();

  const lookupQuery = useQuery({
    queryKey: ["party-picker-lookup", debouncedSearch, typeFilter],
    queryFn: () =>
      partyRepository.lookupContacts({
        search: debouncedSearch.trim() || undefined,
        type: typeFilter,
        page: 1,
        pageSize: 20,
      }),
    enabled: isOpen,
    staleTime: 10_000,
  });

  const createPerson = async (params: CreatePersonParams): Promise<string> => {
    return partyRepository.createPerson(params);
  };

  const createOrganization = async (params: CreateOrganizationParams): Promise<string> => {
    return partyRepository.createOrganization(params);
  };

  return {
    data: lookupQuery.data,
    isLoading: lookupQuery.isLoading,
    queryError: lookupQuery.error,
    refetch: lookupQuery.refetch,
    createPerson,
    createOrganization,
  };
}
