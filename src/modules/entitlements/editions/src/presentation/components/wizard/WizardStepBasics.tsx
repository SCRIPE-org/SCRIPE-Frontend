"use client";

import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { useI18n } from "@core/providers/i18n-provider";
import { Tag, Globe, Award, ShieldAlert } from "lucide-react";
import type {
  CreateEditionRequest,
  UpdateEditionRequest,
} from "../../../domain/entities/EditionRequests";

interface WizardStepBasicsProps {
  form: CreateEditionRequest | UpdateEditionRequest;
  onChange: (updates: Partial<UpdateEditionRequest | CreateEditionRequest>) => void;
  isEditMode?: boolean;
}

function SectionHeader({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3 border-b border-border pb-4">
      <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4.5 w-4.5 text-primary" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

export function WizardStepBasics({ form, onChange, isEditMode = false }: WizardStepBasicsProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-10">
      {/* ── Section 1: Identity ── */}
      <section>
        <SectionHeader
          icon={Tag}
          title={t("entitlements.editions.wizard.identitySection") || "Identity & Metadata"}
          desc={
            t("entitlements.editions.wizard.identitySectionDesc") ||
            "Core identifiers and customer-facing display names."
          }
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">
              {t("entitlements.editions.wizard.internalName") || "Internal Name"}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={form.name ?? ""}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder={
                t("entitlements.editions.wizard.internalNamePlaceholder") ||
                "e.g. standard, enterprise"
              }
              className="font-mono text-sm"
              disabled={isEditMode}
            />
            <p className="text-xs text-muted-foreground">
              {t("entitlements.editions.wizard.internalNameDesc") ||
                "Unique slug used in API endpoints and configurations."}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tierLevel">
              {t("entitlements.editions.wizard.tierLevel") || "Tier Level"}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tierLevel"
              type="number"
              min={0}
              max={100}
              value={form.tierLevel ?? 0}
              onChange={(e) => onChange({ tierLevel: parseInt(e.target.value) || 0 })}
              placeholder={t("entitlements.editions.wizard.tierLevelPlaceholder") || "0"}
            />
            <p className="text-xs text-muted-foreground">
              {t("entitlements.editions.wizard.tierLevelDesc") ||
                "Priority level (0–100). 0 = Free tier, higher = more premium."}
            </p>
          </div>
        </div>
      </section>

      {/* ── Section 2: Display ── */}
      <section>
        <SectionHeader
          icon={Globe}
          title={t("entitlements.editions.wizard.displaySection") || "Customer-Facing Display"}
          desc={
            t("entitlements.editions.wizard.displaySectionDesc") ||
            "How this edition appears to tenants on pricing pages."
          }
        />
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="displayNameEn">
                {t("entitlements.editions.wizard.displayNameEn") || "Display Name (English)"}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="displayNameEn"
                value={form.displayNameEn ?? ""}
                onChange={(e) => onChange({ displayNameEn: e.target.value })}
                placeholder={
                  t("entitlements.editions.wizard.displayNameEnPlaceholder") ||
                  "e.g. Standard, Professional"
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayNameAr">
                {t("entitlements.editions.wizard.displayNameAr") || "Display Name (Arabic)"}
              </Label>
              <Input
                id="displayNameAr"
                value={form.displayNameAr ?? ""}
                onChange={(e) => onChange({ displayNameAr: e.target.value })}
                placeholder={t("entitlements.editions.wizard.displayNameArPlaceholder") || "قياسي"}
                dir="rtl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">
              {t("entitlements.editions.wizard.tagline") || "Tagline"}
            </Label>
            <Input
              id="tagline"
              value={form.tagline ?? ""}
              onChange={(e) => onChange({ tagline: e.target.value })}
              placeholder={
                t("entitlements.editions.wizard.taglinePlaceholder") ||
                "e.g. Best for growing teams"
              }
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              {t("entitlements.editions.wizard.description") || "Description"}
            </Label>
            <Textarea
              id="description"
              value={form.description ?? ""}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder={
                t("entitlements.editions.wizard.descriptionPlaceholder") ||
                "A detailed description..."
              }
              rows={3}
              className="resize-none"
            />
          </div>
        </div>
      </section>

      {/* ── Section 3: Badges ── */}
      <section>
        <SectionHeader
          icon={Award}
          title={t("entitlements.editions.wizard.badgeSection") || "Recommendation Badges"}
          desc={
            t("entitlements.editions.wizard.badgeSectionDesc") ||
            "Badges displayed on the pricing card to attract attention."
          }
        />
        <div className="space-y-2">
          <Label htmlFor="recommendationLabels">
            {t("entitlements.editions.wizard.badgeLabels") || "Badge Labels"}
          </Label>
          <Input
            id="recommendationLabels"
            value={form.recommendationLabels ?? ""}
            onChange={(e) => onChange({ recommendationLabels: e.target.value })}
            placeholder={
              t("entitlements.editions.wizard.badgeLabelsPlaceholder") ||
              '["Most Popular", "Best Value"]'
            }
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {t("entitlements.editions.wizard.badgeLabelsDesc") ||
              "JSON array of badge strings. Leave empty for no badges."}
          </p>
        </div>
      </section>

      {/* ── Section 4: Overflow Policy (edit mode only) ── */}
      {isEditMode && (
        <section>
          <SectionHeader
            icon={ShieldAlert}
            title={t("entitlements.editions.wizard.overflowSection") || "Downgrade Policy"}
            desc={
              t("entitlements.editions.wizard.overflowSectionDesc") ||
              "What happens when tenant resources exceed limits after downgrading."
            }
          />
          <div className="space-y-2">
            <Label htmlFor="overflowPolicy">
              {t("entitlements.editions.wizard.overflowPolicy") || "Overflow Policy"}
            </Label>
            <Select
              value={(form as UpdateEditionRequest).overflowPolicy ?? "Block"}
              onValueChange={(v) => onChange({ overflowPolicy: v })}
            >
              <SelectTrigger id="overflowPolicy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Block">
                  {t("entitlements.editions.wizard.overflowBlock") || "Block — Reject downgrade"}
                </SelectItem>
                <SelectItem value="Archive">
                  {t("entitlements.editions.wizard.overflowArchive") ||
                    "Archive — Archive excess data"}
                </SelectItem>
                <SelectItem value="Delete">
                  {t("entitlements.editions.wizard.overflowDelete") ||
                    "Delete — Remove excess data"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>
      )}
    </div>
  );
}
