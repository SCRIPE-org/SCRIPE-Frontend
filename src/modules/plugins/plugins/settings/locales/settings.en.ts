/**
 * Plugins — Settings sub-module locale (English)
 */
export const en = {
  plugins: {
    settingsError: "Failed to load plugin settings.",
    settingsNoUi: "This plugin has no settings UI.",
    settingsSaved: "Settings saved successfully.",
    settingsSaveError: "Failed to save settings.",
    // Dynamic settings form — the field label is supplied by the plugin's own
    // JSON Schema, so these messages interpolate it rather than naming a field.
    settingsFieldRequired: "{{label}} is required.",
    settingsFieldMin: "{{label}} must be at least {{min}}.",
    settingsFieldMax: "{{label}} must be at most {{max}}.",
    settingsFieldSelectPlaceholder: "Select {{label}}",
  },
};
