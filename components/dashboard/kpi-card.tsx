import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export function KpiCard({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <Card className="p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-mono-ticket text-[28px] font-semibold leading-none",
          accent ? "text-accent" : "text-foreground"
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
}
