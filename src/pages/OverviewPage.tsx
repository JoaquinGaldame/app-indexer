import { useEffect, useState } from "react";
import {
  Activity,
  Boxes,
  Layers,
  Wallet,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/common/SectionHeader";
import { MetricCard } from "@/components/common/MetricCard";
import { LoadingState } from "@/components/common/EmptyState";
import { DataTable, type Column } from "@/components/common/DataTable";
import { HashCell } from "@/components/common/HashCell";
import {
  EventStatusBadge,
  EventTypeBadge,
  NetworkBadge,
  StatusBadge,
} from "@/components/common/StatusBadge";
import { api } from "@/services/api";
import type {
  DashboardOverviewStats,
  IndexedEvent,
  SyncLogEntry,
  SyncStatus,
} from "@/types";
import { formatCompact, formatNumber, timeAgo } from "@/lib/format";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "@tanstack/react-router";

export function OverviewPage() {
  const [stats, setStats] = useState<DashboardOverviewStats | null>(null);
  const [events, setEvents] = useState<IndexedEvent[] | null>(null);
  const [logs, setLogs] = useState<SyncLogEntry[] | null>(null);
  const [sync, setSync] = useState<SyncStatus[] | null>(null);

  useEffect(() => {
    api.getOverview().then(setStats);
    api.listEvents({ pageSize: 8 }).then((p) => setEvents(p.data));
    api.getSyncLogs(8).then(setLogs);
    api.getSyncStatus().then(setSync);
  }, []);

  const eventCols: Column<IndexedEvent>[] = [
    {
      key: "event",
      header: "Event",
      cell: (e) => <EventTypeBadge name={e.eventName} />,
    },
    {
      key: "contract",
      header: "Contract",
      cell: (e) => (
        <Link
          to="/contracts/$contractId"
          params={{ contractId: e.contractId }}
          className="text-foreground hover:underline"
        >
          {e.contractName}
        </Link>
      ),
    },
    { key: "tx", header: "Tx", cell: (e) => <HashCell value={e.txHash} /> },
    {
      key: "block",
      header: "Block",
      align: "right",
      cell: (e) => <span className="font-mono">{formatNumber(e.blockNumber)}</span>,
    },
    {
      key: "ts",
      header: "Age",
      align: "right",
      cell: (e) => <span className="text-muted-foreground">{timeAgo(e.timestamp)}</span>,
    },
    { key: "st", header: "", cell: (e) => <EventStatusBadge status={e.status} /> },
  ];

  return (
    <AppShell>
      <SectionHeader
        title="Overview"
        description="Live operational state of the blockchain indexer pipeline."
        actions={
          <span className="rounded-md border border-border bg-card px-2.5 py-1 font-mono text-xs text-muted-foreground">
            updated {stats ? "just now" : "—"}
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats ? (
          <>
            <MetricCard
              label="Indexed contracts"
              value={stats.totalContracts}
              hint={`${stats.activeContracts} active`}
              icon={Boxes}
            />
            <MetricCard
              label="Indexed events"
              value={formatCompact(stats.totalEvents)}
              hint={`+${formatCompact(stats.eventsLast24h)} last 24h`}
              trend={{ value: "12.4%", positive: true }}
              icon={Zap}
            />
            <MetricCard
              label="Tracked wallets"
              value={formatCompact(stats.totalWallets)}
              hint="unique participants"
              icon={Wallet}
            />
            <MetricCard
              label="Sync lag (avg)"
              value={`${stats.averageSyncLag} blk`}
              hint={`head #${formatNumber(stats.latestChainBlock)}`}
              icon={Activity}
            />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[110px] animate-pulse rounded-lg bg-muted/40" />
          ))
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Event volume</h2>
              <p className="text-xs text-muted-foreground">Indexed events per hour, last 24h</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" /> events
            </div>
          </div>
          <div className="h-[240px]">
            {stats ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.eventVolumeSeries}>
                  <defs>
                    <linearGradient id="evG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.74 0.14 195)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.74 0.14 195)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="oklch(0.3 0.013 250)" strokeDasharray="2 4" vertical={false} />
                  <XAxis
                    dataKey="t"
                    tickFormatter={(t) => new Date(t).getHours() + "h"}
                    stroke="oklch(0.66 0.015 250)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="oklch(0.66 0.015 250)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={32}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.215 0.013 250)",
                      border: "1px solid oklch(0.3 0.013 250)",
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                    labelFormatter={(l) => new Date(l).toLocaleString()}
                  />
                  <Area
                    type="monotone"
                    dataKey="events"
                    stroke="oklch(0.74 0.14 195)"
                    strokeWidth={1.75}
                    fill="url(#evG)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <LoadingState rows={6} />
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-foreground">Active contracts</h2>
            <p className="text-xs text-muted-foreground">Sync state by tracker</p>
          </div>
          <div className="space-y-2">
            {sync ? (
              sync.slice(0, 6).map((s) => (
                <div
                  key={s.contractId}
                  className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">
                      {s.contractName}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <NetworkBadge network={s.network} />
                      <span className="font-mono">lag {s.lag}</span>
                    </div>
                  </div>
                  <StatusBadge state={s.state} />
                </div>
              ))
            ) : (
              <LoadingState rows={5} />
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent events</h2>
            <Link to="/events" className="text-xs text-primary hover:underline">
              View all →
            </Link>
          </div>
          {events ? (
            <DataTable rows={events} columns={eventCols} rowKey={(e) => e.id} dense />
          ) : (
            <LoadingState />
          )}
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Sync activity</h2>
            <Link to="/sync" className="text-xs text-primary hover:underline">
              Open log →
            </Link>
          </div>
          <div className="rounded-lg border border-border bg-card p-2">
            {logs ? (
              <ul className="divide-y divide-border/60">
                {logs.map((l) => (
                  <li key={l.id} className="flex items-start gap-2 px-2 py-2">
                    <span
                      className={
                        l.level === "error"
                          ? "mt-1.5 size-1.5 rounded-full bg-destructive"
                          : l.level === "warn"
                            ? "mt-1.5 size-1.5 rounded-full bg-warning"
                            : "mt-1.5 size-1.5 rounded-full bg-success"
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Layers className="size-3" />
                        <span className="truncate font-medium text-foreground/80">
                          {l.contractName}
                        </span>
                        <span className="ml-auto font-mono">{timeAgo(l.timestamp)}</span>
                      </div>
                      <div className="mt-0.5 line-clamp-2 text-xs text-foreground/80">
                        {l.message}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <LoadingState rows={5} />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}