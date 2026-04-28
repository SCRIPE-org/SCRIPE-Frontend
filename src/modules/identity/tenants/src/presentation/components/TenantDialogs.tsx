/**
 * TenantDialogs Component
 *
 * All dialogs for tenant CRUD operations.
 * Uses GenericModal and GenericForm for consistent UI and robust form state.
 *
 * PURE UI — no data fetching. All data is received via props from the View.
 */
"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { SUPPORTED_CURRENCIES } from "@core/constants/currencies";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericForm, type FieldConfig } from "@core/ui/forms/generic-form";
import type { TenantTreeNode } from "../../domain/entities/Tenant";
import type { EditionThinModel } from "../../domain/types/SubscriptionTypes";

// ==========================================
// Promotion type (local — avoids cross-module imports)
// ==========================================

export interface PromotionOption {
  id: string;
  name: string;
  type: string;
  discountValue: number;
  requiresCode: boolean;
}

// ==========================================
// Form State Types
// ==========================================

export interface CreateFormState {
  name: string;
  code: string;
  description: string;
  // Step 2: Admin
  adminEmail: string;
  adminUsername: string;
  // Step 3: Edition & Billing
  editionId: string;
  subscriptionType: string;
  currency: string;
  promotionId: string;
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
  adminEmail: "",
  adminUsername: "",
  editionId: "",
  subscriptionType: "",
  currency: "USD",
  promotionId: "",
  promoCode: "",
};

export const initialEditForm: EditFormState = {
  name: "",
  description: "",
  isActive: true,
};

// ==========================================
// Create Tenant Dialog (GenericForm — Pure UI)
// ==========================================

