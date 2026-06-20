"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authContainer } from "@modules/auth/di";
import type { PasskeyEntity } from "../../domain/entities/PasskeyEntity";

/**
 * usePasskeyManagementViewModel — ViewModel hook for managing passkeys.
 *
 * Handles:
 * - Listing registered passkeys
 * - Registering new passkeys via WebAuthn browser API
 * - Renaming passkeys
 * - Deleting passkeys
 *
 * All logic is delegated to the PasskeyRepository via DI.
 */
export function usePasskeyManagementViewModel() {
  const { passkeyRepository } = authContainer;
  const queryClient = useQueryClient();

  // ── Local state ──────────────────────────────────────────
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // ── Query: List passkeys ────────────────────────────────
  const {
    data: passkeys = [],
    isLoading,
    error: listError,
    refetch,
  } = useQuery<PasskeyEntity[]>({
    queryKey: ["passkeys"],
    queryFn: () => passkeyRepository.getAll(),
    staleTime: 30_000,
  });

  // ── Mutation: Delete passkey ─────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => passkeyRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passkeys"] });
    },
  });

  // ── Mutation: Rename passkey ─────────────────────────────
  const renameMutation = useMutation({
    mutationFn: ({ id, newName }: { id: string; newName: string }) =>
      passkeyRepository.rename(id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passkeys"] });
      setRenamingId(null);
      setRenameValue("");
    },
  });

  // ── Register new passkey via WebAuthn ────────────────────
  const registerPasskey = useCallback(
    async (deviceName: string): Promise<boolean> => {
      setIsRegistering(true);
      setRegistrationError(null);

      try {
        // 1. Get WebAuthn options from backend
        const options = await passkeyRepository.beginRegistration();

        // 2. Prompt user via browser WebAuthn API
        const credential = (await navigator.credentials.create({
          publicKey: options,
        })) as PublicKeyCredential;

        if (!credential) {
          throw new Error("Passkey creation was cancelled or failed.");
        }

        const attestationResponse = credential.response as AuthenticatorAttestationResponse;

        // 3. Encode binary buffers to base64 for transport
        const rawIdBase64 = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
        const attestationObjectBase64 = btoa(
          String.fromCharCode(...new Uint8Array(attestationResponse.attestationObject))
        );
        const clientDataJSONBase64 = btoa(
          String.fromCharCode(...new Uint8Array(attestationResponse.clientDataJSON))
        );

        // 4. Complete registration on backend
        await passkeyRepository.completeRegistration(deviceName, {
          id: credential.id,
          rawId: rawIdBase64,
          type: credential.type,
          response: {
            attestationObject: attestationObjectBase64,
            clientDataJSON: clientDataJSONBase64,
          },
        });

        // 5. Refresh passkey list
        queryClient.invalidateQueries({ queryKey: ["passkeys"] });
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Passkey registration failed.";

        // Handle specific WebAuthn errors
        if (err instanceof DOMException) {
          if (err.name === "NotAllowedError") {
            setRegistrationError("Passkey creation was cancelled or not allowed.");
          } else if (err.name === "InvalidStateError") {
            setRegistrationError("A passkey already exists on this device.");
          } else {
            setRegistrationError(message);
          }
        } else {
          setRegistrationError(message);
        }
        return false;
      } finally {
        setIsRegistering(false);
      }
    },
    [passkeyRepository, queryClient]
  );

  // ── Start rename flow ────────────────────────────────────
  const startRename = useCallback((passkey: PasskeyEntity) => {
    setRenamingId(passkey.id);
    setRenameValue(passkey.deviceName);
  }, []);

  const cancelRename = useCallback(() => {
    setRenamingId(null);
    setRenameValue("");
  }, []);

  const confirmRename = useCallback(() => {
    if (renamingId && renameValue.trim()) {
      renameMutation.mutate({ id: renamingId, newName: renameValue.trim() });
    }
  }, [renamingId, renameValue, renameMutation]);

  return {
    // Data
    passkeys,
    isLoading,
    listError: listError ? String(listError) : null,

    // Registration
    registerPasskey,
    isRegistering,
    registrationError,
    clearRegistrationError: () => setRegistrationError(null),

    // Delete
    deletePasskey: deleteMutation.mutate,
    isDeletingPasskey: deleteMutation.isPending,

    // Rename
    startRename,
    cancelRename,
    confirmRename,
    renamingId,
    renameValue,
    setRenameValue,
    isRenaming: renameMutation.isPending,

    // Refresh
    refetch,

    // WebAuthn support detection
    isWebAuthnSupported: typeof window !== "undefined" && !!window.PublicKeyCredential,
  };
}
