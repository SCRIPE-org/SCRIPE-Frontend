"use client";

import { SsoCallbackContent } from "../components/SsoCallbackContent";
import { useSsoCallbackHandler } from "../viewmodels/useSsoCallbackHandler";

export function SamlAcsCallbackView() {
  const callback = useSsoCallbackHandler("saml");
  return <SsoCallbackContent {...callback} />;
}

export default SamlAcsCallbackView;
