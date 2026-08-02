"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";
import { PolicyCard } from "../components/PolicyCard";
import { useRetentionViewModel } from "../viewmodels/useRetentionViewModel";
import type { RetentionPolicy } from "../../domain/entities/RetentionPolicy";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { PageHeader } from "@core/ui/page-header";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { Skeleton } from "@core/ui/skeleton";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericForm } from "@core/ui/forms/generic-form";
import { usePermission } from "@core/hooks/use-permission";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { useAppStore } from "@/core/store/useAppStore";

// Loading and loaded share one grid so the page does not resettle on arrival.
const CARD_GRID = "grid grid-cols-1 gap-4 md:grid-cols-2";

// ── Main View ─────────────────────────────────────────────────────────────────

/**
 * Presentation UI component rendering the retention view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function RetentionView() {
  // Distinct from the inventory view's key: both used "compliance", so whichever
  // page mounted first marked the dictionary loaded and the other rendered raw
  // translation keys.
  useModuleLocales(() => import("../../../locales"), "compliance-retention");
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

  const addButton = (
    <Button onClick={openCreateModal} size="sm">
      <Plus className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
      {t("compliance.addPolicy")}
    </Button>
  );

  return (
    <div className="flex flex-col" style={{ gap: "calc(var(--spacing-unit) * 1.5)" }}>
      <PageHeader
        className="mb-0"
        icon={Clock}
        title={t("compliance.retentionTitle")}
        description={t("compliance.retentionDescription")}
        eyebrow={
          <Button variant="ghost" size="sm" onClick={() => router.push("/compliance")}>
            <BackIcon className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
            {t("common.back")}
          </Button>
        }
        meta={[
          { label: t("compliance.active"), value: activeCount.toLocaleString() },
          { label: t("common.total"), value: totalCount.toLocaleString() },
        ]}
        actions={
          <>
            <Button
              id="compliance-retention-refresh"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              loading={isLoading}
            >
              {!isLoading && <RefreshCw className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />}
              {t("common.refresh")}
            </Button>
            {canCreate && addButton}
          </>
        }
      />

      {/* Content */}
      {isLoading ? (
        <div className={CARD_GRID} role="status" aria-busy="true" aria-label={t("common.loading")}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-48 w-full rounded-nx-lg" />
          ))}
        </div>
      ) : isError ? (
        <ErrorMessage message={t("compliance.policiesLoadFailed")} onRetry={() => refetch()} />
      ) : policies.length === 0 ? (
        <EmptyState
          icon={Clock}
          title={t("compliance.noPolicies")}
          description={t("compliance.noPoliciesDesc")}
          action={canCreate ? addButton : undefined}
        />
      ) : (
        <div className={CARD_GRID}>
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
