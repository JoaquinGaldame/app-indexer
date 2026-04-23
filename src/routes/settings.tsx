import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/common/SectionHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Settings as SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Chainscope" },
      { name: "description", content: "Indexer configuration and workspace settings." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppShell>
      <SectionHeader
        title="Settings"
        description="Indexer configuration, API keys, and workspace preferences."
      />
      <EmptyState
        icon={SettingsIcon}
        title="Settings module coming soon"
        description="This area will host indexer pipeline configuration, RPC endpoints, retention policies, and access control once the backend integration lands."
      />
    </AppShell>
  );
}