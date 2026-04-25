"use client";

import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { RichTextEditor } from "@core/ui/rich-text-editor/RichTextEditor";
import type { VariableDefinition } from "@core/ui/rich-text-editor/VariablePicker";
import { DEFAULT_VARIABLES } from "@core/ui/rich-text-editor/VariablePicker";
import { VariableValuesPanel } from "@core/ui/rich-text-editor/VariableValuesPanel";
import type { VariableValuesMap } from "@core/ui/rich-text-editor/VariableValuesPanel";
import { Badge } from "@core/ui/badge";
import { Label } from "@core/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";

import { Mail, Send, Loader2, RotateCcw, Search, X, Eye, Paperclip, CalendarClock, Braces } from "lucide-react";
import { cn } from "@core/common/utils";
import type { EmailRecipient } from "../../domain/entities/Email";
import type { IEmailRepository } from "../../domain/interfaces/IEmailRepository";
import type { EmailTemplate } from "../../domain/entities/Email";
import { TemplatePicker } from "./TemplatePicker";
import { AttachmentUploader } from "./AttachmentUploader";
import type { AttachmentFile } from "./AttachmentUploader";
import { SchedulePicker } from "./SchedulePicker";
import type { ScheduleConfig } from "./SchedulePicker";

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
      const dropdownRef = React.useRef<HTMLDivElement>(null);
      const [showDropdown, setShowDropdown] = React.useState(false);

      React.useEffect(() => {
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

// ─── Props ──────────────────────────────────────────────────
export interface ComposeSectionProps {
      recipientSearch: string;
      setRecipientSearch: (v: string) => void;
      recipientResults: EmailRecipient[];
      isSearching: boolean;
      recipients: EmailRecipient[];
      addRecipient: (r: EmailRecipient) => void;
      removeRecipient: (email: string) => void;
      addCustomEmail: (email: string, field: "to" | "cc" | "bcc") => boolean;

      showCcBcc: boolean;
      setShowCcBcc: (v: boolean) => void;
      ccSearch: string;
      setCcSearch: (v: string) => void;
      ccResults: EmailRecipient[];
      isCcSearching: boolean;
      ccRecipients: EmailRecipient[];
      addCcRecipient: (r: EmailRecipient) => void;
      removeCcRecipient: (email: string) => void;
      bccSearch: string;
      setBccSearch: (v: string) => void;
      bccResults: EmailRecipient[];
      isBccSearching: boolean;
      bccRecipients: EmailRecipient[];
      addBccRecipient: (r: EmailRecipient) => void;
      removeBccRecipient: (email: string) => void;

      subject: string;
      setSubject: (v: string) => void;
      body: string;
      setBody: (v: string) => void;
      fieldErrors: { to?: boolean; subject?: boolean; body?: boolean };
      handleSend: () => void;
      isSending: boolean;
      resetForm: () => void;
      // Template & Preview
      repository: IEmailRepository;
      applyTemplate: (template: EmailTemplate) => void;
      onPreview?: () => void;
      // Attachments
      attachments: AttachmentFile[];
      onAddAttachments: (files: File[]) => void;
      onRemoveAttachment: (id: string) => void;
      // Schedule
      schedule: ScheduleConfig;
      onScheduleChange: (config: ScheduleConfig) => void;
      // Variable system
      allVariables?: VariableDefinition[];
      variableValues?: VariableValuesMap;
      setVariableValues?: (values: VariableValuesMap) => void;
      typeOverrides?: Record<string, string>;
      setTypeOverrides?: (overrides: Record<string, string>) => void;
}

export function ComposeSection(vm: ComposeSectionProps) {
      const { t } = useI18n();

      return (
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
                        {/* Template Picker */}
                        <TemplatePicker
                              repository={vm.repository}
                              onSelect={vm.applyTemplate}
                        />

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

                        {/* CC / BCC */}
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
                              <div className="flex gap-1.5">
                                    <Input
                                          placeholder={t("messaging.email.subjectPlaceholder") || "Enter email subject..."}
                                          value={vm.subject}
                                          onChange={(e) => vm.setSubject(e.target.value)}
                                          maxLength={SUBJECT_MAX}
                                          className={cn("flex-1", vm.fieldErrors.subject && "border-destructive focus-visible:ring-destructive")}
                                    />
                                    <Popover>
                                          <PopoverTrigger asChild>
                                                <Button type="button" variant="outline" size="icon" className="shrink-0 h-9 w-9" title="Insert variable">
                                                      <Braces className="h-4 w-4" />
                                                </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-64 p-0 max-h-64 overflow-y-auto" align="end">
                                                <div className="p-2 border-b">
                                                      <p className="text-xs font-medium text-muted-foreground">Insert variable into subject</p>
                                                </div>
                                                {(vm.allVariables ?? DEFAULT_VARIABLES).map((v) => (
                                                      <Button
                                                            key={v.key}
                                                            type="button"
                                                            variant="ghost"
                                                            className="w-full justify-between gap-2 h-auto py-1.5 px-3 rounded-none font-normal"
                                                            onClick={() => vm.setSubject(vm.subject + `{{ ${v.key} }}`)}
                                                      >
                                                            <span className="truncate text-sm">{v.label}</span>
                                                            <Badge variant="outline" className="text-[10px] px-1 py-0 font-mono shrink-0">
                                                                  {`{{${v.key}}}`}
                                                            </Badge>
                                                      </Button>
                                                ))}
                                          </PopoverContent>
                                    </Popover>
                              </div>
                        </div>

                        {/* Body — Rich Text Editor */}
                        <div className="space-y-2">
                              <Label className={cn(vm.fieldErrors.body && "text-destructive")}>
                                    {t("messaging.email.body") || "Body"} *
                              </Label>
                              <RichTextEditor
                                    value={vm.body}
                                    onChange={vm.setBody}
                                    placeholder={t("messaging.email.bodyPlaceholder") || "Write your email content here..."}
                                    maxLength={BODY_MAX}
                                    minHeight="250px"
                                    variables={vm.allVariables ?? DEFAULT_VARIABLES}
                                    showSourceToggle
                                    error={vm.fieldErrors.body}
                              />
                        </div>

                        {/* Inline Variable Values — shown when body contains {{ }} */}
                        {vm.variableValues && vm.setVariableValues && vm.body.includes("{{") && (
                              <VariableValuesPanel
                                    variables={vm.allVariables ?? DEFAULT_VARIABLES}
                                    values={vm.variableValues}
                                    onChange={vm.setVariableValues}
                                    templateBody={vm.body + " " + vm.subject}
                                    typeOverrides={vm.typeOverrides}
                                    onTypeOverridesChange={vm.setTypeOverrides}
                                    className="max-h-[500px]"
                              />
                        )}

                        {/* Attachments & Schedule — collapsible section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <AttachmentUploader
                                    attachments={vm.attachments}
                                    onAdd={vm.onAddAttachments}
                                    onRemove={vm.onRemoveAttachment}
                                    maxFiles={10}
                                    maxSizeMb={25}
                              />
                              <SchedulePicker
                                    value={vm.schedule}
                                    onChange={vm.onScheduleChange}
                              />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2">
                              <p className="text-xs text-muted-foreground">
                                    {t("messaging.email.ctrlEnterHint") || "Ctrl+Enter to send"}
                              </p>
                              <div className="flex items-center gap-2">
                                    {vm.onPreview && (
                                          <Button variant="outline" onClick={vm.onPreview} className="gap-2">
                                                <Eye className="h-4 w-4" />
                                                {t("messaging.email.preview") || "Preview"}
                                          </Button>
                                    )}
                                    <Button onClick={vm.handleSend} loading={vm.isSending} className="gap-2">
                                          {!vm.isSending && <Send className="h-4 w-4" />}
                                          {t("messaging.email.send")}
                                    </Button>
                              </div>
                        </div>
                  </CardContent>
            </Card>
      );
}
