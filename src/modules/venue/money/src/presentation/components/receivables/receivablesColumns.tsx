import { Badge } from "@core/ui/badge";
import type { CrudColumn } from "@core/crud/components/generic-crud-view";
import type { MoneyInvoice } from "../../../domain/entities/Money";
import {
  formatInvoiceStatusLabel,
  formatReceivableDate,
  formatReceivableMoney,
  formatShortPartyId,
  getInvoiceStatusBadgeVariant,
} from "./receivablesFormatters";

interface BuildReceivablesColumnsParams {
  language: string;
  t: (key: string, params?: Record<string, string | number>) => string;
}

/**
 * Builds column definitions for Receivables GenericCrudView Table rendering.
 */
export function buildReceivablesColumns({
  language,
  t,
}: BuildReceivablesColumnsParams): CrudColumn<MoneyInvoice>[] {
  return [
    {
      key: "invoiceNumber",
      label: t("money.receivables.columns.invoiceNumber"),
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-xs font-semibold text-nx-ink" dir="ltr">
          {value}
        </span>
      ),
    },
    {
      key: "status",
      label: t("money.receivables.columns.status"),
      sortable: true,
      render: (_value: string, item: MoneyInvoice) => (
        <Badge variant={getInvoiceStatusBadgeVariant(item)} className="px-2 py-0.5 text-[11px]">
          {formatInvoiceStatusLabel(item.status, t)}
        </Badge>
      ),
    },
    {
      key: "payerPartyId",
      label: t("money.receivables.columns.payer"),
      hideOnMobile: true,
      render: (value: string) => (
        <span className="font-mono text-xs text-nx-ink-2" title={value}>
          {formatShortPartyId(value)}
        </span>
      ),
    },
    {
      key: "effectiveTotalAmount",
      label: t("money.receivables.columns.effectiveTotal"),
      sortable: true,
      className: "text-end tabular-nums",
      render: (value: number, item: MoneyInvoice) => (
        <span className="font-mono text-xs font-semibold text-nx-ink">
          {formatReceivableMoney(value, item.currencyCode, language)}
        </span>
      ),
    },
    {
      key: "paidAmount",
      label: t("money.receivables.columns.paid"),
      sortable: true,
      className: "text-end tabular-nums",
      render: (value: number, item: MoneyInvoice) => (
        <span className="font-mono text-xs font-semibold text-success">
          {formatReceivableMoney(value, item.currencyCode, language)}
        </span>
      ),
    },
    {
      key: "outstandingAmount",
      label: t("money.receivables.columns.outstanding"),
      sortable: true,
      className: "text-end tabular-nums",
      render: (value: number, item: MoneyInvoice) => (
        <span
          className={`font-mono text-xs font-bold ${value > 0 ? "text-warning" : "text-nx-ink"}`}
        >
          {formatReceivableMoney(value, item.currencyCode, language)}
        </span>
      ),
    },
    {
      key: "issuedAtUtc",
      label: t("money.receivables.columns.issuedAt"),
      sortable: true,
      hideOnMobile: true,
      render: (value: string) => (
        <span className="font-mono text-xs text-nx-ink-2">
          {formatReceivableDate(value, language, "medium")}
        </span>
      ),
    },
    {
      key: "dueAtUtc",
      label: t("money.receivables.columns.dueAt"),
      sortable: true,
      hideOnMobile: true,
      render: (value: string | null) => (
        <span className="font-mono text-xs text-nx-ink-3">
          {formatReceivableDate(value, language, "short")}
        </span>
      ),
    },
  ];
}
