/* eslint-disable @typescript-eslint/no-explicit-any, unused-imports/no-unused-vars */
"use client";

import { useState } from "react";
import { useEnhancedToast } from "./use-enhanced-toast";

export interface DeleteOptions {
  itemName?: string;
  itemType?: string;
  confirmTitle?: string;
  confirmDescription?: string;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  /** Dialog variant: destructive (red/trash), warning, info, or default (green/check) */
  variant?: "destructive" | "warning" | "info" | "default";
  /** Custom confirm button text (defaults to 'Delete' for destructive, 'Confirm' for others) */
  confirmButtonText?: string;
}

export function useEnhancedDelete() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteAction, setDeleteAction] = useState<(() => Promise<void>) | null>(null);
  const [deleteOptions, setDeleteOptions] = useState<DeleteOptions>({});
  const { operationSuccess, operationError } = useEnhancedToast();

  const confirmDelete = async (
    deleteFunction: () => Promise<void>,
    options: DeleteOptions = {}
  ) => {
    setDeleteAction(() => deleteFunction);
    setDeleteOptions(options);
    setShowConfirmation(true);
  };

  const executeDelete = async () => {
    if (!deleteAction) return;

    setIsDeleting(true);
    setShowConfirmation(false);

    try {
      await deleteAction();

      // Show success toast
      const successMsg =
        deleteOptions.successMessage || `${deleteOptions.itemType || "Item"} deleted successfully`;

      operationSuccess("Delete", deleteOptions.itemName);

      // Call success callback
      deleteOptions.onSuccess?.();
    } catch (error) {
      // F2: surface the real backend/caught error instead of discarding it.
      // Same bug class and same fix shape as F-78/F-98/F-99 in
      // useGenericMutations.ts — read the real message off the caught error
      // first, and only fall back to a caller override / generic string when
      // the error carries nothing usable.
      const err = error as {
        message?: string;
        response?: { data?: { message?: string; error?: string } };
      };
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        deleteOptions.errorMessage ||
        `Failed to delete ${deleteOptions.itemType?.toLowerCase() || "item"}`;

      operationError("Delete", deleteOptions.itemName, errorMsg);

      // Call error callback
      deleteOptions.onError?.(error);
    } finally {
      setIsDeleting(false);
      setDeleteAction(null);
      setDeleteOptions({});
    }
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setDeleteAction(null);
    setDeleteOptions({});
  };

  return {
    isDeleting,
    showConfirmation,
    deleteOptions,
    confirmDelete,
    executeDelete,
    cancelDelete,
  };
}
