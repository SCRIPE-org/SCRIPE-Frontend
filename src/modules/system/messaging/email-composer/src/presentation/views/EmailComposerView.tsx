"use client";

import React, { useMemo, useEffect, useRef } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useEmailComposerViewModel } from "../viewmodels/useEmailComposerViewModel";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Label } from "@core/ui/label";
import { Mail, Send, History, X, Loader2, RotateCcw, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@core/common/utils";
import type { EmailRecipient, SentEmail } from "../../domain/entities/Email";

// ─── Character Limits ──────────────────────────────────────
const SUBJECT_MAX = 200;
const BODY_MAX = 10000;

// ─── Recipient search dropdown component ───────────────────
function RecipientSearchInput({
      label,
      placeholder,
      search,
      setSearch,
      results,
      isSearching,
      selectedRecipients,
      onAdd,
      onRemove,
      onCustomEmail,
      error,
}: {
      label: string;
      placeholder: string;
      search: string;
      setSearch: (v: string) => void;
      results: EmailRecipient[];
      isSearching: boolean;
      selectedRecipients: EmailRecipient[];
      onAdd: (r: EmailRecipient) => void;
      onRemove: (email: string) => void;
      onCustomEmail?: (email: string) => boolean;
      error?: boolean;
}) {
      const dropdownRef = useRef<HTMLDivElement>(null);
      const [showDropdown, setShowDropdown] = React.useState(false);

      // Close dropdown on outside click
      useEffect(() => {
            function handleClickOutside(e: MouseEvent) {
                  if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                        setShowDropdown(false);
                  }
            }
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
      }, []);

      const noResults = search.length >= 2 && !isSearching && results.length === 0;
      const showCustomHint = noResults && search.includes("@") && onCustomEmail;

      return (
            <div className="space-y-2">
                  <Label className={cn(error && "text-destructive")}>{label}</Label>
                  {selectedRecipients.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                              {selectedRecipients.map((r) => (
                                    <Badge
                                          key={r.email}
                                          variant={r.type === "custom" ? "outline" : "secondary"}
                                          className={cn("gap-1", r.type === "custom" && "border-blue-500/50 text-blue-600 dark:text-blue-400")}
                                    >
                                          {r.type === "custom" && <Mail className="h-3 w-3" />}
                                          {r.name || r.email}
                                          <button onClick={() => onRemove(r.email)} className="hover:text-destructive" aria-label={`Remove ${r.name || r.email}`}>
                                                <X className="h-3 w-3" />
                                          </button>
                                    </Badge>
                              ))}
                        </div>
                  )}
                  <div className="relative" ref={dropdownRef}>
                        <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                    placeholder={placeholder}
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
                                    onFocus={() => setShowDropdown(true)}
                                    onKeyDown={(e) => {
                                          if (e.key === "Enter" && onCustomEmail && search.trim()) {
                                                e.preventDefault();
                                                const added = onCustomEmail(search);
                                                if (added) setShowDropdown(false);
                                          }
                                    }}
                                    className={cn("pl-9", error && "border-destructive focus-visible:ring-destructive")}
                              />
                              {isSearching && (
                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                              )}
                        </div>
                        {showDropdown && search.length >= 2 && (
                              <div className="absolute z-10 top-full mt-1 w-full border rounded-md bg-popover shadow-lg max-h-48 overflow-y-auto">
                                    {results.length > 0
                                          ? results.map((r) => (
                                                <button
                                                      key={r.email}
                                                      className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex justify-between items-center"
                                                      onClick={() => { onAdd(r); setShowDropdown(false); }}
                                                >
                                                      <span className="font-medium">{r.name || r.email}</span>
                                                      <span className="text-muted-foreground text-xs">{r.email}</span>
                                                </button>
                                          ))
                                          : showCustomHint ? (
                                                <button
                                                      className="w-full px-3 py-3 text-sm text-left hover:bg-accent flex items-center gap-2"
                                                      onClick={() => {
                                                            if (onCustomEmail) {
                                                                  const added = onCustomEmail(search);
                                                                  if (added) setShowDropdown(false);
                                                            }
                                                      }}
                                                >
                                                      <Mail className="h-4 w-4 text-blue-500" />
                                                      <span>Send to <strong className="text-blue-600 dark:text-blue-400">{search.trim()}</strong></span>
                                                </button>
                                          ) : noResults && (
                                                <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                                                      <Search className="h-5 w-5 mx-auto mb-1 opacity-40" />
                                                      No recipients found. Type a full email and press Enter.
                                                </div>
                                          )}
                              </div>
                        )}
                  </div>
            </div>
      );
}

