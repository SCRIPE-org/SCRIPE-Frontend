/**
 * Permission Table Skeleton Component
 *
 * Shimmer loading state for the permissions table.
 */
"use client";

import { Skeleton } from "@core/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@core/ui/accordion";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@core/ui/table";
import { useI18n } from "@core/providers/i18n-provider";

interface PermissionTableSkeletonProps {
  /** Number of category groups to show */
  groupCount?: number;
  /** Number of rows per group */
  rowsPerGroup?: number;
}

/**
 * Presentation UI component rendering the permission table skeleton.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function PermissionTableSkeleton({
  groupCount = 3,
  rowsPerGroup = 4,
}: PermissionTableSkeletonProps) {
  const { t } = useI18n();

  return (
    <div role="status" aria-label={t("common.loading")}>
      <Accordion type="multiple" className="w-full" defaultValue={["skeleton-0", "skeleton-1"]}>
        {Array.from({ length: groupCount }).map((_, groupIdx) => (
          <AccordionItem key={`skeleton-${groupIdx}`} value={`skeleton-${groupIdx}`}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Skeleton shape="circle" className="h-4 w-4" />
                <Skeleton shape="text" className="w-32" />
                <Skeleton shape="chip" className="ms-2 w-8" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="rounded-nx-md border border-nx-line">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("permission.code")}</TableHead>
                      <TableHead>{t("permission.resource")}</TableHead>
                      <TableHead>{t("permission.action")}</TableHead>
                      <TableHead>{t("permission.descriptionCol")}</TableHead>
                      <TableHead>{t("permission.scope")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: rowsPerGroup }).map((_, rowIdx) => (
                      <TableRow key={rowIdx}>
                        <TableCell>
                          <Skeleton shape="text" className="w-28" />
                        </TableCell>
                        <TableCell>
                          <Skeleton shape="text" className="w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton shape="text" className="w-12" />
                        </TableCell>
                        <TableCell>
                          <Skeleton shape="text" className="w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton shape="chip" />
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
  );
}
