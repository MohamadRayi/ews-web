import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Signal, MapPin } from "lucide-react";
import StatusIndicator from "@/components/dashboard/StatusIndicator";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { Database } from "@/lib/database.types";

type Tables = Database['public']['Tables'];
type SensorCardProps = Tables['current_sensor_status']['Row'];

const SensorCard = ({
  id,
  name,
  location,
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
              <div className="text-sm font-medium">Status Koneksi</div>
              <Signal className="h-4 w-4" />
            </div>
            <div className="text-xs text-muted-foreground">
              Pembaruan terakhir: {reading_time ? (() => {
                const date = new Date(reading_time);
                const hours = date.getUTCHours().toString().padStart(2, '0');
                const minutes = date.getUTCMinutes().toString().padStart(2, '0');
                const seconds = date.getUTCSeconds().toString().padStart(2, '0');
                return `${format(date, "dd MMMM yyyy", { locale: idLocale })} ${hours}:${minutes}:${seconds} WIB`;
              })() : '-'}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default SensorCard;
