import { describe, expect, it } from "vitest";
import {
  MAX_SESSION_DEVICE_INFO_LENGTH,
  serializeBrowserDeviceInfo,
  type BrowserDeviceInfo,
} from "../browser-device-info";

const metadata: BrowserDeviceInfo = {
  userAgent: "Mozilla/5.0 Chrome/154",
  platform: "Win32",
  language: "en-US",
  screen: "1920x1080",
  timezone: "Africa/Cairo",
};

describe("serializeBrowserDeviceInfo", () => {
  it("preserves complete metadata when it fits the session storage column", () => {
    const result = serializeBrowserDeviceInfo(metadata);

    expect(result).toBeDefined();
    expect(JSON.parse(result!)).toEqual(metadata);
    expect(result!.length).toBeLessThanOrEqual(MAX_SESSION_DEVICE_INFO_LENGTH);
  });

  it("keeps oversized user agents as valid bounded JSON, without dropping other fields", () => {
    const result = serializeBrowserDeviceInfo({
      ...metadata,
      userAgent: "Mozilla/5.0 " + "VeryLongDeviceString".repeat(1000),
    });

    expect(result).toBeDefined();
    expect(result!.length).toBeLessThanOrEqual(MAX_SESSION_DEVICE_INFO_LENGTH);
    const parsed = JSON.parse(result!);
    expect(parsed.platform).toBe(metadata.platform);
    expect(parsed.language).toBe(metadata.language);
    expect(parsed.screen).toBe(metadata.screen);
    expect(parsed.timezone).toBe(metadata.timezone);
    expect(parsed.userAgent).toMatch(/^Mozilla/);
  });

  it("accounts for escaped characters in the serialized length", () => {
    const result = serializeBrowserDeviceInfo({
      ...metadata,
      userAgent: "\n".repeat(1000),
    });

    expect(result).toBeDefined();
    expect(result!.length).toBeLessThanOrEqual(MAX_SESSION_DEVICE_INFO_LENGTH);
    expect(() => JSON.parse(result!)).not.toThrow();
  });

  it("omits only metadata when non-user-agent fields cannot fit", () => {
    const result = serializeBrowserDeviceInfo({
      ...metadata,
      platform: "x".repeat(2000),
    });

    expect(result).toBeUndefined();
  });
});
