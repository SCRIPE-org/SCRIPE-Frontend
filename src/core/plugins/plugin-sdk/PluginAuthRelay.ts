"use client";

import type { PluginBridge } from "./PluginBridge";

/**
 * Provides scoped access tokens to Tier 2 plugin iframes on request.
 * The plugin sends AUTH_TOKEN_REQUEST; this relay calls the token provider
 * and pushes back a short-lived scoped token.
 */
export class PluginAuthRelay {
  private unsubscribe?: () => void;

  constructor(
    private readonly bridge: PluginBridge,
    private readonly getToken: () => Promise<{ accessToken: string; expiresAt: number }>
  ) {}

  mount() {
    this.unsubscribe = this.bridge.onMessage(async (msg) => {
      if (msg.type !== "AUTH_TOKEN_REQUEST") return;
      try {
        const token = await this.getToken();
        this.bridge.send({ type: "AUTH_TOKEN", payload: token });
      } catch {
        // Token fetch failed — plugin will handle absence of token
      }
    });
  }

  unmount() {
    this.unsubscribe?.();
  }
}
