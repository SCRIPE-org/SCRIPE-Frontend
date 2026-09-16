export const en = {
  schemaExport: {
    // The header action that opens the dialog, and the dialog's own title.
    openLabel: "Export schema",
    title: "Export custom-field schema",
    // Says what the file is FOR, because "export" alone reads as "a spreadsheet of my fields" --
    // which is the neighbouring feature, not this one.
    description:
      "Download a portable JSON file describing your custom fields and field groups, ready to re-import into another environment. It contains no stored values.",

    // The scope picker.
    entityType: "Entity Type",
    entityTypePlaceholder: "All entity types",
    allEntityTypes: "All entity types",
    entityTypeHint:
      "Pick one entity type to export just its fields, or leave this on all entity types for a complete bundle.",

    // Spells out what the file omits, because someone exporting a schema in order to migrate data
    // will otherwise assume the values came with it.
    contents:
      "The file lists field definitions and groups only — no stored values, no record data, and no organisation identifiers. Fields you don't have access to are left out.",

    exportAction: "Export",
    exporting: "Exporting…",

    // Shown after a successful export, so the number in the file can be checked against
    // expectations before it is handed to another environment.
    result: "Exported {definitions} field definitions and {groups} field groups.",

    // An empty result has two causes that look identical from the client and read very differently
    // to the person who asked, so both are named rather than guessed at.
    empty: {
      title: "Nothing to export",
      description:
        "This scope has no field definitions and no field groups — or every field in it is one your role can't see. No file was downloaded.",
    },

    // The server's format version is one this app doesn't know. The file is still handed over
    // unchanged; the warning exists so nobody assumes this app validated it.
    unsupportedVersion: {
      title: "Newer schema format",
      description:
        "This server produced format version {version}, which this app doesn't recognise. The file was downloaded exactly as received and hasn't been checked.",
    },

    loadFailed: "Couldn't load the entity types.",

    toast: {
      exported: "Schema exported.",
      exportFailed: "Couldn't export the schema.",
      nothingToExport: "There was nothing to export for this scope.",
    },
  },
};
