"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { systemContainer } from "@modules/system/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type {
      EmailRecipient,
      SendManualEmailPayload,
      EmailTemplate,
      SentEmail,
} from "../../domain/entities/Email";
import type { AttachmentFile } from "../components/AttachmentUploader";
import type { ScheduleConfig } from "../components/SchedulePicker";
import type { VariableValuesMap } from "@core/ui/rich-text-editor/VariableValuesPanel";
import { DEFAULT_VARIABLES } from "@core/ui/rich-text-editor/VariablePicker";
import type { VariableDefinition } from "@core/ui/rich-text-editor/VariablePicker";

const HISTORY_QUERY_KEY = ["emails", "history"];

/**
 * Resolve `{{ variableKey }}` and `{{ variableKey | "fallback" }}` patterns
 * using the provided values map. Unresolved variables use sample values or stay as-is.
 */
function resolveTemplateVariables(
      text: string,
      values: VariableValuesMap,
      variables: VariableDefinition[]
): string {
      if (!text) return text;
      return text.replace(
            /\{\{\s*(\w+)(?:\s*\|\s*"([^"]*)")?\s*\}\}/g,
            (_match, key: string, fallback?: string) => {
                  if (values[key]?.trim()) return values[key];
                  if (fallback) return fallback;
                  const def = variables.find((v) => v.key === key);
                  if (def?.sample) return def.sample;
                  return `{{${key}}}`;
            }
      );
}

export function useEmailComposerViewModel() {
      const { t } = useI18n();
      const queryClient = useQueryClient();
      const { success, error: toastError } = useEnhancedToast();
      const { emailRepository: repo } = systemContainer;
      const router = useRouter();

      // ─── Active Tab ────────────────────────────────────────────
      const [activeTab, setActiveTab] = useState<"compose" | "history">("compose");

      // ─── Compose State ─────────────────────────────────────────
      const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
      const [ccRecipients, setCcRecipients] = useState<EmailRecipient[]>([]);
      const [bccRecipients, setBccRecipients] = useState<EmailRecipient[]>([]);
      const [showCcBcc, setShowCcBcc] = useState(false);
      const [subject, setSubject] = useState("");
      const [body, setBody] = useState("");
      const [recipientSearch, setRecipientSearch] = useState("");
      const [ccSearch, setCcSearch] = useState("");
      const [bccSearch, setBccSearch] = useState("");

      // ─── Attachment State ──────────────────────────────────────
      const [attachments, setAttachments] = useState<AttachmentFile[]>([]);

      const addAttachments = useCallback((files: File[]) => {
            const newFiles: AttachmentFile[] = files.map((f) => ({
                  id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                  name: f.name,
                  size: f.size,
                  type: f.type,
                  progress: 100, // Immediate — no upload endpoint yet
            }));
            setAttachments((prev) => [...prev, ...newFiles]);
      }, []);

      const removeAttachment = useCallback((id: string) => {
            setAttachments((prev) => prev.filter((a) => a.id !== id));
      }, []);

      // ─── Schedule State ────────────────────────────────────────
      const [schedule, setSchedule] = useState<ScheduleConfig>({ mode: "now" });

      // ─── Confirmation state ───────────────────────────────────
      const [confirmSendOpen, setConfirmSendOpen] = useState(false);

      // ─── Validation state ─────────────────────────────────────
      const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

      // ─── Preview state ──────────────────────────────────────────
      const [previewOpen, setPreviewOpen] = useState(false);

      // ─── Variable Values (shared with preview dialog) ───────────
      const [variableValues, setVariableValues] = useState<VariableValuesMap>({});

      // ─── Template-specific variables (from placeholderSchema) ────
      const [templateVariables, setTemplateVariables] = useState<VariableDefinition[]>([]);

      // Merge default + template variables
      const allVariables = useMemo(() => {
            const merged = [...DEFAULT_VARIABLES];
            for (const tv of templateVariables) {
                  if (!merged.some((m) => m.key === tv.key)) {
                        merged.push(tv);
                  }
            }
            return merged;
      }, [templateVariables]);

      // ─── Template selection handler ─────────────────────────────
      const applyTemplate = useCallback((template: EmailTemplate) => {
            if (template.subject) setSubject(template.subject);
            setBody(template.body);
            setFieldErrors({});

            // Parse placeholder schema into VariableDefinitions for the template category
            if (template.placeholderSchema) {
                  try {
                        const schema = JSON.parse(template.placeholderSchema);
                        if (Array.isArray(schema)) {
                              const tplVars: VariableDefinition[] = schema.map((field: { key?: string; name?: string; label?: string; type?: string; defaultValue?: string }) => ({
                                    key: field.key || field.name || "",
                                    label: field.label || field.key || field.name || "",
                                    category: "template" as const,
                                    sample: field.defaultValue || "",
                                    supportsFallback: true,
                                    dataSource: "manual" as const,
                              })).filter((v: VariableDefinition) => v.key);
                              setTemplateVariables(tplVars);
                        }
                  } catch {
                        // Invalid JSON — ignore
                  }
            } else {
                  setTemplateVariables([]);
            }

            success({ title: t("messaging.email.templateApplied") || `Template "${template.key}" applied` });
      }, [t, success]);

      // ─── Recipient Search ──────────────────────────────────────
      const recipientSearchQuery = useQuery({
            queryKey: ["email-recipients", recipientSearch],
            queryFn: () => repo.searchRecipients(recipientSearch),
            enabled: recipientSearch.length >= 2,
            staleTime: 30_000,
      });

      const ccSearchQuery = useQuery({
            queryKey: ["email-recipients", "cc", ccSearch],
            queryFn: () => repo.searchRecipients(ccSearch),
            enabled: ccSearch.length >= 2,
            staleTime: 30_000,
      });

      const bccSearchQuery = useQuery({
            queryKey: ["email-recipients", "bcc", bccSearch],
            queryFn: () => repo.searchRecipients(bccSearch),
            enabled: bccSearch.length >= 2,
            staleTime: 30_000,
      });

      // ─── Recipient Management ─────────────────────────────────
      const addRecipient = useCallback(
            (recipient: EmailRecipient) => {
                  setRecipients((prev) => {
                        if (prev.some((r) => r.email === recipient.email)) return prev;
                        return [...prev, recipient];
                  });
                  setRecipientSearch("");
                  setFieldErrors((prev) => ({ ...prev, to: false }));
            },
            []
      );

      // Email validation regex
      const isValidEmail = useCallback((email: string): boolean => {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
      }, []);

      // Add a custom email address (not from search results)
      const addCustomEmail = useCallback(
            (email: string, target: "to" | "cc" | "bcc" = "to") => {
                  const trimmed = email.trim();
                  if (!isValidEmail(trimmed)) return false;

                  const customRecipient: EmailRecipient = {
                        id: `custom-${trimmed}`,
                        email: trimmed,
                        name: trimmed,
                        type: "custom",
                  };

                  if (target === "to") {
                        addRecipient(customRecipient);
                  } else if (target === "cc") {
                        setCcRecipients((prev) => {
                              if (prev.some((r) => r.email === trimmed)) return prev;
                              return [...prev, customRecipient];
                        });
                        setCcSearch("");
                  } else {
                        setBccRecipients((prev) => {
                              if (prev.some((r) => r.email === trimmed)) return prev;
                              return [...prev, customRecipient];
                        });
                        setBccSearch("");
                  }
                  return true;
            },
            [isValidEmail, addRecipient]
      );

      const removeRecipient = useCallback((email: string) => {
            setRecipients((prev) => prev.filter((r) => r.email !== email));
      }, []);

      const addCcRecipient = useCallback(
            (recipient: EmailRecipient) => {
                  setCcRecipients((prev) => {
                        if (prev.some((r) => r.email === recipient.email)) return prev;
                        return [...prev, recipient];
                  });
                  setCcSearch("");
            },
            []
      );

      const removeCcRecipient = useCallback((email: string) => {
            setCcRecipients((prev) => prev.filter((r) => r.email !== email));
      }, []);

      const addBccRecipient = useCallback(
            (recipient: EmailRecipient) => {
                  setBccRecipients((prev) => {
                        if (prev.some((r) => r.email === recipient.email)) return prev;
                        return [...prev, recipient];
                  });
                  setBccSearch("");
            },
            []
      );

      const removeBccRecipient = useCallback((email: string) => {
            setBccRecipients((prev) => prev.filter((r) => r.email !== email));
      }, []);

      // ─── Helper: convert frontend recipient type to backend enum ─
      const toBackendRecipientType = (type: EmailRecipient["type"]): string => {
            switch (type) {
                  case "admin": return "Admin";
                  case "user": return "User";
                  case "custom": return "Custom";
                  default: return "Custom";
            }
      };

      // ─── Send ──────────────────────────────────────────────────
      const sendMutation = useMutation({
            mutationFn: async (allRecipients: EmailRecipient[]) => {
                  // Resolve any {{variable}} placeholders before sending
                  const resolvedSubject = resolveTemplateVariables(subject, variableValues, allVariables);
                  const resolvedBody = resolveTemplateVariables(body, variableValues, allVariables);

                  // Backend handles one recipient per request, so batch them
                  for (const r of allRecipients) {
                        const payload: SendManualEmailPayload = {
                              recipientType: toBackendRecipientType(r.type),
                              recipientId: r.type === "custom" ? null : r.id,
                              recipientEmail: r.email,
                              subject: resolvedSubject,
                              body: resolvedBody,
                              cc: ccRecipients.length > 0 ? ccRecipients.map(c => c.email) : undefined,
                              bcc: bccRecipients.length > 0 ? bccRecipients.map(b => b.email) : undefined,
                              scheduledAt: schedule.mode === "scheduled" && schedule.scheduledDate
                                    ? `${schedule.scheduledDate}T${schedule.scheduledTime || "00:00"}:00Z`
                                    : undefined,
                              attachments: attachments.length > 0 ? attachments.map(a => a.name) : undefined,
                              signatureHtml: undefined,
                        };
                        await repo.send(payload);
                  }
            },
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY });
                  success({ title: t("messaging.email.sendSuccess") || "Email sent successfully" });
                  resetForm();
            },
            onError: () => {
                  toastError({ title: t("messaging.email.sendError") || "Failed to send email" });
            },
      });

      const validateForm = useCallback((): boolean => {
            const errors: Record<string, boolean> = {};
            if (recipients.length === 0) errors.to = true;
            if (!subject.trim()) errors.subject = true;
            if (!body.trim()) errors.body = true;
            setFieldErrors(errors);

            if (Object.keys(errors).length > 0) {
                  toastError({ title: t("messaging.email.validationError") || "Please fill in all required fields" });
                  return false;
            }
            return true;
      }, [recipients, subject, body, toastError, t]);

      const handleSend = useCallback(() => {
            if (!validateForm()) return;
            setConfirmSendOpen(true);
      }, [validateForm]);

      const confirmSend = useCallback(() => {
            setConfirmSendOpen(false);
            // Merge all recipients (To + CC + BCC) — each gets their own email
            const allRecipients = [...recipients, ...ccRecipients, ...bccRecipients];
            sendMutation.mutate(allRecipients);
      }, [recipients, ccRecipients, bccRecipients, sendMutation]);

      // ─── Reset Form ───────────────────────────────────────────
      const resetForm = useCallback(() => {
            setRecipients([]);
            setCcRecipients([]);
            setBccRecipients([]);
            setShowCcBcc(false);
            setSubject("");
            setBody("");
            setRecipientSearch("");
            setCcSearch("");
            setBccSearch("");
            setFieldErrors({});
            setVariableValues({});
            setAttachments([]);
            setSchedule({ mode: "now" });
      }, []);

      // ─── History ───────────────────────────────────────────────
      const [historyPage, setHistoryPage] = useState(1);
      const [historySearch, setHistorySearch] = useState("");
      const [historyStatus, setHistoryStatus] = useState<string>("");
      const historyPageSize = 20;
      const historyQuery = useQuery({
            queryKey: [...HISTORY_QUERY_KEY, historyPage, historySearch, historyStatus],
            queryFn: () => repo.getSentHistory({
                  page: historyPage,
                  pageSize: historyPageSize,
                  search: historySearch || undefined,
                  status: historyStatus || undefined,
            }),
            enabled: activeTab === "history",
      });

      // ─── Cancel Email ───────────────────────────────────────────
      const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
      const [cancelEmailId, setCancelEmailId] = useState<string | null>(null);

      const cancelMutation = useMutation({
            mutationFn: async (id: string) => {
                  await repo.cancelEmail(id);
            },
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY });
                  success({ title: t("messaging.email.cancelSuccess") || "Email cancelled successfully" });
            },
            onError: () => {
                  toastError({ title: t("messaging.email.cancelError") || "Failed to cancel email" });
            },
      });

      const cancelEmail = useCallback((id: string) => {
            setCancelEmailId(id);
            setCancelConfirmOpen(true);
      }, []);

      const confirmCancelEmail = useCallback(() => {
            if (cancelEmailId) {
                  cancelMutation.mutate(cancelEmailId);
            }
            setCancelConfirmOpen(false);
            setCancelEmailId(null);
      }, [cancelEmailId, cancelMutation]);

      const historyTotalPages = Math.ceil((historyQuery.data?.totalCount ?? 0) / historyPageSize);

      return {
            // Tab
            activeTab,
            setActiveTab,
            // Compose — To
            recipients,
            addRecipient,
            addCustomEmail,
            removeRecipient,
            recipientSearch,
            setRecipientSearch,
            recipientResults: recipientSearchQuery.data ?? [],
            isSearching: recipientSearchQuery.isLoading,
            // Compose — CC/BCC
            showCcBcc,
            setShowCcBcc,
            ccRecipients,
            addCcRecipient,
            removeCcRecipient,
            ccSearch,
            setCcSearch,
            ccResults: ccSearchQuery.data ?? [],
            isCcSearching: ccSearchQuery.isLoading,
            bccRecipients,
            addBccRecipient,
            removeBccRecipient,
            bccSearch,
            setBccSearch,
            bccResults: bccSearchQuery.data ?? [],
            isBccSearching: bccSearchQuery.isLoading,
            // Compose — Fields
            subject,
            setSubject: (v: string) => { setSubject(v); setFieldErrors((p) => ({ ...p, subject: false })); },
            body,
            setBody: (v: string) => { setBody(v); setFieldErrors((p) => ({ ...p, body: false })); },
            // Validation
            fieldErrors,
            // Actions
            handleSend,
            confirmSend,
            confirmSendOpen,
            setConfirmSendOpen,
            isSending: sendMutation.isPending,
            resetForm,
            // History
            history: historyQuery.data?.items ?? [],
            historyTotal: historyQuery.data?.totalCount ?? 0,
            historyPage,
            setHistoryPage,
            historyTotalPages,
            isHistoryLoading: historyQuery.isLoading,
            historySearch,
            setHistorySearch: (v: string) => { setHistorySearch(v); setHistoryPage(1); },
            historyStatus,
            setHistoryStatus: (v: string) => { setHistoryStatus(v); setHistoryPage(1); },
            // Cancel
            cancelEmail,
            confirmCancelEmail,
            cancelConfirmOpen,
            setCancelConfirmOpen,
            isCancelling: cancelMutation.isPending,
            // Preview
            previewOpen,
            setPreviewOpen,
            // Template
            applyTemplate,
            repository: repo,
            // Variable Values (shared with preview)
            variableValues,
            setVariableValues,
            // Template-specific variables
            templateVariables,
            allVariables,
            // Attachments
            attachments,
            addAttachments,
            removeAttachment,
            // Schedule
            schedule,
            setSchedule,
            // Resend / Use as Template
            onResend: useCallback((email: SentEmail) => {
                  repo.resendEmail(email.id).then(() => {
                        queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY });
                        success({ title: "Email re-queued for sending" });
                  }).catch(() => {
                        toastError({ title: "Failed to resend email" });
                  });
            }, [repo, queryClient, success, toastError]),
            onUseAsTemplate: useCallback((email: SentEmail) => {
                  // Navigate to template creation with pre-filled subject/body
                  const params = new URLSearchParams({
                        subject: email.subject,
                        body: email.body,
                  });
                  router.push(`/messaging/templates/create?${params.toString()}`);
            }, [router]),
            t,
      };
}
