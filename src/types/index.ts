// Domain models — designed to mirror likely backend REST API payloads.
// Future: replace mock services with fetch() against /api/* endpoints
// returning these exact shapes.

export type Network = "ethereum" | "polygon" | "arbitrum" | "base" | "optimism";
export type SyncState = "synced" | "syncing" | "lagging" | "error" | "paused";

export interface Contract {
  id: string;
  name: string;
  address: string;
  network: Network;
  startBlock: number;
  lastSyncedBlock: number;
  latestChainBlock: number;
  totalEvents: number;
  trackedEventNames: string[];
  abiSource: "verified" | "manual" | "proxy";
  status: "active" | "inactive";
  syncState: SyncState;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface ContractEventDefinition {
  name: string;
  signature: string;
  indexedCount: number;
}

export interface IndexedEvent {
  id: string;
  eventName: string;
  contractId: string;
  contractName: string;
  contractAddress: string;
  network: Network;
  txHash: string;
  blockNumber: number;
  logIndex: number;
  timestamp: string; // ISO
  participants: string[]; // wallet addresses involved
  status: "indexed" | "reorged" | "pending";
  decodedPayload: Record<string, unknown>;
  rawPayload: {
    topics: string[];
    data: string;
  };
}

export interface WalletSummary {
  address: string;
  totalEvents: number;
  firstSeenAt: string;
  lastSeenAt: string;
  relatedContractIds: string[];
  eventCountsByType: Record<string, number>;
}

export interface SyncStatus {
  contractId: string;
  contractName: string;
  network: Network;
  currentIndexedBlock: number;
  latestChainBlock: number;
  lag: number;
  state: SyncState;
  lastSuccessAt: string;
  lastErrorAt: string | null;
  lastErrorMessage: string | null;
}

export interface SyncLogEntry {
  id: string;
  contractId: string;
  contractName: string;
  level: "info" | "warn" | "error";
  message: string;
  blockNumber: number | null;
  timestamp: string;
}

export interface DashboardOverviewStats {
  totalContracts: number;
  activeContracts: number;
  totalEvents: number;
  totalWallets: number;
  latestSyncedBlock: number;
  latestChainBlock: number;
  averageSyncLag: number;
  eventsLast24h: number;
  eventVolumeSeries: { t: string; events: number }[]; // hourly buckets
}

export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface EventFilters {
  contractId?: string;
  eventName?: string;
  walletAddress?: string;
  txHash?: string;
  fromBlock?: number;
  toBlock?: number;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export interface ContractFilters {
  search?: string;
  status?: "active" | "inactive" | "all";
  network?: Network | "all";
  page?: number;
  pageSize?: number;
}