"use client";

import React, { useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import {
      Table,
      TableHeader,
      TableBody,
      TableHead,
      TableRow,
      TableCell,
} from "@core/ui/table";
import { Mail, Loader2, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { SentEmail } from "../../domain/entities/Email";

// ─── Props ──────────────────────────────────────────────────
export interface HistorySectionProps {
      history: SentEmail[];
      historyTotal: number;
      historyPage: number;
      setHistoryPage: (page: number) => void;
      historyTotalPages: number;
      isHistoryLoading: boolean;
      cancelEmail: (id: string) => void;
      isCancelling: boolean;
}

export function HistorySection(vm: HistorySectionProps) {
      const { t } = useI18n();

      // Column definitions
      interface HistoryColumn {
            key: keyof SentEmail;
            label: string;
            render?: (value: any) => React.ReactNode;
      }

      const columns: HistoryColumn[] = useMemo(() => [
            {
                  key: "to",
                  label: t("messaging.email.to") || "To",
                  render: (value: string | string[]) => {
                        const emails = Array.isArray(value) ? value.join(", ") : value;
                        return <span className="truncate max-w-[200px] inline-block" title={emails}>{emails}</span>;
                  },
            },
            { key: "subject", label: t("messaging.email.subject") || "Subject" },
            {
                  key: "status",
                  label: t("common.status") || "Status",
                  render: (value: string) => (
                        <Badge variant={value === "sent" ? "success" : value === "failed" ? "destructive" : "secondary"}>
                              {value === "sent"
                                    ? t("messaging.email.statusSent") || "Sent"
                                    : value === "failed"
                                          ? t("messaging.email.statusFailed") || "Failed"
                                          : t("messaging.email.statusPending") || "Pending"}
                        </Badge>
                  ),
            },
            {
                  key: "sentAt",
                  label: t("messaging.email.sentAt") || "Sent At",
                  render: (value: string) => (value ? format(new Date(value), "MMM d, yyyy HH:mm") : "-"),
            },
      ], [t]);

      return (
            <Card>
                  <CardHeader>
                        <CardTitle>{t("messaging.email.historyTitle")}</CardTitle>
                        <CardDescription>{t("messaging.email.historyDescription")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                        {vm.isHistoryLoading ? (
                              <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                              </div>
                        ) : vm.history.length === 0 ? (
                              <div className="text-center py-12 text-muted-foreground">
                                    <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p>{t("common.noData") || "No sent emails yet"}</p>
                              </div>
                        ) : (
                              <>
                                    <Table>
                                          <TableHeader>
                                                <TableRow>
                                                      {columns.map((col) => (
                                                            <TableHead key={col.key}>{col.label}</TableHead>
                                                      ))}
                                                      <TableHead className="w-12" />
                                                </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                                {vm.history.map((email, idx) => (
                                                      <TableRow key={email.id || idx}>
                                                            {columns.map((col) => (
                                                                  <TableCell key={col.key}>
                                                                        {col.render
                                                                              ? col.render(email[col.key])
                                                                              : email[col.key]}
                                                                  </TableCell>
                                                            ))}
                                                            <TableCell>
                                                                  {email.status === "pending" && (
                                                                        <Button
                                                                              variant="ghost"
                                                                              size="icon"
                                                                              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                              onClick={() => vm.cancelEmail(email.id)}
                                                                              disabled={vm.isCancelling}
                                                                              title={t("messaging.email.cancelEmail") || "Cancel email"}
                                                                        >
                                                                              <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                  )}
                                                            </TableCell>
                                                      </TableRow>
                                                ))}
                                          </TableBody>
                                    </Table>

                                    {/* Pagination */}
                                    {vm.historyTotalPages > 1 && (
                                          <div className="flex items-center justify-between pt-4">
                                                <p className="text-sm text-muted-foreground">
                                                      {t("common.page") || "Page"} {vm.historyPage} / {vm.historyTotalPages}
                                                      {" · "}
                                                      {vm.historyTotal} {t("common.items") || "items"}
                                                </p>
                                                <div className="flex gap-1">
                                                      <Button
                                                            variant="outline"
                                                            size="icon"
                                                            disabled={vm.historyPage <= 1}
                                                            onClick={() => vm.setHistoryPage(vm.historyPage - 1)}
                                                      >
                                                            <ChevronLeft className="h-4 w-4" />
                                                      </Button>
                                                      <Button
                                                            variant="outline"
                                                            size="icon"
                                                            disabled={vm.historyPage >= vm.historyTotalPages}
                                                            onClick={() => vm.setHistoryPage(vm.historyPage + 1)}
                                                      >
                                                            <ChevronRight className="h-4 w-4" />
                                                      </Button>
                                                </div>
                                          </div>
                                    )}
                              </>
                        )}
                  </CardContent>
            </Card>
      );
}
