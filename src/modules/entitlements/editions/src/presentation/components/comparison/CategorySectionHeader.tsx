/**
 * CategorySectionHeader — Full-width category divider row in the comparison table.
 * Shows an icon + uppercase category name to visually group related features.
 */
import { TableRow, TableCell } from "@core/ui/table";
import { Cpu, BarChart3, Shield, CreditCard, Settings, Layers, Users, Zap } from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Modules: <Layers className="h-3.5 w-3.5" />,
  Quotas: <BarChart3 className="h-3.5 w-3.5" />,
  Security: <Shield className="h-3.5 w-3.5" />,
  Billing: <CreditCard className="h-3.5 w-3.5" />,
  Configuration: <Settings className="h-3.5 w-3.5" />,
  Users: <Users className="h-3.5 w-3.5" />,
  Performance: <Zap className="h-3.5 w-3.5" />,
  General: <Cpu className="h-3.5 w-3.5" />,
};

interface CategorySectionHeaderProps {
  label: string;
  colSpan: number;
}

/**
 * React presentation component representing the category section header UI element.
 */
export function CategorySectionHeader({ label, colSpan }: CategorySectionHeaderProps) {
  const icon = CATEGORY_ICONS[label] ?? <Settings className="h-3.5 w-3.5" />;

  return (
    <TableRow className="border-y border-border/60 bg-muted/50">
      <TableCell colSpan={colSpan} className="px-4 py-2.5">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
        </div>
      </TableCell>
    </TableRow>
  );
}
