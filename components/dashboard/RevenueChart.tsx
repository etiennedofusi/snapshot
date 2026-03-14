"use client";

type RevenueChartProps = {
  data: { date: string; total: number }[];
};

export function RevenueChart({ data }: RevenueChartProps) {
  const max = Math.max(...data.map((d) => d.total), 1);
  const lastSeven = data.slice(-7);

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        CA des 30 derniers jours
      </h3>

      {/* Sparkline-style bar chart */}
      <div className="flex items-end gap-[2px] h-28">
        {data.map((day) => {
          const height = max > 0 ? (day.total / max) * 100 : 0;
          const isLastWeek = lastSeven.some((d) => d.date === day.date);
          return (
            <div
              key={day.date}
              className="flex-1 group relative"
              title={`${formatDate(day.date)}: ${day.total.toFixed(2)}€`}
            >
              <div
                className={`w-full rounded-sm transition-all ${
                  isLastWeek ? "bg-black/80" : "bg-black/20"
                } group-hover:bg-black`}
                style={{ height: `${Math.max(height, 1)}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* X axis labels */}
      <div className="flex justify-between text-[9px] text-gray-400">
        <span>{formatDate(data[0]?.date)}</span>
        <span>{formatDate(data[data.length - 1]?.date)}</span>
      </div>
    </div>
  );
}

function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
