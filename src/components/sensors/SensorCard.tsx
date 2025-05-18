import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Battery, Signal, MapPin } from "lucide-react";
import StatusIndicator from "@/components/dashboard/StatusIndicator";
import { formatLocalDateTime } from "@/lib/utils";
import type { Database } from "@/lib/database.types";

type SensorStatus = Database['public']['Tables']['current_sensor_status']['Row'];

interface SensorCardProps extends SensorStatus {}

const SensorCard = ({
  id,
  name,
  location,
  battery_level,
  water_level,
  status,
  reading_time,
}: SensorCardProps) => {
  return (
    <Link to={`/sensor/${id}`}>
      <Card className="hover:bg-gray-50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <h3 className="font-semibold leading-none">{name}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {location}
            </p>
          </div>
          {status && <StatusIndicator status={status} />}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Ketinggian Air</div>
              <div>{water_level ? `${water_level} cm` : '-'}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Baterai</div>
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4" />
                {battery_level ? `${battery_level}%` : '-'}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Status Koneksi</div>
              <Signal className="h-4 w-4" />
            </div>
            <div className="text-xs text-muted-foreground">
              Pembaruan terakhir: {reading_time ? formatLocalDateTime(reading_time) : '-'}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default SensorCard;
