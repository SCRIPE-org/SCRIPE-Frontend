"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useRegulationViewModel } from "../viewmodels/useRegulationViewModel";
import { Button } from "@core/ui/button";
import { PageHeader } from "@core/ui/page-header";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { Skeleton } from "@core/ui/skeleton";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericForm } from "@core/ui/forms/generic-form";
import { usePermission } from "@core/hooks/use-permission";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { useAppStore } from "@core/store/useAppStore";
import { ChevronLeft, ChevronRight, RefreshCw, BookOpen, Plus } from "lucide-react";
import { RegulationCard } from "../components/RegulationCard";

import type { Regulation } from "../../domain/entities/Regulation";

// Loading and loaded share one grid so the page does not resettle on arrival.
const CARD_GRID = "grid grid-cols-1 gap-6 lg:grid-cols-2";

/**
 * Presentation UI component rendering the regulation view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function RegulationView() {
  useModuleLocales(() => import("../../../locales"), "compliance-regulations");
  const { t, direction } = useI18n();
  const router = useRouter();
  const BackIcon = direction === "rtl" ? ChevronRight : ChevronLeft;

  // RegulationProfile carries no TenantId — it's platform-global, seeded-once
  // reference data shared by every tenant, so only platform admins (no
  // tenantCode) may manage it; a tenant-scoped admin only views it.
  const { tenantCode } = useAppStore();
  const hasRegulationManage = usePermission(SYSTEM_PERMISSIONS.COMPLIANCE_REGULATIONS_MANAGE);
  const canCreate = hasRegulationManage && !tenantCode;
  const canUpdate = hasRegulationManage && !tenantCode;

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedRegulation, setSelectedRegulation] = useState<Regulation | null>(null);

  const {
    regulations,
    isLoading,
    isError,
    refetch,
    createRegulation,
    updateRegulation,
    getFormFields,
  } = useRegulationViewModel();

  const handleCreate = async (data: Record<string, any>) => {
    await createRegulation(data as any);
    setModalMode(null);
  };

  const handleUpdate = async (data: Record<string, any>) => {
    if (!selectedRegulation) return;
    await updateRegulation({ id: selectedRegulation.id, data: data as any });
    setModalMode(null);
  };

  const openCreateModal = () => {
    setSelectedRegulation(null);
    setModalMode("create");
  };

  const openEditModal = (regulation: Regulation) => {
    setSelectedRegulation(regulation);
    setModalMode("edit");
  };

  const closeModals = (open: boolean) => {
    if (!open) setModalMode(null);
  };

  const fields = getFormFields();

  const initialValues = useMemo(() => {
    if (modalMode === "edit" && selectedRegulation) {
      return {
        code: selectedRegulation.code,
        name: selectedRegulation.name,
        jurisdiction: selectedRegulation.jurisdiction,
        dsrDeadlineDays: selectedRegulation.dsrDeadlineDays,
        referenceUrl: selectedRegulation.referenceUrl,
        isActive: selectedRegulation.isActive,
      };
    }
    return {
      isActive: true,
      dsrDeadlineDays: 30,
    };
  }, [modalMode, selectedRegulation]);

  const activeCount = regulations.filter((regulation) => regulation.isActive).length;

  const addButton = (
    <Button onClick={openCreateModal} size="sm">
      <Plus className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
      {t("compliance.regulations.addRegulation")}
    </Button>
  );

  return (
    <div className="flex flex-col" style={{ gap: "calc(var(--spacing-unit) * 1.5)" }}>
      <PageHeader
        className="mb-0"
        icon={BookOpen}
        title={t("compliance.regulations.title")}
        description={t("compliance.regulations.description")}
        eyebrow={
          <Button variant="ghost" size="sm" onClick={() => router.push("/compliance")}>
            <BackIcon className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
            {t("common.back")}
          </Button>
        }
        meta={[
          { label: t("common.total"), value: regulations.length.toLocaleString() },
          { label: t("compliance.regulations.active"), value: activeCount.toLocaleString() },
        ]}
        actions={
          <>
            <Button
              id="compliance-regulations-refresh"
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

      {isLoading ? (
        <div className={CARD_GRID} role="status" aria-busy="true" aria-label={t("common.loading")}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-64 w-full rounded-nx-lg" />
          ))}
        </div>
      ) : isError ? (
        <ErrorMessage message={t("compliance.regulations.loadFailed")} onRetry={() => refetch()} />
      ) : regulations.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={t("compliance.regulations.noRegulations")}
          description={t("compliance.regulations.noRegulationsDesc")}
          action={canCreate ? addButton : undefined}
        />
      ) : (
        <div className={CARD_GRID}>
          {regulations.map((reg) => (
            <RegulationCard
              key={reg.id}
              regulation={reg}
              onEdit={canUpdate ? openEditModal : undefined}
            />
          ))}
        </div>
      )}

      {/* Generic Modal with Form */}
      <GenericModal
        open={modalMode !== null}
        onOpenChange={closeModals}
        title={
          modalMode === "edit"
            ? t("compliance.regulations.editRegulation")
            : t("compliance.regulations.addRegulation")
        }
        description={
          modalMode === "edit"
            ? `${t("compliance.regulations.code")}: ${selectedRegulation?.code}`
            : t("compliance.regulations.addRegulation")
        }
        size="md"
        formKey={
          modalMode === "edit" ? `edit-regulation-${selectedRegulation?.id}` : "create-regulation"
        }
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
