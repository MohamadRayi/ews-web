
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";

interface DataPoint {
  time: string;
  [key: string]: string | number | undefined;
}

interface ZoomableWaterLevelChartProps {
  hourlyData: DataPoint[];
  minutelyData: DataPoint[];
  title: string;
  description?: string;
  sensors: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

const ZoomableWaterLevelChart = ({ 
  hourlyData, 
  minutelyData, 
  title, 
  description, 
  sensors 
}: ZoomableWaterLevelChartProps) => {
  const [zoomed, setZoomed] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setZoomed(true);
  };

  const handleZoomOut = () => {
    setZoomed(false);
  };

  const currentData = zoomed ? minutelyData : hourlyData;

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
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleZoomOut}
            disabled={!zoomed}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-80 w-full" ref={chartRef}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={currentData}
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
