/**
 * Token validation and compliance custom-fields loader hook for Account Setup.
 *
 * @module auth/account-setup/presentation/viewmodels
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { appLogger } from "@core/common/logger";
import { useServices } from "@core/providers/service-provider";
import type { SetupCustomField, SetupTokenInfo } from "../../domain/entities";
import type { PageState } from "./useAccountSetupViewModel";
import { extractAccountSetupApiError } from "../utils/account-setup-validation.utils";

/** Parameters accepted by `useAccountSetupTokenLoader`. */
export interface UseAccountSetupTokenLoaderParams {
  token: string;
  missingTokenMessage: string;
  invalidTokenMessage: string;
  validationFailedMessage: string;
  onProfileHydrated: (info: SetupTokenInfo) => void;
}

/**
 * Validates the setup invitation token on mount, hydrates initial profile metadata,
 * and loads dynamic compliance custom fields.
 */
export function useAccountSetupTokenLoader({
  token,
  missingTokenMessage,
  invalidTokenMessage,
  validationFailedMessage,
  onProfileHydrated,
}: UseAccountSetupTokenLoaderParams) {
  const { accountSetupRepository } = useServices();
  const [pageState, setPageState] = useState<PageState>(!token ? "invalid" : "loading");
  const [tokenData, setTokenData] = useState<SetupTokenInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>(!token ? missingTokenMessage : "");
  const [customFields, setCustomFields] = useState<SetupCustomField[]>([]);
  const [isLoadingCustomFields, setIsLoadingCustomFields] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>({});
  const [reloadNonce, setReloadNonce] = useState(0);

  const retryLoad = useCallback(() => {
    if (!token) return;
    setPageState("loading");
    setErrorMessage("");
    setReloadNonce((n) => n + 1);
  }, [token]);

  const setCustomFieldValue = useCallback((key: string, value: unknown) => {
    setCustomFieldValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    if (!token) return;
    void reloadNonce;

    let cancelled = false;

    async function validate() {
      try {
        const result = await accountSetupRepository.validateToken(token);
        if (cancelled) return;

        if (result.isValid) {
          setTokenData(result);
          onProfileHydrated(result);
          setPageState("valid");

          try {
            setIsLoadingCustomFields(true);
            const fields = await accountSetupRepository.getCustomFields(token);
            if (cancelled) return;
            setCustomFields(fields || []);
            const initialVals: Record<string, unknown> = {};
            for (const f of fields || []) {
              if (f.currentValue !== undefined && f.currentValue !== null) {
                initialVals[f.key] = f.currentValue;
              }
            }
            setCustomFieldValues(initialVals);
          } catch (fieldErr) {
            appLogger.warn("Failed to fetch setup custom fields:", fieldErr);
          } finally {
            if (!cancelled) setIsLoadingCustomFields(false);
          }
        } else {
          setPageState("invalid");
          setErrorMessage(result.error || result.errorMessage || invalidTokenMessage);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        setPageState("invalid");
        setErrorMessage(extractAccountSetupApiError(err, validationFailedMessage));
      }
    }

    void validate();
    return () => {
      cancelled = true;
    };
  }, [accountSetupRepository, invalidTokenMessage, onProfileHydrated, reloadNonce, token, validationFailedMessage]);

  return {
    pageState,
    setPageState,
    tokenData,
    errorMessage,
    setErrorMessage,
    customFields,
    isLoadingCustomFields,
    customFieldValues,
    setCustomFieldValue,
    retryLoad,
  };
}
