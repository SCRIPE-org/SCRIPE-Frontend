"use client";

import { SsoCallbackContent } from "../components/SsoCallbackContent";
import { useSsoCallbackHandler } from "../viewmodels/useSsoCallbackHandler";

/**
 * React presentation component representing the saml acs callback view UI element.
 */
export function SamlAcsCallbackView() {
  const callback = useSsoCallbackHandler("saml");
  return <SsoCallbackContent {...callback} />;
}

export default SamlAcsCallbackView;
