import { ResponsiveLine } from "@nivo/line";
import { linearGradientDef } from "@nivo/core";

interface ZoomableWaterLevelChartProps {
  hourlyData?: any[];
  tenMinuteData?: any[];
  data?: { date: string; value: number; }[];
  title?: string;
  description?: string;
  scrollable?: boolean;
  sensors?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

const ZoomableWaterLevelChart = ({ 
  data,
  hourlyData,
  tenMinuteData,
  title,
  description,
  scrollable,
  sensors 
}: ZoomableWaterLevelChartProps) => {
  // Process data based on which props are provided
  const chartData = data ? [
    {
      id: "Tinggi Air (cm)",
      color: "#0EA5E9",
      data: data.map((d) => ({
        x: d.date,
        y: d.value
      }))
    }
  ] : sensors?.map(sensor => ({
    id: sensor.name,
    color: sensor.color,
    data: (hourlyData || []).map(d => ({
      x: d.time,
      y: d[sensor.id]
    })).filter(d => d.y !== undefined)
  })) || [];

  return (
    <ResponsiveLine
      data={chartData}
      margin={{ top: 10, right: 30, bottom: 50, left: 50 }}
      xScale={{
        type: "point"
      }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: false
      }}
      curve="monotoneX"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: -45,
        legend: "Waktu",
        legendOffset: 40
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Ketinggian Air (cm)",
        legendOffset: -40
      }}
      enableGridX={true}
      enableGridY={true}
      colors={chartData.length === 1 ? ["#0EA5E9"] : { scheme: 'category10' }}
      lineWidth={2}
      pointSize={6}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={2}
      pointBorderColor={{ from: 'serieColor' }}
      enableArea={true}
      areaOpacity={0.15}
      enableSlices="x"
      useMesh={true}
      animate={false}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: "#E2E8F0"
            }
          },
          ticks: {
            line: {
              stroke: "#E2E8F0"
            },
            text: {
              fill: "#64748B"
            }
          }
        },
        grid: {
          line: {
            stroke: "#F1F5F9"
          }
        },
        crosshair: {
          line: {
            stroke: "#64748B"
          }
        }
      }}
    />
  );
};

export default ZoomableWaterLevelChart;
