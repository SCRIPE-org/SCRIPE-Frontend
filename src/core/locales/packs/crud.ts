/**
 * CRUD engine copy — the strings the generic CRUD surfaces render themselves.
 *
 * The engine drives ~120 list/create/edit screens, so any sentence it composes
 * at runtime is a sentence shipped 120 times. The create/edit modal copy used
 * to be built in JavaScript from an English template and the page title
 * (`Add a new ${title.toLowerCase()} below.`), which produced untranslated —
 * and usually ungrammatical — copy in the Arabic build. The entity is a
 * parameter here so each language owns its own word order.
 *
 * Registered by name in `packs/index.ts`. Both languages ship in the same
 * edit; an EN-only key is a shipped defect in a bilingual product.
 */

export const en = {
  crud: {
    modal: {
      createTitle: "Add {entity}",
      createDescription: "Complete the fields below to add a new {entity}.",
      editTitle: "Edit {entity}",
      editDescription: "Update the fields below to change this {entity}.",
      viewTitle: "View {entity}",
      /** Fallback for a modal opened without its own description. */
      formDescription: "Complete the fields below.",
    },
    confirm: {
      /**
       * The engine's own delete prompt. It exists alongside
       * `common.deleteConfirmation` because that key's Arabic side carries no
       * `{name}` placeholder, so the record being deleted vanished from the
       * sentence in the Arabic build.
       */
      deleteItem: "Are you sure you want to delete {name}?",
      /** `action` is the action's own already-translated label. */
      itemAction: "Are you sure you want to {action} {name}?",
      bulkAction: "Are you sure you want to {action} {count} items?",
      globalAction: "Are you sure you want to {action}?",
      selectionLabel: "{count} items",
      allItems: "all items",
    },
  },
};

export const ar = {
  crud: {
    modal: {
      createTitle: "إضافة {entity}",
      createDescription: "أكمل الحقول أدناه لإضافة {entity}.",
      editTitle: "تعديل {entity}",
      editDescription: "حدّث الحقول أدناه لتعديل {entity}.",
      viewTitle: "عرض {entity}",
      formDescription: "أكمل الحقول أدناه.",
    },
    confirm: {
      deleteItem: "هل أنت متأكد من حذف {name}؟",
      itemAction: "هل أنت متأكد من رغبتك في {action} {name}؟",
      bulkAction: "هل أنت متأكد من رغبتك في {action} {count} عنصر؟",
      globalAction: "هل أنت متأكد من رغبتك في {action}؟",
      selectionLabel: "{count} عنصر",
      allItems: "كل العناصر",
    },
  },
};
