import { describe, expect, it, vi } from "vitest";
import type { IOperationsCalendarService } from "../../domain/interfaces/IOperationsCalendarService";
import { OperationsCalendarRepository } from "./OperationsCalendarRepository";

describe("OperationsCalendarRepository", () => {
  it("delegates to service.getDay and maps DTO blocks and closures into a domain entity", async () => {
    const mockService: IOperationsCalendarService = {
      getDay: vi.fn().mockResolvedValue({
        dateLocal: "2026-10-23",
        timeZoneId: "Asia/Riyadh",
        isTruncated: false,
        blocks: [
          {
            reservationId: "res-1",
            reservationNumber: "RES-101",
            resourceId: "court-1",
            status: "Confirmed",
            startUtc: "2026-10-23T12:00:00Z",
            endUtc: "2026-10-23T13:00:00Z",
          },
        ],
        closures: [
          {
            resourceId: "court-2",
            startUtc: "2026-10-23T14:00:00Z",
            endUtc: "2026-10-23T15:00:00Z",
            reason: "Net repair",
            closureType: "Maintenance",
          },
        ],
      }),
    };

    const repository = new OperationsCalendarRepository(mockService);
    const query = {
      dateLocal: "2026-10-23",
      timeZoneId: "Asia/Riyadh",
      resourceIds: ["court-1", "court-2"],
    };

    const result = await repository.getDay(query);

    expect(mockService.getDay).toHaveBeenCalledWith(query);
    expect(result.dateLocal).toBe("2026-10-23");
    expect(result.timeZoneId).toBe("Asia/Riyadh");
    expect(result.blocks).toHaveLength(2);
    expect(result.blocks[0]).toMatchObject({
      reservationId: "res-1",
      resourceId: "court-1",
      status: "Confirmed",
    });
    expect(result.blocks[1]).toMatchObject({
      resourceId: "court-2",
      status: "Maintenance",
      reservationNumber: "⊘ Net repair",
    });
  });
});
