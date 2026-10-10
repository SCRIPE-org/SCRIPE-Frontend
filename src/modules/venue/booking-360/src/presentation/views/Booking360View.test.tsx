import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePermission } from "@core/hooks/use-permission";
import { useBooking360ViewModel } from "../viewmodels/useBooking360ViewModel";
import { useBookingFinanceSummary } from "../viewmodels/useBookingFinanceSummary";
import { Booking360View } from "./Booking360View";

vi.mock("@core/hooks/use-module-locales", () => ({ useModuleLocales: vi.fn() }));
vi.mock("@core/providers/i18n-provider", () => ({ useI18n: () => ({ t: (key: string) => key, language: "en", direction: "ltr" }) }));
vi.mock("@core/hooks/use-permission", () => ({ usePermission: vi.fn() }));
vi.mock("../viewmodels/useBooking360ViewModel", () => ({ useBooking360ViewModel: vi.fn() }));
vi.mock("../viewmodels/useBookingFinanceSummary", () => ({ useBookingFinanceSummary: vi.fn() }));

const reservation = {
  id: "reservation-1", reservationNumber: "RES-1", status: "Held", resourceId: "resource-1",
  requestedStartUtc: "2026-09-10T07:00:00Z", requestedEndUtc: "2026-09-10T08:00:00Z",
  quantity: 2, customerPartyId: "party-1", createdAt: "2026-09-10T06:00:00Z", modifiedAt: null,
  asOfUtc: "2026-09-10T06:30:00Z", activeHold: { id: "hold-1", expiresAtUtc: "2999-09-10T07:30:00Z" },
  history: [
    { fromStatus: null, toStatus: "Draft", transitionCode: "T01", occurredAtUtc: "2026-09-10T06:00:00Z", reason: null },
    { fromStatus: "Draft", toStatus: "Held", transitionCode: "T04", occurredAtUtc: "2026-09-10T06:10:00Z", reason: null },
  ],
};

function vm(patch: Record<string, unknown> = {}) {
  return {
    state: {
      stage: "ready", reservation, customer: { id: "party-1", type: "Person", displayName: "Mona Hassan" },
      resource: { id: "resource-1", name: "Court 1", facilityResourceProfileId: "profile-1" },
      profile: { name: "Indoor Court", timeZoneId: "Africa/Cairo" },
      facility: { id: "facility-1", name: "Downtown" }, enrichmentLoading: false, customerError: false,
      resourceError: false, facilityError: false, activeAction: null, actionError: null,
      operationalFeedback: null, ...patch,
    },
    refresh: vi.fn(), confirm: vi.fn(), checkIn: vi.fn(), complete: vi.fn(),
    markNoShow: vi.fn(), holdExpired: vi.fn(),
  };
}

