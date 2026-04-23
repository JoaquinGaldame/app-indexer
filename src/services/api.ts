// Mock API service layer.
// SHAPE NOTE: every function returns a Promise that mirrors how a real
// fetch('/api/...').then(r => r.json()) call would resolve. To migrate to a
// real backend, replace the bodies of these functions with fetch() calls —
// component code does not need to change.

import {
  buildOverview,
  mockContracts,
  mockEvents,
  mockSyncLogs,
  mockSyncStatus,
  mockWallets,
} from "@/mocks/data";
import type {
  Contract,
  ContractFilters,
  DashboardOverviewStats,
  EventFilters,
  IndexedEvent,
  Paginated,
  SyncLogEntry,
  SyncStatus,
  WalletSummary,
} from "@/types";

const delay = (ms = 250) => new Promise((res) => setTimeout(res, ms));

function paginate<T>(rows: T[], page = 1, pageSize = 20): Paginated<T> {
  const start = (page - 1) * pageSize;
  return {
    data: rows.slice(start, start + pageSize),
    page,
    pageSize,
    total: rows.length,
  };
}

export const api = {
  // GET /api/overview
  async getOverview(): Promise<DashboardOverviewStats> {
    await delay();
    return buildOverview();
  },

  // GET /api/contracts
  async listContracts(filters: ContractFilters = {}): Promise<Paginated<Contract>> {
    await delay();
    const q = (filters.search ?? "").toLowerCase();
    let rows = mockContracts.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q),
    );
    if (filters.status && filters.status !== "all") {
      rows = rows.filter((c) => c.status === filters.status);
    }
    if (filters.network && filters.network !== "all") {
      rows = rows.filter((c) => c.network === filters.network);
    }
    return paginate(rows, filters.page ?? 1, filters.pageSize ?? 20);
  },

  // GET /api/contracts/:id
  async getContract(id: string): Promise<Contract | null> {
    await delay();
    return mockContracts.find((c) => c.id === id) ?? null;
  },

  // GET /api/events
  async listEvents(filters: EventFilters = {}): Promise<Paginated<IndexedEvent>> {
    await delay();
    let rows = mockEvents.slice();
    if (filters.contractId) rows = rows.filter((e) => e.contractId === filters.contractId);
    if (filters.eventName) rows = rows.filter((e) => e.eventName === filters.eventName);
    if (filters.walletAddress) {
      const w = filters.walletAddress.toLowerCase();
      rows = rows.filter((e) => e.participants.some((p) => p.toLowerCase().includes(w)));
    }
    if (filters.txHash) {
      const t = filters.txHash.toLowerCase();
      rows = rows.filter((e) => e.txHash.toLowerCase().includes(t));
    }
    if (filters.fromBlock != null) rows = rows.filter((e) => e.blockNumber >= filters.fromBlock!);
    if (filters.toBlock != null) rows = rows.filter((e) => e.blockNumber <= filters.toBlock!);
    if (filters.fromDate) rows = rows.filter((e) => e.timestamp >= filters.fromDate!);
    if (filters.toDate) rows = rows.filter((e) => e.timestamp <= filters.toDate!);
    return paginate(rows, filters.page ?? 1, filters.pageSize ?? 25);
  },

  // GET /api/events/:id
  async getEvent(id: string): Promise<IndexedEvent | null> {
    await delay();
    return mockEvents.find((e) => e.id === id) ?? null;
  },

  // GET /api/contracts/:id/events
  async listEventsForContract(contractId: string, limit = 25): Promise<IndexedEvent[]> {
    await delay();
    return mockEvents.filter((e) => e.contractId === contractId).slice(0, limit);
  },

  // GET /api/wallets
  async listWallets(limit = 50): Promise<WalletSummary[]> {
    await delay();
    return mockWallets.slice(0, limit);
  },

  // GET /api/wallets/:address
  async getWallet(address: string): Promise<WalletSummary | null> {
    await delay();
    return (
      mockWallets.find((w) => w.address.toLowerCase() === address.toLowerCase()) ?? null
    );
  },

  // GET /api/wallets/:address/events
  async getWalletEvents(address: string, limit = 50): Promise<IndexedEvent[]> {
    await delay();
    return mockEvents
      .filter((e) => e.participants.some((p) => p.toLowerCase() === address.toLowerCase()))
      .slice(0, limit);
  },

  // GET /api/sync-status
  async getSyncStatus(): Promise<SyncStatus[]> {
    await delay();
    return mockSyncStatus;
  },

  // GET /api/sync-logs
  async getSyncLogs(limit = 50): Promise<SyncLogEntry[]> {
    await delay();
    return mockSyncLogs.slice(0, limit);
  },
};