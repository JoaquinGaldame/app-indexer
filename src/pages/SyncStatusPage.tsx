import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/common/SectionHeader";
import { MetricCard } from "@/components/common/MetricCard";
import { LoadingState } from "@/components/common/EmptyState";
import { DataTable, type Column } from "@/components/common/DataTable";
import { NetworkBadge, StatusBadge } from "@/components/common/StatusBadge";
import { api } from "@/services/api";
import type { SyncLogEntry, SyncStatus } from "@/types";
import { formatDateTime, formatNumber, timeAgo } from "@/lib/format";
import { Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function SyncStatusPage() {
  const [status, setStatus] = useState<SyncStatus[] | null>(null);
  const [logs, setLogs] = useState<SyncLogEntry[] | null>(null);

  useEffect(() => {
    api.getSyncStatus().then(setStatus);
    api.getSyncLogs(50).then(setLogs);
  }, []);

  const totalLag = status?.reduce((s, x) => s + x.lag, 0) ?? 0;
  const errors = status?.filter((s) => s.state === "error").length ?? 0;
  const healthy = status?.filter((s) => s.state === "synced").length ?? 0;

  const cols: Column<SyncStatus>[] = [
    {
      key: "name",
      header: "Contract",
      cell: (s) => (
        <div>
          <div className="font-medium text-foreground">{s.contractName}</div>
          <div className="mt-0.5">
            <NetworkBadge network={s.network} />
          </div>
        </div>
      ),
    },
    {
      key: "indexed",
      header: "Indexed",
      align: "right",
      sortAccessor: (s) => s.currentIndexedBlock,
      cell: (s) => <span className="font-mono">#{formatNumber(s.currentIndexedBlock)}</span>,
    },
    {
      key: "head",
      header: "Chain head",
      align: "right",
      cell: (s) => (
        <span className="font-mono text-muted-foreground">#{formatNumber(s.latestChainBlock)}</span>
      ),
    },
    {
      key: "lag",
      header: "Lag",
      align: "right",
      sortAccessor: (s) => s.lag,
      cell: (s) => (
        <span
          className={cn(
            "font-mono",
            s.lag > 200 ? "text-destructive" : s.lag > 50 ? "text-warning" : "text-success",
          )}
        >
          {s.lag}
        </span>
      ),
    },
    { key: "state", header: "State", cell: (s) => <StatusBadge state={s.state} /> },
    {
      key: "ok",
      header: "Last success",
      align: "right",
      cell: (s) => <span className="text-muted-foreground">{timeAgo(s.lastSuccessAt)}</span>,
    },
    {
      key: "err",
      header: "Last error",
      cell: (s) =>
        s.lastErrorMessage ? (
          <span className="text-xs text-destructive" title={s.lastErrorMessage}>
            {s.lastErrorMessage.length > 40
              ? s.lastErrorMessage.slice(0, 40) + "…"
              : s.lastErrorMessage}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <AppShell>
      <SectionHeader
        title="Sync Status"
        description="Indexer health, per-contract sync lag, and recent pipeline activity."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Healthy trackers"
          value={`${healthy}/${status?.length ?? 0}`}
          icon={CheckCircle2}
        />
        <MetricCard label="Total lag" value={`${totalLag} blk`} icon={Activity} />
        <MetricCard
          label="Errors"
          value={errors}
          hint="last 24h"
          icon={AlertTriangle}
        />
        <MetricCard label="Pipeline uptime" value="99.94%" hint="rolling 7d" />
      </div>

      <div className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-foreground">Per-contract sync</h2>
        {status ? (
          <DataTable rows={status} columns={cols} rowKey={(s) => s.contractId} dense />
        ) : (
          <LoadingState />
        )}
      </div>

      <div className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-foreground">Sync logs</h2>
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {logs ? (
            <ul className="divide-y divide-border/60">
              {logs.map((l) => (
                <li key={l.id} className="grid grid-cols-[auto_180px_1fr_auto] items-center gap-3 px-4 py-2 text-xs">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      l.level === "error"
                        ? "bg-destructive"
                        : l.level === "warn"
                          ? "bg-warning"
                          : "bg-success",
                    )}
                  />
                  <span className="font-mono text-muted-foreground">
                    {formatDateTime(l.timestamp)}
                  </span>
                  <span className="text-foreground/90">
                    <span className="text-muted-foreground">[{l.contractName}]</span> {l.message}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {l.blockNumber ? `#${formatNumber(l.blockNumber)}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4">
              <LoadingState rows={6} />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}