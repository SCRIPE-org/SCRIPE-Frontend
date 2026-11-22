import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { JobStatusBadge } from "../src/presentation/components/JobStatusBadge";

describe("JobStatusBadge", () => {
  it("renders explicit pending semantic state with Clock icon for Queued (not Ban fallback)", () => {
    const { container } = render(<JobStatusBadge status="Queued" label="Queued" />);
    const badge = screen.getByText("Queued");

    expect(badge).toHaveAttribute("data-status", "Queued");
    expect(badge.className).toContain("text-nx-warning-strong");
    expect(container.querySelector("svg.lucide-clock")).toBeInTheDocument();
    expect(container.querySelector("svg.lucide-ban")).not.toBeInTheDocument();
  });

  it("renders warning variant and AlertTriangle icon for CompletedWithErrors", () => {
    const { container } = render(
      <JobStatusBadge status="CompletedWithErrors" label="Completed with Errors" />
    );
    const badge = screen.getByText("Completed with Errors");

    expect(badge).toHaveAttribute("data-status", "CompletedWithErrors");
    expect(badge.className).toContain("bg-warning/15");
    expect(badge.className).toContain("text-nx-warning-strong");
    expect(container.querySelector("svg.lucide-triangle-alert")).toBeInTheDocument();
    expect(container.querySelector("svg.lucide-ban")).not.toBeInTheDocument();
  });

  it("renders canonical danger variant for Failed", () => {
    const { container } = render(<JobStatusBadge status="Failed" label="Failed" />);
    const badge = screen.getByText("Failed");

    expect(badge).toHaveAttribute("data-status", "Failed");
    expect(badge.className).toContain("text-destructive");
    expect(container.querySelector("svg.lucide-circle-x")).toBeInTheDocument();
  });

  it("renders secondary Ban badge for Cancelled and Expired", () => {
    const { container, rerender } = render(
      <JobStatusBadge status="Cancelled" label="Cancelled" />
    );
    expect(container.querySelector("svg.lucide-ban")).toBeInTheDocument();

    rerender(<JobStatusBadge status="Expired" label="Expired" />);
    expect(screen.getByText("Expired")).toHaveAttribute("data-status", "Expired");
    expect(container.querySelector("svg.lucide-ban")).toBeInTheDocument();
  });
});
