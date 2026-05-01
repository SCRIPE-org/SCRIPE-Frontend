"use client";

import { useCallback } from "react";
import { Separator } from "@core/ui/separator";
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
import { EditorColorPicker } from "./EditorColorPicker";
import { LinkPopover } from "./LinkPopover";
import { ImageInsert } from "./ImageInsert";
import { HeadingDropdown } from "./HeadingDropdown";
import { VariablePicker } from "./VariablePicker";
import { ButtonDesigner } from "./ButtonDesigner";
import { SocialBlock } from "./SocialBlock";

// ─── Color Presets ──────────────────────────────────────────
const PRESET_COLORS = [
  "#000000",
  "#374151",
  "#6b7280",
  "#9ca3af",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
  "#f43f5e",
  "#ffffff",
];

const HIGHLIGHT_COLORS = [
  "#fef08a",
  "#bbf7d0",
  "#bfdbfe",
  "#fbcfe8",
  "#fed7aa",
  "#c4b5fd",
  "#e0e7ff",
  "#fce7f3",
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
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 p-1.5">
      {/* Text Style */}
      <HeadingDropdown editor={editor} />
      <Separator orientation="vertical" className="mx-0.5 h-6" />

      {/* Basic Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        active={editor.isActive("subscript")}
        title="Subscript"
      >
        <SubIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        active={editor.isActive("superscript")}
        title="Superscript"
      >
        <SupIcon className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-0.5 h-6" />

      {/* Colors */}
      <EditorColorPicker
        colors={PRESET_COLORS}
        currentColor={editor.getAttributes("textStyle").color}
        onSelect={(color) => editor.chain().focus().setColor(color).run()}
        icon={<Palette className="h-4 w-4" />}
        title="Text Color"
      />
      <EditorColorPicker
        colors={HIGHLIGHT_COLORS}
        currentColor={editor.getAttributes("highlight").color}
        onSelect={(color) => editor.chain().focus().toggleHighlight({ color }).run()}
        icon={<Highlighter className="h-4 w-4" />}
        title="Highlight"
      />

      <Separator orientation="vertical" className="mx-0.5 h-6" />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        active={editor.isActive({ textAlign: "justify" })}
        title="Justify"
      >
        <AlignJustify className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-0.5 h-6" />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-0.5 h-6" />

      {/* Insert */}
      <LinkPopover editor={editor} />
      <ImageInsert editor={editor} onUpload={onImageUpload} />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        title="Inline Code"
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        title="Code Block"
      >
        <Code2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Divider"
      >
        <Minus className="h-4 w-4" />
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
        <ToolbarButton onClick={onToggleSource} active={sourceMode} title="HTML Source">
          <Braces className="h-4 w-4" />
        </ToolbarButton>
      )}

      <Separator orientation="vertical" className="mx-0.5 h-6" />

      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Ctrl+Z)"
      >
        <Undo className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Ctrl+Y)"
      >
        <Redo className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}