interface CreateTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentTenant: TenantTreeNode | null;
  form: CreateFormState;
  setForm: React.Dispatch<React.SetStateAction<CreateFormState>>;
  onSubmit: (data?: any) => Promise<void> | void;
  isLoading: boolean;
  onSearchEditions: (query: string) => Promise<{ value: string; label: string }[]>;
  cachedEditions?: EditionThinModel[];
  // ── Promotion data from View ──
  availablePromotions: PromotionOption[];
  isLoadingPromotions: boolean;
  onEditionChange: (editionId: string) => void;
  onSubscriptionTypeChange: (type: string) => void;
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
  availablePromotions,
  isLoadingPromotions,
  onEditionChange,
  onSubscriptionTypeChange,
}: CreateTenantDialogProps) {
  const { t } = useI18n();

  // Track selected edition locally to compute subscriptionType options
  const [selectedEditionId, setSelectedEditionId] = useState(form.editionId);
  const [selectedPromotionId, setSelectedPromotionId] = useState("");

  // Reset local state when dialog opens
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevFormEditionId, setPrevFormEditionId] = useState(form.editionId);
  if (open !== prevOpen || form.editionId !== prevFormEditionId) {
    setPrevOpen(open);
    setPrevFormEditionId(form.editionId);
    if (open) {
      setSelectedEditionId(form.editionId);
      setSelectedPromotionId("");
    }
  }

  // Determine if selected promotion requires a code
  const selectedPromo = useMemo(() => {
    if (!selectedPromotionId) return null;
    return availablePromotions.find((p) => p.id === selectedPromotionId) ?? null;
  }, [selectedPromotionId, availablePromotions]);

  const requiresPromoCode = selectedPromo?.requiresCode ?? false;

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
        onChange: (val: string, formData: Record<string, any>) => ({
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
      // ── Step 2: Admin Info ──
      {
        name: "adminEmail",
        label: t("tenant.adminEmail") || "Admin Email",
        type: "text",
        required: true,
        placeholder: t("tenant.adminEmailPlaceholder") || "admin@company.com",
      },
      {
        name: "adminUsername",
        label: t("tenant.adminUsername") || "Admin Username (optional)",
        type: "text",
        placeholder: t("tenant.adminUsernamePlaceholder") || "Auto-generated if empty",
      },
      // ── Step 3: Edition & Billing ──
      {
        name: "editionId",
        label: t("tenant.editionLabel") || "Subscription Plan",
        type: "server-select",
        required: true,
        placeholder: t("tenant.editionPlaceholder") || "Select a plan...",
        searchPlaceholder: t("common.search") || "Search...",
        searchType: "server",
        onServerSearch: onSearchEditions,
        onChange: (value: string, formData: Record<string, any>) => {
          setTimeout(() => {
            setSelectedEditionId(value);
            setSelectedPromotionId("");
            onEditionChange(value);
            // Preserve ALL current user input (name, code, etc.) from formData
            setForm({
              name: formData.name || "",
              code: formData.code || "",
              description: formData.description || "",
              adminEmail: formData.adminEmail || "",
              adminUsername: formData.adminUsername || "",
              editionId: value,
              subscriptionType: "",
              currency: formData.currency || "USD",
              promotionId: "",
              promoCode: "",
            });
          }, 0);
          return { editionId: value, subscriptionType: "", promotionId: "", promoCode: "" };
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
        onChange: (value: string, formData: Record<string, any>) => {
          setTimeout(() => {
            setSelectedPromotionId("");
            onSubscriptionTypeChange(value);
            // Preserve ALL current user input from formData
            setForm({
              name: formData.name || "",
              code: formData.code || "",
              description: formData.description || "",
              adminEmail: formData.adminEmail || "",
              adminUsername: formData.adminUsername || "",
              editionId: formData.editionId || "",
              subscriptionType: value,
              currency: formData.currency || "USD",
              promotionId: "",
              promoCode: "",
            });
          }, 0);
          return { subscriptionType: value, promotionId: "", promoCode: "" };
        },
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
      // ── Promotion Picker (select dropdown — data from View) ──
      {
        name: "promotionId",
        label: t("tenant.entitlementLabels.promotionsTitle") || "Promotion",
        type: "select",
        loading: isLoadingPromotions,
        isVisible: (formData: Record<string, any>) => !!formData.editionId && !!formData.subscriptionType,
        options: [
          { value: "__none__", label: t("tenant.entitlementLabels.promotionsNoPromotion") || "No promotion" },
          ...availablePromotions.map((p) => ({
            value: p.id,
            label: `${p.name} — ${p.type === "Percentage" ? `${p.discountValue}% off` : `$${p.discountValue} off`}${p.requiresCode ? " (Code)" : ""}`,
          })),
        ],
        onChange: (value: string, formData: Record<string, any>) => {
          const actualValue = value === "__none__" ? "" : value;
          setTimeout(() => {
            setSelectedPromotionId(actualValue);
            // Preserve ALL current user input from formData
            setForm({
              name: formData.name || "",
              code: formData.code || "",
              description: formData.description || "",
              adminEmail: formData.adminEmail || "",
              adminUsername: formData.adminUsername || "",
              editionId: formData.editionId || "",
              subscriptionType: formData.subscriptionType || "",
              currency: formData.currency || "USD",
              promotionId: actualValue,
              promoCode: "",
            });
          }, 0);
          return { promotionId: value, promoCode: "" };
        },
      },
      // ── Conditional Promo Code input ──
      {
        name: "promoCode",
        label: t("tenant.promoCode") || "Promo Code",
        type: "text",
        isVisible: () => requiresPromoCode,
        placeholder: t("tenant.promoCodePlaceholder") || "Enter promo code",
        onChange: (val: string, formData: Record<string, any>) => ({
          ...formData,
          promoCode: val.toUpperCase(),
        }),
      },
    ],
    [t, onSearchEditions, selectedEditionId, cachedEditions, availablePromotions, requiresPromoCode, isLoadingPromotions, onEditionChange, onSubscriptionTypeChange, setForm]
  );

  const handleSubmit = async (data: Record<string, any>) => {
    const promoId = data.promotionId === "__none__" ? "" : (data.promotionId || "");
    const resolvedData: CreateFormState = {
      name: data.name,
      code: data.code,
      description: data.description || "",
      adminEmail: data.adminEmail || "",
      adminUsername: data.adminUsername || "",
      editionId: data.editionId,
      subscriptionType: data.subscriptionType || "",
      currency: data.currency || "USD",
      promotionId: promoId,
      promoCode: data.promoCode || "",
    };
    setForm(resolvedData);
    await onSubmit(resolvedData);
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
// Edit Tenant Dialog (GenericForm — Pure UI)
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
