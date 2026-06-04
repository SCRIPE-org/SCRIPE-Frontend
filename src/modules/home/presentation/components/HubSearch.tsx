"use client";

/**
 * HubSearch — Big glassmorphism search bar for the Hub page.
 *
 * 56px height, 14px border-radius, backdrop-blur glass background.
 * Focus state: blue glow ring. "/" keyboard shortcut to focus.
 */

import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";

interface HubSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function HubSearch({ value, onChange }: HubSearchProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  // "/" keyboard shortcut to focus
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        marginTop: 8,
        marginBottom: 6,
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 12,
          height: 56,
          padding: "0 18px",
          borderRadius: 14,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.02) 100%)",
          border: focused
            ? "1px solid rgba(124, 139, 255, 0.45)"
            : "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(14px) saturate(140%)",
          boxShadow: focused
            ? "0 0 0 4px rgba(124,139,255,0.12), 0 12px 30px -10px rgba(0,0,0,0.5)"
            : "0 10px 24px -16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
          transition: "border-color 200ms ease, box-shadow 200ms ease",
        }}
      >
        <Search
          size={18}
          strokeWidth={1.75}
          style={{ color: "rgba(230,233,245,0.6)", flexShrink: 0 }}
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("workspaceHub.search.placeholder")}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            color: "#e6e9f5",
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: "-0.005em",
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        />
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "rgba(230,233,245,0.5)",
            flexShrink: 0,
          }}
        >
          <kbd
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: 6,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(230,233,245,0.8)",
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            /
          </kbd>
          <span style={{ fontSize: 11.5 }}>{t("workspaceHub.search.focusHint")}</span>
        </div>
      </div>
    </div>
  );
}
