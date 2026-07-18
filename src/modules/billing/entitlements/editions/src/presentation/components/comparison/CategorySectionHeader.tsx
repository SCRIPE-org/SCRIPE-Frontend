import { TableRow, TableHead } from "@core/ui/table";
import { Cpu, BarChart3, Shield, CreditCard, Settings, Layers, Users, Zap } from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Modules: <Layers aria-hidden="true" className="h-3.5 w-3.5" />,
  Quotas: <BarChart3 aria-hidden="true" className="h-3.5 w-3.5" />,
  Security: <Shield aria-hidden="true" className="h-3.5 w-3.5" />,
  Billing: <CreditCard aria-hidden="true" className="h-3.5 w-3.5" />,
  Configuration: <Settings aria-hidden="true" className="h-3.5 w-3.5" />,
  Users: <Users aria-hidden="true" className="h-3.5 w-3.5" />,
  Performance: <Zap aria-hidden="true" className="h-3.5 w-3.5" />,
  General: <Cpu aria-hidden="true" className="h-3.5 w-3.5" />,
};

interface CategorySectionHeaderProps {
  label: string;
  category?: string;
  colSpan: number;
}

export function CategorySectionHeader({ label, category, colSpan }: CategorySectionHeaderProps) {
  const icon = CATEGORY_ICONS[category ?? label] ?? (
    <Settings aria-hidden="true" className="h-3.5 w-3.5" />
  );

  return (
    <TableRow className="border-y border-border/60 bg-muted/50">
      <TableHead scope="rowgroup" colSpan={colSpan} className="h-auto px-4 py-2.5">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
        </div>
      </TableHead>
    </TableRow>
  );
}
