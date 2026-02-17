"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
} from "@core/ui/select";
import { FileText, Loader2 } from "lucide-react";
import type { EmailTemplate } from "../../domain/entities/Email";
import type { IEmailRepository } from "../../domain/interfaces/IEmailRepository";

// ─── Props ──────────────────────────────────────────────────
export interface TemplatePickerProps {
      repository: IEmailRepository;
      onSelect: (template: EmailTemplate) => void;
}

export function TemplatePicker({ repository, onSelect }: TemplatePickerProps) {
      const { t } = useI18n();
      const [selectedId, setSelectedId] = useState<string>("");

      const { data, isLoading } = useQuery({
            queryKey: ["email-templates-list"],
            queryFn: async () => {
                  const result = await repository.getEmailTemplates({ page: 1, pageSize: 100 });
                  return result.items.filter((tpl) => tpl.isActive);
            },
            staleTime: 5 * 60 * 1000,
      });

      const templates = data ?? [];

      const handleApply = () => {
            const template = templates.find((tpl) => tpl.id === selectedId);
            if (template) {
                  onSelect(template);
            }
      };

      if (isLoading) {
            return (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("messaging.email.loadingTemplates") || "Loading templates..."}
                  </div>
            );
      }

      if (templates.length === 0) return null;

      return (
            <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Select value={selectedId} onValueChange={setSelectedId}>
                        <SelectTrigger className="w-[250px]">
                              <SelectValue placeholder={t("messaging.email.selectTemplate") || "Use a template..."} />
                        </SelectTrigger>
                        <SelectContent>
                              {templates.map((tpl) => (
                                    <SelectItem key={tpl.id} value={tpl.id}>
                                          <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2">
                                                      <span className="font-medium">{tpl.key}</span>
                                                      <Badge variant="outline" className="text-xs">
                                                            {tpl.language}
                                                      </Badge>
                                                      {tpl.category && (
                                                            <Badge variant="secondary" className="text-[10px]">
                                                                  {tpl.category}
                                                            </Badge>
                                                      )}
                                                </div>
                                                {tpl.description && (
                                                      <span className="text-xs text-muted-foreground truncate max-w-[220px]">
                                                            {tpl.description}
                                                      </span>
                                                )}
                                          </div>
                                    </SelectItem>
                              ))}
                        </SelectContent>
                  </Select>
                  <Button
                        variant="outline"
                        size="sm"
                        onClick={handleApply}
                        disabled={!selectedId}
                  >
                        {t("messaging.email.applyTemplate") || "Apply"}
                  </Button>
            </div>
      );
}
