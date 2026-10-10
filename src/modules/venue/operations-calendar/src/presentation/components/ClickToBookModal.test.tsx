import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClickToBookModal } from "./ClickToBookModal";
import type { CalendarResource } from "../../domain/entities/OperationsCalendar";

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
let mockLang = "en";
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, opts?: { defaultValue?: string; time?: string; duration?: number; amount?: number; currency?: string }) => {
      const dict: Record<string, string> = {
        "operationsCalendar.clickToBook.stepper.courtAndTime": "Court & Time",
        "operationsCalendar.clickToBook.stepper.customer": "Customer",
        "operationsCalendar.clickToBook.stepper.confirm": "Confirm",
        "operationsCalendar.clickToBook.customer.title": "Customer",
        "operationsCalendar.clickToBook.customer.searchPlaceholder": "Search customer by name, phone or email...",
        "operationsCalendar.clickToBook.customer.addNew": "+ New Customer",
        "operationsCalendar.clickToBook.customer.searchExisting": "Search Existing",
        "operationsCalendar.clickToBook.customer.quickAddTitle": "Quick Add Customer",
        "operationsCalendar.clickToBook.customer.namePlaceholder": "Customer Name",
        "operationsCalendar.clickToBook.customer.createAndSelect": "Create & Select",
        "operationsCalendar.clickToBook.customer.duplicateWarning": "A customer with similar details already exists",
        "operationsCalendar.clickToBook.pricing.title": "Pricing Summary",
        "operationsCalendar.clickToBook.pricing.courtPrice": "Court Rental",
        "operationsCalendar.clickToBook.pricing.calculating": "Calculating authoritative price...",
        "operationsCalendar.clickToBook.pricing.failed": "Failed to calculate price quote.",
        "operationsCalendar.clickToBook.pricing.retry": "Retry Quote",
        "operationsCalendar.clickToBook.pricing.total": "Total",
        "operationsCalendar.clickToBook.confirm.action": "Confirm Booking",
        "operationsCalendar.clickToBook.confirm.next": "Next",
        "operationsCalendar.clickToBook.confirm.back": "Back",
        "operationsCalendar.clickToBook.confirm.cancel": "Cancel",
        "operationsCalendar.clickToBook.conflict.title": "This time is no longer available",
        "operationsCalendar.clickToBook.conflict.description": "Another booking was created for this court and time window.",
        "operationsCalendar.clickToBook.partialFailure.title": "Booking confirmed. Payment was not recorded.",
        "operationsCalendar.clickToBook.success.title": "Booking Confirmed!",
        "operationsCalendar.clickToBook.success.total": "Total",
        "operationsCalendar.clickToBook.success.paid": "Paid",
        "operationsCalendar.clickToBook.success.remaining": "Remaining",
        "operationsCalendar.clickToBook.success.recordPayment": "Record Payment",
        "operationsCalendar.clickToBook.success.recordAnotherPayment": "Record Another Payment",
        "operationsCalendar.clickToBook.success.openBooking": "Open Booking",
        "operationsCalendar.clickToBook.success.close": "Close",
        "operationsCalendar.clickToBook.payment.title": "Payment",
        "operationsCalendar.clickToBook.payment.payLater": "Pay Later",
        "operationsCalendar.clickToBook.payment.recordNow": "Record Payment Now",
        "operationsCalendar.clickToBook.hold.holdAction": "Hold Temporarily",
        "operationsCalendar.clickToBook.hold.temporaryBadge": "Temporarily Reserved",
      };
      return dict[key] ?? opts?.defaultValue ?? key;
    },
    language: mockLang,
    direction: mockLang === "ar" ? "rtl" : "ltr",
  }),
}));

// Mock permissions
let mockCanCreateBooking = true;
let mockCanRecordPayment = true;
let mockCanOverridePrice = false;
vi.mock("@core/hooks/use-permission", () => ({
  usePermission: (perm: string) => {
    if (perm === "Venue.Reservation.Create") return mockCanCreateBooking;
    if (perm === "Venue.Finance.Payments.Create" || perm === "Venue.Finance.Payments.View") return mockCanRecordPayment;
    if (perm === "Venue.CatalogPricing.OverrideCommercials") return mockCanOverridePrice;
    return true;
  },
}));

