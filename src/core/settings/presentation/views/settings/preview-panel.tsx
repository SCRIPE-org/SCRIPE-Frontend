"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Avatar, AvatarFallback } from "@core/ui/avatar";
import { Separator } from "@core/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@core/ui/tooltip";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { GenericTable } from "@core/crud/components/generic-table";
import { useI18n } from "@core/providers/i18n-provider";

export function PreviewPanel() {
  const { t } = useI18n();

  const sampleTableData = [
    {
      id: 1,
      name: t("settings.sampleTable.data.john"),
      email: t("settings.sampleTable.emails.john"),
      status: "active",
    },
    {
      id: 2,
      name: t("settings.sampleTable.data.jane"),
      email: t("settings.sampleTable.emails.jane"),
      status: "inactive",
    },
    {
      id: 3,
      name: t("settings.sampleTable.data.bob"),
      email: t("settings.sampleTable.emails.bob"),
      status: "active",
    },
  ];

  const sampleTableColumns = [
    { key: "name" as const, label: t("settings.sampleTable.name"), sortable: true },
    { key: "email" as const, label: t("settings.sampleTable.email"), sortable: true },
    {
      key: "status" as const,
      label: t("settings.sampleTable.status"),
      render: (value: string) => (
        <Badge variant={value === "active" ? "default" : "secondary"}>
          {t(`settings.sampleTable.${value}`)}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 lg:col-span-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.preview.title")}</CardTitle>
          <CardDescription>{t("settings.preview.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-semibold">{t("settings.preview.buttons.label")}</Label>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">{t("settings.preview.buttons.primary")}</Button>
              <Button size="sm" variant="secondary">
                {t("settings.preview.buttons.secondary")}
              </Button>
              <Button size="sm" variant="outline">
                {t("settings.preview.buttons.outline")}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-semibold">{t("settings.preview.badges.label")}</Label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="active">Active</Badge>
              <Badge variant="inactive">Inactive</Badge>
              <Badge variant="pending">Pending</Badge>
              <Badge variant="error">Error</Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-semibold">{t("settings.preview.avatars.label")}</Label>
            <div className="flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {t("settings.preview.avatars.sm")}
                </AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>{t("settings.preview.avatars.md")}</AvatarFallback>
              </Avatar>
              <Avatar className="h-12 w-12">
                <AvatarFallback>{t("settings.preview.avatars.lg")}</AvatarFallback>
              </Avatar>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-semibold">{t("settings.preview.input.label")}</Label>
            <Input placeholder={t("settings.preview.input.placeholder")} />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-semibold">{t("settings.preview.loading.label")}</Label>
            <div className="flex justify-center py-4">
              <div className="scale-50">
                <LoadingSpinner />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-semibold">{t("settings.preview.tooltip.label")}</Label>
            <div className="flex justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    {t("settings.preview.tooltip.trigger")}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("settings.preview.tooltip.content")}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-semibold">{t("settings.preview.table.label")}</Label>
            <div className="text-xs">
              <GenericTable data={sampleTableData} columns={sampleTableColumns} loading={false} />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-semibold">{t("settings.preview.card.label")}</Label>
            <Card className="p-3">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-sm">{t("settings.preview.card.title")}</CardTitle>
                <CardDescription className="text-xs">
                  {t("settings.preview.card.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-xs text-muted-foreground">
                  {t("settings.preview.card.content")}
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              {t("settings.preview.typography.label")}
            </Label>
            <div className="space-y-1">
              <h4 className="font-semibold">{t("settings.preview.typography.heading")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("settings.preview.typography.paragraph")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
