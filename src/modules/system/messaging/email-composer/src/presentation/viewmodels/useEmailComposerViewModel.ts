"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { systemContainer } from "@modules/system/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type {
      EmailRecipient,
      SendEmailRequest,
      SentEmail,
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
      const [subject, setSubject] = useState("");
      const [body, setBody] = useState("");
      const [recipientSearch, setRecipientSearch] = useState("");

      // ─── Recipient Search ──────────────────────────────────────
      const recipientSearchQuery = useQuery({
            queryKey: ["email-recipients", recipientSearch],
            queryFn: () => repo.searchRecipients(recipientSearch),
            enabled: recipientSearch.length >= 2,
            staleTime: 30_000,
      });

      const addRecipient = useCallback(
            (recipient: EmailRecipient) => {
                  setRecipients((prev) => {
                        if (prev.some((r) => r.email === recipient.email)) return prev;
                        return [...prev, recipient];
                  });
                  setRecipientSearch("");
            },
            []
      );

      const removeRecipient = useCallback((email: string) => {
            setRecipients((prev) => prev.filter((r) => r.email !== email));
      }, []);

      // ─── Send ──────────────────────────────────────────────────
      const sendMutation = useMutation({
            mutationFn: (data: SendEmailRequest) => repo.send(data),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY });
                  success({ title: t("messaging.email.sendSuccess") });
                  setRecipients([]);
                  setSubject("");
                  setBody("");
            },
            onError: () => {
                  toastError({ title: t("messaging.email.sendError") });
            },
      });

      const handleSend = useCallback(() => {
            if (recipients.length === 0 || !subject.trim() || !body.trim()) {
                  toastError({ title: t("messaging.email.validationError") });
                  return;
            }
            sendMutation.mutate({
                  to: recipients.map((r) => r.email),
                  subject,
                  body,
            });
      }, [recipients, subject, body, sendMutation, toastError, t]);

      // ─── History ───────────────────────────────────────────────
      const [historyPage, setHistoryPage] = useState(1);
      const historyQuery = useQuery({
            queryKey: [...HISTORY_QUERY_KEY, historyPage],
            queryFn: () => repo.getSentHistory({ page: historyPage, pageSize: 20 }),
            enabled: activeTab === "history",
      });

      return {
            // Tab
            activeTab,
            setActiveTab,
            // Compose
            recipients,
            addRecipient,
            removeRecipient,
            recipientSearch,
            setRecipientSearch,
            recipientResults: recipientSearchQuery.data ?? [],
            isSearching: recipientSearchQuery.isLoading,
            subject,
            setSubject,
            body,
            setBody,
            handleSend,
            isSending: sendMutation.isPending,
            // History
            history: historyQuery.data?.items ?? [],
            historyTotal: historyQuery.data?.totalCount ?? 0,
            historyPage,
            setHistoryPage,
            isHistoryLoading: historyQuery.isLoading,
            t,
      };
}
