"use client";

import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { FeatureGridItem } from "../../../domain/entities/DocSection";

interface FeatureGridProps {
  items: FeatureGridItem[];
  columns?: 2 | 3 | 4;
}

// Map icon name → emoji for lightweight rendering (no icon library dependency)
const iconMap: Record<string, string> = {
  shield: "🛡️",
  lock: "🔒",
  key: "🔑",
  users: "👥",
  database: "🗄️",
  server: "🖥️",
  globe: "🌐",
  zap: "⚡",
  layers: "📚",
  code: "💻",
  settings: "⚙️",
  chart: "📊",
  bell: "🔔",
  file: "📄",
  cloud: "☁️",
  building: "🏢",
  puzzle: "🧩",
  rocket: "🚀",
  eye: "👁️",
  search: "🔍",
  link: "🔗",
  refresh: "🔄",
  check: "✅",
  star: "⭐",
  box: "📦",
  terminal: "💻",
  git: "🔀",
  workflow: "🔄",
  palette: "🎨",
  megaphone: "📢",
};

/**
 * FeatureGrid — Responsive grid of feature cards with icon, title, and description.
 * Used for feature highlights, capability overviews, and module summaries.
 */
export function FeatureGrid({ items, columns = 3 }: FeatureGridProps) {
  const { t } = useDocsI18n();

  return (
    <div className="docs-feature-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {items.map((item, idx) => (
        <div key={idx} className="docs-feature-card">
          <div className="docs-feature-icon">{iconMap[item.icon] || "📋"}</div>
          <h4 className="docs-feature-title">{t(item.titleKey)}</h4>
          <p className="docs-feature-description">{t(item.descriptionKey)}</p>
        </div>
      ))}
    </div>
  );
}
