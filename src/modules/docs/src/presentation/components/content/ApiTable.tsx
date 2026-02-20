"use client";

import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { ApiEndpoint } from "../../../domain/entities/DocSection";

interface ApiTableProps {
  endpoints: ApiEndpoint[];
}

export function ApiTable({ endpoints }: ApiTableProps) {
  const { t } = useDocsI18n();

  return (
    <div style={{ overflowX: "auto", marginBottom: "1.5rem" }}>
      <table className="docs-api-table">
        <thead>
          <tr>
            <th>{t("api.method")}</th>
            <th>{t("api.endpoint")}</th>
            <th>{t("api.description")}</th>
            <th>{t("api.auth")}</th>
          </tr>
        </thead>
        <tbody>
          {endpoints.map((ep, idx) => (
            <tr key={idx}>
              <td>
                <span className="docs-method-badge" data-method={ep.method}>
                  {ep.method}
                </span>
              </td>
              <td>
                <code className="docs-api-path">{ep.path}</code>
              </td>
              <td>{t(ep.descriptionKey)}</td>
              <td>
                <span className="docs-auth-badge" data-auth={ep.auth}>
                  {ep.auth ? <>🔒 {t("api.authRequired")}</> : <>🌐 {t("api.noAuth")}</>}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
