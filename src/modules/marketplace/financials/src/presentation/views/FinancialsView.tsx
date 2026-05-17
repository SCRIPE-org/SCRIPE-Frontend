"use client";

import { useFinancialsViewModel } from "../viewmodels/useFinancialsViewModel";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader } from "@core/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { DollarSign, Play } from "lucide-react";

export function FinancialsView() {
  const vm = useFinancialsViewModel();
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-xl font-semibold">Marketplace Financials</h2>
        <p className="text-sm text-muted-foreground">Purchases and developer payouts</p>
      </div>

      <Tabs defaultValue="purchases">
        <TabsList>
          <TabsTrigger value="purchases">Purchases ({vm.purchasesPagination.totalCount})</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        {/* Purchases tab */}
        <TabsContent value="purchases" className="mt-4">
          {vm.isLoadingPurchases ? (
            <div className="flex flex-col gap-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
          ) : (
            <div className="flex flex-col gap-2">
              {vm.purchases.map((p) => (
                <Card key={p.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="p-2 bg-muted rounded-lg"><DollarSign className="size-4 text-green-500" /></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{p.appName}</p>
                      <p className="text-xs text-muted-foreground">{p.tenantName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-green-600">{p.amountLabel}</p>
                      <p className="text-xs text-muted-foreground">{new Date(p.purchasedAt).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Payouts tab */}
        <TabsContent value="payouts" className="mt-4">
          {vm.isLoadingPayouts ? (
            <div className="flex flex-col gap-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
          ) : (
            <div className="flex flex-col gap-2">
              {vm.payouts.map((payout) => (
                <Card key={payout.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{payout.developerName}</p>
                        <Badge variant={payout.statusVariant} className="text-xs">{payout.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payout.periodStart).toLocaleDateString()} — {new Date(payout.periodEnd).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-sm">{payout.amountLabel}</p>
                      {payout.canProcess && (
                        <Button size="sm" className="gap-1.5" onClick={() => vm.processPayout({ id: payout.id })} disabled={vm.isProcessingPayout}>
                          <Play className="size-3.5" /> Process
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
