import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import StatusIndicator from "../dashboard/StatusIndicator";
import { Database } from '@/lib/database.types';

type SensorStatus = Database['public']['Views']['current_sensor_status']['Row'];
interface SensorCardProps extends SensorStatus {}

const SensorCard = ({
  id,
  name,
  location,
  status,
  water_level,}: SensorCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{name}</CardTitle>
          <StatusIndicator status={status || 'normal'} />
        </div>
        <CardDescription>{location}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <span className="text-sm text-muted-foreground">Ketinggian Air:</span>          <div className="text-2xl font-bold text-ews-blue">
            {water_level ? `${water_level} cm` : 'N/A'}
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
