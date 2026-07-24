// Locale pack — select, combobox and multi-select primitives.
// Owns their placeholders, search prompts, no-result copy and selection
// counters. These sit in @core/ui, so a missing key here shows up everywhere
// at once.
//
// The visible copy (placeholder, "no results", "searching", "select all") has
// always lived under `components.*` in the shared dictionary and stays there —
// moving it would break every caller that overrides it by prop. What lands
// here is the copy the select had NONE of: the accessible names for its
// icon-only controls. Every one of them was an unnamed <button> or an
// unlabelled combobox, announced as bare "button" in both languages.

export const en = {
  select: {
    chip: {
      /** `label` is the option's own already-localised label. */
      remove: "Remove {label}",
    },
    /** The filter field inside the panel; its placeholder is caller-supplied. */
    searchLabel: "Search options",
    /** The listbox itself, so the option count is announced on open. */
    optionsLabel: "Options",
    /** Tree-select disclosure control, in both directions. */
    expandGroup: "Expand {label}",
    collapseGroup: "Collapse {label}",
  },
} as const;

export const ar = {
  select: {
    chip: {
      remove: "إزالة {label}",
    },
    searchLabel: "البحث في الخيارات",
    optionsLabel: "الخيارات",
    expandGroup: "توسيع {label}",
    collapseGroup: "طي {label}",
  },
} as const;
