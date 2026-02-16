"use client";

import React, { useMemo, useState } from "react";
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
import {
      Mail,
      Loader2,
      ChevronLeft,
      ChevronRight,
      Trash2,
      RefreshCcw,
      Eye,
      ChevronDown,
      ChevronUp,
      FileText,
      AlertTriangle,
      CheckCircle2,
      Clock,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@core/common/utils";
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
      /** Resend: pre-fill compose with same subject/body/recipient */
      onResend?: (email: SentEmail) => void;
      /** Use as Template: navigate to template creation with body/subject */
      onUseAsTemplate?: (email: SentEmail) => void;
}

// ─── Status Config ──────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "destructive" | "secondary" | "outline"; icon: typeof CheckCircle2; color: string }> = {
      Sent: {
            label: "Sent",
            variant: "success" as const,
            icon: CheckCircle2,
            color: "text-emerald-500",
      },
      Failed: {
            label: "Failed",
            variant: "destructive" as const,
            icon: AlertTriangle,
            color: "text-red-500",
      },
      Pending: {
            label: "Pending",
            variant: "secondary" as const,
            icon: Clock,
            color: "text-amber-500",
      },
      Cancelled: {
            label: "Cancelled",
            variant: "outline" as const,
            icon: Clock,
            color: "text-gray-400",
      },
};

// ─── Expanded Row ───────────────────────────────────────────
function ExpandedEmailRow({
      email,
      onResend,
      onUseAsTemplate,
}: {
      email: SentEmail;
      onResend?: (email: SentEmail) => void;
      onUseAsTemplate?: (email: SentEmail) => void;
}) {
      return (
            <TableRow>
                  <TableCell colSpan={5} className="p-0">
                        <div className="bg-muted/30 border-t border-b px-6 py-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                              {/* Error message */}
                              {email.status === "Failed" && email.errorMessage && (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 text-destructive rounded-md text-sm">
                                          <AlertTriangle className="h-4 w-4 shrink-0" />
                                          <span>{email.errorMessage}</span>
                                    </div>
                              )}

                              {/* Subject */}
                              <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Subject</p>
                                    <p className="text-sm font-medium">{email.subject}</p>
                              </div>

                              {/* Body Preview */}
                              <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Body Preview</p>
                                    <div className="border rounded-lg bg-white dark:bg-background p-4 max-h-[200px] overflow-y-auto">
                                          {email.body.includes("<") ? (
                                                <div
                                                      className="prose prose-sm max-w-none text-sm"
                                                      dangerouslySetInnerHTML={{
                                                            __html: email.body
                                                                  .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
                                                                  .replace(/on\w+="[^"]*"/gi, "")
                                                                  .replace(/on\w+='[^']*'/gi, ""),
                                                      }}
                                                />
                                          ) : (
                                                <pre className="whitespace-pre-wrap text-sm font-sans">{email.body}</pre>
                                          )}
                                    </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                    {onResend && (
                                          <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1.5 h-7 text-xs"
                                                onClick={() => onResend(email)}
                                          >
                                                <RefreshCcw className="h-3 w-3" />
                                                {email.status === "Failed" ? "Retry" : "Resend"}
                                          </Button>
                                    )}
                                    {onUseAsTemplate && (
                                          <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1.5 h-7 text-xs"
                                                onClick={() => onUseAsTemplate(email)}
                                          >
                                                <FileText className="h-3 w-3" />
                                                Use as Template
                                          </Button>
                                    )}
                              </div>
                        </div>
                  </TableCell>
            </TableRow>
      );
}

