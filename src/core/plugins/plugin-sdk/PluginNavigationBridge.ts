"use client";

import type { PluginBridge } from "./PluginBridge";
import { isSafeInternalRoutePath } from "@core/common/postmessage-security";

type NavigateFn = (path: string) => void;

/**
 * Allows a Tier 2 plugin iframe to trigger host-side navigation.
 * Only allows navigation to strict single-slash internal routes (never `//host`, `/\`, or URL schemes).
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
      const safePath = isSafeInternalRoutePath(msg.payload?.path);
      if (!safePath) return;
      this.navigate(safePath);
      this.bridge.send({ type: "NAVIGATE_CONFIRMED", payload: { path: safePath } });
    });
  }

  unmount() {
    this.unsubscribe?.();
  }
}
