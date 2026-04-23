import { createFileRoute } from "@tanstack/react-router";
import { SyncStatusPage } from "@/pages/SyncStatusPage";

export const Route = createFileRoute("/sync")({
  head: () => ({
    meta: [
      { title: "Sync Status — Chainscope" },
      { name: "description", content: "Indexer health, sync lag and recent sync logs per contract." },
    ],
  }),
  component: SyncStatusPage,
});