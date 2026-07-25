"use client";

import { useCallback, useState } from "react";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import { cn } from "@core/common/utils";

interface ConfigBuilderProps {
  titleKey: string;
}

const selectClass = cn(
  "h-10 w-full appearance-none rounded-nx-control border border-nx-line bg-nx-ground px-3 py-2 text-sm text-nx-ink",
  "transition-[color,border-color,background-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
  "hover:border-nx-line-hi focus-visible:outline-none focus-visible:border-nx-accent focus-visible:shadow-nx-focus"
);

const labelClass = "mb-1.5 block text-xs font-medium text-nx-ink-2";

export function ConfigBuilder({ titleKey }: ConfigBuilderProps) {
  const { t } = useDocsI18n();
  const [provider, setProvider] = useState<string>("SqlServer");
  const [mode, setMode] = useState<string>("Single");
  const [jobs, setJobs] = useState<string>("Native");
  const [copied, setCopied] = useState(false);

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

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(appsettingsJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied by the browser; the button simply
      // stays in its un-copied state, matching CodeBlock's own fallback.
    }
  }, [appsettingsJson]);

  const outputFilename = t("widgets.configBuilder.outputFilename");

  return (
    <div className="mb-10 grid grid-cols-1 gap-6 rounded-nx-lg border border-nx-line bg-nx-surface p-6 md:grid-cols-[1fr_1.5fr]">
      <div className="flex flex-col gap-5">
        <h3 className="text-lg font-semibold leading-none tracking-tight text-nx-ink">
          {t(titleKey)}
        </h3>

        <div>
          <label htmlFor="config-builder-provider" className={labelClass}>
            {t("widgets.configBuilder.providerLabel")}
          </label>
          <select
            id="config-builder-provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className={selectClass}
          >
            <option value="SqlServer">{t("widgets.configBuilder.providerSqlServer")}</option>
            <option value="PostgreSql">{t("widgets.configBuilder.providerPostgres")}</option>
            <option value="Oracle">{t("widgets.configBuilder.providerOracle")}</option>
          </select>
        </div>

        <div>
          <label htmlFor="config-builder-mode" className={labelClass}>
            {t("widgets.configBuilder.modeLabel")}
          </label>
          <select
            id="config-builder-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className={selectClass}
          >
            <option value="Single">{t("widgets.configBuilder.modeSingle")}</option>
            <option value="Multi">{t("widgets.configBuilder.modeMulti")}</option>
          </select>
        </div>

        <div>
          <label htmlFor="config-builder-jobs" className={labelClass}>
            {t("widgets.configBuilder.jobsLabel")}
          </label>
          <select
            id="config-builder-jobs"
            value={jobs}
            onChange={(e) => setJobs(e.target.value)}
            className={selectClass}
          >
            <option value="Native">{t("widgets.configBuilder.jobsNative")}</option>
            <option value="Hangfire">{t("widgets.configBuilder.jobsHangfire")}</option>
            <option value="Quartz">{t("widgets.configBuilder.jobsQuartz")}</option>
          </select>
        </div>
      </div>

      <div className="docs-code-block">
        <div className="docs-code-header">
          <div className="flex items-center gap-3">
            <span className="docs-code-filename">{outputFilename}</span>
            <span className="docs-code-lang">JSON</span>
          </div>
          <button
            type="button"
            className="docs-code-copy"
            data-copied={copied}
            onClick={handleCopy}
            aria-label={t("common.copyCodeSample", { sample: outputFilename })}
          >
            {copied ? (
              <>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {t("common.codeCopied")}
              </>
            ) : (
              <>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                {t("common.copyCode")}
              </>
            )}
          </button>
        </div>
        <pre className="docs-code-pre" tabIndex={0} role="region" aria-label={outputFilename}>
          <code>{appsettingsJson}</code>
        </pre>
      </div>
    </div>
  );
}
