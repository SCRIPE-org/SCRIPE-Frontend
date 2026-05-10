"use client";

import type { PluginBridge } from "./PluginBridge";

export type ThemeMode = "dark" | "light";
export type LayoutDirection = "ltr" | "rtl";

export interface PluginTheme {
  mode: ThemeMode;
  accent: string;
  direction: LayoutDirection;
}

/**
 * Pushes the current NEXORA theme into a Tier 2 plugin iframe whenever it changes.
 * Call sync() after mounting the bridge and whenever the host theme updates.
 */
export class PluginThemeSync {
  constructor(private readonly bridge: PluginBridge) {}

  sync(theme: PluginTheme) {
    this.bridge.send({
      type: "THEME_UPDATE",
      payload: {
        mode: theme.mode,
        accent: theme.accent,
        direction: theme.direction,
      },
    });
  }
}
