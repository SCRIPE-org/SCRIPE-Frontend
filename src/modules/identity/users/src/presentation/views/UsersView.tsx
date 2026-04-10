"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Card, CardContent } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Skeleton } from "@core/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { Users as UsersIcon, Search, Plus, Eye, Lock, Unlock, UserCheck, UserX, Shield, Activity, RefreshCw } from "lucide-react";
import { useUsersViewModel } from "../viewmodels/useUsersViewModel";

export function UsersView() {
  useModuleLocales(() => import("../../../locales"), "users");
  const { t } = useI18n();
  const vm = useUsersViewModel();

  const activeCount = vm.items.filter((u: any) => u.status === "Active").length;
  const mfaCount = vm.items.filter((u: any) => u.mfa || u.mfaEnabled).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
            <UsersIcon className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("users.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("users.description")}</p>
          </div>
        </div>
        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />{t("users.addUser")}</Button>
      </div>

      {/* Stats — computed from server data */}
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><UsersIcon className="h-4 w-4" />{t("users.totalUsers")}</div><p className="text-2xl font-bold">{vm.isLoading ? "—" : vm.totalCount}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><UserCheck className="h-4 w-4" />{t("users.activeUsers")}</div><p className="text-2xl font-bold text-green-500">{vm.isLoading ? "—" : activeCount}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Shield className="h-4 w-4" />{t("users.mfaEnabled")}</div><p className="text-2xl font-bold text-blue-500">{vm.isLoading ? "—" : mfaCount}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Activity className="h-4 w-4" />{t("users.activeToday")}</div><p className="text-2xl font-bold text-emerald-500">{vm.isLoading ? "—" : "—"}</p></CardContent></Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={t("users.searchPlaceholder")} value={vm.search} onChange={(e) => vm.handleSearch(e.target.value)} className="pl-9" />
      </div>

      {vm.isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : vm.error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-destructive mb-3">{t("common.errorLoading")}</p>
            <Button variant="outline" size="sm" onClick={() => vm.refetch()} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />{t("common.retry")}
            </Button>
          </CardContent>
        </Card>
      ) : vm.items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mb-4">
              <UsersIcon className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-lg mb-1">{t("users.empty")}</h3>
            <p className="text-sm text-muted-foreground">{t("users.emptyDesc")}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{t("users.name")}</TableHead>
                  <TableHead>{t("users.email")}</TableHead>
                  <TableHead>{t("users.tenant")}</TableHead>
                  <TableHead>{t("users.role")}</TableHead>
                  <TableHead>{t("users.status")}</TableHead>
                  <TableHead>{t("users.mfa")}</TableHead>
                  <TableHead>{t("users.lastLogin")}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vm.items.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-xs">{user.id}</TableCell>
                    <TableCell className="font-medium">{user.name ?? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                    <TableCell><Badge variant="outline">{user.tenant ?? user.tenantName}</Badge></TableCell>
                    <TableCell><Badge variant="secondary">{user.role ?? user.roleName}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={user.status === "Active" ? "success" : user.status === "Locked" ? "destructive" : "secondary"} className="gap-1">
                        {user.status === "Active" && <UserCheck className="h-3 w-3" />}
                        {user.status === "Locked" && <Lock className="h-3 w-3" />}
                        {user.status === "Inactive" && <UserX className="h-3 w-3" />}
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{(user.mfa || user.mfaEnabled) ? <Badge variant="success" className="text-[10px]">MFA</Badge> : <Badge variant="outline" className="text-[10px]">OFF</Badge>}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.lastLogin ?? user.lastLoginAt ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm"><Eye className="h-3.5 w-3.5" /></Button>
                        {user.status === "Locked" && <Button variant="ghost" size="sm" className="text-green-500"><Unlock className="h-3.5 w-3.5" /></Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
