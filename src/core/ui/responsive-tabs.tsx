"use client";

import React from "react";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";

interface ResponsiveTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function ResponsiveTabs({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className 
}: ResponsiveTabsProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-wrap gap-2 p-1 bg-muted/50 rounded-lg">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 transition-all duration-200",
              "hover:scale-105 active:scale-95",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "hover:bg-muted-foreground/10"
            )}
          >
            {tab.icon}
            <span className="whitespace-nowrap">{tab.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
