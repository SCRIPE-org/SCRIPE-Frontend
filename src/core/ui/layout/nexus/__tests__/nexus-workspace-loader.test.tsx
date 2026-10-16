import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NexusWorkspaceLoader } from "../nexus-workspace-loader";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: { name?: string }) => {
      if (params?.name) return `Launching ${params.name}`;
      return key;
    },
    direction: "ltr",
  }),
}));

vi.mock("../nexus-transition", () => ({
  useNexusReducedMotion: () => false,
}));

describe("NexusWorkspaceLoader", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not render into DOM when show is false on mount", () => {
    const { container } = render(
      <NexusWorkspaceLoader show={false} workspaceName="Academy" workspaceAbbr="AC" />
    );

    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId("nexus-workspace-loader")).toBeNull();
  });

  it("renders into DOM when show is true and transitions entering -> visible", () => {
    render(
      <NexusWorkspaceLoader show={true} workspaceName="Academy" workspaceAbbr="AC" />
    );

    const loader = screen.getByTestId("nexus-workspace-loader");
    expect(loader).toBeInTheDocument();
    expect(loader.getAttribute("data-phase")).toBe("entering");

    // Advance past ENTER_MS (180ms)
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(loader.getAttribute("data-phase")).toBe("visible");
  });

  it("reliably transitions to exiting and unmounts from DOM after show becomes false", async () => {
    const onExited = vi.fn();
    const { rerender } = render(
      <NexusWorkspaceLoader
        show={true}
        workspaceName="Academy"
        workspaceAbbr="AC"
        onExited={onExited}
      />
    );

    // Settle to visible
    act(() => {
      vi.advanceTimersByTime(200);
    });

    const loader = screen.getByTestId("nexus-workspace-loader");
    expect(loader.getAttribute("data-phase")).toBe("visible");

    // Hide loader
    rerender(
      <NexusWorkspaceLoader
        show={false}
        workspaceName="Academy"
        workspaceAbbr="AC"
        onExited={onExited}
      />
    );

    // Immediately transitions to exiting with pointer-events-none and opacity-0
    const exitingLoader = screen.getByTestId("nexus-workspace-loader");
    expect(exitingLoader.getAttribute("data-phase")).toBe("exiting");
    expect(exitingLoader.className).toContain("opacity-0");
    expect(exitingLoader.className).toContain("pointer-events-none");

    // Advance past EXIT_MS (200ms)
    act(() => {
      vi.advanceTimersByTime(250);
    });

    // Loader MUST unmount completely from DOM
    expect(screen.queryByTestId("nexus-workspace-loader")).toBeNull();
    expect(onExited).toHaveBeenCalledTimes(1);
  });

  it("does not cancel unmount timer on re-render while exiting", () => {
    const onExited = vi.fn();
    const { rerender } = render(
      <NexusWorkspaceLoader
        show={true}
        workspaceName="Academy"
        workspaceAbbr="AC"
        onExited={onExited}
      />
    );

    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Trigger exit
    rerender(
      <NexusWorkspaceLoader
        show={false}
        workspaceName="Academy"
        workspaceAbbr="AC"
        onExited={onExited}
      />
    );

    expect(screen.getByTestId("nexus-workspace-loader")).toBeInTheDocument();

    // Cause a neutral re-render with identical props during exit
    rerender(
      <NexusWorkspaceLoader
        show={false}
        workspaceName="Academy"
        workspaceAbbr="AC"
        onExited={onExited}
      />
    );

    // Advance remaining exit time
    act(() => {
      vi.advanceTimersByTime(250);
    });

    // Unmount must have still fired despite the re-render!
    expect(screen.queryByTestId("nexus-workspace-loader")).toBeNull();
    expect(onExited).toHaveBeenCalledTimes(1);
  });
});
