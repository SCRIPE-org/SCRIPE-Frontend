"use client";

import React, { useCallback, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import ImageExtension from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import CharacterCount from "@tiptap/extension-character-count";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
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
      Heading1,
      Heading2,
      Heading3,
      Link as LinkIcon,
      ImageIcon,
      Code,
      Quote,
      Minus,
      Undo,
      Redo,
      Palette,
      Highlighter,
      Code2,
      Subscript as SubIcon,
      Superscript as SupIcon,
      Type,
      Braces,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import { Separator } from "@core/ui/separator";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import {
      Tooltip,
      TooltipContent,
      TooltipProvider,
      TooltipTrigger,
} from "@core/ui/tooltip";
import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { ButtonDesigner } from "./ButtonDesigner";
import { SocialBlock } from "./SocialBlock";
import VariablePicker, { VariableDefinition } from "./VariablePicker";

// ─── Types ──────────────────────────────────────────────────
export interface RichTextEditorProps {
      value: string;
      onChange: (html: string) => void;
      placeholder?: string;
      maxLength?: number;
      minHeight?: string | number;
      className?: string;
      /** Available template variables for variable picker */
      variables?: VariableDefinition[];
      /** Enable image upload — provide handler that returns URL */
      onImageUpload?: (file: File) => Promise<string>;
      /** Show/hide HTML source toggle */
      showSourceToggle?: boolean;
      /** Error state */
      error?: boolean;
      /** Read-only mode */
      readOnly?: boolean;
}

// ─── Preset Colors ──────────────────────────────────────────
const PRESET_COLORS = [
      "#000000", "#374151", "#6b7280", "#9ca3af",
      "#ef4444", "#f97316", "#eab308", "#22c55e",
      "#14b8a6", "#3b82f6", "#6366f1", "#8b5cf6",
      "#a855f7", "#ec4899", "#f43f5e", "#ffffff",
];

const HIGHLIGHT_COLORS = [
      "#fef08a", "#bbf7d0", "#bfdbfe", "#fbcfe8",
      "#fed7aa", "#c4b5fd", "#e0e7ff", "#fce7f3",
];

// ─── Toolbar Button ─────────────────────────────────────────
function ToolbarButton({
      onClick,
      active,
      disabled,
      title,
      children,
}: {
      onClick: () => void;
      active?: boolean;
      disabled?: boolean;
      title: string;
      children: React.ReactNode;
}) {
      return (
            <TooltipProvider delayDuration={300}>
                  <Tooltip>
                        <TooltipTrigger asChild>
                              <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                          "h-8 w-8 p-0",
                                          active && "bg-accent text-accent-foreground"
                                    )}
                                    onClick={onClick}
                                    disabled={disabled}
                              >
                                    {children}
                              </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                              {title}
                        </TooltipContent>
                  </Tooltip>
            </TooltipProvider>
      );
}

// ─── Color Picker Popover ───────────────────────────────────
function ColorPicker({
      colors,
      currentColor,
      onSelect,
      icon,
      title,
}: {
      colors: string[];
      currentColor?: string;
      onSelect: (color: string) => void;
      icon: React.ReactNode;
      title: string;
}) {
      const [custom, setCustom] = useState("");

      return (
            <Popover>
                  <PopoverTrigger asChild>
                        <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 relative"
                              title={title}
                        >
                              {icon}
                              {currentColor && (
                                    <span
                                          className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-4 rounded-full"
                                          style={{ backgroundColor: currentColor }}
                                    />
                              )}
                        </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-52 p-3" align="start">
                        <div className="grid grid-cols-8 gap-1 mb-2">
                              {colors.map((c) => (
                                    <button
                                          key={c}
                                          type="button"
                                          className={cn(
                                                "h-5 w-5 rounded-sm border border-border hover:scale-110 transition-transform",
                                                currentColor === c && "ring-2 ring-primary ring-offset-1"
                                          )}
                                          style={{ backgroundColor: c }}
                                          onClick={() => onSelect(c)}
                                    />
                              ))}
                        </div>
                        <Separator className="my-2" />
                        <div className="flex gap-1.5 items-center">
                              <Input
                                    value={custom}
                                    onChange={(e) => setCustom(e.target.value)}
                                    placeholder="#hex"
                                    className="h-7 text-xs font-mono"
                              />
                              <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs px-2"
                                    onClick={() => {
                                          if (custom.startsWith("#") && custom.length >= 4) {
                                                onSelect(custom);
                                          }
                                    }}
                              >
                                    Apply
                              </Button>
                        </div>
                  </PopoverContent>
            </Popover>
      );
}