describe("Booking360View", () => {
  beforeEach(() => {
    vi.mocked(usePermission).mockReturnValue(true);
    vi.mocked(useBooking360ViewModel).mockReturnValue(vm() as never);
    vi.mocked(useBookingFinanceSummary).mockReturnValue({
      summary: null,
      loading: false,
      error: false,
      refresh: vi.fn(),
    });
  });

  it("renders canonical identity, schedule, customer, active hold, and chronological history", () => {
    render(<Booking360View reservationId="reservation-1" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("RES-1");
    expect(screen.getByRole("heading", { level: 1 })).toHaveFocus();
    expect(screen.getAllByText("Mona Hassan").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Court 1").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Downtown").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("list", { name: "booking360.history.title" })).toHaveTextContent("booking360.transition.T01");
    expect(screen.getByRole("button", { name: "booking360.actions.confirm" })).toBeEnabled();
  });

  it("renders terminal state without unsupported operational actions", () => {
    vi.mocked(useBooking360ViewModel).mockReturnValue(vm({ reservation: { ...reservation, status: "Completed", activeHold: null } }) as never);
    render(<Booking360View reservationId="reservation-1" />);
    expect(screen.getByText("booking360.status.Completed")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "booking360.actions.confirm" })).not.toBeInTheDocument();
    expect(screen.queryByText(/cancel|check.?in|reschedule/i)).not.toBeInTheDocument();
  });

  it("does not mislabel the correctable NoShow state as terminal", () => {
    vi.mocked(useBooking360ViewModel).mockReturnValue(vm({ reservation: { ...reservation, status: "NoShow", activeHold: null } }) as never);
    render(<Booking360View reservationId="reservation-1" />);
    expect(screen.getByText("booking360.status.NoShow")).toBeInTheDocument();
    expect(screen.queryByText("booking360.status.terminal")).not.toBeInTheDocument();
  });

  it("presents an active PendingApproval hold without exposing the Held-only Confirm action", () => {
    vi.mocked(useBooking360ViewModel).mockReturnValue(vm({ reservation: { ...reservation, status: "PendingApproval" } }) as never);
    render(<Booking360View reservationId="reservation-1" />);
    expect(screen.getByText("booking360.hold.active")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "booking360.actions.confirm" })).not.toBeInTheDocument();
  });

  it("renders Confirmed state without retaining the converted hold action", () => {
    vi.mocked(useBooking360ViewModel).mockReturnValue(vm({ reservation: { ...reservation, status: "Confirmed", activeHold: null } }) as never);
    render(<Booking360View reservationId="reservation-1" />);
    expect(screen.getByText("booking360.status.Confirmed")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "booking360.actions.confirm" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "booking360.actions.checkIn" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "booking360.actions.markNoShow" })).toBeEnabled();
  });

  it("keeps action permissions independent while reservation view remains available", () => {
    vi.mocked(usePermission).mockImplementation((permission) =>
      permission !== "reservations.no-show" && permission !== "reservations.complete");
    vi.mocked(useBooking360ViewModel).mockReturnValue(vm({
      reservation: { ...reservation, status: "Confirmed", activeHold: null },
    }) as never);

    render(<Booking360View reservationId="reservation-1" />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("RES-1");
    expect(screen.getByRole("button", { name: "booking360.actions.checkIn" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "booking360.actions.markNoShow" }))
      .not.toBeInTheDocument();
  });

  it("hides Confirm without reservations.confirm and when no live hold remains", () => {
    vi.mocked(usePermission).mockImplementation((permission) => permission !== "reservations.confirm");
    const { unmount } = render(<Booking360View reservationId="reservation-1" />);
    expect(screen.queryByRole("button", { name: "booking360.actions.confirm" })).not.toBeInTheDocument();
    unmount();

    vi.mocked(usePermission).mockReturnValue(true);
    vi.mocked(useBooking360ViewModel).mockReturnValue(vm({ reservation: { ...reservation, activeHold: null } }) as never);
    render(<Booking360View reservationId="reservation-1" />);
    expect(screen.getByText("booking360.hold.none")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "booking360.actions.confirm" })).not.toBeInTheDocument();
  });

  it("degrades a Party failure without hiding the reservation", () => {
    vi.mocked(useBooking360ViewModel).mockReturnValue(vm({ customer: null, customerError: true }) as never);
    render(<Booking360View reservationId="reservation-1" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("RES-1");
    expect(screen.getByText("booking360.customer.unavailable")).toBeInTheDocument();
  });

  it("invokes Confirm from a keyboard-operable native button", () => {
    const value = vm();
    vi.mocked(useBooking360ViewModel).mockReturnValue(value as never);
    render(<Booking360View reservationId="reservation-1" />);
    fireEvent.keyDown(screen.getByRole("button", { name: "booking360.actions.confirm" }), { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: "booking360.actions.confirm" }));
    expect(value.confirm).toHaveBeenCalledOnce();
  });

  it("renders permission, feature, not-found, and retryable network states distinctly", () => {
    vi.mocked(usePermission).mockImplementation((permission) => permission !== "reservations.view");
    const permission = render(<Booking360View reservationId="reservation-1" />);
    expect(screen.getByText("booking360.permission.title")).toBeInTheDocument();
    permission.unmount();

    vi.mocked(usePermission).mockReturnValue(true);
    vi.mocked(useBooking360ViewModel).mockReturnValue(vm({ stage: "featureUnavailable", reservation: null }) as never);
    const feature = render(<Booking360View reservationId="reservation-1" />);
    expect(screen.getByText("booking360.feature.title")).toBeInTheDocument();
    feature.unmount();

    vi.mocked(useBooking360ViewModel).mockReturnValue(vm({ stage: "notFound", reservation: null }) as never);
    const missing = render(<Booking360View reservationId="reservation-1" />);
    expect(screen.getByText("booking360.notFound.title")).toBeInTheDocument();
    missing.unmount();

    vi.mocked(useBooking360ViewModel).mockReturnValue(vm({ stage: "error", reservation: null }) as never);
    render(<Booking360View reservationId="reservation-1" />);
    expect(screen.getByRole("button", { name: "booking360.error.retry" })).toBeInTheDocument();
  });

  it("renders commercial invoice summary with receivables and payment links when outstanding balance exists", () => {
    vi.mocked(useBookingFinanceSummary).mockReturnValue({
      summary: {
        invoiceId: "inv-101",
        invoiceNumber: "INV-101",
        currencyCode: "USD",
        effectiveTotalAmount: 150,
        paidAmount: 100,
        outstandingAmount: 50,
        creditAmount: 0,
        status: "Issued",
      },
      loading: false,
      error: false,
      refresh: vi.fn(),
    });
    render(<Booking360View reservationId="reservation-1" />);
    expect(screen.getByText("INV-101")).toBeInTheDocument();
    expect(screen.getByText("booking360.commercial.viewReceivables")).toHaveAttribute("href", "/venue/money/receivables");
    expect(screen.getByText("booking360.commercial.recordPayment")).toHaveAttribute("href", "/venue/money/payments?invoiceId=inv-101");
  });

  it("renders authoritative advisory when booking is cancelled with recorded payment without fabricating refund", () => {
    vi.mocked(useBooking360ViewModel).mockReturnValue(vm({
      reservation: { ...reservation, status: "Cancelled", activeHold: null },
    }) as never);
    vi.mocked(useBookingFinanceSummary).mockReturnValue({
      summary: {
        invoiceId: "inv-202",
        invoiceNumber: "INV-202",
        currencyCode: "EGP",
        effectiveTotalAmount: 800,
        paidAmount: 800,
        outstandingAmount: 0,
        creditAmount: 0,
        status: "Paid",
      },
      loading: false,
      error: false,
      refresh: vi.fn(),
    });
    render(<Booking360View reservationId="reservation-1" />);

    expect(screen.getByTestId("cancelled-paid-advisory")).toBeInTheDocument();
    expect(screen.getByText("booking360.cancelledPaid.title")).toBeInTheDocument();
    expect(screen.getByText("booking360.cancelledPaid.manageRefund")).toHaveAttribute(
      "href",
      "/venue/money/payments?invoiceId=inv-202"
    );
  });

  it("renders contextual deep links for Court, Calendar, and Customer", () => {
    render(<Booking360View reservationId="reservation-1" />);
    expect(screen.getByText("(booking360.schedule.viewCourt)")).toHaveAttribute(
      "href",
      "/venue/resources/resource-1"
    );
    expect(screen.getByText("(booking360.schedule.viewInCalendar)")).toHaveAttribute(
      "href",
      "/venue/calendar?resourceId=resource-1"
    );
    expect(screen.getByText("booking360.customer.viewCustomer")).toHaveAttribute(
      "href",
      "/venue/customers?partyId=party-1"
    );
  });
});

