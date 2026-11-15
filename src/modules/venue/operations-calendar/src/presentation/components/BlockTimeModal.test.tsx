import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CalendarResource } from "../../domain/entities/OperationsCalendar";
import { BlockTimeModal } from "./BlockTimeModal";

const mockCreateBlock = vi.fn();

vi.mock("@modules/venue/di", () => ({
  getVenueContainer: () => ({
    availabilityRepository: {
      createBlock: mockCreateBlock,
    },
  }),
}));

vi.mock("@core/providers/i18n-provider", async () => {
  const { en } = await import("../../../locales/operations-calendar.en");

  const lookup = (key: string): string => {
    let cur: unknown = en;
    for (const part of key.split(".")) {
      if (cur && typeof cur === "object" && part in cur) {
        cur = (cur as Record<string, unknown>)[part];
      } else {
        return key;
      }
    }
    return typeof cur === "string" ? cur : key;
  };

  return {
    useI18n: () => ({
      t: lookup,
      language: "en",
      isRtl: false,
    }),
  };
});

const resource: CalendarResource = {
  id: "court-1",
  name: "Center Court",
  profileId: "prof-1",
  profileName: "Padel",
  facilityId: "fac-1",
  facilityName: "Main Club",
  resourceKindCode: "COURT",
  timeZoneId: "Asia/Riyadh",
};

describe("BlockTimeModal", () => {
  beforeEach(() => {
    mockCreateBlock.mockReset();
  });

  it("prefills local start/end times in target timezone and submits a blackout block", async () => {
    mockCreateBlock.mockResolvedValue({ id: "blk-1" });
    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();

    render(
      <BlockTimeModal
        open={true}
        onOpenChange={onOpenChange}
        resource={resource}
        instantUtc="2026-10-23T12:00:00.000Z"
        resources={[resource]}
        timeZoneId="Asia/Riyadh"
        onSuccess={onSuccess}
      />,
    );

    const timeInputs = document.querySelectorAll('input[type="time"]');
    expect(timeInputs).toHaveLength(2);
    expect((timeInputs[0] as HTMLInputElement).value).toBe("15:00");
    expect((timeInputs[1] as HTMLInputElement).value).toBe("16:00");

    const maintenanceBtn = screen.getByRole("button", { name: "Maintenance" });
    const unavailableBtn = screen.getByRole("button", { name: "Unavailable" });
    expect(maintenanceBtn).toHaveAttribute("aria-pressed", "true");
    expect(unavailableBtn).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(unavailableBtn);
    expect(unavailableBtn).toHaveAttribute("aria-pressed", "true");

    fireEvent.change(screen.getByLabelText("Reason / Notes"), {
      target: { value: "Private tournament setup" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Block Time" }));

    await waitFor(() => {
      expect(mockCreateBlock).toHaveBeenCalledWith("blackout", {
        resourceId: "court-1",
        timeZoneId: "Asia/Riyadh",
        startLocal: "2026-10-23T15:00:00",
        endLocal: "2026-10-23T16:00:00",
        hardBlock: true,
        reason: "Private tournament setup",
      });
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("shows translated fallback error when availabilityRepository.createBlock fails", async () => {
    mockCreateBlock.mockRejectedValue(new Error(""));

    render(
      <BlockTimeModal
        open={true}
        onOpenChange={vi.fn()}
        resource={resource}
        instantUtc="2026-10-23T12:00:00.000Z"
        resources={[resource]}
        timeZoneId="Asia/Riyadh"
        onSuccess={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Reason / Notes"), {
      target: { value: "Resurfacing" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Block Time" }));

    await waitFor(() => {
      expect(screen.getByText("Failed to block time.")).toBeInTheDocument();
    });
  });
});