// ─── Link Dialog ────────────────────────────────────────────
function LinkPopover({ editor }: { editor: Editor }) {
      const [url, setUrl] = useState("");
      const [open, setOpen] = useState(false);

      const handleApply = () => {
            if (url) {
                  editor
                        .chain()
                        .focus()
                        .extendMarkRange("link")
                        .setLink({ href: url, target: "_blank" })
                        .run();
            } else {
                  editor.chain().focus().unsetLink().run();
            }
            setOpen(false);
            setUrl("");
      };

      return (
            <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                        <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className={cn(
                                    "h-8 w-8 p-0",
                                    editor.isActive("link") && "bg-accent text-accent-foreground"
                              )}
                              onClick={() => {
                                    const existing = editor.getAttributes("link").href;
                                    setUrl(existing || "");
                                    setOpen(true);
                              }}
                              title="Link"
                        >
                              <LinkIcon className="h-4 w-4" />
                        </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-3" align="start">
                        <div className="space-y-2">
                              <Label className="text-xs">URL</Label>
                              <Input
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="h-8 text-sm"
                                    onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleApply();
                                          }
                                    }}
                              />
                              <div className="flex gap-1.5 justify-end">
                                    {editor.isActive("link") && (
                                          <Button
                                                type="button"
                                                size="sm"
                                                variant="destructive"
                                                className="h-7 text-xs"
                                                onClick={() => {
                                                      editor.chain().focus().unsetLink().run();
                                                      setOpen(false);
                                                }}
                                          >
                                                Remove
                                          </Button>
                                    )}
                                    <Button
                                          type="button"
                                          size="sm"
                                          className="h-7 text-xs"
                                          onClick={handleApply}
                                    >
                                          Apply
                                    </Button>
                              </div>
                        </div>
                  </PopoverContent>
            </Popover>
      );
}

// ─── Image Insert ───────────────────────────────────────────
function ImageInsert({
      editor,
      onUpload,
}: {
      editor: Editor;
      onUpload?: (file: File) => Promise<string>;
}) {
      const [url, setUrl] = useState("");
      const [open, setOpen] = useState(false);
      const [uploading, setUploading] = useState(false);
      const fileRef = React.useRef<HTMLInputElement>(null);

      const insertFromUrl = () => {
            if (url) {
                  editor.chain().focus().setImage({ src: url }).run();
                  setUrl("");
                  setOpen(false);
            }
      };

      const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file || !onUpload) return;

            try {
                  setUploading(true);
                  const uploadedUrl = await onUpload(file);
                  editor.chain().focus().setImage({ src: uploadedUrl }).run();
                  setOpen(false);
            } catch {
                  // Error handled by parent
            } finally {
                  setUploading(false);
                  if (fileRef.current) fileRef.current.value = "";
            }
      };

      return (
            <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                        <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Insert Image"
                        >
                              <ImageIcon className="h-4 w-4" />
                        </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-3" align="start">
                        <div className="space-y-3">
                              <div className="space-y-1.5">
                                    <Label className="text-xs">Image URL</Label>
                                    <div className="flex gap-1.5">
                                          <Input
                                                value={url}
                                                onChange={(e) => setUrl(e.target.value)}
                                                placeholder="https://example.com/image.png"
                                                className="h-8 text-sm"
                                          />
                                          <Button
                                                type="button"
                                                size="sm"
                                                className="h-8 text-xs px-2"
                                                onClick={insertFromUrl}
                                                disabled={!url}
                                          >
                                                Insert
                                          </Button>
                                    </div>
                              </div>
                              {onUpload && (
                                    <>
                                          <Separator />
                                          <div className="space-y-1.5">
                                                <Label className="text-xs">Upload Image</Label>
                                                <input
                                                      ref={fileRef}
                                                      type="file"
                                                      accept="image/png,image/jpeg,image/gif,image/svg+xml,image/webp"
                                                      onChange={handleFileUpload}
                                                      className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 w-full"
                                                      disabled={uploading}
                                                />
                                                {uploading && (
                                                      <p className="text-xs text-muted-foreground animate-pulse">
                                                            Uploading...
                                                      </p>
                                                )}
                                          </div>
                                    </>
                              )}
                        </div>
                  </PopoverContent>
            </Popover>
      );
}

