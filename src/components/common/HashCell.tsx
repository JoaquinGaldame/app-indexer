import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { shortenHash } from "@/lib/format";

interface HashCellProps {
  value: string;
  href?: string;
  className?: string;
  head?: number;
  tail?: number;
  mono?: boolean;
}

export function HashCell({ value, href, className, head, tail, mono = true }: HashCellProps) {
  const [copied, setCopied] = useState(false);

  const copy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const label = shortenHash(value, head, tail);
  const Inner = (
    <span
      title={value}
      className={cn(
        "inline-flex items-center gap-1.5 text-foreground/90 hover:text-foreground",
        mono && "font-mono text-[12.5px]",
        className,
      )}
    >
      {label}
      <button
        type="button"
        onClick={copy}
        className="rounded p-0.5 text-muted-foreground opacity-0 transition hover:bg-accent hover:text-foreground group-hover:opacity-100"
        aria-label="Copy"
      >
        {copied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
      </button>
    </span>
  );

  if (href) {
    return (
      <span className="group inline-flex">
        <a href={href} className="underline-offset-4 hover:underline">
          {Inner}
        </a>
      </span>
    );
  }
  return <span className="group inline-flex">{Inner}</span>;
}