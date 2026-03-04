/**
 * TenantDialogs Component
 *
 * All dialogs for tenant CRUD operations.
 * Uses GenericModal and GenericForm for consistent UI and robust form state.
 */
"use client";

import { useMemo, useState, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { SUPPORTED_CURRENCIES } from "@core/constants/currencies";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericForm, type FieldConfig } from "@core/ui/forms/generic-form";
import type { TenantTreeNode } from "../../domain/entities/Tenant";
import type { EditionThinModel } from "../../data/models/TenantSubscription";

// ==========================================
// Form State Types
// ==========================================

export interface CreateFormState {
  name: string;
  code: string;
  description: string;
  editionId: string;
  subscriptionType: string;
  currency: string;
  promoCode: string;
}

export interface EditFormState {
  name: string;
  description: string;
  isActive: boolean;
}

export const initialCreateForm: CreateFormState = {
  name: "",
  code: "",
  description: "",
  editionId: "",
  subscriptionType: "Lifetime",
  currency: "USD",
  promoCode: "",
};

export const initialEditForm: EditFormState = {
  name: "",
  description: "",
  isActive: true,
};

// ==========================================
// Create Tenant Dialog (GenericForm)
// ==========================================

interface CreateTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentTenant: TenantTreeNode | null;
  form: CreateFormState; // Kept for backwards compat signature, but GenericForm handles state internally
  setForm: React.Dispatch<React.SetStateAction<CreateFormState>>;
  onSubmit: (data?: any) => Promise<void> | void; // Using GenericForm onSubmit which passes data
  isLoading: boolean;
  onSearchEditions: (query: string) => Promise<{ value: string; label: string }[]>;
  cachedEditions?: EditionThinModel[];
}

