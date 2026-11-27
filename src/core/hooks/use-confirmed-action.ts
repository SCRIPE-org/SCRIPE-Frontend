"use client";

import { useCallback, useRef, useState } from "react";
import { isSudoCancelledError } from "@core/store/useSudoStore";

export type ConfirmationVariant = "destructive" | "warning" | "info" | "default";

export interface ConfirmedActionOptions {
  title?: string;
  description?: string;
  variant?: ConfirmationVariant;
  confirmButtonText?: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

/**
 * Generic async action confirmation state machine.
 * Owns only dialog open/loading/retry lifecycle and never emits domain-specific toasts.
 */
export function useConfirmedAction<
  TOptions extends ConfirmedActionOptions = ConfirmedActionOptions,
>() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);
  const [options, setOptions] = useState<TOptions>({} as TOptions);
  const invocationIdRef = useRef(0);

  const requestConfirmation = useCallback(
    (action: () => Promise<void>, nextOptions: TOptions = {} as TOptions) => {
      invocationIdRef.current += 1;
      setIsPending(false);
      setPendingAction(() => action);
      setOptions(nextOptions);
      setIsOpen(true);
    },
    []
  );

  const execute = useCallback(async () => {
    if (!pendingAction) return;

    const currentInvocation = invocationIdRef.current;
    const currentOptions = options;
    setIsPending(true);
    let preserveForRetry = false;

    try {
      await pendingAction();
      if (invocationIdRef.current === currentInvocation) {
        setIsOpen(false);
      }
      currentOptions.onSuccess?.();
    } catch (error) {
      if (isSudoCancelledError(error)) {
        preserveForRetry = true;
        currentOptions.onError?.(error);
        return;
      }

      if (invocationIdRef.current === currentInvocation) {
        setIsOpen(false);
      }
      currentOptions.onError?.(error);
    } finally {
      if (invocationIdRef.current === currentInvocation) {
        setIsPending(false);
        if (!preserveForRetry) {
          setPendingAction(null);
          setOptions({} as TOptions);
        }
      }
    }
  }, [pendingAction, options]);

  const cancel = useCallback(() => {
    invocationIdRef.current += 1;
    setIsOpen(false);
    setIsPending(false);
    setPendingAction(null);
    setOptions({} as TOptions);
  }, []);

  return {
    isOpen,
    isPending,
    options,
    requestConfirmation,
    execute,
    cancel,
  };
}
