"use client";

import { Button } from "@core/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { useI18n } from "@core/providers/i18n-provider";
import { Heading1, Heading2, Heading3, Type } from "lucide-react";
import type { Editor } from "@tiptap/react";

// ─── Block styles ───────────────────────────────────────────
// The menu offers one-of-four, so it is a RADIO group rather than four command
// rows. That is not cosmetic: Radix gives a radio item role="menuitemradio"
// plus aria-checked, so the current style is announced. Before, "which style
// am I in?" was carried by a background tint alone — invisible to a screen
// reader and to anyone who cannot separate the tint from the hover fill.
const STYLES = [
  { id: "paragraph", icon: Type, level: null },
  { id: "heading1", icon: Heading1, level: 1 },
  { id: "heading2", icon: Heading2, level: 2 },
  { id: "heading3", icon: Heading3, level: 3 },
] as const;

type BlockStyleId = (typeof STYLES)[number]["id"];

// ─── Component ──────────────────────────────────────────────
export function HeadingDropdown({ editor }: { editor: Editor }) {
  const { t } = useI18n();

  const activeStyle: BlockStyleId =
    STYLES.find(
      (style) => style.level !== null && editor.isActive("heading", { level: style.level })
    )?.id ?? "paragraph";

  const applyStyle = (id: string) => {
    const style = STYLES.find((candidate) => candidate.id === id);
    if (!style) return;
    if (style.level === null) {
      editor.chain().focus().setParagraph().run();
      return;
    }
    // toggleHeading, not setHeading: re-picking the current level drops back to
    // a paragraph, which is the behaviour this control has always had.
    editor.chain().focus().toggleHeading({ level: style.level }).run();
  };

  return (
    <DropdownMenu>
      {/* Tooltip wraps the menu trigger through Slot, so the one button is both
          the tooltip anchor and the menu trigger — the hover hint survives the
          removal of the native `title`, which was never an accessible name. */}
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 min-w-9 px-2 text-xs font-medium"
                // The visible glyph is a typographic mark (¶ / H1). It reports
                // the current style; it does not say what the control does, so
                // the control says it here.
                aria-label={t("editor.toolbar.textStyle")}
              >
                {t(`editor.toolbar.styleShort.${activeStyle}`)}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t("editor.toolbar.textStyle")}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent align="start">
        <DropdownMenuRadioGroup value={activeStyle} onValueChange={applyStyle}>
          {STYLES.map(({ id, icon: Icon }) => (
            <DropdownMenuRadioItem key={id} value={id}>
              {/* The menu row already sets gap-2; the physical end-margin this
                  replaces put the glyph on the wrong side of its label in
                  Arabic. */}
              <Icon className="h-4 w-4" aria-hidden="true" />
              {t(`editor.toolbar.style.${id}`)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
