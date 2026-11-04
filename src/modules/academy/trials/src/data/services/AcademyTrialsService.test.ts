import { describe, it, expect, vi, beforeEach } from "vitest";
import { AcademyTrialsService } from "./AcademyTrialsService";
import type { IApiService } from "@core/interfaces/api.interface";
import type { RequestTrialPayload, SubmitEvaluationPayload, DecideTrialPayload } from "../../domain/entities/AcademyTrial";

describe("AcademyTrialsService", () => {
  let service: AcademyTrialsService;
  let mockApi: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockApi = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
    };
    service = new AcademyTrialsService(mockApi as unknown as IApiService);
  });

  it("fetches trials with optional filters", async () => {
    const mockTrials = [
      { id: "tr1", athleteId: "ath1", offeringId: "off1", status: "Scheduled" }
    ];
    mockApi.get.mockResolvedValue(mockTrials);

    const res = await service.getTrials("off1", "ath1", "Scheduled");

    expect(mockApi.get).toHaveBeenCalledWith(
      expect.stringContaining("/academy/trials?offeringId=off1&athleteId=ath1&status=Scheduled")
    );
    expect(res).toEqual(mockTrials);
  });

  it("schedules a new trial via POST /academy/trials", async () => {
    const payload: RequestTrialPayload = {
      athleteId: "ath1",
      offeringId: "off1",
      scheduledDate: "2026-11-01",
      scheduledTime: "16:00"
    };
    const created = { id: "tr-new", ...payload, status: "Scheduled" };
    mockApi.post.mockResolvedValue(created);

    const res = await service.requestTrial(payload);

    expect(mockApi.post).toHaveBeenCalledWith(
      expect.stringContaining("/academy/trials"),
      payload
    );
    expect(res.id).toBe("tr-new");
    expect(res.status).toBe("Scheduled");
  });

  it("submits technical evaluation via POST :id/evaluation", async () => {
    const payload: SubmitEvaluationPayload = {
      technicalRecommendation: "Recommended for Intermediate",
      recommendedLevel: "Intermediate",
      technicalScore: 8,
      technicalNotes: "Good stamina"
    };
    const evaluated = { id: "tr1", status: "Evaluated", ...payload };
    mockApi.post.mockResolvedValue(evaluated);

    const res = await service.submitEvaluation("tr1", payload);

    expect(mockApi.post).toHaveBeenCalledWith(
      expect.stringContaining("/academy/trials/tr1/evaluation"),
      payload
    );
    expect(res.status).toBe("Evaluated");
    expect(res.technicalScore).toBe(8);
  });

  it("submits admin admission decision via POST :id/decision", async () => {
    const payload: DecideTrialPayload = {
      approved: true,
      waitlisted: false,
      adminDecisionNotes: "Approved for full term"
    };
    const accepted = { id: "tr1", status: "Accepted", adminDecisionNotes: "Approved for full term" };
    mockApi.post.mockResolvedValue(accepted);

    const res = await service.decideTrial("tr1", payload);

    expect(mockApi.post).toHaveBeenCalledWith(
      expect.stringContaining("/academy/trials/tr1/decision"),
      payload
    );
    expect(res.status).toBe("Accepted");
  });
});