// ─── Main View ─────────────────────────────────────────────
export function EmailComposerView() {
      const vm = useEmailComposerViewModel();
      const { t } = useI18n();

      // Ctrl+Enter shortcut
      useEffect(() => {
            function handleKeyDown(e: KeyboardEvent) {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                        e.preventDefault();
                        vm.handleSend();
                  }
            }
            window.addEventListener("keydown", handleKeyDown);
            return () => window.removeEventListener("keydown", handleKeyDown);
      }, [vm.handleSend]);

      // History columns
      interface HistoryColumn {
            key: keyof SentEmail;
            label: string;
            render?: (value: any) => React.ReactNode;
      }

      const historyColumns: HistoryColumn[] = useMemo(() => [
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
            <>
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
                                                <div className="flex items-center justify-between">
                                                      <div>
                                                            <CardTitle>{t("messaging.email.composeTitle")}</CardTitle>
                                                            <CardDescription>{t("messaging.email.composeDescription")}</CardDescription>
                                                      </div>
                                                      <div className="flex items-center gap-2">
                                                            {!vm.showCcBcc && (
                                                                  <Button variant="ghost" size="sm" onClick={() => vm.setShowCcBcc(true)}>
                                                                        {t("messaging.email.ccBcc") || "CC / BCC"}
                                                                  </Button>
                                                            )}
                                                            <Button variant="ghost" size="sm" onClick={vm.resetForm} className="gap-1.5 text-muted-foreground">
                                                                  <RotateCcw className="h-3.5 w-3.5" />
                                                                  {t("messaging.email.clearForm") || "Clear"}
                                                            </Button>
                                                      </div>
                                                </div>
                                          </CardHeader>
                                          <CardContent className="space-y-4">
                                                {/* To */}
                                                <RecipientSearchInput
                                                      label={`${t("messaging.email.to") || "To"} *`}
                                                      placeholder={t("messaging.email.searchRecipients") || "Search or type custom email..."}
                                                      search={vm.recipientSearch}
                                                      setSearch={vm.setRecipientSearch}
                                                      results={vm.recipientResults}
                                                      isSearching={vm.isSearching}
                                                      selectedRecipients={vm.recipients}
                                                      onAdd={vm.addRecipient}
                                                      onRemove={vm.removeRecipient}
                                                      onCustomEmail={(email) => vm.addCustomEmail(email, "to")}
                                                      error={vm.fieldErrors.to}
                                                />

                                                {/* CC */}
                                                {vm.showCcBcc && (
                                                      <>
                                                            <RecipientSearchInput
                                                                  label={t("messaging.email.cc") || "CC"}
                                                                  placeholder={t("messaging.email.searchRecipients") || "Search or type custom email..."}
                                                                  search={vm.ccSearch}
                                                                  setSearch={vm.setCcSearch}
                                                                  results={vm.ccResults}
                                                                  isSearching={vm.isCcSearching}
                                                                  selectedRecipients={vm.ccRecipients}
                                                                  onAdd={vm.addCcRecipient}
                                                                  onRemove={vm.removeCcRecipient}
                                                                  onCustomEmail={(email) => vm.addCustomEmail(email, "cc")}
                                                            />

                                                            {/* BCC */}
                                                            <RecipientSearchInput
                                                                  label={t("messaging.email.bcc") || "BCC"}
                                                                  placeholder={t("messaging.email.searchRecipients") || "Search or type custom email..."}
                                                                  search={vm.bccSearch}
                                                                  setSearch={vm.setBccSearch}
                                                                  results={vm.bccResults}
                                                                  isSearching={vm.isBccSearching}
                                                                  selectedRecipients={vm.bccRecipients}
                                                                  onAdd={vm.addBccRecipient}
                                                                  onRemove={vm.removeBccRecipient}
                                                                  onCustomEmail={(email) => vm.addCustomEmail(email, "bcc")}
                                                            />
                                                      </>
                                                )}

                                                {/* Subject */}
                                                <div className="space-y-2">
                                                      <div className="flex items-center justify-between">
                                                            <Label className={cn(vm.fieldErrors.subject && "text-destructive")}>
                                                                  {t("messaging.email.subject") || "Subject"} *
                                                            </Label>
                                                            <span className={cn(
                                                                  "text-xs",
                                                                  vm.subject.length > SUBJECT_MAX ? "text-destructive" : "text-muted-foreground"
                                                            )}>
                                                                  {vm.subject.length}/{SUBJECT_MAX}
                                                            </span>
                                                      </div>
                                                      <Input
                                                            placeholder={t("messaging.email.subjectPlaceholder") || "Enter email subject..."}
                                                            value={vm.subject}
                                                            onChange={(e) => vm.setSubject(e.target.value)}
                                                            maxLength={SUBJECT_MAX}
                                                            className={cn(vm.fieldErrors.subject && "border-destructive focus-visible:ring-destructive")}
                                                      />
                                                </div>

                                                {/* Body */}
                                                <div className="space-y-2">
                                                      <div className="flex items-center justify-between">
                                                            <Label className={cn(vm.fieldErrors.body && "text-destructive")}>
                                                                  {t("messaging.email.body") || "Body"} *
                                                            </Label>
                                                            <span className={cn(
                                                                  "text-xs",
                                                                  vm.body.length > BODY_MAX ? "text-destructive" : "text-muted-foreground"
                                                            )}>
                                                                  {vm.body.length.toLocaleString()}/{BODY_MAX.toLocaleString()}
                                                            </span>
                                                      </div>
                                                      <Textarea
                                                            placeholder={t("messaging.email.bodyPlaceholder") || "Write your email content here..."}
                                                            value={vm.body}
                                                            onChange={(e) => vm.setBody(e.target.value)}
                                                            rows={10}
                                                            className={cn("min-h-[200px]", vm.fieldErrors.body && "border-destructive focus-visible:ring-destructive")}
                                                      />
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center justify-between pt-2">
                                                      <p className="text-xs text-muted-foreground">
                                                            {t("messaging.email.ctrlEnterHint") || "Ctrl+Enter to send"}
                                                      </p>
                                                      <Button onClick={vm.handleSend} disabled={vm.isSending} className="gap-2">
                                                            {vm.isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                                            {t("messaging.email.send")}
                                                      </Button>
                                                </div>
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
                                                      <>
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
                                                                                    <tr key={email.id || idx} className="border-b hover:bg-muted/50 transition-colors">
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
                              </TabsContent>
                        </Tabs>
                  </div>

                  {/* Send Confirmation Dialog */}
                  <ConfirmationDialog
                        open={vm.confirmSendOpen}
                        onOpenChange={vm.setConfirmSendOpen}
                        title={t("messaging.email.confirmSendTitle") || "Send Email"}
                        description={
                              `${t("messaging.email.confirmSendDescription") || "Send this email to"} ${vm.recipients.length} ${t("messaging.email.recipientsLabel") || "recipient(s)"}?`
                        }
                        confirmText={t("messaging.email.send") || "Send Email"}
                        cancelText={t("common.cancel") || "Cancel"}
                        onConfirm={vm.confirmSend}
                        isLoading={vm.isSending}
                        variant="info"
                  />
            </>
      );
}
