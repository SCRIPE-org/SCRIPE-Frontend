/**
 * Permission Module Accordion Component
 *
 * Renders the backend-driven Module → Category → Permissions hierarchy.
 * ZERO client-side grouping — tree comes directly from the API.
 *
 * Backend endpoint: GET /permissions/grouped
 * Returns: PermissionModuleGroup[] (Module → categories: PermissionCategoryGroup[])
 */
"use client";

import { Badge } from "@core/ui/badge";
import { Layers, Key } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@core/ui/accordion";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@core/ui/table";
import { useI18n } from "@core/providers/i18n-provider";
import type { PermissionModuleGroup } from "../../domain/entities/Permission";

interface PermissionCategoryAccordionProps {
  groups: PermissionModuleGroup[];
}

/**
 * Presentation UI component rendering the permission category accordion.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function PermissionCategoryAccordion({ groups }: PermissionCategoryAccordionProps) {
  const { t, language } = useI18n();

  return (
    <div className="space-y-4">
      {groups.map((moduleGroup) => (
        <div key={moduleGroup.module} className="rounded-nx-lg border border-nx-line bg-nx-surface">
          {/* ── Module Header ── */}
          <div className="flex items-center gap-2.5 border-b border-nx-line bg-nx-raised px-4 py-3">
            <Layers className="h-4 w-4 text-nx-accent" aria-hidden="true" />
            <span className="text-sm font-semibold tracking-wide text-nx-ink">
              {moduleGroup.module}
            </span>
            <Badge variant="secondary" className="ms-auto text-xs">
              {moduleGroup.categories.reduce((sum, cat) => sum + cat.permissions.length, 0)}
            </Badge>
          </div>

          {/* ── Category Accordions within Module ── */}
          <Accordion
            type="multiple"
            className="w-full"
            defaultValue={moduleGroup.categories.map((c) => `${moduleGroup.module}:${c.category}`)}
          >
            {moduleGroup.categories.map((categoryGroup) => (
              <AccordionItem
                key={categoryGroup.category}
                value={`${moduleGroup.module}:${categoryGroup.category}`}
                className="border-b border-nx-line last:border-0"
              >
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Key className="h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
                    <span className="text-sm font-medium">{categoryGroup.category}</span>
                    <Badge variant="outline" className="ms-1 text-xs">
                      {categoryGroup.permissions.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3 pt-0">
                  <div className="rounded-nx-md border border-nx-line">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("permission.name")}</TableHead>
                          <TableHead>{t("permission.code")}</TableHead>
                          <TableHead>{t("permission.resource")}</TableHead>
                          <TableHead>{t("permission.action")}</TableHead>
                          <TableHead>{t("permission.descriptionCol")}</TableHead>
                          <TableHead>{t("permission.scope")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryGroup.permissions.map((permission) => (
                          <TableRow key={permission.id}>
                            <TableCell className="text-sm font-medium">
                              {permission.getLocalizedName(language)}
                            </TableCell>
                            <TableCell>
                              <code className="rounded-nx-sm bg-nx-raised px-2 py-1 text-sm">
                                {permission.code}
                              </code>
                            </TableCell>
                            <TableCell className="text-sm">{permission.resource}</TableCell>
                            <TableCell className="text-sm">{permission.action}</TableCell>
                            <TableCell className="max-w-xs truncate text-sm text-nx-ink-2">
                              {permission.getLocalizedDescription(language) || "-"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {permission.defaultScope}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
}
