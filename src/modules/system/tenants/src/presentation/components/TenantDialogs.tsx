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
  onSubmit: (data?: any) => void; // Using GenericForm onSubmit which passes data
  isLoading: boolean;
  onSearchEditions: (query: string) => Promise<{ value: string; label: string }[]>;
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
    ],
    [t, onSearchEditions]
  );

  const handleSubmit = async (data: Record<string, any>) => {
    // Update the external form state before submitting so the parent has access to it
    setForm({
      name: data.name,
      code: data.code,
      description: data.description || "",
      editionId: data.editionId,
    });
    // Call original submit
    onSubmit();
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
  onSubmit: () => void;
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
    onSubmit();
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
