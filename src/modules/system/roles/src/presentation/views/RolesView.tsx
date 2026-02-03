/**
 * Roles View
 *
 * Main view component for role management.
 * Uses GenericCrudView for standardized UI.
 */
"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useRolesViewModel } from "../viewmodels/useRolesViewModel";
import {
      GenericCrudView,
      type CrudConfig,
      type CrudColumn
} from "@core/crud/components/generic-crud-view";
import { Shield, Pencil, Trash } from "lucide-react";
import type { Role } from "../../domain/entities/Role";

export function RolesView() {
      const { t } = useI18n();
      const router = useRouter();
      const viewModel = useRolesViewModel();

      const columns: CrudColumn<Role>[] = [
            { key: "name", label: t("roles.name"), sortable: true, className: "font-medium" },
            { key: "code", label: t("roles.code"), sortable: true, className: "font-mono text-xs" },
            { key: "description", label: t("roles.descriptionCol") || t("roles.description"), className: "hidden md:table-cell" },
            {
                  key: "priority",
                  label: t("roles.priority"),
                  sortable: true,
                  className: "w-24 text-center"
            },
      ];

      const config: CrudConfig<Role> = {
            titleKey: "roles.title",
            subtitleKey: "roles.description",
            resource: "roles", // Checks permissions (roles.view, roles.create, etc.)
            columns,
            createFields: [
                  {
                        name: "name",
                        label: t("roles.name"),
                        type: "text",
                        required: true,
                        placeholder: t("roles.namePlaceholder")
                  },
                  {
                        name: "code",
                        label: t("roles.code"),
                        type: "text",
                        required: true,
                        placeholder: t("roles.codePlaceholder")
                  },
                  {
                        name: "description",
                        label: t("roles.descriptionField") || t("roles.description"),
                        type: "textarea",
                        placeholder: t("roles.descriptionPlaceholder")
                  },
                  {
                        name: "priority",
                        label: t("roles.priority"),
                        type: "number",
                        defaultValue: 100
                  },
            ],
            editFields: [
                  {
                        name: "name",
                        label: t("roles.name"),
                        type: "text",
                        required: true
                  },
                  {
                        name: "description",
                        label: t("roles.descriptionField") || t("roles.description"),
                        type: "textarea"
                  },
                  {
                        name: "priority",
                        label: t("roles.priority"),
                        type: "number"
                  },
            ],
            getActions: (vm, t, handleDelete) => [
                  // Manage Permissions (Custom Action)
                  {
                        label: t("roles.managePermissions"),
                        icon: <Shield className="h-4 w-4" />,
                        onClick: (role) => router.push(`/roles/${role.id}`),
                  },
                  // Edit (Standard)
                  {
                        label: t("common.edit"),
                        icon: <Pencil className="h-4 w-4" />,
                        onClick: (role) => vm.openEditModal(role),
                  },
                  // Delete (Standard)
                  {
                        label: t("common.delete"),
                        icon: <Trash className="h-4 w-4" />,
                        onClick: handleDelete,
                        variant: "destructive",
                  }
            ],
            getItemDisplayName: (role) => role.name,
            itemTypeKey: "roles.roleDetails"  // Used for delete confirmation ("Delete Role Details" -> "Delete Role")
      };

      return <GenericCrudView viewModel={viewModel} config={config} />;
}
