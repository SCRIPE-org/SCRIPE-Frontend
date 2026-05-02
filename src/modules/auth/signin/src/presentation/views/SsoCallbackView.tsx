"use client";

import { SsoCallbackContent } from "../components/SsoCallbackContent";
import { useSsoCallbackHandler } from "../viewmodels/useSsoCallbackHandler";

export function SsoCallbackView() {
  const callback = useSsoCallbackHandler("oidc");
  return <SsoCallbackContent {...callback} />;
}

export default SsoCallbackView;
