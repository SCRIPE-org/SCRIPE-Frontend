"use client";

/**
 * AccountAiCopilotView
 *
 * Sovereign Slice 11 (/account/ai-copilot):
 * SCRIPE AI Tactical Copilot Persona selector, Tactical Vocabulary & Scouting Metric Weights,
 * Automated UTC-backed Morning Executive Briefing schedule, and Personal AI Context & Memory Ledger.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { Switch } from "@core/ui/switch";
import { useAccountAiCopilotSliceViewModel } from "../viewmodels/useSovereignAccountSlicesViewModel";
import {
  Sparkles,
  Brain,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";

const PERSONA_KEYS = [
  "TACTICAL_ANALYST",
  "SPORTING_DIRECTOR",
  "MEDICAL_PERFORMANCE",
  "COMMERCIAL_EXECUTIVE",
] as const;

export function AccountAiCopilotView() {
  const { t } = useI18n();
  const { aiCopilot, updateAiCopilot, isUpdatingAiCopilot } =
    useAccountAiCopilotSliceViewModel();

  const [persona, setPersona] = useState(
    aiCopilot?.copilotPersona ?? "TACTICAL_ANALYST"
  );
  const [briefingEnabled, setBriefingEnabled] = useState(
    aiCopilot?.morningBriefingEnabled ?? true
  );
  const [briefingHourUtc, setBriefingHourUtc] = useState(
    String(aiCopilot?.morningBriefingUtcHour ?? 6)
  );
  const [newDirective, setNewDirective] = useState("");
  const [savedNotice, setSavedNotice] = useState(false);

  let memories: string[] = [];
  if (aiCopilot?.memoryEntriesJson) {
    try {
      const parsed = JSON.parse(aiCopilot.memoryEntriesJson);
      if (Array.isArray(parsed)) memories = parsed;
    } catch {
      memories = [];
    }
  }

  const handleSave = async (nextMemories = memories) => {
    await updateAiCopilot({
      copilotPersona: persona,
      morningBriefingEnabled: briefingEnabled,
      morningBriefingUtcHour: Number(briefingHourUtc) || 6,
      memoryEntriesJson: JSON.stringify(nextMemories),
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleAddMemory = async () => {
    if (!newDirective.trim()) return;
    const next = [...memories, newDirective.trim()];
    setNewDirective("");
    await handleSave(next);
  };

  const handleRemoveMemory = async (idx: number) => {
    const next = memories.filter((_, i) => i !== idx);
    await handleSave(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-nx-ink">
            {t("profile.aiCopilot.title")}
          </h1>
          <p className="text-xs text-nx-ink-3 mt-1">
            {t("profile.aiCopilot.description")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedNotice && (
            <Badge variant="outline" className="border-success/30 text-success bg-success/10 text-xs gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{t("profile.common.saved")}</span>
            </Badge>
          )}
          <Button
            type="button"
            size="sm"
            disabled={isUpdatingAiCopilot}
            onClick={() => handleSave()}
            data-testid="save-ai-copilot-btn"
            className="h-8 text-xs font-semibold"
          >
            {t("profile.common.saveChanges")}
          </Button>
        </div>
      </div>

      {/* 1. AI Tactical Copilot Persona Selector */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.aiCopilot.personaTitle")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.aiCopilot.personaDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PERSONA_KEYS.map((key) => {
            const isSelected = persona === key;
            return (
              <Button
                key={key}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setPersona(key)}
                data-testid={`ai-persona-${key}`}
                className="h-12 justify-between px-4 text-xs font-semibold"
              >
                <span>{t(`profile.aiCopilot.persona.${key}`)}</span>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-mono ${
                    isSelected
                      ? "border-nx-on-fill/30 text-nx-on-fill"
                      : "border-nx-line text-nx-ink-3"
                  }`}
                >
                  {key}
                </Badge>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* 2. Automated UTC-Backed Morning Executive Briefing */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.aiCopilot.briefingTitle")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3 mt-1">
              {t("profile.aiCopilot.briefingDesc")}
            </CardDescription>
          </div>
          <Switch
            checked={briefingEnabled}
            onCheckedChange={setBriefingEnabled}
            aria-label={t("profile.aiCopilot.briefingTitle")}
          />
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <span className="text-xs text-nx-ink-2">
            {t("profile.aiCopilot.briefingUtcHourLabel")}:
          </span>
          <Input
            type="number"
            min={0}
            max={23}
            value={briefingHourUtc}
            onChange={(e) => setBriefingHourUtc(e.target.value)}
            className="h-8 w-24 text-xs font-mono bg-nx-raised border-nx-line text-nx-ink"
          />
          <Badge variant="outline" className="text-[10px] font-mono border-nx-line bg-nx-raised text-nx-ink-3">
            UTC:00
          </Badge>
        </CardContent>
      </Card>

      {/* 3. Personal AI Context & Pinned Memory Directives */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.aiCopilot.memoryTitle")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.aiCopilot.memoryDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {memories.length === 0 ? (
            <p className="text-xs text-nx-ink-3">{t("profile.aiCopilot.noMemories")}</p>
          ) : (
            <div className="space-y-2">
              {memories.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-nx-line bg-nx-raised flex items-center justify-between gap-2 text-xs text-nx-ink"
                >
                  <span>{item}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMemory(idx)}
                    className="h-7 w-7 p-0 text-nx-ink-3 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={newDirective}
              onChange={(e) => setNewDirective(e.target.value)}
              placeholder={t("profile.aiCopilot.memoryPlaceholder")}
              className="h-8 text-xs bg-nx-raised border-nx-line text-nx-ink"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleAddMemory}
              data-testid="add-ai-memory-btn"
              className="h-8 text-xs font-semibold gap-1.5 shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t("profile.aiCopilot.addMemoryBtn")}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
