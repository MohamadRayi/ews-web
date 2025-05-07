import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface WaterLevelChartProps {
  data: {
    time: string;
    sensor1?: number;
    sensor2?: number;
  }[];
  title: string;
  description?: string;
  multipleSensors?: boolean;
}

const WaterLevelChart = ({ data, title, description, multipleSensors = true }: WaterLevelChartProps) => {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-2">
        <div className="overflow-x-auto">
          <div className="h-80 min-w-[700px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
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
                <Area 
                  type="monotone" 
                  dataKey="sensor1" 
                  name="Sensor 1" 
                  stroke="#0EA5E9" 
                  fill="#0EA5E9" 
                  fillOpacity={0.2} 
                />
                {multipleSensors && (
                  <Area 
                    type="monotone" 
                    dataKey="sensor2" 
                    name="Sensor 2" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.2} 
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaterLevelChart;
