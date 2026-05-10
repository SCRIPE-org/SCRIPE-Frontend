"use client";

import type { HostToPluginMessage, PluginToHostMessage } from "./types";

type MessageHandler = (message: PluginToHostMessage) => void;

export class PluginBridge {
  private readonly handlers = new Set<MessageHandler>();
  private readonly pluginOrigin: string;
  private readonly iframeRef: React.RefObject<HTMLIFrameElement | null>;

  constructor(pluginOrigin: string, iframeRef: React.RefObject<HTMLIFrameElement | null>) {
    this.pluginOrigin = new URL(pluginOrigin).origin;
    this.iframeRef = iframeRef;
    this.handleMessage = this.handleMessage.bind(this);
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
    if (event.origin !== this.pluginOrigin) return;
    const message = event.data as PluginToHostMessage;
    if (!message?.type) return;
    for (const handler of this.handlers) {
      handler(message);
    }
  }
}
