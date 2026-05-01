"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@core/ui/button";
import { Separator } from "@core/ui/separator";
import { cn } from "@core/common/utils";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Link,
  Image,
  Code,
  Undo,
  Redo,
  Palette,
  Minus,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";

// Enhanced HTML Sanitization utility that preserves formatting
const sanitizeHTML = (html: string): string => {
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  // Remove dangerous elements
  const dangerousElements = tempDiv.querySelectorAll(
    "script, iframe, object, embed, form, input, button"
  );
  dangerousElements.forEach((element) => element.remove());

  // Define allowed tags and attributes for rich text formatting
  const allowedTags = [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "strike",
    "del",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "blockquote",
    "pre",
    "code",
    "a",
    "img",
    "div",
    "span",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "hr", // Add horizontal rule
  ];

  const allowedAttributes: Record<string, string[]> = {
    a: ["href", "title", "target"],
    img: ["src", "alt", "title", "width", "height"],
    table: ["border", "cellpadding", "cellspacing"],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan"],
    "*": ["style", "class", "id"], // Allow styling attributes
  };

  // Process all elements
  const allElements = tempDiv.querySelectorAll("*");
  allElements.forEach((element) => {
    const tagName = element.tagName.toLowerCase();

    // Remove disallowed tags
    if (!allowedTags.includes(tagName)) {
      element.outerHTML = element.innerHTML;
      return;
    }

    // Remove dangerous event handlers
    const eventHandlers = [
      "onclick",
      "onload",
      "onerror",
      "onmouseover",
      "onmouseout",
      "onfocus",
      "onblur",
      "onchange",
      "onsubmit",
    ];
    eventHandlers.forEach((handler) => {
      element.removeAttribute(handler);
    });

    // Clean attributes based on tag
    const allowedAttrs = allowedAttributes[tagName] || allowedAttributes["*"] || [];
    const attributesToRemove: string[] = [];

    Array.from(element.attributes).forEach((attr) => {
      if (!allowedAttrs.includes(attr.name)) {
        attributesToRemove.push(attr.name);
      }
    });

    attributesToRemove.forEach((attrName) => {
      element.removeAttribute(attrName);
    });

    // Special handling for links and images
    if (tagName === "a") {
      const href = element.getAttribute("href");
      if (
        href &&
        (href.toLowerCase().startsWith("javascript:") || href.toLowerCase().startsWith("data:"))
      ) {
        element.removeAttribute("href");
      }
    }

    if (tagName === "img") {
      const src = element.getAttribute("src");
      if (
        src &&
        (src.toLowerCase().startsWith("javascript:") || src.toLowerCase().startsWith("data:"))
      ) {
        element.removeAttribute("src");
      }
    }

    // Clean style attributes to remove dangerous CSS
    if (element.hasAttribute("style")) {
      const style = element.getAttribute("style");
      if (style) {
        // Remove dangerous CSS properties
        const dangerousStyles = ["expression", "javascript:", "vbscript:", "onload", "onerror"];
        let cleanStyle = style;

        dangerousStyles.forEach((dangerous) => {
          cleanStyle = cleanStyle.replace(new RegExp(dangerous, "gi"), "");
        });

        element.setAttribute("style", cleanStyle);
      }
    }
  });

  return tempDiv.innerHTML;
};

// URL validation utility
const isValidURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
};

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minHeight?: number;
}

