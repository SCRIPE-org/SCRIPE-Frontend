"use client";

import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { systemContainer } from "@modules/system/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type {
      NotificationTarget,
      SendNotificationPayload,
      NotificationType,
      NotificationCategory,
      NotificationTargetType,
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
      const [type, setType] = useState<NotificationType>("Info");
      const [category, setCategory] = useState<NotificationCategory>("General");
      const [actionUrl, setActionUrl] = useState("");

      // ─── Confirmation state ───────────────────────────────────
      const [confirmSendOpen, setConfirmSendOpen] = useState(false);

      // ─── Validation state ─────────────────────────────────────
      const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

      // ─── Helper: Map frontend target type to backend enum ──────
      const toBackendTarget = (target: NotificationTarget): { target: NotificationTargetType; userId: string | null; tenantId: string | null } => {
            switch (target.type) {
                  case "admin":
                        return { target: "User", userId: target.id, tenantId: null };
                  case "role":
                        return { target: "Role", userId: target.id, tenantId: null };
                  case "tenant":
                        return { target: "Tenant", userId: null, tenantId: target.id };
                  default:
                        return { target: "User", userId: target.id, tenantId: null };
            }
      };

      // ─── Send ──────────────────────────────────────────────────
      const sendMutation = useMutation({
            mutationFn: async (targets: NotificationTarget[]) => {
                  for (const t of targets) {
                        const mapping = toBackendTarget(t);
                        const payload: SendNotificationPayload = {
                              title,
                              body: message,
                              target: mapping.target,
                              userId: mapping.userId,
                              tenantId: mapping.tenantId,
                              type,
                              category,
                              actionUrl: actionUrl || undefined,
                        };
                        await repo.send(payload);
                  }
            },
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
            sendMutation.mutate(selectedTargets);
      }, [selectedTargets, sendMutation]);

      // ─── Reset Form ───────────────────────────────────────────
      const resetForm = useCallback(() => {
            setSelectedTargets([]);
            setTitle("");
            setMessage("");
            setType("Info");
            setCategory("General");
            setActionUrl("");
            setTargetSearch("");
            setFieldErrors({});
      }, []);

      // ─── Options (aligned with backend enums) ──────────────────
      const typeOptions: { value: NotificationType; label: string }[] = [
            { value: "Info", label: t("messaging.notifications.typeInfo") || "Info" },
            { value: "Success", label: t("messaging.notifications.typeSuccess") || "Success" },
            { value: "Warning", label: t("messaging.notifications.typeWarning") || "Warning" },
            { value: "Error", label: t("messaging.notifications.typeError") || "Error" },
      ];

      const categoryOptions: { value: NotificationCategory; label: string }[] = [
            { value: "General", label: t("messaging.notifications.categoryGeneral") || "General" },
            { value: "Security", label: t("messaging.notifications.categorySecurity") || "Security" },
            { value: "System", label: t("messaging.notifications.categorySystem") || "System" },
            { value: "Activity", label: t("messaging.notifications.categoryActivity") || "Activity" },
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
            type,
            setType,
            category,
            setCategory,
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
            typeOptions,
            categoryOptions,
            t,
      };
}
