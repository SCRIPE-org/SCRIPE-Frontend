"use client";

import { useState } from "react";
import type { AccordionBlock } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import { safeItems } from "./block-style-utils";

export function AccordionBlockView({ block }: { block: AccordionBlock }) {
  const props = block.props;
  const [open, setOpen] = useState<Set<number>>(new Set([0]));

  const toggle = (index: number) => {
    setOpen((current) => {
      const next = props.allowMultiple ? new Set(current) : new Set<number>();
      if (current.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {safeItems(props.items, 5).map((item, index) => {
        const isOpen = open.has(index);
        return (
          <div
            key={`${item.title}-${index}`}
            className={props.style === "ghost" ? "" : props.style === "card" ? "rounded-lg bg-background shadow-sm" : "rounded-lg border"}
          >
            <button type="button" className="flex w-full items-center justify-between px-3 py-2 text-start text-sm font-medium" onClick={() => toggle(index)}>
              <span>{item.title}</span>
              <span>{isOpen ? "-" : "+"}</span>
            </button>
            {isOpen && <div className="px-3 pb-3 text-sm text-muted-foreground">{item.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
