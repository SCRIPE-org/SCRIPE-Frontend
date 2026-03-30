/**
 * DeviceToggle — Desktop/Tablet/Mobile toggle for studio preview
 *
 * Small utility component — extracted for reuse in the publish bar.
 */
"use client";
// UI-EXCEPTION: compact studio layout — native <button> used for pixel-precise
// compact controls (toggle switches, gradient pickers, layout thumbnails, etc.)
// where @core/ui/button's padding/sizing would break the layout.

import { Monitor, Tablet, Smartphone } from "lucide-react";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";
import type { DeviceSize } from "../../domain/entities/StudioDraft";

interface DeviceToggleProps {
  deviceSize: DeviceSize;
  setDeviceSize: (size: DeviceSize) => void;
}

const devices: { size: DeviceSize; icon: typeof Monitor; label: string }[] = [
  { size: "desktop", icon: Monitor, label: "Desktop" },
  { size: "tablet", icon: Tablet, label: "Tablet" },
  { size: "mobile", icon: Smartphone, label: "Mobile" },
];

export function DeviceToggle({ deviceSize, setDeviceSize }: DeviceToggleProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-muted/50 p-0.5">
      {devices.map(({ size, icon: Icon, label }) => (
        <Button
          key={size}
          variant="ghost"
          size="sm"
          onClick={() => setDeviceSize(size)}
          className={cn(
            "h-7 gap-1 px-2 text-xs",
            deviceSize === size
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          title={label}
        >
          <Icon className="h-3.5 w-3.5" />
        </Button>
      ))}
    </div>
  );
}
