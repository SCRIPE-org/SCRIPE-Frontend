"use client";

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPartyKernelContainer } from "../../../../di";
import { PARTY_KERNEL_PERMISSIONS } from "../../../../permission-constants";
import { usePermission } from "@core/hooks/use-permission";
import type {
  CreatePersonParams,
  CreateOrganizationParams,
} from "../../domain/interfaces/IPartyRepository";
import type { Party } from "../../domain/entities/Party";
import type { MergeCandidate } from "../../../../merge-candidate/src/domain/entities/MergeCandidate";

/**
 * Aggregated statistics and recent contacts for the Contacts Overview page.
 */
export interface ContactsOverviewStats {
  totalContacts: number;
  peopleCount: number;
  organizationsCount: number;
  duplicateAlertsCount: number;
  recentContacts: Party[];
  mergeCandidates: MergeCandidate[];
}

/**
 * ViewModel for the Contacts Overview page (/party-kernel).
 * Adheres strictly to MVVM: View -> ViewModel -> Repository -> Service -> IApiService.
 */
export function useContactsOverviewViewModel() {
  const { partyRepository, mergeCandidateRepository } =
    getPartyKernelContainer();
  const queryClient = useQueryClient();

  const canPartiesCreate = usePermission(PARTY_KERNEL_PERMISSIONS.PARTY_CREATE);
  const canPersonCreate = usePermission(
    PARTY_KERNEL_PERMISSIONS.PARTY_PERSON_CREATE
  );
  const canOrgCreate = usePermission(
    PARTY_KERNEL_PERMISSIONS.PARTY_ORGANIZATION_CREATE
  );

  const permissions = {
    canCreatePerson: canPartiesCreate && canPersonCreate,
    canCreateOrganization: canPartiesCreate && canOrgCreate,
  };

  const [isCreatePersonOpen, setIsCreatePersonOpen] = useState(false);
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);

  const overviewQuery = useQuery<ContactsOverviewStats>({
    queryKey: ["party-overview-stats"],
    queryFn: async () => {
      const [recentRes, peopleRes, orgsRes, duplicatesRes] =
        await Promise.all([
          partyRepository.getAll({
            page: 1,
            pageSize: 6,
            sortBy: "newest",
          }),
          partyRepository.getAll({
            page: 1,
            pageSize: 1,
            type: "Person",
          }),
          partyRepository.getAll({
            page: 1,
            pageSize: 1,
            type: "Organization",
          }),
          mergeCandidateRepository
            .getAll({ page: 1, pageSize: 5 })
            .catch(() => ({ items: [], totalCount: 0 })),
        ]);

      return {
        totalContacts: recentRes.totalCount,
        peopleCount: peopleRes.totalCount,
        organizationsCount: orgsRes.totalCount,
        duplicateAlertsCount: duplicatesRes.totalCount,
        recentContacts: recentRes.items,
        mergeCandidates: duplicatesRes.items,
      };
    },
    staleTime: 15_000,
  });

  const invalidateAll = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["party-overview-stats"] }),
      queryClient.invalidateQueries({ queryKey: ["parties-directory"] }),
      queryClient.invalidateQueries({ queryKey: ["parties-stats-summary"] }),
    ]);
  }, [queryClient]);

  const handleCreatePerson = useCallback(
    async (input: CreatePersonParams) => {
      const id = await partyRepository.createPerson(input);
      await invalidateAll();
      setIsCreatePersonOpen(false);
      return id;
    },
    [partyRepository, invalidateAll]
  );

  const handleCreateOrganization = useCallback(
    async (input: CreateOrganizationParams) => {
      const id = await partyRepository.createOrganization(input);
      await invalidateAll();
      setIsCreateOrgOpen(false);
      return id;
    },
    [partyRepository, invalidateAll]
  );

  const data = overviewQuery.data;

  return {
    totalContacts: data?.totalContacts ?? 0,
    peopleCount: data?.peopleCount ?? 0,
    organizationsCount: data?.organizationsCount ?? 0,
    duplicateAlertsCount: data?.duplicateAlertsCount ?? 0,
    recentContacts: data?.recentContacts ?? [],
    mergeCandidates: data?.mergeCandidates ?? [],
    isLoading: overviewQuery.isLoading,
    isFetching: overviewQuery.isFetching,
    isError: overviewQuery.isError,
    refetch: overviewQuery.refetch,
    permissions,
    isCreatePersonOpen,
    setIsCreatePersonOpen,
    isCreateOrgOpen,
    setIsCreateOrgOpen,
    handleCreatePerson,
    handleCreateOrganization,
  };
}
