"use client";

import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { Heading1, Heading2, Heading3, Type } from "lucide-react";
import type { Editor } from "@tiptap/react";

// ─── Component ──────────────────────────────────────────────
export function HeadingDropdown({ editor }: { editor: Editor }) {
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
          className="h-8 min-w-[36px] px-2 text-xs font-medium"
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
          <Type className="mr-2 h-4 w-4" /> Paragraph
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(editor.isActive("heading", { level: 1 }) && "bg-accent")}
        >
          <Heading1 className="mr-2 h-4 w-4" /> Heading 1
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(editor.isActive("heading", { level: 2 }) && "bg-accent")}
        >
          <Heading2 className="mr-2 h-4 w-4" /> Heading 2
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(editor.isActive("heading", { level: 3 }) && "bg-accent")}
        >
          <Heading3 className="mr-2 h-4 w-4" /> Heading 3
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
