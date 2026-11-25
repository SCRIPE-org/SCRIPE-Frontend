import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { PluginBridge } from "../PluginBridge";
import { PluginNavigationBridge } from "../PluginNavigationBridge";
import { PluginAuthRelay } from "../PluginAuthRelay";
import { PluginFrame } from "../PluginFrame";
import { buildRemoteEntryUrl } from "../../tier1/federation-config";

const routerPushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPushMock }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

describe("Area C — PluginBridge, PluginNavigationBridge, PluginAuthRelay & PluginFrame security", () => {
  beforeEach(() => {
    routerPushMock.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("enforces event.source + origin checks and blocks AUTH_TOKEN relay on opaque sandboxes", async () => {
    const childWindow = { postMessage: vi.fn() } as unknown as Window;
    const rogueWindow = { postMessage: vi.fn() } as unknown as Window;
    const iframeRef = {
      current: { contentWindow: childWindow } as unknown as HTMLIFrameElement,
    };

    const opaqueBridge = new PluginBridge("https://plugin.partner.example/app", iframeRef);
    expect(opaqueBridge.canRelaySecrets()).toBe(false);

    const onMsg = vi.fn();
    opaqueBridge.mount();
    opaqueBridge.onMessage(onMsg);

    const getToken = vi.fn(async () => ({ accessToken: "secret-jwt", expiresAt: 999999 }));
    const authRelay = new PluginAuthRelay(opaqueBridge, getToken);
    authRelay.mount();

    // Forged rogue window with "null" origin MUST be dropped
    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "null",
        source: rogueWindow,
        data: { type: "READY" },
      })
    );
    expect(onMsg).not.toHaveBeenCalled();

    // Authentic opaque sandbox iframe receives non-secret UI events, NEVER access tokens
    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "null",
        source: childWindow,
        data: { type: "AUTH_TOKEN_REQUEST" },
      })
    );
    await Promise.resolve();
    expect(getToken).not.toHaveBeenCalled();
    expect(childWindow.postMessage).not.toHaveBeenCalled();

    authRelay.unmount();
    opaqueBridge.unmount();

    // Verified HTTPS subdomain mode rejects "null" origin and permits strict origin + source
    const trustedBridge = new PluginBridge("https://plugin.partner.example/app", iframeRef, {
      sandboxHasSameOrigin: true,
    });
    expect(trustedBridge.canRelaySecrets()).toBe(true);
    const trustedMsgs = vi.fn();
    trustedBridge.mount();
    trustedBridge.onMessage(trustedMsgs);

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "null",
        source: childWindow,
        data: { type: "READY" },
      })
    );
    expect(trustedMsgs).not.toHaveBeenCalled();

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://plugin.partner.example",
        source: childWindow,
        data: { type: "READY" },
      })
    );
    expect(trustedMsgs).toHaveBeenCalledWith({ type: "READY" });
    trustedBridge.unmount();
  });

  it("blocks protocol-relative //evil.com and external scheme open redirects in PluginNavigationBridge", () => {
    const childWindow = { postMessage: vi.fn() } as unknown as Window;
    const iframeRef = {
      current: { contentWindow: childWindow } as unknown as HTMLIFrameElement,
    };
    const bridge = new PluginBridge("https://plugin.partner.example/app", iframeRef);
    const navigate = vi.fn();
    const navBridge = new PluginNavigationBridge(bridge, navigate);

    bridge.mount();
    navBridge.mount();

    for (const badPath of [
      "//evil.example/phish",
      "/\\evil.example",
      "https://evil.example/login",
      "javascript:alert(1)",
    ]) {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "null",
          source: childWindow,
          data: { type: "NAVIGATE_REQUEST", payload: { path: badPath } },
        })
      );
    }
    expect(navigate).not.toHaveBeenCalled();

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "null",
        source: childWindow,
        data: { type: "NAVIGATE_REQUEST", payload: { path: "/plugins/installed?tab=logs" } },
      })
    );
    expect(navigate).toHaveBeenCalledWith("/plugins/installed?tab=logs");
    expect(childWindow.postMessage).toHaveBeenCalledWith(
      { type: "NAVIGATE_CONFIRMED", payload: { path: "/plugins/installed?tab=logs" } },
      "https://plugin.partner.example"
    );

    navBridge.unmount();
    bridge.unmount();
  });

  it("rejects untrusted frontendUrl in PluginFrame and keeps sandbox free of allow-same-origin", () => {
    vi.stubEnv("NODE_ENV", "production");

    const { rerender } = render(
      <PluginFrame
        pluginKey="bad"
        frontendUrl="javascript:alert(1)"
        installationId="inst-1"
      />
    );
    expect(screen.queryByTitle("errors.plugin.frameTitle")).toBeNull();
    expect(screen.getByText("errors.plugin.frameFailed")).toBeTruthy();

    rerender(
      <PluginFrame
        pluginKey="crm-sync"
        frontendUrl="https://plugin.partner.example/ui"
        installationId="inst-2"
      />
    );
    const frame = screen.getByTitle("errors.plugin.frameTitle") as HTMLIFrameElement;
    expect(frame.getAttribute("src")).toBe(
      "https://plugin.partner.example/ui?installationId=inst-2"
    );
    expect(frame.getAttribute("sandbox")).not.toContain("allow-same-origin");
    expect(frame.getAttribute("sandbox")).toContain("allow-scripts");

    expect(() => buildRemoteEntryUrl("javascript:alert(1)", "bad")).toThrow();
    expect(buildRemoteEntryUrl("https://cdn.partner.example/plugin", "ok")).toBe(
      "https://cdn.partner.example/plugin/remoteEntry.js"
    );
  });
});
