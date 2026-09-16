export const en = {
  schemaImport: {
    // The header action that opens the dialog, and the dialog's own title.
    openLabel: "Import schema",
    title: "Import custom-field schema",
    description:
      "Upload a portable JSON schema file — the exact file the export action beside this one produces — to create the field groups and fields it describes that don't already exist here.",

    // The collision policy, stated plainly before anyone uploads anything: it is the one fact that
    // changes what a person should expect from this action.
    collisionNote:
      "A field group whose key already exists here is left untouched and reported as Skipped — nothing is ever overwritten.",

    dropZoneLabel: "Drop a schema file here, or choose one",
    dropZoneHint: "JSON file, in the shape this module's own schema export produces.",
    chooseFile: "Choose file",
    changeFile: "Choose a different file",
    removeFile: "Remove file",

    // The three ways a picked file can be wrong before any request is made.
    pickError: {
      notJson: "That file isn't valid JSON. Choose the file the schema export action produced.",
      notABundle:
        "That file doesn't look like a schema bundle — it's missing the fields a schema file always has (formatVersion, groups, definitions).",
      couldNotRead: "Couldn't read that file. Choose it again, or try a different one.",
    },

    importAction: "Import",
    importing: "Importing…",

    // The item-count REFUSAL (groups plus definitions combined). Not a failure: the server refused
    // rather than importing part of the file, so the remedy is to split it, not to retry as-is.
    refused: {
      title: "Import refused — file too large",
      description:
        "This file describes more than {max} groups and fields combined, and the import was refused rather than only partly applied. Split it into smaller files (for example, by re-exporting one entity type at a time) and import each separately.",
    },

    // Column headers for the per-group breakdown table. "Group key" rather than "stable key" --
    // the wire name is machine vocabulary an admin reading a report shouldn't need to know.
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

    // The one-line summary above the table -- never a substitute for the table itself, which is
    // why every row still renders regardless of what this says.
    summary: "{created} created, {skipped} skipped, {failed} failed.",

    // The file named groups and every single one was either skipped or failed -- distinct from the
    // "described no groups at all" empty state below, because the remedy differs (fix the listed
    // problems vs. there was nothing to import in the first place).
    allSkippedOrFailed:
      "None of the groups in this file were created. See the reason on each row below.",

    // The file itself named zero groups.
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
