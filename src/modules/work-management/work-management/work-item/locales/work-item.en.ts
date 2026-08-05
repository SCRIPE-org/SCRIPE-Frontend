export const en = {
  workItem: {
    title: "Work Items",
    description: "Manage tasks, follow-ups and assignments across records",
    addNew: "Add Work Item",
    noItems: "No work items found",
    searchPlaceholder: "Search work items...",

    // Field labels — shared between the table columns and the create/edit forms
    fields: {
      title: "Title",
      description: "Description",
      status: "Status",
      priority: "Priority",
      ownerEntityTypeKey: "Owner Type",
      ownerEntityId: "Owner Record ID",
      assignedToId: "Assigned To (User/Admin ID)",
      dueAt: "Due Date",
      isActive: "Active",
    },

    // Form placeholders
    placeholders: {
      ownerEntityTypeKey: "e.g. party.person",
      ownerEntityId: "ID of the record this task is about (optional)",
      assignedToId: "ID of the user or admin this task is assigned to (optional)",
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
