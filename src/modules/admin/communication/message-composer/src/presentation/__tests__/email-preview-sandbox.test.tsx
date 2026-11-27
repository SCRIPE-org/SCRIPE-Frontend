import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EmailPreviewDialog } from "../components/EmailPreviewDialog";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr" as const,
    language: "en" as const,
  }),
}));

describe("EmailPreviewDialog sandbox hardening (EMAIL-SANDBOX-01)", () => {
  it("renders preview iframe with empty sandbox='' (no allow-same-origin or allow-scripts) and sanitizes HTML via DOMPurify", () => {
    render(
      <EmailPreviewDialog
        open={true}
        onOpenChange={vi.fn()}
        subject="Welcome"
        body={'<p>Hello member</p><script>alert(1)</script><img src="https://cdn.scripe.org/a.png" onerror="alert(2)" />'}
        recipients={["member@scripe.test"]}
      />
    );

    const iframe = screen.getByTitle("messaging.email.previewTitle");
    expect(iframe.tagName).toBe("IFRAME");
    expect(iframe).toHaveAttribute("sandbox", "");
    const sandboxAttr = iframe.getAttribute("sandbox") ?? "";
    expect(sandboxAttr).not.toContain("allow-same-origin");
    expect(sandboxAttr).not.toContain("allow-scripts");

    const srcDoc = iframe.getAttribute("srcdoc") ?? "";
    expect(srcDoc).toContain("<p>Hello member</p>");
    expect(srcDoc).not.toContain("<script");
    expect(srcDoc).not.toContain("onerror");
    expect(srcDoc).not.toContain("alert(1)");
    expect(srcDoc).not.toContain("alert(2)");
  });
});
