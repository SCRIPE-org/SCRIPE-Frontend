"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPartyKernelContainer } from "../../../../di";
import { PARTY_KERNEL_PERMISSIONS } from "../../../../permission-constants";
import { usePermission } from "@core/hooks/use-permission";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import type { PartyProfile } from "../../domain/entities/PartyProfile";
import type { ContactPoint } from "../../../../contact-point/src/domain/entities/ContactPoint";
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
 * Payload for updating a Party's profile and subtype attributes.
 */
export interface UpdatePartyProfilePayload {
  displayName: string;
  fullName?: string;
  givenName?: string;
  middleNames?: string;
  familyName?: string;
  dateOfBirth?: string | null;
  isMinor?: boolean;
  legalName?: string;
  taxId?: string | null;
  rowVersion?: string | null;
}

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
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactPoint | null>(null);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [isAddRelationshipOpen, setIsAddRelationshipOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [relatedPartiesMap, setRelatedPartiesMap] = useState<
    Record<string, { displayName: string; type: string }>
  >({});

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

  // Resolve human-readable names for related parties in relationships and merge candidates
  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile || typeof partyRepository.getById !== "function") return;

    const otherIds = new Set<string>();
    for (const rel of profile.relationships ?? []) {
      const otherId = rel.sourcePartyId === partyId ? rel.targetPartyId : rel.sourcePartyId;
      if (otherId && otherId !== partyId) {
        otherIds.add(otherId);
      }
    }
    for (const mc of profile.mergeCandidates ?? []) {
      const otherId = mc.primaryPartyId === partyId ? mc.duplicatePartyId : mc.primaryPartyId;
      if (otherId && otherId !== partyId) {
        otherIds.add(otherId);
      }
    }

    if (otherIds.size === 0) return;

    let cancelled = false;
    Promise.allSettled(
      Array.from(otherIds).map(async (id) => {
        const party = await partyRepository.getById(id);
        return { id, displayName: party.displayName, type: party.type };
      })
    ).then((results) => {
      if (cancelled) return;
      const nextMap: Record<string, { displayName: string; type: string }> = {};
      for (const r of results) {
        if (r.status === "fulfilled" && r.value.displayName) {
          nextMap[r.value.id] = {
            displayName: r.value.displayName,
            type: r.value.type,
          };
        }
      }
      setRelatedPartiesMap((prev) => ({ ...prev, ...nextMap }));
    });

    return () => {
      cancelled = true;
    };
  }, [profileQuery.data, partyId, partyRepository]);

  // Mutations
  const updateNameMutation = useMutation({
    mutationFn: (param: string | UpdatePartyProfilePayload) => {
      const displayName = typeof param === "string" ? param : param.displayName;
      const fullName = typeof param === "object" ? param.fullName : undefined;
      const explicitRowVersion = typeof param === "object" ? param.rowVersion : undefined;
      const party = profileQuery.data?.party;
      const type = party?.type;
      const rowVersion =
        explicitRowVersion !== undefined ? explicitRowVersion : profileQuery.data?.rowVersion;

      if (typeof param === "object") {
        const hasExtendedPersonFields =
          param.dateOfBirth !== undefined ||
          param.isMinor !== undefined ||
          param.givenName !== undefined ||
          param.middleNames !== undefined ||
          param.familyName !== undefined;

        if (
          type === "Person" &&
          hasExtendedPersonFields &&
          typeof partyRepository.updatePerson === "function"
        ) {
          return partyRepository.updatePerson(partyId, {
            fullName: fullName || profileQuery.data?.fullName || displayName,
            displayName,
            givenName: param.givenName,
            middleNames: param.middleNames,
            familyName: param.familyName,
            dateOfBirth: param.dateOfBirth,
            isMinor: param.isMinor,
            rowVersion: rowVersion ?? null,
          });
        }

        const hasExtendedOrgFields =
          param.legalName !== undefined || param.taxId !== undefined;

        if (
          type === "Organization" &&
          hasExtendedOrgFields &&
          typeof partyRepository.updateOrganization === "function"
        ) {
          return partyRepository.updateOrganization(partyId, {
            legalName: param.legalName || profileQuery.data?.legalName || displayName,
            displayName,
            taxId: param.taxId,
            rowVersion: rowVersion ?? null,
          });
        }
      }

      return partyRepository.updatePartyName(partyId, displayName, {
        type,
        fullName,
        ...(rowVersion !== undefined && rowVersion !== null ? { rowVersion } : {}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["party-profile", partyId] });
      queryClient.invalidateQueries({ queryKey: ["parties-directory"] });
      setIsEditNameOpen(false);
      success({
        title: t("party.toast.updated") || "Party updated successfully",
      });
    },
    onError: (err: Error) => {
      const typedErr = err as Error & {
        status?: number;
        details?: { statusCode?: number; errorCode?: string };
      };
      const isConflict =
        typedErr.status === 409 ||
        typedErr.details?.statusCode === 409 ||
        typedErr.details?.errorCode === "ENTITY_CONCURRENCY_CONFLICT" ||
        /changed after it was read|modified by another|concurrency|conflict/i.test(
          err.message || ""
        );
      if (isConflict) {
        queryClient.invalidateQueries({ queryKey: ["party-profile", partyId] });
        queryClient.invalidateQueries({ queryKey: ["parties-directory"] });
      }
      showError({
        title: isConflict
          ? t("party.toast.concurrencyConflict") || "Concurrent modification detected"
          : t("common.error") || "Error",
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

  const updateContactMutation = useMutation({
    mutationFn: (data: { id: string; type: string; value: string; isPrimary?: boolean }) =>
      partyRepository.updateContactPoint(data.id, {
        partyId,
        type: data.type,
        value: data.value,
        isPrimary: data.isPrimary,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["party-profile", partyId] });
      setIsEditContactOpen(false);
      setEditingContact(null);
      success({
        title: t("party.toast.contactUpdated") || "Contact method updated",
      });
    },
    onError: (err: Error) => {
      showError({
        title: t("common.error") || "Error",
        description: err.message || t("party.toast.errorContact") || "Failed to update contact",
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
    relatedPartiesMap,
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
    isEditContactOpen,
    setIsEditContactOpen,
    editingContact,
    setEditingContact,
    isAddRoleOpen,
    setIsAddRoleOpen,
    isAddRelationshipOpen,
    setIsAddRelationshipOpen,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,

    handleUpdateName: (
      param: string | UpdatePartyProfilePayload,
      maybeDisplayName?: string,
      options?: Omit<UpdatePartyProfilePayload, "displayName">
    ) => {
      if (typeof param === "string" && typeof maybeDisplayName === "string") {
        return updateNameMutation.mutateAsync({
          displayName: maybeDisplayName,
          ...options,
        });
      }
      return updateNameMutation.mutateAsync(param);
    },
    isUpdatingName: updateNameMutation.isPending,

    handleAddContact: (data: Omit<AddContactPointParams, "partyId">) =>
      addContactMutation.mutateAsync(data),
    isAddingContact: addContactMutation.isPending,

    handleUpdateContact: (data: { id: string; type: string; value: string; isPrimary?: boolean }) =>
      updateContactMutation.mutateAsync(data),
    isUpdatingContact: updateContactMutation.isPending,

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
