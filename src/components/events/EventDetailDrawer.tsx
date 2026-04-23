import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { HashCell } from "@/components/common/HashCell";
import { JsonViewerCard } from "@/components/common/JsonViewerCard";
import {
  EventStatusBadge,
  EventTypeBadge,
  NetworkBadge,
} from "@/components/common/StatusBadge";
import { formatDateTime, formatNumber, timeAgo } from "@/lib/format";
import type { IndexedEvent } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";

export function EventDetailDrawer({
  event,
  open,
  onOpenChange,
}: {
  event: IndexedEvent | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {event && (
          <>
            <SheetHeader className="border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <EventTypeBadge name={event.eventName} />
                <NetworkBadge network={event.network} />
                <EventStatusBadge status={event.status} />
              </div>
              <SheetTitle className="font-mono text-base">
                {event.eventName}
              </SheetTitle>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(event.timestamp)} · {timeAgo(event.timestamp)}
              </p>
            </SheetHeader>

            <div className="space-y-5 pt-5">
              <Field label="Contract">
                <Link
                  to="/contracts/$contractId"
                  params={{ contractId: event.contractId }}
                  className="text-foreground hover:underline"
                >
                  {event.contractName}
                </Link>
                <span className="ml-2">
                  <HashCell value={event.contractAddress} />
                </span>
              </Field>
              <Field label="Transaction Hash">
                <HashCell value={event.txHash} head={10} tail={8} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Block Number">
                  <span className="font-mono text-foreground">
                    #{formatNumber(event.blockNumber)}
                  </span>
                </Field>
                <Field label="Log Index">
                  <span className="font-mono text-foreground">{event.logIndex}</span>
                </Field>
              </div>
              <Field label="Participants">
                <div className="flex flex-col gap-1">
                  {event.participants.map((p) => (
                    <HashCell key={p} value={p} />
                  ))}
                </div>
              </Field>

              <Tabs defaultValue="decoded" className="w-full">
                <TabsList>
                  <TabsTrigger value="decoded">Decoded</TabsTrigger>
                  <TabsTrigger value="raw">Raw log</TabsTrigger>
                </TabsList>
                <TabsContent value="decoded" className="mt-3">
                  <JsonViewerCard title="Decoded payload" data={event.decodedPayload} />
                </TabsContent>
                <TabsContent value="raw" className="mt-3">
                  <JsonViewerCard title="Raw log" data={event.rawPayload} />
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}