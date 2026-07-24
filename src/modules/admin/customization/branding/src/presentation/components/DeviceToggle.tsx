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
import { useI18n } from "@core/providers/i18n-provider";

interface DeviceToggleProps {
  deviceSize: DeviceSize;
  setDeviceSize: (size: DeviceSize) => void;
}

const devices: { size: DeviceSize; icon: typeof Monitor; labelKey: string }[] = [
  { size: "desktop", icon: Monitor, labelKey: "studio.device.desktop" },
  { size: "tablet", icon: Tablet, labelKey: "studio.device.tablet" },
  { size: "mobile", icon: Smartphone, labelKey: "studio.device.mobile" },
];

/**
 * Presentation UI component rendering the device toggle.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function DeviceToggle({ deviceSize, setDeviceSize }: DeviceToggleProps) {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-0.5 rounded-nx-control bg-nx-raised p-0.5">
      {devices.map(({ size, icon: Icon, labelKey }) => (
        <Button
          key={size}
          variant="ghost"
          size="sm"
          onClick={() => setDeviceSize(size)}
          aria-label={t(labelKey)}
          aria-pressed={deviceSize === size}
          className={cn(
            "h-7 gap-1 rounded-nx-sm px-2 text-xs",
            deviceSize === size
              ? "bg-nx-surface text-nx-ink shadow-[inset_0_0_0_1px_var(--nx-line-hi)]"
              : "text-nx-ink-2 hover:text-nx-ink"
          )}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      ))}
    </div>
  );
}
