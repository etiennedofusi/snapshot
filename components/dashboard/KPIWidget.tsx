"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

type KPIWidgetProps = {
  label: string;
  value: string;
  subtitle?: string;
  trend?: number | null; // percentage
  icon?: React.ReactNode;
};

export function KPIWidget({ label, value, subtitle, trend, icon }: KPIWidgetProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-black tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          {icon && <div className="text-muted-foreground">{icon}</div>}
          {trend !== undefined && trend !== null && (
            <div
              className={cn(
                "flex items-center gap-0.5 text-xs font-semibold",
                trend >= 0 ? "text-green-600" : "text-red-500"
              )}
            >
              {trend >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend >= 0 ? "+" : ""}
              {trend}%
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
