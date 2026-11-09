import { describe, it, expect, vi, beforeEach } from "vitest";
import { AcademyFinanceService } from "./AcademyFinanceService";
import type { IApiService } from "@core/interfaces/api.interface";
import type { AcademyFeesReceivablesResponseModel } from "../models/AcademyReceivableModel";

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
    const mockResponse: AcademyFeesReceivablesResponseModel = {
      items: [
        {
          enrollmentId: "en-1",
          athleteId: "ath-1",
          athleteNameEn: "Zaid Omar",
          athleteNameAr: "زيد عمر",
          offeringId: "off-1",
          offeringNameEn: "Offering 1",
          offeringNameAr: "العرض 1",
          programId: "prog-1",
          programNameEn: "Football Academy",
          branchId: "branch-1",
          enrollmentDate: "2026-11-01",
          enrollmentStatus: "Active",
          billingStatus: "Invoiced",
          quoteAmount: 1500,
          priceCurrency: "SAR",
          financeInvoiceReference: "INV-2026-001",
          financeInvoiceStatus: "Issued",
          totalInvoicedAmount: 1500,
          paidAmount: 1500,
          outstandingAmount: 0,
          issuedAtUtc: "2026-11-01T10:00:00Z",
          dueAtUtc: "2026-11-15T10:00:00Z",
          isOverdue: false,
          daysOverdue: 0,
          payerPartyId: "pty-1",
          notes: undefined,
          allocations: []
        }
      ],
      summaries: [
        {
          currencyCode: "SAR",
          totalInvoiced: 1500,
          totalPaid: 1500,
          totalOutstanding: 0,
          totalOverdue: 0,
          invoicedCount: 1,
          paidCount: 1,
          outstandingCount: 0,
          overdueCount: 0,
          waivedCount: 0,
          unbilledCount: 0
        }
      ],
      totalCount: 1,
      page: 1,
      pageSize: 50,
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
    expect(res.totalCount).toBe(1);
    expect(res.items.length).toBe(1);
    expect(res.items[0].enrollmentId).toBe("en-1");
    expect(res.items[0].totalInvoicedAmount).toBe(1500);
    expect(res.summaries[0].totalInvoiced).toBe(1500);
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
