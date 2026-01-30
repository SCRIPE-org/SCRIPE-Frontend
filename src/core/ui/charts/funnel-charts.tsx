"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";

// Simple funnel chart component using CSS
const FunnelChart = ({ data, colors, title, description }: any) => {
  const maxValue = Math.max(...data.map((item: any) => item.value));
  
  return (
    <Card className="w-full bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-2xl">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {title}
        </CardTitle>
        <CardDescription className="text-slate-300 text-base">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-inner">
          <div className="space-y-2">
            {data.map((item: any, index: number) => {
              const width = (item.value / maxValue) * 100;
              return (
                <div key={index} className="relative">
                  <div
                    className="h-12 flex items-center justify-between px-4 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
                    style={{
                      width: `${width}%`,
                      backgroundColor: colors[index % colors.length],
                      minWidth: "200px",
                    }}
                  >
                    <span className="text-sm">{item.label}</span>
                    <span className="text-sm font-bold">{item.value}</span>
                  </div>
                  <div className="absolute top-0 right-0 h-12 w-0 border-l-[12px] border-l-transparent border-t-[24px] border-b-[24px] border-t-transparent border-b-transparent"
                       style={{ borderTopColor: colors[index % colors.length], borderBottomColor: colors[index % colors.length] }} />
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function ProfessionalFunnelCharts() {
  const { t } = useI18n();

  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"];

  const salesFunnelData = [
    { label: t("charts.common.leads"), value: 1000 },
    { label: t("charts.common.prospects"), value: 700 },
    { label: t("charts.common.qualified"), value: 400 },
    { label: t("charts.common.negotiation"), value: 200 },
    { label: t("charts.common.closed"), value: 100 },
  ];

  const marketingFunnelData = [
    { label: t("charts.common.impressions"), value: 5000 },
    { label: t("charts.common.clicks"), value: 1000 },
    { label: t("charts.common.signups"), value: 300 },
    { label: t("charts.common.conversions"), value: 50 },
  ];

  const userJourneyFunnelData = [
    { label: t("charts.common.visited"), value: 2000 },
    { label: t("charts.common.registered"), value: 800 },
    { label: t("charts.common.subscribed"), value: 400 },
    { label: t("charts.common.active"), value: 200 },
  ];

  const recruitmentFunnelData = [
    { label: t("charts.common.applicants"), value: 500 },
    { label: t("charts.common.screened"), value: 200 },
    { label: t("charts.common.interviewed"), value: 100 },
    { label: t("charts.common.offered"), value: 50 },
    { label: t("charts.common.hired"), value: 20 },
  ];

  const supportFunnelData = [
    { label: t("charts.common.ticketsOpened"), value: 300 },
    { label: t("charts.common.inProgress"), value: 150 },
    { label: t("charts.common.resolved"), value: 100 },
    { label: t("charts.common.closed"), value: 80 },
  ];

  const onboardingFunnelData = [
    { label: t("charts.common.started"), value: 1000 },
    { label: t("charts.common.profileComplete"), value: 600 },
    { label: t("charts.common.firstAction"), value: 400 },
    { label: t("charts.common.activated"), value: 300 },
  ];

  const productAdoptionFunnelData = [
    { label: t("charts.common.awareness"), value: 1500 },
    { label: t("charts.common.interest"), value: 1000 },
    { label: t("charts.common.consideration"), value: 700 },
    { label: t("charts.common.purchase"), value: 400 },
    { label: t("charts.common.loyalty"), value: 200 },
  ];

  const conversionRateFunnelData = [
    { label: t("charts.common.visitors"), value: 10000 },
    { label: t("charts.common.addCart"), value: 2000 },
    { label: t("charts.common.checkout"), value: 1000 },
    { label: t("charts.common.purchase"), value: 500 },
  ];

  return (
    <div className="space-y-8">
      <FunnelChart
        data={salesFunnelData}
        colors={colors}
        title={t("charts.funnel.sales.title")}
        description={t("charts.funnel.sales.description")}
      />

      <FunnelChart
        data={marketingFunnelData}
        colors={colors}
        title={t("charts.funnel.marketing.title")}
        description={t("charts.funnel.marketing.description")}
      />

      <FunnelChart
        data={userJourneyFunnelData}
        colors={colors}
        title={t("charts.funnel.userJourney.title")}
        description={t("charts.funnel.userJourney.description")}
      />

      <FunnelChart
        data={recruitmentFunnelData}
        colors={colors}
        title={t("charts.funnel.recruitment.title")}
        description={t("charts.funnel.recruitment.description")}
      />

      <FunnelChart
        data={supportFunnelData}
        colors={colors}
        title={t("charts.funnel.support.title")}
        description={t("charts.funnel.support.description")}
      />

      <FunnelChart
        data={onboardingFunnelData}
        colors={colors}
        title={t("charts.funnel.onboarding.title")}
        description={t("charts.funnel.onboarding.description")}
      />

      <FunnelChart
        data={productAdoptionFunnelData}
        colors={colors}
        title={t("charts.funnel.productAdoption.title")}
        description={t("charts.funnel.productAdoption.description")}
      />

      <FunnelChart
        data={conversionRateFunnelData}
        colors={colors}
        title={t("charts.funnel.conversionRate.title")}
        description={t("charts.funnel.conversionRate.description")}
      />
    </div>
  );
}
