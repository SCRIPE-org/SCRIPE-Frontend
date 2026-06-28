"use client";

import { useState } from "react";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import { Button } from "@core/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@core/ui/card";

type Persona = "investor" | "cofounder" | "partner" | null;

export function PersonaSelector() {
  const { t } = useDocsI18n();
  const [selected, setSelected] = useState<Persona>(null);

  const getPersonaContent = () => {
    switch (selected) {
      case "investor":
        return {
          title: t("commercial.investorOverview.personaSelectorInvestor"),
          desc: t("commercial.investorOverview.personaSelectorInvestorDesc"),
          benefits: [
            t("commercial.investorOverview.personaSelectorInvestorBenefit1"),
            t("commercial.investorOverview.personaSelectorInvestorBenefit2"),
            t("commercial.investorOverview.personaSelectorInvestorBenefit3"),
          ],
        };
      case "cofounder":
        return {
          title: t("commercial.investorOverview.personaSelectorCofounder"),
          desc: t("commercial.investorOverview.personaSelectorCofounderDesc"),
          benefits: [
            t("commercial.investorOverview.personaSelectorCofounderBenefit1"),
            t("commercial.investorOverview.personaSelectorCofounderBenefit2"),
            t("commercial.investorOverview.personaSelectorCofounderBenefit3"),
          ],
        };
      case "partner":
        return {
          title: t("commercial.investorOverview.personaSelectorPartner"),
          desc: t("commercial.investorOverview.personaSelectorPartnerDesc"),
          benefits: [
            t("commercial.investorOverview.personaSelectorPartnerBenefit1"),
            t("commercial.investorOverview.personaSelectorPartnerBenefit2"),
            t("commercial.investorOverview.personaSelectorPartnerBenefit3"),
          ],
        };
      default:
        return null;
    }
  };

  const currentContent = getPersonaContent();

  return (
    <div className="my-8 flex flex-col space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold tracking-tight mb-2">
          {t("commercial.investorOverview.personaSelectorQuestion")}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className={`cursor-pointer border transition-all ${
            selected === "investor" ? "border-primary ring-2 ring-primary/20" : "hover:border-border/80"
          }`}
          onClick={() => setSelected("investor")}
        >
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>💼</span> {t("commercial.investorOverview.personaSelectorInvestor")}
            </CardTitle>
            <CardDescription>
              {t("commercial.investorOverview.personaSelectorInvestorDesc")}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card
          className={`cursor-pointer border transition-all ${
            selected === "cofounder" ? "border-primary ring-2 ring-primary/20" : "hover:border-border/80"
          }`}
          onClick={() => setSelected("cofounder")}
        >
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>🚀</span> {t("commercial.investorOverview.personaSelectorCofounder")}
            </CardTitle>
            <CardDescription>
              {t("commercial.investorOverview.personaSelectorCofounderDesc")}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card
          className={`cursor-pointer border transition-all ${
            selected === "partner" ? "border-primary ring-2 ring-primary/20" : "hover:border-border/80"
          }`}
          onClick={() => setSelected("partner")}
        >
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>🤝</span> {t("commercial.investorOverview.personaSelectorPartner")}
            </CardTitle>
            <CardDescription>
              {t("commercial.investorOverview.personaSelectorPartnerDesc")}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {currentContent && (
        <Card className="border border-primary/20 bg-primary/5 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl">{currentContent.title}</CardTitle>
            <CardDescription>{currentContent.desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc ltr:pl-5 rtl:pr-5 space-y-2 text-sm text-muted-foreground">
              {currentContent.benefits.map((benefit, idx) => (
                <li key={idx}>{benefit}</li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="default" size="sm">
              {t("commercial.investorOverview.personaSelectorLearnMore")}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
