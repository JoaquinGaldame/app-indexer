import { createFileRoute } from "@tanstack/react-router";
import { EventDetailPage } from "@/pages/EventDetailPage";

export const Route = createFileRoute("/events/$eventId")({
  head: () => ({
    meta: [
      { title: "Event — Chainscope" },
      { name: "description", content: "Decoded and raw event payload detail." },
    ],
  }),
  component: EventDetailPage,
});