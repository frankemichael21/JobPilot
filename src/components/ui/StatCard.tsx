import { LucideIcon } from "lucide-react";
import { Card } from "./Card";

export function StatCard({
  label,
  value,
  hinweis,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hinweis?: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-navy-900/60">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-100 text-navy-700">
          <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold text-navy-900">{value}</p>
      {hinweis && <p className="mt-1 text-xs text-navy-900/50">{hinweis}</p>}
    </Card>
  );
}
