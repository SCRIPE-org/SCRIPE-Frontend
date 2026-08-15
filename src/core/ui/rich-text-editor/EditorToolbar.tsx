"use client";

import { useCallback } from "react";
import { Separator } from "@core/ui/separator";
import { useI18n } from "@core/providers/i18n-provider";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Undo,
  Redo,
  Palette,
  Highlighter,
  Code2,
  Subscript as SubIcon,
  Superscript as SupIcon,
  Braces,
} from "lucide-react";
import type { Editor } from "@tiptap/react";
import type { VariableDefinition } from "./VariablePicker";
import { ToolbarButton } from "./ToolbarButton";
import { EditorColorPicker, type EditorSwatch } from "./EditorColorPicker";
import { LinkPopover } from "./LinkPopover";
import { ImageInsert } from "./ImageInsert";
import { HeadingDropdown } from "./HeadingDropdown";
import { VariablePicker } from "./VariablePicker";
import { ButtonDesigner } from "./ButtonDesigner";
import { SocialBlock } from "./SocialBlock";

// ─── Colour presets ─────────────────────────────────────────
// Every offered colour is a token EXPRESSION, never a literal. Two families,
// because a colour picker needs both kinds of answer:
//
//   role   the ink ladder, the workspace accent and the four measured status
//          tokens — "the default body colour", "a warning", "the accent"
//   hue    the eight global --chart-* slots, which exist precisely to be a
//          fixed, CVD-checked set of distinguishable hues
//
// Both follow the active theme, which is the point: a mid-grey frozen as a hex
// literal while the author worked in light mode turns into unreadable
// near-black the moment the same document is opened in dark mode.
// COLOUR EXCEPTION — document content, not product chrome.
//
// These values are written into the authored document's inline styles, and this
// editor authors EMAIL: the message composer and the notification templates both
// mount it. Mail clients do not resolve CSS custom properties, and most strip
// `color-mix()`, so a token expression here reaches the recipient as no colour at
// all — the author picks red, the subscriber reads black. The palette is
// therefore literal, self-contained sRGB hex, chosen to stay legible on the white
// ground every mail client composites against.
//
// The product chrome around these swatches is fully tokenised; only the values
// that travel inside the document are fixed.
const SWATCH = "editor.toolbar.color.swatch";

const TEXT_COLORS: readonly EditorSwatch[] = [
  { value: "#111827", labelKey: `${SWATCH}.default` },
  { value: "#4B5563", labelKey: `${SWATCH}.muted` },
  { value: "#9CA3AF", labelKey: `${SWATCH}.subtle` },
  { value: "#7C3AED", labelKey: `${SWATCH}.violet` },
  { value: "#DC2626", labelKey: `${SWATCH}.red` },
  { value: "#D97706", labelKey: `${SWATCH}.orange` },
  { value: "#059669", labelKey: `${SWATCH}.green` },
  { value: "#2563EB", labelKey: `${SWATCH}.blue` },
  { value: "#0891B2", labelKey: `${SWATCH}.cyan` },
  { value: "#65A30D", labelKey: `${SWATCH}.deepGreen` },
  { value: "#DB2777", labelKey: `${SWATCH}.magenta` },
  { value: "#CA8A04", labelKey: `${SWATCH}.yellow` },
];

// A highlight sits BEHIND text that must stay readable, so each hue ships as a
// pale tint rather than at full strength. These are opaque rather than alpha:
// several mail clients drop `rgba()` in inline styles, which would silently
// remove the highlight instead of lightening it.
const HIGHLIGHT_COLORS: readonly EditorSwatch[] = [
  { value: "#FEF08A", labelKey: `${SWATCH}.yellow` },
  { value: "#BBF7D0", labelKey: `${SWATCH}.green` },
  { value: "#BFDBFE", labelKey: `${SWATCH}.blue` },
  { value: "#FBCFE8", labelKey: `${SWATCH}.magenta` },
  { value: "#FED7AA", labelKey: `${SWATCH}.orange` },
  { value: "#DDD6FE", labelKey: `${SWATCH}.violet` },
  { value: "#FECACA", labelKey: `${SWATCH}.red` },
  { value: "#D9F99D", labelKey: `${SWATCH}.deepGreen` },
];

// ─── Types ──────────────────────────────────────────────────
export interface EditorToolbarProps {
  editor: Editor;
  variables?: VariableDefinition[];
  onImageUpload?: (file: File) => Promise<string>;
  showSourceToggle?: boolean;
  sourceMode: boolean;
  onToggleSource: () => void;
}

