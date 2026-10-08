/* eslint-disable react-hooks/exhaustive-deps */
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
import { Textarea } from "@core/ui/textarea";
import { useI18n } from "@core/providers/i18n-provider";
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
  /**
   * A11Y FORWARDING — the four props below land on the CONTENTEDITABLE itself,
   * not on the bordered wrapper, and they exist because nothing else can put
   * them there. The thing that takes focus and receives typing is the
   * ProseMirror element TipTap creates inside `<EditorContent>`; a caller can
   * wrap this component in as many labelled divs as it likes and the element the
   * screen reader actually lands on stays a nameless generic `<div>`. TipTap's
   * only channel for attributes on that element is `editorProps.attributes`,
   * which is why these are props here rather than spread props on a wrapper.
   *
   * ADDITIVE AND INERT WHEN OMITTED. Every attribute below is emitted only if
   * its prop was supplied, so a caller that passes none — which is every
   * pre-existing caller — gets byte-identical DOM. Same shape as the
   * `i18nKeyPrefix` prop ColorPickerField grew for the same reason: a core
   * primitive gaining an opt-in seam rather than a second copy of the primitive.
   *
   * Id of the contenteditable, so a sibling `<Label htmlFor>` is real DOM wiring
   * and a host's `aria-describedby` can point at this field.
   */
  id?: string;
  /**
   * Accessible NAME for the editing region. Supplying it also turns on
   * `role="textbox"` and `aria-multiline="true"` on the contenteditable, and the
   * coupling is deliberate rather than convenient: `contenteditable` confers no
   * implicit ARIA role in HTML-AAM, so without a role the region is announced as
   * generic content — but a `role="textbox"` with NO name is worse than a
   * generic div, because it promises a form field and then cannot say which one.
   * So the role arrives with the name or not at all.
   */
  ariaLabel?: string;
  /**
   * Space-separated id list for `aria-describedby` on the contenteditable.
   * COMPOSE rather than overwrite when a host has supplied one of its own —
   * `aria-describedby` is a list, and dropping the host's id silences its error
   * text.
   */
  ariaDescribedBy?: string;
  /**
   * Sets `aria-invalid` on the contenteditable. Separate from `error`, which is
   * purely the visual border state: a caller may want the red edge without
   * announcing invalidity (mid-typing over a length cap, say), and the two were
   * conflated exactly once before being split here.
   */
  ariaInvalid?: boolean;
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
  placeholder,
  maxLength,
  minHeight = "200px",
  className,
  variables,
  onImageUpload,
  showSourceToggle = true,
  error,
  readOnly = false,
  id,
  ariaLabel,
  ariaDescribedBy,
  ariaInvalid,
}: RichTextEditorProps) {
  const { t } = useI18n();
  const [sourceMode, setSourceMode] = useState(false);
  const [sourceHtml, setSourceHtml] = useState("");

  /**
   * Built by omission, not by emitting empty strings: an `aria-label=""` is a
   * name of zero length, which the accname algorithm treats as "author supplied
   * no name" in some engines and as an empty name in others. Absent is the only
   * unambiguous way to say nothing. See `ariaLabel`'s own doc comment for why
   * `role`/`aria-multiline` are gated on the NAME rather than emitted always.
   */
  const editorAttributes: Record<string, string> = {};
  if (id) editorAttributes.id = id;
  if (ariaLabel) {
    editorAttributes.role = "textbox";
    editorAttributes["aria-multiline"] = "true";
    editorAttributes["aria-label"] = ariaLabel;
  }
  if (ariaDescribedBy) editorAttributes["aria-describedby"] = ariaDescribedBy;
  if (ariaInvalid) editorAttributes["aria-invalid"] = "true";

  // The default used to be a hardcoded "Start typing..." baked into the
  // signature, which the Arabic build rendered in English. TipTap reads the
  // option once at construction, so this resolves before the editor is built.
  const resolvedPlaceholder = placeholder ?? t("editor.placeholder");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
        underline: false,
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
          class: "max-w-full h-auto rounded-nx-sm",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-nx-accent underline cursor-pointer",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Placeholder.configure({ placeholder: resolvedPlaceholder }),
      Subscript,
      Superscript,
      EmailHtmlBlock,
      ...(maxLength ? [CharacterCount.configure({ limit: maxLength })] : [CharacterCount]),
    ],
    content: value,
    editable: !readOnly,
    // The ONLY channel TipTap offers for attributes on the contenteditable it
    // creates -- see the a11y-forwarding props' doc comment above for why a
    // wrapper cannot substitute.
    editorProps: { attributes: editorAttributes },
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
        "overflow-hidden rounded-nx-lg border border-nx-line bg-nx-surface",
        "transition-[border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
        error && "border-nx-danger",
        // The lit edge, not an offset halo: the same --nx-focus ring every
        // other field in the system wears, raised to focus-within because the
        // thing that actually takes focus is the contenteditable inside.
        !error && "focus-within:border-nx-accent focus-within:shadow-nx-focus",
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
        // The shared field primitive rather than a bare textarea. Its own focus
        // ring is suppressed on purpose: the container above already lights the
        // whole editor edge, and two concentric rings read as an error.
        <Textarea
          value={sourceHtml}
          onChange={(e) => setSourceHtml(e.target.value)}
          className="rounded-none border-0 bg-nx-ground p-4 font-mono text-sm focus-visible:shadow-none"
          style={{ minHeight }}
          spellCheck={false}
          aria-label={t("editor.sourceLabel")}
        />
      ) : (
        <EditorContent
          editor={editor}
          className={cn(
            "prose prose-sm dark:prose-invert max-w-none px-4 py-3",
            "[&_.tiptap]:min-h-[var(--editor-min-h)] [&_.tiptap]:outline-none",
            "[&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
            "[&_.tiptap_p.is-editor-empty:first-child::before]:text-nx-ink-3",
            // The logical float, not the physical one: in the Arabic build the
            // placeholder floated away from the caret and sat under the first
            // typed word.
            "[&_.tiptap_p.is-editor-empty:first-child::before]:float-start",
            "[&_.tiptap_p.is-editor-empty:first-child::before]:h-0",
            "[&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none"
          )}
          style={{ "--editor-min-h": minHeight } as React.CSSProperties}
        />
      )}

      {/* Footer: Character Count */}
      {maxLength && (
        <div className="flex items-center justify-end border-t border-nx-line bg-nx-raised px-3 py-1.5">
          <span
            className={cn(
              "text-xs tabular-nums",
              charCount > maxLength ? "font-medium text-nx-danger" : "text-nx-ink-3"
            )}
          >
            {/* The ratio is a glance-read for the eye; a screen reader gets the
                sentence instead of "one two three four slash five thousand". */}
            <span aria-hidden="true">
              {charCount.toLocaleString()}/{maxLength.toLocaleString()}
            </span>
            <span className="sr-only">
              {t("editor.characterCount", { count: charCount, max: maxLength })}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

export default RichTextEditor;
