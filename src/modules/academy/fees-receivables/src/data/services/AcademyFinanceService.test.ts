import { describe, it, expect, vi, beforeEach } from "vitest";
import { AcademyFinanceService } from "./AcademyFinanceService";
import type { IApiService } from "@core/interfaces/api.interface";

describe("AcademyFinanceService", () => {
  let service: AcademyFinanceService;
  let mockApi: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    getBaseUrl: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockApi = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
      getBaseUrl: vi.fn().mockReturnValue("https://api.scripe.local/api/v1")
    };
    service = new AcademyFinanceService(mockApi as unknown as IApiService);
  });

  it("fetches fees & receivables with query params", async () => {
    const mockResponse = {
      items: [
        {
          enrollmentId: "en-1",
          athleteId: "ath-1",
          athleteNameEn: "Zaid Omar",
          athleteNameAr: "زيد عمر",
          programNameEn: "Football Academy",
          billingStatus: "Invoiced",
          currencyCode: "SAR",
          enrollmentPriceAmount: 1500,
          invoicedAmount: 1500,
          paidAmount: 1500,
          outstandingBalance: 0,
          isOverdue: false
        }
      ],
      summaries: [
        {
          currencyCode: "SAR",
          totalReceivablesCount: 1,
          totalInvoicedAmount: 1500,
          totalPaidAmount: 1500,
          totalOutstandingAmount: 0,
          totalOverdueAmount: 0
        }
      ],
      totalCount: 1,
      asOfUtc: "2026-11-08T12:00:00Z",
      blockedCapabilities: ["INSTALLMENTS_SCHEDULE"]
    };

    mockApi.get.mockResolvedValue(mockResponse);

    const res = await service.getFeesReceivables({
      billingStatus: "Invoiced",
      currencyCode: "SAR",
      overdueOnly: false,
      page: 1,
      pageSize: 50
    });

    expect(mockApi.get).toHaveBeenCalledWith(
      expect.stringContaining("/academy/finance/fees-receivables?")
    );
    expect(res).toEqual(mockResponse);
  });

  it("constructs authoritative export CSV URL with query parameters", () => {
    const exportUrl = service.getExportUrl({
      branchId: "branch-riyadh-1",
      billingStatus: "Overdue",
      currencyCode: "SAR"
    });

    expect(exportUrl).toContain("/academy/finance/fees-receivables/export");
    expect(exportUrl).toContain("branchId=branch-riyadh-1");
    expect(exportUrl).toContain("billingStatus=Overdue");
    expect(exportUrl).toContain("currencyCode=SAR");
  });
});
