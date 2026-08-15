// FILE-EXCEPTION: file length
"use client";

import React, { useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@core/ui/table";
import { SectionState } from "@core/ui/section-state";
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
  FileText,
  Paperclip,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Sun,
  Moon,
} from "lucide-react";
import { formatUtc } from "@core/common/utils";
import type { SentEmail } from "../../domain/entities/Email";

// ─── Preview Canvas Skins ───────────────────────────────────
// Mirrors the Dark/Light skins in Core.Application/Emails/ScripeEmailTheme.cs so
// admins previewing a sent email here see the same canvas the backend actually
// ships — a dark canvas by default (`EmailCanvas.Dark`), with Light reserved
// for print-intended mail. Kept as literal values (not design tokens) because
// this simulates a fixed, backend-owned email canvas, not the admin app's own.
const EMAIL_CANVAS_SKIN = {
  dark: { surface: "#0D0D0E", text: "#F7F8F5", link: "#C6FF00" },
  light: { surface: "#F7F8F5", text: "#0D0D0E", link: "#4C6200" },
} as const;
type CanvasTheme = keyof typeof EMAIL_CANVAS_SKIN;

// ─── Language / Direction ───────────────────────────────────
// SentEmail carries no language field of its own (see domain/entities/Email.ts),
// so direction is inferred from the actual sent text — the same signal a mail
// client uses.
const ARABIC_SCRIPT_RE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

function detectDir(text: string): { lang: string; dir: "rtl" | "ltr" } {
  const dir = ARABIC_SCRIPT_RE.test(text) ? "rtl" : "ltr";
  return { lang: dir === "rtl" ? "ar" : "en", dir };
}

// Same DOMPurify allow-list as templates/PreviewDialog.tsx — one sanitization
// policy for every surface that renders admin- or lead-controlled HTML into a
// srcDoc iframe, instead of each preview inventing its own regex denylist.
const SANITIZE_OPTIONS = {
  ALLOWED_TAGS: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "br",
    "hr",
    "span",
    "div",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "ul",
    "ol",
    "li",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "a",
    "img",
    "blockquote",
    "pre",
    "code",
  ],
  ALLOWED_ATTR: ["href", "src", "alt", "class", "style", "target", "rel", "width", "height"],
  ALLOW_DATA_ATTR: false,
};

// ─── Props ──────────────────────────────────────────────────
/**
 * Interface defining property specifications, keys types, and structural contract rules for history section props.
 */
export interface HistorySectionProps {
  history: SentEmail[];
  historyTotal: number;
  historyPage: number;
  setHistoryPage: (page: number) => void;
  historyTotalPages: number;
  isHistoryLoading: boolean;
  /** Set when the history fetch itself failed (distinct from an empty result). */
  historyError?: Error | null;
  /** Refetch after a failed history fetch. */
  refetchHistory?: () => void;
  cancelEmail: (id: string) => void;
  isCancelling: boolean;
  /** Resend: pre-fill compose with same subject/body/recipient */
  onResend?: (email: SentEmail) => void;
  /** Use as Template: navigate to template creation with body/subject */
  onUseAsTemplate?: (email: SentEmail) => void;
  /** History search text */
  historySearch?: string;
  setHistorySearch?: (v: string) => void;
  /** History status filter */
  historyStatus?: string;
  setHistoryStatus?: (v: string) => void;
}

// ─── Status Config ──────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  {
    labelKey: string;
    variant: "success" | "destructive" | "secondary" | "outline";
    icon: typeof CheckCircle2;
  }
> = {
  Sent: { labelKey: "messaging.email.statusSent", variant: "success", icon: CheckCircle2 },
  Failed: { labelKey: "messaging.email.statusFailed", variant: "destructive", icon: AlertTriangle },
  Pending: { labelKey: "messaging.email.statusPending", variant: "secondary", icon: Clock },
  Cancelled: { labelKey: "messaging.email.statusCancelled", variant: "outline", icon: Clock },
};

