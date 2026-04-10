"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { Skeleton } from "@core/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@core/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@core/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@core/ui/table";
import {
  Lock, Globe, Shield, AlertTriangle, MonitorSmartphone, Activity,
  Plus, Search, Trash2, CheckCircle2, XCircle, Wifi, RefreshCw,
  Smartphone, Laptop, Tablet, Loader2,
} from "lucide-react";
import { useSecurityPoliciesViewModel } from "../viewmodels/useSecurityPoliciesViewModel";

interface SecurityPoliciesViewProps {
  defaultTab?: string;
}

function TabLoading() {
  return <div className="space-y-2 py-8">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>;
}

function TabError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <p className="text-sm text-destructive mb-3">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry} className="gap-2"><RefreshCw className="h-3.5 w-3.5" />Retry</Button>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4"><Icon className="h-8 w-8 text-muted-foreground/50" /></div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{description}</p>
    </div>
  );
}

const DEVICE_ICONS: Record<string, any> = { MacBook: Laptop, iPhone: Smartphone, iPad: Tablet, Windows: Laptop, default: Laptop };
function getDeviceIcon(name: string) {
  for (const [key, icon] of Object.entries(DEVICE_ICONS)) {
    if (key !== "default" && name?.includes(key)) return icon;
  }
  return DEVICE_ICONS.default;
}

