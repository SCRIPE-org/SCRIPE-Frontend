/**
 * Menu Form Dialog
 *
 * Bilingual create / edit form for menu items.
 * Uses GenericModal + GenericForm for consistent form handling and working selects.
 */
"use client";

import { useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericForm, type FieldConfig } from "@core/ui/forms/generic-form";
import type { MenuTreeNode } from "../../domain/entities/MenuItem";
import type {
      CreateMenuItemRequest,
      UpdateMenuItemRequest,
} from "../../domain/entities/MenuItemRequests";
import { PAGE_REGISTRY } from "@core/common/pageRegistry";

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */

export interface MenuFormDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      mode: "create" | "edit";
      parentNode?: MenuTreeNode | null;
      editNode?: MenuTreeNode | null;
      onSubmit: (
            data: CreateMenuItemRequest | { id: string; request: UpdateMenuItemRequest }
      ) => Promise<void>;
      isPending: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                   */
/* -------------------------------------------------------------------------- */

const CUSTOM_HREF_VALUE = "__custom__";

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function MenuFormDialog({
      open,
      onOpenChange,
      mode,
      parentNode,
      editNode,
      onSubmit,
      isPending,
}: MenuFormDialogProps) {
      const { t, language } = useI18n();

      // ── Build page options from PAGE_REGISTRY ──────────────────────────
      const pageOptions = useMemo(() => {
            const opts = PAGE_REGISTRY.map((page) => ({
                  value: page.href,
                  label:
                        language === "ar"
                              ? `${page.labelAr}  ${page.href}`
                              : `${page.labelEn}  ${page.href}`,
            }));
            // Add "Custom URL" option at the end
            opts.push({
                  value: CUSTOM_HREF_VALUE,
                  label: t("menus.customHref") || "Custom URL...",
            });
            return opts;
      }, [language, t]);

      // ── Check if an href matches a registered page ─────────────────────
      const isRegisteredPage = (h: string) =>
            PAGE_REGISTRY.some((p) => p.href === h);

      // ── Compute initial values ─────────────────────────────────────────
      const initialValues = useMemo(() => {
            if (mode === "edit" && editNode) {
                  const isCustom =
                        !!editNode.href && !isRegisteredPage(editNode.href);
                  return {
                        href: isCustom ? CUSTOM_HREF_VALUE : editNode.href ?? "",
                        customHref: isCustom ? editNode.href : "",
                        slug: editNode.slug,
                        nameEn: editNode.nameEn,
                        nameAr: editNode.nameAr,
                        icon: editNode.icon ?? "",
                        resource: editNode.resource ?? "",
                  };
            }
            return {
                  href: "",
                  customHref: "",
                  slug: "",
                  nameEn: "",
                  nameAr: "",
                  icon: "",
                  resource: "",
            };
      }, [mode, editNode]);

      // ── Define form fields ─────────────────────────────────────────────
      const fields: FieldConfig[] = useMemo(
            () => [
                  {
                        name: "href",
                        label: t("menus.href") || "Page",
                        type: "searchable-select",
                        options: pageOptions,
                        placeholder: t("menus.selectPage") || "Select a page...",
                        searchPlaceholder: t("common.search") || "Search...",
                        onChange: (value: any, formData: Record<string, any>) => {
                              if (value === CUSTOM_HREF_VALUE) {
                                    return { ...formData, href: CUSTOM_HREF_VALUE };
                              }
                              // Auto-fill from page definition
                              const page = PAGE_REGISTRY.find((p) => p.href === value);
                              if (page) {
                                    const updates: Record<string, any> = { ...formData, href: value, customHref: "" };
                                    if (!formData.slug?.trim())
                                          updates.slug = page.href
                                                .replace(/^\//, "")
                                                .replace(/\//g, "-");
                                    if (!formData.nameEn?.trim())
                                          updates.nameEn = page.labelEn;
                                    if (!formData.nameAr?.trim())
                                          updates.nameAr = page.labelAr;
                                    if (!formData.icon?.trim() && page.icon)
                                          updates.icon = page.icon;
                                    if (!formData.resource?.trim() && page.resource)
                                          updates.resource = page.resource;
                                    return updates;
                              }
                              return { ...formData, href: value, customHref: "" };
                        },
                  },
                  {
                        name: "customHref",
                        label: t("menus.customHref") || "Custom URL",
                        type: "text",
                        placeholder: "/custom-page",
                        isVisible: (formData) => formData.href === CUSTOM_HREF_VALUE,
                  },
                  {
                        name: "slug",
                        label: t("menus.slug"),
                        type: "text",
                        required: true,
                        placeholder: "dashboard",
                  },
                  {
                        name: "nameEn",
                        label: t("menus.nameEn"),
                        type: "text",
                        required: true,
                        placeholder: "Dashboard",
                  },
                  {
                        name: "nameAr",
                        label: t("menus.nameAr"),
                        type: "text",
                        placeholder: "لوحة التحكم",
                  },
                  {
                        name: "icon",
                        label: t("menus.icon"),
                        type: "text",
                        placeholder: "LayoutDashboard",
                  },
                  {
                        name: "resource",
                        label: t("menus.resource"),
                        type: "text",
                        placeholder: "users",
                  },
            ],
            [t, pageOptions]
      );

      // ── Dialog title / description ─────────────────────────────────────
      const title =
            mode === "create"
                  ? parentNode
                        ? t("menus.addChildTitle")
                        : t("menus.createTitle")
                  : t("menus.editTitle");

      const description =
            mode === "create" && parentNode
                  ? `${t("menus.addChildDesc")} "${parentNode.nameEn}"`
                  : mode === "create"
                        ? t("menus.createDesc")
                        : t("menus.editDesc");

      // ── Handle submit ──────────────────────────────────────────────────
      const handleSubmit = async (data: Record<string, any>) => {
            const resolvedHref =
                  data.href === CUSTOM_HREF_VALUE
                        ? data.customHref?.trim() || undefined
                        : data.href?.trim() || undefined;

            if (mode === "create") {
                  await onSubmit({
                        slug: data.slug.trim(),
                        nameEn: data.nameEn.trim(),
                        nameAr: data.nameAr?.trim() || data.nameEn.trim(),
                        href: resolvedHref,
                        icon: data.icon?.trim() || undefined,
                        parentMenuItemId: parentNode?.id,
                        resource: data.resource?.trim() || undefined,
                  } as CreateMenuItemRequest);
            } else if (editNode) {
                  await onSubmit({
                        id: editNode.id,
                        request: {
                              slug: data.slug.trim(),
                              nameEn: data.nameEn.trim(),
                              nameAr: data.nameAr?.trim() || data.nameEn.trim(),
                              href: resolvedHref,
                              icon: data.icon?.trim() || undefined,
                              resource: data.resource?.trim() || undefined,
                        },
                  });
            }
            onOpenChange(false);
      };

      return (
            <GenericModal
                  open={open}
                  onOpenChange={onOpenChange}
                  title={title}
                  description={description}
                  size="md"
                  formKey={`menu-form-${mode}-${editNode?.id ?? "new"}`}
            >
                  <GenericForm
                        key={`${mode}-${editNode?.id ?? "new"}`}
                        fields={fields}
                        initialValues={initialValues}
                        onSubmit={handleSubmit}
                        onCancel={() => onOpenChange(false)}
                  />
            </GenericModal>
      );
}