export function CreateTenantDialog({
  open,
  onOpenChange,
  parentTenant,
  form,
  setForm,
  onSubmit,
  isLoading,
  onSearchEditions,
  cachedEditions = [],
}: CreateTenantDialogProps) {
  const { t } = useI18n();

  // Track selected edition locally to compute subscriptionType options
  // without calling parent setState during render
  const [selectedEditionId, setSelectedEditionId] = useState(form.editionId);

  const title = parentTenant ? t("tenant.createChild") : t("tenant.createTenant");
  const description = parentTenant
    ? `${t("tenant.createChildDescription")} "${parentTenant.name}".`
    : t("tenant.createDescription");

  const fields: FieldConfig[] = useMemo(
    () => [
      {
        name: "name",
        label: t("tenant.name"),
        type: "text",
        required: true,
        placeholder: t("tenant.namePlaceholder"),
      },
      {
        name: "code",
        label: t("tenant.code"),
        type: "text",
        required: true,
        placeholder: t("tenant.codePlaceholder"),
        onChange: (val: string, formData) => ({
          ...formData,
          code: val.toUpperCase(),
        }),
      },
      {
        name: "description",
        label: t("tenant.descriptionLabel"),
        type: "textarea",
        placeholder: t("tenant.descriptionPlaceholder"),
      },
      {
        name: "editionId",
        label: t("tenant.editionLabel") || "Subscription Plan",
        type: "server-select",
        required: true,
        placeholder: t("tenant.editionPlaceholder") || "Select a plan...",
        searchPlaceholder: t("common.search") || "Search...",
        searchType: "server",
        onServerSearch: onSearchEditions,
        onChange: (value: string) => {
          // Deferred state update to avoid setState during render
          // MUST update both: setForm (so initialValues.editionId is correct when
          // GenericForm's useEffect re-inits) and setSelectedEditionId (for options)
          setTimeout(() => {
            setSelectedEditionId(value);
            setForm((prev) => ({ ...prev, editionId: value, subscriptionType: "" }));
          }, 0);
          // Return object to reset subscriptionType in GenericForm's internal state
          return { editionId: value, subscriptionType: "" };
        },
      },
      {
        name: "subscriptionType",
        label: t("tenant.subscriptionType") || "Subscription Duration",
        type: "select",
        required: true,
        isVisible: (formData: Record<string, any>) => !!formData.editionId,
        options: (() => {
          const selectedEd = cachedEditions.find((ed) => ed.id === selectedEditionId);
          const opts: { value: string; label: string }[] = [];
          if (selectedEd?.allowLifetime !== false)
            opts.push({ value: "Lifetime", label: t("tenant.subscriptionTypes.lifetime") || "Lifetime" });
          if (selectedEd?.allowMonthly !== false)
            opts.push({ value: "Monthly", label: t("tenant.subscriptionTypes.monthly") || "Monthly" });
          if (selectedEd?.allowYearly !== false)
            opts.push({ value: "Yearly", label: t("tenant.subscriptionTypes.yearly") || "Yearly" });
          if (selectedEd?.allowTrial !== false)
            opts.push({ value: "Trial", label: t("tenant.subscriptionTypes.trial") || "Trial (14 days)" });
          return opts;
        })(),
      },
      {
        name: "currency",
        label: t("tenant.billingCurrency") || "Billing Currency",
        type: "select",
        required: true,
        isVisible: (formData: Record<string, any>) => !!formData.editionId && !!formData.subscriptionType,
        options: SUPPORTED_CURRENCIES.map((c) => ({
          value: c.code,
          label: `${c.flag} ${c.code} — ${c.name}`,
        })),
      },
      {
        name: "promoCode",
        label: t("tenant.promoCode") || "Promo Code",
        type: "text",
        isVisible: (formData: Record<string, any>) => !!formData.editionId && !!formData.subscriptionType,
        placeholder: t("tenant.promoCodePlaceholder") || "Enter promo code (optional)",
      },
    ],
    [t, onSearchEditions, selectedEditionId, cachedEditions]
  );

  const handleSubmit = async (data: Record<string, any>) => {
    setForm({
      name: data.name,
      code: data.code,
      description: data.description || "",
      editionId: data.editionId,
      subscriptionType: data.subscriptionType || "Lifetime",
      currency: data.currency || "USD",
      promoCode: data.promoCode || "",
    });
    await onSubmit();
  };

  return (
    <GenericModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="md"
      formKey="create-tenant-form"
    >
      <GenericForm
        key={`create-tenant-${open}`}
        fields={fields}
        initialValues={form}
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
      />
    </GenericModal>
  );
}

// ==========================================
// Edit Tenant Dialog (GenericForm)
// ==========================================

interface EditTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantName: string;
  form: EditFormState;
  setForm: React.Dispatch<React.SetStateAction<EditFormState>>;
  onSubmit: () => Promise<void> | void;
  isLoading: boolean;
}

export function EditTenantDialog({
  open,
  onOpenChange,
  tenantName,
  form,
  setForm,
  onSubmit,
  isLoading,
}: EditTenantDialogProps) {
  const { t } = useI18n();

  const title = t("tenant.editTenant");
  const description = `${t("tenant.editDescription")} "${tenantName}".`;

  const fields: FieldConfig[] = useMemo(
    () => [
      {
        name: "name",
        label: t("tenant.name"),
        type: "text",
        required: true,
        placeholder: t("tenant.namePlaceholder"),
      },
      {
        name: "description",
        label: t("tenant.descriptionLabel"),
        type: "textarea",
        placeholder: t("tenant.descriptionPlaceholder"),
      },
      {
        name: "isActive",
        label: t("tenant.activeStatus"),
        type: "switch",
      },
    ],
    [t]
  );

  const handleSubmit = async (data: Record<string, any>) => {
    setForm({
      name: data.name,
      description: data.description || "",
      isActive: data.isActive,
    });
    await onSubmit();
  };

  return (
    <GenericModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="md"
      formKey={`edit-tenant-form-${tenantName}`}
    >
      <GenericForm
        key={`edit-tenant-${open}`}
        fields={fields}
        initialValues={form}
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
      />
    </GenericModal>
  );
}