export function SecurityPoliciesView({ defaultTab }: SecurityPoliciesViewProps) {
  useModuleLocales(() => import("../../../locales"), "security-policies");
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState(defaultTab || "ipPolicies");
  const [geoIpInput, setGeoIpInput] = useState("");
  const vm = useSecurityPoliciesViewModel();

  // ── Add IP Policy Dialog State ──
  const [showIpDialog, setShowIpDialog] = useState(false);
  const [ipForm, setIpForm] = useState({ cidr: "", policyType: "Allow", label: "" });
  const [isSubmittingIp, setIsSubmittingIp] = useState(false);

  const handleAddIpPolicy = useCallback(async () => {
    if (!ipForm.cidr) return;
    setIsSubmittingIp(true);
    try {
      await vm.createIpPolicy({
        cidr: ipForm.cidr,
        policyType: ipForm.policyType,
        label: ipForm.label,
      });
      setShowIpDialog(false);
      setIpForm({ cidr: "", policyType: "Allow", label: "" });
    } finally {
      setIsSubmittingIp(false);
    }
  }, [ipForm, vm]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
          <Lock className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("securityPolicies.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("securityPolicies.description")}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ipPolicies" className="gap-2"><Shield className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t("securityPolicies.tabs.ipPolicies")}</span></TabsTrigger>
          <TabsTrigger value="geoip" className="gap-2"><Globe className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t("securityPolicies.tabs.geoip")}</span></TabsTrigger>
          <TabsTrigger value="anomaly" className="gap-2"><AlertTriangle className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t("securityPolicies.tabs.anomaly")}</span></TabsTrigger>
          <TabsTrigger value="siem" className="gap-2"><Activity className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t("securityPolicies.tabs.siem")}</span></TabsTrigger>
          <TabsTrigger value="devices" className="gap-2"><MonitorSmartphone className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t("securityPolicies.tabs.devices")}</span></TabsTrigger>
        </TabsList>

        {/* ───── IP Policies ───── */}
        <TabsContent value="ipPolicies">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-blue-500" />{t("securityPolicies.ipPolicies.title")}</CardTitle>
                <CardDescription>{t("securityPolicies.ipPolicies.description")}</CardDescription>
              </div>
              <Button size="sm" className="gap-2" onClick={() => setShowIpDialog(true)}><Plus className="h-4 w-4" />{t("securityPolicies.ipPolicies.addRule")}</Button>
            </CardHeader>
            <CardContent>
              {vm.ipPolicies.isLoading ? <TabLoading /> : vm.ipPolicies.error ? <TabError message={t("common.errorLoading")} onRetry={() => vm.ipPolicies.refetch()} /> : vm.ipPolicies.items.length === 0 ? <EmptyState icon={Shield} title="No IP policies" description="Add IP allow/block rules to secure access." /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>{t("securityPolicies.ipPolicies.cidr")}</TableHead><TableHead>{t("securityPolicies.ipPolicies.policyType")}</TableHead><TableHead>{t("securityPolicies.ipPolicies.label")}</TableHead><TableHead>{t("securityPolicies.ipPolicies.createdAt")}</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {vm.ipPolicies.items.map((rule: any, i: number) => (
                      <TableRow key={rule.id ?? i}>
                        <TableCell className="font-mono text-sm">{rule.cidr}</TableCell>
                        <TableCell>
                          <Badge variant={rule.type === "Allow" || rule.policyType === "Allow" ? "success" : "destructive"} className="gap-1">
                            {(rule.type ?? rule.policyType) === "Allow" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            {rule.type ?? rule.policyType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{rule.label ?? rule.description}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{rule.created ?? rule.createdAt}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => vm.deleteIpPolicy(rule.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Add IP Policy Dialog */}
          <Dialog open={showIpDialog} onOpenChange={setShowIpDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  {t("securityPolicies.ipPolicies.addRule")}
                </DialogTitle>
                <DialogDescription>
                  Add an IP allow or block rule to control access.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="ip-cidr">CIDR Range</Label>
                  <Input
                    id="ip-cidr"
                    placeholder="192.168.1.0/24 or 10.0.0.1/32"
                    className="font-mono"
                    value={ipForm.cidr}
                    onChange={(e) => setIpForm((prev) => ({ ...prev, cidr: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ip-type">Policy Type</Label>
                  <Select value={ipForm.policyType} onValueChange={(v) => setIpForm((prev) => ({ ...prev, policyType: v }))}>
                    <SelectTrigger id="ip-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Allow">
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Allow</span>
                      </SelectItem>
                      <SelectItem value="Block">
                        <span className="flex items-center gap-2"><XCircle className="h-3.5 w-3.5 text-red-500" /> Block</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ip-label">Label (optional)</Label>
                  <Input
                    id="ip-label"
                    placeholder="e.g. Office VPN, Partner API"
                    value={ipForm.label}
                    onChange={(e) => setIpForm((prev) => ({ ...prev, label: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowIpDialog(false)}>Cancel</Button>
                <Button onClick={handleAddIpPolicy} disabled={isSubmittingIp || !ipForm.cidr} className="gap-2">
                  {isSubmittingIp && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmittingIp ? "Adding..." : "Add Rule"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ───── GeoIP ───── */}
        <TabsContent value="geoip">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-emerald-500" />{t("securityPolicies.geoip.title")}</CardTitle>
              <CardDescription>{t("securityPolicies.geoip.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-3">
                <Input placeholder={t("securityPolicies.geoip.ipAddress")} className="max-w-xs font-mono" value={geoIpInput} onChange={(e) => setGeoIpInput(e.target.value)} />
                <Button className="gap-2" onClick={() => geoIpInput && vm.resolveGeoIp(geoIpInput)} disabled={vm.isResolvingGeoIp}>
                  {vm.isResolvingGeoIp ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {t("securityPolicies.geoip.resolve")}
                </Button>
              </div>
              {vm.geoIpResult != null && (
                <Card className="border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <CardContent className="pt-4">
                    <pre className="text-xs font-mono overflow-auto">{JSON.stringify(vm.geoIpResult, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
              <div>
                <h4 className="font-semibold mb-3">{t("securityPolicies.geoip.blockedCountries")}</h4>
                <p className="text-sm text-muted-foreground">{t("securityPolicies.geoip.description")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───── Anomaly Detection ───── */}
        <TabsContent value="anomaly">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" />{t("securityPolicies.anomaly.title")}</CardTitle>
              <CardDescription>{t("securityPolicies.anomaly.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {vm.anomaly.isLoading ? <TabLoading /> : vm.anomaly.error ? <TabError message={t("common.errorLoading")} onRetry={() => {}} /> : !vm.anomaly.data ? <EmptyState icon={AlertTriangle} title="No anomaly rules" description="Configure anomaly detection rules." /> : (
                <div className="grid gap-4 md:grid-cols-2">
                  {(Array.isArray(vm.anomaly.data) ? vm.anomaly.data : (vm.anomaly.data as any)?.rules ?? []).map((rule: any, i: number) => (
                    <Card key={rule.id ?? i} className={`${!rule.enabled ? "opacity-50" : ""}`}>
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">{rule.rule ?? rule.name}</h4>
                          <Switch checked={rule.enabled} />
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p><span className="font-medium text-foreground">{t("securityPolicies.anomaly.threshold")}:</span> {rule.threshold}</p>
                          <p><span className="font-medium text-foreground">{t("securityPolicies.anomaly.action")}:</span> <Badge variant="outline" className="text-xs">{rule.action}</Badge></p>
                          <p><span className="font-medium text-foreground">{t("securityPolicies.anomaly.lastTriggered")}:</span> {rule.lastTriggered ?? "Never"}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───── SIEM ───── */}
        <TabsContent value="siem">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-purple-500" />{t("securityPolicies.siem.title")}</CardTitle>
              <CardDescription>{t("securityPolicies.siem.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {vm.siem.isLoading ? <TabLoading /> : vm.siem.error ? <TabError message={t("common.errorLoading")} onRetry={() => {}} /> : (
                <>
                  <div className="flex items-center gap-4 rounded-lg border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                      <Wifi className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{t("securityPolicies.siem.status")}</span>
                        <Badge variant="success">{(vm.siem.data as any)?.connectionStatus ?? t("securityPolicies.siem.statusConnected")}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{(vm.siem.data as any)?.provider ?? "—"} — {(vm.siem.data as any)?.endpoint ?? "—"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-foreground">{(vm.siem.data as any)?.eventsExported ?? "—"}</p><p className="text-xs text-muted-foreground">{t("securityPolicies.siem.eventsExported")}</p></CardContent></Card>
                    <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-foreground">{(vm.siem.data as any)?.format ?? "—"}</p><p className="text-xs text-muted-foreground">{t("securityPolicies.siem.format")}</p></CardContent></Card>
                    <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-foreground">{(vm.siem.data as any)?.lastExport ?? "—"}</p><p className="text-xs text-muted-foreground">{t("securityPolicies.siem.lastExport")}</p></CardContent></Card>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───── Device Sessions ───── */}
        <TabsContent value="devices">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><MonitorSmartphone className="h-5 w-5 text-cyan-500" />{t("securityPolicies.devices.title")}</CardTitle>
                <CardDescription>{t("securityPolicies.devices.description")}</CardDescription>
              </div>
              <Button variant="destructive" size="sm" className="gap-2" onClick={() => vm.revokeAllDevices()}>
                <Trash2 className="h-4 w-4" />{t("securityPolicies.devices.revokeAll")}
              </Button>
            </CardHeader>
            <CardContent>
              {vm.devices.isLoading ? <TabLoading /> : vm.devices.error ? <TabError message={t("common.errorLoading")} onRetry={() => vm.devices.refetch()} /> : vm.devices.items.length === 0 ? <EmptyState icon={MonitorSmartphone} title="No devices" description="No device sessions found." /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>{t("securityPolicies.devices.deviceName")}</TableHead><TableHead>{t("securityPolicies.devices.browser")}</TableHead><TableHead>{t("securityPolicies.devices.ipAddress")}</TableHead><TableHead>{t("securityPolicies.devices.lastActive")}</TableHead><TableHead>{t("securityPolicies.devices.isTrusted")}</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {vm.devices.items.map((d: any, i: number) => {
                      const DeviceIcon = getDeviceIcon(d.device ?? d.deviceName ?? "");
                      return (
                        <TableRow key={d.id ?? i}>
                          <TableCell className="font-medium"><div className="flex items-center gap-2"><DeviceIcon className="h-4 w-4 text-muted-foreground" />{d.device ?? d.deviceName}</div></TableCell>
                          <TableCell className="text-muted-foreground">{d.browser}</TableCell>
                          <TableCell className="font-mono text-sm">{d.ip ?? d.ipAddress}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{d.lastActive ?? d.lastActiveAt}</TableCell>
                          <TableCell>
                            {(d.trusted ?? d.isTrusted) ? (
                              <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" />{t("securityPolicies.devices.isTrusted")}</Badge>
                            ) : (
                              <Button variant="ghost" size="sm" className="text-xs" onClick={() => vm.trustDevice(d.id)}>{t("securityPolicies.devices.trustAction")}</Button>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive gap-1" onClick={() => vm.revokeDevice(d.id)}>
                              <XCircle className="h-3.5 w-3.5" />{t("securityPolicies.devices.revokeAction")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
