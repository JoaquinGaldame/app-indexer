import { createFileRoute } from "@tanstack/react-router";
import { OverviewPage } from "@/pages/OverviewPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — Chainscope Indexer Console" },
      {
        name: "description",
        content:
          "Operational overview for an EVM blockchain indexer: contracts, events, sync lag, and chain health.",
      },
    ],
  }),
  component: OverviewPage,
});
