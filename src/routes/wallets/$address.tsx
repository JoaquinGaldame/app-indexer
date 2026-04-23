import { createFileRoute } from "@tanstack/react-router";
import { WalletDetailPage } from "@/pages/WalletDetailPage";

export const Route = createFileRoute("/wallets/$address")({
  head: () => ({
    meta: [
      { title: "Wallet activity — Chainscope" },
      { name: "description", content: "Activity, related contracts, and event history for a wallet." },
    ],
  }),
  component: WalletDetailPage,
});