// ─── Component ──────────────────────────────────────────────
export function EditorToolbar({
  editor,
  variables,
  onImageUpload,
  showSourceToggle,
  sourceMode,
  onToggleSource,
}: EditorToolbarProps) {
  const { t } = useI18n();

  const insertVariable = useCallback(
    (variable: string) => {
      editor.chain().focus().insertContent(variable).run();
    },
    [editor]
  );

  const insertHtmlBlock = useCallback(
    (attrs: { html: string; label?: string; blockType?: string }) => {
      editor.chain().focus().insertEmailHtmlBlock(attrs).run();
    },
    [editor]
  );

  return (
    // role="group", not role="toolbar": the toolbar role promises arrow-key
    // roving focus, and promising it without implementing it is worse for a
    // keyboard user than plain tab order. The name still gives every button
    // inside it a context to be announced in.
    <div
      role="group"
      aria-label={t("editor.toolbar.label")}
      className="flex flex-wrap items-center gap-0.5 border-b border-nx-line bg-nx-raised p-1.5"
    >
      {/* Text Style */}
      <HeadingDropdown editor={editor} />
      <Separator orientation="vertical" className="mx-0.5 h-6" />

      {/* Basic Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title={t("editor.toolbar.bold")}
      >
        <Bold className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title={t("editor.toolbar.italic")}
      >
        <Italic className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title={t("editor.toolbar.underline")}
      >
        <UnderlineIcon className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title={t("editor.toolbar.strikethrough")}
      >
        <Strikethrough className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        active={editor.isActive("subscript")}
        title={t("editor.toolbar.subscript")}
      >
        <SubIcon className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        active={editor.isActive("superscript")}
        title={t("editor.toolbar.superscript")}
      >
        <SupIcon className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-0.5 h-6" />

      {/* Colors */}
      <EditorColorPicker
        swatches={TEXT_COLORS}
        currentColor={editor.getAttributes("textStyle").color}
        onSelect={(color) => editor.chain().focus().setColor(color).run()}
        icon={<Palette className="h-4 w-4" aria-hidden="true" />}
        label={t("editor.toolbar.color.text")}
      />
      <EditorColorPicker
        swatches={HIGHLIGHT_COLORS}
        currentColor={editor.getAttributes("highlight").color}
        onSelect={(color) => editor.chain().focus().toggleHighlight({ color }).run()}
        icon={<Highlighter className="h-4 w-4" aria-hidden="true" />}
        label={t("editor.toolbar.color.highlight")}
      />

      <Separator orientation="vertical" className="mx-0.5 h-6" />

      {/* Alignment — the glyphs stay PHYSICAL on purpose. They describe where
          the authored paragraph sits in the rendered document, which does not
          change because the editing UI is running in Arabic; mirroring them
          would make "align left" produce a right-aligned email. */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
        title={t("editor.toolbar.align.left")}
      >
        <AlignLeft className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
        title={t("editor.toolbar.align.center")}
      >
        <AlignCenter className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
        title={t("editor.toolbar.align.right")}
      >
        <AlignRight className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        active={editor.isActive({ textAlign: "justify" })}
        title={t("editor.toolbar.align.justify")}
      >
        <AlignJustify className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-0.5 h-6" />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title={t("editor.toolbar.list.bullet")}
      >
        <List className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title={t("editor.toolbar.list.numbered")}
      >
        <ListOrdered className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-0.5 h-6" />

      {/* Insert */}
      <LinkPopover editor={editor} />
      <ImageInsert editor={editor} onUpload={onImageUpload} />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title={t("editor.toolbar.blockquote")}
      >
        <Quote className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        title={t("editor.toolbar.inlineCode")}
      >
        <Code className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        title={t("editor.toolbar.codeBlock")}
      >
        <Code2 className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title={t("editor.toolbar.divider")}
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>

      {/* Variable Picker */}
      {variables && variables.length > 0 && (
        <>
          <Separator orientation="vertical" className="mx-0.5 h-6" />
          <VariablePicker variables={variables} onInsert={insertVariable} />
        </>
      )}

      {/* CTA Button & Social */}
      <Separator orientation="vertical" className="mx-0.5 h-6" />
      <ButtonDesigner onInsert={insertHtmlBlock} />
      <SocialBlock onInsert={insertHtmlBlock} />

      {/* Right side: Source + Undo/Redo */}
      <div className="flex-1" />

      {showSourceToggle && (
        <ToolbarButton
          onClick={onToggleSource}
          active={sourceMode}
          title={t("editor.toolbar.source")}
        >
          <Braces className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>
      )}

      <Separator orientation="vertical" className="mx-0.5 h-6" />

      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title={t("editor.toolbar.undo")}
      >
        <Undo className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title={t("editor.toolbar.redo")}
      >
        <Redo className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
    </div>
  );
}
