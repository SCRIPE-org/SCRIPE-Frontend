"use client";

import { useEffect, useState } from "react";

/**
 * Interface structure detailing the properties and attributes of Preview Overrides.
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
    window.parent?.postMessage({ type: "SCRIPE_PREVIEW_READY" }, window.location.origin);

    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "SCRIPE_STUDIO_DRAFT_UPDATE") {
        setPreviewOverrides(e.data.payload as PreviewOverrides);
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
