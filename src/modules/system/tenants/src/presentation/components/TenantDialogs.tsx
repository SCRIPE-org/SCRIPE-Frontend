/**
 * TenantDialogs Component
 *
 * All dialogs for tenant CRUD operations.
 * Uses GenericModal and GenericForm for consistent UI and robust form state.
 */
"use client";

import { useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
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
      },
      {
        name: "subscriptionType",
        label: t("tenant.subscriptionType") || "Subscription Duration",
        type: "select",
        required: true,
        options: (() => {
          const selectedEd = cachedEditions.find((ed) => ed.id === form.editionId);
          const opts: { value: string; label: string }[] = [];
          if (!selectedEd || selectedEd.allowLifetime !== false)
            opts.push({ value: "Lifetime", label: t("tenant.subscriptionTypes.lifetime") || "Lifetime" });
          if (!selectedEd || selectedEd.allowMonthly !== false)
            opts.push({ value: "Monthly", label: t("tenant.subscriptionTypes.monthly") || "Monthly" });
          if (!selectedEd || selectedEd.allowYearly !== false)
            opts.push({ value: "Yearly", label: t("tenant.subscriptionTypes.yearly") || "Yearly" });
          if (!selectedEd || selectedEd.allowTrial !== false)
            opts.push({ value: "Trial", label: t("tenant.subscriptionTypes.trial") || "Trial (14 days)" });
          return opts;
        })(),
      },
      {
        name: "currency",
        label: t("tenant.billingCurrency") || "Billing Currency",
        type: "select",
        required: true,
        options: [
          { value: "USD", label: "🇺🇸 USD — US Dollar" },
          { value: "EUR", label: "🇪🇺 EUR — Euro" },
          { value: "GBP", label: "🇬🇧 GBP — British Pound" },
          { value: "SAR", label: "🇸🇦 SAR — Saudi Riyal" },
          { value: "AED", label: "🇦🇪 AED — UAE Dirham" },
          { value: "EGP", label: "🇪🇬 EGP — Egyptian Pound" },
          { value: "KWD", label: "🇰🇼 KWD — Kuwaiti Dinar" },
          { value: "QAR", label: "🇶🇦 QAR — Qatari Riyal" },
          { value: "TRY", label: "🇹🇷 TRY — Turkish Lira" },
          { value: "INR", label: "🇮🇳 INR — Indian Rupee" },
          { value: "JPY", label: "🇯🇵 JPY — Japanese Yen" },
          { value: "CAD", label: "🇨🇦 CAD — Canadian Dollar" },
        ],
      },
    ],
    [t, onSearchEditions, form.editionId, cachedEditions]
  );

  const handleSubmit = async (data: Record<string, any>) => {
    setForm({
      name: data.name,
      code: data.code,
      description: data.description || "",
      editionId: data.editionId,
      subscriptionType: data.subscriptionType || "Lifetime",
      currency: data.currency || "USD",
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
