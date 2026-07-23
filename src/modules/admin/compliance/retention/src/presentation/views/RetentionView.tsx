"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, AlertTriangle, ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";
import { PolicyCard } from "../components/PolicyCard";
import { useRetentionViewModel } from "../viewmodels/useRetentionViewModel";
import type { RetentionPolicy } from "../../domain/entities/RetentionPolicy";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { Card, CardContent } from "@core/ui/card";
import { EmptyState } from "@core/ui/empty-state";
import { Skeleton } from "@core/ui/skeleton";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericForm } from "@core/ui/forms/generic-form";
import { usePermission } from "@core/hooks/use-permission";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { useAppStore } from "@/core/store/useAppStore";

// ── Main View ─────────────────────────────────────────────────────────────────

/**
 * Presentation UI component rendering the retention view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function RetentionView() {
  useModuleLocales(() => import("../../../locales"), "compliance");
  const { t, direction } = useI18n();
  const router = useRouter();
  const BackIcon = direction === "rtl" ? ChevronRight : ChevronLeft;
  const { tenantCode } = useAppStore();
  const hasPermission = usePermission(SYSTEM_PERMISSIONS.COMPLIANCE_RETENTION_MANAGE);
  const canCreate = hasPermission && !!tenantCode;

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<RetentionPolicy | null>(null);

  const {
    policies,
    activeCount,
    totalCount,
    isLoading,
    isError,
    refetch,
    createPolicy,
    updatePolicy,
    isMutating,
    getFormFields,
  } = useRetentionViewModel();

  const handleCreate = async (data: Record<string, any>) => {
    await createPolicy(data as any);
    setModalMode(null);
  };

  const handleUpdate = async (data: Record<string, any>) => {
    if (!selectedPolicy) return;
    await updatePolicy({ id: selectedPolicy.id, data: data as any });
    setModalMode(null);
  };

  const openCreateModal = () => {
    setSelectedPolicy(null);
    setModalMode("create");
  };

  const openEditModal = (policy: RetentionPolicy) => {
    setSelectedPolicy(policy);
    setModalMode("edit");
  };

  const closeModals = (open: boolean) => {
    if (!open) setModalMode(null);
  };

  const fields = getFormFields();

  const initialValues = useMemo(() => {
    if (modalMode === "edit" && selectedPolicy) {
      return {
        category: selectedPolicy.category,
        retentionDays: selectedPolicy.retentionDays,
        expiryAction: selectedPolicy.expiryAction,
        isActive: selectedPolicy.isActive,
      };
    }
    return {
      isActive: true,
      retentionDays: 365,
    };
  }, [modalMode, selectedPolicy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => router.push("/compliance")}
          >
            <BackIcon className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/15 to-primary/10 p-2.5 shadow-sm">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {t("compliance.retentionTitle")}
              </h2>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{activeCount}</span>{" "}
                {t("compliance.active")}
                {" · "}
                <span className="font-medium text-foreground">{totalCount}</span>{" "}
                {t("compliance.total")}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            id="compliance-retention-refresh"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className={`me-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("common.refresh")}
          </Button>
          {canCreate && (
            <Button onClick={openCreateModal} size="sm" className="gradient-primary">
              <Plus className="me-2 h-4 w-4" />
              {t("compliance.addPolicy")}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[180px] rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <AlertTriangle className="mb-4 h-10 w-10 text-destructive" />
            <p className="font-semibold">{t("common.error")}</p>
            <Button className="mt-4" variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="me-2 h-4 w-4" />
              {t("common.refresh")}
            </Button>
          </CardContent>
        </Card>
      ) : policies.length === 0 ? (
        <EmptyState icon={Clock} title={t("compliance.noPolicies")} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {policies.map((policy: RetentionPolicy) => (
            <PolicyCard key={policy.id} policy={policy} onEdit={openEditModal} />
          ))}
        </div>
      )}

      {/* Generic Modal with Form */}
      <GenericModal
        open={modalMode !== null}
        onOpenChange={closeModals}
        title={modalMode === "edit" ? t("compliance.updatePolicy") : t("compliance.addPolicy")}
        description={
          modalMode === "edit"
            ? `${t("compliance.retentionCategory")}: ${selectedPolicy?.category}`
            : t("compliance.addPolicy")
        }
        size="sm"
        formKey={modalMode === "edit" ? `edit-policy-${selectedPolicy?.id}` : "create-policy"}
      >
        <GenericForm
          fields={fields}
          initialValues={initialValues}
          onSubmit={modalMode === "edit" ? handleUpdate : handleCreate}
          onCancel={() => closeModals(false)}
          readOnly={false}
        />
      </GenericModal>
    </div>
  );
}
