/**
 * EmailHtmlBlock — Custom TipTap Node Extension
 *
 * Treats email-safe HTML (tables, buttons, social links) as an opaque,
 * non-editable block inside the editor. This prevents TipTap/ProseMirror
 * from stripping <table>, <style>, inline styles, and other email-specific
 * markup that it cannot natively represent.
 *
 * The raw HTML is stored in the `html` attribute and rendered via a React
 * NodeView. On serialisation (`getHTML()`), the raw HTML is stored as a
 * data attribute and post-processed by `getEmailSafeHTML()` in RichTextEditor.
 */

import { mergeAttributes, Node, ReactNodeViewRenderer } from "@tiptap/react";
import EmailHtmlBlockView from "../EmailHtmlBlockView";

export interface EmailHtmlBlockOptions {
      /** HTML attributes added to the wrapper element in the editor */
      HTMLAttributes: Record<string, string>;
}

declare module "@tiptap/react" {
      interface Commands<ReturnType> {
            emailHtmlBlock: {
                  /**
                   * Insert an opaque email HTML block at the current cursor position.
                   */
                  insertEmailHtmlBlock: (attrs: {
                        html: string;
                        label?: string;
                        blockType?: string;
                  }) => ReturnType;
            };
      }
}

export const EmailHtmlBlock = Node.create<EmailHtmlBlockOptions>({
      name: "emailHtmlBlock",

      group: "block",

      // Treated as a single atom — not editable inline
      atom: true,

      // Draggable in editor
      draggable: true,

      // Isolating prevents cursor from entering
      isolating: true,

      addOptions() {
            return {
                  HTMLAttributes: {},
            };
      },

      addAttributes() {
            return {
                  /** The raw email HTML stored verbatim */
                  html: {
                        default: "",
                        parseHTML: (el: HTMLElement) => el.getAttribute("data-email-html") || "",
                        renderHTML: (attrs: Record<string, unknown>) => ({
                              "data-email-html": attrs.html as string,
                        }),
                  },
                  /** A human-friendly label (e.g. "CTA Button", "Social Links") */
                  label: {
                        default: "Email Block",
                        parseHTML: (el: HTMLElement) => el.getAttribute("data-label") || "Email Block",
                        renderHTML: (attrs: Record<string, unknown>) => ({
                              "data-label": attrs.label as string,
                        }),
                  },
                  /** Block type for icon differentiation */
                  blockType: {
                        default: "generic",
                        parseHTML: (el: HTMLElement) => el.getAttribute("data-block-type") || "generic",
                        renderHTML: (attrs: Record<string, unknown>) => ({
                              "data-block-type": attrs.blockType as string,
                        }),
                  },
            };
      },

      parseHTML() {
            return [
                  {
                        tag: 'div[data-email-html-block="true"]',
                  },
            ];
      },

      renderHTML({ HTMLAttributes }) {
            return [
                  "div",
                  mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                        "data-email-html-block": "true",
                  }),
            ];
      },

      renderText({ node }) {
            return (node.attrs.label as string) || "Email Block";
      },

      addNodeView() {
            return ReactNodeViewRenderer(EmailHtmlBlockView);
      },

      addCommands() {
            return {
                  insertEmailHtmlBlock:
                        (attrs: { html: string; label?: string; blockType?: string }) =>

                              ({ commands }: any) => {
                                    return commands.insertContent({
                                          type: this.name,
                                          attrs,
                                    });
                              },
            };
      },
});

export default EmailHtmlBlock;
