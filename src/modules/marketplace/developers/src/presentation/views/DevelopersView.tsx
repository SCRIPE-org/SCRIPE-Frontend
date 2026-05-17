"use client";

import { useDevelopersViewModel } from "../viewmodels/useDevelopersViewModel";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { ShieldCheck, Search } from "lucide-react";

export function DevelopersView() {
  const vm = useDevelopersViewModel();
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Developer Profiles</h2>
          <p className="text-sm text-muted-foreground">{vm.stats.total} total · {vm.stats.verified} verified</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input placeholder="Search developers..." className="pl-9" onChange={(e) => vm.setSearch(e.target.value)} />
        </div>
      </div>

      {vm.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vm.developers.map((dev) => (
            <Card key={dev.id} className="hover:shadow-sm transition-shadow">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="size-10 rounded-full bg-muted flex items-center justify-center font-bold text-sm shrink-0">
                  {dev.displayName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{dev.displayName}</span>
                    {dev.isVerified && <ShieldCheck className="size-3.5 text-blue-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{dev.contactEmail}</p>
                </div>
                <Badge variant="outline" className="shrink-0 text-xs">{dev.appCount} apps</Badge>
              </CardHeader>
              <CardContent className="pt-0 flex items-center justify-between">
                <span className="text-sm font-semibold text-green-600">{dev.revenueLabel}</span>
                {!dev.isVerified && (
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => vm.verify(dev.id)} disabled={vm.isVerifying}>
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
