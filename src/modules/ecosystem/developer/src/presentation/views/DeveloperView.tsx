"use client";

import { useDeveloperViewModel } from "../viewmodels/useDeveloperViewModel";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import { Code, Webhook, Activity, Terminal } from "lucide-react";

export function DeveloperView() {
  const vm = useDeveloperViewModel();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Code className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Developer Portal</h1>
            <p className="text-sm text-muted-foreground">API overview, webhook testing, SDK examples, health checks</p>
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      {vm.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : vm.error ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-destructive">Failed to load developer portal. Please try again.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">API Version</CardTitle>
                <Terminal className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">v1</div>
                <p className="text-xs text-muted-foreground mt-1">Current stable API</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
                <Code className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">50+</div>
                <p className="text-xs text-muted-foreground mt-1">RESTful API endpoints</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Webhooks</CardTitle>
                <Webhook className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">Active</Badge>
                <p className="text-xs text-muted-foreground mt-1">Event-driven notifications</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Health Status</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge variant="default" className="bg-green-600">Healthy</Badge>
                <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
              </CardContent>
            </Card>
          </div>

          {/* SDK Languages */}
          <Card>
            <CardHeader>
              <CardTitle>SDK & Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {["TypeScript / JavaScript", "Python", "C# / .NET", "Go"].map((lang) => (
                  <div key={lang} className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
                    <Code className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{lang}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
