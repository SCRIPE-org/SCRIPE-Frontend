"use client";

import React, { useState, useTransition } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useSiteViewModel } from "../viewmodels/useSiteViewModel";
import type { Site } from "../../domain/entities/Site";
import { useI18n } from "@core/providers/i18n-provider";
import { resolveIntlLocale } from "@core/common/utils";
import { Pencil, Trash2 } from "lucide-react";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { VenueResourceNav } from "@modules/venue";
import { SiteFormDialog } from "../components/SiteFormDialog";

/**
 * Documentation for module export
 */
export const SiteListView = React.memo(function SiteListView() {
  const { vm } = useSiteViewModel();
  const { t, language } = useI18n();
  const [, startTransition] = useTransition();

  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    site: Site | null;
  }>({
    open: false,
    site: null,
  });

  const config: CrudConfig<Site> = {
    titleKey: "site.title",
    subtitleKey: "site.description",
    resource: "sites",
    columns: [
      { key: "name", label: t("site.fields.name"), sortable: true },
      { key: "address", label: t("site.fields.address") },
      { key: "timeZone", label: t("site.fields.timeZone") },
      {
        key: "createdAt",
        label: t("common.createdAt"),
        render: (value: string) =>
          value ? new Date(value).toLocaleDateString(resolveIntlLocale(language)) : "-",
      },
    ],
    onCreateClick: () => {
      setFormDialog({ open: true, site: null });
    },
    getItemDisplayName: (item: Site) => item.name,
    deleteService: (id: string) => vm.deleteItem(id),
    getActions: (_vmInstance, tFn, handleDeleteFn): CrudAction<Site>[] => [
      {
        label: tFn("common.edit"),
        onClick: (item: Site) => {
          setFormDialog({ open: true, site: item });
        },
        variant: "ghost" as const,
        icon: <Pencil className="h-4 w-4" />,
        requiredPermission: VENUE_PERMISSIONS.SITE_UPDATE,
      },
      {
        label: tFn("common.delete"),
        onClick: (item: Site) => handleDeleteFn?.(item),
        variant: "ghost" as const,
        className: "text-destructive hover:text-destructive/80",
        icon: <Trash2 className="h-4 w-4" />,
        requiredPermission: VENUE_PERMISSIONS.SITE_DELETE,
      },
    ],
  };

  return (
    <div className="space-y-4">
      <VenueResourceNav />
      <GenericCrudView viewModel={vm} config={config} />
      <SiteFormDialog
        open={formDialog.open}
        onOpenChange={(open) =>
          setFormDialog((prev) => ({ ...prev, open }))
        }
        site={formDialog.site}
        onSuccess={() => {
          startTransition(() => {
            void vm.refresh();
          });
        }}
      />
    </div>
  );
});
