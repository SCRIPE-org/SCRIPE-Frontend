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

export function PermissionTableSkeleton({
  groupCount = 3,
  rowsPerGroup = 4,
}: PermissionTableSkeletonProps) {
  const { t } = useI18n();

  return (
    <Accordion type="multiple" className="w-full" defaultValue={["skeleton-0", "skeleton-1"]}>
      {Array.from({ length: groupCount }).map((_, groupIdx) => (
        <AccordionItem key={`skeleton-${groupIdx}`} value={`skeleton-${groupIdx}`}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="ms-2 h-5 w-8 rounded-full" />
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
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
                        <Skeleton className="h-6 w-28 rounded" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 rounded-full" />
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
