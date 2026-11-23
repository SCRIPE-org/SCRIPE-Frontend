import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { OAuthConsentView } from "../views/OAuthConsentView";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr" as const,
  }),
}));

vi.mock("../viewmodels/useOAuthConsentViewModel", () => ({
  useOAuthConsentViewModel: () => ({
    isApproving: false,
    isDenying: false,
    isRestoringSession: false,
    hasHydrated: true,
    clientId: "test-client",
    redirectUri: "https://app.example.test/cb",
    scope: "openid profile",
    appName: "Test App",
    requestedScopes: ["openid", "profile"],
    userDisplayName: "Admin User",
    formAction: "http://localhost:5035/connect/authorize",
    formParams: {
      client_id: "test-client",
      consent_ticket: "signed-ticket",
      decision: "approve",
    },
    formRef: { current: null },
    handleApprove: vi.fn(),
    handleDeny: vi.fn(),
    handleSwitchAccount: vi.fn(),
  }),
}));

describe("OAuthConsentView hidden consent form security (MED-17)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("never renders an access_token hidden input inside the OIDC consent POST form", () => {
    const { container } = render(<OAuthConsentView />);

    const form = container.querySelector('form[action="http://localhost:5035/connect/authorize"]');
    expect(form).not.toBeNull();
    expect(container.querySelector('input[name="access_token"]')).toBeNull();
    expect(container.querySelector('input[name="consent_ticket"]')).toHaveValue("signed-ticket");
    expect(container.querySelector('input[name="decision"]')).toHaveValue("approve");
  });
});
