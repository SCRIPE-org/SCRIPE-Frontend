"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getVenueContainer } from "@modules/venue/di";
import { getModuleApiService } from "@/core/services/api-factory";
import { useI18n } from "@core/providers/i18n-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import {
  downloadReportSpreadsheet,
  ExportColumn,
  ReportExportOptions,
} from "../../utils/excelReportExport";
import {
  ImportType,
  ParsedTableData,
  ValidationReport,
  parseDelimitedText,
  autoMapColumns,
  validateImportRows,
  IMPORT_SCHEMAS,
} from "../../utils/excelDataImport";
import type {
  MoneyInvoice,
  MoneyPayment,
  MoneyResourcePerformance,
  MoneySummaryResponse,
} from "@modules/venue/money/src/domain/entities/Money";

export type ReportCategory = "financial" | "bookings" | "court-performance" | "collections";

export interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  siteId: string;
  resourceId: string;
  bookingStatus: string;
  currency: string;
}

export interface BookingReportItem {
  id: string;
  reservationNumber: string;
  status: string;
  resourceId: string;
  resourceName?: string;
  requestedStartUtc: string;
  requestedEndUtc: string;
  quantity: number;
  createdAt: string;
}

export function useVenueReportsViewModel() {
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const { currentTenant } = useTenantContext();
  const { success: toastSuccess, error: toastError } = useEnhancedToast();

  const [category, setCategory] = useState<ReportCategory>("financial");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    dateTo: new Date().toISOString().slice(0, 10),
    siteId: "",
    resourceId: "",
    bookingStatus: "all",
    currency: "all",
  });

  // Reference Lookups
  const [sites, setSites] = useState<Array<{ id: string; name: string }>>([]);
  const [resources, setResources] = useState<Array<{ id: string; name: string }>>([]);
  const [customerLookup, setCustomerLookup] = useState<Map<string, string>>(new Map());

  // Report Data
  const [invoices, setInvoices] = useState<MoneyInvoice[]>([]);
  const [summary, setSummary] = useState<MoneySummaryResponse | null>(null);
  const [bookings, setBookings] = useState<BookingReportItem[]>([]);
  const [courtPerformance, setCourtPerformance] = useState<MoneyResourcePerformance[]>([]);
  const [payments, setPayments] = useState<MoneyPayment[]>([]);

  // Import Staged State (A12-A14)
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importStep, setImportStep] = useState<1 | 2 | 3 | 4>(1);
  const [importType, setImportType] = useState<ImportType>("customers");
  const [parsedTable, setParsedTable] = useState<ParsedTableData | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [importSummaryResult, setImportSummaryResult] = useState<{
    successCount: number;
    errorCount: number;
    errors: string[];
  } | null>(null);

  // Load Reference Lookups (Branches, Resources, Customers)
  const loadLookups = useCallback(async () => {
    try {
      const container = getVenueContainer();
      const [sitesRes, resRes, custRes] = await Promise.allSettled([
        container.siteRepository.getAll({ page: 1, pageSize: 100 }),
        container.schedulableResourceRepository.getAll({ page: 1, pageSize: 100 }),
        container.customerRepository.search(""),
      ]);

      if (sitesRes.status === "fulfilled") {
        setSites(sitesRes.value.items.map((s) => ({ id: s.id, name: s.name })));
      }
      if (resRes.status === "fulfilled") {
        setResources(resRes.value.items.map((r) => ({ id: r.id, name: r.name })));
      }
      if (custRes.status === "fulfilled") {
        const map = new Map<string, string>();
        custRes.value.forEach((c) => map.set(c.id, c.displayName));
        setCustomerLookup(map);
      }
    } catch (e) {
      console.warn("Failed to load reference lookups for reports", e);
    }
  }, []);

  // Authoritative Query Execution based on active category and filters
  const loadReportData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const container = getVenueContainer();
      const venueApi = getModuleApiService("VENUE");

      if (category === "financial") {
        const [invRes, sumRes] = await Promise.all([
          container.moneyRepository.getInvoices(1, 100),
          container.moneyRepository.getSummary(),
        ]);
        setInvoices(invRes.items || []);
        setSummary(sumRes || null);
      } else if (category === "bookings") {
        const res = await venueApi.get<{ items: any[] }>(
          `/api/v1/Reservations?page=1&pageSize=100${filters.resourceId ? `&resourceId=${filters.resourceId}` : ""}`
        );
        const resourceMap = new Map(resources.map((r) => [r.id, r.name]));
        const mapped = (res.items || []).map((b) => ({
          id: b.id,
          reservationNumber: b.reservationNumber,
          status: b.status,
          resourceId: b.resourceId,
          resourceName: resourceMap.get(b.resourceId) || b.resourceId,
          requestedStartUtc: b.requestedStartUtc,
          requestedEndUtc: b.requestedEndUtc,
          quantity: b.quantity,
          createdAt: b.createdAt,
        }));
        setBookings(mapped);
      } else if (category === "court-performance") {
        const res = await container.moneyRepository.getByResource();
        setCourtPerformance(res || []);
      } else if (category === "collections") {
        const res = await container.moneyRepository.getPayments(1, 100);
        setPayments(res.items || []);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load authoritative report data";
      setError(msg);
      toastError({ title: msg });
    } finally {
      setIsLoading(false);
    }
  }, [category, filters.resourceId, resources, toastError]);

  useEffect(() => {
    loadLookups();
  }, [loadLookups]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  // Currency Isolation Totals calculation (Requirement A11: Never sum unlike currencies together)
  const currencyTotals = useMemo(() => {
    const totals: Record<string, { commercialValue: number; collected: number; outstanding: number }> = {};

    if (category === "financial" && summary?.items) {
      for (const item of summary.items) {
        totals[item.currencyCode] = {
          commercialValue: item.commercialValue,
          collected: item.collected,
          outstanding: item.outstanding,
        };
      }
    } else if (category === "court-performance" && courtPerformance.length > 0) {
      for (const row of courtPerformance) {
        const curr = row.currencyCode || "SAR";
        if (!totals[curr]) totals[curr] = { commercialValue: 0, collected: 0, outstanding: 0 };
        totals[curr].commercialValue += row.commercialValue;
        totals[curr].collected += row.collected;
        totals[curr].outstanding += row.outstanding;
      }
    } else if (category === "collections" && payments.length > 0) {
      for (const p of payments) {
        const curr = p.currencyCode || "SAR";
        if (!totals[curr]) totals[curr] = { commercialValue: 0, collected: 0, outstanding: 0 };
        totals[curr].collected += p.amount;
      }
    }

    return totals;
  }, [category, summary, courtPerformance, payments]);

  // Export to Excel / CSV with full authoritative data and currency isolation (A11)
  const handleExport = useCallback(
    (format: "xlsx" | "csv" = "xlsx") => {
      const tenantName = currentTenant?.name || "SCRIPE Venue Test Club";
      const filterSummary: Record<string, string> = {
        Category: category,
        "Date Range": `${filters.dateFrom} to ${filters.dateTo}`,
      };
      if (filters.resourceId) {
        const rName = resources.find((r) => r.id === filters.resourceId)?.name || filters.resourceId;
        filterSummary["Court"] = rName;
      }
      if (filters.currency !== "all") filterSummary["Currency"] = filters.currency;
      if (filters.bookingStatus !== "all") filterSummary["Status"] = filters.bookingStatus;

      if (category === "financial") {
        const columns: ExportColumn<MoneyInvoice>[] = [
          { header: "Invoice Number", key: "invoiceNumber" },
          {
            header: "Customer / Payer",
            key: "payerPartyId",
            getValue: (i) => customerLookup.get(i.payerPartyId) || i.payerPartyId,
          },
          { header: "Booking Reference", key: "reservationId" },
          { header: "Status", key: "status" },
          { header: "Issued Date", key: "issuedAtUtc", getValue: (i) => i.issuedAtUtc.slice(0, 10) },
          { header: "Currency", key: "currencyCode" },
          { header: "Total Amount", key: "totalAmount", format: "currency" },
          { header: "Paid Amount", key: "paidAmount", format: "currency" },
          { header: "Outstanding Amount", key: "outstandingAmount", format: "currency" },
        ];

        downloadReportSpreadsheet<MoneyInvoice>(
          {
            title: "SCRIPE Venue — Financial Report",
            categoryName: "Financial",
            tenantName,
            filters: filterSummary,
            columns,
            data: invoices,
            currencyTotals,
          },
          format
        );
      } else if (category === "bookings") {
        const columns: ExportColumn<BookingReportItem>[] = [
          { header: "Reservation Reference", key: "reservationNumber" },
          { header: "Status", key: "status" },
          { header: "Court / Space", key: "resourceName" },
          { header: "Requested Start", key: "requestedStartUtc" },
          { header: "Requested End", key: "requestedEndUtc" },
          { header: "Quantity / Slots", key: "quantity", format: "number" },
          { header: "Created Date", key: "createdAt", getValue: (b) => b.createdAt.slice(0, 10) },
        ];

        downloadReportSpreadsheet<BookingReportItem>(
          {
            title: "SCRIPE Venue — Booking Operations Report",
            categoryName: "Bookings",
            tenantName,
            filters: filterSummary,
            columns,
            data: bookings,
          },
          format
        );
      } else if (category === "court-performance") {
        const resMap = new Map(resources.map((r) => [r.id, r.name]));
        const columns: ExportColumn<MoneyResourcePerformance>[] = [
          {
            header: "Court / Space",
            key: "resourceId",
            getValue: (r) => resMap.get(r.resourceId) || r.resourceId,
          },
          { header: "Currency", key: "currencyCode" },
          { header: "Commercial Value", key: "commercialValue", format: "currency" },
          { header: "Collected", key: "collected", format: "currency" },
          { header: "Outstanding", key: "outstanding", format: "currency" },
          { header: "Invoices Count", key: "invoiceCount", format: "number" },
          { header: "Payments Count", key: "paymentCount", format: "number" },
        ];

        downloadReportSpreadsheet<MoneyResourcePerformance>(
          {
            title: "SCRIPE Venue — Court Performance Report",
            categoryName: "CourtPerformance",
            tenantName,
            filters: filterSummary,
            columns,
            data: courtPerformance,
            currencyTotals,
          },
          format
        );
      } else if (category === "collections") {
        const columns: ExportColumn<MoneyPayment>[] = [
          { header: "Payment Number", key: "paymentNumber" },
          {
            header: "Payer",
            key: "payerPartyId",
            getValue: (p) => customerLookup.get(p.payerPartyId) || p.payerPartyId,
          },
          { header: "Payment Method", key: "method" },
          { header: "Status", key: "status" },
          { header: "Currency", key: "currencyCode" },
          { header: "Amount", key: "amount", format: "currency" },
          { header: "Allocated", key: "allocatedAmount", format: "currency" },
          { header: "Unallocated", key: "unallocatedAmount", format: "currency" },
          { header: "Recorded Date", key: "recordedAtUtc", getValue: (p) => p.recordedAtUtc.slice(0, 10) },
          { header: "Reference", key: "externalReference", getValue: (p) => p.externalReference || "-" },
        ];

        downloadReportSpreadsheet<MoneyPayment>(
          {
            title: "SCRIPE Venue — Payments & Collections Report",
            categoryName: "Collections",
            tenantName,
            filters: filterSummary,
            columns,
            data: payments,
            currencyTotals,
          },
          format
        );
      }

      toastSuccess({
        title: isRtl ? "تم تحميل التقرير بنجاح" : "Report exported successfully",
      });
    },
    [
      category,
      filters,
      currentTenant,
      invoices,
      bookings,
      courtPerformance,
      payments,
      customerLookup,
      resources,
      currencyTotals,
      toastSuccess,
      isRtl,
    ]
  );

  // Import Staged Actions (A12-A14)
  const handleFileSelect = (rawContent: string) => {
    try {
      const parsed = parseDelimitedText(rawContent);
      if (parsed.headers.length === 0 || parsed.rowCount === 0) {
        toastError({
          title: isRtl ? "الملف فارغ أو غير صالح" : "Uploaded file is empty or invalid format",
        });
        return;
      }
      setParsedTable(parsed);
      const autoMap = autoMapColumns(parsed.headers, importType);
      setColumnMapping(autoMap);
      setImportStep(2); // Move to Map Columns step
    } catch (e) {
      toastError({
        title: isRtl ? "فشل تحليل الملف" : "Failed to parse file",
      });
    }
  };

  const executeValidation = () => {
    if (!parsedTable) return;
    const existingEntities =
      importType === "customers"
        ? Array.from(customerLookup.entries()).map(([id, name]) => ({ id, name }))
        : resources;

    const report = validateImportRows(importType, parsedTable, columnMapping, existingEntities);
    setValidationReport(report);
    setImportStep(3); // Move to Preview / Validate step
  };

  const commitImport = async () => {
    if (!validationReport || !parsedTable) return;
    setIsCommitting(true);
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    const validRows = validationReport.rows.filter((r) => r.status === "valid" || r.status === "warning");

    try {
      const container = getVenueContainer();

      for (const row of validRows) {
        try {
          if (importType === "customers") {
            const displayName = String(row.data.name).trim();
            const type = row.data.type === "Organization" ? "Organization" : "Person";
            await container.customerRepository.create(displayName, type);
            successCount++;
          } else if (importType === "courts") {
            const name = String(row.data.name).trim();
            const categoryVal = row.data.category || "Padel";
            await container.facilityRepository.create({
              name,
              facilityType: categoryVal,
              capacity: row.data.capacity || 4,
            });
            successCount++;
          }
        } catch (rowErr) {
          errorCount++;
          const msg = rowErr instanceof Error ? rowErr.message : "Unknown import error";
          errors.push(`Row ${row.rowNumber} (${row.data.name || "unnamed"}): ${msg}`);
        }
      }

      setImportSummaryResult({ successCount, errorCount, errors });
      setImportStep(4); // Summary result step
      await loadLookups(); // Refresh lookups
      await loadReportData(); // Refresh current report

      toastSuccess({
        title: isRtl
          ? `اكتمل الاستيراد: تم استيراد ${successCount} سجل بنجاح`
          : `Import completed: ${successCount} records imported successfully`,
      });
    } catch (fatalErr) {
      const msg = fatalErr instanceof Error ? fatalErr.message : "Failed to commit import";
      toastError({ title: msg });
    } finally {
      setIsCommitting(false);
    }
  };

  const resetImport = () => {
    setParsedTable(null);
    setColumnMapping({});
    setValidationReport(null);
    setImportSummaryResult(null);
    setImportStep(1);
    setIsImportOpen(false);
  };

  return {
    category,
    setCategory,
    filters,
    setFilters,
    isLoading,
    error,
    refresh: loadReportData,
    sites,
    resources,
    invoices,
    summary,
    bookings,
    courtPerformance,
    payments,
    currencyTotals,
    handleExport,
    // Import state & actions
    isImportOpen,
    setIsImportOpen,
    importStep,
    setImportStep,
    importType,
    setImportType,
    parsedTable,
    columnMapping,
    setColumnMapping,
    validationReport,
    isCommitting,
    importSummaryResult,
    handleFileSelect,
    executeValidation,
    commitImport,
    resetImport,
    t,
    isRtl,
  };
}
