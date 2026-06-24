"use client";

import { Button } from "@core/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";

interface LogsPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * React presentation component representing the logs pagination UI element.
 */
export function LogsPagination({ page, totalPages, onPageChange }: LogsPaginationProps) {
  const { t } = useI18n();
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 border-t p-4">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-xs text-muted-foreground">
        {t("plugins.logsPage", { page: String(page), total: String(totalPages) })}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
