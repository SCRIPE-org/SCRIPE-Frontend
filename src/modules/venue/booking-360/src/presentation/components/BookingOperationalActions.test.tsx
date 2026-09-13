import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { BookingOperationalActions } from "./BookingOperationalActions";

const t = (key: string, values?: Record<string, string | number>) =>
  Object.entries(values ?? {}).reduce(
    (message, [name, value]) => message.replace(`{{${name}}}`, String(value)),
    key
  );

function renderActions(overrides: Partial<ComponentProps<typeof BookingOperationalActions>> = {}) {
  const props: ComponentProps<typeof BookingOperationalActions> = {
    status: "Confirmed",
    activeAction: null,
    feedback: null,
    canCheckIn: true,
    canComplete: true,
    canMarkNoShow: true,
    canCancel: true,
    canReschedule: true,
    canChangeResource: true,
    facilityId: "facility-1",
    resourceId: "resource-1",
    currentStartUtc: "2026-09-10T10:00:00Z",
    currentEndUtc: "2026-09-10T11:00:00Z",
    direction: "ltr",
    t,
    onCheckIn: vi.fn(),
    onComplete: vi.fn(),
    onMarkNoShow: vi.fn(),
    onCancel: vi.fn(),
    onReschedule: vi.fn(),
    onChangeResource: vi.fn(),
    ...overrides,
  };
  return { props, ...render(<BookingOperationalActions {...props} />) };
}

describe("BookingOperationalActions", () => {
  it("shows only independently authorized actions for the canonical current state", () => {
    const confirmed = renderActions({ canMarkNoShow: false });
    expect(screen.getByRole("button", { name: "booking360.actions.checkIn" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "booking360.actions.markNoShow" }))
      .not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "booking360.actions.complete" }))
      .not.toBeInTheDocument();
    confirmed.unmount();

    const checkedIn = renderActions({ status: "CheckedIn", canComplete: true });
    expect(screen.getByRole("button", { name: "booking360.actions.complete" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "booking360.actions.checkIn" }))
      .not.toBeInTheDocument();
    checkedIn.unmount();

    renderActions({ status: "Completed" });
    expect(screen.queryByTestId("booking-operational-actions")).not.toBeInTheDocument();
  });

  it("uses an intentional no-show dialog, validates reason, and restores focus on cancel", async () => {
    const { props } = renderActions();
    const trigger = screen.getByRole("button", { name: "booking360.actions.markNoShow" });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveAttribute("dir", "ltr");
    expect(screen.getByText("booking360.noShow.title")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "booking360.noShow.confirm" }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("booking360.noShow.reasonRequired");
    expect(props.onMarkNoShow).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "booking360.noShow.cancel" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("trims and submits the no-show reason through the semantic dialog action", () => {
    const { props } = renderActions({ direction: "rtl" });
    fireEvent.click(screen.getByRole("button", { name: "booking360.actions.markNoShow" }));
    expect(screen.getByRole("alertdialog")).toHaveAttribute("dir", "rtl");
    fireEvent.change(screen.getByLabelText("booking360.noShow.reasonLabel"), {
      target: { value: "  Customer did not arrive  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "booking360.noShow.confirm" }));

    expect(props.onMarkNoShow).toHaveBeenCalledOnce();
    expect(props.onMarkNoShow).toHaveBeenCalledWith("Customer did not arrive");
  });

  it("announces and focuses authoritative concurrency feedback with current status", async () => {
    renderActions({
      status: "NoShow",
      feedback: { action: "checkIn", kind: "concurrency", status: "NoShow" },
    });

    const region = screen.getByTestId("booking-operational-actions");
    await waitFor(() => expect(region).toHaveFocus());
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(screen.getByRole("status")).toHaveTextContent(
      "booking360.operations.feedback.concurrency"
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders booking context inside the no-show dialog when provided", () => {
    renderActions({
      bookingReference: "RES-98765",
      customerName: "Jane Doe",
      resourceName: "Padel Court 1",
      scheduledTime: "10:00 - 11:00",
    });
    fireEvent.click(screen.getByRole("button", { name: "booking360.actions.markNoShow" }));

    const contextBox = screen.getByTestId("no-show-booking-context");
    expect(contextBox).toBeInTheDocument();
    expect(contextBox).toHaveTextContent("RES-98765");
    expect(contextBox).toHaveTextContent("Jane Doe");
    expect(contextBox).toHaveTextContent("Padel Court 1");
    expect(contextBox).toHaveTextContent("10:00 - 11:00");
  });

  it("opens cancel dialog, validates reason, and invokes onCancel callback", async () => {
    const { props } = renderActions({ canCancel: true, canReschedule: true, canChangeResource: true });
    const trigger = screen.getByRole("button", { name: "booking360.actions.cancel" });
    fireEvent.click(trigger);

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("booking360.cancel.title")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("booking360.cancel.reasonLabel"), {
      target: { value: "   Customer cancelled booking   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "booking360.cancel.confirm" }));

    expect(props.onCancel).toHaveBeenCalledOnce();
    expect(props.onCancel).toHaveBeenCalledWith("Customer cancelled booking");
  });

  it.each(["Draft", "Requested", "Held", "PendingApproval"] as const)(
    "exposes the ordinary T13 cancellation action for %s",
    (status) => {
      renderActions({ status });
      expect(screen.getByRole("button", { name: "booking360.actions.cancel" })).toBeEnabled();
    }
  );

  it("opens reschedule dialog when reschedule action is clicked", () => {
    renderActions({ status: "Confirmed", canReschedule: true });
    const trigger = screen.getByRole("button", { name: "booking360.actions.reschedule" });
    fireEvent.click(trigger);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("booking360.reschedule.title")).toBeInTheDocument();
  });

  it("opens change resource dialog when change resource action is clicked", () => {
    renderActions({ status: "Confirmed", canChangeResource: true });
    const trigger = screen.getByRole("button", { name: "booking360.actions.changeResource" });
    fireEvent.click(trigger);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("booking360.changeResource.title")).toBeInTheDocument();
  });
});
