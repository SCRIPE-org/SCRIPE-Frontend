export const en = {
  fieldGroup: {
    title: "Field Groups",
    description:
      "Group an entity type's custom fields so they render together, in an order you control.",
    addNew: "Add Field Group",
    editTitle: "Edit Field Group",
    deleteTitle: "Delete Field Group",
    // Spells out what delete actually does, because the backend behaviour is
    // not the one most admins assume: the group is removed and every field
    // inside it becomes ungrouped. Nothing is blocked, and no field is deleted.
    deleteConfirm:
      'Delete the group "{name}"? The fields in it are not deleted — they simply become ungrouped and keep all of their data. You can put them into another group afterwards.',
    loadFailed: "Couldn't load the field groups for this entity type.",

    // Reorder controls. These are the accessible names of the two buttons that
    // make reordering possible without a drag gesture (WCAG 2.2 SC 2.5.7), so
    // they must stay distinct and self-describing.
    moveUp: "Move group up",
    moveDown: "Move group down",

    // Platform-owned (TenantId == null) group, inherited by every tenant.
    global: "Global",

    fields: {
      entityTypeKey: "Entity Type",
      labelEn: "Label (English)",
      labelAr: "Label (Arabic)",
      sortOrder: "Order",
      isGlobal: "Global (all tenants)",
    },

    placeholders: {
      entityTypeKey: "Choose an entity type",
    },

    selectEntityType: {
      title: "Choose an entity type",
      description:
        "Field groups belong to one entity type. Pick one above to see and manage its groups.",
    },

    noItems: {
      title: "No field groups yet",
      description:
        "This entity type's custom fields all render ungrouped. Add a group to start organising them.",
    },

    platformContext: {
      title: "Platform context — no tenant selected",
      description:
        "Any group you create here is global: it's inherited by every tenant, not scoped to one. Drill into a tenant first if you meant to create a tenant-specific group.",
    },

    isGlobalDescription: {
      platformContext: "No tenant is selected, so this group is always global.",
      tenantContext:
        "Off scopes this group to the tenant you're currently viewing. On makes it available to every tenant.",
    },

    toast: {
      created: "Field group created.",
      createFailed: "Couldn't create the field group.",
      updated: "Field group updated.",
      updateFailed: "Couldn't update the field group.",
      deleted: "Field group deleted. Its fields are now ungrouped.",
      deleteFailed: "Couldn't delete the field group.",
      reordered: "Field group order saved.",
      reorderFailed: "Couldn't save the new order. Nothing was changed.",
      // The server caps one reorder request at {max} groups and rejects the
      // whole payload above it, so a move on a very long list would otherwise
      // fail with only the generic message above and no way to tell why.
      reorderTooMany:
        "This entity type has more than {max} reorderable groups, which is more than one reorder request can carry. Split them across entity types, or delete groups you no longer use.",
    },
  },
};
