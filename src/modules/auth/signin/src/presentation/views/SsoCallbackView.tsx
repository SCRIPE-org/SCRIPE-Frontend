"use client";

import { SsoCallbackContent } from "../components/SsoCallbackContent";
import { useSsoCallbackHandler } from "../viewmodels/useSsoCallbackHandler";

/**
 * Presentation UI component rendering the sso callback view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function SsoCallbackView() {
  const callback = useSsoCallbackHandler("oidc");
  return <SsoCallbackContent {...callback} />;
}

export default SsoCallbackView;
