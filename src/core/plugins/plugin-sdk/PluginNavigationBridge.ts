"use client";

import type { PluginBridge } from "./PluginBridge";

type NavigateFn = (path: string) => void;

/**
 * Allows a Tier 2 plugin iframe to trigger host-side navigation.
 * Only allows navigation to paths starting with "/" (internal routes).
 */
export class PluginNavigationBridge {
  private unsubscribe?: () => void;

  constructor(
    private readonly bridge: PluginBridge,
    private readonly navigate: NavigateFn
  ) {}

  mount() {
    this.unsubscribe = this.bridge.onMessage((msg) => {
      if (msg.type !== "NAVIGATE_REQUEST") return;
      const { path } = msg.payload;
      if (!path.startsWith("/")) return;
      this.navigate(path);
      this.bridge.send({ type: "NAVIGATE_CONFIRMED", payload: { path } });
    });
  }

  unmount() {
    this.unsubscribe?.();
  }
}