// ─── Main Component ─────────────────────────────────────────
export function HistorySection(vm: HistorySectionProps) {
      const { t } = useI18n();
      const [expandedId, setExpandedId] = useState<string | null>(null);

      const toggleExpand = (id: string) => {
            setExpandedId((prev) => (prev === id ? null : id));
      };

      return (
            <Card>
                  <CardHeader>
                        <div className="flex items-center justify-between">
                              <div>
                                    <CardTitle>{t("messaging.email.historyTitle")}</CardTitle>
                                    <CardDescription>{t("messaging.email.historyDescription")}</CardDescription>
                              </div>
                              {vm.historyTotal > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                          {vm.historyTotal} {t("common.items") || "total"}
                                    </Badge>
                              )}
                        </div>
                  </CardHeader>
                  <CardContent>
                        {vm.isHistoryLoading ? (
                              <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                              </div>
                        ) : vm.history.length === 0 ? (
                              <div className="text-center py-12 text-muted-foreground">
                                    <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p className="font-medium">{t("common.noData") || "No sent emails yet"}</p>
                                    <p className="text-sm mt-1">Emails you send will appear here</p>
                              </div>
                        ) : (
                              <>
                                    <Table>
                                          <TableHeader>
                                                <TableRow>
                                                      <TableHead className="w-8" />
                                                      <TableHead>{t("messaging.email.to") || "To"}</TableHead>
                                                      <TableHead>{t("messaging.email.subject") || "Subject"}</TableHead>
                                                      <TableHead>{t("common.status") || "Status"}</TableHead>
                                                      <TableHead>{t("messaging.email.sentAt") || "Sent At"}</TableHead>
                                                      <TableHead className="w-20">{t("common.actions") || "Actions"}</TableHead>
                                                </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                                {vm.history.map((email, idx) => {
                                                      const isExpanded = expandedId === email.id;
                                                      const statusConf = STATUS_CONFIG[email.status] || STATUS_CONFIG.Pending;
                                                      const StatusIcon = statusConf.icon;

                                                      return (
                                                            <React.Fragment key={email.id || idx}>
                                                                  <TableRow
                                                                        className={cn(
                                                                              "cursor-pointer transition-colors",
                                                                              isExpanded && "bg-muted/20"
                                                                        )}
                                                                        onClick={() => toggleExpand(email.id)}
                                                                  >
                                                                        {/* Expand toggle */}
                                                                        <TableCell className="pr-0">
                                                                              {isExpanded ? (
                                                                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                                              ) : (
                                                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                                              )}
                                                                        </TableCell>

                                                                        {/* To */}
                                                                        <TableCell>
                                                                              <span className="truncate max-w-[200px] inline-block font-medium" title={email.to}>
                                                                                    {email.to}
                                                                              </span>
                                                                        </TableCell>

                                                                        {/* Subject */}
                                                                        <TableCell>
                                                                              <span className="truncate max-w-[250px] inline-block">
                                                                                    {email.subject}
                                                                              </span>
                                                                        </TableCell>

                                                                        {/* Status */}
                                                                        <TableCell>
                                                                              <Badge
                                                                                    variant={statusConf.variant}
                                                                                    className="gap-1"
                                                                              >
                                                                                    <StatusIcon className="h-3 w-3" />
                                                                                    {t(`messaging.email.status${email.status.charAt(0).toUpperCase() + email.status.slice(1)}`) || statusConf.label}
                                                                              </Badge>
                                                                        </TableCell>

                                                                        {/* Sent At */}
                                                                        <TableCell className="text-sm text-muted-foreground">
                                                                              {email.sentAt
                                                                                    ? format(new Date(email.sentAt), "MMM d, yyyy HH:mm")
                                                                                    : "-"}
                                                                        </TableCell>

                                                                        {/* Quick Actions */}
                                                                        <TableCell>
                                                                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                                                    {email.status === "Failed" && vm.onResend && (
                                                                                          <Button
                                                                                                variant="ghost"
                                                                                                size="icon"
                                                                                                className="h-7 w-7 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                                                                                                onClick={() => vm.onResend!(email)}
                                                                                                title="Retry"
                                                                                          >
                                                                                                <RefreshCcw className="h-3.5 w-3.5" />
                                                                                          </Button>
                                                                                    )}
                                                                                    {email.status === "Pending" && (
                                                                                          <Button
                                                                                                variant="ghost"
                                                                                                size="icon"
                                                                                                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                                                onClick={() => vm.cancelEmail(email.id)}
                                                                                                disabled={vm.isCancelling}
                                                                                                title={t("messaging.email.cancelEmail") || "Cancel email"}
                                                                                          >
                                                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                                          </Button>
                                                                                    )}
                                                                              </div>
                                                                        </TableCell>
                                                                  </TableRow>

                                                                  {/* Expanded Detail */}
                                                                  {isExpanded && (
                                                                        <ExpandedEmailRow
                                                                              email={email}
                                                                              onResend={vm.onResend}
                                                                              onUseAsTemplate={vm.onUseAsTemplate}
                                                                        />
                                                                  )}
                                                            </React.Fragment>
                                                      );
                                                })}
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
