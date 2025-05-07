
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import StatusIndicator from "../dashboard/StatusIndicator";

interface SensorCardProps {
  id: string;
  name: string;
  location: string;
  status: "normal" | "warning" | "danger" | "offline";
  waterLevel: number;
  batteryLevel: number;
}

const SensorCard = ({
  id,
  name,
  location,
  status,
  waterLevel,
  batteryLevel,
}: SensorCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{name}</CardTitle>
          <StatusIndicator status={status} />
        </div>
        <CardDescription>{location}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <span className="text-sm text-muted-foreground">Ketinggian Air:</span>
          <div className="text-2xl font-bold text-ews-blue">{waterLevel} cm</div>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Baterai:</span>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-2">
              <div 
                className={`h-2.5 rounded-full ${
                  batteryLevel > 50 ? 'bg-ews-green' : 
                  batteryLevel > 20 ? 'bg-ews-yellow' : 'bg-ews-red'
                }`}
                style={{ width: `${batteryLevel}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">{batteryLevel}%</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link to={`/sensor/${id}`} className="w-full">
          <Button variant="outline" className="w-full">
            <span>Detail</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default SensorCard;
