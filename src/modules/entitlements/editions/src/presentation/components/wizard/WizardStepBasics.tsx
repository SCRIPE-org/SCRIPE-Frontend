import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { useI18n } from "@core/providers/i18n-provider";
import type { CreateEditionRequest, UpdateEditionRequest } from "../../../domain/entities/EditionRequests";

interface WizardStepBasicsProps {
  form: CreateEditionRequest | UpdateEditionRequest;
  onChange: (updates: Partial<UpdateEditionRequest | CreateEditionRequest>) => void;
  isEditMode?: boolean;
}

export function WizardStepBasics({ form, onChange, isEditMode = false }: WizardStepBasicsProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="name">
            {t("entitlements.editions.wizard.internalName") || "Internal Name"} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={form.name ?? ""}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={t("entitlements.editions.wizard.internalNamePlaceholder") || "e.g. standard, enterprise"}
            className="font-mono text-sm"
          />
          {!isEditMode && (
            <p className="text-xs text-muted-foreground">
              {t("entitlements.editions.wizard.internalNameDesc") || "Unique slug. Used in API and configs."}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tierLevel">
            {t("entitlements.editions.wizard.tierLevel") || "Tier Level"} {!isEditMode && <span className="text-destructive">*</span>}
          </Label>
          <Input
            id="tierLevel"
            type="number"
            min={0}
            value={form.tierLevel ?? 0}
            onChange={(e) => onChange({ tierLevel: parseInt(e.target.value) || 0 })}
            placeholder={t("entitlements.editions.wizard.tierLevelPlaceholder") || "0 = Free, 1 = Standard, 2 = Enterprise"}
          />
          <p className="text-xs text-muted-foreground">
            {t("entitlements.editions.wizard.tierLevelDesc") || "Higher = more features inherited. 0 = Free."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="displayNameEn">
            {t("entitlements.editions.wizard.displayNameEn") || "Display Name (EN)"} {!isEditMode && <span className="text-destructive">*</span>}
          </Label>
          <Input
            id="displayNameEn"
            value={form.displayNameEn ?? ""}
            onChange={(e) => onChange({ displayNameEn: e.target.value })}
            placeholder={t("entitlements.editions.wizard.displayNameEnPlaceholder") || "Standard"}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="displayNameAr">
            {t("entitlements.editions.wizard.displayNameAr") || "Display Name (AR)"}
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

      <div className="space-y-1.5">
        <Label htmlFor="tagline">{t("entitlements.editions.wizard.tagline") || "Tagline"}</Label>
        <Input
          id="tagline"
          value={form.tagline ?? ""}
          onChange={(e) => onChange({ tagline: e.target.value })}
          placeholder={t("entitlements.editions.wizard.taglinePlaceholder") || "Best for growing teams"}
          maxLength={200}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">{t("entitlements.editions.wizard.description") || "Description"}</Label>
        <Textarea
          id="description"
          value={form.description ?? ""}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder={t("entitlements.editions.wizard.descriptionPlaceholder") || "A detailed description of what this edition offers..."}
          rows={3}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="recommendationLabels">
          {t("entitlements.editions.wizard.badgeLabels") || "Badge Labels (JSON array)"}
        </Label>
        <Input
          id="recommendationLabels"
          value={form.recommendationLabels ?? ""}
          onChange={(e) => onChange({ recommendationLabels: e.target.value })}
          placeholder='["Most Popular", "Best Value"]'
          className="font-mono text-sm"
        />
        {!isEditMode && (
          <p className="text-xs text-muted-foreground">
            {t("entitlements.editions.wizard.badgeLabelsDesc") || "JSON array of badge strings shown on the pricing card. Empty = no badge."}
          </p>
        )}
      </div>

      {isEditMode && (
        <div className="space-y-1.5">
          <Label htmlFor="overflowPolicy">{t("entitlements.editions.wizard.overflowPolicy") || "Overflow Policy"}</Label>
          <select
            id="overflowPolicy"
            value={(form as UpdateEditionRequest).overflowPolicy ?? "Block"}
            onChange={(e) => onChange({ overflowPolicy: e.target.value })}
            className="w-full border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="Block">{t("entitlements.editions.wizard.overflowBlock") || "Block — Reject downgrade if limits exceeded"}</option>
            <option value="Archive">{t("entitlements.editions.wizard.overflowArchive") || "Archive — Archive excess data on downgrade"}</option>
            <option value="Delete">{t("entitlements.editions.wizard.overflowDelete") || "Delete — Delete excess data on downgrade"}</option>
          </select>
        </div>
      )}
    </div>
  );
}
