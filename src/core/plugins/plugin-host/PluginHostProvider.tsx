"use client";

import { createContext, useContext, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { PluginBridge } from "../plugin-sdk/PluginBridge";
import { PluginThemeSync } from "../plugin-sdk/PluginThemeSync";
import { PluginAuthRelay } from "../plugin-sdk/PluginAuthRelay";
import { PluginNavigationBridge } from "../plugin-sdk/PluginNavigationBridge";
import { PluginToastBridge } from "../plugin-sdk/PluginToastBridge";
import { pluginEventBus } from "../plugin-sdk/PluginEventBus";
import type { PluginTheme } from "../plugin-sdk/PluginThemeSync";
import type { ToastHandlers } from "../plugin-sdk/PluginToastBridge";

interface PluginHostContextValue {
  createBridgeFor: (
    installationId: string,
    frontendUrl: string,
    iframeRef: React.RefObject<HTMLIFrameElement | null>
  ) => PluginBridge;
  syncTheme: (bridge: PluginBridge, theme: PluginTheme) => void;
  mountRelays: (bridge: PluginBridge, installationId: string) => () => void;
}

const PluginHostContext = createContext<PluginHostContextValue | null>(null);

interface PluginHostProviderProps {
  children: React.ReactNode;
  getPluginToken?: (installationId: string) => Promise<{ accessToken: string; expiresAt: number }>;
}

export function PluginHostProvider({ children, getPluginToken }: PluginHostProviderProps) {
  const router = useRouter();
  const toast = useEnhancedToast();

  const toastHandlers: ToastHandlers = {
    success: (opts) => toast.success(opts),
    error: (opts) => toast.error(opts),
    info: (opts) => toast.info(opts),
    warning: (opts) => toast.warning(opts),
  };

  const createBridgeFor = useCallback(
    (
      installationId: string,
      frontendUrl: string,
      iframeRef: React.RefObject<HTMLIFrameElement | null>
    ) => {
      return new PluginBridge(frontendUrl, iframeRef);
    },
    []
  );

  const syncTheme = useCallback((bridge: PluginBridge, theme: PluginTheme) => {
    const themeSync = new PluginThemeSync(bridge);
    themeSync.sync(theme);
  }, []);

  const mountRelays = useCallback(
    (bridge: PluginBridge, installationId: string) => {
      const navBridge = new PluginNavigationBridge(bridge, (path) => router.push(path));
      const toastBridge = new PluginToastBridge(bridge, toastHandlers);

      navBridge.mount();
      toastBridge.mount();

      let authRelay: PluginAuthRelay | null = null;
      if (getPluginToken) {
        authRelay = new PluginAuthRelay(bridge, () => getPluginToken(installationId));
        authRelay.mount();
      }

      return () => {
        navBridge.unmount();
        toastBridge.unmount();
        authRelay?.unmount();
      };
    },
    [router, toastHandlers, getPluginToken]
  );

  return (
    <PluginHostContext.Provider value={{ createBridgeFor, syncTheme, mountRelays }}>
      {children}
    </PluginHostContext.Provider>
  );
}

export function usePluginHostContext() {
  const ctx = useContext(PluginHostContext);
  if (!ctx) throw new Error("usePluginHostContext must be used within PluginHostProvider");
  return ctx;
}

export { pluginEventBus };
