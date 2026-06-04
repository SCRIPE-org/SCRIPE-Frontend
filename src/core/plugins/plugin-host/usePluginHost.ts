"use client";

import { useCallback, useRef, useState } from "react";
import { PluginBridge } from "../plugin-sdk/PluginBridge";
import type { HostToPluginMessage } from "../plugin-sdk/types";

interface ActivePlugin {
  installationId: string;
  pluginKey: string;
  frontendUrl: string;
  bridge: PluginBridge;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

export function usePluginHost() {
  const [activePlugins, setActivePlugins] = useState<Map<string, ActivePlugin>>(new Map());

  const broadcast = useCallback(
    (message: HostToPluginMessage) => {
      for (const plugin of activePlugins.values()) {
        plugin.bridge.send(message);
      }
    },
    [activePlugins]
  );

  const sendTo = useCallback(
    (installationId: string, message: HostToPluginMessage) => {
      activePlugins.get(installationId)?.bridge.send(message);
    },
    [activePlugins]
  );

  return {
    activePlugins,
    broadcast,
    sendTo,
  };
}
