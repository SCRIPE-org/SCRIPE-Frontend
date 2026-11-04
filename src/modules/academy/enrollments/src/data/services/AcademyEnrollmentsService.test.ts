import { describe, it, expect, vi, beforeEach } from "vitest";
import { AcademyEnrollmentsService } from "./AcademyEnrollmentsService";
import type { IApiService } from "@core/interfaces/api.interface";
import type { CreateEnrollmentPayload, FinanceHandoffPayload } from "../../domain/entities/AcademyEnrollment";

describe("AcademyEnrollmentsService", () => {
  let service: AcademyEnrollmentsService;
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
    service = new AcademyEnrollmentsService(mockApi as unknown as IApiService);
  });

  it("fetches enrollments with optional status and billing filters", async () => {
    const mockEnrollments = [
      { id: "en1", athleteId: "ath1", offeringId: "off1", status: "Active", billingStatus: "Unbilled" }
    ];
    mockApi.get.mockResolvedValue(mockEnrollments);

    const res = await service.getEnrollments("off1", "ath1", "Active", "Unbilled");

    expect(mockApi.get).toHaveBeenCalledWith(
      expect.stringContaining("/academy/enrollments?offeringId=off1&athleteId=ath1&status=Active&billingStatus=Unbilled")
    );
    expect(res).toEqual(mockEnrollments);
  });

  it("creates an enrollment via POST /academy/enrollments", async () => {
    const payload: CreateEnrollmentPayload = {
      athleteId: "ath1",
      offeringId: "off1",
      priceAmount: 1250,
      priceCurrency: "SAR",
      catalogPriceId: "price-quote-123"
    };
    const created = { id: "en-new", ...payload, status: "Active", billingStatus: "Unbilled" };
    mockApi.post.mockResolvedValue(created);

    const res = await service.createEnrollment(payload);

    expect(mockApi.post).toHaveBeenCalledWith(
      expect.stringContaining("/academy/enrollments"),
      payload
    );
    expect(res.id).toBe("en-new");
    expect(res.priceAmount).toBe(1250);
  });

  it("hands off enrollment to finance via POST :id/finance-handoff", async () => {
    const payload: FinanceHandoffPayload = { notes: "Issue monthly invoice" };
    const invoiced = { id: "en1", billingStatus: "Invoiced", financeInvoiceReference: "INV-20261027-EN1" };
    mockApi.post.mockResolvedValue(invoiced);

    const res = await service.handoffToFinance("en1", payload);

    expect(mockApi.post).toHaveBeenCalledWith(
      expect.stringContaining("/academy/enrollments/en1/finance-handoff"),
      payload
    );
    expect(res.billingStatus).toBe("Invoiced");
    expect(res.financeInvoiceReference).toBe("INV-20261027-EN1");
  });
});
