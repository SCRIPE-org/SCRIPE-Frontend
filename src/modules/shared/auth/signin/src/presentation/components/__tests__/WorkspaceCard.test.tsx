import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { WorkspaceCard } from "../WorkspaceCard";
import type { WorkspaceChoice } from "@modules/auth/core/domain/errors/AuthErrors";

// Stage-4 I18nRtl.md finding F-I18N8: the inline password-unlock field used
// physical pr-10/right-2.5 positioning with no dir="ltr" pin and no RTL
// branch at all — unlike the sibling CredentialsPasswordInput (main login
// form password field), which deliberately pins dir="ltr" and is exempt.
// This field is NOT dir="ltr"-pinned, so under an RTL ancestor its padding
// and eye-toggle position must come from logical ps-/pe-/start-/end-
// utilities (the codebase's established convention — mirrors
// core/ui/__tests__/switch.test.tsx's render-inside-dir="rtl" pattern, and
// is enforced, at "warn" level, by eslint.config.mjs's no-restricted-syntax
// rule banning physical ml-/mr-/pl-/pr-/left-/right- classes).
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

function buildWorkspace(overrides: Partial<WorkspaceChoice> = {}): WorkspaceChoice {
  return {
    tenantId: "tenant-1",
    tenantCode: "acme",
    tenantName: "Acme Co",
    logoUrl: null,
    isPlatformAdmin: false,
    isActivated: true,
    isPasswordVerified: false, // -> "passwordRequired" state, expandable inline password form
    ...overrides,
  };
}

describe("WorkspaceCard — inline unlock password field RTL positioning", () => {
  it("positions the password input and eye-toggle with logical utilities, not physical right-/pr- ones", () => {
    render(
      <div dir="rtl">
        <WorkspaceCard
          workspace={buildWorkspace()}
          isThisLoading={false}
          isAnyLoading={false}
          onSelect={() => {}}
          onUnlock={async () => {}}
        />
      </div>
    );

    // Expand the card to reveal the inline password form.
    fireEvent.click(screen.getByRole("button", { name: /Acme Co/i }));

    const input = screen.getByLabelText("Password for Acme Co");
    expect(input.className).toMatch(/(^|\s)pe-10(\s|$)/);
    expect(input.className).not.toMatch(/(^|\s)pr-10(\s|$)/);

    const toggle = screen.getByLabelText("Show password");
    expect(toggle.className).toMatch(/(^|\s)end-2\.5(\s|$)/);
    expect(toggle.className).not.toMatch(/(^|\s)right-2\.5(\s|$)/);
  });
});
