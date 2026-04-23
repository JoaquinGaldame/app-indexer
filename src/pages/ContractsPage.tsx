import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/common/SectionHeader";
import { FilterBar } from "@/components/common/FilterBar";
import { DataTable, Pagination, type Column } from "@/components/common/DataTable";
import { LoadingState } from "@/components/common/EmptyState";
import { HashCell } from "@/components/common/HashCell";
import {
  ActiveBadge,
  NetworkBadge,
  StatusBadge,
} from "@/components/common/StatusBadge";
import { api } from "@/services/api";
import type { Contract, Paginated } from "@/types";
import { formatNumber } from "@/lib/format";
import { Search } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function ContractsPage() {
  const [data, setData] = useState<Paginated<Contract> | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    api.listContracts({ search, status, page, pageSize: 10 }).then(setData);
  }, [search, status, page]);

  const cols: Column<Contract>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Contract",
        sortAccessor: (r) => r.name,
        cell: (r) => (
          <div>
            <div className="font-medium text-foreground">{r.name}</div>
            <div className="mt-0.5">
              <HashCell value={r.address} />
            </div>
          </div>
        ),
      },
      { key: "net", header: "Network", cell: (r) => <NetworkBadge network={r.network} /> },
      {
        key: "start",
        header: "Start block",
        align: "right",
        sortAccessor: (r) => r.startBlock,
        cell: (r) => <span className="font-mono">{formatNumber(r.startBlock)}</span>,
      },
      {
        key: "synced",
        header: "Last synced",
        align: "right",
        sortAccessor: (r) => r.lastSyncedBlock,
        cell: (r) => <span className="font-mono">{formatNumber(r.lastSyncedBlock)}</span>,
      },
      {
        key: "events",
        header: "Events",
        align: "right",
        sortAccessor: (r) => r.totalEvents,
        cell: (r) => <span className="font-mono">{formatNumber(r.totalEvents)}</span>,
      },
      { key: "sync", header: "Sync", cell: (r) => <StatusBadge state={r.syncState} /> },
      { key: "active", header: "Status", cell: (r) => <ActiveBadge active={r.status === "active"} /> },
    ],
    [],
  );

  return (
    <AppShell>
      <SectionHeader
        title="Contracts"
        description="Smart contracts currently being indexed by the pipeline."
      />

      <FilterBar>
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search by name or address…"
            className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value as typeof status);
          }}
          className="h-9 rounded-md border border-border bg-background px-2 text-sm focus:border-ring focus:outline-none"
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </FilterBar>

      {data ? (
        <>
          <DataTable
            rows={data.data}
            columns={cols}
            rowKey={(r) => r.id}
            onRowClick={(r) =>
              navigate({ to: "/contracts/$contractId", params: { contractId: r.id } })
            }
          />
          <Pagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            onPageChange={setPage}
          />
        </>
      ) : (
        <LoadingState />
      )}
    </AppShell>
  );
}