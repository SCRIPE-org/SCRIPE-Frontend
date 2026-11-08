export const feesReceivablesEn = {
  title: "Fees & Receivables",
  subtitle: "Authoritative financial reconciliation between Academy enrollments and Finance receivables.",
  asOf: "As of",
  sourceFinanceNotice: "Financial truth is owned exclusively by SCRIPE Finance. Academy operational states do not infer payment.",
  exportCsv: "Export CSV",
  refresh: "Refresh",
  filters: {
    allBranches: "All Branches",
    allPrograms: "All Programs",
    allStatuses: "All Statuses",
    allCurrencies: "All Currencies",
    overdueOnly: "Overdue Only",
    branch: "Branch",
    program: "Program",
    status: "Billing Status",
    currency: "Currency",
    searchPlaceholder: "Search by athlete, invoice, or program..."
  },
  status: {
    unbilled: "Unbilled",
    invoiced: "Invoiced",
    paid: "Paid",
    partiallyPaid: "Partially Paid",
    overdue: "Overdue",
    waived: "Waived"
  },
  summary: {
    totalInvoiced: "Total Invoiced",
    totalPaid: "Collected / Paid",
    totalOutstanding: "Outstanding",
    totalOverdue: "Total Overdue",
    waivedCount: "Waived Enrollments",
    unbilledCount: "Unbilled Queue"
  },
  table: {
    athlete: "Athlete",
    programOffering: "Program & Offering",
    enrollmentDate: "Enrollment Date",
    status: "Status",
    invoiceNumber: "Invoice #",
    quote: "Quote",
    invoiced: "Invoiced",
    paid: "Paid",
    balance: "Balance Due",
    dueDate: "Due Date",
    actions: "Actions",
    viewDetails: "View Reconciliation"
  },
  details: {
    title: "Financial Reconciliation Details",
    invoiceReference: "Finance Invoice Reference",
    issuedAt: "Issued Date (UTC)",
    dueAt: "Due Date (UTC)",
    overdueAlert: "This invoice is overdue by {days} days.",
    paymentAllocations: "Payment & Receipt Allocations",
    noAllocations: "No payment receipts have been allocated to this invoice yet.",
    paymentNumber: "Payment #",
    amount: "Amount",
    receiptNumber: "Receipt #",
    allocatedAt: "Allocated Date",
    waiverProvenance: "Commercial Waiver Provenance",
    waiverNotice: "Governed operational exception. Fee obligations cleared with authorized approval."
  },
  blocked: {
    title: "Documented Contract Gap Disclosures",
    installments: "Installment schedule projection is BLOCKED: awaiting Finance module installment aggregate release (ADR-ACAD-A7-01)."
  },
  empty: {
    title: "No fees or receivables found",
    description: "No enrollment fee obligations match the selected branch, program, or status filters."
  }
};
