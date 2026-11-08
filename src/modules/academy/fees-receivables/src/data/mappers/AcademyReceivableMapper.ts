import type {
  AcademyFeeReceivableItem,
  AcademyFeesSummaryByCurrency,
  AcademyFeesReceivablesResponse,
  PaymentAllocationSummary
} from "../../domain/entities/AcademyReceivable";
import type {
  AcademyFeeReceivableItemModel,
  AcademyFeesSummaryByCurrencyModel,
  AcademyFeesReceivablesResponseModel,
  PaymentAllocationSummaryModel
} from "../models/AcademyReceivableModel";

export class AcademyReceivableMapper {
  static toAllocationEntity(model: PaymentAllocationSummaryModel): PaymentAllocationSummary {
    return {
      paymentId: model.paymentId,
      paymentNumber: model.paymentNumber,
      amount: model.amount,
      currencyCode: model.currencyCode,
      allocatedAtUtc: model.allocatedAtUtc,
      receiptNumber: model.receiptNumber
    };
  }

  static toItemEntity(model: AcademyFeeReceivableItemModel): AcademyFeeReceivableItem {
    return {
      enrollmentId: model.enrollmentId,
      athleteId: model.athleteId,
      athleteNameEn: model.athleteNameEn,
      athleteNameAr: model.athleteNameAr,
      offeringId: model.offeringId,
      offeringNameEn: model.offeringNameEn,
      offeringNameAr: model.offeringNameAr,
      programId: model.programId,
      programNameEn: model.programNameEn,
      branchId: model.branchId,
      enrollmentDate: model.enrollmentDate,
      enrollmentStatus: model.enrollmentStatus,
      billingStatus: model.billingStatus,
      quoteAmount: model.quoteAmount,
      priceCurrency: model.priceCurrency,
      financeInvoiceReference: model.financeInvoiceReference,
      financeInvoiceStatus: model.financeInvoiceStatus,
      totalInvoicedAmount: model.totalInvoicedAmount,
      paidAmount: model.paidAmount,
      outstandingAmount: model.outstandingAmount,
      issuedAtUtc: model.issuedAtUtc,
      dueAtUtc: model.dueAtUtc,
      isOverdue: model.isOverdue,
      daysOverdue: model.daysOverdue,
      payerPartyId: model.payerPartyId,
      notes: model.notes,
      allocations: (model.allocations || []).map(AcademyReceivableMapper.toAllocationEntity)
    };
  }

  static toSummaryEntity(model: AcademyFeesSummaryByCurrencyModel): AcademyFeesSummaryByCurrency {
    return {
      currencyCode: model.currencyCode,
      totalInvoiced: model.totalInvoiced,
      totalPaid: model.totalPaid,
      totalOutstanding: model.totalOutstanding,
      totalOverdue: model.totalOverdue,
      invoicedCount: model.invoicedCount,
      paidCount: model.paidCount,
      outstandingCount: model.outstandingCount,
      overdueCount: model.overdueCount,
      waivedCount: model.waivedCount,
      unbilledCount: model.unbilledCount
    };
  }

  static toResponseEntity(model: AcademyFeesReceivablesResponseModel): AcademyFeesReceivablesResponse {
    return {
      items: (model.items || []).map(AcademyReceivableMapper.toItemEntity),
      summaries: (model.summaries || []).map(AcademyReceivableMapper.toSummaryEntity),
      totalCount: model.totalCount || 0,
      page: model.page || 1,
      pageSize: model.pageSize || 50,
      asOfUtc: model.asOfUtc || new Date().toISOString(),
      blockedCapabilities: model.blockedCapabilities || []
    };
  }
}
