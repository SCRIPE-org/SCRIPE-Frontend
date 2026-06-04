"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { PluginBridge } from "./PluginBridge";
import type { PluginToHostMessage } from "./types";
import { Skeleton } from "@core/ui/skeleton";
import { AlertTriangle } from "lucide-react";

interface PluginFrameProps {
  pluginKey: string;
  frontendUrl: string;
  installationId: string;
  className?: string;
}

export function PluginFrame({
  pluginKey,
  frontendUrl,
  installationId,
  className,
}: PluginFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [height, setHeight] = useState(600);
  const router = useRouter();
  const { success, error, info } = useEnhancedToast();

  const handleMessage = useCallback(
    (message: PluginToHostMessage) => {
      switch (message.type) {
        case "READY":
          setIsReady(true);
          break;
        case "RESIZE":
          setHeight(Math.max(200, message.payload.height));
          break;
        case "NAVIGATE_REQUEST":
          router.push(message.payload.path);
          break;
        case "TOAST":
          const { variant, title, message: msg } = message.payload;
          if (variant === "success") success({ title, description: msg });
          else if (variant === "error") error({ title, description: msg });
          else info({ title, description: msg });
          break;
      }
    },
    [router, success, error, info]
  );

  useEffect(() => {
    if (!frontendUrl) return;
    const bridge = new PluginBridge(frontendUrl, iframeRef);
    bridge.mount();
    const unsub = bridge.onMessage(handleMessage);
    return () => {
      bridge.unmount();
      unsub();
    };
  }, [frontendUrl, handleMessage]);

  if (!frontendUrl) {
    return (
      <div className="flex h-48 items-center justify-center gap-2 text-muted-foreground">
        <AlertTriangle className="h-5 w-5" />
        <span className="text-sm">Plugin has no frontend URL configured.</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className ?? ""}`} style={{ minHeight: height }}>
      {!isReady && !hasError && (
        <div className="absolute inset-0 z-10">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      )}
      {hasError && (
        <div className="flex h-48 items-center justify-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span className="text-sm">Plugin failed to load.</span>
        </div>
      )}
      {/*
        G7 — CSP Sandbox Strategy:
        - allow-scripts: Required for plugin JS to execute
        - allow-forms: Required for plugins with form submissions
        - allow-popups: Required for OAuth flows and external links
        - allow-popups-to-escape-sandbox: Required so popups can open real pages
        - allow-storage-access-by-user-activation: Allows localStorage/cookies with user gesture (optional)
        - INTENTIONALLY OMITTED: allow-same-origin
          Adding allow-same-origin would let the plugin script access document.cookie, window.parent,
          and escape the sandbox entirely. The PluginBridge uses postMessage with strict origin checks
          for all host-plugin communication — this works correctly WITHOUT same-origin.
          Never add allow-same-origin unless the plugin is served from a fully isolated subdomain.
      */}
      <iframe
        ref={iframeRef}
        src={`${frontendUrl}?installationId=${installationId}`}
        title={`Plugin: ${pluginKey}`}
        sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
        className="w-full rounded-xl border-0"
        style={{ height, display: hasError ? "none" : "block" }}
        onError={() => setHasError(true)}
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
}
