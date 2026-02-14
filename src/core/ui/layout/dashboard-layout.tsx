"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";

// All layout components
import { NavigationLayout } from "@core/ui/layout/navigation/navigation-layout";
import { TabbedLayout } from "@core/ui/layout/tabbed/tabbed-layout";
import { DualLayout } from "@core/ui/layout/dual/dual-layout";
import { CommandLayout } from "@core/ui/layout/command/command-layout";
import { StackedLayout } from "@core/ui/layout/stacked/stacked-layout";
import { HUDLayout } from "@core/ui/layout/hud/hud-layout";
import { ClassicLayout } from "@core/ui/layout/classic/classic-layout";
import { CompactLayout } from "@core/ui/layout/compact/compact-layout";
import { ElegantLayout } from "@core/ui/layout/elegant/elegant-layout";
import { FloatingLayout } from "@core/ui/layout/floating/floating-layout";
import { MinimalLayout } from "@core/ui/layout/minimal/minimal-layout";
import { ModernLayout } from "@core/ui/layout/modern/modern-layout";
import { DockLayout } from "@core/ui/layout/dock/dock-layout";
import { ExecutiveLayout } from "@core/ui/layout/executive/executive-layout";
import { MagazineLayout } from "@core/ui/layout/magazine/magazine-layout";
import { SpotlightLayout } from "@core/ui/layout/spotlight/spotlight-layout";
import { GlassmorphismLayout } from "@core/ui/layout/glassmorphism/glassmorphism-layout";
import { GalaxyLayout } from "@core/ui/layout/galaxy/galaxy-layout";
import { NeonLayout } from "@core/ui/layout/neon/neon-layout";
import { RetroLayout } from "@core/ui/layout/retro/retro-layout";
import { AuroraLayout } from "@core/ui/layout/aurora/aurora-layout";
import { RailLayout } from "@core/ui/layout/rail/rail-layout";
import { NewspaperLayout } from "@core/ui/layout/newspaper/newspaper-layout";
import { CinemaLayout } from "@core/ui/layout/cinema/cinema-layout";
import { VaultLayout } from "@core/ui/layout/vault/vault-layout";
import { BottomBarLayout } from "@core/ui/layout/bottombar/bottombar-layout";
import { MegaMenuLayout } from "@core/ui/layout/megamenu/megamenu-layout";
import { BreadcrumbLayout } from "@core/ui/layout/breadcrumb/breadcrumb-layout";
import { RibbonLayout } from "@core/ui/layout/ribbon/ribbon-layout";
import { TreeViewLayout } from "@core/ui/layout/treeview/treeview-layout";
import { OverlayLayout } from "@core/ui/layout/overlay/overlay-layout";
import { HubLayout } from "@core/ui/layout/hub/hub-layout";
import { WizardLayout } from "@core/ui/layout/wizard/wizard-layout";
import { ShelfLayout } from "@core/ui/layout/shelf/shelf-layout";
import { CollapseHeaderLayout } from "@core/ui/layout/collapseheader/collapseheader-layout";
import { SplitPaneLayout } from "@core/ui/layout/splitpane/splitpane-layout";
import { InboxLayout } from "@core/ui/layout/inbox/inbox-layout";
import { DualHeaderLayout } from "@core/ui/layout/dualheader/dualheader-layout";
import { TopSideLayout } from "@core/ui/layout/topside/topside-layout";
import { FocusLayout } from "@core/ui/layout/focus/focus-layout";
import { MultiPanelLayout } from "@core/ui/layout/multipanel/multipanel-layout";
import { KanbanLayout } from "@core/ui/layout/kanban/kanban-layout";
import { BentoLayout } from "@core/ui/layout/bento/bento-layout";
import { ChatLayout } from "@core/ui/layout/chat/chat-layout";
import { MapLayout } from "@core/ui/layout/map/map-layout";
import { FeedLayout } from "@core/ui/layout/feed/feed-layout";
import { CalendarLayout } from "@core/ui/layout/calendar/calendar-layout";
import { CRMLayout } from "@core/ui/layout/crm/crm-layout";
import { TerminalLayout } from "@core/ui/layout/terminal/terminal-layout";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const settings = useSettings();
  const [sidebarOpen, setSidebarOpen] = useState(settings.collapsibleSidebar ? false : true);
  const { direction } = useI18n();
  const { layoutTemplate, collapsibleSidebar } = settings;

  useEffect(() => {
    if (!collapsibleSidebar) {
      setSidebarOpen(true);
    }
  }, [collapsibleSidebar]);

  // Close sidebar when clicking outside on mobile if collapsible
  useEffect(() => {
    if (!collapsibleSidebar) return;
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector(".sidebar");
      const sidebarTrigger = document.querySelector(".sidebar-trigger");

      if (
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        sidebarTrigger &&
        !sidebarTrigger.contains(event.target as Node) &&
        window.innerWidth < 1024
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [collapsibleSidebar]);

  // ── Layouts that manage their own sidebar ──

  // Classic Layout
  if (layoutTemplate === "classic") {
    return (
      <ClassicLayout sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
        {children}
      </ClassicLayout>
    );
  }

  // Compact Layout
  if (layoutTemplate === "compact") {
    return (
      <CompactLayout sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
        {children}
      </CompactLayout>
    );
  }

  // Elegant Layout
  if (layoutTemplate === "elegant") {
    return (
      <ElegantLayout sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
        {children}
      </ElegantLayout>
    );
  }

  // Floating Layout
  if (layoutTemplate === "floating") {
    return (
      <FloatingLayout sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
        {children}
      </FloatingLayout>
    );
  }

  // Modern Layout
  if (layoutTemplate === "modern") {
    return (
      <ModernLayout sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
        {children}
      </ModernLayout>
    );
  }

  // Tabbed Layout
  if (layoutTemplate === "tabbed") {
    return (
      <TabbedLayout sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
        {children}
      </TabbedLayout>
    );
  }

  // Dual Layout
  if (layoutTemplate === "dual") {
    return (
      <DualLayout sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
        {children}
      </DualLayout>
    );
  }

  // Command Layout
  if (layoutTemplate === "command") {
    return <CommandLayout>{children}</CommandLayout>;
  }

  // Stacked Layout
  if (layoutTemplate === "stacked") {
    return <StackedLayout>{children}</StackedLayout>;
  }

  // HUD Layout
  if (layoutTemplate === "hud") {
    return <HUDLayout>{children}</HUDLayout>;
  }

  // ── Minimal Layout (no sidebar) ──
  if (layoutTemplate === "minimal") {
    return <MinimalLayout>{children}</MinimalLayout>;
  }

  // ── New Layouts (self-managing sidebar) ──
  if (layoutTemplate === "dock") {
    return <DockLayout>{children}</DockLayout>;
  }
  if (layoutTemplate === "executive") {
    return <ExecutiveLayout>{children}</ExecutiveLayout>;
  }
  if (layoutTemplate === "magazine") {
    return <MagazineLayout>{children}</MagazineLayout>;
  }
  if (layoutTemplate === "spotlight") {
    return <SpotlightLayout>{children}</SpotlightLayout>;
  }
  if (layoutTemplate === "glassmorphism") {
    return <GlassmorphismLayout>{children}</GlassmorphismLayout>;
  }
  if (layoutTemplate === "galaxy") {
    return <GalaxyLayout>{children}</GalaxyLayout>;
  }
  if (layoutTemplate === "neon") {
    return <NeonLayout>{children}</NeonLayout>;
  }
  if (layoutTemplate === "retro") {
    return <RetroLayout>{children}</RetroLayout>;
  }
  if (layoutTemplate === "aurora") {
    return <AuroraLayout>{children}</AuroraLayout>;
  }
  if (layoutTemplate === "rail") {
    return <RailLayout>{children}</RailLayout>;
  }
  if (layoutTemplate === "newspaper") {
    return <NewspaperLayout>{children}</NewspaperLayout>;
  }
  if (layoutTemplate === "cinema") {
    return <CinemaLayout>{children}</CinemaLayout>;
  }
  if (layoutTemplate === "vault") {
    return <VaultLayout>{children}</VaultLayout>;
  }
  if (layoutTemplate === "bottombar") {
    return <BottomBarLayout>{children}</BottomBarLayout>;
  }
  if (layoutTemplate === "megamenu") {
    return <MegaMenuLayout>{children}</MegaMenuLayout>;
  }
  if (layoutTemplate === "breadcrumb") {
    return <BreadcrumbLayout>{children}</BreadcrumbLayout>;
  }
  if (layoutTemplate === "ribbon") {
    return <RibbonLayout>{children}</RibbonLayout>;
  }
  if (layoutTemplate === "treeview") {
    return <TreeViewLayout>{children}</TreeViewLayout>;
  }
  if (layoutTemplate === "overlay") {
    return <OverlayLayout>{children}</OverlayLayout>;
  }
  if (layoutTemplate === "hub") {
    return <HubLayout>{children}</HubLayout>;
  }
  if (layoutTemplate === "wizard") {
    return <WizardLayout>{children}</WizardLayout>;
  }
  if (layoutTemplate === "shelf") {
    return <ShelfLayout>{children}</ShelfLayout>;
  }
  if (layoutTemplate === "collapseheader") {
    return <CollapseHeaderLayout>{children}</CollapseHeaderLayout>;
  }
  if (layoutTemplate === "splitpane") {
    return <SplitPaneLayout>{children}</SplitPaneLayout>;
  }
  if (layoutTemplate === "inbox") {
    return <InboxLayout>{children}</InboxLayout>;
  }
  if (layoutTemplate === "dualheader") {
    return <DualHeaderLayout>{children}</DualHeaderLayout>;
  }
  if (layoutTemplate === "topside") {
    return <TopSideLayout>{children}</TopSideLayout>;
  }
  if (layoutTemplate === "focus") {
    return <FocusLayout>{children}</FocusLayout>;
  }
  if (layoutTemplate === "multipanel") {
    return <MultiPanelLayout>{children}</MultiPanelLayout>;
  }
  if (layoutTemplate === "kanban") {
    return <KanbanLayout>{children}</KanbanLayout>;
  }
  if (layoutTemplate === "bento") {
    return <BentoLayout>{children}</BentoLayout>;
  }
  if (layoutTemplate === "chat") {
    return <ChatLayout>{children}</ChatLayout>;
  }
  if (layoutTemplate === "map") {
    return <MapLayout>{children}</MapLayout>;
  }
  if (layoutTemplate === "feed") {
    return <FeedLayout>{children}</FeedLayout>;
  }
  if (layoutTemplate === "calendar") {
    return <CalendarLayout>{children}</CalendarLayout>;
  }
  if (layoutTemplate === "crm") {
    return <CRMLayout>{children}</CRMLayout>;
  }
  if (layoutTemplate === "terminal") {
    return <TerminalLayout>{children}</TerminalLayout>;
  }

  // ── Default: Navigation Layout ──
  return (
    <NavigationLayout sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
      {children}
    </NavigationLayout>
  );
}
