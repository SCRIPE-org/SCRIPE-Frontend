"use client";

/**
 * NexusPrimaryRail
 *
 * Matches the Nexus ERP reference design exactly:
 *  - 56px dark (#060810) left rail, border-right #111626
 *  - Logo mark at top: 32px rounded square with accent color
 *  - Workspace icon buttons: 34×34, rounded-lg, tooltip on hover
 *  - Spacer pushes bottom actions down
 *  - Bottom: NotificationBell + UserProfileDropdown (avatar only)
 */

import React, { useCallback, useState } from "react";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useI18n } from "@core/providers/i18n-provider";
import type { WorkspaceGroup } from "@core/domain/entities/Navigation";
import * as LucideIcons from "lucide-react";
import { LayoutDashboard } from "lucide-react";
import { NotificationBell } from "@core/ui/notification";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { cn } from "@core/common/utils";

interface NexusPrimaryRailProps {
  canAddWorkspace?: boolean;
  onAddWorkspace?: () => void;
}

function WorkspaceIcon({ name, size = 15 }: { name: string; size?: number }) {
  const PascalName = name.replace(/(^|[-_])(\w)/g, (_, __, c: string) => c.toUpperCase());
  const Icon = (LucideIcons as Record<string, any>)[PascalName];
  if (Icon) return <Icon width={size} height={size} />;
  return <LayoutDashboard width={size} height={size} />;
}

interface WorkspacePillProps {
  workspace: WorkspaceGroup;
  isActive: boolean;
  language: string;
  onClick: (key: string) => void;
}

function WorkspacePill({ workspace, isActive, language, onClick }: WorkspacePillProps) {
  const label = workspace.getLocalizedName(language);
  const accent = workspace.accentColor ?? "#534AB7";
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ position: "relative" }} className="group">
      <button
        type="button"
        title={label}
        aria-label={label}
        aria-pressed={isActive}
        onClick={() => onClick(workspace.workspaceKey)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "background 150ms ease, color 150ms ease",
          border: "none",
          flexShrink: 0,
          position: "relative",
          background: isActive
            ? "rgba(255,255,255,0.07)"
            : hovered
            ? "rgba(255,255,255,0.05)"
            : "transparent",
          color: isActive ? accent : hovered ? "#8A9BBF" : "#2F3C55",
          margin: "2px 0",
          outline: "none",
        }}
      >
        {/* Active indicator bar */}
        {isActive && (
          <span
            style={{
              position: "absolute",
              left: -11,
              top: "50%",
              transform: "translateY(-50%)",
              width: 3,
              height: 16,
              borderRadius: "0 2px 2px 0",
              background: accent,
              flexShrink: 0,
            }}
          />
        )}
        <WorkspaceIcon name={workspace.workspaceIcon} size={15} />
      </button>

      {/* Tooltip */}
      <span
        style={{
          position: "absolute",
          left: 44,
          top: "50%",
          transform: "translateY(-50%)",
          background: "#1A2035",
          border: "1px solid #181E33",
          borderRadius: 6,
          padding: "4px 9px",
          fontSize: 11,
          color: "#D0DCEF",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 100,
          opacity: hovered ? 1 : 0,
          transition: "opacity 150ms ease",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export function NexusPrimaryRail({ canAddWorkspace, onAddWorkspace }: NexusPrimaryRailProps) {
  const { workspaceGroups, activeWorkspace, setActiveWorkspace } = useWorkspace();
  const { language } = useI18n();

  const accentColor = activeWorkspace?.accentColor ?? "#534AB7";

  const handlePillClick = useCallback(
    (key: string) => setActiveWorkspace(key),
    [setActiveWorkspace]
  );

  return (
    <nav
      aria-label="Workspace navigation"
      style={{
        width: 56,
        height: "100vh",
        background: "#060810",
        borderRight: "1px solid #111626",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px 0",
        gap: 0,
        flexShrink: 0,
        zIndex: 10,
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: accentColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 600,
          color: "#fff",
          letterSpacing: "0.5px",
          marginBottom: 16,
          cursor: "default",
          transition: "background 300ms cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.06) inset",
          flexShrink: 0,
          userSelect: "none",
        }}
      >
        N
      </div>

      {/* Workspace icon buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flex: 1,
          overflowY: "auto",
          scrollbarWidth: "none",
          width: "100%",
          paddingBottom: 8,
        }}
      >
        {workspaceGroups.map((ws) => (
          <WorkspacePill
            key={ws.workspaceKey}
            workspace={ws}
            isActive={activeWorkspace?.workspaceKey === ws.workspaceKey}
            language={language}
            onClick={handlePillClick}
          />
        ))}
      </div>

      {/* Bottom actions */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          paddingBottom: 6,
          flexShrink: 0,
        }}
      >
        {/* Notification bell — override size classes */}
        <NotificationBell
          iconClassName="h-[14px] w-[14px]"
          className={cn(
            "h-[34px] w-[34px] rounded-[8px]",
            "!text-[#2F3C55] hover:!bg-white/5 hover:!text-[#8A9BBF]"
          )}
        />

        {/* User avatar - compact, no name, small circle */}
        <UserProfileDropdown
          variant="compact"
          showName={false}
          className="h-[26px] w-[26px] rounded-full !p-0"
        />
      </div>
    </nav>
  );
}
