import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LogoMarquee } from "../components/welcome/LogoMarquee";

vi.mock("@core/providers/signup-theme", () => ({
  useSignupTheme: () => ({
    theme: "dark",
    tokens: { inkFaint: "#888" },
  }),
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) =>
    React.createElement("img", {
      src: props.src,
      alt: props.alt,
    }),
}));

describe("LogoMarquee", () => {
  it("renders only renderable logos that have a non-empty assetUrl", () => {
    render(
      <LogoMarquee
        caption="Trusted teams"
        logos={[
          { key: "valid-1", name: "Valid Club", assetUrl: "/brand/logo-1.svg" },
          { key: "empty-1", name: "Broken Club", assetUrl: "   " },
          { key: "valid-2", name: "Academy Two", assetUrl: "/brand/logo-2.svg" },
        ]}
      />
    );

    expect(screen.getByAltText("Valid Club")).toBeInTheDocument();
    expect(screen.getByAltText("Academy Two")).toBeInTheDocument();
    expect(screen.queryByAltText("Broken Club")).toBeNull();
  });
});
