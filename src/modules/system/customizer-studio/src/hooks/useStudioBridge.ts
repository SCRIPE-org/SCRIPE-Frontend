/**
 * useStudioBridge — postMessage Bridge for Customizer Studio ↔ iframe Preview
 *
 * FIXED: No ready-gate — sends drafts immediately on iframe load.
 * Uses requestAnimationFrame throttling for smooth 60fps updates.
 * Caches last draft and re-sends on iframe reload.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ── Message Types ──────────────────────────────────────
export const STUDIO_MSG = {
  DRAFT_UPDATE: "NEXORA_STUDIO_DRAFT_UPDATE",
  RESET: "NEXORA_STUDIO_RESET",
  PREVIEW_READY: "NEXORA_PREVIEW_READY",
} as const;

export interface StudioDraftPayload {
  loginBrandingJson?: string;
  slotConfigJson?: string;
}

// ── Hook ───────────────────────────────────────────────
export function useStudioBridge() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const lastDraftRef = useRef<StudioDraftPayload | null>(null);
  const rafRef = useRef<number | null>(null);

  // Listen for PREVIEW_READY from iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (typeof window !== "undefined" && e.origin !== window.location.origin) return;
      if (e.data?.type === STUDIO_MSG.PREVIEW_READY) {
        setIsPreviewReady(true);
        // Re-send cached draft on iframe ready
        if (lastDraftRef.current && iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            { type: STUDIO_MSG.DRAFT_UPDATE, payload: lastDraftRef.current },
            window.location.origin
          );
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Send draft changes to iframe (throttled via rAF)
  const sendDraft = useCallback((draft: StudioDraftPayload) => {
    lastDraftRef.current = draft;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!iframeRef.current?.contentWindow) return;
      iframeRef.current.contentWindow.postMessage(
        { type: STUDIO_MSG.DRAFT_UPDATE, payload: draft },
        window.location.origin
      );
    });
  }, []);

  // Reset preview to live settings
  const resetPreview = useCallback(() => {
    lastDraftRef.current = null;
    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      { type: STUDIO_MSG.RESET },
      window.location.origin
    );
  }, []);

  // Handle iframe load — re-send last draft
  const handleIframeLoad = useCallback(() => {
    // Give iframe a moment to set up its listener
    setTimeout(() => {
      if (lastDraftRef.current && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: STUDIO_MSG.DRAFT_UPDATE, payload: lastDraftRef.current },
          window.location.origin
        );
      }
    }, 300);
  }, []);

  // Cleanup rAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    iframeRef,
    isPreviewReady,
    sendDraft,
    resetPreview,
    handleIframeLoad,
  };
}
