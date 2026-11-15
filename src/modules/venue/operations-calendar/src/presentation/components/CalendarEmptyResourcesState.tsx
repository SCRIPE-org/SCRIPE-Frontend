"use client";

import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";

interface Props {
  t: (key: string, params?: Record<string, string | number>) => string;
  hasAnyResources?: boolean;
}

/**
 * Empty state rendered when the selected facility or venue has no configured courts/resources.
 */
export function CalendarEmptyResourcesState({ t, hasAnyResources = false }: Props) {
  return (
    <EmptyState
      icon={CalendarDays}
      title={
        hasAnyResources
          ? t("operationsCalendar.empty.branchEmptyTitle")
          : t("operationsCalendar.empty.title")
      }
      description={
        hasAnyResources
          ? t("operationsCalendar.empty.branchEmptyDescription")
          : t("operationsCalendar.empty.description")
      }
      action={
        <Button asChild>
          <Link href="/venue/resources?setup=new">
            <Plus className="me-1.5 size-4" aria-hidden="true" />
            {t("operationsCalendar.empty.action")}
          </Link>
        </Button>
      }
    />
  );
}