// Mock repositories
const mockBookingRepository = {
  createDraft: vi.fn(),
  createHold: vi.fn(),
  confirm: vi.fn(),
  getReservation: vi.fn(),
};

const mockCustomerRepository = {
  search: vi.fn(),
  create: vi.fn(),
};

const mockCommercialPricingRepository = {
  getResourceConfiguration: vi.fn(),
  calculateQuote: vi.fn(),
};

const mockMoneyRepository = {
  recordPayment: vi.fn(),
};

const mockSchedulableResourceRepository = {
  getById: vi.fn(),
};

vi.mock("@modules/venue/di", () => ({
  getVenueContainer: () => ({
    bookingRepository: mockBookingRepository,
    customerRepository: mockCustomerRepository,
    commercialPricingRepository: mockCommercialPricingRepository,
    moneyRepository: mockMoneyRepository,
    schedulableResourceRepository: mockSchedulableResourceRepository,
  }),
}));

const mockResource: CalendarResource = {
  id: "res-padel-1",
  name: "Padel Court 1",
  profileId: "prof-1",
  profileName: "Standard Court",
  facilityId: "fac-1",
  facilityName: "Nasr City Club",
  resourceKindCode: "Padel",
  timeZoneId: "Africa/Cairo",
};

const sampleQuote = {
  id: "quote-123",
  quoteNumber: "Q-123",
  offeringId: "off-1",
  schedulableResourceId: "res-padel-1",
  partyId: "cust-1",
  quantity: 1,
  requestedStartUtc: "2026-10-09T10:00:00.000Z",
  requestedEndUtc: "2026-10-09T11:00:00.000Z",
  currencyCode: "EGP",
  subtotalAmount: 500,
  discountAmount: 0,
  taxAmount: 70,
  roundingAdjustment: 0,
  grandTotal: 570,
  status: "Calculated",
  expiresAtUtc: new Date(Date.now() + 600000).toISOString(),
  wasIdempotentReplay: false,
};

