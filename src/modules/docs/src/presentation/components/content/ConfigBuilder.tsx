"use client";

import { useState } from "react";
import { useDocsI18n } from "../../providers/DocsI18nProvider";

interface ConfigBuilderProps {
  titleKey: string;
}

export function ConfigBuilder({ titleKey }: ConfigBuilderProps) {
  const { t } = useDocsI18n();
  const [provider, setProvider] = useState<string>("SqlServer");
  const [mode, setMode] = useState<string>("Single");
  const [jobs, setJobs] = useState<string>("Native");

  const appsettingsJson = `{
  "Database": {
    "Provider": "${provider}",
    "Mode": "${mode}",
    "ConnectionString": "Server=localhost;Database=Scripe_DB;..."
  },
  "BackgroundJobs": {
    "Provider": "${jobs}"
  },
  "Redis": {
    "ConnectionString": "localhost:6379",
    "Enabled": true
  }
}`;

  return (
    <div className="docs-config-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "1.5rem", marginBottom: "2.5rem", border: "1px solid var(--border)", borderRadius: "12px", background: "var(--bg-secondary)", padding: "1.5rem" }}>
      <div className="docs-config-controls" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "700" }}>{t(titleKey)}</h3>
        
        <div className="docs-form-group">
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", marginBottom: "0.4rem" }}>
            Database Provider
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            style={{ width: "100%", padding: "0.4rem 0.6rem", fontSize: "0.8rem", borderRadius: "6px", background: "var(--bg-primary)", border: "1px solid var(--border)" }}
          >
            <option value="SqlServer">SQL Server (Default)</option>
            <option value="PostgreSql">PostgreSql</option>
            <option value="Oracle">Oracle Database</option>
          </select>
        </div>

        <div className="docs-form-group">
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", marginBottom: "0.4rem" }}>
            Database Connection Mode
          </label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            style={{ width: "100%", padding: "0.4rem 0.6rem", fontSize: "0.8rem", borderRadius: "6px", background: "var(--bg-primary)", border: "1px solid var(--border)" }}
          >
            <option value="Single">Single Database (Monolith)</option>
            <option value="Multi">Multi Database (Microservices)</option>
          </select>
        </div>

        <div className="docs-form-group">
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", marginBottom: "0.4rem" }}>
            Background Job Provider
          </label>
          <select
            value={jobs}
            onChange={(e) => setJobs(e.target.value)}
            style={{ width: "100%", padding: "0.4rem 0.6rem", fontSize: "0.8rem", borderRadius: "6px", background: "var(--bg-primary)", border: "1px solid var(--border)" }}
          >
            <option value="Native">Native Timer Service</option>
            <option value="Hangfire">Hangfire Dashboard</option>
            <option value="Quartz">Quartz.NET Engine</option>
          </select>
        </div>
      </div>

      <div className="docs-config-output">
        <div className="docs-terminal-window">
          <div className="docs-terminal-header" style={{ justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>appsettings.json</span>
            <button
              onClick={() => navigator.clipboard.writeText(appsettingsJson)}
              style={{ background: "transparent", border: "none", color: "var(--docs-purple-primary)", fontSize: "0.7rem", cursor: "pointer" }}
            >
              Copy JSON
            </button>
          </div>
          <pre className="docs-terminal-body" style={{ margin: 0, padding: "1rem", overflowX: "auto", fontSize: "0.8rem" }}>
            <code>{appsettingsJson}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
