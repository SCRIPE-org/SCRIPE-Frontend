"use client";

import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { systemContainer } from "@modules/system/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type {
      NotificationTarget,
      SendNotificationRequest,
      NotificationCategory,
      NotificationPriority,
} from "../../domain/entities/Notification";

export function useNotificationSenderViewModel() {
      const { t } = useI18n();
      const { success, error: toastError } = useEnhancedToast();
      const { notificationSenderRepository: repo } = systemContainer;

      // ─── Target Search ─────────────────────────────────────────
      const [targetSearch, setTargetSearch] = useState("");
      const [selectedTargets, setSelectedTargets] = useState<NotificationTarget[]>([]);

      const targetSearchQuery = useQuery({
            queryKey: ["notification-targets", targetSearch],
            queryFn: () => repo.searchTargets(targetSearch),
            enabled: targetSearch.length >= 2,
            staleTime: 30_000,
      });

      const addTarget = useCallback(
            (target: NotificationTarget) => {
                  setSelectedTargets((prev) => {
                        if (prev.some((t) => t.id === target.id && t.type === target.type)) return prev;
                        return [...prev, target];
                  });
                  setTargetSearch("");
            },
            []
      );

      const removeTarget = useCallback((targetId: string) => {
            setSelectedTargets((prev) => prev.filter((t) => t.id !== targetId));
      }, []);

      // ─── Form State ────────────────────────────────────────────
      const [title, setTitle] = useState("");
      const [message, setMessage] = useState("");
      const [category, setCategory] = useState<NotificationCategory>("info");
      const [priority, setPriority] = useState<NotificationPriority>("normal");
      const [actionUrl, setActionUrl] = useState("");

      // ─── Send ──────────────────────────────────────────────────
      const sendMutation = useMutation({
            mutationFn: (data: SendNotificationRequest) => repo.send(data),
            onSuccess: () => {
                  success({ title: t("messaging.notifications.sendSuccess") || "Notification sent" });
                  // Reset form
                  setSelectedTargets([]);
                  setTitle("");
                  setMessage("");
                  setCategory("info");
                  setPriority("normal");
                  setActionUrl("");
            },
            onError: () => {
                  toastError({ title: t("messaging.notifications.sendError") || "Failed to send notification" });
            },
      });

      const handleSend = useCallback(() => {
            if (selectedTargets.length === 0 || !title.trim() || !message.trim()) {
                  toastError({ title: t("messaging.notifications.validationError") || "Please fill all required fields" });
                  return;
            }
            sendMutation.mutate({
                  targetIds: selectedTargets.map((t) => t.id),
                  title,
                  message,
                  category,
                  priority,
                  actionUrl: actionUrl || undefined,
            });
      }, [selectedTargets, title, message, category, priority, actionUrl, sendMutation, toastError, t]);

      // ─── Options ───────────────────────────────────────────────
      const categoryOptions: { value: NotificationCategory; label: string }[] = [
            { value: "info", label: t("messaging.notifications.categoryInfo") || "Info" },
            { value: "warning", label: t("messaging.notifications.categoryWarning") || "Warning" },
            { value: "success", label: t("messaging.notifications.categorySuccess") || "Success" },
            { value: "error", label: t("messaging.notifications.categoryError") || "Error" },
            { value: "system", label: t("messaging.notifications.categorySystem") || "System" },
      ];

      const priorityOptions: { value: NotificationPriority; label: string }[] = [
            { value: "low", label: t("messaging.notifications.priorityLow") || "Low" },
            { value: "normal", label: t("messaging.notifications.priorityNormal") || "Normal" },
            { value: "high", label: t("messaging.notifications.priorityHigh") || "High" },
            { value: "urgent", label: t("messaging.notifications.priorityUrgent") || "Urgent" },
      ];

      return {
            // Target search
            targetSearch,
            setTargetSearch,
            targetResults: targetSearchQuery.data ?? [],
            isSearchingTargets: targetSearchQuery.isLoading,
            selectedTargets,
            addTarget,
            removeTarget,
            // Form
            title,
            setTitle,
            message,
            setMessage,
            category,
            setCategory,
            priority,
            setPriority,
            actionUrl,
            setActionUrl,
            // Actions
            handleSend,
            isSending: sendMutation.isPending,
            // Options
            categoryOptions,
            priorityOptions,
            t,
      };
}
