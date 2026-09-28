"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@core/ui/dialog";
import { GenericForm, type FieldConfig } from "@core/ui/forms/generic-form";
import type { SchedulableResourceTreeNode } from "../utils/resourceTree";
import { flattenComposites } from "../utils/compositeTreeHelpers";

interface ResourceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: SchedulableResourceTreeNode | null;
  tree: SchedulableResourceTreeNode[];
  t: (key: string, values?: Record<string, string | number>) => string;
  searchFacilityResourceProfiles: (query: string) => Promise<{ value: string; label: string }[]>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
}

export function ResourceFormDialog({
  open,
  onOpenChange,
  editing,
  tree,
  t,
  searchFacilityResourceProfiles,
  onSubmit,
}: ResourceFormDialogProps) {
  const compositeOptions = flattenComposites(tree, editing?.id);

  const fields: FieldConfig[] = [
    {
      name: "facilityResourceProfileId",
      label: t("schedulableResource.fields.facilityResourceProfileId"),
      type: "server-select",
      searchType: "server",
      onServerSearch: searchFacilityResourceProfiles,
      required: true,
      placeholder: t("schedulableResource.placeholders.facilityResourceProfileId"),
      searchPlaceholder: t("schedulableResource.placeholders.facilityResourceProfileId"),
      description: t("schedulableResource.descriptions.facilityResourceProfileId"),
    },
    { name: "name", label: t("schedulableResource.fields.name"), type: "text", required: true },
    { name: "description", label: t("schedulableResource.fields.description"), type: "textarea" },
    {
      name: "parentSchedulableResourceId",
      label: t("schedulableResource.fields.parent"),
      type: "select",
      options: [
        { value: "", label: t("schedulableResource.fields.noParent") },
        ...compositeOptions,
      ],
      description: t("schedulableResource.descriptions.parent"),
    },
    { name: "isComposite", label: t("schedulableResource.fields.isComposite"), type: "switch" },
    {
      name: "namedUnitLabel",
      label: t("schedulableResource.fields.namedUnitLabel"),
      type: "text",
      isVisible: (v) => !v.isComposite,
      placeholder: t("schedulableResource.placeholders.namedUnitLabel"),
    },
    {
      name: "unitCount",
      label: t("schedulableResource.fields.unitCount"),
      type: "number",
      min: 1,
      isVisible: (v) => !v.isComposite,
    },
    {
      name: "allocationMode",
      label: t("schedulableResource.fields.allocationMode"),
      type: "select",
      isVisible: (v) => !v.isComposite,
      options: [
        { value: "SingleUnit", label: t("schedulableResource.allocationMode.singleUnit") },
        { value: "PooledUnits", label: t("schedulableResource.allocationMode.pooledUnits") },
      ],
    },
    {
      name: "maxConcurrentUsage",
      label: t("schedulableResource.fields.maxConcurrentUsage"),
      type: "number",
      min: 1,
      isVisible: (v) => !v.isComposite,
    },
  ];

  const initialValues = editing
    ? {
        name: editing.resource.name,
        description: editing.resource.description ?? "",
        parentSchedulableResourceId: editing.resource.parentSchedulableResourceId ?? "",
        isComposite: editing.resource.isComposite,
        namedUnitLabel: editing.resource.namedUnitLabel ?? "",
        unitCount: editing.resource.unitCount || 1,
        allocationMode: editing.resource.capacity?.allocationMode ?? "SingleUnit",
        maxConcurrentUsage: editing.resource.capacity?.maxConcurrentUsage ?? 1,
      }
    : {
        facilityResourceProfileId: "",
        name: "",
        description: "",
        parentSchedulableResourceId: "",
        isComposite: false,
        namedUnitLabel: "",
        unitCount: 1,
        allocationMode: "SingleUnit",
        maxConcurrentUsage: 1,
      };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing
              ? t("schedulableResource.editTitle")
              : t("schedulableResource.addNew")}
          </DialogTitle>
          <DialogDescription>{t("schedulableResource.formDescription")}</DialogDescription>
        </DialogHeader>
        <GenericForm
          fields={
            editing
              ? fields.filter((f) => f.name !== "facilityResourceProfileId")
              : fields
          }
          initialValues={initialValues}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
