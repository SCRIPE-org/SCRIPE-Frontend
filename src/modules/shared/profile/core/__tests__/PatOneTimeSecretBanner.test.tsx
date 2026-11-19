import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PatOneTimeSecretBanner } from "../src/presentation/sections/integrations/PatOneTimeSecretBanner";
import { usePatOneTimeSecretStore } from "@core/store/usePatOneTimeSecretStore";

describe("PatOneTimeSecretBanner owner isolation", () => {
  beforeEach(() => {
    usePatOneTimeSecretStore.getState().clearPendingReceipt();
  });

  it("renders when receipt owner matches currentUserId and hides when owner differs", () => {
    const receipt = {
      tokenId: "pat-1",
      tokenName: "CI Deploy",
      plainTextSecret: "scr_pat_live_secret_value_123456",
      fingerprintOrPrefix: "scr_pat_live",
      isRotated: false,
      ownerUserId: "user-alice",
    };

    const { rerender } = render(
      <PatOneTimeSecretBanner
        t={(key) => key}
        receipt={receipt}
        currentUserId="user-alice"
        onDismiss={() => {}}
      />
    );

    expect(screen.getByTestId("one-time-pat-secret-banner")).toBeInTheDocument();

    rerender(
      <PatOneTimeSecretBanner
        t={(key) => key}
        receipt={receipt}
        currentUserId="user-bob"
        onDismiss={() => {}}
      />
    );

    expect(screen.queryByTestId("one-time-pat-secret-banner")).toBeNull();
  });

  it("hides receipt when ownerUserId is bound and currentUserId is null (signed out)", () => {
    render(
      <PatOneTimeSecretBanner
        t={(key) => key}
        receipt={{
          tokenId: "pat-2",
          tokenName: "Temp",
          plainTextSecret: "scr_pat_live_secret_value_999999",
          fingerprintOrPrefix: "scr_pat_live",
          isRotated: true,
          ownerUserId: "user-alice",
        }}
        currentUserId={null}
        onDismiss={() => {}}
      />
    );

    expect(screen.queryByTestId("one-time-pat-secret-banner")).toBeNull();
  });
});
