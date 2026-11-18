"use client";

import { useState, useCallback } from "react";
import type { CrmLead } from "../../domain/models/crm-lead.types";

/** Manages modal, dialog, submission, and table selection state for useLeadsViewModel. */
export function useLeadModalState() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CrmLead | null>(null);
  const [viewItem, setViewItem] = useState<CrmLead | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAssignOwnerOpen, setIsAssignOwnerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSetIsCreateOpen = useCallback((open: boolean) => {
    setIsCreateOpen(open);
    if (!open) setSubmitError(null);
  }, []);

  return {
    selectedItems,
    setSelectedItems,
    isEditModalOpen,
    setIsEditModalOpen,
    viewModalOpen,
    setViewModalOpen,
    editingItem,
    viewItem,
    isCreateOpen,
    handleSetIsCreateOpen,
    isAssignOwnerOpen,
    setIsAssignOwnerOpen,
    isSubmitting,
    setIsSubmitting,
    submitError,
    setSubmitError,
    openEditModal: (item: CrmLead) => {
      setEditingItem(item);
      setIsEditModalOpen(true);
    },
    closeEditModal: () => {
      setIsEditModalOpen(false);
      setEditingItem(null);
    },
    openViewModal: (item: CrmLead) => {
      setViewItem(item);
      setViewModalOpen(true);
    },
    closeViewModal: () => {
      setViewModalOpen(false);
      setViewItem(null);
    },
  };
}
