export const en = {
  leads: {
    title: "Sales Leads",
    subtitle: "Platform contact-sales inquiries",
    searchPlaceholder: "Search by company, email, or contact\u2026",
    allStatuses: "All Statuses",
    totalCount: "{{count}} total",
    createButton: "+ Create Lead",

    columns: {
      company: "Company",
      contact: "Contact",
      email: "Email",
      phone: "Phone",
      edition: "Edition",
      status: "Status",
      source: "Source",
      created: "Created",
    },

    status: {
      New: "New",
      Contacted: "Contacted",
      Qualified: "Qualified",
      Converted: "Converted",
      Closed: "Closed",
    },

    source: {
      Website: "\uD83C\uDF10 Website",
      Admin: "\uD83D\uDD11 Admin",
      Import: "\uD83D\uDCE6 Import",
    },

    discovery: {
      sectionTitle: "Discovery Intelligence",
      industry: "Industry",
      teamSize: "Team size",
      teamSizeSuffix: "people",
      priority: "Primary priority",
      noData: "No discovery data",
      industryLabels: {
        general: "General",
        erp: "ERP Suite",
        healthcare: "Healthcare",
      },
      teamSizeLabels: {
        solo: "Solo",
        "2-10": "2\u201310",
        "11-50": "11\u201350",
        "51-200": "51\u2013200",
        "200+": "200+",
      },
    },

    updateDialog: {
      title: "Update Lead Status",
      newStatus: "New Status",
      notes: "Internal Notes (optional)",
      notesPlaceholder: "Add any notes about this lead\u2026",
      cancel: "Cancel",
      confirm: "Update Status",
      updating: "Updating\u2026",
    },

    pagination: {
      page: "Page {{page}} of {{total}}",
      previous: "Previous",
      next: "Next",
    },

    empty: "No leads found.",
    loading: "Loading leads\u2026",
    loadError: "Failed to load leads. Please refresh and try again.",

    drawer: {
      loadingDetail: "Loading lead details\u2026",
      notFound: "Lead not found.",
      editionLabel: "{{edition}} Edition",

      sections: {
        contact: "Contact",
        discovery: "Discovery Intelligence",
        message: "Message",
        crmStatus: "CRM Status",
        salesNotes: "Sales Notes",
        conversion: "Conversion",
      },

      contact: {
        email: "Email",
        phone: "Phone",
        phoneMissing: "Not provided",
        source: "Source",
        submitted: "Submitted",
      },

      status: {
        changeLabel: "Change status",
        notePlaceholder: "Note this status change reason\u2026",
        noteLabel: "Add internal note (optional)",
        save: "Save changes",
        saving: "Saving\u2026",
        saved: "\u2713 Saved",
        noChanges: "No changes",
      },

      conversion: {
        converted: "\u2713 Converted to tenant",
      },
    },

    statsBar: {
      total: "Total",
      new: "New",
      qualified: "Qualified",
      converted: "Converted",
    },
    createDialog: {
      title: "Create Sales Lead",
      subtitle: "Manually create a lead for a prospect from the admin panel.",
      company: "Company",
      companyPlaceholder: "ACME Corp",
      contact: "Contact Name",
      contactPlaceholder: "John Smith",
      email: "Business Email",
      phone: "Phone (optional)",
      editionInterest: "Edition interest",
      editionPlaceholder: "Select an edition\u2026",
      editionNone: "Not specified",
      message: "Message",
      messagePlaceholder: "What does the prospect want to achieve?",
      notes: "Internal notes",
      notesPlaceholder: "Private notes for the sales team\u2026",
      cancel: "Cancel",
      create: "Create Lead",
      creating: "Creating\u2026",
      errors: {
        companyRequired: "Company name is required.",
        contactRequired: "Contact name is required.",
        emailInvalid: "Please enter a valid email address.",
        phoneInvalid: "Please enter a valid phone number.",
      },
    },

    convertDialog: {
      title: "Convert Lead to Tenant",
      subtitle: "Provision a new tenant account for this prospect.",
      editionId: "Edition",
      editionPlaceholder: "Select an edition (optional override)\u2026",
      editionHint: "Leave blank to use the edition from the lead\u2019s plan interest.",
      tenantCode: "Tenant Slug (optional)",
      tenantCodePlaceholder: "acme-corp",
      tenantCodeHint: "Auto-generated from company name if blank.",
      adminEmail: "Admin Email (optional)",
      adminEmailPlaceholder: "ceo@acme.com",
      adminEmailHint: "Defaults to the lead\u2019s email.",
      subscriptionType: "Subscription Type",
      subscriptionMonthly: "Monthly",
      subscriptionYearly: "Yearly",
      subscriptionLifetime: "Lifetime",
      currency: "Currency",
      conversionNote: "Conversion Note (optional)",
      conversionNotePlaceholder: "Add a note about this conversion\u2026",
      cancel: "Cancel",
      convert: "Convert to Tenant",
      converting: "Converting\u2026",
      successTitle: "Lead Converted!",
      successMessage: "Tenant provisioned. Setup email sent to {{email}}.",
      errorTitle: "Conversion Failed",
      warning: {
        title: "Edition Warning",
        message:
          "Edition assignment had an issue: {{error}}. Tenant was created but may need manual plan setup.",
      },
      negotiatedPrice: {
        toggle: "Custom Deal Price",
        toggleHint: "Override the standard edition price for this enterprise deal.",
        amount: "Agreed Amount",
        currency: "Deal Currency",
        warning:
          "This overrides standard catalog pricing. The subscription will be marked as a custom negotiated deal.",
        amountRequired: "Please enter the agreed deal amount.",
        amountInvalid: "Amount must be a positive number.",
      },
    },

    assignDialog: {
      title: "Assign Lead",
      subtitle: "Assign this lead to an admin for follow-up.",
      adminId: "Assign to Admin",
      adminPlaceholder: "Search username, email, or name...",
      adminSearchPlaceholder: "Type to search admins...",
      noAdminsFound: "No active admins found.",
      searchingAdmins: "Searching admins...",
      platformScope: "Platform admin",
      adminIdHint: "Only active admins in your accessible organization scope are shown.",
      currentlyAssigned: "This lead is already assigned to an admin.",
      unassign: "Unassign",
      note: "Note (optional)",
      notePlaceholder: "Reason for assignment…",
      cancel: "Cancel",
      assign: "Assign",
      assigning: "Assigning…",
      success: "Lead assigned successfully.",
    },

    note: {
      sectionTitle: "Add Note",
      placeholder: "Write a CRM note…",
      save: "Add Note",
      saving: "Saving…",
      saved: "✓ Note added",
      added: "Note added to timeline.",
      error: "Failed to add note. Please try again.",
    },

    activity: {
      title: "Activity Timeline",
      empty: "No activity recorded yet.",
      types: {
        Submitted: "Submitted",
        StatusChanged: "Status Changed",
        NoteAdded: "Note Added",
        Assigned: "Assigned",
        Converted: "Converted",
        Closed: "Closed",
        EmailSent: "Email Sent",
      },
      by: "by {{actor}}",
      system: "System",
    },

    actions: {
      delete: "Delete",
      deleteConfirm: "Close this lead?",
      deleteSuccess: "Lead closed.",
      convert: "Convert to Tenant",
      assign: "Assign",
      viewActivity: "Activity",
      statusUpdateError: "Could not update lead status. Refresh and try again.",
      tableView: "Table view",
      kanbanView: "Kanban view",
    },

    bulk: {
      // Floating bar
      selectedCount: "{{count}} selected",
      closeSelected: "Close {{count}}",
      deleteSelected: "Delete {{count}}",
      clearSelection: "Clear selection",
      selectAll: "Select all leads on this page",
      selectRow: "Select {{company}}",
      closing: "Closing…",
      processing: "Processing…",

      // Confirmation dialog — Close
      confirmCloseTitle: "Close {{count}} leads?",
      confirmCloseDesc:
        "These leads will be marked as Closed. Converted leads will be skipped automatically.",
      confirmClose: "Close leads",

      // Confirmation dialog — Delete
      confirmDeleteTitle: "Delete {{count}} leads?",
      confirmDeleteDesc:
        "This will permanently soft-delete the selected leads. This action cannot be undone.",
      confirmDelete: "Delete leads",

      cancel: "Cancel",

      // Toast messages
      closeSuccess: "Bulk close complete",
      closeError: "Failed to close leads. Please try again.",
      deleteSuccess: "{{count}} leads deleted.",
      deleteError: "Failed to delete some leads. Please try again.",
      toastUpdated: "{{count}} updated",
      toastSkipped: "{{count}} skipped",
      toastNotFound: "{{count}} not found",

      // Internal notes appended to activity log
      closedNote: "Bulk closed by admin",
      deletedNote: "Bulk deleted by admin",
    },

    email: {
      send:                   "Send Email",
      dialogTitle:            "Send Email to Lead",
      dialogSubtitle:         "Compose a branded email to {email}",
      template:               "Template",
      templateCustom:         "Custom (Freeform)",
      templateInitialContact: "Initial Contact",
      templateFollowUp:       "Follow Up",
      templateDemoInvitation: "Demo Invitation",
      subject:                "Subject",
      subjectPlaceholder:     "Enter email subject...",
      body:                   "Message Body",
      bodyPlaceholder:        "Write your message here. HTML is supported.",
      bodyHint:               "HTML formatting supported. Email will be rendered with SCRIPE branding.",
      sending:                "Sending...",
      cancel:                 "Cancel",
      sentSuccess:            "Email sent successfully",
      sendError:              "Failed to send email. Please try again.",
      communicationsTitle:    "Sent Emails",
      noEmailsSent:           "No emails sent to this lead yet.",
      sentBy:                 "Sent by",
      failed:                 "Failed",
    },
  },
};
