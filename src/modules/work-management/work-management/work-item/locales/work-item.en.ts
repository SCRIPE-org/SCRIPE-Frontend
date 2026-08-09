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
      assignedToId: "Assigned To",
      dueAt: "Due Date",
      isActive: "Active",
    },

    // Form placeholders
    placeholders: {
      ownerEntityTypeKey: "e.g. party.person",
      ownerEntityId: "ID of the record this task is about (optional)",
      assignedToId: "Select an assignee (optional)",
      assignedToSearch: "Search admins by name, username or email...",
    },

    // Short captions shown under the Owner and Assigned To fields so the two
    // don't read as duplicates of each other -- Owner is WHAT the task is
    // about, Assigned To is WHO does it.
    help: {
      owner:
        "What this task is about — an existing record such as a person or booking. Leave blank for a standalone task.",
      assignedTo: "Who is responsible for doing this task. Search by name to find a tenant admin.",
    },

    // Assigned To search-select states
    search: {
      noAdminsFound: "No matching admins found",
      searchingAdmins: "Searching admins...",
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
