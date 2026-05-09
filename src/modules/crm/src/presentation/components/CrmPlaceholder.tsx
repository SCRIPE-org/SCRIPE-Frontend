"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import { Construction } from "lucide-react";

interface CrmPlaceholderProps {
  icon: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  stats?: { labelEn: string; labelAr: string; value: string; color: string }[];
}

function DynamicIcon({ name, size = 32 }: { name: string; size?: number }) {
  const PascalName = name?.replace(/(^|[-_])(\w)/g, (_, __, c: string) => c.toUpperCase());
  const Icon = (LucideIcons as Record<string, any>)[PascalName ?? ""];
  if (Icon) return <Icon width={size} height={size} strokeWidth={1.5} />;
  return <Construction width={size} height={size} strokeWidth={1.5} />;
}

export function CrmPlaceholder({
  icon,
  titleEn,
  titleAr,
  descEn,
  descAr,
  stats,
}: CrmPlaceholderProps) {
  const [lang, setLang] = React.useState<"en" | "ar">("en");

  // Detect system locale from document lang attribute
  React.useEffect(() => {
    const docLang = document.documentElement.lang;
    if (docLang?.startsWith("ar")) setLang("ar");
  }, []);

  const isAr = lang === "ar";
  const title = isAr ? titleAr : titleEn;
  const desc = isAr ? descAr : descEn;

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        minHeight: "60vh",
        padding: "48px 24px 32px",
        gap: 32,
      }}
    >
      {/* Hero card */}
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 0 0 1px hsl(var(--border)), 0 20px 60px rgba(0,0,0,0.08)",
          background: "hsl(var(--card))",
        }}
      >
        {/* Gradient header strip */}
        <div
          style={{
            height: 120,
            background:
              "linear-gradient(135deg, oklch(0.55 0.20 200) 0%, oklch(0.42 0.18 240) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          {[0.08, 0.05, 0.03].map((opacity, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                borderRadius: "50%",
                border: `1px solid rgba(255,255,255,${opacity * 2})`,
                width: 80 + i * 60,
                height: 80 + i * 60,
                opacity,
                background: "rgba(255,255,255,0.04)",
              }}
            />
          ))}
          <div style={{ color: "rgba(255,255,255,0.9)", zIndex: 1 }}>
            <DynamicIcon name={icon} size={44} />
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "28px 32px 32px" }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 10px",
              borderRadius: 20,
              background: "oklch(0.55 0.20 200 / 0.10)",
              border: "1px solid oklch(0.55 0.20 200 / 0.25)",
              marginBottom: 14,
            }}
          >
            <Construction width={12} height={12} style={{ color: "oklch(0.55 0.20 200)" }} />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "oklch(0.55 0.20 200)",
              }}
            >
              {isAr ? "قريباً" : "Coming Soon"}
            </span>
          </div>

          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "hsl(var(--foreground))",
              margin: "0 0 10px",
              lineHeight: 1.3,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "hsl(var(--muted-foreground))",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {desc}
          </p>
        </div>
      </div>

      {/* Stats row (optional) */}
      {stats && stats.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
            gap: 12,
            width: "100%",
            maxWidth: 560,
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              style={{
                borderRadius: 14,
                padding: "16px 18px",
                background: "hsl(var(--card))",
                boxShadow: "0 0 0 1px hsl(var(--border))",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: s.color,
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "hsl(var(--muted-foreground))",
                  fontWeight: 500,
                  letterSpacing: "0.03em",
                }}
              >
                {isAr ? s.labelAr : s.labelEn}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer note */}
      <p
        style={{
          fontSize: 12,
          color: "hsl(var(--muted-foreground))",
          opacity: 0.6,
          textAlign: "center",
          maxWidth: 400,
        }}
      >
        {isAr
          ? "هذه الصفحة نموذج أولي. سيتم تطوير الوظائف الكاملة قريباً."
          : "This is a prototype placeholder. Full functionality will be implemented soon."}
      </p>
    </div>
  );
}
