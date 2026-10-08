"use client";

import { useState } from "react";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import { CliCommandInput } from "../ui/CliCommandInput";
import { cn } from "@core/common/utils";

interface CliSimulatorProps {
  titleKey: string;
}

// The commands and their transcripts below simulate REAL third-party tool
// output (dotnet, pnpm, Next.js) exactly as that tooling actually prints it —
// like a code sample, this transcript is not run through t(): a translated
// "MSBuild version 17.12.0 for .NET" would misrepresent what the real CLI
// prints. Everything wrapped AROUND the transcript (labels, placeholder,
// empty/not-found copy) is fully localized below.
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
  "scripe doctor",
];

const mockOutputs: Record<string, string[]> = {
  "scripe dev all": [
    "🚀 Starting concurrent developer services...",
    "[Backend] Restoring dependencies...",
    "[Frontend] pnpm dev server running on http://localhost:3000",
    "[Backend] API listening on https://localhost:5035",
    "✨ System ready. Access client portal at http://localhost:3000.",
  ],
  "scripe dev backend": [
    "⚡ Starting .NET Web Host API in dev mode...",
    "info: Microsoft.Hosting.Lifetime[14]",
    "      Now listening on: https://localhost:5035",
    "info: Microsoft.Hosting.Lifetime[0]",
    "      Application started. Press Ctrl+C to shut down.",
  ],
  "scripe dev frontend": [
    "⚡ Starting Next.js Dev Server...",
    "▲ Next.js 16.2.9 (Turbopack) compiler running...",
    "✓ Compiled successfully in 1.4s (http://localhost:3000)",
  ],
  "scripe build all": [
    "⚡ Building clean backend + frontend assets...",
    "[dotnet] restore and build complete. (0 errors)",
    "[pnpm] next production static build compiled successfully in 41s.",
    "📦 All builds succeeded.",
  ],
  "scripe build backend": [
    "⚡ Restoring .NET NuGet packages...",
    "MSBuild version 17.12.0 for .NET",
    "  SCRIPE.Domain -> bin/Debug/net10.0/SCRIPE.Domain.dll",
    "  SCRIPE.Application -> bin/Debug/net10.0/SCRIPE.Application.dll",
    "  SCRIPE.Infrastructure -> bin/Debug/net10.0/SCRIPE.Infrastructure.dll",
    "  API -> bin/Debug/net10.0/API.dll",
    "✨ Build succeeded with 0 warnings or errors.",
  ],
  "scripe build frontend": [
    "⚡ Triggering Next.js production bundler...",
    "▲ Next.js 16.2.9 (Turbopack)",
    "✓ Compiled successfully in 34.5s",
    "Running TypeScript... finished in 28.2s.",
    "Generating static HTML layout pages... done.",
  ],
  "scripe db update --all": [
    "🔍 Detecting migration differences across modules...",
    "[Identity] SQL Server Migration 'AddRowVersion' applied successfully.",
    "[Entitlements] SQL Server Migration 'AddTrialPeriod' applied successfully.",
    "✅ Database tables up to date.",
  ],
  "scripe db seed": [
    "🌱 Seeding data context objects...",
    "[IdentitySeeder] Default administrative role created.",
    "[PermissionSeeder] Synchronized 146 permissions.",
    "🌱 Dev seed data populated successfully.",
  ],
  "scripe check": [
    "⚡ Running full pre-push pipeline validation gate...",
    "🔍 Prettier formatting check: Pass.",
    "🔍 ESLint + Format lints: Pass.",
    "🔍 Dotnet formats: Pass.",
    "🔍 Backend test suite: 124 tests passed (0 failures).",
    "🔍 Frontend coverage check: 85% coverage (Pass).",
    "🎉 Validation succeeded! Ready to commit/push.",
  ],
  "scripe lint": [
    "🔍 ESLint verification check...",
    "[Frontend] No lint issues detected in 452 files.",
    "[Backend] dotnet format check completed - 0 formatting errors.",
  ],
  "scripe format": [
    "🎨 Formatting files via Prettier and dotnet format...",
    "[prettier] reformatted 14 files.",
    "[dotnet] formatted 3 file paths.",
    "✨ Workspace code layout stylized.",
  ],
  "scripe info": [
    "📋 Platform Dashboard Info:",
    "  OS: Windows 11 Home",
    "  Dotnet SDK: 10.0.100",
    "  Node Engine: v22.11.0",
    "  Package Manager: pnpm v11.6.0",
    "  Monorepo modules: Identity, Entitlements, Compliance, Customizer",
  ],
  "scripe doctor": [
    "🔍 Running prerequisite medical check...",
    "  Node.js: OK (v22.11.0)",
    "  Dotnet SDK: OK (10.0.100)",
    "  Pnpm Engine: OK (v11.6.0)",
    "  Docker Compose: OK",
    "  Redis Local Host: Connected (port 6379)",
    "🎉 All system requirements met. You are ready to develop!",
  ],
};

/**
 * Documentation for module export
 */
export function CliSimulator({ titleKey }: CliSimulatorProps) {
  const { t } = useDocsI18n();
  const [activeCmd, setActiveCmd] = useState<string>("scripe info");
  const [logs, setLogs] = useState<string[]>(mockOutputs["scripe info"]);

  const runCommand = (cmd: string) => {
    setActiveCmd(cmd);
    setLogs([
      "$ " + cmd,
      t("widgets.cliSimulator.executing"),
      ...(mockOutputs[cmd] || [t("widgets.cliSimulator.commandNotFound")]),
    ]);
  };

  return (
    <div className="mb-10">
      <div className="mb-3 text-lg font-semibold leading-none tracking-tight text-nx-ink">
        {t(titleKey)}
      </div>

      <div className="mb-4">
        <CliCommandInput commands={mockCommands} onSelectCommand={runCommand} />
      </div>

      <div className="docs-terminal-window">
        <div className="docs-terminal-header">
          <div className="docs-terminal-dots" aria-hidden="true">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
          </div>
          <span className="ms-4 text-[11px] text-nx-ink-3">
            {t("widgets.cliSimulator.windowLabel")}
          </span>
        </div>
        <div className="docs-terminal-body min-h-40 overflow-y-auto">
          <div className="docs-terminal-line">
            <span className="prompt">$</span> <span className="cmd">{activeCmd}</span>
          </div>
          <div className="mt-3">
            {logs.map((log, i) => (
              <div
                key={i}
                className={cn(
                  "docs-terminal-output",
                  (log.startsWith("✨") || log.startsWith("🎉") || log.startsWith("✅")) &&
                    "text-success",
                  log.startsWith("$") && "text-nx-accent"
                )}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
