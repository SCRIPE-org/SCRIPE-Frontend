"use client";

import type { PluginBridge } from "./PluginBridge";

export interface ToastHandlers {
  success: (opts: { title: string; description?: string }) => void;
  error: (opts: { title: string; description?: string }) => void;
  info: (opts: { title: string; description?: string }) => void;
  warning: (opts: { title: string; description?: string }) => void;
}

/**
 * Allows a Tier 2 plugin iframe to trigger NEXORA host toast notifications.
 */
export class PluginToastBridge {
  private unsubscribe?: () => void;

  constructor(
    private readonly bridge: PluginBridge,
    private readonly toast: ToastHandlers
  ) {}

  mount() {
    this.unsubscribe = this.bridge.onMessage((msg) => {
      if (msg.type !== "TOAST") return;
      const { variant, title, message } = msg.payload;
      const opts = { title, description: message };
      switch (variant) {
        case "success": this.toast.success(opts); break;
        case "error": this.toast.error(opts); break;
        case "warning": this.toast.warning(opts); break;
        default: this.toast.info(opts);
      }
    });
  }

  unmount() {
    this.unsubscribe?.();
  }
}
