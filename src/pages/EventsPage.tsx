import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/common/SectionHeader";
import { FilterBar } from "@/components/common/FilterBar";
import { DataTable, Pagination, type Column } from "@/components/common/DataTable";
import { LoadingState } from "@/components/common/EmptyState";
import { HashCell } from "@/components/common/HashCell";
import {
  EventStatusBadge,
  EventTypeBadge,
  NetworkBadge,
} from "@/components/common/StatusBadge";
import { EventDetailDrawer } from "@/components/events/EventDetailDrawer";
import { api } from "@/services/api";
import { mockContracts } from "@/mocks/data";
import type { EventFilters, IndexedEvent, Paginated } from "@/types";
import { formatNumber, timeAgo } from "@/lib/format";
import { Search } from "lucide-react";

const EVENT_NAMES = [
  "PaymentReceived",
  "OrderCreated",
  "DepositMade",
  "Released",
  "Refunded",
  "Transfer",
  "Approval",
  "Withdrawn",
];

export function EventsPage() {
  const [filters, setFilters] = useState<EventFilters>({ page: 1, pageSize: 25 });
  const [data, setData] = useState<Paginated<IndexedEvent> | null>(null);
  const [selected, setSelected] = useState<IndexedEvent | null>(null);

  useEffect(() => {
    api.listEvents(filters).then(setData);
  }, [filters]);

  const cols: Column<IndexedEvent>[] = useMemo(
    () => [
      { key: "evt", header: "Event", cell: (e) => <EventTypeBadge name={e.eventName} /> },
      {
        key: "contract",
        header: "Contract",
        cell: (e) => <span className="text-foreground/90">{e.contractName}</span>,
      },
      { key: "net", header: "Net", cell: (e) => <NetworkBadge network={e.network} /> },
      { key: "tx", header: "Tx hash", cell: (e) => <HashCell value={e.txHash} /> },
      {
        key: "blk",
        header: "Block",
        align: "right",
        sortAccessor: (e) => e.blockNumber,
        cell: (e) => <span className="font-mono">{formatNumber(e.blockNumber)}</span>,
      },
      {
        key: "log",
        header: "Log",
        align: "right",
        cell: (e) => <span className="font-mono text-muted-foreground">{e.logIndex}</span>,
      },
      {
        key: "from",
        header: "From",
        cell: (e) => <HashCell value={e.participants[0]} head={6} tail={4} />,
      },
      {
        key: "ts",
        header: "Age",
        align: "right",
        sortAccessor: (e) => e.timestamp,
        cell: (e) => <span className="text-muted-foreground">{timeAgo(e.timestamp)}</span>,
      },
      { key: "st", header: "", cell: (e) => <EventStatusBadge status={e.status} /> },
    ],
    [],
  );

  const update = (patch: Partial<EventFilters>) =>
    setFilters((f) => ({ ...f, ...patch, page: patch.page ?? 1 }));

  return (
    <AppShell>
      <SectionHeader
        title="Events Explorer"
        description="Browse decoded events from indexed contracts. Click a row for full payload."
      />

      <FilterBar>
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search tx hash…"
            value={filters.txHash ?? ""}
            onChange={(e) => update({ txHash: e.target.value || undefined })}
            className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <input
          placeholder="Wallet address…"
          value={filters.walletAddress ?? ""}
          onChange={(e) => update({ walletAddress: e.target.value || undefined })}
          className="h-9 w-[200px] rounded-md border border-border bg-background px-3 font-mono text-xs focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <select
          value={filters.contractId ?? ""}
          onChange={(e) => update({ contractId: e.target.value || undefined })}
          className="h-9 rounded-md border border-border bg-background px-2 text-sm focus:border-ring focus:outline-none"
        >
          <option value="">All contracts</option>
          {mockContracts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={filters.eventName ?? ""}
          onChange={(e) => update({ eventName: e.target.value || undefined })}
          className="h-9 rounded-md border border-border bg-background px-2 text-sm focus:border-ring focus:outline-none"
        >
          <option value="">All events</option>
          {EVENT_NAMES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="From block"
          value={filters.fromBlock ?? ""}
          onChange={(e) =>
            update({ fromBlock: e.target.value ? Number(e.target.value) : undefined })
          }
          className="h-9 w-[120px] rounded-md border border-border bg-background px-3 font-mono text-xs focus:border-ring focus:outline-none"
        />
        <input
          type="number"
          placeholder="To block"
          value={filters.toBlock ?? ""}
          onChange={(e) =>
            update({ toBlock: e.target.value ? Number(e.target.value) : undefined })
          }
          className="h-9 w-[120px] rounded-md border border-border bg-background px-3 font-mono text-xs focus:border-ring focus:outline-none"
        />
        <button
          onClick={() => setFilters({ page: 1, pageSize: 25 })}
          className="h-9 rounded-md border border-border bg-background px-3 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          Reset
        </button>
      </FilterBar>

      {data ? (
        <>
          <DataTable
            rows={data.data}
            columns={cols}
            rowKey={(e) => e.id}
            onRowClick={(e) => setSelected(e)}
            dense
          />
          <Pagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
          />
        </>
      ) : (
        <LoadingState />
      )}

      <EventDetailDrawer
        event={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </AppShell>
  );
}