/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { isSudoCancelledError } from "@core/store/useSudoStore";
import {
  useConfirmedAction,
  type ConfirmationVariant,
  type ConfirmedActionOptions,
} from "./use-confirmed-action";
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
  variant?: ConfirmationVariant;
  /** Custom confirm button text (defaults to 'Delete' for destructive, 'Confirm' for others) */
  confirmButtonText?: string;
}

type InternalDeleteConfirmationOptions = DeleteOptions & ConfirmedActionOptions;

/**
 * Extracts a human-readable backend/network message from a delete failure before falling back.
 */
export function extractDeleteErrorMessage(
  error: unknown,
  fallbackMessage?: string,
  itemType?: string
): string {
  const err = error as {
    message?: string;
    response?: { data?: { message?: string; error?: string } };
  };
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallbackMessage ||
    `Failed to delete ${itemType?.toLowerCase() || "item"}`
  );
}

/**
 * Confirmation hook dedicated exclusively to destructive delete flows, composing `useConfirmedAction`
 * with delete-specific success, error, and sudo-cancellation toast feedback.
 */
export function useEnhancedDelete() {
  const confirmation = useConfirmedAction<InternalDeleteConfirmationOptions>();
  const { t } = useI18n();
  const { operationSuccess, operationError, info: toastInfo } = useEnhancedToast();

  const confirmDelete = useCallback(
    async (deleteFunction: () => Promise<void>, options: DeleteOptions = {}) => {
      confirmation.requestConfirmation(deleteFunction, {
        ...options,
        title: options.confirmTitle,
        description: options.confirmDescription,
        onSuccess: () => {
          operationSuccess("Delete", options.itemName);
          options.onSuccess?.();
        },
        onError: (error) => {
          if (isSudoCancelledError(error)) {
            toastInfo?.({
              title: t("profile.sudo.cancelledTitle"),
              description: t("profile.sudo.cancelledDescription"),
            });
            options.onError?.(error);
            return;
          }

          const errorMsg = extractDeleteErrorMessage(
            error,
            options.errorMessage,
            options.itemType
          );
          operationError("Delete", options.itemName, errorMsg);
          options.onError?.(error);
        },
      });
    },
    [confirmation, operationSuccess, operationError, toastInfo, t]
  );

  return {
    isDeleting: confirmation.isPending,
    showConfirmation: confirmation.isOpen,
    deleteOptions: confirmation.options,
    confirmDelete,
    executeDelete: confirmation.execute,
    cancelDelete: confirmation.cancel,
  };
}
