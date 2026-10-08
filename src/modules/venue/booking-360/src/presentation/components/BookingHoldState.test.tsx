import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BookingHoldState } from "./BookingHoldState";

describe("BookingHoldState", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("anchors its countdown to server as-of time despite a skewed workstation clock", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2099-01-01T00:00:00Z"));
    const expired = vi.fn();

    render(
      <BookingHoldState
        expiresAtUtc="2026-09-10T06:30:10Z"
        asOfUtc="2026-09-10T06:30:00Z"
        locale="en"
        timeZoneId="UTC"
        confirming={false}
        canConfirm
        actionError={null}
        t={(key, values) => `${key}:${JSON.stringify(values ?? {})}`}
        onConfirm={vi.fn()}
        onExpired={expired}
      />
    );

    expect(screen.getByRole("button", { name: /^booking360.actions.confirm:/ })).toBeEnabled();
    expect(screen.getByText(/booking360\.hold\.remaining:.*"seconds":10/)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(9_000);
    });
    expect(expired).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /^booking360.actions.confirm:/ })).toBeEnabled();

    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(expired).toHaveBeenCalledOnce();
    expect(
      screen.queryByRole("button", { name: /^booking360.actions.confirm:/ })
    ).not.toBeInTheDocument();
  });
});
