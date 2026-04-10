"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Card, CardContent } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@core/ui/dialog";
import { Receipt, Eye, Download, RefreshCw, Loader2, CreditCard, Ban } from "lucide-react";
import { useInvoicesViewModel } from "../viewmodels/useInvoicesViewModel";

export function InvoicesView() {
  useModuleLocales(() => import("../../../locales"), "invoices");
  const { t } = useI18n();
  const vm = useInvoicesViewModel();

  const statusColor = (status: string) => {
    switch (status) {
      case "Paid": return "success";
      case "Pending": case "Sent": return "default";
      case "Overdue": return "destructive";
      case "Void": case "Cancelled": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
          <Receipt className="h-5 w-5 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("invoices.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("invoices.description")}</p>
        </div>
      </div>

      {vm.isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : vm.error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-destructive mb-3">{t("common.errorLoading")}</p>
            <Button variant="outline" size="sm" onClick={() => vm.refetch()} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />{t("common.retry")}
            </Button>
          </CardContent>
        </Card>
      ) : vm.items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mb-4">
              <Receipt className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-lg mb-1">{t("invoices.empty")}</h3>
            <p className="text-sm text-muted-foreground">{t("invoices.emptyDesc")}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>{t("invoices.invoiceNumber") || "Invoice #"}</TableHead>
                  <TableHead>{t("invoices.tenant") || "Tenant"}</TableHead>
                  <TableHead>{t("invoices.amount") || "Amount"}</TableHead>
                  <TableHead>{t("invoices.status") || "Status"}</TableHead>
                  <TableHead>{t("invoices.dueDate") || "Due Date"}</TableHead>
                  <TableHead className="text-right">{t("common.actions") || "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vm.items.map((inv: any, idx: number) => (
                  <TableRow key={inv.id}>
                    <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-mono text-sm font-medium">{inv.invoiceNumber ?? inv.number ?? `INV-${idx + 1}`}</TableCell>
                    <TableCell>{inv.tenantName ?? inv.tenant ?? "—"}</TableCell>
                    <TableCell className="font-medium">${(inv.amount ?? 0).toFixed(2)}</TableCell>
                    <TableCell><Badge variant={statusColor(inv.status) as any}>{inv.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{inv.dueDate ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="gap-1" onClick={() => vm.handleView(inv)}>
                          <Eye className="h-3.5 w-3.5" />{t("common.view") || "View"}
                        </Button>
                        <Button
                          variant="ghost" size="sm" className="gap-1"
                          disabled={vm.isDownloading && vm.downloadingId === inv.id}
                          onClick={() => vm.handleDownload(inv.id)}
                        >
                          {vm.isDownloading && vm.downloadingId === inv.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                          {t("invoices.download") || "PDF"}
                        </Button>
                        {inv.status !== "Paid" && inv.status !== "Void" && (
                          <Button
                            variant="ghost" size="sm" className="gap-1"
                            disabled={vm.isPaying && vm.payingId === inv.id}
                            onClick={() => vm.handlePay(inv.id)}
                          >
                            {vm.isPaying && vm.payingId === inv.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CreditCard className="h-3.5 w-3.5" />
                            )}
                            {t("invoices.pay") || "Pay"}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* View Dialog */}
      <Dialog open={vm.viewDialogOpen} onOpenChange={vm.setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{vm.selectedInvoice?.invoiceNumber ?? "Invoice Details"}</DialogTitle>
            <DialogDescription>{t("invoices.viewDesc") || "Invoice details and status."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-medium">${(vm.selectedInvoice?.amount ?? 0).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant={statusColor(vm.selectedInvoice?.status ?? "") as any}>{vm.selectedInvoice?.status}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Due Date</span><span>{vm.selectedInvoice?.dueDate ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tenant</span><span>{vm.selectedInvoice?.tenantName ?? "—"}</span></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