// ─── Heading Dropdown ───────────────────────────────────────
function HeadingDropdown({ editor }: { editor: Editor }) {
      const getActiveHeading = () => {
            if (editor.isActive("heading", { level: 1 })) return "H1";
            if (editor.isActive("heading", { level: 2 })) return "H2";
            if (editor.isActive("heading", { level: 3 })) return "H3";
            return "¶";
      };

      return (
            <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                        <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs font-medium min-w-[36px]"
                              title="Text Style"
                        >
                              {getActiveHeading()}
                        </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                        <DropdownMenuItem
                              onClick={() => editor.chain().focus().setParagraph().run()}
                              className={cn(!editor.isActive("heading") && "bg-accent")}
                        >
                              <Type className="h-4 w-4 mr-2" /> Paragraph
                        </DropdownMenuItem>
                        <DropdownMenuItem
                              onClick={() =>
                                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                              }
                              className={cn(
                                    editor.isActive("heading", { level: 1 }) && "bg-accent"
                              )}
                        >
                              <Heading1 className="h-4 w-4 mr-2" /> Heading 1
                        </DropdownMenuItem>
                        <DropdownMenuItem
                              onClick={() =>
                                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                              }
                              className={cn(
                                    editor.isActive("heading", { level: 2 }) && "bg-accent"
                              )}
                        >
                              <Heading2 className="h-4 w-4 mr-2" /> Heading 2
                        </DropdownMenuItem>
                        <DropdownMenuItem
                              onClick={() =>
                                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                              }
                              className={cn(
                                    editor.isActive("heading", { level: 3 }) && "bg-accent"
                              )}
                        >
                              <Heading3 className="h-4 w-4 mr-2" /> Heading 3
                        </DropdownMenuItem>
                  </DropdownMenuContent>
            </DropdownMenu>
      );
}

// ─── Toolbar ────────────────────────────────────────────────
function EditorToolbar({
      editor,
      variables,
      onImageUpload,
      showSourceToggle,
      sourceMode,
      onToggleSource,
}: {
      editor: Editor;
      variables?: VariableDefinition[];
      onImageUpload?: (file: File) => Promise<string>;
      showSourceToggle?: boolean;
      sourceMode: boolean;
      onToggleSource: () => void;
}) {
      const insertVariable = useCallback(
            (variable: string) => {
                  editor.chain().focus().insertContent(variable).run();
            },
            [editor]
      );

      const insertHtmlBlock = useCallback(
            (html: string) => {
                  editor.chain().focus().insertContent(html, { parseOptions: { preserveWhitespace: false } }).run();
            },
            [editor]
      );

      return (
            <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b bg-muted/30">
                  {/* Text Style */}
                  <HeadingDropdown editor={editor} />
                  <Separator orientation="vertical" className="h-6 mx-0.5" />

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

                  <Separator orientation="vertical" className="h-6 mx-0.5" />

                  {/* Colors */}
                  <ColorPicker
                        colors={PRESET_COLORS}
                        currentColor={editor.getAttributes("textStyle").color}
                        onSelect={(color) =>
                              editor.chain().focus().setColor(color).run()
                        }
                        icon={<Palette className="h-4 w-4" />}
                        title="Text Color"
                  />
                  <ColorPicker
                        colors={HIGHLIGHT_COLORS}
                        currentColor={editor.getAttributes("highlight").color}
                        onSelect={(color) =>
                              editor
                                    .chain()
                                    .focus()
                                    .toggleHighlight({ color })
                                    .run()
                        }
                        icon={<Highlighter className="h-4 w-4" />}
                        title="Highlight"
                  />

                  <Separator orientation="vertical" className="h-6 mx-0.5" />

                  {/* Alignment */}
                  <ToolbarButton
                        onClick={() =>
                              editor.chain().focus().setTextAlign("left").run()
                        }
                        active={editor.isActive({ textAlign: "left" })}
                        title="Align Left"
                  >
                        <AlignLeft className="h-4 w-4" />
                  </ToolbarButton>
                  <ToolbarButton
                        onClick={() =>
                              editor.chain().focus().setTextAlign("center").run()
                        }
                        active={editor.isActive({ textAlign: "center" })}
                        title="Align Center"
                  >
                        <AlignCenter className="h-4 w-4" />
                  </ToolbarButton>
                  <ToolbarButton
                        onClick={() =>
                              editor.chain().focus().setTextAlign("right").run()
                        }
                        active={editor.isActive({ textAlign: "right" })}
                        title="Align Right"
                  >
                        <AlignRight className="h-4 w-4" />
                  </ToolbarButton>
                  <ToolbarButton
                        onClick={() =>
                              editor.chain().focus().setTextAlign("justify").run()
                        }
                        active={editor.isActive({ textAlign: "justify" })}
                        title="Justify"
                  >
                        <AlignJustify className="h-4 w-4" />
                  </ToolbarButton>

                  <Separator orientation="vertical" className="h-6 mx-0.5" />

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

                  <Separator orientation="vertical" className="h-6 mx-0.5" />

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
                              <Separator orientation="vertical" className="h-6 mx-0.5" />
                              <VariablePicker
                                    variables={variables}
                                    onInsert={insertVariable}
                              />
                        </>
                  )}

                  {/* CTA Button & Social */}
                  <Separator orientation="vertical" className="h-6 mx-0.5" />
                  <ButtonDesigner onInsert={insertHtmlBlock} />
                  <SocialBlock onInsert={insertHtmlBlock} />

                  {/* Right side: Source + Undo/Redo */}
                  <div className="flex-1" />

                  {showSourceToggle && (
                        <ToolbarButton
                              onClick={onToggleSource}
                              active={sourceMode}
                              title="HTML Source"
                        >
                              <Braces className="h-4 w-4" />
                        </ToolbarButton>
                  )}

                  <Separator orientation="vertical" className="h-6 mx-0.5" />

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

