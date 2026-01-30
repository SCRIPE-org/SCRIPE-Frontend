"use client"

import type React from "react"
import { Sidebar } from "@core/ui/layout/sidebar"
import { Header } from "@core/ui/layout/header"
import { useI18n } from "@core/providers/i18n-provider"
import { cn } from "@core/common/utils"

interface ModernLayoutProps {
  children: React.ReactNode
  sidebarOpen: boolean
  onSidebarOpenChange: (open: boolean) => void
}

export function ModernLayout({ children, sidebarOpen, onSidebarOpenChange }: ModernLayoutProps) {
  const { direction } = useI18n()

  return (
    <div className={cn("min-h-screen bg-background", direction === "rtl" ? "rtl" : "ltr")}>
      {/* Modern sidebar - collapsed by default on desktop */}
      <div
        className={cn(
          "sidebar fixed inset-y-0 z-50 w-20 bg-sidebar border-r border-sidebar-border transform transition-all duration-300 ease-in-out lg:translate-x-0 custom-scrollbar overflow-hidden hover:w-80",
          direction === "rtl" ? "right-0" : "left-0",
          sidebarOpen ? "translate-x-0" : direction === "rtl" ? "translate-x-full" : "-translate-x-full",
        )}
      >
        <Sidebar open={sidebarOpen} onOpenChange={onSidebarOpenChange} isModern={true} />
      </div>

      <div className={cn("transition-all duration-300 ease-in-out", direction === "rtl" ? "lg:mr-20" : "lg:ml-20")}>
        {/* Modern header - taller with more prominent search */}
        <Header onMenuClick={() => onSidebarOpenChange(true)} isModern={true} />

        <main className="p-6 pt-24">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => onSidebarOpenChange(false)}
        />
      )}
    </div>
  )
}
