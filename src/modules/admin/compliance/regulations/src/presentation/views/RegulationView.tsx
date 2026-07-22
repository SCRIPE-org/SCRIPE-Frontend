"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useRegulationViewModel } from "../viewmodels/useRegulationViewModel";
import { Button } from "@core/ui/button";
import { Card, CardContent } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericForm } from "@core/ui/forms/generic-form";
import { usePermission } from "@core/hooks/use-permission";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { useAppStore } from "@core/store/useAppStore";
import { ChevronLeft, ChevronRight, RefreshCw, AlertTriangle, BookOpen, Plus } from "lucide-react";
import { RegulationCard } from "../components/RegulationCard";

import type { Regulation } from "../../domain/entities/Regulation";

/**
 * Presentation UI component rendering the regulation view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function RegulationView() {
  useModuleLocales(() => import("../../../locales"), "compliance-regulations");
  const { t, direction } = useI18n();
  const router = useRouter();
  const BackIcon = direction === "rtl" ? ChevronRight : ChevronLeft;

  // Super Admin has no tenantCode — regulations are tenant-scoped so only tenant admins can write
  const { tenantCode } = useAppStore();
  const hasRegulationManage = usePermission(SYSTEM_PERMISSIONS.COMPLIANCE_REGULATIONS_MANAGE);
  const canCreate = hasRegulationManage && !!tenantCode;
  const canUpdate = hasRegulationManage && !!tenantCode;

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedRegulation, setSelectedRegulation] = useState<Regulation | null>(null);

  const {
    regulations,
    isLoading,
    isError,
    refetch,
    createRegulation,
    updateRegulation,
    isMutating,
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

  return (
    <div className="space-y-6">
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
            <div className="rounded-xl border border-info/20 bg-gradient-to-br from-info/15 to-info/10 p-2.5 shadow-sm">
              <BookOpen className="h-5 w-5 text-info" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {t("compliance.regulations.title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("compliance.regulations.description")}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            id="compliance-regulations-refresh"
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
              {t("compliance.regulations.addRegulation")}
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[250px] rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <AlertTriangle className="mb-4 h-10 w-10 text-destructive" />
            <p className="font-semibold">{t("common.error")}</p>
          </CardContent>
        </Card>
      ) : regulations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="mb-4 h-10 w-10 text-muted-foreground opacity-50" />
            <p className="font-semibold">{t("compliance.regulations.noRegulations")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
