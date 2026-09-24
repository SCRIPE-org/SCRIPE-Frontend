export const en = {
  schemaExport: {
    openLabel: "Export schema",
    title: "Export custom-field schema",
    description:
      "Download a portable JSON file describing your custom fields and field groups, ready to re-import into another environment. It contains no stored values.",
    entityType: "Entity Type",
    entityTypePlaceholder: "All entity types",
    allEntityTypes: "All entity types",
    entityTypeHint:
      "Pick one entity type to export just its fields, or leave this on all entity types for a complete bundle.",
    contents:
      "The file lists field definitions and groups only — no stored values, no record data, and no organisation identifiers. Fields you don't have access to are left out.",
    exportAction: "Export",
    exporting: "Exporting…",
    result: "Exported {definitions} field definitions and {groups} field groups.",
    empty: {
      title: "Nothing to export",
      description:
        "This scope has no field definitions and no field groups — or every field in it is one your role can't see. No file was downloaded.",
    },
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
  schemaImport: {
    openLabel: "Import schema",
    title: "Import custom-field schema",
    description:
      "Upload a portable JSON schema file — the exact file the export action beside this one produces — to create the field groups and fields it describes that don't already exist here.",
    collisionNote:
      "A field group whose key already exists here is left untouched and reported as Skipped — nothing is ever overwritten.",
    dropZoneLabel: "Drop a schema file here, or choose one",
    dropZoneHint: "JSON file, in the shape this module's own schema export produces.",
    chooseFile: "Choose file",
    changeFile: "Choose a different file",
    removeFile: "Remove file",
    pickError: {
      notJson: "That file isn't valid JSON. Choose the file the schema export action produced.",
      notABundle:
        "That file doesn't look like a schema bundle — it's missing the fields a schema file always has (formatVersion, groups, definitions).",
      couldNotRead: "Couldn't read that file. Choose it again, or try a different one.",
    },
    importAction: "Import",
    importing: "Importing…",
    refused: {
      title: "Import refused — file too large",
      description:
        "This file describes more than {max} groups and fields combined, and the import was refused rather than only partly applied. Split it into smaller files (for example, by re-exporting one entity type at a time) and import each separately.",
    },
    table: {
      entityType: "Entity Type",
      groupKey: "Group Key",
      outcome: "Result",
      fieldsCreated: "Fields Created",
      reason: "Reason",
    },
    outcome: {
      created: "Created",
      skipped: "Skipped",
      failed: "Failed",
    },
    summary: "{created} created, {skipped} skipped, {failed} failed.",
    allSkippedOrFailed:
      "None of the groups in this file were created. See the reason on each row below.",
    emptyBundle: {
      title: "Nothing to import",
      description: "This file described no field groups, so nothing was created.",
    },
    toast: {
      imported: "Imported: {created} created, {skipped} skipped, {failed} failed.",
      importFailed: "Couldn't import the schema.",
      nothingToImport: "This file described no field groups, so nothing was imported.",
    },
  },
};
