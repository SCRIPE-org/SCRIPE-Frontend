// ─── Main component ─────────────────────────────────────────
export { RichTextEditor, type RichTextEditorProps } from "./RichTextEditor";

// ─── Sub-components ─────────────────────────────────────────
export { EditorToolbar, type EditorToolbarProps } from "./EditorToolbar";
export { ToolbarButton, type ToolbarButtonProps } from "./ToolbarButton";
export { EditorColorPicker, type EditorColorPickerProps } from "./EditorColorPicker";
export { LinkPopover } from "./LinkPopover";
export { ImageInsert } from "./ImageInsert";
export { HeadingDropdown } from "./HeadingDropdown";

// ─── Feature components ─────────────────────────────────────
export {
      VariablePicker,
      DEFAULT_VARIABLES,
      type VariableDefinition,
      type VariableCategory,
      type VariablePickerProps,
} from "./VariablePicker";
export { ColorPickerField, type ColorPickerFieldProps } from "./ColorPickerField";
export { ButtonDesigner, type ButtonDesignerProps } from "./ButtonDesigner";
export { SocialBlock, type SocialBlockProps } from "./SocialBlock";
