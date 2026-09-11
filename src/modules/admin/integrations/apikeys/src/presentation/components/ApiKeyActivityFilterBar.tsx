/**
 * ApiKeyActivityFilterBar — Filter controls for API key activity logs.
 */
"use client";

import { useState } from "react";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Search } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * Properties passed to the ApiKeyActivityFilterBar component.
 */
export interface ApiKeyActivityFilterBarProps {
  /** Whether activity data is currently fetching */
  isLoading: boolean;
  /** Callback fired when filter values are applied */
  onFilterChange: (filters: { endpoint?: string; method?: string; statusCode?: number }) => void;
}

/**
 * Filter bar component providing search, method selection, and status code criteria for API key logs.
 *
 * @param props Component properties.
 * @returns JSX element containing the filter inputs and actions.
 */
export function ApiKeyActivityFilterBar({
  isLoading,
  onFilterChange,
}: ApiKeyActivityFilterBarProps) {
  const { t } = useI18n();
  const [endpointInput, setEndpointInput] = useState("");
  const [method, setMethod] = useState("all");
  const [statusInput, setStatusInput] = useState("");

  const handleApplyFilters = () => {
    onFilterChange({
      endpoint: endpointInput || undefined,
      method: method === "all" ? undefined : method,
      statusCode: statusInput ? parseInt(statusInput, 10) : undefined,
    });
  };

  const handleClearFilters = () => {
    setEndpointInput("");
    setMethod("all");
    setStatusInput("");
    onFilterChange({
      endpoint: undefined,
      method: undefined,
      statusCode: undefined,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-nx-line bg-nx-raised p-4">
      <div className="relative min-w-[200px] flex-1">
        <Search
          className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-3"
          aria-hidden="true"
        />
        <Input
          placeholder={t("apikeys.activity.searchPlaceholder")}
          aria-label={t("apikeys.activity.searchPlaceholder")}
          className="h-9 ps-9"
          value={endpointInput}
          onChange={(e) => setEndpointInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
        />
      </div>

      <div className="w-[120px]">
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder={t("apikeys.activity.methodPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("apikeys.activity.anyMethod")}</SelectItem>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-[120px]">
        <Input
          type="number"
          placeholder={t("apikeys.activity.statusPlaceholder")}
          aria-label={t("apikeys.activity.statusPlaceholder")}
          className="h-9"
          value={statusInput}
          onChange={(e) => setStatusInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleApplyFilters} disabled={isLoading}>
          {t("common.filter")}
        </Button>
        <Button size="sm" variant="ghost" onClick={handleClearFilters} disabled={isLoading}>
          {t("common.clear")}
        </Button>
      </div>
    </div>
  );
}
