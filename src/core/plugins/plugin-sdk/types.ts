// Plugin SDK — shared message types for host ↔ iframe communication

export type HostToPluginMessage =
  | {
      type: "THEME_UPDATE";
      payload: { mode: "dark" | "light"; accent: string; direction: "ltr" | "rtl" };
    }
  | { type: "AUTH_TOKEN"; payload: { accessToken: string; expiresAt: number } }
  | { type: "LANGUAGE_CHANGE"; payload: { language: "en" | "ar"; direction: "ltr" | "rtl" } }
  | {
      type: "TENANT_CONTEXT";
      payload: { tenantId: string; tenantName: string; features: string[] };
    }
  | { type: "NAVIGATE_CONFIRMED"; payload: { path: string } }
  | { type: "PLUGIN_EVENT"; payload: { eventType: string; data: unknown } };

export type PluginToHostMessage =
  | { type: "READY" }
  | { type: "NAVIGATE_REQUEST"; payload: { path: string } }
  | {
      type: "TOAST";
      payload: {
        variant: "success" | "error" | "warning" | "info";
        title: string;
        message?: string;
      };
    }
  | { type: "RESIZE"; payload: { height: number } }
  | { type: "AUTH_TOKEN_REQUEST" }
  | { type: "OPEN_DIALOG"; payload: { title: string; content: string } }
  | { type: "CLOSE"; payload?: { reason?: string } };

export type PluginMessage = HostToPluginMessage | PluginToHostMessage;
