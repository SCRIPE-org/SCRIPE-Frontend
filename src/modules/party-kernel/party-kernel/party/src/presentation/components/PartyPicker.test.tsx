import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PartyPicker, type PartySelectionResult } from "./PartyPicker";

const mockPartyRepository = {
  lookupContacts: vi.fn(),
  createPerson: vi.fn(),
  createOrganization: vi.fn(),
};

vi.mock("../../../../di", () => ({
  getPartyKernelContainer: () => ({
    partyRepository: mockPartyRepository,
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en",
    direction: "ltr",
  }),
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: () => true,
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("PartyPicker Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders trigger placeholder when no party is selected", () => {
    renderWithClient(
      <PartyPicker value={null} onSelect={vi.fn()} placeholder="Select a contact..." />
    );

    expect(screen.getByText("Select a contact...")).toBeInTheDocument();
    const trigger = screen.getByTestId("party-picker-trigger");
    expect(trigger).toHaveAttribute("role", "combobox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("renders selected party display name without leaking raw GUIDs or tokens", () => {
    const selected: PartySelectionResult = {
      id: "encrypted-token-xyz-1234567890",
      type: "Person",
      displayName: "Dr. Fatima Zahra",
      fullName: "Dr. Fatima Zahra",
    };

    renderWithClient(<PartyPicker value={selected} onSelect={vi.fn()} />);

    expect(screen.getByText("Dr. Fatima Zahra")).toBeInTheDocument();
    // Must NOT leak truncated token or raw token in the text
    expect(screen.queryByText(/#encrypted/)).not.toBeInTheDocument();
    expect(screen.queryByText(/xyz-1234/)).not.toBeInTheDocument();
  });

  it("opens popover listbox and queries contacts upon clicking trigger", async () => {
    mockPartyRepository.lookupContacts.mockResolvedValue({
      items: [
        {
          id: "token-p1",
          type: "Person",
          displayName: "Ali Mansoor",
          fullName: "Ali Mansoor",
          legalName: null,
        },
        {
          id: "token-o1",
          type: "Organization",
          displayName: "Najd Sports Club",
          fullName: null,
          legalName: "Najd Sports Club LLC",
        },
      ],
      totalCount: 2,
    });

    const onSelect = vi.fn();
    renderWithClient(<PartyPicker value={null} onSelect={onSelect} />);

    const trigger = screen.getByTestId("party-picker-trigger");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByTestId("party-picker-search-input")).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId("party-picker-search-input");
    expect(searchInput).toHaveAttribute("role", "combobox");
    expect(searchInput).toHaveAttribute("aria-controls", "party-picker-listbox");

    await waitFor(() => {
      expect(screen.getByText("Ali Mansoor")).toBeInTheDocument();
      expect(screen.getByText("Najd Sports Club")).toBeInTheDocument();
    });

    // Verify option labels do not leak raw token hashes
    expect(screen.queryByText(/#token-p1/)).not.toBeInTheDocument();
    expect(screen.queryByText(/#token-o1/)).not.toBeInTheDocument();

    // Select the first option
    fireEvent.click(screen.getByTestId("party-option-0"));

    expect(onSelect).toHaveBeenCalledWith({
      id: "token-p1",
      type: "Person",
      displayName: "Ali Mansoor",
      fullName: "Ali Mansoor",
      legalName: undefined,
    });
  });

  it("handles keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)", async () => {
    mockPartyRepository.lookupContacts.mockResolvedValue({
      items: [
        {
          id: "token-1",
          type: "Person",
          displayName: "Fatima Al-Mansoor",
          fullName: "Fatima Al-Mansoor",
        },
        {
          id: "token-2",
          type: "Organization",
          displayName: "Riyadh Academy",
          legalName: "Riyadh Academy LLC",
        },
      ],
      totalCount: 2,
    });

    const onSelect = vi.fn();
    renderWithClient(<PartyPicker value={null} onSelect={onSelect} />);

    fireEvent.click(screen.getByTestId("party-picker-trigger"));

    await waitFor(() => {
      expect(screen.getByTestId("party-picker-search-input")).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId("party-picker-search-input");

    await waitFor(() => {
      expect(screen.getByText("Fatima Al-Mansoor")).toBeInTheDocument();
    });

    // Press ArrowDown to highlight first item
    fireEvent.keyDown(searchInput, { key: "ArrowDown" });
    expect(searchInput).toHaveAttribute("aria-activedescendant", "party-option-0");

    // Press ArrowDown to highlight second item
    fireEvent.keyDown(searchInput, { key: "ArrowDown" });
    expect(searchInput).toHaveAttribute("aria-activedescendant", "party-option-1");

    // Press Enter to select second item
    fireEvent.keyDown(searchInput, { key: "Enter" });

    expect(onSelect).toHaveBeenCalledWith({
      id: "token-2",
      type: "Organization",
      displayName: "Riyadh Academy",
      fullName: undefined,
      legalName: "Riyadh Academy LLC",
    });
  });

  it("clears selection when clear button is clicked", () => {
    const onSelect = vi.fn();
    renderWithClient(
      <PartyPicker
        value={{
          id: "token-1",
          type: "Person",
          displayName: "Tariq Aziz",
        }}
        onSelect={onSelect}
      />
    );

    const clearBtn = screen.getByTitle("party.picker.clearSelection");
    fireEvent.click(clearBtn);

    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it("wraps to the last item on ArrowUp when initially unhighlighted", async () => {
    mockPartyRepository.lookupContacts.mockResolvedValue({
      items: [
        { id: "token-1", type: "Person", displayName: "Person 1" },
        { id: "token-2", type: "Person", displayName: "Person 2" },
        { id: "token-3", type: "Person", displayName: "Person 3" },
      ],
      totalCount: 3,
    });

    renderWithClient(<PartyPicker value={null} onSelect={vi.fn()} />);
    fireEvent.click(screen.getByTestId("party-picker-trigger"));

    await waitFor(() => {
      expect(screen.getByTestId("party-picker-search-input")).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId("party-picker-search-input");
    await waitFor(() => {
      expect(screen.getByText("Person 3")).toBeInTheDocument();
    });

    // ArrowUp from -1 must wrap to index 2 (last item)
    fireEvent.keyDown(searchInput, { key: "ArrowUp" });
    expect(searchInput).toHaveAttribute("aria-activedescendant", "party-option-2");

    // ArrowDown from index 2 must wrap to index 0
    fireEvent.keyDown(searchInput, { key: "ArrowDown" });
    expect(searchInput).toHaveAttribute("aria-activedescendant", "party-option-0");
  });

  it("opens popover when trigger receives ArrowDown or Enter key", async () => {
    mockPartyRepository.lookupContacts.mockResolvedValue({
      items: [{ id: "token-1", type: "Person", displayName: "Ali" }],
      totalCount: 1,
    });

    renderWithClient(<PartyPicker value={null} onSelect={vi.fn()} />);
    const trigger = screen.getByTestId("party-picker-trigger");

    fireEvent.keyDown(trigger, { key: "ArrowDown" });

    await waitFor(() => {
      expect(screen.getByTestId("party-picker-search-input")).toBeInTheDocument();
    });
  });

  it("falls back to fullName or legalName when displayName is empty", () => {
    renderWithClient(
      <PartyPicker
        value={{
          id: "token-empty-disp",
          type: "Organization",
          displayName: "",
          legalName: "Fallback Legal Entity LLC",
        }}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText("Fallback Legal Entity LLC")).toBeInTheDocument();
  });

  it("filters out contact matching excludeId", async () => {
    mockPartyRepository.lookupContacts.mockResolvedValue({
      items: [
        { id: "party-excluded", type: "Person", displayName: "Self Contact" },
        { id: "party-allowed", type: "Person", displayName: "Allowed Contact" },
      ],
      totalCount: 2,
    });

    renderWithClient(<PartyPicker value={null} onSelect={vi.fn()} excludeId="party-excluded" />);
    const trigger = screen.getByTestId("party-picker-trigger");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Allowed Contact")).toBeInTheDocument();
      expect(screen.queryByText("Self Contact")).not.toBeInTheDocument();
    });
  });
});
