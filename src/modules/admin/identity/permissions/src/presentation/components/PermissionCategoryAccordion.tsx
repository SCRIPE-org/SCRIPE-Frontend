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
        <div key={moduleGroup.module} className="rounded-lg border bg-card">
          {/* ── Module Header ── */}
          <div className="flex items-center gap-2.5 border-b bg-muted/30 px-4 py-3">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold tracking-wide text-foreground">
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
                className="border-b last:border-0"
              >
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Key className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{categoryGroup.category}</span>
                    <Badge variant="outline" className="ms-1 text-xs">
                      {categoryGroup.permissions.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3 pt-0">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
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
                          <TableRow key={permission.id} className="hover:bg-muted/25">
                            <TableCell className="text-sm font-medium">
                              {permission.getLocalizedName(language)}
                            </TableCell>
                            <TableCell>
                              <code className="rounded bg-muted px-2 py-1 text-sm">
                                {permission.code}
                              </code>
                            </TableCell>
                            <TableCell className="text-sm">{permission.resource}</TableCell>
                            <TableCell className="text-sm">{permission.action}</TableCell>
                            <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
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
