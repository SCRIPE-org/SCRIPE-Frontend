"use client";

import React, { memo } from "react";
import type { Party } from "../../domain/entities/Party";
import type { usePartyDirectoryViewModel } from "../viewmodels/usePartyDirectoryViewModel";
import { CreatePersonDialog } from "./dialogs/CreatePersonDialog";
import { CreateOrganizationDialog } from "./dialogs/CreateOrganizationDialog";
import { EditPartyDialog } from "./dialogs/EditPartyDialog";
import { DeletePartyDialog } from "./dialogs/DeletePartyDialog";
import { PartyQuickPreviewSheet } from "./PartyQuickPreviewSheet";
import { QuickContactLookupDialog } from "./dialogs/QuickContactLookupDialog";

export interface PartyDirectoryDialogsProps {
  vm: ReturnType<typeof usePartyDirectoryViewModel>;
  isQuickLookupOpen: boolean;
  onQuickLookupOpenChange: (open: boolean) => void;
  onNavigateToProfile: (partyId: string) => void;
}

/**
 * Encapsulated dialog and sheet mounts for PartyDirectoryView.
 */
export const PartyDirectoryDialogs = memo(function PartyDirectoryDialogs({
  vm,
  isQuickLookupOpen,
  onQuickLookupOpenChange,
  onNavigateToProfile,
}: PartyDirectoryDialogsProps) {
  return (
    <>
      <CreatePersonDialog
        open={vm.isCreatePersonOpen}
        onOpenChange={vm.setIsCreatePersonOpen}
        onSubmit={vm.handleCreatePerson}
        onSuccessNavigate={onNavigateToProfile}
        existingPartyNames={vm.parties.map((p) => p.displayName)}
      />
      <CreateOrganizationDialog
        open={vm.isCreateOrgOpen}
        onOpenChange={vm.setIsCreateOrgOpen}
        onSubmit={vm.handleCreateOrganization}
        onSuccessNavigate={onNavigateToProfile}
      />
      <EditPartyDialog
        party={vm.editingParty}
        profile={vm.editingPartyProfile}
        initialFullName={vm.editingPartyFullName}
        open={!!vm.editingParty}
        onOpenChange={(open) => !open && vm.setEditingParty(null)}
        onSubmit={vm.handleUpdateName}
      />
      <DeletePartyDialog
        party={vm.deletingParty}
        open={!!vm.deletingParty}
        onOpenChange={(open) => !open && vm.setDeletingParty(null)}
        onConfirm={vm.handleDelete}
      />
      <PartyQuickPreviewSheet
        party={vm.previewParty}
        profile={vm.previewPartyProfile}
        open={!!vm.previewParty}
        onOpenChange={(open) => !open && vm.setPreviewParty(null)}
        onNavigateToProfile={onNavigateToProfile}
        onEditParty={(party: Party) => {
          vm.setPreviewParty(null);
          vm.setEditingParty(party);
        }}
      />
      <QuickContactLookupDialog
        open={isQuickLookupOpen}
        onOpenChange={onQuickLookupOpenChange}
        onSelectContact={onNavigateToProfile}
      />
    </>
  );
});
