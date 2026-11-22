import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AcademyGroupsView } from "./AcademyGroupsView";

const dependencies = vi.hoisted(() => {
  const createdGroup = { id: "group-1", offeringId: "football-offering", branchId: "branch-1", nameEn: "U14", nameAr: "تحت 14", minCapacity: 5, maxCapacity: 15, activeMemberCount: 0, status: "Draft" };
  const fetchOfferings = vi.fn();
  const groupsRepository = {
    getGroups: vi.fn().mockResolvedValue([]),
    createGroup: vi.fn().mockResolvedValue(createdGroup),
    getGroupById: vi.fn().mockResolvedValue(createdGroup),
    getRoster: vi.fn().mockResolvedValue([]),
  };
  return {
    fetchOfferings,
    offeringsRepository: { fetchOfferings },
    groupsRepository,
    createGroup: groupsRepository.createGroup,
    getGroups: groupsRepository.getGroups,
  };
});

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), useSearchParams: () => new URLSearchParams() }));
vi.mock("@core/providers/i18n-provider", () => ({ useI18n: () => ({ language: "en", t: (key: string) => key }) }));
vi.mock("@core/hooks/use-permission", () => ({ usePermission: () => true }));
vi.mock("@modules/academy/di", () => ({
  useAcademyServiceLocator: () => ({
    offeringsRepository: dependencies.offeringsRepository,
    groupsRepository: dependencies.groupsRepository,
  }),
}));
vi.mock("@core/crud/components/generic-select", () => ({
  GenericSelect: ({ options, value, onValueChange, placeholder, disabled, error, onRetry, emptyText }: {
    options: Array<{ value: string; label: string }>;
    value: string;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: string | null;
    onRetry?: () => void;
    emptyText?: string;
  }) => <div>
    {error && <><span>{error}</span><button type="button" onClick={onRetry}>Retry offerings</button></>}
    {!error && options.length === 0 && emptyText && <span>{emptyText}</span>}
    <select aria-label={placeholder} value={value} disabled={disabled}
      onChange={(event) => onValueChange?.(event.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </div>,
}));
vi.mock("../components/WeeklyScheduleControl", () => ({ WeeklyScheduleControl: () => null }));
vi.mock("../components/EditTrainingGroupModal", () => ({ EditTrainingGroupModal: () => null }));

const offerings = [
  { id: "football-offering", programId: "football", branchId: "branch-1", seasonId: "season-1", nameEn: "Football Autumn", nameAr: "كرة القدم", startDate: "2026-09-01", endDate: "2027-06-01", maxCapacity: 20, minCapacity: 5, enrolledCount: 4, status: "OpenForEnrollment" },
  { id: "swimming-offering", programId: "swimming", branchId: "branch-1", seasonId: "season-1", nameEn: "Swimming Autumn", nameAr: "السباحة", startDate: "2026-09-01", endDate: "2027-06-01", maxCapacity: 15, minCapacity: 5, enrolledCount: 2, status: "InProgress" },
  { id: "closed-offering", programId: "football", branchId: "branch-1", seasonId: "season-old", nameEn: "Closed Football", nameAr: "كرة قدم منتهية", startDate: "2025-09-01", endDate: "2026-06-01", maxCapacity: 20, minCapacity: 5, enrolledCount: 20, status: "Completed" },
];

describe("AcademyGroupsView offering selection", () => {
  beforeEach(() => {
    dependencies.fetchOfferings.mockReset();
    dependencies.fetchOfferings.mockResolvedValue([]);
    dependencies.createGroup.mockClear();
    dependencies.getGroups.mockResolvedValue([]);
  });
  afterEach(cleanup);

  it("distinguishes offering load failure from an empty eligible list and allows retry", async () => {
    dependencies.fetchOfferings.mockRejectedValueOnce(new Error("network unavailable")).mockResolvedValueOnce(offerings);
    render(<AcademyGroupsView />);
    fireEvent.click(screen.getByRole("button", { name: "Create Group" }));
    expect(await screen.findByText("Unable to load program offerings.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Retry offerings" }));
    const selector = await screen.findByRole("combobox", { name: "Select offering..." });
    await waitFor(() => expect(within(selector).getByRole("option", { name: "Football Autumn" })).toBeTruthy());
    expect(within(selector).getByRole("option", { name: "Swimming Autumn" })).toBeTruthy();
  });

  it("submits the selected eligible offering ID and excludes completed offerings", async () => {
    dependencies.fetchOfferings.mockResolvedValue(offerings);
    render(<AcademyGroupsView />);
    fireEvent.click(screen.getByRole("button", { name: "Create Group" }));
    const selector = await screen.findByRole("combobox", { name: "Select offering..." });
    expect(within(selector).queryByRole("option", { name: "Closed Football" })).toBeNull();
    fireEvent.change(selector, { target: { value: "football-offering" } });
    const nameInput = screen.getByPlaceholderText("e.g. U14 Alpha");
    fireEvent.change(nameInput, { target: { value: "U14" } });
    fireEvent.change(screen.getByPlaceholderText("مثال: تحت 14 ألفا"), { target: { value: "تحت 14" } });
    const createForm = nameInput.closest("form");
    expect(createForm).not.toBeNull();
    fireEvent.click(within(createForm!).getByRole("button", { name: "Create Group" }));
    await waitFor(() => expect(dependencies.createGroup).toHaveBeenCalledWith(expect.objectContaining({ offeringId: "football-offering" })));
  });

  it("does not submit an ineligible preselected offering that is absent from the selector", async () => {
    dependencies.fetchOfferings.mockResolvedValue(offerings);
    render(<AcademyGroupsView initialOfferingId="closed-offering" />);
    fireEvent.click(screen.getByRole("button", { name: "Create Group" }));
    const selector = await screen.findByRole("combobox", { name: "Select offering..." });
    await waitFor(() => expect(within(selector).queryByRole("option", { name: "Closed Football" })).toBeNull());
    fireEvent.change(screen.getByPlaceholderText("e.g. U14 Alpha"), { target: { value: "U14" } });
    fireEvent.change(screen.getByPlaceholderText("مثال: تحت 14 ألفا"), { target: { value: "تحت 14" } });
    const form = selector.closest("form");
    expect(form).not.toBeNull();
    const submit = within(form!).getByRole("button", { name: "Create Group" }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    fireEvent.submit(form!);
    expect(dependencies.createGroup).not.toHaveBeenCalled();
  });
});
