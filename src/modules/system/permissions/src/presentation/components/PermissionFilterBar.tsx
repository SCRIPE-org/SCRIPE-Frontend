/**
 * Permission Filter Bar Component
 * 
 * Search and category filter controls for permissions.
 */
"use client";

import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { Search, Filter } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";

interface PermissionFilterBarProps {
      searchValue: string;
      onSearchChange: (value: string) => void;
      categoryFilter?: string;
      onCategoryChange: (category?: string) => void;
      categories: string[];
      totalCount: number;
}

export function PermissionFilterBar({
      searchValue,
      onSearchChange,
      categoryFilter,
      onCategoryChange,
      categories,
      totalCount,
}: PermissionFilterBarProps) {
      const { t } = useI18n();

      return (
            <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-sm">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                              placeholder={t("permission.searchPlaceholder")}
                              value={searchValue}
                              onChange={(e) => onSearchChange(e.target.value)}
                              className="ps-9"
                        />
                  </div>
                  <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                              <Button variant="outline">
                                    <Filter className="me-2 h-4 w-4" />
                                    {categoryFilter || t("permission.allCategories")}
                              </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => onCategoryChange(undefined)}>
                                    {t("permission.allCategories")}
                              </DropdownMenuItem>
                              {categories.map((cat) => (
                                    <DropdownMenuItem key={cat} onClick={() => onCategoryChange(cat)}>
                                          {cat}
                                    </DropdownMenuItem>
                              ))}
                        </DropdownMenuContent>
                  </DropdownMenu>
                  <Badge variant="secondary">
                        {t("permission.totalCount", { count: totalCount })}
                  </Badge>
            </div>
      );
}
