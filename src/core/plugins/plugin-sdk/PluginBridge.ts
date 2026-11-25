"use client";

import type { HostToPluginMessage, PluginToHostMessage } from "./types";
import {
  isSafeInternalRoutePath,
  validateExternalPluginOriginUrl,
} from "@core/common/postmessage-security";

type MessageHandler = (message: PluginToHostMessage) => void;

const ALLOWED_TOAST_VARIANTS = new Set(["success", "error", "warning", "info"]);

function parsePluginToHostMessage(raw: unknown): PluginToHostMessage | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const msg = raw as Record<string, unknown>;
  if (typeof msg.type !== "string") return null;

  switch (msg.type) {
    case "READY":
    case "AUTH_TOKEN_REQUEST":
      return { type: msg.type };
    case "RESIZE": {
      const payload = msg.payload as Record<string, unknown> | undefined;
      if (!payload || typeof payload.height !== "number" || !Number.isFinite(payload.height)) {
        return null;
      }
      return { type: "RESIZE", payload: { height: payload.height } };
    }
    case "NAVIGATE_REQUEST": {
      const payload = msg.payload as Record<string, unknown> | undefined;
      const safePath = isSafeInternalRoutePath(payload?.path);
      return safePath ? { type: "NAVIGATE_REQUEST", payload: { path: safePath } } : null;
    }
    case "TOAST": {
      const payload = msg.payload as Record<string, unknown> | undefined;
      if (
        !payload ||
        typeof payload.variant !== "string" ||
        !ALLOWED_TOAST_VARIANTS.has(payload.variant) ||
        typeof payload.title !== "string"
      ) {
        return null;
      }
      return {
        type: "TOAST",
        payload: {
          variant: payload.variant as "success" | "error" | "warning" | "info",
          title: payload.title,
          message: typeof payload.message === "string" ? payload.message : undefined,
        },
      };
    }
    case "OPEN_DIALOG": {
      const payload = msg.payload as Record<string, unknown> | undefined;
      if (!payload || typeof payload.title !== "string" || typeof payload.content !== "string") {
        return null;
      }
      return { type: "OPEN_DIALOG", payload: { title: payload.title, content: payload.content } };
    }
    case "CLOSE": {
      const payload = msg.payload as Record<string, unknown> | undefined;
      return {
        type: "CLOSE",
        payload: typeof payload?.reason === "string" ? { reason: payload.reason } : undefined,
      };
    }
    default:
      return null;
  }
}

export interface PluginBridgeOptions {
  /** Set true strictly when the sandbox includes `allow-same-origin` on an isolated subdomain. */
  sandboxHasSameOrigin?: boolean;
}

export class PluginBridge {
  private readonly handlers = new Set<MessageHandler>();
  private readonly pluginOrigin: string;
  private readonly isHttpsOrigin: boolean;
  private readonly sandboxHasSameOrigin: boolean;
  private readonly iframeRef: React.RefObject<HTMLIFrameElement | null>;

  constructor(
    pluginOrigin: string,
    iframeRef: React.RefObject<HTMLIFrameElement | null>,
    options?: PluginBridgeOptions
  ) {
    const parsed = validateExternalPluginOriginUrl(pluginOrigin, { allowSameOrigin: false });
    if (!parsed) {
      throw new Error("Invalid or untrusted plugin origin URL");
    }
    this.pluginOrigin = parsed.origin;
    this.isHttpsOrigin = parsed.protocol === "https:";
    this.sandboxHasSameOrigin = options?.sandboxHasSameOrigin ?? false;
    this.iframeRef = iframeRef;
    this.handleMessage = this.handleMessage.bind(this);
  }

  /**
   * Secret/token relay is only permitted when the iframe carries a verified HTTPS
   * origin (`allow-same-origin` on an isolated plugin domain, never opaque `"null"` sandbox).
   */
  canRelaySecrets(): boolean {
    return this.sandboxHasSameOrigin && this.isHttpsOrigin;
  }

  mount() {
    window.addEventListener("message", this.handleMessage);
  }

  unmount() {
    window.removeEventListener("message", this.handleMessage);
  }

  onMessage(handler: MessageHandler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  send(message: HostToPluginMessage) {
    const iframe = this.iframeRef.current;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage(message, this.pluginOrigin);
  }

  private handleMessage(event: MessageEvent) {
    const iframe = this.iframeRef.current;
    if (!iframe?.contentWindow || event.source !== iframe.contentWindow) return;

    const originMatches =
      event.origin === this.pluginOrigin ||
      (!this.sandboxHasSameOrigin && event.origin === "null");
    if (!originMatches) return;

    const message = parsePluginToHostMessage(event.data);
    if (!message) return;

    for (const handler of this.handlers) {
      handler(message);
    }
  }
}
