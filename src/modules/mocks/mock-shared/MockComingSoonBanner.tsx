"use client";
import React from "react";
import { Clock } from "lucide-react";

export function MockComingSoonBanner({ isAr, isDark }: { isAr: boolean; isDark: boolean }) {
  return (
    <div
      style={{
        marginTop: 20,
        padding: "14px 20px",
        borderRadius: 12,
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.03)",
        border: `1px dashed ${isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)"}`,
        display: "flex",
        alignItems: "center",
        gap: 10,
        color: isDark ? "rgba(255,255,255,0.3)" : "#94A3B8",
        fontSize: 13,
      }}
    >
      <Clock size={14} style={{ flexShrink: 0 }} />
      {isAr
        ? "هذه بيانات تجريبية — الوحدة الحقيقية قيد التطوير"
        : "This is demo data — the real module is under development"}
    </div>
  );
}