const TOOLBAR_GROUPS = [
  {
    group: "headings",
    buttons: [
      { icon: Heading1, command: "formatBlock", value: "h1", title: "Heading 1" },
      { icon: Heading2, command: "formatBlock", value: "h2", title: "Heading 2" },
      { icon: Heading3, command: "formatBlock", value: "h3", title: "Heading 3" },
    ],
  },
  {
    group: "format",
    buttons: [
      { icon: Bold, command: "bold", title: "Bold (Ctrl+B)" },
      { icon: Italic, command: "italic", title: "Italic (Ctrl+I)" },
      { icon: Underline, command: "underline", title: "Underline (Ctrl+U)" },
      { icon: Strikethrough, command: "strikeThrough", title: "Strikethrough" },
    ],
  },
  {
    group: "align",
    buttons: [
      { icon: AlignLeft, command: "justifyLeft", title: "Align Left" },
      { icon: AlignCenter, command: "justifyCenter", title: "Align Center" },
      { icon: AlignRight, command: "justifyRight", title: "Align Right" },
      { icon: AlignJustify, command: "justifyFull", title: "Justify" },
    ],
  },
  {
    group: "lists",
    buttons: [
      { icon: List, command: "insertUnorderedList", title: "Bullet List" },
      { icon: ListOrdered, command: "insertOrderedList", title: "Numbered List" },
      { icon: Quote, command: "formatBlock", value: "blockquote", title: "Quote" },
    ],
  },
  {
    group: "insert",
    buttons: [
      { icon: Link, action: "insertLink", title: "Insert Link" },
      { icon: Image, action: "insertImage", title: "Insert Image" },
      { icon: Code, command: "formatBlock", value: "pre", title: "Code Block" },
      { icon: Minus, command: "insertHorizontalRule", title: "Horizontal Rule" },
    ],
  },
  {
    group: "history",
    buttons: [
      { icon: Undo, command: "undo", title: "Undo (Ctrl+Z)" },
      { icon: Redo, command: "redo", title: "Redo (Ctrl+Y)" },
    ],
  },
];

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Start typing...",
  className,
  disabled = false,
  minHeight = 200,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  const getCharCount = (html: string) => {
    if (typeof document === "undefined") {
      return html.replace(/<[^>]*>?/gm, "").length;
    }
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent?.length || 0;
  };
  const charCount = getCharCount(value);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = sanitizeHTML(value);
    }
  }, [value]);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      if (onChange) {
        onChange(sanitizeHTML(editorRef.current.innerHTML));
      }
    }
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url && isValidURL(url)) {
      executeCommand("createLink", url);
    } else if (url) {
      alert("Please enter a valid URL (http:// or https://)");
    }
  };

  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (url && isValidURL(url)) {
      executeCommand("insertImage", url);
    } else if (url) {
      alert("Please enter a valid URL (http:// or https://)");
    }
  };

  const changeFontSize = (size: string) => {
    executeCommand("fontSize", size);
  };

  const changeTextColor = (color: string) => {
    executeCommand("foreColor", color);
  };

  return (
    <div className={cn("rounded-md border bg-background", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b bg-muted/30 p-2">
        {/* Font Size */}
        <select
          className="rounded border bg-background px-2 py-1 text-sm"
          onChange={(e) => changeFontSize(e.target.value)}
          disabled={disabled}
        >
          <option value="1">8pt</option>
          <option value="2">10pt</option>
          <option value="3" selected>
            12pt
          </option>
          <option value="4">14pt</option>
          <option value="5">18pt</option>
          <option value="6">24pt</option>
          <option value="7">36pt</option>
        </select>

        <Separator orientation="vertical" className="h-6" />

        {/* Text Color */}
        <div className="flex items-center gap-1">
          <Palette className="h-4 w-4" />
          <input
            type="color"
            className="h-6 w-8 cursor-pointer rounded border"
            onChange={(e) => changeTextColor(e.target.value)}
            disabled={disabled}
            title="Text Color"
          />
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Toolbar Buttons */}
        {TOOLBAR_GROUPS.map((group, groupIndex) => (
          <React.Fragment key={group.group}>
            <div className="flex gap-1">
              {group.buttons.map((button, buttonIndex) => (
                <Button
                  key={buttonIndex}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    if ("action" in button) {
                      if (button.action === "insertLink") insertLink();
                      if (button.action === "insertImage") insertImage();
                    } else if ("command" in button) {
                      executeCommand(button.command, "value" in button ? button.value : undefined);
                    }
                  }}
                  disabled={disabled}
                  title={button.title}
                >
                  <button.icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
            {groupIndex < TOOLBAR_GROUPS.length - 1 && (
              <Separator orientation="vertical" className="h-6" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        className={cn(
          "p-4 outline-none focus:ring-0",
          "prose prose-sm max-w-none",
          "min-h-[200px]",
          disabled && "cursor-not-allowed opacity-50"
        )}
        style={{ minHeight }}
        onInput={handleContentChange}
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        onKeyDown={(e) => {
          // Handle keyboard shortcuts
          if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
              case "b":
                e.preventDefault();
                executeCommand("bold");
                break;
              case "i":
                e.preventDefault();
                executeCommand("italic");
                break;
              case "u":
                e.preventDefault();
                executeCommand("underline");
                break;
              case "z":
                e.preventDefault();
                executeCommand("undo");
                break;
              case "y":
                e.preventDefault();
                executeCommand("redo");
                break;
              case "1":
                e.preventDefault();
                executeCommand("formatBlock", "h1");
                break;
              case "2":
                e.preventDefault();
                executeCommand("formatBlock", "h2");
                break;
              case "3":
                e.preventDefault();
                executeCommand("formatBlock", "h3");
                break;
            }
          }
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      {/* Status Bar */}
      <div className="border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>{charCount} characters</span>
          <span className="flex items-center gap-2">
            {isActive && <span className="text-green-600">● Active</span>}
            <span>Rich Text Editor</span>
          </span>
        </div>
      </div>

      {/* Custom Styles for the editor content */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #6b7280;
          pointer-events: none;
        }

        [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }

        [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
        }

        [contenteditable] h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
        }

        [contenteditable] p {
          margin: 1em 0;
        }

        [contenteditable] blockquote {
          margin: 1em 0;
          padding-left: 1em;
          border-left: 4px solid #e5e7eb;
          font-style: italic;
        }

        [contenteditable] ul,
        [contenteditable] ol {
          margin: 1em 0;
          padding-left: 2em;
        }

        [contenteditable] pre {
          background-color: #f3f4f6;
          padding: 1em;
          border-radius: 0.375rem;
          overflow-x: auto;
          font-family: monospace;
        }

        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }

        [contenteditable] img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
        }
      `}</style>
    </div>
  );
}