describe("ClickToBookModal — Gate 4 Booking Closure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLang = "en";
    mockCanCreateBooking = true;
    mockCanRecordPayment = true;
    mockCanOverridePrice = false;

    mockCommercialPricingRepository.getResourceConfiguration.mockResolvedValue({
      offeringId: "off-1",
      currencyCode: "EGP",
    });
    mockCommercialPricingRepository.calculateQuote.mockResolvedValue(sampleQuote);
    mockBookingRepository.createDraft.mockResolvedValue({ id: "resv-draft-1" });
    mockBookingRepository.createHold.mockResolvedValue({
      reservationId: "resv-draft-1",
      bookingHoldId: "hold-1",
      expiresAtUtc: new Date(Date.now() + 300000).toISOString(),
    });
    mockBookingRepository.confirm.mockResolvedValue({
      reservationId: "resv-draft-1",
      reservationNumber: "RESV-2026-001",
    });
    mockBookingRepository.getReservation.mockResolvedValue({
      id: "resv-draft-1",
      reservationNumber: "RESV-2026-001",
    });
    mockSchedulableResourceRepository.getById.mockResolvedValue(null);
  });

  it("1. Mode A (Contextual Calendar Booking): skips redundant Court/Time selection and begins directly on Customer", () => {
    render(
      <ClickToBookModal
        open={true}
        onOpenChange={vi.fn()}
        resource={mockResource}
        instantUtc="2026-10-09T10:00:00.000Z"
        timeZoneId="Africa/Cairo"
        onSuccess={vi.fn()}
      />
    );

    // Context summary appears at top
    expect(screen.getByText("Padel Court 1")).toBeInTheDocument();
    expect(screen.getByText("Nasr City Club")).toBeInTheDocument();

    // Directly renders Customer search (Step 1)
    expect(
      screen.getByPlaceholderText("Search customer by name, phone or email...")
    ).toBeInTheDocument();
  });

  it("2. Mode B (Global New Booking): prompts for Court & Time before advancing to Customer", () => {
    render(
      <ClickToBookModal
        open={true}
        onOpenChange={vi.fn()}
        resource={null}
        instantUtc={null}
        timeZoneId="Africa/Cairo"
        resources={[mockResource]}
        onSuccess={vi.fn()}
      />
    );

    // Renders Court selection in Step 0
    expect(screen.getByText("Padel Court 1 (Nasr City Club)")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();

    // Click Next moves to Customer
    fireEvent.click(screen.getByText("Next"));
    expect(
      screen.getByPlaceholderText("Search customer by name, phone or email...")
    ).toBeInTheDocument();
  });

  it("2b. Booking Duration Truth: 60 min with AllowMultiSlot = false allows ONLY 60 min", () => {
    const singleSlotResource: CalendarResource = {
      ...mockResource,
      slotPolicy: {
        slotDurationMinutes: 60,
        allowMultiSlot: false,
      },
    };

    render(
      <ClickToBookModal
        open={true}
        onOpenChange={vi.fn()}
        resource={null}
        instantUtc={null}
        timeZoneId="Africa/Cairo"
        resources={[singleSlotResource]}
        onSuccess={vi.fn()}
      />
    );

    // Only 60 min is rendered (no multi-slot options)
    expect(screen.getByText("60 min")).toBeInTheDocument();
    expect(screen.queryByText("120 min (2 hr)")).not.toBeInTheDocument();
    expect(screen.queryByText("180 min (3 hr)")).not.toBeInTheDocument();
  });

  it("2c. Booking Duration Truth: 60 min with AllowMultiSlot = true renders legal multiples (60, 120, 180)", () => {
    const multiSlotResource: CalendarResource = {
      ...mockResource,
      slotPolicy: {
        slotDurationMinutes: 60,
        allowMultiSlot: true,
      },
    };

    render(
      <ClickToBookModal
        open={true}
        onOpenChange={vi.fn()}
        resource={null}
        instantUtc={null}
        timeZoneId="Africa/Cairo"
        resources={[multiSlotResource]}
        onSuccess={vi.fn()}
      />
    );

    // Multiple legal multiples are rendered in select
    expect(screen.getByText("60 min (1 hr)")).toBeInTheDocument();
    expect(screen.getByText("120 min (2 hr)")).toBeInTheDocument();
    expect(screen.getByText("180 min (3 hr)")).toBeInTheDocument();
  });

  it("2d. Booking Duration Truth: 90 min with AllowMultiSlot = false allows ONLY 90 min", () => {
    const ninetyMinResource: CalendarResource = {
      ...mockResource,
      slotPolicy: {
        slotDurationMinutes: 90,
        allowMultiSlot: false,
      },
    };

    render(
      <ClickToBookModal
        open={true}
        onOpenChange={vi.fn()}
        resource={null}
        instantUtc={null}
        timeZoneId="Africa/Cairo"
        resources={[ninetyMinResource]}
        onSuccess={vi.fn()}
      />
    );

    // Only 90 min is displayed
    expect(screen.getByText("90 min")).toBeInTheDocument();
    expect(screen.queryByText("60 min")).not.toBeInTheDocument();
    expect(screen.queryByText("180 min")).not.toBeInTheDocument();
  });

  it("3. Customer search triggers customerRepository.search and renders results", async () => {
    mockCustomerRepository.search.mockResolvedValue([
      { id: "cust-1", displayName: "Ahmed Salah", type: "01001234567" },
    ]);

    render(
      <ClickToBookModal
        open={true}
        onOpenChange={vi.fn()}
        resource={mockResource}
        instantUtc="2026-10-09T10:00:00.000Z"
        timeZoneId="Africa/Cairo"
        onSuccess={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(
      "Search customer by name, phone or email..."
    );
    fireEvent.change(input, { target: { value: "Ahmed" } });

    await waitFor(() => {
      expect(mockCustomerRepository.search).toHaveBeenCalledWith("Ahmed");
      expect(screen.getByText("Ahmed Salah")).toBeInTheDocument();
    });
  });

  it("4. Quick Add Customer validates name, creates customer on backend, and selects them automatically", async () => {
    mockCustomerRepository.create.mockResolvedValue({
      id: "cust-new-1",
      displayName: "Tamer Hosny",
      type: "0111223344",
    });

    render(
      <ClickToBookModal
        open={true}
        onOpenChange={vi.fn()}
        resource={mockResource}
        instantUtc="2026-10-09T10:00:00.000Z"
        timeZoneId="Africa/Cairo"
        onSuccess={vi.fn()}
      />
    );

    // Open Quick Add form
    fireEvent.click(screen.getByText("+ New Customer"));

    const nameInput = screen.getByPlaceholderText("Customer Name");
    fireEvent.change(nameInput, { target: { value: "Tamer Hosny" } });

    fireEvent.click(screen.getByText("Create & Select"));

    await waitFor(() => {
      expect(mockCustomerRepository.create).toHaveBeenCalledWith("Tamer Hosny", "Person");
      // Advances to Step 2 with Pricing Summary
      expect(screen.getByText("Pricing Summary")).toBeInTheDocument();
      expect(screen.getByText("Tamer Hosny")).toBeInTheDocument();
    });
  });

  it("5. Duplicate customer warning appears when name/phone already exists in search results", async () => {
    mockCustomerRepository.search.mockResolvedValue([
      { id: "cust-1", displayName: "Ahmed Salah", type: "01001234567" },
    ]);

    render(
      <ClickToBookModal
        open={true}
        onOpenChange={vi.fn()}
        resource={mockResource}
        instantUtc="2026-10-09T10:00:00.000Z"
        timeZoneId="Africa/Cairo"
        onSuccess={vi.fn()}
      />
    );

    // Search for existing
    const searchInput = screen.getByPlaceholderText(
      "Search customer by name, phone or email..."
    );
    fireEvent.change(searchInput, { target: { value: "Ahmed" } });
    await waitFor(() => expect(screen.getByText("Ahmed Salah")).toBeInTheDocument());

    // Try quick add with exact duplicate name
    fireEvent.click(screen.getByText("+ New Customer"));
    const nameInput = screen.getByPlaceholderText("Customer Name");
    fireEvent.change(nameInput, { target: { value: "Ahmed Salah" } });

    fireEvent.click(screen.getByText("Create & Select"));

    // Duplicate warning banner appears
    expect(
      screen.getByText(/A customer with similar details already exists: Ahmed Salah/i)
    ).toBeInTheDocument();
    expect(mockCustomerRepository.create).not.toHaveBeenCalled();
  });

  it("6. Pricing truth: calculates quote from backend and displays authoritative grand total", async () => {
    mockCustomerRepository.create.mockResolvedValue({
      id: "cust-1",
      displayName: "Karim",
      type: "Person",
    });

    render(
      <ClickToBookModal
        open={true}
        onOpenChange={vi.fn()}
        resource={mockResource}
        instantUtc="2026-10-09T10:00:00.000Z"
        timeZoneId="Africa/Cairo"
        onSuccess={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("+ New Customer"));
    fireEvent.change(screen.getByPlaceholderText("Customer Name"), {
      target: { value: "Karim" },
    });
    fireEvent.click(screen.getByText("Create & Select"));

    await waitFor(() => {
      expect(mockCommercialPricingRepository.calculateQuote).toHaveBeenCalled();
      expect(screen.getByText("570 EGP")).toBeInTheDocument();
    });
  });

  it("7. Quote failure shows actionable retry and disables confirmation (no fake numbers)", async () => {
    mockCommercialPricingRepository.calculateQuote.mockRejectedValue(
      new Error("Catalog service unavailable")
    );
    mockCustomerRepository.create.mockResolvedValue({
      id: "cust-1",
      displayName: "Karim",
      type: "Person",
    });

    render(
      <ClickToBookModal
        open={true}
        onOpenChange={vi.fn()}
        resource={mockResource}
        instantUtc="2026-10-09T10:00:00.000Z"
        timeZoneId="Africa/Cairo"
        onSuccess={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("+ New Customer"));
    fireEvent.change(screen.getByPlaceholderText("Customer Name"), {
      target: { value: "Karim" },
    });
    fireEvent.click(screen.getByText("Create & Select"));

    await waitFor(() => {
      expect(screen.getByText("Catalog service unavailable")).toBeInTheDocument();
      expect(screen.getByText("Retry Quote")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /confirm booking/i })).toBeDisabled();
    });
  });

  it("8. Concurrency conflict (409) recovers with customer-friendly recovery view", async () => {
    mockCustomerRepository.create.mockResolvedValue({
      id: "cust-1",
      displayName: "Karim",
      type: "Person",
    });
    mockBookingRepository.createDraft.mockRejectedValue(
      new Error("409 Conflict: Slot has overlap")
    );

    render(
      <ClickToBookModal
        open={true}
        onOpenChange={vi.fn()}
        resource={mockResource}
        instantUtc="2026-10-09T10:00:00.000Z"
        timeZoneId="Africa/Cairo"
        onSuccess={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("+ New Customer"));
    fireEvent.change(screen.getByPlaceholderText("Customer Name"), {
      target: { value: "Karim" },
    });
    fireEvent.click(screen.getByText("Create & Select"));

    await waitFor(() => expect(screen.getByText("Confirm Booking")).toBeEnabled());
    fireEvent.click(screen.getByText("Confirm Booking"));

    await waitFor(() => {
      expect(screen.getByText("This time is no longer available")).toBeInTheDocument();
      expect(
        screen.getByText("Another booking was created for this court and time window.")
      ).toBeInTheDocument();
    });
  });

  it("9. Critical partial failure: booking confirms even if subsequent payment fails", async () => {
    mockCustomerRepository.create.mockResolvedValue({
      id: "cust-1",
      displayName: "Karim",
      type: "Person",
    });
    // Payment fails
    mockMoneyRepository.recordPayment.mockRejectedValue(new Error("Gateway timeout"));

    render(
      <ClickToBookModal
        open={true}
        onOpenChange={vi.fn()}
        resource={mockResource}
        instantUtc="2026-10-09T10:00:00.000Z"
        timeZoneId="Africa/Cairo"
        onSuccess={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("+ New Customer"));
    fireEvent.change(screen.getByPlaceholderText("Customer Name"), {
      target: { value: "Karim" },
    });
    fireEvent.click(screen.getByText("Create & Select"));

    await waitFor(() => expect(screen.getByText("Confirm Booking")).toBeEnabled());

    // Select Record Payment Now
    fireEvent.click(screen.getByText("Record Payment Now"));

    fireEvent.click(screen.getByText("Confirm Booking"));

    await waitFor(() => {
      // Booking is CONFIRMED!
      expect(screen.getByText("Booking Confirmed!")).toBeInTheDocument();
      // Partial failure notice displayed
      expect(
        screen.getByText("Booking confirmed. Payment was not recorded.")
      ).toBeInTheDocument();
      // Record Payment button is available to retry
      expect(screen.getByRole("button", { name: "Record Payment" })).toBeInTheDocument();
    });
  });

  it("10. Success screen displays Record Payment when 0 paid, NOT Record Another Payment", async () => {
    mockCustomerRepository.create.mockResolvedValue({
      id: "cust-1",
      displayName: "Karim",
      type: "Person",
    });

    render(
      <ClickToBookModal
        open={true}
        onOpenChange={vi.fn()}
        resource={mockResource}
        instantUtc="2026-10-09T10:00:00.000Z"
        timeZoneId="Africa/Cairo"
        onSuccess={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("+ New Customer"));
    fireEvent.change(screen.getByPlaceholderText("Customer Name"), {
      target: { value: "Karim" },
    });
    fireEvent.click(screen.getByText("Create & Select"));

    await waitFor(() => expect(screen.getByText("Confirm Booking")).toBeEnabled());
    // Default is Pay Later
    fireEvent.click(screen.getByText("Confirm Booking"));

    await waitFor(() => {
      expect(screen.getByText("Booking Confirmed!")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Record Payment" })).toBeInTheDocument();
      expect(screen.queryByText("Record Another Payment")).not.toBeInTheDocument();
    });
  });
});
