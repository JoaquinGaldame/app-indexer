import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/common/SectionHeader";
import { MetricCard } from "@/components/common/MetricCard";
import { LoadingState, EmptyState } from "@/components/common/EmptyState";
import { DataTable, type Column } from "@/components/common/DataTable";
import { HashCell } from "@/components/common/HashCell";
import {
  ActiveBadge,
  EventTypeBadge,
  NetworkBadge,
  StatusBadge,
} from "@/components/common/StatusBadge";
import { api } from "@/services/api";
import type { Contract, IndexedEvent } from "@/types";
import { formatNumber, timeAgo } from "@/lib/format";
import { ArrowLeft, Boxes } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function ContractDetailPage() {
  const { contractId } = useParams({ from: "/contracts/$contractId" });
  const [contract, setContract] = useState<Contract | null>(null);
  const [events, setEvents] = useState<IndexedEvent[] | null>(null);

  useEffect(() => {
    api.getContract(contractId).then(setContract);
    api.listEventsForContract(contractId, 25).then(setEvents);
  }, [contractId]);

  if (contract === null && events !== null) {
    return (
      <AppShell>
        <EmptyState
          icon={Boxes}
          title="Contract not found"
          description="No contract matches this id."
        />
      </AppShell>
    );
  }

  if (!contract) {
    return (
      <AppShell>
        <LoadingState rows={8} />
      </AppShell>
    );
  }

  const lag = contract.latestChainBlock - contract.lastSyncedBlock;

  const volumeSeries = Array.from({ length: 14 }, (_, i) => ({
    d: `D-${13 - i}`,
    events: Math.floor(50 + Math.sin(i / 2) * 40 + (i * 7) % 60),
  }));

  const participants = events
    ? Array.from(new Set(events.flatMap((e) => e.participants))).slice(0, 8)
    : [];

  const eventCols: Column<IndexedEvent>[] = [
    { key: "evt", header: "Event", cell: (e) => <EventTypeBadge name={e.eventName} /> },
    { key: "tx", header: "Tx", cell: (e) => <HashCell value={e.txHash} /> },
    {
      key: "blk",
      header: "Block",
      align: "right",
      cell: (e) => <span className="font-mono">{formatNumber(e.blockNumber)}</span>,
    },
    {
      key: "age",
      header: "Age",
      align: "right",
      cell: (e) => <span className="text-muted-foreground">{timeAgo(e.timestamp)}</span>,
    },
  ];

  return (
    <AppShell>
      <Link
        to="/contracts"
        className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3" /> Back to contracts
      </Link>

      <div className="mb-6 rounded-lg border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">{contract.name}</h1>
              <StatusBadge state={contract.syncState} />
              <ActiveBadge active={contract.status === "active"} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <NetworkBadge network={contract.network} />
              <HashCell value={contract.address} head={10} tail={8} />
              <span>
                ABI:{" "}
                <span className="font-medium capitalize text-foreground/80">{contract.abiSource}</span>
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {contract.trackedEventNames.map((n) => (
              <EventTypeBadge key={n} name={n} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Last synced block"
          value={`#${formatNumber(contract.lastSyncedBlock)}`}
          hint={`head #${formatNumber(contract.latestChainBlock)}`}
        />
        <MetricCard label="Sync lag" value={`${lag} blk`} hint="behind chain head" />
        <MetricCard label="Indexed events" value={formatNumber(contract.totalEvents)} />
        <MetricCard label="Tracked events" value={contract.trackedEventNames.length} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Event volume (14d)</h2>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeSeries}>
                <CartesianGrid stroke="oklch(0.3 0.013 250)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="d" stroke="oklch(0.66 0.015 250)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.66 0.015 250)" fontSize={11} tickLine={false} axisLine={false} width={28} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.215 0.013 250)",
                    border: "1px solid oklch(0.3 0.013 250)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="events" fill="oklch(0.74 0.14 195)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Top participants</h2>
          {participants.length === 0 ? (
            <p className="text-xs text-muted-foreground">No participants yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {participants.map((p) => (
                <li key={p}>
                  <Link
                    to="/wallets/$address"
                    params={{ address: p }}
                    className="block rounded-md border border-border/60 bg-muted/20 px-2.5 py-1.5 hover:border-border hover:bg-muted/40"
                  >
                    <HashCell value={p} head={10} tail={8} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-foreground">Recent events</h2>
        {events ? (
          <DataTable rows={events} columns={eventCols} rowKey={(e) => e.id} dense />
        ) : (
          <LoadingState />
        )}
      </div>
    </AppShell>
  );
}