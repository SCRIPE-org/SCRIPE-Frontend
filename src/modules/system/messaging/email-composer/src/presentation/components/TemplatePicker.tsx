"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Input } from "@core/ui/input";
import {
      Popover,
      PopoverContent,
      PopoverTrigger,
} from "@core/ui/popover";
import { ScrollArea } from "@core/ui/scroll-area";
import { FileText, Loader2, Search, Check, ChevronDown, X } from "lucide-react";
import { cn } from "@core/common/utils";
import type { EmailTemplate } from "../../domain/entities/Email";
import type { IEmailRepository } from "../../domain/interfaces/IEmailRepository";

// ─── Props ──────────────────────────────────────────────────
export interface TemplatePickerProps {
      repository: IEmailRepository;
      onSelect: (template: EmailTemplate) => void;
}

export function TemplatePicker({ repository, onSelect }: TemplatePickerProps) {
      const { t } = useI18n();
      const [open, setOpen] = useState(false);
      const [search, setSearch] = useState("");
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

      // Client-side filter
      const filtered = useMemo(() => {
            if (!search.trim()) return templates;
            const q = search.toLowerCase();
            return templates.filter(
                  (tpl) =>
                        tpl.key.toLowerCase().includes(q) ||
                        (tpl.description?.toLowerCase().includes(q)) ||
                        (tpl.category?.toLowerCase().includes(q)) ||
                        (tpl.subject?.toLowerCase().includes(q))
            );
      }, [templates, search]);

      const selectedTemplate = templates.find((tpl) => tpl.id === selectedId);

      const handleSelect = (template: EmailTemplate) => {
            setSelectedId(template.id);
            setOpen(false);
            setSearch("");
            onSelect(template);
      };

      const handleClear = (e: React.MouseEvent) => {
            e.stopPropagation();
            setSelectedId("");
            setSearch("");
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
                  <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                              <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-[280px] justify-between font-normal"
                              >
                                    <span className="truncate">
                                          {selectedTemplate
                                                ? selectedTemplate.key
                                                : t("messaging.email.selectTemplate") || "Use a template..."}
                                    </span>
                                    <div className="flex items-center gap-1 ml-2 shrink-0">
                                          {selectedId && (
                                                <X
                                                      className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
                                                      onClick={handleClear}
                                                />
                                          )}
                                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                    </div>
                              </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[320px] p-0" align="start">
                              {/* Search */}
                              <div className="flex items-center border-b px-3 py-2">
                                    <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
                                    <Input
                                          value={search}
                                          onChange={(e) => setSearch(e.target.value)}
                                          placeholder={t("common.search") || "Search templates..."}
                                          className="border-0 p-0 h-auto shadow-none focus-visible:ring-0 text-sm"
                                    />
                              </div>

                              {/* Template List */}
                              <ScrollArea className="max-h-[300px]">
                                    {filtered.length === 0 ? (
                                          <div className="py-6 text-center text-sm text-muted-foreground">
                                                {t("common.noResults") || "No templates found"}
                                          </div>
                                    ) : (
                                          <div className="p-1">
                                                {filtered.map((tpl) => (
                                                      <button
                                                            key={tpl.id}
                                                            type="button"
                                                            className={cn(
                                                                  "w-full flex items-start gap-2 p-2 rounded-md text-left text-sm",
                                                                  "hover:bg-accent hover:text-accent-foreground transition-colors",
                                                                  selectedId === tpl.id && "bg-accent"
                                                            )}
                                                            onClick={() => handleSelect(tpl)}
                                                      >
                                                            <Check
                                                                  className={cn(
                                                                        "h-4 w-4 mt-0.5 shrink-0",
                                                                        selectedId === tpl.id ? "opacity-100" : "opacity-0"
                                                                  )}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                  <div className="flex items-center gap-1.5 flex-wrap">
                                                                        <span className="font-medium truncate">{tpl.key}</span>
                                                                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                                                                              {tpl.language}
                                                                        </Badge>
                                                                        {tpl.category && (
                                                                              <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                                                                    {tpl.category}
                                                                              </Badge>
                                                                        )}
                                                                  </div>
                                                                  {tpl.description && (
                                                                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                                              {tpl.description}
                                                                        </p>
                                                                  )}
                                                            </div>
                                                      </button>
                                                ))}
                                          </div>
                                    )}
                              </ScrollArea>
                        </PopoverContent>
                  </Popover>
            </div>
      );
}
