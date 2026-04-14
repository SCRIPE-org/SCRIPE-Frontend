/**
 * InfoRow — Shared detail row component
 *
 * Renders a label-value pair with an icon, used inside info cards.
 */
import { cn } from "@core/common/utils";

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  muted?: boolean;
}

export function InfoRow({ icon, label, value, muted = false }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className={cn("text-sm font-medium text-end", muted && "text-muted-foreground")}>
        {value || "—"}
      </div>
    </div>
  );
}
