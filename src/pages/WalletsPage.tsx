import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/common/SectionHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { LoadingState } from "@/components/common/EmptyState";
import { HashCell } from "@/components/common/HashCell";
import { api } from "@/services/api";
import type { WalletSummary } from "@/types";
import { formatNumber, timeAgo } from "@/lib/format";
import { useNavigate } from "@tanstack/react-router";

export function WalletsPage() {
  const [rows, setRows] = useState<WalletSummary[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.listWallets(50).then(setRows);
  }, []);

  const cols: Column<WalletSummary>[] = [
    {
      key: "addr",
      header: "Wallet",
      cell: (w) => <HashCell value={w.address} head={10} tail={8} />,
    },
    {
      key: "events",
      header: "Events",
      align: "right",
      sortAccessor: (w) => w.totalEvents,
      cell: (w) => <span className="font-mono">{formatNumber(w.totalEvents)}</span>,
    },
    {
      key: "contracts",
      header: "Contracts",
      align: "right",
      sortAccessor: (w) => w.relatedContractIds.length,
      cell: (w) => <span className="font-mono">{w.relatedContractIds.length}</span>,
    },
    {
      key: "first",
      header: "First seen",
      align: "right",
      sortAccessor: (w) => w.firstSeenAt,
      cell: (w) => <span className="text-muted-foreground">{timeAgo(w.firstSeenAt)}</span>,
    },
    {
      key: "last",
      header: "Last seen",
      align: "right",
      sortAccessor: (w) => w.lastSeenAt,
      cell: (w) => <span className="text-muted-foreground">{timeAgo(w.lastSeenAt)}</span>,
    },
  ];

  return (
    <AppShell>
      <SectionHeader
        title="Wallets"
        description="Wallets observed as participants across indexed events."
      />
      {rows ? (
        <DataTable
          rows={rows}
          columns={cols}
          rowKey={(w) => w.address}
          onRowClick={(w) =>
            navigate({ to: "/wallets/$address", params: { address: w.address } })
          }
          dense
        />
      ) : (
        <LoadingState />
      )}
    </AppShell>
  );
}