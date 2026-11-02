import React from "react";
import "./venue-layout.css";

interface WorkspaceVenueLayoutProps {
  children: React.ReactNode;
}

export default function WorkspaceVenueLayout({ children }: WorkspaceVenueLayoutProps) {
  return (
    <div className="venue-workspace-root w-full min-w-0" data-testid="workspace-venue-root">
      {children}
    </div>
  );
}
