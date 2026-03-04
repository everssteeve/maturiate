import Link from "next/link";
import { AlertCircle } from "lucide-react";

import type { PendingAction } from "@/lib/queries/homepage";

interface PendingActionsProps {
  actions: PendingAction[];
}

export function PendingActions({ actions }: PendingActionsProps) {
  return (
    <div className="space-y-2">
      <h4 className="flex items-center gap-1.5 text-sm font-medium">
        <AlertCircle className="size-4 text-amber-500" />
        Actions en attente
      </h4>
      <ul className="space-y-1">
        {actions.map((action) => (
          <li key={action.link}>
            <Link
              href={action.link}
              className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {action.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
