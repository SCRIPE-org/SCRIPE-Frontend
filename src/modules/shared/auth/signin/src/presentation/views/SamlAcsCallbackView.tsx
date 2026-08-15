"use client";

import { SsoCallbackContent } from "../components/SsoCallbackContent";
import { useSsoCallbackHandler } from "../viewmodels/useSsoCallbackHandler";

/**
 * Presentation UI component rendering the saml acs callback view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function SamlAcsCallbackView() {
  const callback = useSsoCallbackHandler("saml");
  return <SsoCallbackContent {...callback} />;
}

export default SamlAcsCallbackView;
