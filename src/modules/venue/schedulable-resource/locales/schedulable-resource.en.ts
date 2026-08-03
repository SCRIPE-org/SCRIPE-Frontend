export const en = {
  schedulableResource: {
    title: "Resource Builder",
    description: "Compose bookable resources, set capacity, and publish them for scheduling.",
    addNew: "Add Resource",
    editTitle: "Edit Resource",
    deleteTitle: "Delete Resource",
    deleteConfirm: "Are you sure you want to delete this resource? This cannot be undone.",
    noItems: "No schedulable resources yet",
    noItemsDescription: "Add a resource to start building your bookable inventory.",
    formDescription: "Link to a facility resource profile and define how this resource is composed and allocated.",
    checklistTitle: "Publication Checklist",
    checklistAllClear: "Every prerequisite is met — this resource is ready to publish.",
    compositeHint: "Composite resource — capacity comes from its child resources.",
    status: {
      draft: "Draft",
      published: "Published",
    },
    fields: {
      facilityResourceProfileId: "Facility Resource Profile",
      name: "Name",
      description: "Description",
      parent: "Parent Resource",
      noParent: "No parent (top-level resource)",
      isComposite: "Composite (grouped from child resources)",
      namedUnitLabel: "Unit Label",
      unitCount: "Unit Count",
      allocationMode: "Allocation Mode",
      maxConcurrentUsage: "Max Concurrent Usage",
    },
    placeholders: {
      facilityResourceProfileId: "Search for a resource profile...",
      namedUnitLabel: "e.g. Court, Lane, Bay",
    },
    descriptions: {
      facilityResourceProfileId: "The FacilityOperations resource profile this resource schedules against.",
      parent: "Assign to a composite resource to nest this resource under it (e.g. a court under a court complex).",
    },
    allocationMode: {
      singleUnit: "Single unit (one booking at a time)",
      pooledUnits: "Pooled units (interchangeable named units)",
    },
    actions: {
      checklist: "View publication checklist",
      publish: "Publish",
    },
  },
};
