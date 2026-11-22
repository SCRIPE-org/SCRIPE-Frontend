"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { container } from "@modules/profile/di";
import {
  registerPasskey,
  type AuthenticatorMode,
} from "@core/services/webauthn.service";
import type { PasskeyRegistrationMode } from "../../domain/interfaces/ISecurityRepository";
import { ensureSudoElevation } from "../utils/sudoElevation";
import { sovereignAccountKeys } from "./useSovereignAccountSlicesViewModel";

/**
 * Internal hook isolating passkey enrollment, deletion, and rename mutations
 * for {@link useSecurityVaultViewModel}.
 */
export function useSecurityPasskeyActions(passkeysQueryKey: readonly string[]) {
  const securityRepo = container.securityRepository;
  const queryClient = useQueryClient();

  const invalidatePasskeyCaches = () => {
    queryClient.invalidateQueries({ queryKey: passkeysQueryKey });
    queryClient.invalidateQueries({ queryKey: sovereignAccountKeys.context() });
    queryClient.invalidateQueries({ queryKey: sovereignAccountKeys.security() });
  };

  const enrollPasskeyMutation = useMutation({
    mutationFn: async ({
      deviceName,
      mode = "platform",
    }: {
      deviceName: string;
      mode?: AuthenticatorMode;
    }) => {
      const sudoToken = await ensureSudoElevation();
      const backendMode: PasskeyRegistrationMode =
        mode === "security-key" ? "cross-platform" : mode;
      const options = await securityRepo.beginPasskeyRegistration(
        deviceName,
        backendMode,
        sudoToken
      );
      const attestation = await registerPasskey(options, mode);
      return securityRepo.completePasskeyRegistration(
        {
          attestationObjectBase64: attestation.attestationObjectBase64,
          clientDataJsonBase64: attestation.clientDataJsonBase64,
          deviceName,
          transports: attestation.transports,
          clientExtensionResults: attestation.clientExtensionResults,
          challengeToken: options?.challengeToken,
          attestationMode: options?.mode ?? options?.attachmentMode ?? backendMode,
          credentialIdBase64: attestation.rawId,
        },
        sudoToken
      );
    },
    onSuccess: invalidatePasskeyCaches,
  });

  const removePasskeyMutation = useMutation({
    mutationFn: (id: string) => securityRepo.removePasskey(id),
    onSuccess: invalidatePasskeyCaches,
  });

  const renamePasskeyMutation = useMutation({
    mutationFn: ({ id, newName }: { id: string; newName: string }) =>
      securityRepo.renamePasskey(id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: passkeysQueryKey });
    },
  });

  return { enrollPasskeyMutation, removePasskeyMutation, renamePasskeyMutation };
}
