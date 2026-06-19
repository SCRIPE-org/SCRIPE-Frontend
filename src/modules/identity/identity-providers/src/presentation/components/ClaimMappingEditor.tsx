/**
 * Claim Mapping Editor
 *
 * Dual-mode editor:
 * 1. Visual Mapper (Key-Value dropdowns and inputs)
 * 2. Raw JSON Code editor (fallback)
 *
 * Synchronizes a single json string state (e.g. {"email":"email", "firstName":"given_name"})
 */
"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Textarea } from "@core/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { FileJson, List, Plus, Trash2, AlertCircle, Sparkles } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

interface VisualMapping {
  internalKey: string;
  externalClaim: string;
}

const INTERNAL_KEYS = [
  { value: "email", label: "Email Address (email)" },
  { value: "firstName", label: "First Name (given_name)" },
  { value: "lastName", label: "Last Name (family_name)" },
  { value: "name", label: "Full Name (name)" },
  { value: "picture", label: "Profile Picture URL (picture)" },
  { value: "userId", label: "User ID / Subject (sub)" },
  { value: "roles", label: "Roles / Entitlements (roles)" },
  { value: "groups", label: "Groups (groups)" },
];

export function ClaimMappingEditor({ value, onChange }: Props) {
  const { t } = useI18n();
  const claimLabels: Record<string, string> = {
    email: t("identityProviders.claimEmail"),
    firstName: t("identityProviders.claimFirstName"),
    lastName: t("identityProviders.claimLastName"),
    name: t("identityProviders.claimFullName"),
    picture: t("identityProviders.claimPicture"),
    userId: t("identityProviders.claimUserId"),
    roles: t("identityProviders.claimRoles"),
    groups: t("identityProviders.claimGroups"),
  };
  const [mode, setMode] = useState<"visual" | "json">("visual");
  const [jsonText, setJsonText] = useState(value || "{}");
  const [visualMappings, setVisualMappings] = useState<VisualMapping[]>([]);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Sync external value updates
  useEffect(() => {
    setJsonText(value || "{}");

    // Validate and parse for visual mapping
    try {
      const parsed = JSON.parse(value || "{}");
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const mappings = Object.entries(parsed).map(([k, v]) => ({
          internalKey: k,
          externalClaim: String(v),
        }));
        setVisualMappings(mappings);
        setJsonError(null);
      } else {
        throw new Error(t("identityProviders.jsonFlatObject"));
      }
    } catch (err) {
      setJsonError((err as Error).message);
      // Force JSON mode if parse fails
      setMode("json");
    }
  }, [value, t]);

  // Handle visual mapper updates
  const handleVisualChange = (mappings: VisualMapping[]) => {
    setVisualMappings(mappings);

    // Build JSON object
    const obj: Record<string, string> = {};
    mappings.forEach((m) => {
      if (m.internalKey.trim()) {
        obj[m.internalKey.trim()] = m.externalClaim;
      }
    });

    const newJson = JSON.stringify(obj, null, 2);
    setJsonText(newJson);
    onChange(newJson);
  };

  const addMappingRow = () => {
    // Find first unused key
    const usedKeys = visualMappings.map((m) => m.internalKey);
    const nextKey = INTERNAL_KEYS.find((k) => !usedKeys.includes(k.value))?.value || "email";

    handleVisualChange([...visualMappings, { internalKey: nextKey, externalClaim: "" }]);
  };

  const removeMappingRow = (index: number) => {
    const updated = [...visualMappings];
    updated.splice(index, 1);
    handleVisualChange(updated);
  };

  const updateMappingRow = (index: number, field: keyof VisualMapping, val: string) => {
    const updated = [...visualMappings];
    updated[index] = { ...updated[index], [field]: val };
    handleVisualChange(updated);
  };

  // Handle direct JSON updates
  const handleJsonChange = (val: string) => {
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        setJsonError(null);
        // Also update visual mapping behind the scenes
        const mappings = Object.entries(parsed).map(([k, v]) => ({
          internalKey: k,
          externalClaim: String(v),
        }));
        setVisualMappings(mappings);
        onChange(val);
      } else {
        setJsonError(t("identityProviders.jsonFlatObject"));
      }
    } catch (err) {
      setJsonError(t("identityProviders.invalidJson"));
    }
  };

  return (
    <div className="space-y-4">
      {/* Selector Header Bar */}
      <div className="flex items-center justify-between border-b pb-2">
        <Label className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Sparkles className="h-4 w-4 text-purple-500" />
          {t("identityProviders.claimMappings") || "Claim Mappings"}
        </Label>

        {/* Toggle between Visual and Raw JSON */}
        <div className="flex items-center gap-1 rounded-md border bg-muted/40 p-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (jsonError) return; // Prevent toggling if JSON is broken
              setMode("visual");
            }}
            disabled={!!jsonError}
            className={`h-7 gap-1.5 px-2.5 text-xs ${
              mode === "visual"
                ? "bg-background text-foreground shadow-sm hover:bg-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            {t("identityProviders.visualEditor") || "Visual"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMode("json")}
            className={`h-7 gap-1.5 px-2.5 text-xs ${
              mode === "json"
                ? "bg-background text-foreground shadow-sm hover:bg-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileJson className="h-3.5 w-3.5" />
            {t("identityProviders.jsonEditor") || "JSON"}
          </Button>
        </div>
      </div>

      {/* Visual Editor Mode */}
      {mode === "visual" && (
        <div className="space-y-3">
          {visualMappings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/10 px-4 py-8 text-center">
              <List className="mb-2 h-8 w-8 text-muted-foreground/60" />
              <p className="text-xs text-muted-foreground">
                {t("identityProviders.noMappings") || "No claim mappings configured yet."}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMappingRow}
                className="mt-3 gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                {t("identityProviders.addMapping") || "Add Claim Mapping"}
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-[45%] py-2 text-xs font-semibold">
                      {t("identityProviders.internalAttribute") || "Internal Attribute"}
                    </TableHead>
                    <TableHead className="w-[45%] py-2 text-xs font-semibold">
                      {t("identityProviders.externalClaimKey") || "External Claim Key"}
                    </TableHead>
                    <TableHead className="w-[10%] py-2 text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visualMappings.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="py-2.5">
                        <Select
                          value={row.internalKey}
                          onValueChange={(val) => updateMappingRow(idx, "internalKey", val)}
                        >
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {INTERNAL_KEYS.map((opt) => (
                              <SelectItem
                                key={opt.value}
                                value={opt.value}
                                disabled={visualMappings.some(
                                  (m, i) => m.internalKey === opt.value && i !== idx
                                )}
                                className="text-xs"
                              >
                                {claimLabels[opt.value] || opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <Input
                          value={row.externalClaim}
                          onChange={(e) => updateMappingRow(idx, "externalClaim", e.target.value)}
                          placeholder={
                            t("identityProviders.claimPlaceholder") ||
                            "e.g. given_name or http://..."
                          }
                          className="h-9 font-mono text-xs"
                        />
                      </TableCell>
                      <TableCell className="py-2.5 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMappingRow(idx)}
                          className="h-8 w-8 text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {visualMappings.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMappingRow}
              className="w-full justify-center gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              {t("identityProviders.addMapping") || "Add Claim Mapping"}
            </Button>
          )}
        </div>
      )}

      {/* JSON Raw Code Editor Mode */}
      {mode === "json" && (
        <div className="space-y-2">
          <Textarea
            value={jsonText}
            onChange={(e) => handleJsonChange(e.target.value)}
            placeholder='{ "email": "email", "firstName": "given_name" }'
            className="min-h-[180px] resize-y border bg-[#1e1e1e] p-3 font-mono text-xs leading-relaxed text-emerald-400 focus-visible:ring-purple-500/50 dark:text-emerald-300"
          />

          {jsonError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/50 p-2.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/10 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>
                {t("identityProviders.invalidJson") || "Invalid Format"}: {jsonError}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
