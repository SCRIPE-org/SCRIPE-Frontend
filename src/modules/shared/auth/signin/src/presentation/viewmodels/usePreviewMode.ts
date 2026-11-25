"use client";

import { useEffect, useState } from "react";
import {
  isTrustedSameOriginParentMessage,
  parseStudioDraftUpdateMessage,
  postToSameOriginParent,
} from "@core/common/postmessage-security";

/**
 * Interface defining property specifications, keys types, and structural contract rules for preview overrides.
 */
export interface PreviewOverrides {
  loginBrandingJson?: string;
  slotConfigJson?: string;
}

/**
 * usePreviewMode — Manages studio preview mode state.
 *
 * Extracted from LoginView to keep that view under 200 lines.
 * Listens for postMessage events from the SCRIPE studio iframe
 * when ?_preview=true is in the URL.
 *
 * §22 Studio Preview Mode
 */
export function usePreviewMode() {
  const [previewOverrides, setPreviewOverrides] = useState<PreviewOverrides | null>(null);

  const isPreviewMode =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("_preview") === "true";

  useEffect(() => {
    if (!isPreviewMode) return;

    // Signal to studio that preview is ready
    postToSameOriginParent({ type: "SCRIPE_PREVIEW_READY" });

    const handler = (e: MessageEvent) => {
      if (!isTrustedSameOriginParentMessage(e)) return;
      const validDraft = parseStudioDraftUpdateMessage(e.data);
      if (validDraft) {
        setPreviewOverrides({
          loginBrandingJson: validDraft.loginBrandingJson,
          slotConfigJson: validDraft.slotConfigJson,
        });
        return;
      }
      if (e.data?.type === "SCRIPE_STUDIO_RESET") {
        setPreviewOverrides(null);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [isPreviewMode]);

  return { isPreviewMode, previewOverrides };
}
