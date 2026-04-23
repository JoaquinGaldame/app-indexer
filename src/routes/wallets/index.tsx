import { createFileRoute } from "@tanstack/react-router";
import { WalletsPage } from "@/pages/WalletsPage";

export const Route = createFileRoute("/wallets/")({
  head: () => ({
    meta: [
      { title: "Wallets — Chainscope" },
      { name: "description", content: "Wallet activity across indexed contracts." },
    ],
  }),
  component: WalletsPage,
});