// ─── Main Component ─────────────────────────────────────────
export function RichTextEditor({
      value,
      onChange,
      placeholder = "Start typing...",
      maxLength,
      minHeight = "200px",
      className,
      variables,
      onImageUpload,
      showSourceToggle = true,
      error,
      readOnly = false,
}: RichTextEditorProps) {
      const [sourceMode, setSourceMode] = useState(false);
      const [sourceHtml, setSourceHtml] = useState("");

      const editor = useEditor({
            extensions: [
                  StarterKit.configure({
                        heading: { levels: [1, 2, 3] },
                  }),
                  Underline,
                  TextStyle,
                  Color,
                  Highlight.configure({ multicolor: true }),
                  TextAlign.configure({
                        types: ["heading", "paragraph"],
                  }),
                  ImageExtension.configure({
                        HTMLAttributes: {
                              class: "max-w-full h-auto rounded",
                        },
                  }),
                  Link.configure({
                        openOnClick: false,
                        HTMLAttributes: {
                              class: "text-primary underline cursor-pointer",
                              target: "_blank",
                              rel: "noopener noreferrer",
                        },
                  }),
                  Placeholder.configure({ placeholder }),
                  Subscript,
                  Superscript,
                  ...(maxLength
                        ? [CharacterCount.configure({ limit: maxLength })]
                        : [CharacterCount]),
            ],
            content: value,
            editable: !readOnly,
            onUpdate: ({ editor: e }) => {
                  const html = e.getHTML();
                  onChange(html);
            },
            immediatelyRender: false,
      });

      // Sync external value changes
      React.useEffect(() => {
            if (editor && value !== editor.getHTML()) {
                  editor.commands.setContent(value, { emitUpdate: false });
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [value]);

      const toggleSource = useCallback(() => {
            if (!editor) return;
            if (sourceMode) {
                  // Apply source HTML to editor
                  editor.commands.setContent(sourceHtml, { emitUpdate: false });
                  onChange(sourceHtml);
                  setSourceMode(false);
            } else {
                  // Copy editor HTML to source
                  setSourceHtml(editor.getHTML());
                  setSourceMode(true);
            }
      }, [editor, sourceMode, sourceHtml, onChange]);

      if (!editor) return null;

      const charCount = editor.storage.characterCount?.characters() ?? 0;

      return (
            <div
                  className={cn(
                        "border rounded-lg overflow-hidden bg-background transition-colors",
                        error && "border-destructive",
                        !error && "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
                        className
                  )}
            >
                  {/* Toolbar */}
                  {!readOnly && (
                        <EditorToolbar
                              editor={editor}
                              variables={variables}
                              onImageUpload={onImageUpload}
                              showSourceToggle={showSourceToggle}
                              sourceMode={sourceMode}
                              onToggleSource={toggleSource}
                        />
                  )}

                  {/* Editor / Source */}
                  {sourceMode ? (
                        <textarea
                              value={sourceHtml}
                              onChange={(e) => setSourceHtml(e.target.value)}
                              className="w-full p-4 font-mono text-sm bg-muted/20 border-0 outline-none resize-y"
                              style={{ minHeight }}
                              spellCheck={false}
                        />
                  ) : (
                        <EditorContent
                              editor={editor}
                              className={cn(
                                    "prose prose-sm dark:prose-invert max-w-none px-4 py-3",
                                    "[&_.tiptap]:outline-none [&_.tiptap]:min-h-[var(--editor-min-h)]",
                                    "[&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
                                    "[&_.tiptap_p.is-editor-empty:first-child::before]:text-muted-foreground",
                                    "[&_.tiptap_p.is-editor-empty:first-child::before]:float-left",
                                    "[&_.tiptap_p.is-editor-empty:first-child::before]:h-0",
                                    "[&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none"
                              )}
                              style={
                                    { "--editor-min-h": minHeight } as React.CSSProperties
                              }
                        />
                  )}

                  {/* Footer: Character Count */}
                  {maxLength && (
                        <div className="flex items-center justify-end px-3 py-1.5 border-t bg-muted/20">
                              <span
                                    className={cn(
                                          "text-xs",
                                          charCount > maxLength
                                                ? "text-destructive font-medium"
                                                : "text-muted-foreground"
                                    )}
                              >
                                    {charCount.toLocaleString()}/{maxLength.toLocaleString()}
                              </span>
                        </div>
                  )}
            </div>
      );
}

export default RichTextEditor;
