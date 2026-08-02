"use client";

import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { ApiEndpoint } from "../../../domain/entities/DocSection";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@core/ui/table";

interface ApiTableProps {
  endpoints: ApiEndpoint[];
}

/**
 * Presentation UI component rendering the api table.
 * Composes the shared Table primitive from @core/ui/table. The method and
 * auth badges are categorical readings (HTTP verb, public/private), not
 * table structure, so they stay as inline chips inside the cell rather than
 * being folded into the primitive.
 */
export function ApiTable({ endpoints }: ApiTableProps) {
  const { t, direction } = useDocsI18n();

  return (
    <div className="mb-6 overflow-hidden rounded-nx-md border border-nx-line">
      <Table dir={direction}>
        <TableHeader className="bg-nx-raised">
          <TableRow>
            <TableHead>{t("api.method")}</TableHead>
            <TableHead>{t("api.endpoint")}</TableHead>
            <TableHead>{t("api.description")}</TableHead>
            <TableHead>{t("api.auth")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {endpoints.map((ep, idx) => (
            <TableRow key={idx}>
              <TableCell>
                <span className="docs-method-badge" data-method={ep.method}>
                  {ep.method}
                </span>
              </TableCell>
              <TableCell>
                <code className="docs-api-path">{ep.path}</code>
              </TableCell>
              <TableCell>{t(ep.descriptionKey)}</TableCell>
              <TableCell>
                <span className="docs-auth-badge" data-auth={ep.auth}>
                  {ep.auth ? <>🔒 {t("api.authRequired")}</> : <>🌐 {t("api.noAuth")}</>}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
