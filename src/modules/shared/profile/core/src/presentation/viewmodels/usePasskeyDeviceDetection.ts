/**
 * Detects browser WebAuthn / platform authenticator capabilities while the passkey
 * enrollment modal is open.
 *
 * @module shared/profile/core/presentation/viewmodels
 */

"use client";

import { useEffect, useState } from "react";
import { detectClientDevice } from "@core/services/webauthn.service";
import type { ClientDeviceDetection } from "../../domain/entities/PasskeyCredential";

/**
 * Resolves client WebAuthn device and platform biometric availability when enabled.
 */
export function usePasskeyDeviceDetection(enabled: boolean): ClientDeviceDetection | null {
  const [deviceInfo, setDeviceInfo] = useState<ClientDeviceDetection | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void detectClientDevice().then((info) => {
      if (active) setDeviceInfo(info);
    });
    return () => {
      active = false;
    };
  }, [enabled]);

  return deviceInfo;
}
