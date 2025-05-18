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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartData {
  date: string;
  value: number;
}

interface ZoomableWaterLevelChartProps {
  data: ChartData[];
  title?: string;
  description?: string;
  scrollable?: boolean;
}

const ZoomableWaterLevelChart = ({
  data,
  title,
  description,
  scrollable = false,
}: ZoomableWaterLevelChartProps) => {
  const chartData = useMemo(() => data, [data]);

  // Calculate min and max values for better visualization
  const { minValue, maxValue, yDomain } = useMemo(() => {
    if (data.length === 0) {
      return {
        minValue: 0,
        maxValue: 100,
        yDomain: [0, 100]
      };
    }
    const min = Math.min(...data.map(d => d.value));
    const max = Math.max(...data.map(d => d.value));
    const padding = ((max - min) || 50) * 0.1; // Use 50 as default range if min === max
    return {
      minValue: min,
      maxValue: max,
      yDomain: [Math.max(0, min - padding), max + padding]
    };
  }, [data]);

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
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Tidak ada data untuk ditampilkan</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => value}
          interval={0}
          minTickGap={0}
          ticks={Array.from(new Set(chartData.map(d => d.date))).filter((v, i, arr) => {
            return v.endsWith(':00');
          })}
        />
        <YAxis
          domain={yDomain}
          tickFormatter={(value) => `${value} cm`}
        />
        <Tooltip
          formatter={(value: number) => [`${value} cm`, "Ketinggian Air"]}
          labelFormatter={(label) => `Waktu: ${label}`}
          contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
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
          dot={data.length < 30} // Only show dots if we have few data points
          activeDot={{ r: 4 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ZoomableWaterLevelChart;
