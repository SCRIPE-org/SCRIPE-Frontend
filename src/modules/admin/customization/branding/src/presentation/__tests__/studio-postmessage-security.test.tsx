import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  isTrustedSameOriginParentMessage,
  isTrustedSameOriginIframeMessage,
  parseStudioThemeMessage,
  parseStudioDraftUpdateMessage,
  parseDashboardSettingsUpdateMessage,
  isSafeInternalRoutePath,
  validateExternalPluginOriginUrl,
  isSafeFederationIdentifier,
} from "@core/common/postmessage-security";
import { usePreviewMode } from "@/modules/shared/auth/signin/src/presentation/viewmodels/usePreviewMode";
import { useStudioBridge, STUDIO_MSG } from "../hooks/useStudioBridge";

describe("Area C — Studio & cross-window postMessage security", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("requires both exact same-origin AND exact event.source match for parent/iframe helpers", () => {
    const fakeIframeWin = {} as Window;
    const otherWin = {} as Window;
    const iframeEl = { contentWindow: fakeIframeWin } as unknown as HTMLIFrameElement;

    expect(
      isTrustedSameOriginIframeMessage(
        new MessageEvent("message", {
          origin: window.location.origin,
          source: fakeIframeWin,
          data: {},
        }),
        iframeEl
      )
    ).toBe(true);

    expect(
      isTrustedSameOriginIframeMessage(
        new MessageEvent("message", {
          origin: window.location.origin,
          source: otherWin,
          data: {},
        }),
        iframeEl
      )
    ).toBe(false);

    expect(
      isTrustedSameOriginIframeMessage(
        new MessageEvent("message", {
          origin: "https://evil.example",
          source: fakeIframeWin,
          data: {},
        }),
        iframeEl
      )
    ).toBe(false);

    expect(
      isTrustedSameOriginParentMessage(
        new MessageEvent("message", {
          origin: window.location.origin,
          source: window.parent,
          data: {},
        })
      )
    ).toBe(true);

    expect(
      isTrustedSameOriginParentMessage(
        new MessageEvent("message", {
          origin: window.location.origin,
          source: otherWin,
          data: {},
        })
      )
    ).toBe(false);
  });

  it("validates studio theme, draft update, and dashboard settings schemas strictly", () => {
    expect(parseStudioThemeMessage({ type: "SCRIPE_STUDIO_SET_THEME", theme: "dark" })).toBe("dark");
    expect(
      parseStudioThemeMessage({ type: "SCRIPE_STUDIO_SET_THEME", theme: "evil<script>" })
    ).toBeNull();

    expect(
      parseStudioDraftUpdateMessage({
        type: "SCRIPE_STUDIO_DRAFT_UPDATE",
        payload: { loginBrandingJson: "{}", activeAuthPage: "login" },
      })
    ).toEqual({ loginBrandingJson: "{}", activeAuthPage: "login" });

    expect(
      parseStudioDraftUpdateMessage({
        type: "SCRIPE_STUDIO_DRAFT_UPDATE",
        payload: { activeAuthPage: "../admin" },
      })
    ).toBeNull();

    expect(
      parseStudioDraftUpdateMessage({
        type: "SCRIPE_STUDIO_DRAFT_UPDATE",
        payload: { loginBrandingJson: { nested: "bad" } },
      })
    ).toBeNull();

    const validKeys = new Set(["layoutTemplate", "colorTheme"]);
    const parsedSettings = parseDashboardSettingsUpdateMessage(
      JSON.parse(
        '{"type":"DASHBOARD_SETTINGS_UPDATE","settings":{"colorTheme":"dark","__proto__":{"polluted":true},"evil":"x"}}'
      ),
      validKeys
    );
    expect(parsedSettings).toEqual({ colorTheme: "dark" });
    expect(Object.hasOwn(parsedSettings!, "__proto__")).toBe(false);
  });

  it("rejects spoofed origin and wrong event.source in usePreviewMode and useStudioBridge", () => {
    window.history.pushState({}, "", "/login?_preview=true");
    const { result: preview } = renderHook(() => usePreviewMode());
    const unrelatedWindow = {} as Window;

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "https://evil.example",
          source: window.parent,
          data: {
            type: "SCRIPE_STUDIO_DRAFT_UPDATE",
            payload: { loginBrandingJson: '{"companyName":"Pwned"}' },
          },
        })
      );
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: window.location.origin,
          source: unrelatedWindow,
          data: {
            type: "SCRIPE_STUDIO_DRAFT_UPDATE",
            payload: { loginBrandingJson: '{"companyName":"WrongSource"}' },
          },
        })
      );
    });
    expect(preview.current.previewOverrides).toBeNull();

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: window.location.origin,
          source: window.parent,
          data: {
            type: "SCRIPE_STUDIO_DRAFT_UPDATE",
            payload: { loginBrandingJson: '{"companyName":"Valid"}' },
          },
        })
      );
    });
    expect(preview.current.previewOverrides).toEqual({
      loginBrandingJson: '{"companyName":"Valid"}',
      slotConfigJson: undefined,
    });

    const { result: bridge } = renderHook(() => useStudioBridge());
    const childWindow = { postMessage: vi.fn() } as unknown as Window;
    const mockIframe = { contentWindow: childWindow } as unknown as HTMLIFrameElement;
    (bridge.current.iframeRef as { current: HTMLIFrameElement | null }).current = mockIframe;

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: window.location.origin,
          source: unrelatedWindow,
          data: { type: STUDIO_MSG.PREVIEW_READY },
        })
      );
    });
    expect(bridge.current.isPreviewReady).toBe(false);

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: window.location.origin,
          source: childWindow,
          data: { type: STUDIO_MSG.PREVIEW_READY },
        })
      );
    });
    expect(bridge.current.isPreviewReady).toBe(true);
  });

  it("blocks protocol-relative/external redirect paths and validates federation/plugin origins", () => {
    expect(isSafeInternalRoutePath("/overview?tab=1")).toBe("/overview?tab=1");
    expect(isSafeInternalRoutePath("//evil.example")).toBeNull();
    expect(isSafeInternalRoutePath("/\\evil.example")).toBeNull();
    expect(isSafeInternalRoutePath("https://evil.example")).toBeNull();
    expect(isSafeInternalRoutePath("javascript:alert(1)")).toBeNull();

    vi.stubEnv("NODE_ENV", "production");
    expect(validateExternalPluginOriginUrl("https://plugin.scripe.app/ui")?.origin).toBe(
      "https://plugin.scripe.app"
    );
    expect(validateExternalPluginOriginUrl("http://plugin.scripe.app/ui")).toBeNull();
    expect(validateExternalPluginOriginUrl("javascript:alert(1)")).toBeNull();
    expect(
      validateExternalPluginOriginUrl(window.location.origin, { allowSameOrigin: false })
    ).toBeNull();

    expect(isSafeFederationIdentifier("booking_widget_v2")).toBe(true);
    expect(isSafeFederationIdentifier("__proto__")).toBe(false);
    expect(isSafeFederationIdentifier("window")).toBe(false);
  });
});
