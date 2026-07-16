"use client";

import { useState } from "react";

interface CliCommandInputProps {
  commands: string[];
  onSelectCommand: (cmd: string) => void;
}

export function CliCommandInput({ commands, onSelectCommand }: CliCommandInputProps) {
  const [val, setVal] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleInputChange = (text: string) => {
    setVal(text);
    if (!text) {
      setSuggestions([]);
      return;
    }
    const filtered = commands.filter((c) => c.toLowerCase().includes(text.toLowerCase()));
    setSuggestions(filtered);
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        value={val}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="Type a scripe command (e.g., dev, build, db)..."
        style={{
          width: "100%",
          padding: "0.5rem 0.75rem",
          background: "var(--bg-primary)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          fontSize: "0.8rem",
          color: "var(--text-primary)",
        }}
      />
      {suggestions.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            maxHeight: "150px",
            overflowY: "auto",
            zIndex: 10,
            margin: "4px 0 0 0",
            padding: "0.25rem 0",
            listStyle: "none",
          }}
        >
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              onClick={() => {
                onSelectCommand(s);
                setVal("");
                setSuggestions([]);
              }}
              style={{
                padding: "0.4rem 0.75rem",
                fontSize: "0.75rem",
                cursor: "pointer",
                transition: "background 0.15s ease",
                color: "var(--text-primary)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
