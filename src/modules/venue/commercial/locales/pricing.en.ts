export const en = {
  pricing: {
    title: "Resource pricing",
    description: "Configure the authoritative standard rental rate for a published venue resource.",
    resource: "Schedulable resource",
    selectResource: "Select a resource",
    configured: "Configured",
    notConfigured: "Not configured",
    configure: "Configure standard rate",
    replace: "Publish replacement rate",
    saving: "Saving authoritative rate…",
    saved: "Price configuration saved",
    savedDescription: "The new standard rate will be used only by newly calculated server quotes.",
    retry: "Retry",
    empty: {
      title: "No published resources",
      description: "Publish a non-composite resource before configuring its rental price.",
    },
    permission: {
      title: "Commercial pricing access required",
      description: "You do not have permission to view venue commercial pricing.",
    },
    configurePermission: {
      title: "Pricing is read-only",
      description:
        "Creating or replacing a rate requires Catalog, Offering, and Price Book permissions.",
    },
    error: {
      title: "Pricing could not be loaded",
      description: "The authoritative commercial configuration is temporarily unavailable.",
    },
    validation: {
      invalid:
        "Provide a name, ISO currency, non-negative price, valid UTC effective time, and compatible duration limits.",
    },
    rate: {
      title: "Standard rental rate",
      description:
        "A replacement preserves prior price books; existing quotes and booking snapshots stay immutable.",
    },
    fields: {
      name: "Offering display name",
      currency: "ISO currency",
      unitPrice: "Unit price",
      effectiveFromUtc: "Effective from (UTC)",
      minDuration: "Minimum duration (minutes, optional)",
      maxDuration: "Maximum duration (minutes, optional)",
      increment: "Duration increment (minutes, optional)",
      taxCategory: "Tax category",
      noTax: "No tax",
    },
    taxPermission:
      "Assigning or creating a tax category requires the independent tax-management permission.",
    taxSetup: {
      title: "Tax setup",
      description:
        "Create a tenant tax category, then select it for this offering. Rates are entered as percentages.",
      name: "Tax name",
      code: "Tax code",
      rate: "Rate (%)",
      inclusive: "Prices already include this tax",
      create: "Create tax category",
      creating: "Creating tax category…",
    },
  },
};
