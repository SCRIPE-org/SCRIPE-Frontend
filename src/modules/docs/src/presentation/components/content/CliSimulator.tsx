"use client";

import { useState } from "react";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import { CliCommandInput } from "../ui/CliCommandInput";

interface CliSimulatorProps {
  titleKey: string;
}

const mockCommands = [
  "scripe dev all",
  "scripe dev backend",
  "scripe dev frontend",
  "scripe build all",
  "scripe build backend",
  "scripe build frontend",
  "scripe db update --all",
  "scripe db seed",
  "scripe check",
  "scripe lint",
  "scripe format",
  "scripe info",
  "scripe doctor"
];

const mockOutputs: Record<string, string[]> = {
  "scripe dev all": [
    "🚀 Starting concurrent developer services...",
    "[Backend] Restoring dependencies...",
    "[Frontend] pnpm dev server running on http://localhost:3000",
    "[Backend] API listening on https://localhost:5001",
    "✨ System ready. Access client portal at http://localhost:3000."
  ],
  "scripe dev backend": [
    "⚡ Starting .NET Web Host API in dev mode...",
    "info: Microsoft.Hosting.Lifetime[14]",
    "      Now listening on: https://localhost:5001",
    "info: Microsoft.Hosting.Lifetime[0]",
    "      Application started. Press Ctrl+C to shut down."
  ],
  "scripe dev frontend": [
    "⚡ Starting Next.js Dev Server...",
    "▲ Next.js 16.2.9 (Turbopack) compiler running...",
    "✓ Compiled successfully in 1.4s (http://localhost:3000)"
  ],
  "scripe build all": [
    "⚡ Building clean backend + frontend assets...",
    "[dotnet] restore and build complete. (0 errors)",
    "[pnpm] next production static build compiled successfully in 41s.",
    "📦 All builds succeeded."
  ],
  "scripe build backend": [
    "⚡ Restoring .NET NuGet packages...",
    "MSBuild version 17.12.0 for .NET",
    "  SCRIPE.Domain -> bin/Debug/net10.0/SCRIPE.Domain.dll",
    "  SCRIPE.Application -> bin/Debug/net10.0/SCRIPE.Application.dll",
    "  SCRIPE.Infrastructure -> bin/Debug/net10.0/SCRIPE.Infrastructure.dll",
    "  API -> bin/Debug/net10.0/API.dll",
    "✨ Build succeeded with 0 warnings or errors."
  ],
  "scripe build frontend": [
    "⚡ Triggering Next.js production bundler...",
    "▲ Next.js 16.2.9 (Turbopack)",
    "✓ Compiled successfully in 34.5s",
    "Running TypeScript... finished in 28.2s.",
    "Generating static HTML layout pages... done."
  ],
  "scripe db update --all": [
    "🔍 Detecting migration differences across modules...",
    "[Identity] SQL Server Migration 'AddRowVersion' applied successfully.",
    "[Entitlements] SQL Server Migration 'AddTrialPeriod' applied successfully.",
    "✅ Database tables up to date."
  ],
  "scripe db seed": [
    "🌱 Seeding data context objects...",
    "[IdentitySeeder] Default administrative role created.",
    "[PermissionSeeder] Synchronized 146 permissions.",
    "🌱 Dev seed data populated successfully."
  ],
  "scripe check": [
    "⚡ Running full pre-push pipeline validation gate...",
    "🔍 Prettier formatting check: Pass.",
    "🔍 ESLint + Format lints: Pass.",
    "🔍 Dotnet formats: Pass.",
    "🔍 Backend test suite: 124 tests passed (0 failures).",
    "🔍 Frontend coverage check: 85% coverage (Pass).",
    "🎉 Validation succeeded! Ready to commit/push."
  ],
  "scripe lint": [
    "🔍 ESLint verification check...",
    "[Frontend] No lint issues detected in 452 files.",
    "[Backend] dotnet format check completed - 0 formatting errors."
  ],
  "scripe format": [
    "🎨 Formatting files via Prettier and dotnet format...",
    "[prettier] reformatted 14 files.",
    "[dotnet] formatted 3 file paths.",
    "✨ Workspace code layout stylized."
  ],
  "scripe info": [
    "📋 Platform Dashboard Info:",
    "  OS: Windows 11 Home",
    "  Dotnet SDK: 10.0.100",
    "  Node Engine: v22.11.0",
    "  Package Manager: pnpm v11.6.0",
    "  Monorepo modules: Identity, Entitlements, Compliance, Customizer"
  ],
  "scripe doctor": [
    "🔍 Running prerequisite medical check...",
    "  Node.js: OK (v22.11.0)",
    "  Dotnet SDK: OK (10.0.100)",
    "  Pnpm Engine: OK (v11.6.0)",
    "  Docker Compose: OK",
    "  Redis Local Host: Connected (port 6379)",
    "🎉 All system requirements met. You are ready to develop!"
  ]
};

export function CliSimulator({ titleKey }: CliSimulatorProps) {
  const { t } = useDocsI18n();
  const [activeCmd, setActiveCmd] = useState<string>("scripe info");
  const [logs, setLogs] = useState<string[]>(mockOutputs["scripe info"]);

  const runCommand = (cmd: string) => {
    setActiveCmd(cmd);
    setLogs(["$ " + cmd, "Executing...", ...(mockOutputs[cmd] || ["Command not found in simulator."])]);
  };

  return (
    <div className="docs-terminal-container" style={{ marginBottom: "2.5rem" }}>
      <div className="docs-pipeline-title" style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.75rem" }}>
        {t(titleKey)}
      </div>
      
      <div style={{ marginBottom: "1rem" }}>
        <CliCommandInput commands={mockCommands} onSelectCommand={runCommand} />
      </div>

      <div className="docs-terminal-window">
        <div className="docs-terminal-header">
          <div className="docs-terminal-dots">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
          </div>
          <span style={{ marginLeft: "1rem", fontSize: "0.7rem", color: "var(--text-secondary)" }}>
            CLI Playground Screen
          </span>
        </div>
        <div className="docs-terminal-body" style={{ minHeight: "160px", overflowY: "auto", background: "#08070b" }}>
          <div className="docs-terminal-line">
            <span className="prompt">$</span> <span className="cmd">{activeCmd}</span>
          </div>
          <div style={{ marginTop: "0.75rem" }}>
            {logs.map((log, i) => (
              <div key={i} className="docs-terminal-output" style={{ fontSize: "0.8rem", color: log.startsWith("✨") || log.startsWith("🎉") || log.startsWith("✅") ? "#10b981" : log.startsWith("$ ") ? "var(--docs-purple-primary)" : "#a1a1aa" }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
