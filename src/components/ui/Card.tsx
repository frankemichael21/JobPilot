import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-navy-100 bg-white shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-navy-100 px-5 py-4">
      <div>
        <h2 className="text-base font-semibold text-navy-900">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-navy-900/60">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
