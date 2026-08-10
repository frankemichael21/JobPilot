"use client";

import { ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "./Card";
import { cn } from "@/lib/utils";

export function CollapsibleCard({
  title,
  description,
  defaultOpen = true,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div>
          <h2 className="text-base font-semibold text-navy-900">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-navy-900/60">{description}</p>
          )}
        </div>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={cn(
            "shrink-0 text-navy-900/50 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="border-t border-navy-100 p-5">{children}</div>}
    </Card>
  );
}
