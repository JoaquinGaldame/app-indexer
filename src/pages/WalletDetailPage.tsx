import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingState, EmptyState } from "@/components/common/EmptyState";
import { MetricCard } from "@/components/common/MetricCard";
import { HashCell } from "@/components/common/HashCell";
import { DataTable, type Column } from "@/components/common/DataTable";
import {
  EventStatusBadge,
  EventTypeBadge,
  NetworkBadge,
} from "@/components/common/StatusBadge";
import { api } from "@/services/api";
import { mockContracts } from "@/mocks/data";
import type { IndexedEvent, WalletSummary } from "@/types";
import { formatDateTime, formatNumber, timeAgo } from "@/lib/format";
import { ArrowLeft, Wallet } from "lucide-react";

export function WalletDetailPage() {
  const { address } = useParams({ from: "/wallets/$address" });
  const [wallet, setWallet] = useState<WalletSummary | null | undefined>(undefined);
  const [events, setEvents] = useState<IndexedEvent[] | null>(null);

  useEffect(() => {
    api.getWallet(address).then(setWallet);
    api.getWalletEvents(address, 50).then(setEvents);
  }, [address]);

  if (wallet === undefined) {
    return (
      <AppShell>
        <LoadingState rows={6} />
      </AppShell>
    );
  }
  if (wallet === null) {
    return (
      <AppShell>
        <EmptyState icon={Wallet} title="Wallet not found" />
      </AppShell>
    );
  }

  const eventTypes = Object.entries(wallet.eventCountsByType).sort((a, b) => b[1] - a[1]);
  const relatedContracts = mockContracts.filter((c) => wallet.relatedContractIds.includes(c.id));

  const cols: Column<IndexedEvent>[] = [
    { key: "evt", header: "Event", cell: (e) => <EventTypeBadge name={e.eventName} /> },
    { key: "ctr", header: "Contract", cell: (e) => e.contractName },
    { key: "net", header: "Net", cell: (e) => <NetworkBadge network={e.network} /> },
    { key: "tx", header: "Tx", cell: (e) => <HashCell value={e.txHash} /> },
    {
      key: "blk",
      header: "Block",
      align: "right",
      cell: (e) => <span className="font-mono">{formatNumber(e.blockNumber)}</span>,
    },
    {
      key: "ts",
      header: "When",
      align: "right",
      cell: (e) => <span className="text-muted-foreground">{timeAgo(e.timestamp)}</span>,
    },
    { key: "st", header: "", cell: (e) => <EventStatusBadge status={e.status} /> },
  ];

  return (
    <AppShell>
      <Link
        to="/wallets"
        className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3" /> Back to wallets
      </Link>

      <div className="mb-6 rounded-lg border border-border bg-card p-6">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Wallet
        </div>
        <div className="mt-1">
          <HashCell value={wallet.address} head={14} tail={10} />
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          First seen {formatDateTime(wallet.firstSeenAt)} · last seen{" "}
          {formatDateTime(wallet.lastSeenAt)}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Total events" value={formatNumber(wallet.totalEvents)} />
        <MetricCard label="Related contracts" value={wallet.relatedContractIds.length} />
        <MetricCard label="Event types" value={eventTypes.length} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold">Event types</h2>
          <ul className="space-y-1.5">
            {eventTypes.map(([n, count]) => (
              <li
                key={n}
                className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-2.5 py-1.5"
              >
                <EventTypeBadge name={n} />
                <span className="font-mono text-xs text-foreground">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold">Related contracts</h2>
          <ul className="space-y-1.5">
            {relatedContracts.map((c) => (
              <li key={c.id}>
                <Link
                  to="/contracts/$contractId"
                  params={{ contractId: c.id }}
                  className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-3 py-2 hover:border-border hover:bg-muted/40"
                >
                  <div>
                    <div className="text-sm font-medium text-foreground">{c.name}</div>
                    <div className="mt-0.5">
                      <HashCell value={c.address} />
                    </div>
                  </div>
                  <NetworkBadge network={c.network} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-foreground">Activity timeline</h2>
        {events ? (
          <DataTable rows={events} columns={cols} rowKey={(e) => e.id} dense />
        ) : (
          <LoadingState />
        )}
      </div>
    </AppShell>
  );
}