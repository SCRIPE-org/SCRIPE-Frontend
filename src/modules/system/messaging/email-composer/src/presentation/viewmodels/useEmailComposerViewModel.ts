"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { systemContainer } from "@modules/system/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type {
      EmailRecipient,
      SendEmailRequest,
} from "../../domain/entities/Email";

const HISTORY_QUERY_KEY = ["emails", "history"];

export function useEmailComposerViewModel() {
      const { t } = useI18n();
      const queryClient = useQueryClient();
      const { success, error: toastError } = useEnhancedToast();
      const { emailRepository: repo } = systemContainer;

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

      // ─── Confirmation state ───────────────────────────────────
      const [confirmSendOpen, setConfirmSendOpen] = useState(false);

      // ─── Validation state ─────────────────────────────────────
      const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

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

      // ─── Send ──────────────────────────────────────────────────
      const sendMutation = useMutation({
            mutationFn: (data: SendEmailRequest) => repo.send(data),
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
            const request: SendEmailRequest = {
                  to: recipients.map((r) => r.email),
                  subject,
                  body,
            };
            if (ccRecipients.length > 0) {
                  request.cc = ccRecipients.map((r) => r.email);
            }
            if (bccRecipients.length > 0) {
                  request.bcc = bccRecipients.map((r) => r.email);
            }
            sendMutation.mutate(request);
      }, [recipients, ccRecipients, bccRecipients, subject, body, sendMutation]);

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
      }, []);

      // ─── History ───────────────────────────────────────────────
      const [historyPage, setHistoryPage] = useState(1);
      const historyPageSize = 20;
      const historyQuery = useQuery({
            queryKey: [...HISTORY_QUERY_KEY, historyPage],
            queryFn: () => repo.getSentHistory({ page: historyPage, pageSize: historyPageSize }),
            enabled: activeTab === "history",
      });

      const historyTotalPages = Math.ceil((historyQuery.data?.totalCount ?? 0) / historyPageSize);

      return {
            // Tab
            activeTab,
            setActiveTab,
            // Compose — To
            recipients,
            addRecipient,
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
            t,
      };
}
