"use client";

import React, { useCallback, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import ImageExtension from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { cn } from "@core/common/utils";
import type { VariableDefinition } from "./VariablePicker";
import { EditorToolbar } from "./EditorToolbar";
import { EmailHtmlBlock } from "./extensions/EmailHtmlBlock";

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

// ─── Email HTML Serializer ──────────────────────────────────
/**
 * Custom HTML serializer that walks the editor document and replaces
 * emailHtmlBlock wrapper divs with their stored raw HTML content.
 * This is what makes email-safe HTML (tables, buttons, social links)
 * survive the TipTap roundtrip.
 */
function getEmailSafeHTML(editor: ReturnType<typeof useEditor>): string {
      if (!editor) return "";

      // Get standard TipTap HTML
      const html = editor.getHTML();

      // Replace emailHtmlBlock wrappers with their stored raw HTML
      // The wrapper has the pattern: <div data-email-html-block="true" data-email-html="...">...</div>
      const wrapper = document.createElement("div");
      wrapper.innerHTML = html;

      const blocks = wrapper.querySelectorAll('div[data-email-html-block="true"]');
      blocks.forEach((block) => {
            const rawHtml = block.getAttribute("data-email-html") || "";
            if (rawHtml) {
                  const fragment = document.createRange().createContextualFragment(rawHtml);
                  block.replaceWith(fragment);
            }
      });

      return wrapper.innerHTML;
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
                  EmailHtmlBlock,
                  ...(maxLength
                        ? [CharacterCount.configure({ limit: maxLength })]
                        : [CharacterCount]),
            ],
            content: value,
            editable: !readOnly,
            onUpdate: ({ editor: e }) => {
                  const html = getEmailSafeHTML(e);
                  onChange(html);
            },
            immediatelyRender: false,
      });

      // Sync external value changes
      React.useEffect(() => {
            if (editor && value !== getEmailSafeHTML(editor)) {
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
                  setSourceHtml(getEmailSafeHTML(editor));
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
