"use client";

import { SsoCallbackContent } from "../components/SsoCallbackContent";
import { useSsoCallbackHandler } from "../viewmodels/useSsoCallbackHandler";

/**
 * React presentation component representing the sso callback view UI element.
 */
export function SsoCallbackView() {
  const callback = useSsoCallbackHandler("oidc");
  return <SsoCallbackContent {...callback} />;
}

export default SsoCallbackView;
