"use client";

type EventHandler<T = unknown> = (data: T) => void;

/**
 * In-process event bus for plugin-to-host communication.
 * Decouples plugin lifecycle events (installed, uninstalled, activated)
 * from UI components that need to react to them.
 */
export class PluginEventBus {
  private readonly listeners = new Map<string, Set<EventHandler>>();

  on<T = unknown>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler as EventHandler);
    return () => this.listeners.get(eventType)?.delete(handler as EventHandler);
  }

  emit<T = unknown>(eventType: string, data: T) {
    for (const handler of this.listeners.get(eventType) ?? []) {
      handler(data);
    }
  }

  clear(eventType?: string) {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }
}

export const pluginEventBus = new PluginEventBus();
