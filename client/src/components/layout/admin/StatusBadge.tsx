import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "pending" | "approved" | "completed" | "declined";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    pending: "bg-warning/20 text-warning-foreground border-warning/30",
    approved: "bg-info/20 text-info-foreground border-info/30",
    completed: "bg-success/20 text-success-foreground border-success/30",
    declined:
      "bg-destructive/20 text-destructive-foreground border-destructive/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[status],
        className
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
