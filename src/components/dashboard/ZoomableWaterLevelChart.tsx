import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";

interface DataPoint {
  time: string;
  [key: string]: string | number | undefined;
}

interface ZoomableWaterLevelChartProps {
  hourlyData: DataPoint[];
  tenMinuteData: DataPoint[];
  title: string;
  description?: string;
  scrollable?: boolean;
  sensors: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

const ZoomableWaterLevelChart = ({ 
  hourlyData, 
  tenMinuteData, 
  title, 
  description, 
  sensors,
  scrollable = false
}: ZoomableWaterLevelChartProps) => {
  const [zoomed, setZoomed] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setZoomed(true);
    setStartIndex(0); // Reset scroll position when zooming in
  };

  const handleZoomOut = () => {
    setZoomed(false);
    setStartIndex(0); // Reset scroll position when zooming out
  };

  // Data to display based on zoom state
  const currentData = zoomed ? tenMinuteData : hourlyData;

  // For scrollable view - determine visible data window
  // Show more data points when zoomed out (hourly) vs zoomed in (10 min)
  const visibleDataCount = zoomed ? 8 : 12; 
  
  const visibleData = scrollable 
    ? currentData.slice(startIndex, startIndex + visibleDataCount)
    : currentData;

  const canScrollLeft = startIndex > 0;
  const canScrollRight = startIndex + visibleDataCount < currentData.length;

  const handleScrollLeft = () => {
    if (canScrollLeft) {
      setStartIndex(Math.max(0, startIndex - Math.floor(visibleDataCount / 2)));
    }
  };

  const handleScrollRight = () => {
    if (canScrollRight) {
      setStartIndex(Math.min(currentData.length - visibleDataCount, startIndex + Math.floor(visibleDataCount / 2)));
    }
  };

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleZoomIn} 
            disabled={zoomed}
            title="Zoom ke data 10 menit"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleZoomOut}
            disabled={!zoomed}
            title="Zoom ke data jam"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          {scrollable && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={handleScrollLeft}
                disabled={!canScrollLeft}
                title="Geser ke kiri"
                className="hidden md:flex"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleScrollRight}
                disabled={!canScrollRight}
                title="Geser ke kanan"
                className="hidden md:flex"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="overflow-x-auto">
          <div className="h-80 min-w-[700px]" ref={chartRef}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={visibleData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                {sensors.map((sensor) => (
                  <Line 
                    key={sensor.id}
                    type="monotone" 
                    dataKey={sensor.id}
                    name={sensor.name} 
                    stroke={sensor.color} 
                    activeDot={{ r: 8 }} 
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center space-x-6">
          {sensors.map((sensor) => (
            <div key={sensor.id} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: sensor.color }}
              ></div>
              <span className="text-sm">{sensor.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ZoomableWaterLevelChart;
