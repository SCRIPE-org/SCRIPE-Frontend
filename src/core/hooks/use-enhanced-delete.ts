"use client"

import { useState } from "react"
import { useEnhancedToast } from "./use-enhanced-toast"

export interface DeleteOptions {
  itemName?: string
  itemType?: string
  confirmTitle?: string
  confirmDescription?: string
  successMessage?: string
  errorMessage?: string
  onSuccess?: () => void
  onError?: (error: any) => void
}

export function useEnhancedDelete() {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [deleteAction, setDeleteAction] = useState<(() => Promise<void>) | null>(null)
  const [deleteOptions, setDeleteOptions] = useState<DeleteOptions>({})
  const { operationSuccess, operationError } = useEnhancedToast()

  const confirmDelete = async (
    deleteFunction: () => Promise<void>,
    options: DeleteOptions = {}
  ) => {
    setDeleteAction(() => deleteFunction)
    setDeleteOptions(options)
    setShowConfirmation(true)
  }

  const executeDelete = async () => {
    if (!deleteAction) return

    setIsDeleting(true)
    setShowConfirmation(false)

    try {
      await deleteAction()
      
      // Show success toast
      const successMsg = deleteOptions.successMessage || 
        `${deleteOptions.itemType || 'Item'} deleted successfully`
      
      operationSuccess("Delete", deleteOptions.itemName)
      
      // Call success callback
      deleteOptions.onSuccess?.()
    } catch (error) {
      // Show error toast
      const errorMsg = deleteOptions.errorMessage || 
        `Failed to delete ${deleteOptions.itemType?.toLowerCase() || 'item'}`
      
      operationError("Delete", deleteOptions.itemName, errorMsg)
      
      // Call error callback
      deleteOptions.onError?.(error)
    } finally {
      setIsDeleting(false)
      setDeleteAction(null)
      setDeleteOptions({})
    }
  }

  const cancelDelete = () => {
    setShowConfirmation(false)
    setDeleteAction(null)
    setDeleteOptions({})
  }

  return {
    isDeleting,
    showConfirmation,
    deleteOptions,
    confirmDelete,
    executeDelete,
    cancelDelete,
  }
}
