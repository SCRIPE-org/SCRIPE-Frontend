"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPartyKernelContainer } from "../../../../di";
import { PARTY_KERNEL_PERMISSIONS } from "../../../../permission-constants";
import { usePermission } from "@core/hooks/use-permission";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import type { PartyProfile } from "../../domain/entities/PartyProfile";
import type {
  AddContactPointParams,
  AddPartyRoleParams,
} from "../../domain/interfaces/IPartyRepository";

/**
 * Tabs available in the party profile workspace
 */
export type PartyProfileTab =
  | "overview"
  | "contacts"
  | "representatives"
  | "relationships"
  | "roles"
  | "history";

/**
 * Hook providing data, state, and actions for a single party profile workspace.
 * @param partyId The canonical encrypted party ID
 */
export function usePartyProfileViewModel(partyId: string) {
  const { partyRepository } = getPartyKernelContainer();
  const queryClient = useQueryClient();
  const { success, error: showError } = useEnhancedToast();
  const { t } = useI18n();

  // Tab State
  const [activeTab, setActiveTab] = useState<PartyProfileTab>("overview");

  // Dialog States
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [isAddRelationshipOpen, setIsAddRelationshipOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Permissions
  const canEditParty = usePermission(PARTY_KERNEL_PERMISSIONS.PARTY_UPDATE);
  const canDeleteParty = usePermission(PARTY_KERNEL_PERMISSIONS.PARTY_DELETE);
  const canManageContacts = usePermission(PARTY_KERNEL_PERMISSIONS.CONTACT_POINT_CREATE);
  const canManageRoles = usePermission(PARTY_KERNEL_PERMISSIONS.PARTY_ROLE_CREATE);
  const canManageRelationships = usePermission(
    PARTY_KERNEL_PERMISSIONS.PARTY_RELATIONSHIP_CREATE
  );
  const canViewHistory = usePermission(PARTY_KERNEL_PERMISSIONS.MERGE_CANDIDATE_VIEW);

  // Main Profile Query
  const profileQuery = useQuery({
    queryKey: ["party-profile", partyId],
    queryFn: async (): Promise<PartyProfile> => {
      return partyRepository.getProfile(partyId);
    },
    enabled: !!partyId,
    staleTime: 15_000,
  });

  // Mutations
  const updateNameMutation = useMutation({
    mutationFn: (displayName: string) =>
      partyRepository.updatePartyName(partyId, displayName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["party-profile", partyId] });
      queryClient.invalidateQueries({ queryKey: ["parties-directory"] });
      setIsEditNameOpen(false);
      success({
        title: t("party.toast.updated") || "Party updated successfully",
      });
    },
    onError: (err: Error) => {
      showError({
        title: t("common.error") || "Error",
        description: err.message || t("party.toast.errorUpdating") || "Failed to update name",
      });
    },
  });

  const addContactMutation = useMutation({
    mutationFn: (data: Omit<AddContactPointParams, "partyId">) =>
      partyRepository.addContactPoint({ partyId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["party-profile", partyId] });
      setIsAddContactOpen(false);
      success({
        title: t("party.toast.contactAdded") || "Contact method added",
      });
    },
    onError: (err: Error) => {
      showError({
        title: t("common.error") || "Error",
        description: err.message || t("party.toast.errorContact") || "Failed to add contact",
      });
    },
  });

  const removeContactMutation = useMutation({
    mutationFn: (contactId: string) => partyRepository.removeContactPoint(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["party-profile", partyId] });
      success({
        title: t("party.toast.contactRemoved") || "Contact method removed",
      });
    },
    onError: (err: Error) => {
      showError({
        title: t("common.error") || "Error",
        description: err.message || t("party.toast.errorContact") || "Failed to remove contact",
      });
    },
  });

  const addRoleMutation = useMutation({
    mutationFn: (data: Omit<AddPartyRoleParams, "partyId">) =>
      partyRepository.addRole({ partyId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["party-profile", partyId] });
      setIsAddRoleOpen(false);
      success({
        title: t("party.toast.roleAdded") || "Role assigned successfully",
      });
    },
    onError: (err: Error) => {
      showError({
        title: t("common.error") || "Error",
        description: err.message || t("party.toast.errorRole") || "Failed to assign role",
      });
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: (roleId: string) => partyRepository.removeRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["party-profile", partyId] });
      success({
        title: t("party.toast.roleRemoved") || "Role removed",
      });
    },
    onError: (err: Error) => {
      showError({
        title: t("common.error") || "Error",
        description: err.message || t("party.toast.errorRole") || "Failed to remove role",
      });
    },
  });

  const addRelationshipMutation = useMutation({
    mutationFn: (data: {
      targetPartyId: string;
      relationshipType: string;
      validFrom?: string;
      validTo?: string;
    }) =>
      partyRepository.addRelationship({
        sourcePartyId: partyId,
        targetPartyId: data.targetPartyId,
        relationshipType: data.relationshipType,
        validFrom: data.validFrom,
        validTo: data.validTo,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["party-profile", partyId] });
      setIsAddRelationshipOpen(false);
      success({
        title: t("party.toast.relAdded") || "Relationship established",
      });
    },
    onError: (err: Error) => {
      showError({
        title: t("common.error") || "Error",
        description:
          err.message || t("party.toast.errorRel") || "Failed to add relationship",
      });
    },
  });

  const removeRelationshipMutation = useMutation({
    mutationFn: (relId: string) => partyRepository.removeRelationship(relId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["party-profile", partyId] });
      success({
        title: t("party.toast.relRemoved") || "Relationship removed",
      });
    },
    onError: (err: Error) => {
      showError({
        title: t("common.error") || "Error",
        description:
          err.message || t("party.toast.errorRel") || "Failed to remove relationship",
      });
    },
  });

  const deletePartyMutation = useMutation({
    mutationFn: () => partyRepository.delete(partyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties-directory"] });
      setIsDeleteConfirmOpen(false);
      success({
        title: t("party.toast.deleted") || "Party deleted",
      });
    },
    onError: (err: Error) => {
      showError({
        title: t("common.error") || "Error",
        description: err.message || t("party.toast.errorDeleting") || "Failed to delete party",
      });
    },
  });

  return {
    profile: profileQuery.data ?? null,
    isLoading: profileQuery.isLoading,
    isFetching: profileQuery.isFetching,
    isError: profileQuery.isError,
    error: profileQuery.error as Error | null,
    refetch: profileQuery.refetch,

    // Tab
    activeTab,
    setActiveTab,

    // Dialog state
    isEditNameOpen,
    setIsEditNameOpen,
    isAddContactOpen,
    setIsAddContactOpen,
    isAddRoleOpen,
    setIsAddRoleOpen,
    isAddRelationshipOpen,
    setIsAddRelationshipOpen,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,

    // Actions
    handleUpdateName: (displayName: string) =>
      updateNameMutation.mutateAsync(displayName),
    isUpdatingName: updateNameMutation.isPending,

    handleAddContact: (data: Omit<AddContactPointParams, "partyId">) =>
      addContactMutation.mutateAsync(data),
    isAddingContact: addContactMutation.isPending,

    handleRemoveContact: (id: string) => removeContactMutation.mutateAsync(id),
    isRemovingContact: removeContactMutation.isPending,

    handleAddRole: (data: Omit<AddPartyRoleParams, "partyId">) =>
      addRoleMutation.mutateAsync(data),
    isAddingRole: addRoleMutation.isPending,

    handleRemoveRole: (id: string) => removeRoleMutation.mutateAsync(id),
    isRemovingRole: removeRoleMutation.isPending,

    handleAddRelationship: (data: {
      targetPartyId: string;
      relationshipType: string;
      validFrom?: string;
      validTo?: string;
    }) => addRelationshipMutation.mutateAsync(data),
    isAddingRelationship: addRelationshipMutation.isPending,

    handleRemoveRelationship: (id: string) =>
      removeRelationshipMutation.mutateAsync(id),
    isRemovingRelationship: removeRelationshipMutation.isPending,

    handleDeleteParty: () => deletePartyMutation.mutateAsync(),
    isDeletingParty: deletePartyMutation.isPending,

    // Permissions
    permissions: {
      canEditParty,
      canDeleteParty,
      canManageContacts,
      canManageRoles,
      canManageRelationships,
      canViewHistory,
    },
  };
}
