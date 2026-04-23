import { cn } from "@/lib/utils";
import type { SyncState } from "@/types";
import { syncStateLabel } from "@/lib/format";

const styles: Record<SyncState, string> = {
  synced: "bg-success/15 text-success border-success/30",
  syncing: "bg-info/15 text-info border-info/30",
  lagging: "bg-warning/15 text-warning border-warning/30",
  error: "bg-destructive/15 text-destructive border-destructive/30",
  paused: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ state, className }: { state: SyncState; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        styles[state],
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          state === "synced" && "bg-success",
          state === "syncing" && "bg-info animate-pulse",
          state === "lagging" && "bg-warning",
          state === "error" && "bg-destructive",
          state === "paused" && "bg-muted-foreground",
        )}
      />
      {syncStateLabel[state]}
    </span>
  );
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        active
          ? "bg-success/15 text-success border-success/30"
          : "bg-muted text-muted-foreground border-border",
      )}
    >
      <span className={cn("size-1.5 rounded-full", active ? "bg-success" : "bg-muted-foreground")} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function EventTypeBadge({ name }: { name: string }) {
  // Stable color from name hash
  const hues = ["bg-chart-1/15 text-chart-1 border-chart-1/30",
    "bg-chart-2/15 text-chart-2 border-chart-2/30",
    "bg-chart-3/15 text-chart-3 border-chart-3/30",
    "bg-chart-4/15 text-chart-4 border-chart-4/30",
    "bg-chart-5/15 text-chart-5 border-chart-5/30"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return (
    <span className={cn("inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[11px]", hues[h % hues.length])}>
      {name}
    </span>
  );
}

export function EventStatusBadge({ status }: { status: "indexed" | "reorged" | "pending" }) {
  const map = {
    indexed: "bg-success/15 text-success border-success/30",
    reorged: "bg-destructive/15 text-destructive border-destructive/30",
    pending: "bg-warning/15 text-warning border-warning/30",
  } as const;
  return (
    <span className={cn("inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] capitalize", map[status])}>
      {status}
    </span>
  );
}

export function NetworkBadge({ network }: { network: string }) {
  return (
    <span className="inline-flex items-center rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[11px] font-medium capitalize text-muted-foreground">
      {network}
    </span>
  );
}