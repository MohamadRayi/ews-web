import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";

interface ChartData {
  date: string;
  value: number;
}

interface WaterLevelChartProps {
  data: ChartData[];
  title?: string;
  description?: string;
}

const WaterLevelChart = ({
  data,
  title,
  description,
}: WaterLevelChartProps) => {
  const chartData = useMemo(() => data, [data]);

  // Calculate min and max values for better visualization
  const minValue = useMemo(() => Math.min(...data.map(d => d.value)), [data]);
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value)), [data]);
  const yDomain = useMemo(() => {
    const padding = (maxValue - minValue) * 0.1;
    return [Math.max(0, minValue - padding), maxValue + padding];
  }, [minValue, maxValue]);

  // Define danger zones
  const dangerZones = useMemo(() => {
    const zones = [
      { level: 100, color: "#FBBF24", label: "Waspada" },
      { level: 150, color: "#F97316", label: "Siaga" },
      { level: 200, color: "#EF4444", label: "Bahaya" },
    ];
    return zones.filter(zone => zone.level >= yDomain[0] && zone.level <= yDomain[1]);
  }, [yDomain]);

  if (!data.length) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Tidak ada data untuk ditampilkan</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {title && <h3 className="font-semibold">{title}</h3>}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => value}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis
              domain={yDomain}
              tickFormatter={(value) => `${value} cm`}
            />
            <Tooltip
              formatter={(value: number) => [`${value} cm`, "Ketinggian Air"]}
              labelFormatter={(label) => `Waktu: ${label}`}
            />

            {/* Reference Areas for Danger Zones */}
            {dangerZones.map((zone, index) => (
              <ReferenceArea
                key={zone.level}
                y1={index > 0 ? dangerZones[index - 1].level : yDomain[0]}
                y2={zone.level}
                fill={zone.color}
                fillOpacity={0.1}
                ifOverflow="extendDomain"
              />
            ))}

            <Line
              type="monotone"
              dataKey="value"
              stroke="#2563EB"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WaterLevelChart;
