import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { ProductionComponent } from "../components/ProductionComponent";
import { ProductionCanvasRenderer } from "../components/ProductionCanvasRenderer";
import { PostCredentialWorkspaceSelector } from "../components/PostCredentialWorkspaceSelector";
import { getSafeRedirectPath } from "../utils/redirect-safety";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt ?? ""} />
  ),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr" as const,
    language: "en" as const,
    isRtl: false,
    setLanguage: vi.fn(),
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    buttonStyle: "default",
    borderRadius: "default",
    animationLevel: "default",
  }),
}));

vi.mock("@core/hooks/use-resolved-file-url", () => ({
  useResolvedFileUrl: () => null,
}));

vi.mock("@core/ui/layout/common/language-switcher", () => ({
  LanguageSwitcher: () => <button type="button">Lang</button>,
}));

vi.mock("@core/ui/layout/common/theme-switcher", () => ({
  ThemeSwitcher: () => <button type="button">Theme</button>,
}));

describe("Signin branding URL gating, single-main landmarks, and redirect safety", () => {
  it("gates ProductionComponent ctaButton props.url through isValidCtaUrl", () => {
    const { rerender } = render(
      <ProductionComponent
        type="ctaButton"
        props={{ label: "Evil CTA", url: "//evil.com" }}
        formContent={null}
        logoUrl=""
        companyName="SCRIPE"
      />
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Evil CTA")).toBeInTheDocument();

    rerender(
      <ProductionComponent
        type="ctaButton"
        props={{ label: "Safe CTA", url: "https://scripe.org/start" }}
        formContent={null}
        logoUrl=""
        companyName="SCRIPE"
      />
    );

    const link = screen.getByRole("link", { name: "Safe CTA" });
    expect(link).toHaveAttribute("href", "https://scripe.org/start");
  });

  it("renders a single outer <main> in ProductionCanvasRenderer and replaces nested role=main in PostCredentialWorkspaceSelector", () => {
    const { container } = render(
      <ProductionCanvasRenderer
        positionMode="grid"
        gridRows={12}
        direction="ltr"
        logoUrl=""
        companyName="SCRIPE"
        components={[
          {
            id: "form-1",
            type: "loginForm",
            gridColumn: "1 / 13",
            gridRow: "1 / 13",
            alignment: "center",
            verticalAlignment: "center",
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            props: {},
            zIndex: 1,
            visible: true,
          },
        ]}
        formContent={
          <PostCredentialWorkspaceSelector
            email="coach@ahly.eg"
            workspaces={[]}
            onSelect={vi.fn()}
            onUnlock={vi.fn()}
            onBack={vi.fn()}
          />
        }
      />
    );

    expect(container.querySelectorAll("main")).toHaveLength(1);
    expect(container.querySelectorAll('[role="main"]')).toHaveLength(0);
  });

  it("enforces safe redirect paths in getSafeRedirectPath", () => {
    expect(getSafeRedirectPath("//evil.com", "/")).toBe("/");
    expect(getSafeRedirectPath("/\\evil.com", "/")).toBe("/");
    expect(getSafeRedirectPath("https://evil.com/phish", "/")).toBe("/");
    expect(getSafeRedirectPath("/dashboard?view=grid", "/")).toBe("/dashboard?view=grid");
  });
});
