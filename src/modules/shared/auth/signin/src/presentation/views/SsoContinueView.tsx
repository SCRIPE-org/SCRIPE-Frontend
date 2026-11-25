"use client";

import { SsoCallbackContent } from "../components/SsoCallbackContent";
import { useSsoCallbackHandler } from "../viewmodels/useSsoCallbackHandler";

/**
 * Presentation view for central SSO continuation (`/sso/continue`), hosting
 * workspace selection and hybrid IdP MFA step-up before returning to the tenant origin.
 */
export function SsoContinueView() {
  const callback = useSsoCallbackHandler("continue");
  return <SsoCallbackContent {...callback} />;
}

export default SsoContinueView;