// ─── Expanded Row ───────────────────────────────────────────
function ExpandedEmailRow({
  email,
  onResend,
  onUseAsTemplate,
  canvasTheme,
  onToggleCanvasTheme,
}: {
  email: SentEmail;
  onResend?: (email: SentEmail) => void;
  onUseAsTemplate?: (email: SentEmail) => void;
  canvasTheme: CanvasTheme;
  onToggleCanvasTheme: () => void;
}) {
  const { t } = useI18n();
  const skin = EMAIL_CANVAS_SKIN[canvasTheme];
  const { lang: previewLang, dir: previewDir } = useMemo(
    () => detectDir(`${email.subject} ${email.body}`),
    [email.subject, email.body]
  );
  const sanitizedBody = useMemo(
    () => DOMPurify.sanitize(email.body, SANITIZE_OPTIONS),
    [email.body]
  );
  const previewSrcDoc = useMemo(
    () =>
      `<!DOCTYPE html><html dir="${previewDir}" lang="${previewLang}"><head><meta charset="utf-8"/><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;line-height:1.5;color:${skin.text};padding:12px;background:${skin.surface}}img{max-width:100%;height:auto}a{color:${skin.link}}</style></head><body>${sanitizedBody}</body></html>`,
    [previewDir, previewLang, skin, sanitizedBody]
  );
  return (
    <TableRow>
      <TableCell colSpan={6} className="p-0">
        <div className="space-y-4 border-b border-t border-nx-line bg-nx-raised px-6 py-4 duration-nx-standard ease-nx-enter animate-in fade-in-0">
          {/* Error message */}
          {email.status === "Failed" && email.errorMessage && (
            <div className="flex items-center gap-2 rounded-nx-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{email.errorMessage}</span>
            </div>
          )}

          {/* Subject */}
          <div>
            <p className="mb-1 text-xs font-medium text-nx-ink-3">{t("messaging.email.subject")}</p>
            <p className="text-sm font-medium text-nx-ink">{email.subject}</p>
          </div>

          {/* Body Preview */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs font-medium text-nx-ink-3">
                {t("messaging.email.bodyPreview")}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-1.5 text-[10px]"
                onClick={onToggleCanvasTheme}
              >
                {canvasTheme === "dark" ? (
                  <Moon className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <Sun className="h-3 w-3" aria-hidden="true" />
                )}
                {canvasTheme === "dark" ? t("theme.dark") : t("theme.light")}
              </Button>
            </div>
            {/* This is the recipient's paper, not our chrome. The backend ships
                a fixed dark canvas by default (EmailCanvas.Dark in
                ScripeEmailTheme.cs) with no light-mode media query, so this
                pane follows the toggle above rather than staying hardcoded
                white — it defaults to dark to match. */}
            <div
              className="max-h-[200px] overflow-hidden rounded-nx-lg border border-nx-line"
              style={{ background: skin.surface }}
            >
              {email.body.includes("<") ? (
                <iframe
                  srcDoc={previewSrcDoc}
                  sandbox="allow-same-origin"
                  className="w-full border-0"
                  style={{ height: "180px" }}
                  title={t("messaging.email.bodyPreview")}
                />
              ) : (
                <pre
                  dir={previewDir}
                  lang={previewLang}
                  className="whitespace-pre-wrap p-4 font-sans text-sm"
                  style={{ color: skin.text }}
                >
                  {email.body}
                </pre>
              )}
            </div>
          </div>

          {/* Attachments */}
          {email.attachments &&
            (() => {
              const urls = email.attachments
                .split(",")
                .map((u) => u.trim())
                .filter(Boolean);
              if (urls.length === 0) return null;
              return (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-nx-ink-3">
                    <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("messaging.email.attachments")} ({urls.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {urls.map((url, i) => {
                      const fileName = decodeURIComponent(
                        url.split("/").pop() || `attachment-${i + 1}`
                      );
                      return (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-nx-md border border-nx-line bg-nx-raised-2 px-3 py-1.5 text-xs font-medium text-nx-ink transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-raised focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
                        >
                          <FileText className="h-3.5 w-3.5 shrink-0 text-info" aria-hidden="true" />
                          <span className="max-w-[200px] truncate">{fileName}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {onResend && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 text-xs"
                onClick={() => onResend(email)}
              >
                <RefreshCcw className="h-3 w-3" aria-hidden="true" />
                {email.status === "Failed"
                  ? t("messaging.email.retry")
                  : t("messaging.email.resend")}
              </Button>
            )}
            {onUseAsTemplate && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 text-xs"
                onClick={() => onUseAsTemplate(email)}
              >
                <FileText className="h-3 w-3" aria-hidden="true" />
                {t("messaging.email.useAsTemplate")}
              </Button>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─── Main Component ─────────────────────────────────────────
/**
 * Presentation UI component rendering the history section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function HistorySection(vm: HistorySectionProps) {
  const { t } = useI18n();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Defaults to dark: that's what EmailCanvas.Dark ships to recipients by
  // default (see ScripeEmailTheme.cs). One toggle for every expanded row —
  // it's a viewing preference, not per-email data.
  const [canvasTheme, setCanvasTheme] = useState<CanvasTheme>("dark");

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
              {vm.historyTotal} {t("common.items")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Search & Status Filter Bar */}
        {(vm.setHistorySearch || vm.setHistoryStatus) && (
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            {vm.setHistorySearch && (
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute start-3 top-1/2 z-raised h-4 w-4 -translate-y-1/2 text-nx-ink-3"
                  aria-hidden="true"
                />
                <Input
                  type="text"
                  placeholder={t("common.search")}
                  value={vm.historySearch || ""}
                  onChange={(e) => vm.setHistorySearch!(e.target.value)}
                  className="ps-9"
                />
              </div>
            )}
            {vm.setHistoryStatus && (
              <div className="min-w-[160px]">
                <Select
                  value={vm.historyStatus || "all"}
                  onValueChange={(value) => vm.setHistoryStatus!(value === "all" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("common.all")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("common.all")}</SelectItem>
                    <SelectItem value="Sent">{t("messaging.email.statusSent")}</SelectItem>
                    <SelectItem value="Failed">{t("messaging.email.statusFailed")}</SelectItem>
                    <SelectItem value="Pending">{t("messaging.email.statusPending")}</SelectItem>
                    <SelectItem value="Cancelled">
                      {t("messaging.email.statusCancelled")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        <SectionState
          isLoading={vm.isHistoryLoading}
          error={vm.historyError}
          onRetry={vm.refetchHistory}
          isEmpty={vm.history.length === 0}
          emptyMessage={t("messaging.email.historyEmpty")}
          skeletonType="rows"
          skeletonRows={5}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>{t("messaging.email.to")}</TableHead>
                <TableHead>{t("messaging.email.subject")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("messaging.email.sentAt")}</TableHead>
                <TableHead className="w-20">{t("common.actions")}</TableHead>
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
                      clickable
                      selected={isExpanded}
                      aria-expanded={isExpanded}
                      onClick={() => toggleExpand(email.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleExpand(email.id);
                        }
                      }}
                    >
                      {/* Expand toggle */}
                      <TableCell className="pe-0">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
                        )}
                      </TableCell>

                      {/* To */}
                      <TableCell>
                        <span
                          className="inline-block max-w-[200px] truncate font-medium text-nx-ink"
                          title={email.to}
                        >
                          {email.to}
                        </span>
                      </TableCell>

                      {/* Subject */}
                      <TableCell>
                        <span className="inline-block max-w-[250px] truncate text-nx-ink">
                          {email.subject}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge variant={statusConf.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" aria-hidden="true" />
                          {t(statusConf.labelKey)}
                        </Badge>
                      </TableCell>

                      {/* Sent At */}
                      <TableCell className="text-sm text-nx-ink-2">
                        {email.sentAt ? formatUtc(email.sentAt, "MMM d, yyyy HH:mm") : "-"}
                      </TableCell>

                      {/* Quick Actions */}
                      <TableCell>
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {email.status === "Failed" && vm.onResend && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-info hover:bg-info/10 hover:text-info"
                              onClick={() => vm.onResend!(email)}
                              aria-label={t("messaging.email.retry")}
                            >
                              <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
                            </Button>
                          )}
                          {email.status === "Pending" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => vm.cancelEmail(email.id)}
                              disabled={vm.isCancelling}
                              aria-label={t("messaging.email.cancelEmail")}
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
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
                        canvasTheme={canvasTheme}
                        onToggleCanvasTheme={() =>
                          setCanvasTheme((prev) => (prev === "dark" ? "light" : "dark"))
                        }
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
              <p className="text-sm text-nx-ink-2">
                {t("common.page")} {vm.historyPage} / {vm.historyTotalPages}
                {" · "}
                {vm.historyTotal} {t("common.items")}
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={vm.historyPage <= 1}
                  onClick={() => vm.setHistoryPage(vm.historyPage - 1)}
                  aria-label={t("common.previous")}
                >
                  <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={vm.historyPage >= vm.historyTotalPages}
                  onClick={() => vm.setHistoryPage(vm.historyPage + 1)}
                  aria-label={t("common.next")}
                >
                  <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}
        </SectionState>
      </CardContent>
    </Card>
  );
}
