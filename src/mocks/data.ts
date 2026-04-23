import type {
  Contract,
  IndexedEvent,
  SyncLogEntry,
  SyncStatus,
  WalletSummary,
  DashboardOverviewStats,
} from "@/types";

const EVENT_NAMES = [
  "PaymentReceived",
  "OrderCreated",
  "DepositMade",
  "Released",
  "Refunded",
  "Transfer",
  "Approval",
  "Withdrawn",
] as const;

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
const r = rand(42);

function hex(len: number) {
  let s = "0x";
  for (let i = 0; i < len; i++) s += Math.floor(r() * 16).toString(16);
  return s;
}
const addr = () => hex(40);
const txh = () => hex(64);

const NETWORKS = ["ethereum", "polygon", "arbitrum", "base", "optimism"] as const;

const CONTRACT_NAMES = [
  "EscrowVault",
  "PaymentProcessor",
  "OrderRegistry",
  "TokenStaking",
  "GovernanceModule",
  "RewardDistributor",
  "BridgeAdapter",
  "MarketplaceCore",
  "LiquidityPool",
  "OracleFeed",
];

const LATEST_CHAIN_BLOCK = 21_487_932;

export const mockContracts: Contract[] = CONTRACT_NAMES.map((name, i) => {
  const lag = Math.floor(r() * 800);
  const state = lag < 5 ? "synced" : lag < 50 ? "syncing" : lag < 200 ? "lagging" : i === 7 ? "error" : "syncing";
  return {
    id: `c_${i + 1}`,
    name,
    address: addr(),
    network: NETWORKS[i % NETWORKS.length],
    startBlock: 18_000_000 + i * 100_000,
    lastSyncedBlock: LATEST_CHAIN_BLOCK - lag,
    latestChainBlock: LATEST_CHAIN_BLOCK,
    totalEvents: Math.floor(r() * 240_000) + 1500,
    trackedEventNames: EVENT_NAMES.slice(0, 3 + Math.floor(r() * 4)) as unknown as string[],
    abiSource: i % 4 === 0 ? "manual" : i % 5 === 0 ? "proxy" : "verified",
    status: i === 5 ? "inactive" : "active",
    syncState: state,
    createdAt: new Date(Date.now() - (i + 1) * 86_400_000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - i * 60_000).toISOString(),
  };
});

function makeEvent(i: number): IndexedEvent {
  const c = mockContracts[i % mockContracts.length];
  const eventName = EVENT_NAMES[i % EVENT_NAMES.length];
  const from = addr();
  const to = addr();
  return {
    id: `e_${i + 1}`,
    eventName,
    contractId: c.id,
    contractName: c.name,
    contractAddress: c.address,
    network: c.network,
    txHash: txh(),
    blockNumber: c.lastSyncedBlock - Math.floor(r() * 5000),
    logIndex: Math.floor(r() * 200),
    timestamp: new Date(Date.now() - i * 47_000 - Math.floor(r() * 60_000)).toISOString(),
    participants: [from, to],
    status: r() < 0.97 ? "indexed" : r() < 0.5 ? "pending" : "reorged",
    decodedPayload: {
      from,
      to,
      amount: (Math.floor(r() * 1_000_000) / 100).toString(),
      token: "0x" + "a".repeat(40),
      orderId: `ord_${Math.floor(r() * 99999)}`,
    },
    rawPayload: {
      topics: [
        "0x" + "ab".repeat(32),
        "0x" + from.slice(2).padStart(64, "0"),
        "0x" + to.slice(2).padStart(64, "0"),
      ],
      data: "0x" + "cd".repeat(64),
    },
  };
}

export const mockEvents: IndexedEvent[] = Array.from({ length: 240 }, (_, i) => makeEvent(i));

// Wallets — derive from event participants
const walletMap = new Map<string, WalletSummary>();
for (const ev of mockEvents) {
  for (const w of ev.participants) {
    const ex = walletMap.get(w);
    if (ex) {
      ex.totalEvents += 1;
      ex.lastSeenAt = ev.timestamp > ex.lastSeenAt ? ev.timestamp : ex.lastSeenAt;
      ex.firstSeenAt = ev.timestamp < ex.firstSeenAt ? ev.timestamp : ex.firstSeenAt;
      if (!ex.relatedContractIds.includes(ev.contractId)) ex.relatedContractIds.push(ev.contractId);
      ex.eventCountsByType[ev.eventName] = (ex.eventCountsByType[ev.eventName] ?? 0) + 1;
    } else {
      walletMap.set(w, {
        address: w,
        totalEvents: 1,
        firstSeenAt: ev.timestamp,
        lastSeenAt: ev.timestamp,
        relatedContractIds: [ev.contractId],
        eventCountsByType: { [ev.eventName]: 1 },
      });
    }
  }
}
export const mockWallets: WalletSummary[] = Array.from(walletMap.values()).sort(
  (a, b) => b.totalEvents - a.totalEvents,
);

export const mockSyncStatus: SyncStatus[] = mockContracts.map((c) => ({
  contractId: c.id,
  contractName: c.name,
  network: c.network,
  currentIndexedBlock: c.lastSyncedBlock,
  latestChainBlock: c.latestChainBlock,
  lag: c.latestChainBlock - c.lastSyncedBlock,
  state: c.syncState,
  lastSuccessAt: new Date(Date.now() - Math.floor(r() * 600_000)).toISOString(),
  lastErrorAt: c.syncState === "error" ? new Date(Date.now() - 320_000).toISOString() : null,
  lastErrorMessage:
    c.syncState === "error" ? "RPC timeout while fetching logs from block range" : null,
}));

export const mockSyncLogs: SyncLogEntry[] = Array.from({ length: 60 }, (_, i) => {
  const c = mockContracts[i % mockContracts.length];
  const lvl = r() < 0.1 ? "warn" : r() < 0.05 ? "error" : "info";
  return {
    id: `l_${i + 1}`,
    contractId: c.id,
    contractName: c.name,
    level: lvl as "info" | "warn" | "error",
    message:
      lvl === "error"
        ? "Failed to decode log: ABI mismatch at topic[1]"
        : lvl === "warn"
          ? "Reorg detected, rolling back 3 blocks"
          : `Indexed ${Math.floor(r() * 50) + 1} events from block ${c.lastSyncedBlock - i}`,
    blockNumber: c.lastSyncedBlock - i,
    timestamp: new Date(Date.now() - i * 90_000).toISOString(),
  };
});

export function buildOverview(): DashboardOverviewStats {
  const now = Date.now();
  const series = Array.from({ length: 24 }, (_, i) => {
    const t = new Date(now - (23 - i) * 3_600_000);
    const base = 200 + Math.sin(i / 3) * 80 + r() * 60;
    return { t: t.toISOString(), events: Math.max(20, Math.floor(base)) };
  });
  return {
    totalContracts: mockContracts.length,
    activeContracts: mockContracts.filter((c) => c.status === "active").length,
    totalEvents: mockContracts.reduce((s, c) => s + c.totalEvents, 0),
    totalWallets: mockWallets.length,
    latestSyncedBlock: Math.min(...mockContracts.map((c) => c.lastSyncedBlock)),
    latestChainBlock: LATEST_CHAIN_BLOCK,
    averageSyncLag: Math.round(
      mockSyncStatus.reduce((s, x) => s + x.lag, 0) / mockSyncStatus.length,
    ),
    eventsLast24h: series.reduce((s, x) => s + x.events, 0),
    eventVolumeSeries: series,
  };
}