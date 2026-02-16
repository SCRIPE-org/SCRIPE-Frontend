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
                  setFieldErrors((prev) => ({ ...prev, targets: false }));
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

      // ─── Confirmation state ───────────────────────────────────
      const [confirmSendOpen, setConfirmSendOpen] = useState(false);

      // ─── Validation state ─────────────────────────────────────
      const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

      // ─── Send ──────────────────────────────────────────────────
      const sendMutation = useMutation({
            mutationFn: (data: SendNotificationRequest) => repo.send(data),
            onSuccess: () => {
                  success({ title: t("messaging.notifications.sendSuccess") || "Notification sent" });
                  resetForm();
            },
            onError: () => {
                  toastError({ title: t("messaging.notifications.sendError") || "Failed to send notification" });
            },
      });

      const validateForm = useCallback((): boolean => {
            const errors: Record<string, boolean> = {};
            if (selectedTargets.length === 0) errors.targets = true;
            if (!title.trim()) errors.title = true;
            if (!message.trim()) errors.message = true;
            setFieldErrors(errors);

            if (Object.keys(errors).length > 0) {
                  toastError({ title: t("messaging.notifications.validationError") || "Please fill all required fields" });
                  return false;
            }
            return true;
      }, [selectedTargets, title, message, toastError, t]);

      const handleSend = useCallback(() => {
            if (!validateForm()) return;
            setConfirmSendOpen(true);
      }, [validateForm]);

      const confirmSend = useCallback(() => {
            setConfirmSendOpen(false);
            sendMutation.mutate({
                  targetIds: selectedTargets.map((t) => t.id),
                  title,
                  message,
                  category,
                  priority,
                  actionUrl: actionUrl || undefined,
            });
      }, [selectedTargets, title, message, category, priority, actionUrl, sendMutation]);

      // ─── Reset Form ───────────────────────────────────────────
      const resetForm = useCallback(() => {
            setSelectedTargets([]);
            setTitle("");
            setMessage("");
            setCategory("info");
            setPriority("normal");
            setActionUrl("");
            setTargetSearch("");
            setFieldErrors({});
      }, []);

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
            setTitle: (v: string) => { setTitle(v); setFieldErrors((p) => ({ ...p, title: false })); },
            message,
            setMessage: (v: string) => { setMessage(v); setFieldErrors((p) => ({ ...p, message: false })); },
            category,
            setCategory,
            priority,
            setPriority,
            actionUrl,
            setActionUrl,
            // Validation
            fieldErrors,
            // Actions
            handleSend,
            confirmSend,
            confirmSendOpen,
            setConfirmSendOpen,
            isSending: sendMutation.isPending,
            resetForm,
            // Options
            categoryOptions,
            priorityOptions,
            t,
      };
}
