import { cn } from "@/lib/utils/cn";

type PriceTagTone = "ok" | "low" | "out";

const TONE_CLASSES: Record<PriceTagTone, string> = {
  ok: "bg-success/15 text-success",
  low: "bg-warning/20 text-warning-foreground",
  out: "bg-destructive/15 text-destructive",
};

const TONE_DOT: Record<PriceTagTone, string> = {
  ok: "bg-success",
  low: "bg-warning",
  out: "bg-destructive",
};

/**
 * Stock-status chip shaped like a price tag (pointed left edge + grommet
 * dot) instead of a generic pill badge — the interface's signature element.
 */
export function PriceTag({
  tone,
  children,
  className,
}: {
  tone: PriceTagTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center gap-1.5 py-1 pl-4 pr-2.5 text-xs font-medium font-mono-ticket",
        "[clip-path:polygon(10px_0,100%_0,100%_100%,10px_100%,0_50%)]",
        TONE_CLASSES[tone],
        className
      )}
    >
      <span className={cn("h-1 w-1 rounded-full", TONE_DOT[tone])} aria-hidden="true" />
      {children}
    </span>
  );
}
