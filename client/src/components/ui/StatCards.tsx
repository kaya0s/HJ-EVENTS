import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "success" | "warning" | "info";
}

export function StatCard({
  title,
  value,
  icon: Icon,
  variant = "default",
}: StatCardProps) {
  const variantStyles = {
    default: "from-primary/10 to-primary/5",
    success: "from-success/10 to-success/5",
    warning: "from-warning/10 to-warning/5",
    info: "from-info/10 to-info/5",
  };

  const iconStyles = {
    default: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    info: "text-info bg-info/10",
  };

  return (
    <Card className="relative overflow-hidden border-border/50 shadow-soft hover:shadow-soft-lg transition-all">
      <CardContent className="relative p-6">
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-50",
            variantStyles[variant]
          )}
        />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <p className="text-3xl font-bold text-foreground">{value}</p>
            </div>
            <div className={cn("rounded-full p-3", iconStyles[variant])}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
