import { createFileRoute } from "@tanstack/react-router";
import { ContractsPage } from "@/pages/ContractsPage";

export const Route = createFileRoute("/contracts/")({
  head: () => ({
    meta: [
      { title: "Contracts — Chainscope" },
      { name: "description", content: "Indexed smart contracts and their sync state." },
    ],
  }),
  component: ContractsPage,
});