import { createFileRoute } from "@tanstack/react-router";
import { ContractDetailPage } from "@/pages/ContractDetailPage";

export const Route = createFileRoute("/contracts/$contractId")({
  head: () => ({
    meta: [
      { title: "Contract — Chainscope" },
      { name: "description", content: "Indexed contract detail, tracked events and sync status." },
    ],
  }),
  component: ContractDetailPage,
});