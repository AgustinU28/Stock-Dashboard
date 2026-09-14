import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-lg bg-card text-card-foreground",
        "shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]",
        "dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1 p-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn("font-display text-base font-medium tracking-tight", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-4 pt-0", className)} {...props} />;
}
