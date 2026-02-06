/**
 * Permission Category Accordion Component
 * 
 * Displays a category of permissions in a collapsible accordion.
 * Uses Table UI components for proper RTL/LTR support.
 */
"use client";

import { Badge } from "@core/ui/badge";
import { Key } from "lucide-react";
import {
      Accordion,
      AccordionContent,
      AccordionItem,
      AccordionTrigger,
} from "@core/ui/accordion";
import {
      Table,
      TableHeader,
      TableBody,
      TableHead,
      TableRow,
      TableCell,
} from "@core/ui/table";
import { useI18n } from "@core/providers/i18n-provider";
import type { Permission } from "../../domain/entities/Permission";

interface PermissionGroup {
      category: string;
      permissions: Permission[];
}

interface PermissionCategoryAccordionProps {
      groups: PermissionGroup[];
}

export function PermissionCategoryAccordion({ groups }: PermissionCategoryAccordionProps) {
      const { t, language } = useI18n();

      return (
            <Accordion type="multiple" className="w-full" defaultValue={groups.map(g => g.category)}>
                  {groups.map((group) => (
                        <AccordionItem key={group.category} value={group.category}>
                              <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center gap-3">
                                          <Key className="h-4 w-4 text-muted-foreground" />
                                          <span className="font-semibold">{group.category}</span>
                                          <Badge variant="secondary" className="ms-2">
                                                {group.permissions.length}
                                          </Badge>
                                    </div>
                              </AccordionTrigger>
                              <AccordionContent>
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
                                                      {group.permissions.map((permission) => (
                                                            <TableRow key={permission.id} className="hover:bg-muted/25">
                                                                  <TableCell className="font-medium text-sm">
                                                                        {permission.getLocalizedName(language)}
                                                                  </TableCell>
                                                                  <TableCell>
                                                                        <code className="text-sm bg-muted px-2 py-1 rounded">
                                                                              {permission.code}
                                                                        </code>
                                                                  </TableCell>
                                                                  <TableCell className="text-sm">{permission.resource}</TableCell>
                                                                  <TableCell className="text-sm">{permission.action}</TableCell>
                                                                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
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
      );
}
