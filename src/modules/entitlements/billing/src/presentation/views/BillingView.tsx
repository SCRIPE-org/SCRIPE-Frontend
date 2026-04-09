"use client";

import { useBillingViewModel } from "../viewmodels/useBillingViewModel";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import { Receipt, CreditCard, DollarSign, TrendingUp } from "lucide-react";

export function BillingView() {
  const vm = useBillingViewModel();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Receipt className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Billing & Payments</h1>
            <p className="text-sm text-muted-foreground">Billing configuration, Stripe Connect, revenue overview</p>
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
            <p className="text-destructive">Failed to load billing data. Please try again.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Payment Mode</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Configured</div>
              <p className="text-xs text-muted-foreground mt-1">Gateway integration active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Stripe Connect</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">Connected</Badge>
              <p className="text-xs text-muted-foreground mt-1">Ready to receive payments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vm.totalCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Published pricing plans</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
