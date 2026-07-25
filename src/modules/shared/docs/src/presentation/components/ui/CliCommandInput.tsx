"use client";

import { useId, useState } from "react";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import { cn } from "@core/common/utils";

interface CliCommandInputProps {
  commands: string[];
  onSelectCommand: (cmd: string) => void;
}

/**
 * CliCommandInput — a lightweight command palette: typing filters the known
 * scripe commands. Each suggestion is a real, focusable button so the list is
 * reachable and operable without a mouse (it was a plain `<li onClick>`,
 * unreachable by Tab and silent to a screen reader).
 */
export function CliCommandInput({ commands, onSelectCommand }: CliCommandInputProps) {
  const { t } = useDocsI18n();
  const [val, setVal] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const listId = useId();

  const handleInputChange = (text: string) => {
    setVal(text);
    if (!text) {
      setSuggestions([]);
      return;
    }
    setSuggestions(commands.filter((c) => c.toLowerCase().includes(text.toLowerCase())));
  };

  const handleSelect = (cmd: string) => {
    onSelectCommand(cmd);
    setVal("");
    setSuggestions([]);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={val}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={t("widgets.cliSimulator.inputPlaceholder")}
        aria-label={t("widgets.cliSimulator.inputLabel")}
        aria-expanded={suggestions.length > 0}
        aria-controls={suggestions.length > 0 ? listId : undefined}
        autoComplete="off"
        className={cn(
          "h-10 w-full rounded-nx-control border border-nx-line bg-nx-ground px-3 py-2 text-sm text-nx-ink placeholder:text-nx-ink-3",
          "transition-[color,border-color,background-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
          "hover:border-nx-line-hi focus-visible:outline-none focus-visible:border-nx-accent focus-visible:shadow-nx-focus"
        )}
      />
      {suggestions.length > 0 && (
        <ul
          id={listId}
          aria-label={t("widgets.cliSimulator.suggestionsLabel")}
          className="absolute start-0 top-full z-dropdown mt-1 max-h-40 w-full overflow-y-auto rounded-nx-md border border-nx-line bg-nx-popover py-1 shadow-nx-popover"
        >
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => handleSelect(s)}
                className={cn(
                  "w-full px-3 py-1.5 text-start font-mono text-xs text-nx-ink",
                  "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                  "hover:bg-nx-hover focus-visible:outline-none focus-visible:bg-nx-hover"
                )}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
