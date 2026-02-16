"use client";

import { useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useEmailComposerViewModel } from "../viewmodels/useEmailComposerViewModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Label } from "@core/ui/label";
import { Mail, Send, History, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import type { SentEmail } from "../../domain/entities/Email";

interface HistoryColumn {
      key: keyof SentEmail;
      label: string;
      render?: (value: any) => React.ReactNode;
}

export function EmailComposerView() {
      const vm = useEmailComposerViewModel();
      const { t } = useI18n();

      const historyColumns: HistoryColumn[] = useMemo(() => [
            { key: "to", label: t("messaging.email.to") || "To" },
            { key: "subject", label: t("messaging.email.subject") || "Subject" },
            {
                  key: "status",
                  label: t("common.status") || "Status",
                  render: (value: string) => (
                        <Badge variant={value === "sent" ? "success" : value === "failed" ? "destructive" : "secondary"}>
                              {value}
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
            <div className="space-y-6 p-6">
                  {/* Header */}
                  <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                              <Mail className="h-6 w-6 text-primary" />
                              {t("messaging.email.title")}
                        </h1>
                        <p className="text-muted-foreground mt-1">{t("messaging.email.description")}</p>
                  </div>

                  <Tabs value={vm.activeTab} onValueChange={(v) => vm.setActiveTab(v as "compose" | "history")}>
                        <TabsList>
                              <TabsTrigger value="compose" className="gap-1.5">
                                    <Send className="h-4 w-4" />
                                    {t("messaging.email.compose")}
                              </TabsTrigger>
                              <TabsTrigger value="history" className="gap-1.5">
                                    <History className="h-4 w-4" />
                                    {t("messaging.email.history")}
                              </TabsTrigger>
                        </TabsList>

                        {/* ─── Compose Tab ─── */}
                        <TabsContent value="compose">
                              <Card>
                                    <CardHeader>
                                          <CardTitle>{t("messaging.email.composeTitle")}</CardTitle>
                                          <CardDescription>{t("messaging.email.composeDescription")}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                          {/* Recipients */}
                                          <div className="space-y-2">
                                                <Label>{t("messaging.email.to")}</Label>
                                                <div className="flex flex-wrap gap-1.5 mb-2">
                                                      {vm.recipients.map((r) => (
                                                            <Badge key={r.email} variant="secondary" className="gap-1">
                                                                  {r.name || r.email}
                                                                  <button onClick={() => vm.removeRecipient(r.email)} className="hover:text-destructive">
                                                                        <X className="h-3 w-3" />
                                                                  </button>
                                                            </Badge>
                                                      ))}
                                                </div>
                                                <div className="relative">
                                                      <Input
                                                            placeholder={t("messaging.email.searchRecipients")}
                                                            value={vm.recipientSearch}
                                                            onChange={(e) => vm.setRecipientSearch(e.target.value)}
                                                      />
                                                      {vm.recipientSearch.length >= 2 && vm.recipientResults.length > 0 && (
                                                            <div className="absolute z-10 top-full mt-1 w-full border rounded-md bg-popover shadow-lg max-h-48 overflow-y-auto">
                                                                  {vm.recipientResults.map((r) => (
                                                                        <button
                                                                              key={r.email}
                                                                              className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex justify-between items-center"
                                                                              onClick={() => vm.addRecipient(r)}
                                                                        >
                                                                              <span>{r.name || r.email}</span>
                                                                              <span className="text-muted-foreground text-xs">{r.email}</span>
                                                                        </button>
                                                                  ))}
                                                            </div>
                                                      )}
                                                </div>
                                          </div>

                                          {/* Subject */}
                                          <div className="space-y-2">
                                                <Label>{t("messaging.email.subject")}</Label>
                                                <Input
                                                      placeholder={t("messaging.email.subjectPlaceholder")}
                                                      value={vm.subject}
                                                      onChange={(e) => vm.setSubject(e.target.value)}
                                                />
                                          </div>

                                          {/* Body */}
                                          <div className="space-y-2">
                                                <Label>{t("messaging.email.body")}</Label>
                                                <Textarea
                                                      placeholder={t("messaging.email.bodyPlaceholder")}
                                                      value={vm.body}
                                                      onChange={(e) => vm.setBody(e.target.value)}
                                                      rows={10}
                                                      className="min-h-[200px]"
                                                />
                                          </div>

                                          {/* Send */}
                                          <Button onClick={vm.handleSend} disabled={vm.isSending} className="gap-2">
                                                {vm.isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                                {t("messaging.email.send")}
                                          </Button>
                                    </CardContent>
                              </Card>
                        </TabsContent>

                        {/* ─── History Tab ─── */}
                        <TabsContent value="history">
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
                                                <div className="overflow-x-auto">
                                                      <table className="w-full text-sm">
                                                            <thead>
                                                                  <tr className="border-b">
                                                                        {historyColumns.map((col) => (
                                                                              <th key={col.key} className="text-left p-2 font-medium text-muted-foreground">
                                                                                    {col.label}
                                                                              </th>
                                                                        ))}
                                                                  </tr>
                                                            </thead>
                                                            <tbody>
                                                                  {vm.history.map((email, idx) => (
                                                                        <tr key={idx} className="border-b hover:bg-muted/50">
                                                                              {historyColumns.map((col) => (
                                                                                    <td key={col.key} className="p-2">
                                                                                          {col.render
                                                                                                ? col.render(email[col.key])
                                                                                                : email[col.key]}
                                                                                    </td>
                                                                              ))}
                                                                        </tr>
                                                                  ))}
                                                            </tbody>
                                                      </table>
                                                </div>
                                          )}
                                    </CardContent>
                              </Card>
                        </TabsContent>
                  </Tabs>
            </div>
      );
}
