export const en = {
  workItem: {
    title: "Work Items",
    description: "Manage tasks, follow-ups and assignments across records",
    addNew: "Add Work Item",
    editTitle: "Edit Work Item",
    deleteTitle: "Delete Work Item",
    deleteConfirm: "Are you sure you want to delete this work item?",
    noItems: "No work items found",
    searchPlaceholder: "Search work items...",

    // Field labels — shared between the table columns and the create/edit forms
    fields: {
      title: "Title",
      description: "Description",
      status: "Status",
      priority: "Priority",
      ownerEntityTypeKey: "Owner Type",
      dueAt: "Due Date",
      isActive: "Active",
    },

    // Form placeholders
    placeholders: {
      ownerEntityTypeKey: "e.g. party.person",
    },

    // WorkItemStatus enum (0..4)
    statuses: {
      toDo: "To Do",
      inProgress: "In Progress",
      blocked: "Blocked",
      done: "Done",
      cancelled: "Cancelled",
    },

    // WorkItemPriority enum (0..3)
    priorities: {
      low: "Low",
      normal: "Normal",
      high: "High",
      critical: "Critical",
    },
  },
};
