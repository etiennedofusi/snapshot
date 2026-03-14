"use client";

type HourlyChartProps = {
  data: number[];
};

export function HourlyChart({ data }: HourlyChartProps) {
  const max = Math.max(...data, 1);
  // Only show business hours (6h-22h)
  const startHour = 6;
  const endHour = 22;
  const slice = data.slice(startHour, endHour);

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Heures de pointe
      </h3>
      <div className="flex items-end gap-1 h-24">
        {slice.map((count, i) => {
          const hour = startHour + i;
          const height = max > 0 ? (count / max) * 100 : 0;
          return (
            <div
              key={hour}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div className="w-full relative" style={{ height: "100%" }}>
                <div
                  className="absolute bottom-0 w-full rounded-sm bg-black/80 transition-all"
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
              </div>
              {hour % 3 === 0 && (
                <span className="text-[9px] text-gray-400">{hour}h</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
