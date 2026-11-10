import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  formatWeeklyScheduleEn,
  formatWeeklyScheduleAr,
  isValidTimeRange,
  WEEKDAYS
} from "./WeeklyScheduleControl";
import { TrainingGroupsService } from "../../data/services/TrainingGroupsService";
import type { IApiService } from "@/core/interfaces/api.interface";
import type {
  CreateTrainingGroupPayload,
  UpdateTrainingGroupPayload
} from "../../domain/entities/TrainingGroup";

describe("WeeklyScheduleControl & Formatter", () => {
  it("has exactly 7 weekdays from Sunday (0) to Saturday (6)", () => {
    expect(WEEKDAYS).toHaveLength(7);
    expect(WEEKDAYS[0].day).toBe(0);
    expect(WEEKDAYS[0].en).toBe("Sunday");
    expect(WEEKDAYS[0].ar).toBe("الأحد");
    expect(WEEKDAYS[6].day).toBe(6);
    expect(WEEKDAYS[6].en).toBe("Saturday");
    expect(WEEKDAYS[6].ar).toBe("السبت");
  });

  it("formats English weekly schedule with sorted weekdays and timezone", () => {
    const formatted = formatWeeklyScheduleEn([3, 1], "16:00", "17:30", "Asia/Riyadh");
    expect(formatted).toBe("Monday, Wednesday 16:00 - 17:30 (Asia/Riyadh)");
  });

  it("formats Arabic weekly schedule with Arabic comma and weekdays", () => {
    const formatted = formatWeeklyScheduleAr([1, 3], "16:00", "17:30", "Asia/Riyadh");
    expect(formatted).toBe("الإثنين، الأربعاء 16:00 - 17:30 (Asia/Riyadh)");
  });

  it("validates that end time must be strictly after start time", () => {
    expect(isValidTimeRange("16:00", "17:30")).toBe(true);
    expect(isValidTimeRange("09:00", "10:00")).toBe(true);
    expect(isValidTimeRange("17:30", "16:00")).toBe(false);
    expect(isValidTimeRange("16:00", "16:00")).toBe(false);
    expect(isValidTimeRange("", "16:00")).toBe(true); // partial input not flagged as invalid range yet
  });

  it("returns empty string when days or times are missing", () => {
    expect(formatWeeklyScheduleEn([], "16:00", "17:30", "Asia/Riyadh")).toBe("");
    expect(formatWeeklyScheduleEn([1], "", "17:30", "Asia/Riyadh")).toBe("");
    expect(formatWeeklyScheduleAr([1], "16:00", "", "Asia/Riyadh")).toBe("");
  });
});

describe("TrainingGroupsService with Structured Weekly Schedule", () => {
  let mockApi: {
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
  };
  let service: TrainingGroupsService;

  beforeEach(() => {
    mockApi = {
      post: vi.fn(),
      put: vi.fn()
    };
    service = new TrainingGroupsService(mockApi as unknown as IApiService);
  });

  it("creates group with structured schedule fields", async () => {
    const payload: CreateTrainingGroupPayload = {
      offeringId: "off-123",
      nameEn: "U12 Elite Squad",
      nameAr: "فريق النخبة",
      code: "U12-E",
      minCapacity: 5,
      maxCapacity: 20,
      scheduleDaysOfWeek: [1, 3],
      scheduleStartTime: "16:00",
      scheduleEndTime: "17:30",
      scheduleTimeZoneId: "Asia/Riyadh",
      scheduleDescriptionEn: "Monday, Wednesday 16:00 - 17:30 (Asia/Riyadh)",
      scheduleDescriptionAr: "الإثنين، الأربعاء 16:00 - 17:30 (Asia/Riyadh)"
    };

    const mockResponse = { id: "grp-new-1", ...payload };
    mockApi.post.mockResolvedValue(mockResponse);

    const result = await service.createGroup(payload);

    expect(mockApi.post).toHaveBeenCalledWith("/v1/academy/groups", payload);
    expect(result.scheduleDaysOfWeek).toEqual([1, 3]);
    expect(result.scheduleStartTime).toBe("16:00");
    expect(result.scheduleEndTime).toBe("17:30");
  });

  it("updates group with structured schedule fields", async () => {
    const payload: UpdateTrainingGroupPayload = {
      nameEn: "U12 Elite Squad Revised",
      nameAr: "فريق النخبة المحدث",
      minCapacity: 6,
      maxCapacity: 22,
      status: "Active",
      scheduleDaysOfWeek: [2, 4],
      scheduleStartTime: "17:00",
      scheduleEndTime: "18:30",
      scheduleTimeZoneId: "Asia/Riyadh",
      scheduleDescriptionEn: "Tuesday, Thursday 17:00 - 18:30 (Asia/Riyadh)",
      scheduleDescriptionAr: "الثلاثاء، الخميس 17:00 - 18:30 (Asia/Riyadh)"
    };

    const mockResponse = { id: "grp-1", ...payload };
    mockApi.put.mockResolvedValue(mockResponse);

    const result = await service.updateGroup("grp-1", payload);

    expect(mockApi.put).toHaveBeenCalledWith("/v1/academy/groups/grp-1", payload);
    expect(result.scheduleDaysOfWeek).toEqual([2, 4]);
    expect(result.scheduleStartTime).toBe("17:00");
    expect(result.scheduleEndTime).toBe("18:30");
  });
});
