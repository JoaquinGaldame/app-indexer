import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingState, EmptyState } from "@/components/common/EmptyState";
import { HashCell } from "@/components/common/HashCell";
import { JsonViewerCard } from "@/components/common/JsonViewerCard";
import {
  EventStatusBadge,
  EventTypeBadge,
  NetworkBadge,
} from "@/components/common/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/services/api";
import type { IndexedEvent } from "@/types";
import { formatDateTime, formatNumber, timeAgo } from "@/lib/format";
import { ArrowLeft, Zap } from "lucide-react";

export function EventDetailPage() {
  const { eventId } = useParams({ from: "/events/$eventId" });
  const [event, setEvent] = useState<IndexedEvent | null | undefined>(undefined);

  useEffect(() => {
    api.getEvent(eventId).then((e) => setEvent(e));
  }, [eventId]);

  if (event === undefined) {
    return (
      <AppShell>
        <LoadingState rows={6} />
      </AppShell>
    );
  }
  if (event === null) {
    return (
      <AppShell>
        <EmptyState icon={Zap} title="Event not found" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Link
        to="/events"
        className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3" /> Back to events
      </Link>

      <div className="mb-6 rounded-lg border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-2">
          <EventTypeBadge name={event.eventName} />
          <NetworkBadge network={event.network} />
          <EventStatusBadge status={event.status} />
          <span className="ml-auto text-xs text-muted-foreground">
            {formatDateTime(event.timestamp)} · {timeAgo(event.timestamp)}
          </span>
        </div>
        <h1 className="mt-3 font-mono text-lg text-foreground">{event.eventName}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Metadata</h2>
          <dl className="space-y-3 text-sm">
            <Row label="Contract">
              <Link
                to="/contracts/$contractId"
                params={{ contractId: event.contractId }}
                className="text-foreground hover:underline"
              >
                {event.contractName}
              </Link>
            </Row>
            <Row label="Address">
              <HashCell value={event.contractAddress} />
            </Row>
            <Row label="Tx hash">
              <HashCell value={event.txHash} head={10} tail={8} />
            </Row>
            <Row label="Block">
              <span className="font-mono">#{formatNumber(event.blockNumber)}</span>
            </Row>
            <Row label="Log index">
              <span className="font-mono">{event.logIndex}</span>
            </Row>
            <Row label="Participants">
              <div className="flex flex-col gap-1">
                {event.participants.map((p) => (
                  <Link
                    key={p}
                    to="/wallets/$address"
                    params={{ address: p }}
                    className="hover:underline"
                  >
                    <HashCell value={p} />
                  </Link>
                ))}
              </div>
            </Row>
          </dl>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="decoded">
            <TabsList>
              <TabsTrigger value="decoded">Decoded payload</TabsTrigger>
              <TabsTrigger value="raw">Raw log</TabsTrigger>
            </TabsList>
            <TabsContent value="decoded" className="mt-3">
              <JsonViewerCard title="Decoded" data={event.decodedPayload} />
            </TabsContent>
            <TabsContent value="raw" className="mt-3">
              <JsonViewerCard title="Raw log" data={event.rawPayload} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="col-span-2">{children}</dd>
    </div>
  );
}