import { createFileRoute } from "@tanstack/react-router";
import { EventsPage } from "@/pages/EventsPage";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Events Explorer — Chainscope" },
      { name: "description", content: "Search and inspect indexed on-chain events." },
    ],
  }),
  component: EventsPage,
});