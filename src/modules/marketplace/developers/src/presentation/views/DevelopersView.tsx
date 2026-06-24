"use client";

import { useDevelopersViewModel } from "../viewmodels/useDevelopersViewModel";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { ShieldCheck, Search } from "lucide-react";

/**
 * Presentation UI component rendering the developers view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function DevelopersView() {
  const vm = useDevelopersViewModel();
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Developer Profiles</h2>
          <p className="text-sm text-muted-foreground">
            {vm.stats.total} total · {vm.stats.verified} verified
          </p>
        </div>
        <div className="relative w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search developers..."
            className="pl-9"
            onChange={(e) => vm.setSearch(e.target.value)}
          />
        </div>
      </div>

      {vm.isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {vm.developers.map((dev) => (
            <Card key={dev.id} className="transition-shadow hover:shadow-sm">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold">
                  {dev.displayName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{dev.displayName}</span>
                    {dev.isVerified && <ShieldCheck className="size-3.5 shrink-0 text-blue-500" />}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{dev.contactEmail}</p>
                </div>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {dev.appCount} apps
                </Badge>
              </CardHeader>
              <CardContent className="flex items-center justify-between pt-0">
                <span className="text-sm font-semibold text-green-600">{dev.revenueLabel}</span>
                {!dev.isVerified && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => vm.verify(dev.id)}
                    disabled={vm.isVerifying}
                  >
                    <ShieldCheck className="size-3.5" /> Verify
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
